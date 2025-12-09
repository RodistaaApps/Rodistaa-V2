-- Migration: 003_driver_and_assignments.sql
-- Purpose: Create driver management and truck-driver assignment tables
-- Idempotent: Safe to run multiple times

BEGIN;

-- ============================================================================
-- DRIVERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id VARCHAR(100) NOT NULL,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    alt_mobile TEXT,
    aadhaar_hash TEXT, -- SHA256 hash of Aadhaar number (NEVER store raw)
    dl_number TEXT NOT NULL, -- Encrypted
    dl_class TEXT NOT NULL CHECK (dl_class IN ('LMV', 'LMV-NT', 'HMV', 'HMV-NT', 'Transport', 'MCWG', 'MCWOG')),
    dl_valid_from DATE NOT NULL,
    dl_valid_till DATE NOT NULL,
    dob DATE NOT NULL,
    gender TEXT CHECK (gender IN ('M', 'F', 'O', 'PREFER_NOT_TO_SAY')),
    address JSONB NOT NULL DEFAULT '{}'::jsonb, -- {city, state, pincode, full_address}
    is_active BOOLEAN DEFAULT TRUE,
    preferred_shift TEXT DEFAULT 'ANY' CHECK (preferred_shift IN ('DAY', 'NIGHT', 'ANY')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique mobile per operator
    UNIQUE(operator_id, mobile)
);

CREATE INDEX IF NOT EXISTS idx_drivers_operator_id ON drivers(operator_id);
CREATE INDEX IF NOT EXISTS idx_drivers_mobile ON drivers(mobile);
CREATE INDEX IF NOT EXISTS idx_drivers_dl_number ON drivers(dl_number);
CREATE INDEX IF NOT EXISTS idx_drivers_dl_valid_till ON drivers(dl_valid_till);
CREATE INDEX IF NOT EXISTS idx_drivers_is_active ON drivers(is_active);
CREATE INDEX IF NOT EXISTS idx_drivers_aadhaar_hash ON drivers(aadhaar_hash);

-- ============================================================================
-- DRIVER DOCUMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS driver_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('DL_SCAN', 'AADHAAR_SCAN', 'MEDICAL_CERT', 'POLICE_VERIFICATION', 'PHOTO', 'OTHER')),
    doc_blob BYTEA NOT NULL, -- Encrypted
    uploaded_by VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE, -- For medical cert, police verification
    meta JSONB DEFAULT '{}'::jsonb, -- {file_name, file_type, file_size, verification_status}
    
    -- Retention: 7 years
    retention_until TIMESTAMP GENERATED ALWAYS AS (uploaded_at + INTERVAL '7 years') STORED
);

CREATE INDEX IF NOT EXISTS idx_driver_documents_driver_id ON driver_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_documents_doc_type ON driver_documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_driver_documents_expiry_date ON driver_documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_driver_documents_uploaded_at ON driver_documents(uploaded_at);

-- ============================================================================
-- TRUCK DRIVER ASSIGNMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS truck_driver_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    truck_id INTEGER NOT NULL REFERENCES operator_trucks(id) ON DELETE CASCADE,
    primary_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    co_driver_ids UUID[] DEFAULT ARRAY[]::UUID[], -- Array of co-driver UUIDs
    assigned_by UUID NOT NULL, -- admin/operator/franchise user ID
    assigned_by_role TEXT NOT NULL CHECK (assigned_by_role IN ('OPERATOR', 'FRANCHISE', 'HQ_ADMIN')),
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP, -- NULL = indefinite assignment
    is_active BOOLEAN DEFAULT TRUE,
    assignment_reason TEXT, -- shift/route/temp/holiday cover
    force_assigned BOOLEAN DEFAULT FALSE, -- True if HQ/admin override
    force_assignment_reason TEXT, -- Mandatory if force_assigned = true
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Only one active assignment per truck
    CONSTRAINT unique_active_truck_assignment 
        EXCLUDE (truck_id WITH =) WHERE (is_active = TRUE)
);

CREATE INDEX IF NOT EXISTS idx_truck_assignments_truck_id ON truck_driver_assignments(truck_id);
CREATE INDEX IF NOT EXISTS idx_truck_assignments_primary_driver ON truck_driver_assignments(primary_driver_id);
CREATE INDEX IF NOT EXISTS idx_truck_assignments_co_drivers ON truck_driver_assignments USING GIN(co_driver_ids);
CREATE INDEX IF NOT EXISTS idx_truck_assignments_is_active ON truck_driver_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_truck_assignments_start_at ON truck_driver_assignments(start_at);
CREATE INDEX IF NOT EXISTS idx_truck_assignments_end_at ON truck_driver_assignments(end_at);

-- ============================================================================
-- DRIVER AVAILABILITY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS driver_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    reason TEXT NOT NULL, -- sick/leave/personal/other
    status TEXT NOT NULL DEFAULT 'BLOCKED' CHECK (status IN ('AVAILABLE', 'BLOCKED')),
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_driver_availability_driver_id ON driver_availability(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_availability_start_at ON driver_availability(start_at);
CREATE INDEX IF NOT EXISTS idx_driver_availability_end_at ON driver_availability(end_at);
CREATE INDEX IF NOT EXISTS idx_driver_availability_status ON driver_availability(status);

-- ============================================================================
-- DRIVER FLAGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS driver_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    flag_code TEXT NOT NULL CHECK (flag_code IN (
        'DL_EXPIRED', 
        'DL_EXPIRING_SOON', 
        'MEDICAL_EXPIRED', 
        'MEDICAL_EXPIRING_SOON',
        'BACKGROUND_ISSUE', 
        'MULTI_ASSIGNMENT_CONFLICT',
        'POLICE_VERIFICATION_PENDING',
        'DUPLICATE_DRIVER',
        'DL_VERIFICATION_FAILED'
    )),
    meta JSONB DEFAULT '{}'::jsonb, -- {reason, severity, details}
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP,
    
    -- Retention: 7 years
    retention_until TIMESTAMP GENERATED ALWAYS AS (created_at + INTERVAL '7 years') STORED
);

CREATE INDEX IF NOT EXISTS idx_driver_flags_driver_id ON driver_flags(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_flags_flag_code ON driver_flags(flag_code);
CREATE INDEX IF NOT EXISTS idx_driver_flags_resolved ON driver_flags(resolved_at);
CREATE INDEX IF NOT EXISTS idx_driver_flags_active ON driver_flags(driver_id) WHERE (resolved_at IS NULL);

-- ============================================================================
-- OPERATOR FLEET TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS operator_fleet (
    operator_id VARCHAR(100) NOT NULL,
    truck_id INTEGER NOT NULL REFERENCES operator_trucks(id) ON DELETE CASCADE,
    is_verified BOOLEAN DEFAULT FALSE,
    linked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified_by VARCHAR(100),
    verified_at TIMESTAMP,
    
    PRIMARY KEY (operator_id, truck_id)
);

CREATE INDEX IF NOT EXISTS idx_operator_fleet_operator_id ON operator_fleet(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_fleet_truck_id ON operator_fleet(truck_id);
CREATE INDEX IF NOT EXISTS idx_operator_fleet_is_verified ON operator_fleet(is_verified);

-- ============================================================================
-- DL CLASS TO TRUCK CATEGORY MAPPING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS dl_truck_category_mapping (
    id SERIAL PRIMARY KEY,
    truck_category TEXT NOT NULL, -- LCV, MCV, HCV, TRAILER
    required_dl_class TEXT NOT NULL, -- LMV, HMV, etc.
    is_required BOOLEAN DEFAULT TRUE, -- True = mandatory, False = optional
    priority INTEGER DEFAULT 1, -- Lower = preferred
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(truck_category, required_dl_class)
);

-- Seed DL class mappings
INSERT INTO dl_truck_category_mapping (truck_category, required_dl_class, is_required, priority)
VALUES
    ('LCV', 'LMV', TRUE, 1),
    ('LCV', 'LMV-NT', TRUE, 2),
    ('LCV', 'Transport', TRUE, 3),
    ('MCV', 'LMV', FALSE, 2),
    ('MCV', 'HMV', TRUE, 1),
    ('HCV', 'HMV', TRUE, 1),
    ('HCV', 'Transport', TRUE, 2),
    ('TRAILER', 'HMV', TRUE, 1),
    ('TRAILER', 'Transport', TRUE, 2)
ON CONFLICT (truck_category, required_dl_class) DO NOTHING;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_truck_assignments_updated_at BEFORE UPDATE ON truck_driver_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUDIT LOGS (if not exists from admin portal)
-- ============================================================================

-- admin_audit_logs table should already exist from admin_fleet_management migration
-- If not, create minimal version here

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_audit_logs') THEN
        CREATE TABLE admin_audit_logs (
            id BIGSERIAL PRIMARY KEY,
            admin_id VARCHAR(50) NOT NULL,
            action_type VARCHAR(100) NOT NULL,
            resource_type VARCHAR(50) NOT NULL,
            resource_id VARCHAR(255) NOT NULL,
            payload JSONB NOT NULL DEFAULT '{}'::jsonb,
            provider_txn_id VARCHAR(100),
            txn_id VARCHAR(100) UNIQUE,
            correlation_id VARCHAR(100),
            ip_address INET,
            user_agent TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        
        CREATE INDEX idx_audit_logs_admin_id ON admin_audit_logs(admin_id);
        CREATE INDEX idx_audit_logs_resource_type ON admin_audit_logs(resource_type);
        CREATE INDEX idx_audit_logs_created_at ON admin_audit_logs(created_at);
    END IF;
END $$;

COMMIT;

