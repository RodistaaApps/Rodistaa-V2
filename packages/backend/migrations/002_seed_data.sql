-- ============================================================================
-- Rodistaa Platform - Seed Data
-- Migration: 002_seed_data.sql
-- Description: Sample seed data for QA and development
-- ============================================================================

BEGIN;

-- Seed users (10 users across roles)
INSERT INTO users (id, role, name, mobile_masked, kyc_status, is_active, risk_score) VALUES
  ('USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV', 'SH', 'Acme Industries', '+91-98xxxxxx01', 'VERIFIED', TRUE, 10),
  ('USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FBV', 'SH', 'Mega Transport Co', '+91-99xxxxxx02', 'VERIFIED', TRUE, 15),
  ('USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FCV', 'OP', 'Reliable Logistics', '+91-97xxxxxx03', 'VERIFIED', TRUE, 20),
  ('USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FDV', 'OP', 'Fast Track Movers', '+91-96xxxxxx04', 'VERIFIED', TRUE, 25),
  ('USR-DR-01ARZ3NDEKTSV4RRFFQ69G5FEV', 'DR', 'Rajesh Kumar', '+91-95xxxxxx05', 'VERIFIED', TRUE, 5),
  ('USR-DR-01ARZ3NDEKTSV4RRFFQ69G5FFV', 'DR', 'Suresh Patel', '+91-94xxxxxx06', 'VERIFIED', TRUE, 8),
  ('USR-AD-01ARZ3NDEKTSV4RRFFQ69G5FGV', 'AD', 'Admin User', '+91-93xxxxxx07', 'VERIFIED', TRUE, 0),
  ('USR-FU-01ARZ3NDEKTSV4RRFFQ69G5FHV', 'FU', 'Unit Franchise 1', '+91-92xxxxxx08', 'VERIFIED', TRUE, 0),
  ('USR-FD-01ARZ3NDEKTSV4RRFFQ69G5FIV', 'FD', 'District Franchise 1', '+91-91xxxxxx09', 'VERIFIED', TRUE, 0),
  ('USR-KA-01ARZ3NDEKTSV4RRFFQ69G5FJV', 'KA', 'KYC Admin', '+91-90xxxxxx10', 'VERIFIED', TRUE, 0)
ON CONFLICT (id) DO NOTHING;

-- Seed trucks (5 trucks)
INSERT INTO trucks (id, operator_id, reg_no, model_year, bs_type, tonnage, status, last_inspection_at) VALUES
  ('TRK-MH12AB1234-01ARZ3NDEKTSV4RRFFQ69G5FKV', 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FCV', 'MH-12-AB-1234', 2020, 'BS6', 20.0, 'ACTIVE', NOW() - INTERVAL '60 days'),
  ('TRK-MH12CD5678-01ARZ3NDEKTSV4RRFFQ69G5FLV', 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FCV', 'MH-12-CD-5678', 2019, 'BS4', 25.0, 'ACTIVE', NOW() - INTERVAL '90 days'),
  ('TRK-GJ01EF9012-01ARZ3NDEKTSV4RRFFQ69G5FMV', 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FDV', 'GJ-01-EF-9012', 2021, 'BS6', 18.0, 'ACTIVE', NOW() - INTERVAL '30 days'),
  ('TRK-KA03GH3456-01ARZ3NDEKTSV4RRFFQ69G5FNV', 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FDV', 'KA-03-GH-3456', 2020, 'BS6', 22.0, 'NEEDS_INSPECTION', NOW() - INTERVAL '125 days'),
  ('TRK-TN09IJ7890-01ARZ3NDEKTSV4RRFFQ69G5FOV', 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FDV', 'TN-09-IJ-7890', 2018, 'BS4', 20.0, 'BLOCKED', NULL)
ON CONFLICT (id) DO NOTHING;

-- Seed ledgers for operators
INSERT INTO ledgers (operator_id, balance, currency) VALUES
  ('USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FCV', 50000.00, 'INR'),
  ('USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FDV', 75000.00, 'INR')
ON CONFLICT (operator_id) DO NOTHING;

-- Seed sample bookings (10 bookings)
INSERT INTO bookings (id, shipper_id, pickup, drop, goods, tonnage, expected_price, price_range_min, price_range_max, status, bids_count) VALUES
  ('RID-20250102-0001', 'USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV', 
   '{"address": "123 Main St", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001", "coordinates": {"lat": 19.0760, "lng": 72.8777}}',
   '{"address": "456 Park Ave", "city": "Pune", "state": "Maharashtra", "pincode": "411001", "coordinates": {"lat": 18.5204, "lng": 73.8567}}',
   '{"type": "Machinery", "weight": 15.0, "packaging": "Pallets"}',
   15.0, 18000.00, 15000.00, 20000.00, 'OPEN', 2),
  ('RID-20250102-0002', 'USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FBV',
   '{"address": "789 Business Park", "city": "Delhi", "state": "Delhi", "pincode": "110001", "coordinates": {"lat": 28.6139, "lng": 77.2090}}',
   '{"address": "321 Trade Center", "city": "Gurgaon", "state": "Haryana", "pincode": "122001", "coordinates": {"lat": 28.4089, "lng": 77.0378}}',
   '{"type": "Electronics", "weight": 10.0, "packaging": "Boxes"}',
   10.0, 15000.00, 12000.00, 18000.00, 'NEGOTIATION', 3)
ON CONFLICT (id) DO NOTHING;

COMMIT;

