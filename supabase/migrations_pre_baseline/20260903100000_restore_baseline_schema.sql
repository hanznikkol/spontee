-- ============================================================
-- RESTORE BASELINE SCHEMA
-- Target: 20260901151753_remote_schema.sql
--
-- IMPORTANT:
-- This restores the database schema/policies/functions to the
-- baseline state WITHOUT deleting application data.
-- ============================================================


-- ============================================================
-- 1. DROP POLICIES ADDED BY SECURITY HARDENING
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can create rooms"
ON public.rooms;

DROP POLICY IF EXISTS "Categories are readable by everyone"
ON public.categories;

DROP POLICY IF EXISTS "Participants can update their display name"
ON public.participants;

DROP POLICY IF EXISTS "Room host can insert options"
ON public.options;

DROP POLICY IF EXISTS "Room host can insert room categories"
ON public.room_categories;

DROP POLICY IF EXISTS "Room host can insert room preferences"
ON public.room_preferences;

DROP POLICY IF EXISTS "Room members can read options"
ON public.options;

DROP POLICY IF EXISTS "Room members can read participants"
ON public.participants;

DROP POLICY IF EXISTS "Room members can read room"
ON public.rooms;

DROP POLICY IF EXISTS "Room members can read room categories"
ON public.room_categories;

DROP POLICY IF EXISTS "Room members can read room preferences"
ON public.room_preferences;

DROP POLICY IF EXISTS "Room members can read swipes"
ON public.swipes;


-- ============================================================
-- 2. DROP EXTRA RPC FUNCTIONS
-- ============================================================

DROP FUNCTION IF EXISTS public.create_host_participant(uuid, text);

DROP FUNCTION IF EXISTS public.join_room(text, text);

DROP FUNCTION IF EXISTS public.open_room(uuid);

DROP FUNCTION IF EXISTS public.set_room_result(uuid, uuid);

DROP FUNCTION IF EXISTS public.start_voting(uuid);

DROP FUNCTION IF EXISTS public.transition_to_result(uuid);

DROP FUNCTION IF EXISTS public.is_room_member(uuid);


-- ============================================================
-- 3. RESTORE ORIGINAL submit_vote()
-- ============================================================

CREATE OR REPLACE FUNCTION public.submit_vote(
    p_room_id uuid,
    p_option_id uuid,
    p_participant_id uuid,
    p_vote text
)
RETURNS json
LANGUAGE plpgsql
AS $function$
DECLARE
    v_option_count integer;
    v_vote_count integer;
    v_finished boolean;
BEGIN

    -- Save the vote
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

    -- Count how many options exist in this room
    SELECT COUNT(*)
    INTO v_option_count
    FROM public.options
    WHERE room_id = p_room_id;

    -- Count how many options this participant has voted on
    SELECT COUNT(*)
    INTO v_vote_count
    FROM public.swipes
    WHERE room_id = p_room_id
      AND participant_id = p_participant_id;

    -- Determine if participant finished
    v_finished := v_vote_count >= v_option_count;

    -- Mark participant as finished
    IF v_finished THEN
        UPDATE public.participants
        SET status = 'finished'
        WHERE participant_id = p_participant_id
          AND room_id = p_room_id;
    END IF;

    RETURN json_build_object(
        'finished', v_finished,
        'vote_count', v_vote_count,
        'option_count', v_option_count
    );

END;
$function$;


-- ============================================================
-- 4. RESTORE BASELINE POLICIES
-- ============================================================

CREATE POLICY "Enable insert for authenticated users only"
ON public.categories
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Enable read access for all users"
ON public.categories
FOR SELECT
TO PUBLIC
USING (true);


CREATE POLICY "Enable insert for authenticated users only"
ON public.options
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Enable read access for all users"
ON public.options
FOR SELECT
TO PUBLIC
USING (true);


CREATE POLICY "Enable insert for public users"
ON public.participants
FOR INSERT
TO PUBLIC
WITH CHECK (true);

CREATE POLICY "Enable read access for all users"
ON public.participants
FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "Participant can update own record"
ON public.participants
FOR UPDATE
TO anon, authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


CREATE POLICY "Enable insert for authenticated users only"
ON public.room_categories
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Enable read access for all users"
ON public.room_categories
FOR SELECT
TO PUBLIC
USING (true);


CREATE POLICY "Enable insert for authenticated users only"
ON public.room_preferences
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Enable read access for all users"
ON public.room_preferences
FOR SELECT
TO PUBLIC
USING (true);


CREATE POLICY "Anyone can insert rooms"
ON public.rooms
FOR INSERT
TO PUBLIC
WITH CHECK (true);

CREATE POLICY "Anyone can read rooms"
ON public.rooms
FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "Update by the Room Host"
ON public.rooms
FOR UPDATE
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.participants
        WHERE participants.room_id = rooms.room_id
          AND participants.user_id = auth.uid()
          AND participants.is_host = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.participants
        WHERE participants.room_id = rooms.room_id
          AND participants.user_id = auth.uid()
          AND participants.is_host = true
    )
);


CREATE POLICY "Anyone can insert swipes"
ON public.swipes
FOR INSERT
TO PUBLIC
WITH CHECK (true);

CREATE POLICY "Anyone can read swipes"
ON public.swipes
FOR SELECT
TO PUBLIC
USING (true);


-- ============================================================
-- 5. RESTORE BASELINE TABLE GRANTS
-- ============================================================

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
ON TABLE public.categories
TO anon, authenticated, postgres, service_role;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
ON TABLE public.options
TO anon, authenticated, postgres, service_role;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
ON TABLE public.participants
TO anon, authenticated, postgres, service_role;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
ON TABLE public.room_categories
TO anon, authenticated, postgres, service_role;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
ON TABLE public.room_preferences
TO anon, authenticated, postgres, service_role;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
ON TABLE public.rooms
TO anon, authenticated, postgres, service_role;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
ON TABLE public.swipes
TO anon, authenticated, postgres, service_role;


-- ============================================================
-- 6. RESTORE submit_vote() GRANTS
-- ============================================================

GRANT EXECUTE
ON FUNCTION public.submit_vote(uuid, uuid, uuid, text)
TO PUBLIC, anon, authenticated, postgres, service_role;