-- =========================================================
-- SECURE LEAVE ROOM, KICK PARTICIPANT, AND REPLICA IDENTITY
-- =========================================================

-- 1. Enable FULL replica identity on participants
-- Ensures that Postgres WAL includes room_id on DELETE, allowing
-- Supabase Realtime filters (room_id=eq.${roomId}) to emit DELETE events
ALTER TABLE public.participants REPLICA IDENTITY FULL;


-- =========================================================
-- 2. SECURE LEAVE ROOM RPC
-- =========================================================

CREATE OR REPLACE FUNCTION public.leave_room(
    p_participant_id uuid
)
RETURNS json
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

    -- 3. If Host leaves, close room to prevent abandoned headless lobby
    IF v_participant.is_host = true THEN
        UPDATE public.rooms
        SET status = 'closed'
        WHERE room_id = v_participant.room_id;

        DELETE FROM public.participants
        WHERE participant_id = p_participant_id;

        RETURN json_build_object(
            'success', true,
            'is_host', true,
            'room_closed', true
        );
    END IF;

    -- 4. Guest leaves: simply delete their participant row
    DELETE FROM public.participants
    WHERE participant_id = p_participant_id;

    RETURN json_build_object(
        'success', true,
        'is_host', false,
        'room_closed', false
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.leave_room(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.leave_room(uuid) TO authenticated;


-- =========================================================
-- 3. SECURE KICK PARTICIPANT RPC
-- =========================================================

CREATE OR REPLACE FUNCTION public.kick_participant(
    p_target_participant_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_target public.participants;
    v_caller public.participants;
BEGIN
    -- 1. Require authentication
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Validate target participant exists
    SELECT *
    INTO v_target
    FROM public.participants
    WHERE participant_id = p_target_participant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Target participant not found';
    END IF;

    -- 3. Host cannot be kicked
    IF v_target.is_host = true THEN
        RAISE EXCEPTION 'Cannot kick the room host';
    END IF;

    -- 4. Validate caller is a member of the room AND is the host
    SELECT *
    INTO v_caller
    FROM public.participants
    WHERE room_id = v_target.room_id
      AND user_id = auth.uid()
      AND is_host = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unauthorized: only the room host can kick participants';
    END IF;

    -- 5. Remove target participant
    DELETE FROM public.participants
    WHERE participant_id = p_target_participant_id;

    RETURN json_build_object(
        'success', true,
        'kicked_participant_id', p_target_participant_id
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.kick_participant(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.kick_participant(uuid) TO authenticated;
