-- =============================================================================
-- Migration 002: Fix Supabase Security Advisor Critical Error & Warnings
-- Resolves: "RLS Disabled in Public" on public.spatial_ref_sys
-- Resolves: Mutable function search paths
--
-- How to apply:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/esdgxkddzbdkgjjymjcf
-- 2. Go to "SQL Editor" (3rd icon on the left sidebar: >_)
-- 3. Click "New query", paste this entire script, and click "Run" (or Ctrl+Enter)
-- 4. Go back to "Security Advisor" and click "Rerun linter" -> 0 Errors!
-- =============================================================================

-- 1. Fix Critical Error: Enable RLS on spatial_ref_sys (PostGIS system table in public schema)
ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Allow read-only SELECT access so spatial queries (e.g. ST_Transform, geometry operations) work
DROP POLICY IF EXISTS "Allow read-only access to spatial_ref_sys" ON public.spatial_ref_sys;
CREATE POLICY "Allow read-only access to spatial_ref_sys"
ON public.spatial_ref_sys
FOR SELECT
TO public
USING (true);

-- 2. Ensure RLS is enabled on all tables in public schema
DO $$
DECLARE
    tbl record;
BEGIN
    FOR tbl IN
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND rowsecurity = false
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', tbl.schemaname, tbl.tablename);
    END LOOP;
END $$;

-- 3. Fix security warning for functions with mutable search_path
ALTER FUNCTION IF EXISTS update_updated_at_column() SET search_path = public;
ALTER FUNCTION IF EXISTS generate_booking_number() SET search_path = public;
