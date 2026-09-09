-- =========================================
-- OPTIONS V1 SECURITY HARDENING
-- =========================================

-- -----------------------------------------
-- 1. DROP INSECURE EXISTING POLICIES
-- -----------------------------------------

DROP POLICY IF EXISTS "Enable read access for all users"
ON public.options;

DROP POLICY IF EXISTS "Enable insert for authenticated users only"
ON public.options;

DROP POLICY IF EXISTS "Enable delete for authenticated users"
ON public.options;


-- -----------------------------------------
-- 2. REMOVE BROAD CLIENT PRIVILEGES
-- -----------------------------------------

REVOKE ALL ON TABLE public.options
FROM anon, authenticated;


-- -----------------------------------------
-- 3. MINIMUM REQUIRED PRIVILEGES
-- -----------------------------------------

-- Room members need to read options
GRANT SELECT
ON public.options
TO authenticated;

-- Server Actions currently run as authenticated,
-- so authorized host flows need INSERT.
GRANT INSERT
ON public.options
TO authenticated;

-- Change Preferences needs to delete old options.
GRANT DELETE
ON public.options
TO authenticated;


-- -----------------------------------------
-- 4. SELECT — ROOM MEMBERS ONLY
-- -----------------------------------------

CREATE POLICY "Room members can read options"
ON public.options
FOR SELECT
TO authenticated
USING (
    public.is_room_member(room_id)
);


-- -----------------------------------------
-- 5. INSERT — HOST OF THE ROOM ONLY
-- -----------------------------------------

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


-- -----------------------------------------
-- 6. UPDATE — NOT ALLOWED
-- -----------------------------------------

-- No UPDATE privilege is granted.
-- No UPDATE policy is created.


-- -----------------------------------------
-- 7. DELETE — HOST OF THE ROOM ONLY
-- -----------------------------------------

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