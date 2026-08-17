-- Enable PostGIS extension for spatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Function for auto-updating updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Sequence for booking numbers
CREATE SEQUENCE IF NOT EXISTS booking_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_number IS NULL THEN
        NEW.booking_number := 'OMG-' || lpad(nextval('booking_number_seq')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';


-- 1. users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    avatar TEXT,
    is_verified BOOLEAN DEFAULT false,
    membership_tier TEXT DEFAULT 'none' CHECK (membership_tier IN ('none', 'basic', 'silver', 'gold', 'platinum', 'pro', 'elite')),
    wallet_balance NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 2. drivers table
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    avatar TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    total_trips INT DEFAULT 0,
    acceptance_rate NUMERIC(5, 2) DEFAULT 100.00,
    cancellation_rate NUMERIC(5, 2) DEFAULT 0.00,
    online_hours TEXT DEFAULT '0 hrs',
    is_online BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    kyc_status TEXT DEFAULT 'pending_review' CHECK (kyc_status IN ('pending_review', 'verified', 'action_required', 'suspended')),
    vehicle_type TEXT NOT NULL,
    vehicle_number TEXT NOT NULL,
    vehicle_plate TEXT NOT NULL,
    vehicle_chassis TEXT,
    vehicle_engine TEXT,
    vehicle_model_year TEXT,
    vehicle_capacity TEXT,
    location GEOGRAPHY(POINT, 4326),
    heading NUMERIC(5, 2) DEFAULT 0,
    speed NUMERIC(6, 2) DEFAULT 0,
    bank_account_holder TEXT,
    bank_name TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    bank_upi TEXT,
    aadhar_number TEXT,
    pan_number TEXT,
    city TEXT,
    address TEXT,
    pincode TEXT,
    dob TEXT,
    emergency_contact_name TEXT,
    emergency_contact_relation TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX drivers_location_idx ON drivers USING GIST(location);

CREATE TRIGGER update_drivers_updated_at
    BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 3. driver_documents table
CREATE TABLE driver_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('dl', 'rc', 'insurance', 'fitness', 'puc', 'police_verification', 'truck_inspection')),
    doc_name TEXT NOT NULL,
    doc_number TEXT NOT NULL,
    issued_date TEXT,
    expiry_date TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('verified', 'pending', 'rejected')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(driver_id, doc_type)
);


-- 4. driver_earnings table
CREATE TABLE driver_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE UNIQUE,
    today NUMERIC(12, 2) DEFAULT 0,
    this_week NUMERIC(12, 2) DEFAULT 0,
    this_month NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_driver_earnings_updated_at
    BEFORE UPDATE ON driver_earnings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 5. vehicle_types table
CREATE TABLE vehicle_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    base_price NUMERIC(10, 2) NOT NULL,
    price_per_km NUMERIC(10, 2) NOT NULL,
    base_km_included INT DEFAULT 3,
    heavy_duty_surcharge NUMERIC(10, 2) DEFAULT 0,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- 6. bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number TEXT UNIQUE, -- Trigger will set this
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    vehicle_type_id TEXT REFERENCES vehicle_types(id),
    customer_vehicle JSONB NOT NULL DEFAULT '{}',
    pickup_address TEXT NOT NULL,
    pickup_landmark TEXT,
    pickup_location GEOGRAPHY(POINT, 4326) NOT NULL,
    dropoff_address TEXT NOT NULL,
    dropoff_landmark TEXT,
    dropoff_location GEOGRAPHY(POINT, 4326) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'searching', 'driver_assigned', 'driver_arriving', 'at_pickup', 'towing', 'completed', 'cancelled')),
    estimated_price NUMERIC(10, 2) NOT NULL,
    final_price NUMERIC(10, 2),
    estimated_eta INT,
    distance_km NUMERIC(8, 2) NOT NULL,
    duration_min INT,
    payment_method TEXT DEFAULT 'upi' CHECK (payment_method IN ('upi', 'card', 'wallet', 'cash')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    driver_rating NUMERIC(2, 1),
    customer_otp TEXT,
    dropoff_otp TEXT,
    promo_code TEXT,
    promo_discount NUMERIC(10, 2) DEFAULT 0,
    base_fare NUMERIC(10, 2),
    distance_fare NUMERIC(10, 2),
    platform_fee NUMERIC(10, 2),
    gst_amount NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX bookings_pickup_idx ON bookings USING GIST(pickup_location);
CREATE INDEX bookings_dropoff_idx ON bookings USING GIST(dropoff_location);

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER generate_booking_number_trigger
    BEFORE INSERT ON bookings
    FOR EACH ROW EXECUTE FUNCTION generate_booking_number();


-- 7. ledger_entries table
CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ledger_number TEXT UNIQUE NOT NULL,
    booking_id UUID REFERENCES bookings(id),
    payment_id TEXT,
    driver_id UUID REFERENCES drivers(id),
    driver_name TEXT,
    gross_customer_fare NUMERIC(10, 2) NOT NULL,
    commission_rate NUMERIC(4, 3) DEFAULT 0.100,
    commission_amount NUMERIC(10, 2) NOT NULL,
    gst_on_commission NUMERIC(10, 2) NOT NULL,
    driver_gross_earning NUMERIC(10, 2) NOT NULL,
    customer_tip NUMERIC(10, 2) DEFAULT 0,
    driver_net_earning NUMERIC(10, 2) NOT NULL,
    settlement_status TEXT DEFAULT 'unsettled' CHECK (settlement_status IN ('unsettled', 'batched', 'settled')),
    created_at TIMESTAMPTZ DEFAULT now()
);


-- 8. settlements table
CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_number TEXT UNIQUE NOT NULL,
    driver_id UUID REFERENCES drivers(id),
    driver_name TEXT,
    booking_ids TEXT[] NOT NULL,
    gross_amount NUMERIC(10, 2) NOT NULL,
    total_commission_deducted NUMERIC(10, 2) NOT NULL,
    net_payable NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending_clearance' CHECK (status IN ('pending_clearance', 'settled', 'paid_out')),
    payout_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    settled_at TIMESTAMPTZ
);


-- 9. payouts table
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payout_number TEXT UNIQUE NOT NULL,
    settlement_id UUID REFERENCES settlements(id),
    driver_id UUID REFERENCES drivers(id),
    driver_name TEXT,
    bank_name TEXT,
    account_number_masked TEXT,
    ifsc TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    mode TEXT DEFAULT 'IMPS' CHECK (mode IN ('IMPS', 'NEFT', 'UPI')),
    utr_number TEXT,
    status TEXT DEFAULT 'initiated' CHECK (status IN ('initiated', 'success', 'failed')),
    disbursed_at TIMESTAMPTZ
);


-- 10. wallet_transactions table
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT NOT NULL,
    booking_id UUID REFERENCES bookings(id),
    payment_id TEXT,
    settlement_id TEXT,
    utr_number TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    CHECK (user_id IS NOT NULL OR driver_id IS NOT NULL)
);


-- 11. notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'system' CHECK (type IN ('booking', 'promotion', 'system', 'ai', 'earnings', 'compliance', 'safety', 'success', 'info', 'payment', 'alert', 'promo', 'reminder', 'location')),
    is_read BOOLEAN DEFAULT false,
    icon TEXT,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    CHECK (user_id IS NOT NULL OR driver_id IS NOT NULL)
);


-- 12. sos_incidents table
CREATE TABLE sos_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    location_address TEXT NOT NULL,
    location_coords GEOGRAPHY(POINT, 4326),
    gps_display TEXT,
    vehicle_model TEXT,
    hazard_type TEXT NOT NULL,
    assigned_driver_id UUID REFERENCES drivers(id),
    assigned_driver_name TEXT,
    assigned_driver_phone TEXT,
    driver_eta TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'driver_on_scene', 'resolved', 'escalated')),
    police_notified BOOLEAN DEFAULT false,
    timeline JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);


-- 13. pricing_rules table
CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    night_charge_multiplier NUMERIC(4, 2) DEFAULT 1.25,
    waiting_charge_per_min NUMERIC(6, 2) DEFAULT 5.00,
    emergency_sos_charge NUMERIC(8, 2) DEFAULT 300.00,
    platform_commission_percent NUMERIC(5, 2) DEFAULT 10.00,
    gst_rate NUMERIC(5, 2) DEFAULT 18.00,
    highway_toll_policy TEXT DEFAULT 'Actuals charged via FASTag / User Pass-through',
    surge_zones JSONB DEFAULT '[]',
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_pricing_rules_updated_at
    BEFORE UPDATE ON pricing_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 14. fraud_incidents table
CREATE TABLE fraud_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('gps_mismatch', 'payment_chargeback', 'repeated_cancellations', 'multiple_accounts', 'cash_discrepancy')),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('high', 'medium', 'low')),
    subject_name TEXT NOT NULL,
    subject_role TEXT NOT NULL CHECK (subject_role IN ('driver', 'customer')),
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'frozen', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- Realtime Setup
-- Drop the publication if it already exists (useful if re-running)
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE bookings, drivers, sos_incidents, notifications;


-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_incidents ENABLE ROW LEVEL SECURITY;

-- Basic Policies (allowing all for simplicity, these should be refined for production)
CREATE POLICY "Enable read access for all" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all" ON users FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all" ON drivers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all" ON drivers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all" ON drivers FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all" ON driver_documents FOR SELECT USING (true);
CREATE POLICY "Enable all access for all" ON driver_documents FOR ALL USING (true);

CREATE POLICY "Enable read access for all" ON driver_earnings FOR SELECT USING (true);
CREATE POLICY "Enable all access for all" ON driver_earnings FOR ALL USING (true);

CREATE POLICY "Enable read access for all" ON vehicle_types FOR SELECT USING (true);
CREATE POLICY "Enable all access for all" ON vehicle_types FOR ALL USING (true);

CREATE POLICY "Enable read access for all" ON bookings FOR SELECT USING (true);
CREATE POLICY "Enable all access for all" ON bookings FOR ALL USING (true);

CREATE POLICY "Enable read access for all" ON ledger_entries FOR SELECT USING (true);
CREATE POLICY "Enable all access for all" ON ledger_entries FOR ALL USING (true);

CREATE POLICY "Enable read access for all" ON settlements FOR SELECT USING (true);
CREATE POLICY "Enable all access for all" ON settlements FOR ALL USING (true);

CREATE POLICY "Enable read access for all" ON payouts FOR SELECT USING (true);
CREATE POLICY "Enable all access for all" ON payouts FOR ALL USING (true);

CREATE POLICY "Enable read access for all" ON wallet_transactions FOR SELECT USING (true);
CREATE POLICY "Enable all access for all" ON wallet_transactions FOR ALL USING (true);

CREATE POLICY "Enable read access for all" ON notifications FOR SELECT USING (true);
CREATE POLICY "Enable all access for all" ON notifications FOR ALL USING (true);

CREATE POLICY "Enable read access for all" ON sos_incidents FOR SELECT USING (true);
CREATE POLICY "Enable all access for all" ON sos_incidents FOR ALL USING (true);

CREATE POLICY "Enable read access for all" ON pricing_rules FOR SELECT USING (true);
CREATE POLICY "Enable all access for all" ON pricing_rules FOR ALL USING (true);

CREATE POLICY "Enable read access for all" ON fraud_incidents FOR SELECT USING (true);
CREATE POLICY "Enable all access for all" ON fraud_incidents FOR ALL USING (true);
