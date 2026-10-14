-- =============================================================================
-- Migration 002: Supabase Security Advisor Hardening
--
-- NOTE ABOUT "public.spatial_ref_sys":
-- The table "spatial_ref_sys" is a standard PostGIS internal catalog table containing
-- public EPSG coordinate reference numbers (like WGS84 / GPS: 4326).
-- It is owned by "supabase_admin", so user roles cannot alter it (42501 error).
-- Supabase officially documents this as a known FALSE POSITIVE that contains
-- zero user data and poses no security risk.
--
-- This script ensures all your actual application tables (users, drivers,
-- bookings, transactions, etc.) have RLS enabled, and secures function search paths.
-- =============================================================================

-- 1. Ensure RLS is enabled on all application tables in public schema (skipping extension-managed spatial_ref_sys)
DO $$
DECLARE
    tbl record;
BEGIN
    FOR tbl IN
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename != 'spatial_ref_sys'
          AND rowsecurity = false
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', tbl.schemaname, tbl.tablename);
    END LOOP;
END $$;

-- 2. Fix mutable function search paths to prevent search_path hijacking
ALTER FUNCTION update_updated_at_column() SET search_path = public;
ALTER FUNCTION generate_booking_number() SET search_path = public;
