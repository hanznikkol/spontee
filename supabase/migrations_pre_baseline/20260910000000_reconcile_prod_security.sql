-- ============================================================================
-- RECONCILIATION MIGRATION: PRODUCTION SECURITY HARDENING & DRIFT RESOLUTION
-- Target: Spontee Supabase Production Database
-- Timestamp: 20260910000000
--
-- PURPOSE:
-- Safely brings PROD schema into 100% alignment with the intended final
-- security state (exactly 15 active policies) without data loss or replay issues.
--
-- INTENDED FINAL POLICY COUNT (15 total):
-- - categories:       1  (Enable read access for all users)
-- - options:          3  (Room members can read options, Host can insert options, Host can delete options)
-- - participants:      2  (Room members can read participants, Participants can update their display name)
-- - room_categories:  3  (Room members can read room categories, Host can insert room categories, Host can delete room categories)
-- - room_preferences: 3  (Room members can read room preferences, Host can insert room preferences, Host can update room preferences)
-- - rooms:            2  (Room members can read room, Host can update room)
-- - swipes:           1  (Room members can read swipes)
--
-- EXACT DEFINITION VERIFICATION:
-- - is_room_host(uuid): Exact definition from 20260904165105_harden_room_categories.sql
-- - Host can update room: Exact definition from 20260903141436_harden_rooms_update.sql
-- - Host can insert room categories: Exact definition from 20260904165105_harden_room_categories.sql
-- - Host can delete room categories: Exact definition from 20260904165105_harden_room_categories.sql
-- - Room members can read room preferences: Exact definition from 20260904163616_harden_room_preferences.sql
--
-- NOTE:
-- public.participants and public.options are already fully hardened in PROD
-- and are preserved as-is.
-- ============================================================================


-- ============================================================================
-- 1. HELPER FUNCTION: is_room_host(uuid)
-- ============================================================================

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


-- ============================================================================
-- 2. ROOMS SECURITY HARDENING
-- ============================================================================

-- Drop obsolete / permissive policies
DROP POLICY IF EXISTS "Anyone can insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Anyone can read rooms" ON public.rooms;
DROP POLICY IF EXISTS "Update by the Room Host" ON public.rooms;
DROP POLICY IF EXISTS "Room members can read room" ON public.rooms;
DROP POLICY IF EXISTS "Host can update room" ON public.rooms;

-- Revoke broad client privileges
REVOKE ALL ON TABLE public.rooms FROM anon, authenticated;

-- Grant minimal required privileges
GRANT SELECT ON TABLE public.rooms TO authenticated;
GRANT UPDATE (status, max_options, result_option_id) ON TABLE public.rooms TO authenticated;

-- Room members can read their own room
CREATE POLICY "Room members can read room"
ON public.rooms
FOR SELECT
TO authenticated
USING (
    public.is_room_member(room_id)
);

-- Host can update mutable room fields
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


-- ============================================================================
-- 3. SWIPES SECURITY HARDENING & CONSTRAINTS
-- ============================================================================

-- Drop obsolete / permissive policies
DROP POLICY IF EXISTS "Anyone can read swipes" ON public.swipes;
DROP POLICY IF EXISTS "Anyone can insert swipes" ON public.swipes;
DROP POLICY IF EXISTS "Room members can read swipes" ON public.swipes;

-- Revoke broad client privileges
REVOKE ALL ON TABLE public.swipes FROM anon, authenticated;

-- Only authenticated room members can read swipes (for vote counting / result calculation)
GRANT SELECT ON TABLE public.swipes TO authenticated;

-- Room members can read swipes in their room
CREATE POLICY "Room members can read swipes"
ON public.swipes
FOR SELECT
TO authenticated
USING (
    public.is_room_member(room_id)
);

-- Pre-constraint Safety Check 1: Abort if duplicate swipes exist
DO $$
DECLARE
    v_dupe_count integer;
BEGIN
    SELECT COUNT(*)
    INTO v_dupe_count
    FROM (
        SELECT participant_id, option_id
        FROM public.swipes
        GROUP BY participant_id, option_id
        HAVING COUNT(*) > 1
    ) sub;

    IF v_dupe_count > 0 THEN
        RAISE EXCEPTION 'Safety check failed: % duplicate swipe pair(s) detected. Migration aborted to protect production data.', v_dupe_count;
    END IF;

    -- Add unique constraint only if it does not exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'swipes_participant_option_unique'
          AND conrelid = 'public.swipes'::regclass
    ) THEN
        ALTER TABLE public.swipes
        ADD CONSTRAINT swipes_participant_option_unique
        UNIQUE (participant_id, option_id);
    END IF;
END $$;

-- Pre-constraint Safety Check 2: Verify zero orphaned swipes before replacing foreign key
DO $$
DECLARE
    v_orphan_count integer;
    v_current_deltype "char";
BEGIN
    -- Check for orphan participant_id references
    SELECT COUNT(*)
    INTO v_orphan_count
    FROM public.swipes s
    LEFT JOIN public.participants p
      ON p.participant_id = s.participant_id
    WHERE p.participant_id IS NULL;

    IF v_orphan_count > 0 THEN
        RAISE EXCEPTION 'Safety check failed: % orphaned swipe record(s) detected with non-existent participant_id. Migration aborted to protect production data.', v_orphan_count;
    END IF;

    -- Check existing FK delete action (c = CASCADE)
    SELECT confdeltype
    INTO v_current_deltype
    FROM pg_constraint
    WHERE conname = 'swipes_participant_id_fkey'
      AND conrelid = 'public.swipes'::regclass;

    -- Only replace if not already ON DELETE CASCADE
    IF v_current_deltype IS DISTINCT FROM 'c' THEN
        ALTER TABLE public.swipes
        DROP CONSTRAINT IF EXISTS swipes_participant_id_fkey;

        ALTER TABLE public.swipes
        ADD CONSTRAINT swipes_participant_id_fkey
        FOREIGN KEY (participant_id)
        REFERENCES public.participants(participant_id)
        ON DELETE CASCADE;
    END IF;
END $$;


-- ============================================================================
-- 4. ROOM_PREFERENCES HARDENING
-- ============================================================================

-- Drop obsolete permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.room_preferences;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.room_preferences;
DROP POLICY IF EXISTS "Room members can read room preferences" ON public.room_preferences;

-- Revoke broad client privileges
REVOKE ALL ON TABLE public.room_preferences FROM anon, authenticated;

-- Grant minimal required privileges to authenticated
GRANT SELECT, INSERT, UPDATE ON TABLE public.room_preferences TO authenticated;

-- Room members can read preferences for their room
CREATE POLICY "Room members can read room preferences"
ON public.room_preferences
FOR SELECT
TO authenticated
USING (
    public.is_room_member(room_id)
);

-- Note: "Host can insert room preferences" and "Host can update room preferences"
-- already exist in PROD from 20260904170427_fix_room_preferences_write.sql and are preserved.


-- ============================================================================
-- 5. ROOM_CATEGORIES HARDENING
-- ============================================================================

-- Drop obsolete permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.room_categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.room_categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.room_categories;
DROP POLICY IF EXISTS "Room members can read room categories" ON public.room_categories;
DROP POLICY IF EXISTS "Host can insert room categories" ON public.room_categories;
DROP POLICY IF EXISTS "Host can delete room categories" ON public.room_categories;

-- Revoke broad client privileges
REVOKE ALL ON TABLE public.room_categories FROM anon, authenticated;

-- Grant minimal required privileges
GRANT SELECT, INSERT, DELETE ON TABLE public.room_categories TO authenticated;

-- Room members can read categories for their room
CREATE POLICY "Room members can read room categories"
ON public.room_categories
FOR SELECT
TO authenticated
USING (
    public.is_room_member(room_id)
);

-- Only room host can insert categories
CREATE POLICY "Host can insert room categories"
ON public.room_categories
FOR INSERT
TO authenticated
WITH CHECK (
    public.is_room_host(room_id)
);

-- Only room host can delete categories (e.g. during re-roll or preference update)
CREATE POLICY "Host can delete room categories"
ON public.room_categories
FOR DELETE
TO authenticated
USING (
    public.is_room_host(room_id)
);


-- ============================================================================
-- 6. CATEGORIES READ-ONLY HARDENING
-- ============================================================================

-- Drop obsolete INSERT policy
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.categories;

-- Revoke all modification privileges from client roles
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.categories FROM anon, authenticated;

-- Note: "Enable read access for all users" (SELECT to PUBLIC) and SELECT grants
-- are preserved as categories is a static global lookup table.
