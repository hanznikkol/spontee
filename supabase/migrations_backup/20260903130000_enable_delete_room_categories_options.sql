-- ============================================================
-- ENABLE DELETE POLICIES FOR ROOM_CATEGORIES AND OPTIONS
-- ============================================================

CREATE POLICY "Enable delete for authenticated users"
ON public.room_categories
FOR DELETE
TO anon, authenticated
USING (true);

CREATE POLICY "Enable delete for authenticated users"
ON public.options
FOR DELETE
TO anon, authenticated
USING (true);
