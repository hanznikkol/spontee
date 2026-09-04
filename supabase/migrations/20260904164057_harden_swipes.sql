-- =========================================
-- SWIPES V1 SECURITY HARDENING
-- =========================================

-- -----------------------------------------
-- 1. DROP INSECURE EXISTING POLICIES
-- -----------------------------------------

DROP POLICY IF EXISTS "Anyone can read swipes"
ON public.swipes;

DROP POLICY IF EXISTS "Anyone can insert swipes"
ON public.swipes;


-- -----------------------------------------
-- 2. REMOVE BROAD CLIENT PRIVILEGES
-- -----------------------------------------

REVOKE ALL ON TABLE public.swipes
FROM anon, authenticated;


-- -----------------------------------------
-- 3. MINIMUM REQUIRED CLIENT PRIVILEGE
-- -----------------------------------------

-- Result calculation and voting resume currently read swipes
-- from the authenticated browser, so SELECT remains available
-- but is restricted by RLS below.
GRANT SELECT
ON public.swipes
TO authenticated;


-- -----------------------------------------
-- 4. SELECT — ROOM MEMBERS ONLY
-- -----------------------------------------

CREATE POLICY "Room members can read swipes"
ON public.swipes
FOR SELECT
TO authenticated
USING (
    public.is_room_member(room_id)
);


-- -----------------------------------------
-- 5. INSERT / UPDATE / DELETE
-- -----------------------------------------

-- No client INSERT policy.
-- Votes are inserted only through submit_vote() SECURITY DEFINER.

-- No UPDATE policy.
-- Votes are immutable.

-- No DELETE policy.
-- Votes are not directly deleted by clients.


-- -----------------------------------------
-- 6. DATABASE-LEVEL VOTE UNIQUENESS
-- -----------------------------------------

ALTER TABLE public.swipes
ADD CONSTRAINT swipes_participant_option_unique
UNIQUE (participant_id, option_id);


-- -----------------------------------------
-- 7. CLEAN UP VOTES WHEN A PARTICIPANT
--    IS KICKED / REMOVED
-- -----------------------------------------

ALTER TABLE public.swipes
DROP CONSTRAINT IF EXISTS swipes_participant_id_fkey;

ALTER TABLE public.swipes
ADD CONSTRAINT swipes_participant_id_fkey
FOREIGN KEY (participant_id)
REFERENCES public.participants(participant_id)
ON DELETE CASCADE;