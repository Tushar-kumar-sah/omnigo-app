-- Migration 001: Add live telemetry columns to drivers table
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- Add heading (degrees 0-360) and speed (km/h) columns for live GPS telemetry
ALTER TABLE drivers
  ADD COLUMN IF NOT EXISTS heading NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS speed   NUMERIC(6, 2) DEFAULT 0;

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'drivers'
  AND column_name IN ('heading', 'speed', 'location');
