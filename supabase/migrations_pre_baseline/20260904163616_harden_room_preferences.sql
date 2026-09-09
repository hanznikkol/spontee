-- =========================================
-- ROOM PREFERENCES V1 SECURITY HARDENING
-- =========================================

-- Remove globally readable preferences
DROP POLICY IF EXISTS "Enable read access for all users"
ON public.room_preferences;

-- Remove unrestricted client inserts
DROP POLICY IF EXISTS "Enable insert for authenticated users only"
ON public.room_preferences;

-- Remove direct client table privileges
REVOKE ALL ON TABLE public.room_preferences
FROM anon, authenticated;

-- Members may read preferences for their own room
GRANT SELECT
ON public.room_preferences
TO authenticated;

CREATE POLICY "Room members can read room preferences"
ON public.room_preferences
FOR SELECT
TO authenticated
USING (
    public.is_room_member(room_id)
);

-- No INSERT policy is created.
-- No UPDATE policy is created.
-- No DELETE policy is created.
--
-- Room creation and preference updates are performed
-- through the existing server-side flows.