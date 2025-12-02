-- ============================================================================
-- Rodistaa Platform - Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Core tables for users, trucks, bookings, bids, shipments
-- ============================================================================

BEGIN;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY, -- USR-<role>-<ulid>
  role VARCHAR(32) NOT NULL,
  name VARCHAR(200) NOT NULL,
  mobile_masked VARCHAR(32),
  mobile_full_encrypted TEXT, -- AES-256-GCM encrypted
  email VARCHAR(255),
  kyc_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  kyc_id VARCHAR(255), -- KYC-<ulid> (backend-only reference)
  is_active BOOLEAN DEFAULT TRUE,
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  CONSTRAINT valid_kyc_status CHECK (kyc_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPICIOUS')),
  CONSTRAINT valid_role CHECK (role IN ('SH', 'OP', 'DR', 'AD', 'FU', 'FD', 'KA'))
);

-- KYC records (encrypted blob storage)
CREATE TABLE IF NOT EXISTS kyc_records (
  id VARCHAR(255) PRIMARY KEY, -- KYC-<ulid>
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  encrypted_blob BYTEA NOT NULL, -- AES-256-GCM encrypted JSON
  verified_by VARCHAR(255) REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  suspicious_flags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_kyc_record_status CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPICIOUS'))
);

-- Trucks table
CREATE TABLE IF NOT EXISTS trucks (
  id VARCHAR(255) PRIMARY KEY, -- TRK-<regno>-<ulid>
  operator_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reg_no VARCHAR(64) NOT NULL,
  model_year INTEGER NOT NULL,
  bs_type VARCHAR(16) NOT NULL,
  chassis_number_encrypted TEXT,
  vehicle_type VARCHAR(16) DEFAULT 'HGV',
  tonnage DECIMAL(10, 2),
  status VARCHAR(32) DEFAULT 'PENDING_INSPECTION',
  last_inspection_at TIMESTAMPTZ,
  next_inspection_due TIMESTAMPTZ,
  
  -- Document expiry dates
  rc_expiry DATE,
  fitness_expiry DATE,
  permit_expiry DATE,
  insurance_expiry DATE,
  pollution_expiry DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_bs_type CHECK (bs_type IN ('BS4', 'BS6')),
  CONSTRAINT valid_truck_status CHECK (status IN ('PENDING_INSPECTION', 'ACTIVE', 'BLOCKED', 'NEEDS_INSPECTION', 'EXPIRED_DOCUMENTS', 'INACTIVE')),
  CONSTRAINT valid_model_year CHECK (model_year >= 2018)
);

-- Truck photos (inspection photos)
CREATE TABLE IF NOT EXISTS truck_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id VARCHAR(255) NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
  inspection_id UUID,
  photo_url_encrypted TEXT NOT NULL,
  geo_tag JSONB,
  photo_type VARCHAR(32), -- 'inspection', 'rc', 'fitness', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspections table
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id VARCHAR(255) NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
  franchise_id VARCHAR(255) NOT NULL REFERENCES users(id),
  status VARCHAR(16) NOT NULL,
  inspection_date TIMESTAMPTZ NOT NULL,
  geo_tag JSONB NOT NULL,
  checklist JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_inspection_status CHECK (status IN ('PASS', 'FAIL'))
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(255) PRIMARY KEY, -- RID-YYYYMMDD-xxxx
  shipper_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pickup JSONB NOT NULL, -- {address, city, state, pincode, coordinates: {lat, lng}}
  drop JSONB NOT NULL,
  goods JSONB NOT NULL, -- {type, weight, packaging}
  tonnage DECIMAL(10, 2) NOT NULL,
  expected_price DECIMAL(12, 2),
  price_range_min DECIMAL(12, 2),
  price_range_max DECIMAL(12, 2),
  status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
  bids_count INTEGER DEFAULT 0,
  auto_finalize_at TIMESTAMPTZ,
  finalized_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_booking_status CHECK (status IN ('OPEN', 'NEGOTIATION', 'AUTO_FINALIZED', 'FINALIZED', 'CANCELLED'))
);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
  id VARCHAR(255) PRIMARY KEY, -- BK-<ulid>
  booking_id VARCHAR(255) NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  operator_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  bidding_fee DECIMAL(10, 2),
  ledger_deducted BOOLEAN DEFAULT FALSE,
  ledger_transaction_id VARCHAR(255),
  modifications_count INTEGER DEFAULT 0,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_bid_status CHECK (status IN ('ACTIVE', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id VARCHAR(255) PRIMARY KEY, -- SH-<ulid>
  booking_id VARCHAR(255) NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  bid_id VARCHAR(255) NOT NULL REFERENCES bids(id),
  shipper_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  operator_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  driver_id VARCHAR(255) REFERENCES users(id),
  truck_id VARCHAR(255) REFERENCES trucks(id),
  alternate_truck_id VARCHAR(255) REFERENCES trucks(id),
  status VARCHAR(32) NOT NULL DEFAULT 'ASSIGNED',
  agreed_price DECIMAL(12, 2) NOT NULL,
  pickup JSONB NOT NULL,
  drop JSONB NOT NULL,
  goods JSONB NOT NULL,
  tracking_info JSONB, -- {currentLocation, route, lastPingAt, etc.}
  otp_code VARCHAR(6),
  otp_generated_at TIMESTAMPTZ,
  otp_expires_at TIMESTAMPTZ,
  otp_attempts INTEGER DEFAULT 0,
  otp_verified_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_shipment_status CHECK (status IN ('ASSIGNED', 'DRIVER_PENDING_APPROVAL', 'IN_TRANSIT', 'AT_PICKUP', 'AT_DESTINATION', 'OTP_PENDING', 'COMPLETED', 'FAILED', 'FROZEN'))
);

-- GPS logs table
CREATE TABLE IF NOT EXISTS gps_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id VARCHAR(255) NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  coordinates JSONB NOT NULL, -- {lat, lng}
  speed DECIMAL(8, 2),
  heading DECIMAL(8, 2),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_gps_shipment_time (shipment_id, timestamp)
);

-- POD files table
CREATE TABLE IF NOT EXISTS pod_files (
  id VARCHAR(255) PRIMARY KEY, -- POD-<ulid>
  shipment_id VARCHAR(255) NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  uploader_id VARCHAR(255) NOT NULL REFERENCES users(id),
  file_hash VARCHAR(255) NOT NULL, -- SHA256 for duplicate detection
  file_name VARCHAR(255),
  file_size_bytes BIGINT,
  file_url_encrypted TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_file_hash UNIQUE (file_hash)
);

-- Ledgers table
CREATE TABLE IF NOT EXISTS ledgers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'INR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT non_negative_balance CHECK (balance >= 0),
  CONSTRAINT one_ledger_per_operator UNIQUE (operator_id)
);

-- Ledger transactions table
CREATE TABLE IF NOT EXISTS ledger_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ledger_id UUID NOT NULL REFERENCES ledgers(id) ON DELETE CASCADE,
  type VARCHAR(32) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  balance_before DECIMAL(12, 2) NOT NULL,
  balance_after DECIMAL(12, 2) NOT NULL,
  reference_id VARCHAR(255),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_transaction_type CHECK (type IN ('DEPOSIT', 'BIDDING_FEE', 'REFUND'))
);

-- ACS blocks table
CREATE TABLE IF NOT EXISTS acs_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(32) NOT NULL,
  entity_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  severity VARCHAR(16) NOT NULL,
  scope JSONB,
  expires_at TIMESTAMPTZ,
  created_by VARCHAR(255) REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  audit_id UUID REFERENCES audit_logs(id),
  
  CONSTRAINT valid_entity_type CHECK (entity_type IN ('user', 'truck', 'driver', 'operator', 'shipment', 'device')),
  CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Audit logs table (hash-chained)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(128) NOT NULL,
  event JSONB NOT NULL,
  rule_id VARCHAR(128),
  rule_version VARCHAR(64),
  prev_hash TEXT, -- Previous audit log hash (for chaining)
  hash TEXT NOT NULL, -- SHA256 hash of this entry
  signer VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(32) NOT NULL,
  entity_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  risk_score INTEGER DEFAULT 50,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_watchlist_entity_type CHECK (entity_type IN ('user', 'truck', 'driver', 'operator', 'shipment')),
  CONSTRAINT valid_risk_score CHECK (risk_score >= 0 AND risk_score <= 100)
);

-- Override requests table
CREATE TABLE IF NOT EXISTS override_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id VARCHAR(255) NOT NULL REFERENCES users(id),
  target_entity_type VARCHAR(32) NOT NULL,
  target_entity_id TEXT NOT NULL,
  rule_id VARCHAR(128),
  justification TEXT NOT NULL,
  evidence JSONB,
  status VARCHAR(32) DEFAULT 'PENDING',
  approver_id VARCHAR(255) REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_override_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- Franchises table (extends users)
CREATE TABLE IF NOT EXISTS franchises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  district_code VARCHAR(64),
  unit_code VARCHAR(64),
  parent_franchise_id VARCHAR(255) REFERENCES users(id),
  target DECIMAL(12, 2),
  performance_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_performance_score CHECK (performance_score >= 0 AND performance_score <= 100)
);

-- Roles and permissions (RBAC)
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(64) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL, -- Array of permission strings
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by VARCHAR(255) REFERENCES users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_role UNIQUE (user_id, role_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);
CREATE INDEX IF NOT EXISTS idx_trucks_operator ON trucks(operator_id);
CREATE INDEX IF NOT EXISTS idx_trucks_status ON trucks(status);
CREATE INDEX IF NOT EXISTS idx_bookings_shipper ON bookings(shipper_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bids_booking ON bids(booking_id);
CREATE INDEX IF NOT EXISTS idx_bids_operator ON bids(operator_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_shipments_booking ON shipments(booking_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_driver ON shipments(driver_id);
CREATE INDEX IF NOT EXISTS idx_acs_blocks_entity ON acs_blocks(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_rule ON audit_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_source ON audit_logs(source);
CREATE INDEX IF NOT EXISTS idx_gps_logs_shipment ON gps_logs(shipment_id);

COMMIT;

