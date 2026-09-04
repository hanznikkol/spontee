-- =========================================
-- CATEGORIES V1 SECURITY HARDENING
-- =========================================

DROP POLICY IF EXISTS "Enable insert for authenticated users only"
ON public.categories;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE
ON public.categories
FROM anon, authenticated;