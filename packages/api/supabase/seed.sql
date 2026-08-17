-- Seed data for OmniGo Database
-- Using predefined UUIDs to maintain FK relationships

-- 1. users
INSERT INTO users (id, name, phone, email, is_verified, membership_tier, wallet_balance) VALUES
('a0000000-0000-0000-0000-000000000001', 'Rahul Sharma', '+919876543210', 'rahul.s@example.com', true, 'pro', 1500.00),
('a0000000-0000-0000-0000-000000000002', 'Priya Patel', '+919876543211', 'priya.p@example.com', true, 'gold', 250.00),
('a0000000-0000-0000-0000-000000000003', 'Amit Kumar', '+919876543212', 'amit.k@example.com', true, 'basic', 0.00),
('a0000000-0000-0000-0000-000000000004', 'Sneha Desai', '+919876543213', 'sneha.d@example.com', true, 'silver', 500.00),
('a0000000-0000-0000-0000-000000000005', 'Vikram Singh', '+919876543214', 'vikram.s@example.com', false, 'none', 0.00),
('a0000000-0000-0000-0000-000000000006', 'Neha Gupta', '+919876543215', 'neha.g@example.com', true, 'platinum', 3000.00),
('a0000000-0000-0000-0000-000000000007', 'Karan Johar', '+919876543216', 'karan.j@example.com', true, 'elite', 10000.00),
('a0000000-0000-0000-0000-000000000008', 'Anjali Reddy', '+919876543217', 'anjali.r@example.com', true, 'pro', 2000.00),
('a0000000-0000-0000-0000-000000000009', 'Suresh Menon', '+919876543218', 'suresh.m@example.com', false, 'none', 0.00),
('a0000000-0000-0000-0000-000000000010', 'Pooja Iyer', '+919876543219', 'pooja.i@example.com', true, 'silver', 750.00);

-- 2. drivers
INSERT INTO drivers (id, name, phone, email, rating, total_trips, acceptance_rate, is_online, is_verified, kyc_status, vehicle_type, vehicle_number, vehicle_plate, location, bank_name, bank_account_number, bank_ifsc, city, address) VALUES
('b0000000-0000-0000-0000-000000000001', 'Rajesh Kumar', '+918876543210', 'rajesh.k@driver.com', 4.8, 120, 95.5, true, true, 'verified', 'flatbed', 'MH12AB1234', 'MH12AB1234', ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326)::geography, 'HDFC Bank', '501002345678', 'HDFC0001234', 'Pune', 'Shivaji Nagar, Pune'),
('b0000000-0000-0000-0000-000000000002', 'Sandeep Singh', '+918876543211', 'sandeep.s@driver.com', 4.9, 340, 98.0, true, true, 'verified', 'hooklift', 'MH14CD5678', 'MH14CD5678', ST_SetSRID(ST_MakePoint(73.7868, 18.6298), 4326)::geography, 'SBI', '302002345678', 'SBIN0001234', 'Pune', 'Pimpri, Pune'),
('b0000000-0000-0000-0000-000000000003', 'Manoj Tiwari', '+918876543212', 'manoj.t@driver.com', 4.5, 85, 88.5, false, true, 'verified', 'wheel_lift', 'MH12EF9012', 'MH12EF9012', ST_SetSRID(ST_MakePoint(73.9167, 18.5604), 4326)::geography, 'ICICI Bank', '000012345678', 'ICIC0001234', 'Pune', 'Viman Nagar, Pune'),
('b0000000-0000-0000-0000-000000000004', 'Dinesh Patel', '+918876543213', 'dinesh.p@driver.com', 4.7, 210, 92.0, true, true, 'verified', 'flatbed', 'MH02GH3456', 'MH02GH3456', ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326)::geography, 'Axis Bank', '910012345678', 'UTIB0001234', 'Mumbai', 'Andheri East, Mumbai'),
('b0000000-0000-0000-0000-000000000005', 'Ramesh Yadav', '+918876543214', 'ramesh.y@driver.com', 4.6, 150, 90.5, true, true, 'verified', 'hooklift', 'MH01IJ7890', 'MH01IJ7890', ST_SetSRID(ST_MakePoint(72.8277, 18.9760), 4326)::geography, 'HDFC Bank', '501009876543', 'HDFC0005678', 'Mumbai', 'Colaba, Mumbai'),
('b0000000-0000-0000-0000-000000000006', 'Suresh Jadhav', '+918876543215', 'suresh.j@driver.com', 4.8, 280, 96.0, false, true, 'verified', 'flatbed', 'KA01KL1234', 'KA01KL1234', ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)::geography, 'SBI', '302009876543', 'SBIN0005678', 'Bangalore', 'Koramangala, Bangalore'),
('b0000000-0000-0000-0000-000000000007', 'Vinod M', '+918876543216', 'vinod.m@driver.com', 4.9, 420, 99.0, true, true, 'verified', 'heavy_duty', 'KA03MN5678', 'KA03MN5678', ST_SetSRID(ST_MakePoint(77.6446, 12.9216), 4326)::geography, 'ICICI Bank', '000098765432', 'ICIC0005678', 'Bangalore', 'HSR Layout, Bangalore'),
('b0000000-0000-0000-0000-000000000008', 'Kishore K', '+918876543217', 'kishore.k@driver.com', 4.4, 50, 85.0, true, false, 'pending_review', 'wheel_lift', 'KA05OP9012', 'KA05OP9012', ST_SetSRID(ST_MakePoint(77.5846, 12.9316), 4326)::geography, 'Axis Bank', '910098765432', 'UTIB0005678', 'Bangalore', 'Jayanagar, Bangalore'),
('b0000000-0000-0000-0000-000000000009', 'Ashok Deshmukh', '+918876543218', 'ashok.d@driver.com', 4.7, 190, 93.5, false, true, 'action_required', 'flatbed', 'MH12QR3456', 'MH12QR3456', ST_SetSRID(ST_MakePoint(73.8167, 18.5004), 4326)::geography, 'Kotak Bank', '1234567890', 'KKBK0001234', 'Pune', 'Kothrud, Pune'),
('b0000000-0000-0000-0000-000000000010', 'Prakash R', '+918876543219', 'prakash.r@driver.com', 4.2, 30, 80.0, true, false, 'pending_review', 'hooklift', 'MH04ST7890', 'MH04ST7890', ST_SetSRID(ST_MakePoint(72.9777, 19.2060), 4326)::geography, 'HDFC Bank', '501001122334', 'HDFC0009999', 'Mumbai', 'Thane, Mumbai');

-- 3. driver_documents (Adding docs for d0000000-0000-0000-0000-000000000001 as example)
INSERT INTO driver_documents (driver_id, doc_type, doc_name, doc_number, status) VALUES
('b0000000-0000-0000-0000-000000000001', 'dl', 'Driving License', 'MH1220100012345', 'verified'),
('b0000000-0000-0000-0000-000000000001', 'rc', 'Registration Certificate', 'MH12AB1234', 'verified'),
('b0000000-0000-0000-0000-000000000001', 'insurance', 'Vehicle Insurance', 'INS123456789', 'verified'),
('b0000000-0000-0000-0000-000000000001', 'fitness', 'Fitness Certificate', 'FIT123456', 'verified'),
('b0000000-0000-0000-0000-000000000001', 'puc', 'PUC Certificate', 'PUC123456', 'verified'),
('b0000000-0000-0000-0000-000000000001', 'police_verification', 'Police Clearance', 'POL123456', 'verified'),
('b0000000-0000-0000-0000-000000000001', 'truck_inspection', 'Truck Inspection Report', 'TRK123456', 'verified');

-- 4. driver_earnings
INSERT INTO driver_earnings (driver_id, today, this_week, this_month, total) VALUES
('b0000000-0000-0000-0000-000000000001', 1200.00, 8500.00, 35000.00, 450000.00),
('b0000000-0000-0000-0000-000000000002', 800.00, 6200.00, 28000.00, 320000.00),
('b0000000-0000-0000-0000-000000000004', 1500.00, 10500.00, 42000.00, 510000.00);

-- 5. vehicle_types
INSERT INTO vehicle_types (id, name, description, icon, base_price, price_per_km, base_km_included) VALUES
('bike', 'Two Wheeler', 'Towing for bikes and scooters', 'bike', 500.00, 20.00, 5),
('hatchback', 'Hatchback', 'Towing for small cars', 'car', 999.00, 40.00, 5),
('sedan', 'Sedan', 'Towing for medium cars', 'car-sport', 1299.00, 50.00, 5),
('suv', 'SUV', 'Towing for SUVs and large vehicles', 'car-sport-outline', 1499.00, 60.00, 5),
('commercial_van', 'Commercial Van', 'Towing for vans and tempo', 'bus', 1999.00, 75.00, 5),
('heavy_truck', 'Heavy Truck', 'Towing for heavy commercial vehicles', 'bus-outline', 4999.00, 150.00, 5);

-- 6. bookings
INSERT INTO bookings (id, user_id, driver_id, vehicle_type_id, customer_vehicle, pickup_address, pickup_location, dropoff_address, dropoff_location, status, estimated_price, distance_km, payment_method, payment_status, booking_number) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'hatchback', '{"make": "Maruti", "model": "Swift", "color": "White", "plate": "MH12AB1234"}', 'Shivaji Nagar, Pune', ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326)::geography, 'Kothrud, Pune', ST_SetSRID(ST_MakePoint(73.8167, 18.5004), 4326)::geography, 'completed', 1500.00, 8.5, 'upi', 'completed', 'OMG-0001'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'suv', '{"make": "Toyota", "model": "Fortuner", "color": "Black", "plate": "MH14CD5678"}', 'Hinjewadi, Pune', ST_SetSRID(ST_MakePoint(73.7367, 18.5904), 4326)::geography, 'Baner, Pune', ST_SetSRID(ST_MakePoint(73.7767, 18.5604), 4326)::geography, 'towing', 2200.00, 12.0, 'card', 'pending', 'OMG-0002'),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', NULL, 'bike', '{"make": "Honda", "model": "Activa", "color": "Blue", "plate": "MH12EF9012"}', 'Viman Nagar, Pune', ST_SetSRID(ST_MakePoint(73.9167, 18.5604), 4326)::geography, 'Kalyani Nagar, Pune', ST_SetSRID(ST_MakePoint(73.9067, 18.5504), 4326)::geography, 'searching', 600.00, 3.5, 'cash', 'pending', 'OMG-0003');

-- 7. ledger_entries
INSERT INTO ledger_entries (ledger_number, booking_id, driver_id, driver_name, gross_customer_fare, commission_rate, commission_amount, gst_on_commission, driver_gross_earning, driver_net_earning, settlement_status) VALUES
('LDG-20231015-001', 'b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Rajesh Kumar', 1500.00, 0.10, 150.00, 27.00, 1500.00, 1323.00, 'unsettled');

-- 8. settlements
INSERT INTO settlements (settlement_number, driver_id, driver_name, booking_ids, gross_amount, total_commission_deducted, net_payable, status) VALUES
('SET-20231015-001', 'b0000000-0000-0000-0000-000000000001', 'Rajesh Kumar', '{"b0000000-0000-0000-0000-000000000001"}', 1500.00, 177.00, 1323.00, 'pending_clearance');

-- 9. payouts
INSERT INTO payouts (payout_number, settlement_id, driver_id, driver_name, bank_name, account_number_masked, ifsc, amount, mode, status) VALUES
('PAY-20231015-001', (SELECT id FROM settlements WHERE settlement_number = 'SET-20231015-001'), 'b0000000-0000-0000-0000-000000000001', 'Rajesh Kumar', 'HDFC Bank', '********5678', 'HDFC0001234', 1323.00, 'IMPS', 'success');

-- 10. wallet_transactions
INSERT INTO wallet_transactions (user_id, type, amount, description) VALUES
('a0000000-0000-0000-0000-000000000001', 'credit', 1500.00, 'Added money to wallet'),
('a0000000-0000-0000-0000-000000000001', 'debit', 500.00, 'Payment for booking OMG-0001');

-- 11. notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
('a0000000-0000-0000-0000-000000000001', 'Booking Confirmed', 'Your booking OMG-0001 has been confirmed', 'booking'),
('a0000000-0000-0000-0000-000000000001', 'Driver Arriving', 'Rajesh Kumar is arriving at your location', 'location');

-- 12. sos_incidents
INSERT INTO sos_incidents (incident_number, user_id, customer_name, customer_phone, location_address, location_coords, hazard_type, status) VALUES
('SOS-20231015-001', 'a0000000-0000-0000-0000-000000000001', 'Rahul Sharma', '+919876543210', 'Mumbai-Pune Expressway', ST_SetSRID(ST_MakePoint(73.5567, 18.7204), 4326)::geography, 'Accident', 'active');

-- 13. pricing_rules
INSERT INTO pricing_rules (night_charge_multiplier, waiting_charge_per_min, emergency_sos_charge, platform_commission_percent, gst_rate) VALUES
(1.25, 5.00, 300.00, 10.00, 18.00);

-- 14. fraud_incidents
INSERT INTO fraud_incidents (incident_number, type, severity, subject_name, subject_role, description, status) VALUES
('FRD-20231015-001', 'gps_mismatch', 'high', 'Rajesh Kumar', 'driver', 'Driver GPS location mismatch during ride', 'open'),
('FRD-20231015-002', 'payment_chargeback', 'medium', 'Priya Patel', 'customer', 'Multiple chargebacks initiated', 'frozen');

