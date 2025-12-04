-- Truck Master Service Schema
-- Migration: 001_create_truck_master_schema.sql
-- Idempotent: Safe to run multiple times

BEGIN;

-- Operators table (if not exists from fleet-verification)
CREATE TABLE IF NOT EXISTS operators (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    kyc_status VARCHAR(20) DEFAULT 'PENDING',
    truck_count INTEGER DEFAULT 0,
    max_trucks INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operators_phone ON operators(phone);

-- Operator Trucks (Truck Master)
CREATE TABLE IF NOT EXISTS operator_trucks (
    id SERIAL PRIMARY KEY,
    operator_id VARCHAR(100) NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    rc_number VARCHAR(20) NOT NULL,
    nickname VARCHAR(100), -- Optional operator-provided nickname
    rc_copy_url TEXT, -- Encrypted RC copy storage reference
    rc_copy_hash VARCHAR(64), -- SHA256 of RC copy
    rc_copy_encrypted TEXT, -- Encrypted RC copy (AES-256-GCM)
    status VARCHAR(20) DEFAULT 'PENDING_VERIFICATION', -- PENDING_VERIFICATION, ACTIVE, BLOCKED, PENDING_TRACTOR_PAIRING
    is_tractor BOOLEAN DEFAULT FALSE,
    is_trailer BOOLEAN DEFAULT FALSE,
    onboarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    onboarded_by VARCHAR(100),
    legal_authorization_accepted BOOLEAN DEFAULT FALSE,
    authorization_accepted_at TIMESTAMP,
    authorization_declaration TEXT,
    linked_tractor_rc VARCHAR(20), -- For trailers
    linked_trailer_rc VARCHAR(20), -- For tractors
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(operator_id, rc_number)
);

CREATE INDEX IF NOT EXISTS idx_operator_trucks_operator ON operator_trucks(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_trucks_rc ON operator_trucks(rc_number);
CREATE INDEX IF NOT EXISTS idx_operator_trucks_status ON operator_trucks(status);
CREATE INDEX IF NOT EXISTS idx_operator_trucks_onboarded ON operator_trucks(onboarded_at);

-- VAHAN Vehicle Snapshot (canonical + raw)
CREATE TABLE IF NOT EXISTS vahan_vehicle_snapshot (
    id SERIAL PRIMARY KEY,
    rc_number VARCHAR(20) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- PARIVAHAN, SUREPASS, BACKUP
    txn_id VARCHAR(100),
    vahan_timestamp TIMESTAMP,
    
    -- Canonical VAHAN fields
    maker VARCHAR(100),
    model_name VARCHAR(200),
    model_code VARCHAR(50),
    gvw_kg INTEGER,
    ulw_kg INTEGER,
    wheelbase_mm INTEGER,
    body_type_code VARCHAR(10),
    body_type_name VARCHAR(200),
    vehicle_category VARCHAR(50), -- GOODS, PASSENGER, etc.
    permit_type VARCHAR(50),
    permit_valid_upto DATE,
    fitness_valid_upto DATE,
    insurance_valid_upto DATE,
    puc_valid_upto DATE,
    registration_status VARCHAR(50),
    chassis_number VARCHAR(100),
    engine_number VARCHAR(100),
    
    -- Security hashes
    chassis_hash VARCHAR(64), -- SHA256
    engine_hash VARCHAR(64), -- SHA256
    
    -- Raw data
    raw_json JSONB NOT NULL,
    normalized_json JSONB, -- Canonical VahanSnapshot shape
    
    -- Metadata
    verification_status VARCHAR(20) DEFAULT 'PENDING', -- SUCCESS, FAILED, PENDING
    error_message TEXT,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Retention: 7 years
    retention_until TIMESTAMP GENERATED ALWAYS AS (created_at + INTERVAL '7 years') STORED,
    
    UNIQUE(rc_number, provider, txn_id)
);

CREATE INDEX IF NOT EXISTS idx_vahan_rc ON vahan_vehicle_snapshot(rc_number);
CREATE INDEX IF NOT EXISTS idx_vahan_chassis_hash ON vahan_vehicle_snapshot(chassis_hash);
CREATE INDEX IF NOT EXISTS idx_vahan_engine_hash ON vahan_vehicle_snapshot(engine_hash);
CREATE INDEX IF NOT EXISTS idx_vahan_verified_at ON vahan_vehicle_snapshot(verified_at);
CREATE INDEX IF NOT EXISTS idx_vahan_provider ON vahan_vehicle_snapshot(provider);
CREATE INDEX IF NOT EXISTS idx_vahan_txn_id ON vahan_vehicle_snapshot(txn_id);

-- Vehicle Inference
CREATE TABLE IF NOT EXISTS vehicle_inference (
    id SERIAL PRIMARY KEY,
    rc_number VARCHAR(20) NOT NULL,
    inferred_body_type VARCHAR(50), -- SXL, DXL, TXL, QXL, PXL, HX, TRL
    inferred_body_category VARCHAR(50), -- OPEN_BODY, CONTAINER, FLATBED, LOWBED, SKELETAL
    inferred_length_ft DECIMAL(5,2),
    candidate_lengths JSONB, -- Array of candidate lengths with confidence
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    inference_method VARCHAR(50), -- OEM_MAPPING, WHEELBASE, ULW_FALLBACK, MANUAL
    oem_model_id INTEGER,
    rules_applied TEXT[], -- Array of rules that were applied
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rc_number)
);

CREATE INDEX IF NOT EXISTS idx_inference_rc ON vehicle_inference(rc_number);

-- Vehicle Compliance Cache
CREATE TABLE IF NOT EXISTS vehicle_compliance_cache (
    id SERIAL PRIMARY KEY,
    rc_number VARCHAR(20) NOT NULL,
    operator_id VARCHAR(100) NOT NULL,
    
    -- Decision
    allow BOOLEAN NOT NULL,
    reasons TEXT[], -- Array of reason codes
    decision_at TIMESTAMP NOT NULL,
    provider VARCHAR(50), -- Provider used for verification
    last_verified_at TIMESTAMP,
    
    -- Compliance fields
    permit_status VARCHAR(20), -- VALID, EXPIRING_SOON, EXPIRED, BLANK
    fitness_status VARCHAR(20),
    insurance_status VARCHAR(20),
    puc_status VARCHAR(20),
    category_status VARCHAR(20), -- GOODS_ONLY, PASSENGER, etc.
    emission_status VARCHAR(20), -- BS4, BS6, BLOCKED
    gvw_tyre_status VARCHAR(20), -- VALID, MISMATCH
    duplicate_status VARCHAR(20), -- CLEAN, DUPLICATE_CHASSIS, DUPLICATE_ENGINE
    telemetry_status VARCHAR(20), -- ACTIVE, STALE, MISSING
    
    -- Metadata
    rules_applied TEXT[], -- Array of rules applied
    cache_expires_at TIMESTAMP NOT NULL, -- TTL = 7 days
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(rc_number, operator_id)
);

CREATE INDEX IF NOT EXISTS idx_compliance_rc ON vehicle_compliance_cache(rc_number);
CREATE INDEX IF NOT EXISTS idx_compliance_operator ON vehicle_compliance_cache(operator_id);
CREATE INDEX IF NOT EXISTS idx_compliance_allow ON vehicle_compliance_cache(allow);
CREATE INDEX IF NOT EXISTS idx_compliance_expires ON vehicle_compliance_cache(cache_expires_at);
CREATE INDEX IF NOT EXISTS idx_compliance_verified ON vehicle_compliance_cache(last_verified_at);

-- VAHAN Body Code Samples (discovery)
CREATE TABLE IF NOT EXISTS vahan_body_code_samples (
    id SERIAL PRIMARY KEY,
    body_code VARCHAR(10) NOT NULL,
    body_code_string VARCHAR(200),
    state_code VARCHAR(10),
    sample_count INTEGER DEFAULT 1,
    sample_rc_numbers TEXT[],
    first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(body_code, state_code)
);

CREATE INDEX IF NOT EXISTS idx_body_code_samples_code ON vahan_body_code_samples(body_code);

-- VAHAN Body Code Map (manual labeling)
CREATE TABLE IF NOT EXISTS vahan_body_code_map (
    id SERIAL PRIMARY KEY,
    body_code VARCHAR(10) NOT NULL,
    manual_label VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- OPEN_BODY, CONTAINER, FLATBED, LOWBED, TRAILER, BLOCKED
    is_blocked BOOLEAN DEFAULT FALSE,
    notes TEXT,
    labeled_by VARCHAR(100),
    labeled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    UNIQUE(body_code, version)
);

CREATE INDEX IF NOT EXISTS idx_body_code_map_code ON vahan_body_code_map(body_code);

-- Trailer Links
CREATE TABLE IF NOT EXISTS trailer_links (
    id SERIAL PRIMARY KEY,
    trailer_rc VARCHAR(20) NOT NULL,
    tractor_rc VARCHAR(20) NOT NULL,
    operator_id VARCHAR(100) NOT NULL,
    linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unlinked_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(trailer_rc, tractor_rc, operator_id)
);

CREATE INDEX IF NOT EXISTS idx_trailer_links_trailer ON trailer_links(trailer_rc);
CREATE INDEX IF NOT EXISTS idx_trailer_links_tractor ON trailer_links(tractor_rc);
CREATE INDEX IF NOT EXISTS idx_trailer_links_operator ON trailer_links(operator_id);
CREATE INDEX IF NOT EXISTS idx_trailer_links_active ON trailer_links(is_active);

-- Tickets (HQ ticketing)
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    ticket_type VARCHAR(50) NOT NULL, -- PROVIDER_MISMATCH, DUPLICATE_CHASSIS, PERMIT_DISCREPANCY, LOW_TRUST, COMPLIANCE_BLOCK, INVALID_LENGTH_FOR_CLASS
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
    rc_number VARCHAR(20),
    operator_id VARCHAR(100),
    payload JSONB NOT NULL, -- Full context including provider diffs, raw JSON
    assigned_to VARCHAR(100),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Retention: 7 years
    retention_until TIMESTAMP GENERATED ALWAYS AS (created_at + INTERVAL '7 years') STORED
);

CREATE INDEX IF NOT EXISTS idx_tickets_type ON tickets(ticket_type);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_rc ON tickets(rc_number);
CREATE INDEX IF NOT EXISTS idx_tickets_operator ON tickets(operator_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created ON tickets(created_at);

-- Audit Log (verification events)
CREATE TABLE IF NOT EXISTS verification_audit_log (
    id SERIAL PRIMARY KEY,
    rc_number VARCHAR(20) NOT NULL,
    operator_id VARCHAR(100),
    event_type VARCHAR(50) NOT NULL, -- VERIFICATION_STARTED, VERIFICATION_SUCCESS, VERIFICATION_FAILED, COMPLIANCE_CHECKED, TICKET_CREATED
    provider VARCHAR(50),
    txn_id VARCHAR(100),
    decision JSONB, -- Decision details
    rules_applied TEXT[],
    inference_confidence DECIMAL(3,2),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Retention: 7 years
    retention_until TIMESTAMP GENERATED ALWAYS AS (created_at + INTERVAL '7 years') STORED
);

CREATE INDEX IF NOT EXISTS idx_audit_rc ON verification_audit_log(rc_number);
CREATE INDEX IF NOT EXISTS idx_audit_event_type ON verification_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_created ON verification_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_txn_id ON verification_audit_log(txn_id);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_operators_updated_at BEFORE UPDATE ON operators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operator_trucks_updated_at BEFORE UPDATE ON operator_trucks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_inference_updated_at BEFORE UPDATE ON vehicle_inference
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_compliance_cache_updated_at BEFORE UPDATE ON vehicle_compliance_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;

