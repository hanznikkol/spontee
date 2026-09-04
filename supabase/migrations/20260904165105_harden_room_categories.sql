-- =========================================
-- ROOM CATEGORIES V1 SECURITY HARDENING
-- =========================================

-- -----------------------------------------
-- 1. HOST CHECK HELPER
-- -----------------------------------------

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

REVOKE ALL ON FUNCTION public.is_room_host(uuid)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_room_host(uuid)
TO authenticated;


-- -----------------------------------------
-- 2. DROP INSECURE EXISTING POLICIES
-- -----------------------------------------

DROP POLICY IF EXISTS "Enable read access for all users"
ON public.room_categories;

DROP POLICY IF EXISTS "Enable insert for authenticated users only"
ON public.room_categories;

DROP POLICY IF EXISTS "Enable delete for authenticated users"
ON public.room_categories;


-- -----------------------------------------
-- 3. REMOVE BROAD CLIENT PRIVILEGES
-- -----------------------------------------

REVOKE ALL ON TABLE public.room_categories
FROM anon, authenticated;


-- -----------------------------------------
-- 4. MINIMUM REQUIRED PRIVILEGES
-- -----------------------------------------

GRANT SELECT, INSERT, DELETE
ON public.room_categories
TO authenticated;


-- -----------------------------------------
-- 5. SELECT — ROOM MEMBERS ONLY
-- -----------------------------------------

CREATE POLICY "Room members can read room categories"
ON public.room_categories
FOR SELECT
TO authenticated
USING (
    public.is_room_member(room_id)
);


-- -----------------------------------------
-- 6. INSERT — HOST ONLY
-- -----------------------------------------

CREATE POLICY "Host can insert room categories"
ON public.room_categories
FOR INSERT
TO authenticated
WITH CHECK (
    public.is_room_host(room_id)
);


-- -----------------------------------------
-- 7. DELETE — HOST ONLY
-- -----------------------------------------

CREATE POLICY "Host can delete room categories"
ON public.room_categories
FOR DELETE
TO authenticated
USING (
    public.is_room_host(room_id)
);


-- -----------------------------------------
-- 8. UPDATE — NOT ALLOWED
-- -----------------------------------------

-- No UPDATE privilege.
-- No UPDATE policy.