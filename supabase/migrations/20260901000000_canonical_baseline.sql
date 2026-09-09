-- ============================================================================
-- SPONTEE CANONICAL BASELINE MIGRATION
-- Timestamp: 20260901000000
-- Target: Clean baseline representing 100% of final intended database schema
--
-- SUMMARY OF OBJECTS:
-- - 7 Core Tables: categories, rooms, options, participants, room_categories,
--                  room_preferences, swipes
-- - Realtime Publication: options, participants, rooms, swipes
-- - Replica Identity: participants REPLICA IDENTITY FULL
-- - Unique Constraints & Foreign Keys with ON DELETE CASCADE
-- - 8 Functions / RPCs: is_room_member, is_room_host,
--                       create_room_with_host, join_room, leave_room,
--                       kick_participant, start_voting, submit_vote
-- - Minimum Role Privileges: anon read-only on categories; authenticated operational
-- - Exactly 15 RLS Policies across all 7 tables
-- ============================================================================

SET check_function_bodies = off;

-- ----------------------------------------------------------------------------
-- 1. TABLES & BASE CONSTRAINTS
-- ----------------------------------------------------------------------------

-- categories
CREATE TABLE public.categories (
    category_id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    label text NOT NULL,
    icon text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT categories_pkey PRIMARY KEY (category_id),
    CONSTRAINT categories_name_key UNIQUE (name)
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- rooms
CREATE TABLE public.rooms (
    room_id uuid NOT NULL DEFAULT gen_random_uuid(),
    room_name text NOT NULL,
    status text NOT NULL DEFAULT 'lobby'::text,
    created_at timestamp without time zone DEFAULT now(),
    ends_at timestamp with time zone,
    room_code text NOT NULL,
    max_participants integer NOT NULL DEFAULT 2,
    result_option_id uuid,
    max_options integer NOT NULL DEFAULT 10,
    CONSTRAINT rooms_pkey PRIMARY KEY (room_id),
    CONSTRAINT rooms_room_code_key UNIQUE (room_code),
    CONSTRAINT rooms_max_participants_check CHECK ((max_participants >= 2)),
    CONSTRAINT rooms_status_check CHECK ((status = ANY (ARRAY['lobby'::text, 'active'::text, 'result'::text, 'closed'::text])))
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- options
CREATE TABLE public.options (
    option_id uuid NOT NULL DEFAULT gen_random_uuid(),
    room_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    google_place_id text,
    address text,
    latitude double precision,
    longitude double precision,
    rating numeric,
    total_reviews integer,
    created_at timestamp with time zone DEFAULT now(),
    price_level integer DEFAULT 1,
    image_urls text[],
    distance_meters integer,
    CONSTRAINT options_pkey PRIMARY KEY (option_id),
    CONSTRAINT options_price_level_check CHECK (((price_level >= 1) AND (price_level <= 4))),
    CONSTRAINT options_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE
);

ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;

-- Add deferred foreign key from rooms to options
ALTER TABLE public.rooms
    ADD CONSTRAINT rooms_result_option_id_fkey FOREIGN KEY (result_option_id) REFERENCES public.options(option_id);

-- participants
CREATE TABLE public.participants (
    participant_id uuid NOT NULL DEFAULT gen_random_uuid(),
    room_id uuid NOT NULL,
    display_name text NOT NULL,
    is_host boolean DEFAULT false,
    joined_at timestamp with time zone DEFAULT now(),
    user_id uuid NOT NULL,
    status text DEFAULT 'waiting'::text,
    CONSTRAINT participants_pkey PRIMARY KEY (participant_id),
    CONSTRAINT participants_status_check CHECK ((status = ANY (ARRAY['waiting'::text, 'voting'::text, 'finished'::text]))),
    CONSTRAINT participants_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE,
    CONSTRAINT participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT unique_room_user UNIQUE (room_id, user_id)
);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants REPLICA IDENTITY FULL;

CREATE INDEX idx_participants_room_id ON public.participants USING btree (room_id);
CREATE UNIQUE INDEX participants_room_user_unique ON public.participants USING btree (room_id, user_id);

-- room_categories
CREATE TABLE public.room_categories (
    room_id uuid NOT NULL,
    category_id uuid NOT NULL,
    CONSTRAINT room_categories_pkey PRIMARY KEY (room_id, category_id),
    CONSTRAINT room_categories_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE,
    CONSTRAINT room_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE CASCADE
);

ALTER TABLE public.room_categories ENABLE ROW LEVEL SECURITY;

-- room_preferences
CREATE TABLE public.room_preferences (
    preference_id uuid NOT NULL DEFAULT gen_random_uuid(),
    room_id uuid NOT NULL,
    budget text,
    address text,
    latitude double precision,
    longitude double precision,
    radius integer DEFAULT 3000,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT room_preferences_pkey PRIMARY KEY (preference_id),
    CONSTRAINT room_preferences_radius_check CHECK ((radius > 0)),
    CONSTRAINT room_preferences_room_id_key UNIQUE (room_id),
    CONSTRAINT room_preferences_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE
);

ALTER TABLE public.room_preferences ENABLE ROW LEVEL SECURITY;

-- swipes
CREATE TABLE public.swipes (
    swipe_id uuid NOT NULL DEFAULT gen_random_uuid(),
    room_id uuid NOT NULL,
    participant_id uuid NOT NULL,
    option_id uuid NOT NULL,
    vote text NOT NULL,
    swiped_at timestamp with time zone DEFAULT now(),
    CONSTRAINT swipes_pkey PRIMARY KEY (swipe_id),
    CONSTRAINT swipes_vote_check CHECK ((vote = ANY (ARRAY['go'::text, 'pass'::text]))),
    CONSTRAINT swipes_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE,
    CONSTRAINT swipes_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.options(option_id) ON DELETE CASCADE,
    CONSTRAINT swipes_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(participant_id) ON DELETE CASCADE,
    CONSTRAINT swipes_participant_option_unique UNIQUE (participant_id, option_id)
);

ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_swipes_room_id ON public.swipes USING btree (room_id);
CREATE INDEX idx_swipes_participant_id ON public.swipes USING btree (participant_id);
CREATE INDEX idx_swipes_option_id ON public.swipes USING btree (option_id);

-- Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.options;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.swipes;


-- ----------------------------------------------------------------------------
-- 2. FUNCTIONS & RPCs
-- ----------------------------------------------------------------------------

-- is_room_member
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

REVOKE ALL ON FUNCTION public.is_room_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_room_member(uuid) TO authenticated;

-- is_room_host
CREATE OR REPLACE FUNCTION public.is_room_host(p_room_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.participants
        WHERE participants.room_id = p_room_id
          AND participants.user_id = auth.uid()
          AND participants.is_host = true
    );
$$;

REVOKE ALL ON FUNCTION public.is_room_host(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_room_host(uuid) TO authenticated;

-- create_room_with_host
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
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

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

REVOKE ALL ON FUNCTION public.create_room_with_host(text, int, int, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_room_with_host(text, int, int, text, text) TO authenticated;

-- join_room
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
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    v_clean_name := trim(p_display_name);
    IF v_clean_name IS NULL OR length(v_clean_name) = 0 THEN
        RAISE EXCEPTION 'Display name is required';
    END IF;

    v_code := upper(trim(p_room_code));

    SELECT *
    INTO v_room
    FROM public.rooms
    WHERE room_code = v_code
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Room not found';
    END IF;

    IF v_room.status <> 'lobby' THEN
        RAISE EXCEPTION 'Room is no longer accepting participants';
    END IF;

    SELECT *
    INTO v_participant
    FROM public.participants
    WHERE public.participants.room_id = v_room.room_id
      AND public.participants.user_id = auth.uid()
    FOR UPDATE;

    IF FOUND THEN
        UPDATE public.participants
        SET display_name = v_clean_name
        WHERE participant_id = v_participant.participant_id
        RETURNING * INTO v_participant;

        RETURN v_participant;
    END IF;

    IF (
        SELECT COUNT(*)
        FROM public.participants
        WHERE public.participants.room_id = v_room.room_id
    ) >= v_room.max_participants THEN
        RAISE EXCEPTION 'Room is full';
    END IF;

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

REVOKE ALL ON FUNCTION public.join_room(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_room(text, text) TO authenticated;

-- leave_room
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
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

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

    DELETE FROM public.participants
    WHERE participant_id = p_participant_id;

    RETURN json_build_object(
        'success', true,
        'is_host', false,
        'room_closed', false
    );
END;
$$;

REVOKE ALL ON FUNCTION public.leave_room(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.leave_room(uuid) TO authenticated;

-- kick_participant
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
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT *
    INTO v_target
    FROM public.participants
    WHERE participant_id = p_target_participant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Target participant not found';
    END IF;

    IF v_target.is_host = true THEN
        RAISE EXCEPTION 'Cannot kick the room host';
    END IF;

    SELECT *
    INTO v_caller
    FROM public.participants
    WHERE room_id = v_target.room_id
      AND user_id = auth.uid()
      AND is_host = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unauthorized: only the room host can kick participants';
    END IF;

    DELETE FROM public.participants
    WHERE participant_id = p_target_participant_id;

    RETURN json_build_object(
        'success', true,
        'kicked_participant_id', p_target_participant_id
    );
END;
$$;

REVOKE ALL ON FUNCTION public.kick_participant(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.kick_participant(uuid) TO authenticated;

-- start_voting
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
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

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

    UPDATE public.participants
    SET status = 'voting'
    WHERE participant_id = p_participant_id
      AND user_id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.start_voting(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_voting(uuid) TO authenticated;

-- submit_vote
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
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF p_vote NOT IN ('go', 'pass') THEN
        RAISE EXCEPTION 'Invalid vote value';
    END IF;

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

    IF v_participant.room_id <> p_room_id THEN
        RAISE EXCEPTION 'Participant does not belong to specified room';
    END IF;

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

    SELECT *
    INTO v_option
    FROM public.options
    WHERE option_id = p_option_id
      AND room_id = p_room_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Option does not belong to this room';
    END IF;

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

    SELECT COUNT(*)
    INTO v_option_count
    FROM public.options
    WHERE room_id = p_room_id;

    SELECT COUNT(*)
    INTO v_vote_count
    FROM public.swipes
    WHERE room_id = p_room_id
      AND participant_id = p_participant_id;

    v_finished := v_vote_count >= v_option_count;

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

REVOKE ALL ON FUNCTION public.submit_vote(uuid, uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_vote(uuid, uuid, uuid, text) TO authenticated;


-- ----------------------------------------------------------------------------
-- 3. PRIVILEGES & TABLE GRANTS
-- ----------------------------------------------------------------------------

-- Revoke all table-level access from untrusted roles
REVOKE ALL ON TABLE public.categories FROM anon, authenticated;
REVOKE ALL ON TABLE public.options FROM anon, authenticated;
REVOKE ALL ON TABLE public.participants FROM anon, authenticated;
REVOKE ALL ON TABLE public.room_categories FROM anon, authenticated;
REVOKE ALL ON TABLE public.room_preferences FROM anon, authenticated;
REVOKE ALL ON TABLE public.rooms FROM anon, authenticated;
REVOKE ALL ON TABLE public.swipes FROM anon, authenticated;

-- categories (read-only global reference data)
GRANT SELECT ON TABLE public.categories TO anon, authenticated;

-- rooms (member read, restricted host column update)
GRANT SELECT ON TABLE public.rooms TO authenticated;
GRANT UPDATE (status, max_options, result_option_id) ON TABLE public.rooms TO authenticated;

-- participants (member read, self display name update)
GRANT SELECT ON TABLE public.participants TO authenticated;
GRANT UPDATE (display_name) ON TABLE public.participants TO authenticated;

-- options (member read, host insert/delete)
GRANT SELECT, INSERT, DELETE ON TABLE public.options TO authenticated;

-- swipes (member read only)
GRANT SELECT ON TABLE public.swipes TO authenticated;

-- room_preferences (member read, host insert/update)
GRANT SELECT, INSERT, UPDATE ON TABLE public.room_preferences TO authenticated;

-- room_categories (member read, host insert/delete)
GRANT SELECT, INSERT, DELETE ON TABLE public.room_categories TO authenticated;


-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES — EXACTLY 15 POLICIES
-- ----------------------------------------------------------------------------

-- categories (1 policy)
CREATE POLICY "Enable read access for all users"
ON public.categories
FOR SELECT
TO PUBLIC
USING (true);

-- rooms (2 policies)
CREATE POLICY "Room members can read room"
ON public.rooms
FOR SELECT
TO authenticated
USING (
    public.is_room_member(room_id)
);

CREATE POLICY "Host can update room"
ON public.rooms
FOR UPDATE
TO authenticated
USING (
    public.is_room_member(room_id)
    AND EXISTS (
        SELECT 1
        FROM public.participants
        WHERE participants.room_id = rooms.room_id
          AND participants.user_id = auth.uid()
          AND participants.is_host = true
    )
)
WITH CHECK (
    public.is_room_member(room_id)
    AND EXISTS (
        SELECT 1
        FROM public.participants
        WHERE participants.room_id = rooms.room_id
          AND participants.user_id = auth.uid()
          AND participants.is_host = true
    )
);

-- participants (2 policies)
CREATE POLICY "Room members can read participants"
ON public.participants
FOR SELECT
TO authenticated
USING (
    public.is_room_member(room_id)
);

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

-- options (3 policies)
CREATE POLICY "Room members can read options"
ON public.options
FOR SELECT
TO authenticated
USING (
    public.is_room_member(room_id)
);

CREATE POLICY "Host can insert options"
ON public.options
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.participants
        WHERE participants.room_id = options.room_id
          AND participants.user_id = auth.uid()
          AND participants.is_host = true
    )
);

CREATE POLICY "Host can delete options"
ON public.options
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.participants
        WHERE participants.room_id = options.room_id
          AND participants.user_id = auth.uid()
          AND participants.is_host = true
    )
);

-- swipes (1 policy)
CREATE POLICY "Room members can read swipes"
ON public.swipes
FOR SELECT
TO authenticated
USING (
    public.is_room_member(room_id)
);

-- room_preferences (3 policies)
CREATE POLICY "Room members can read room preferences"
ON public.room_preferences
FOR SELECT
TO authenticated
USING (
    public.is_room_member(room_id)
);

CREATE POLICY "Host can insert room preferences"
ON public.room_preferences
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.participants
        WHERE participants.room_id = room_preferences.room_id
          AND participants.user_id = auth.uid()
          AND participants.is_host = true
    )
);

CREATE POLICY "Host can update room preferences"
ON public.room_preferences
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.participants
        WHERE participants.room_id = room_preferences.room_id
          AND participants.user_id = auth.uid()
          AND participants.is_host = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.participants
        WHERE participants.room_id = room_preferences.room_id
          AND participants.user_id = auth.uid()
          AND participants.is_host = true
    )
);

-- room_categories (3 policies)
CREATE POLICY "Room members can read room categories"
ON public.room_categories
FOR SELECT
TO authenticated
USING (
    public.is_room_member(room_id)
);

CREATE POLICY "Host can insert room categories"
ON public.room_categories
FOR INSERT
TO authenticated
WITH CHECK (
    public.is_room_host(room_id)
);

CREATE POLICY "Host can delete room categories"
ON public.room_categories
FOR DELETE
TO authenticated
USING (
    public.is_room_host(room_id)
);
