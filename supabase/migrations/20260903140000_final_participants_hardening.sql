-- ============================================================================
-- FINAL PARTICIPANTS SECURITY HARDENING (V1)
-- Target: public.participants, is_room_member(), join_room(), start_voting(), submit_vote()
-- ============================================================================

-- 1. REPLICA IDENTITY
-- Ensures WAL records full row for DELETE events so Realtime filters (room_id=eq.${roomId}) emit DELETE payloads
ALTER TABLE public.participants REPLICA IDENTITY FULL;


-- 2. DROP OBSOLETE / PERMISSIVE POLICIES
DROP POLICY IF EXISTS "Enable insert for public users" ON public.participants;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.participants;
DROP POLICY IF EXISTS "Participant can update own record" ON public.participants;
DROP POLICY IF EXISTS "Room members can read participants" ON public.participants;
DROP POLICY IF EXISTS "Participants can update their display name" ON public.participants;


-- 3. RECREATE is_room_member() HELPER
-- SECURITY DEFINER function to check room membership without recursive RLS loops
CREATE OR REPLACE FUNCTION public.is_room_member(p_room_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.participants
        WHERE public.participants.room_id = p_room_id
          AND public.participants.user_id = auth.uid()
    );
$$;

REVOKE EXECUTE ON FUNCTION public.is_room_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_room_member(uuid) TO authenticated;


-- 4. TABLE PRIVILEGES & COLUMN-LEVEL GRANTS
-- Revoke all direct table-level mutations from untrusted clients
REVOKE ALL ON TABLE public.participants FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.participants FROM authenticated;

-- Grant only strictly necessary privileges:
-- - SELECT: Read room participants (constrained by RLS)
-- - UPDATE (display_name): Only display_name can be modified directly by clients (constrained by RLS)
GRANT SELECT ON TABLE public.participants TO authenticated;
GRANT UPDATE (display_name) ON TABLE public.participants TO authenticated;


-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Room members can read participants in their own room
CREATE POLICY "Room members can read participants"
ON public.participants
FOR SELECT
TO authenticated
USING (
    public.is_room_member(room_id)
);

-- Participants can only update their own display_name
CREATE POLICY "Participants can update their display name"
ON public.participants
FOR UPDATE
TO authenticated
USING (
    auth.uid() = user_id
)
WITH CHECK (
    auth.uid() = user_id
);


-- 6. SECURE JOIN ROOM RPC
CREATE OR REPLACE FUNCTION public.join_room(
    p_room_code text,
    p_display_name text
)
RETURNS public.participants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_room public.rooms;
    v_participant public.participants;
    v_code text;
    v_clean_name text;
BEGIN
    -- 1. Require authentication
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Validate display name
    v_clean_name := trim(p_display_name);
    IF v_clean_name IS NULL OR length(v_clean_name) = 0 THEN
        RAISE EXCEPTION 'Display name is required';
    END IF;

    -- 3. Normalize room code
    v_code := upper(trim(p_room_code));

    -- 4. Find and lock the room row
    SELECT *
    INTO v_room
    FROM public.rooms
    WHERE room_code = v_code
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Room not found';
    END IF;

    -- 5. Room must still be in lobby
    IF v_room.status <> 'lobby' THEN
        RAISE EXCEPTION 'Room is no longer accepting participants';
    END IF;

    -- 6. Check existing membership (safe rejoining)
    SELECT *
    INTO v_participant
    FROM public.participants
    WHERE public.participants.room_id = v_room.room_id
      AND public.participants.user_id = auth.uid()
    FOR UPDATE;

    IF FOUND THEN
        -- Update display name on rejoining if provided, but NEVER touch is_host or status
        UPDATE public.participants
        SET display_name = v_clean_name
        WHERE participant_id = v_participant.participant_id
        RETURNING * INTO v_participant;

        RETURN v_participant;
    END IF;

    -- 7. Check room capacity for NEW participants
    IF (
        SELECT COUNT(*)
        FROM public.participants
        WHERE public.participants.room_id = v_room.room_id
    ) >= v_room.max_participants THEN
        RAISE EXCEPTION 'Room is full';
    END IF;

    -- 8. Create guest participant (force is_host = false, status = waiting)
    INSERT INTO public.participants (
        room_id,
        display_name,
        is_host,
        user_id,
        status
    )
    VALUES (
        v_room.room_id,
        v_clean_name,
        false,
        auth.uid(),
        'waiting'
    )
    RETURNING *
    INTO v_participant;

    RETURN v_participant;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.join_room(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_room(text, text) TO authenticated;


-- 7. SECURE CREATE ROOM WITH HOST RPC
CREATE OR REPLACE FUNCTION public.create_room_with_host(
    p_room_name text,
    p_max_participants int,
    p_max_options int,
    p_room_code text,
    p_host_name text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_room public.rooms;
    v_participant public.participants;
    v_code text;
    v_clean_host text;
    v_clean_room text;
BEGIN
    -- 1. Require authentication
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Validate inputs
    v_clean_host := trim(p_host_name);
    IF v_clean_host IS NULL OR length(v_clean_host) = 0 THEN
        RAISE EXCEPTION 'Host name is required';
    END IF;

    v_clean_room := trim(p_room_name);
    IF v_clean_room IS NULL OR length(v_clean_room) = 0 THEN
        RAISE EXCEPTION 'Room name is required';
    END IF;

    IF p_max_participants IS NULL OR p_max_participants < 2 THEN
        RAISE EXCEPTION 'Minimum 2 participants required';
    END IF;

    IF p_max_options IS NULL OR p_max_options < 1 THEN
        RAISE EXCEPTION 'Minimum 1 option required';
    END IF;

    v_code := upper(trim(p_room_code));

    -- 3. Insert Room (status defaults to 'lobby')
    INSERT INTO public.rooms (
        room_name,
        max_participants,
        max_options,
        room_code,
        status
    )
    VALUES (
        v_clean_room,
        p_max_participants,
        p_max_options,
        v_code,
        'lobby'
    )
    RETURNING * INTO v_room;

    -- 4. Insert Host Participant
    INSERT INTO public.participants (
        room_id,
        display_name,
        is_host,
        user_id,
        status
    )
    VALUES (
        v_room.room_id,
        v_clean_host,
        true,
        auth.uid(),
        'waiting'
    )
    RETURNING * INTO v_participant;

    RETURN json_build_object(
        'room', row_to_json(v_room),
        'participant', row_to_json(v_participant)
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_room_with_host(text, int, int, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_room_with_host(text, int, int, text, text) TO authenticated;


-- 8. SECURE START VOTING RPC
CREATE OR REPLACE FUNCTION public.start_voting(
    p_participant_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_participant public.participants;
    v_room public.rooms;
BEGIN
    -- 1. Require authentication
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Validate participant exists and belongs to auth.uid()
    SELECT *
    INTO v_participant
    FROM public.participants
    WHERE participant_id = p_participant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Participant not found';
    END IF;

    IF v_participant.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: participant does not belong to user';
    END IF;

    -- 3. Validate room state
    SELECT *
    INTO v_room
    FROM public.rooms
    WHERE room_id = v_participant.room_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Room not found';
    END IF;

    IF v_room.status NOT IN ('active', 'lobby') THEN
        RAISE EXCEPTION 'Room is not in active or lobby state';
    END IF;

    -- 4. Transition status to voting
    UPDATE public.participants
    SET status = 'voting'
    WHERE participant_id = p_participant_id
      AND user_id = auth.uid();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.start_voting(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_voting(uuid) TO authenticated;


-- 9. SECURE SUBMIT VOTE RPC (Preserves participant lifecycle status = 'finished')
CREATE OR REPLACE FUNCTION public.submit_vote(
    p_room_id uuid,
    p_option_id uuid,
    p_participant_id uuid,
    p_vote text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_participant public.participants;
    v_room public.rooms;
    v_option public.options;
    v_option_count integer;
    v_vote_count integer;
    v_finished boolean;
BEGIN
    -- 1. Require authentication
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Validate vote value
    IF p_vote NOT IN ('go', 'pass') THEN
        RAISE EXCEPTION 'Invalid vote value';
    END IF;

    -- 3. Verify participant exists and belongs to auth.uid()
    SELECT *
    INTO v_participant
    FROM public.participants
    WHERE participant_id = p_participant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Participant not found';
    END IF;

    IF v_participant.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: participant does not belong to user';
    END IF;

    -- 4. Verify participant belongs to p_room_id
    IF v_participant.room_id <> p_room_id THEN
        RAISE EXCEPTION 'Participant does not belong to specified room';
    END IF;

    -- 5. Verify room exists and is in an active/voting state
    SELECT *
    INTO v_room
    FROM public.rooms
    WHERE room_id = p_room_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Room not found';
    END IF;

    IF v_room.status NOT IN ('active', 'lobby') THEN
        RAISE EXCEPTION 'Room is not in voting state';
    END IF;

    -- 6. Verify option belongs to p_room_id
    SELECT *
    INTO v_option
    FROM public.options
    WHERE option_id = p_option_id
      AND room_id = p_room_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Option does not belong to this room';
    END IF;

    -- 7. Insert vote (preventing duplicate votes)
    IF NOT EXISTS (
        SELECT 1
        FROM public.swipes
        WHERE participant_id = p_participant_id
          AND option_id = p_option_id
    ) THEN
        INSERT INTO public.swipes (
            room_id,
            option_id,
            participant_id,
            vote
        )
        VALUES (
            p_room_id,
            p_option_id,
            p_participant_id,
            p_vote
        );
    END IF;

    -- 8. Count how many options exist in this room
    SELECT COUNT(*)
    INTO v_option_count
    FROM public.options
    WHERE room_id = p_room_id;

    -- 9. Count how many options this participant has voted on
    SELECT COUNT(*)
    INTO v_vote_count
    FROM public.swipes
    WHERE room_id = p_room_id
      AND participant_id = p_participant_id;

    -- 10. Determine if participant finished
    v_finished := v_vote_count >= v_option_count;

    -- 11. Mark participant as finished (elevated SECURITY DEFINER execution)
    IF v_finished THEN
        UPDATE public.participants
        SET status = 'finished'
        WHERE participant_id = p_participant_id
          AND user_id = auth.uid()
          AND room_id = p_room_id;
    END IF;

    RETURN json_build_object(
        'finished', v_finished,
        'vote_count', v_vote_count,
        'option_count', v_option_count
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_vote(uuid, uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_vote(uuid, uuid, uuid, text) TO authenticated;
