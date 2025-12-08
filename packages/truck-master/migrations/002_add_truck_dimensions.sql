-- Migration: 002_add_truck_dimensions.sql
-- Purpose: Add mandatory body length and tyre count fields, flagging system, franchise tasks
-- Idempotent: Safe to run multiple times

BEGIN;

-- ============================================================================
-- ADD MANDATORY FIELDS TO operator_trucks
-- ============================================================================

-- Add tyre_count field (allowed values: 6,10,12,14,16,18,20,22)
ALTER TABLE operator_trucks
ADD COLUMN IF NOT EXISTS tyre_count SMALLINT CHECK (tyre_count IN (6,10,12,14,16,18,20,22));

-- Add body_length_ft field (allowed values based on typical lengths)
ALTER TABLE operator_trucks
ADD COLUMN IF NOT EXISTS body_length_ft SMALLINT;

-- Add body_type field
ALTER TABLE operator_trucks
ADD COLUMN IF NOT EXISTS body_type TEXT CHECK (body_type IN ('OPEN','CONTAINER','FLATBED','LOWBED','TRAILER','OTHER'));

-- Add payload_kg field (optional)
ALTER TABLE operator_trucks
ADD COLUMN IF NOT EXISTS payload_kg INTEGER;

-- Add axle_count field (optional)
ALTER TABLE operator_trucks
ADD COLUMN IF NOT EXISTS axle_count SMALLINT;

-- Modify rc_copy_bytea to store encrypted RC copy
ALTER TABLE operator_trucks
ALTER COLUMN rc_copy_bytea TYPE BYTEA USING rc_copy_bytea::bytea;

-- Add chassis_hash and engine_hash (SHA256)
ALTER TABLE operator_trucks
ADD COLUMN IF NOT EXISTS chassis_hash VARCHAR(64);
ALTER TABLE operator_trucks
ADD COLUMN IF NOT EXISTS engine_hash VARCHAR(64);

-- Add vahan_snapshot JSONB field (stores latest snapshot)
ALTER TABLE operator_trucks
ADD COLUMN IF NOT EXISTS vahan_snapshot JSONB;

-- Add flags and flags_history JSONB fields
ALTER TABLE operator_trucks
ADD COLUMN IF NOT EXISTS flags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE operator_trucks
ADD COLUMN IF NOT EXISTS flags_history JSONB DEFAULT '[]'::jsonb;

-- Update compliance_status to match new values
ALTER TABLE operator_trucks
DROP CONSTRAINT IF EXISTS operator_trucks_status_check;
ALTER TABLE operator_trucks
ADD CONSTRAINT operator_trucks_status_check 
  CHECK (status IN ('PENDING_VERIFICATION','ACTIVE','BLOCKED','PENDING_TRACTOR_PAIRING'));

-- Rename status to compliance_status for clarity (keeping status for backward compat)
ALTER TABLE operator_trucks
ADD COLUMN IF NOT EXISTS compliance_status TEXT 
  DEFAULT 'PENDING' 
  CHECK (compliance_status IN ('PENDING','ACTIVE','BLOCKED'));

-- Add last_verified_at
ALTER TABLE operator_trucks
ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMP;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_operator_trucks_tyre_count ON operator_trucks(tyre_count);
CREATE INDEX IF NOT EXISTS idx_operator_trucks_body_length ON operator_trucks(body_length_ft);
CREATE INDEX IF NOT EXISTS idx_operator_trucks_body_type ON operator_trucks(body_type);
CREATE INDEX IF NOT EXISTS idx_operator_trucks_chassis_hash ON operator_trucks(chassis_hash);
CREATE INDEX IF NOT EXISTS idx_operator_trucks_engine_hash ON operator_trucks(engine_hash);
CREATE INDEX IF NOT EXISTS idx_operator_trucks_compliance_status ON operator_trucks(compliance_status);
CREATE INDEX IF NOT EXISTS idx_operator_trucks_last_verified ON operator_trucks(last_verified_at);

-- ============================================================================
-- OPERATOR TRUCK FLAGS HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS operator_truck_flags (
    id BIGSERIAL PRIMARY KEY,
    truck_id INTEGER NOT NULL REFERENCES operator_trucks(id) ON DELETE CASCADE,
    flag_code VARCHAR(100) NOT NULL,
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP,
    
    -- Retention: 7 years
    retention_until TIMESTAMP GENERATED ALWAYS AS (created_at + INTERVAL '7 years') STORED
);

CREATE INDEX IF NOT EXISTS idx_truck_flags_truck_id ON operator_truck_flags(truck_id);
CREATE INDEX IF NOT EXISTS idx_truck_flags_flag_code ON operator_truck_flags(flag_code);
CREATE INDEX IF NOT EXISTS idx_truck_flags_created_at ON operator_truck_flags(created_at);
CREATE INDEX IF NOT EXISTS idx_truck_flags_resolved ON operator_truck_flags(resolved_at);

-- ============================================================================
-- FRANCHISE TASKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS franchise_tasks (
    id BIGSERIAL PRIMARY KEY,
    truck_id INTEGER NOT NULL REFERENCES operator_trucks(id) ON DELETE CASCADE,
    task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('PHOTO_VERIFY','MANUAL_VERIFY','DOCUMENT_REVIEW')),
    assigned_franchise_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','IN_PROGRESS','COMPLETED','REJECTED','CANCELLED')),
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    completed_by VARCHAR(100),
    result JSONB,
    notes TEXT,
    
    -- Retention: 7 years
    retention_until TIMESTAMP GENERATED ALWAYS AS (created_at + INTERVAL '7 years') STORED
);

CREATE INDEX IF NOT EXISTS idx_franchise_tasks_truck_id ON franchise_tasks(truck_id);
CREATE INDEX IF NOT EXISTS idx_franchise_tasks_franchise ON franchise_tasks(assigned_franchise_id);
CREATE INDEX IF NOT EXISTS idx_franchise_tasks_status ON franchise_tasks(status);
CREATE INDEX IF NOT EXISTS idx_franchise_tasks_due_at ON franchise_tasks(due_at);
CREATE INDEX IF NOT EXISTS idx_franchise_tasks_type ON franchise_tasks(task_type);

-- ============================================================================
-- ADMIN TICKETS TABLE (if not exists from admin_fleet_management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_tickets (
    id BIGSERIAL PRIMARY KEY,
    truck_id INTEGER REFERENCES operator_trucks(id) ON DELETE SET NULL,
    operator_id VARCHAR(100),
    reason_code VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    assigned_to VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','IN_PROGRESS','RESOLVED','CLOSED')),
    notes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(100),
    
    -- Retention: 7 years
    retention_until TIMESTAMP GENERATED ALWAYS AS (created_at + INTERVAL '7 years') STORED
);

CREATE INDEX IF NOT EXISTS idx_admin_tickets_truck_id ON admin_tickets(truck_id);
CREATE INDEX IF NOT EXISTS idx_admin_tickets_operator_id ON admin_tickets(operator_id);
CREATE INDEX IF NOT EXISTS idx_admin_tickets_reason_code ON admin_tickets(reason_code);
CREATE INDEX IF NOT EXISTS idx_admin_tickets_severity ON admin_tickets(severity);
CREATE INDEX IF NOT EXISTS idx_admin_tickets_status ON admin_tickets(status);
CREATE INDEX IF NOT EXISTS idx_admin_tickets_assigned_to ON admin_tickets(assigned_to);

-- ============================================================================
-- OEM MODEL BODY LENGTH MAPPING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS oem_model_bodylength (
    id SERIAL PRIMARY KEY,
    maker VARCHAR(100) NOT NULL,
    model_name VARCHAR(200) NOT NULL,
    typical_tyre_count SMALLINT[] NOT NULL,
    typical_body_length_ft SMALLINT[] NOT NULL,
    typical_body_types TEXT[] NOT NULL,
    min_length_ft SMALLINT,
    max_length_ft SMALLINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(maker, model_name)
);

CREATE INDEX IF NOT EXISTS idx_oem_maker_model ON oem_model_bodylength(maker, model_name);
CREATE INDEX IF NOT EXISTS idx_oem_active ON oem_model_bodylength(is_active);

-- Update trigger for oem_model_bodylength
CREATE TRIGGER update_oem_model_bodylength_updated_at BEFORE UPDATE ON oem_model_bodylength
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;

