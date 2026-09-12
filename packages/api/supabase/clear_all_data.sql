-- =============================================================================
-- OmniGo Database Wipe Script
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rowyjdwzpiyjamtrftuo/sql
-- =============================================================================

-- 1. Truncate all tables and reset foreign keys
TRUNCATE TABLE 
  wallet_transactions,
  ledger_entries,
  payouts,
  settlements,
  notifications,
  sos_incidents,
  fraud_incidents,
  driver_documents,
  driver_earnings,
  bookings,
  drivers,
  users
CASCADE;

-- 2. Add missing DELETE policies for users and drivers so future admin deletions work
DROP POLICY IF EXISTS "Enable delete access for all" ON users;
CREATE POLICY "Enable delete access for all" ON users FOR DELETE USING (true);

DROP POLICY IF EXISTS "Enable delete access for all" ON drivers;
CREATE POLICY "Enable delete access for all" ON drivers FOR DELETE USING (true);

-- 3. (Optional) If you also want to remove vehicle types & pricing rules, uncomment below:
-- TRUNCATE TABLE pricing_rules, vehicle_types CASCADE;
