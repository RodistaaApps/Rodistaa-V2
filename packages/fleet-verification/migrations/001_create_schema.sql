-- Rodistaa Fleet Matrix & VAHAN Verification Schema
-- Migration: 001_create_schema.sql
-- Idempotent: Safe to run multiple times

BEGIN;

-- OEM Model Body Length Mapping
CREATE TABLE IF NOT EXISTS oem_model_bodylength (
    id SERIAL PRIMARY KEY,
    oem_name VARCHAR(100) NOT NULL,
    model_code VARCHAR(50) NOT NULL,
    model_name VARCHAR(200) NOT NULL,
    typical_body_length_ft DECIMAL(5,2),
    typical_wheelbase_mm INTEGER,
    typical_ulw_kg INTEGER,
    typical_gvw_kg INTEGER,
    typical_tyre_count INTEGER,
    typical_axle_count INTEGER,
    body_type_category VARCHAR(50), -- OPEN_BODY, CONTAINER, FLATBED, LOWBED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(oem_name, model_code)
);

CREATE INDEX IF NOT EXISTS idx_oem_model_lookup ON oem_model_bodylength(oem_name, model_code);

-- VAHAN Vehicle Snapshot (raw provider responses)
CREATE TABLE IF NOT EXISTS vahan_vehicle_snapshot (
    id SERIAL PRIMARY KEY,
    rc_number VARCHAR(20) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- PARIVAHAN, SUREPASS, BACKUP
    txn_id VARCHAR(100),
    raw_json JSONB NOT NULL,
    normalized_data JSONB, -- Canonical VahanSnapshot shape
    chassis_hash VARCHAR(64), -- SHA256
    engine_hash VARCHAR(64), -- SHA256
    verification_status VARCHAR(20) DEFAULT 'PENDING', -- SUCCESS, FAILED, PENDING
    error_message TEXT,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rc_number, provider, txn_id)
);

CREATE INDEX IF NOT EXISTS idx_vahan_rc ON vahan_vehicle_snapshot(rc_number);
CREATE INDEX IF NOT EXISTS idx_vahan_chassis_hash ON vahan_vehicle_snapshot(chassis_hash);
CREATE INDEX IF NOT EXISTS idx_vahan_engine_hash ON vahan_vehicle_snapshot(engine_hash);
CREATE INDEX IF NOT EXISTS idx_vahan_verified_at ON vahan_vehicle_snapshot(verified_at);

-- Vehicle Body Inference (ML/rule-based inference results)
CREATE TABLE IF NOT EXISTS vehicle_body_inference (
    id SERIAL PRIMARY KEY,
    rc_number VARCHAR(20) NOT NULL,
    inferred_body_type VARCHAR(50), -- SXL, DXL, TXL, QXL, PXL, HX, TRL
    inferred_body_category VARCHAR(50), -- OPEN_BODY, CONTAINER, FLATBED, LOWBED, TRAILER
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    inference_method VARCHAR(50), -- OEM_MAPPING, WHEELBASE, ULW_FALLBACK, MANUAL
    oem_model_id INTEGER REFERENCES oem_model_bodylength(id),
    inferred_length_ft DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rc_number)
);

CREATE INDEX IF NOT EXISTS idx_inference_rc ON vehicle_body_inference(rc_number);

-- Vehicle Compliance Cache (final compliance decisions)
CREATE TABLE IF NOT EXISTS vehicle_compliance_cache (
    id SERIAL PRIMARY KEY,
    rc_number VARCHAR(20) NOT NULL,
    operator_id VARCHAR(100) NOT NULL,
    compliance_status VARCHAR(20) NOT NULL, -- ALLOWED, BLOCKED, PENDING
    reason_codes TEXT[], -- Array of reason codes
    last_verification_at TIMESTAMP,
    last_verification_provider VARCHAR(50),
    last_verification_txn_id VARCHAR(100),
    cache_expires_at TIMESTAMP NOT NULL, -- TTL = 7 days from last_verification_at
    gps_last_ping_at TIMESTAMP,
    gps_status VARCHAR(20) DEFAULT 'UNKNOWN', -- ACTIVE, STALE, MISSING
    permit_valid_until DATE,
    permit_status VARCHAR(20), -- VALID, EXPIRING_SOON, EXPIRED, BLANK
    chassis_hash VARCHAR(64),
    engine_hash VARCHAR(64),
    is_duplicate_chassis BOOLEAN DEFAULT FALSE,
    is_duplicate_engine BOOLEAN DEFAULT FALSE,
    gvw_kg INTEGER,
    tyre_count INTEGER,
    axle_count INTEGER,
    body_length_ft DECIMAL(5,2),
    emission_code VARCHAR(10), -- BS3, BS4, BS6
    body_type_category VARCHAR(50),
    fleet_classification VARCHAR(10), -- SXL, DXL, TXL, QXL, PXL, HX, TRL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rc_number, operator_id)
);

CREATE INDEX IF NOT EXISTS idx_compliance_rc ON vehicle_compliance_cache(rc_number);
CREATE INDEX IF NOT EXISTS idx_compliance_operator ON vehicle_compliance_cache(operator_id);
CREATE INDEX IF NOT EXISTS idx_compliance_status ON vehicle_compliance_cache(compliance_status);
CREATE INDEX IF NOT EXISTS idx_compliance_expires ON vehicle_compliance_cache(cache_expires_at);
CREATE INDEX IF NOT EXISTS idx_compliance_chassis_hash ON vehicle_compliance_cache(chassis_hash);
CREATE INDEX IF NOT EXISTS idx_compliance_gps_ping ON vehicle_compliance_cache(gps_last_ping_at);

-- VAHAN Body Code Samples (discovery data)
CREATE TABLE IF NOT EXISTS vahan_body_code_samples (
    id SERIAL PRIMARY KEY,
    body_code VARCHAR(10) NOT NULL,
    body_code_string VARCHAR(200),
    state_code VARCHAR(10),
    sample_count INTEGER DEFAULT 1,
    sample_rc_numbers TEXT[], -- Array of sample RC numbers
    first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(body_code, state_code)
);

CREATE INDEX IF NOT EXISTS idx_body_code_samples_code ON vahan_body_code_samples(body_code);

-- VAHAN Body Code Map (manual labeling workflow)
CREATE TABLE IF NOT EXISTS vahan_body_code_map (
    id SERIAL PRIMARY KEY,
    body_code VARCHAR(10) NOT NULL,
    manual_label VARCHAR(100) NOT NULL, -- Human-readable label
    category VARCHAR(50), -- OPEN_BODY, CONTAINER, FLATBED, LOWBED, TRAILER, BLOCKED
    is_blocked BOOLEAN DEFAULT FALSE,
    notes TEXT,
    labeled_by VARCHAR(100),
    labeled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    UNIQUE(body_code, version)
);

CREATE INDEX IF NOT EXISTS idx_body_code_map_code ON vahan_body_code_map(body_code);

-- Operators (simple metadata)
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

-- Operator Trucks (onboarded trucks)
CREATE TABLE IF NOT EXISTS operator_trucks (
    id SERIAL PRIMARY KEY,
    operator_id VARCHAR(100) NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    rc_number VARCHAR(20) NOT NULL,
    rc_copy_url TEXT, -- Encrypted/stored reference
    rc_copy_hash VARCHAR(64), -- SHA256 of RC copy
    onboarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    onboarded_by VARCHAR(100),
    legal_authorization_accepted BOOLEAN DEFAULT FALSE,
    authorization_accepted_at TIMESTAMP,
    authorization_declaration TEXT,
    is_tractor BOOLEAN DEFAULT FALSE,
    is_trailer BOOLEAN DEFAULT FALSE,
    linked_tractor_rc VARCHAR(20), -- For trailers
    linked_trailer_rc VARCHAR(20), -- For tractors
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, BLOCKED, PENDING_TRACTOR_PAIRING
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(operator_id, rc_number)
);

CREATE INDEX IF NOT EXISTS idx_operator_trucks_operator ON operator_trucks(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_trucks_rc ON operator_trucks(rc_number);
CREATE INDEX IF NOT EXISTS idx_operator_trucks_status ON operator_trucks(status);

-- HQ Tickets (discrepancy queue)
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    ticket_type VARCHAR(50) NOT NULL, -- PROVIDER_MISMATCH, DUPLICATE_CHASSIS, PERMIT_DISCREPANCY, LOW_TRUST
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
    rc_number VARCHAR(20),
    operator_id VARCHAR(100),
    payload JSONB NOT NULL, -- Full context data
    assigned_to VARCHAR(100),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tickets_type ON tickets(ticket_type);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_rc ON tickets(rc_number);
CREATE INDEX IF NOT EXISTS idx_tickets_operator ON tickets(operator_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created ON tickets(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_oem_model_bodylength_updated_at BEFORE UPDATE ON oem_model_bodylength
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_body_inference_updated_at BEFORE UPDATE ON vehicle_body_inference
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_compliance_cache_updated_at BEFORE UPDATE ON vehicle_compliance_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operators_updated_at BEFORE UPDATE ON operators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operator_trucks_updated_at BEFORE UPDATE ON operator_trucks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;

