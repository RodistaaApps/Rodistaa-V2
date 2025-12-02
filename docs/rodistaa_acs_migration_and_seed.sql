-- ============================================================================
-- Rodistaa ACS — SQL Migration + Seed Data
-- File: rodistaa_acs_migration_and_seed.sql
-- Purpose: create ACS tables (audit_logs, acs_blocks, pod_files, watchlist, users, trucks)
--          and insert sample seed data for initial testing.
-- Run in a transaction in Postgres.
-- ============================================================================

BEGIN;

-- 1. users (lightweight sample table for seeding)

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  role VARCHAR(32) NOT NULL,
  name VARCHAR(200),
  mobile_masked VARCHAR(32),
  kyc_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  is_active BOOLEAN DEFAULT TRUE,
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. trucks

CREATE TABLE IF NOT EXISTS trucks (
  id UUID PRIMARY KEY,
  operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reg_no VARCHAR(64),
  model_year INT,
  bs_type VARCHAR(16),
  chassis_number VARCHAR(128),
  status VARCHAR(32) DEFAULT 'PENDING_INSPECTION', -- ACTIVE, BLOCKED, PENDING_INSPECTION, EXPIRED_DOCS
  last_inspection_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. audit_logs (append-only)

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY,
  source VARCHAR(128) NOT NULL,
  event JSONB NOT NULL,
  rule_id VARCHAR(128),
  rule_version VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT now(),
  prev_hash TEXT,
  hash TEXT NOT NULL,
  signer VARCHAR(128)
);

-- 4. acs_blocks

CREATE TABLE IF NOT EXISTS acs_blocks (
  id UUID PRIMARY KEY,
  entity_type VARCHAR(32) NOT NULL, -- user/device/truck/ip/shipment
  entity_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  severity VARCHAR(16) NOT NULL,
  scope JSONB,
  expires_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  audit_id UUID REFERENCES audit_logs(id) ON DELETE SET NULL
);

-- 5. pod_files

CREATE TABLE IF NOT EXISTS pod_files (
  id UUID PRIMARY KEY,
  shipment_id UUID,
  uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  file_hash TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size_bytes BIGINT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. watchlist (generic)

CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY,
  entity_type VARCHAR(32) NOT NULL, -- user/device/truck/franchise
  entity_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  risk_score INTEGER DEFAULT 50,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. override_requests

CREATE TABLE IF NOT EXISTS override_requests (
  id UUID PRIMARY KEY,
  requester_id UUID REFERENCES users(id),
  target_entity_type VARCHAR(32),
  target_entity_id TEXT,
  rule_id VARCHAR(128),
  justification TEXT,
  evidence JSONB,
  status VARCHAR(32) DEFAULT 'PENDING', -- PENDING, APPROVED, DENIED, EXPIRED
  approver_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. indexes for quick lookups

CREATE INDEX IF NOT EXISTS idx_audit_logs_rule_id ON audit_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_acs_blocks_entity ON acs_blocks(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_pod_files_hash ON pod_files(file_hash);
CREATE INDEX IF NOT EXISTS idx_watchlist_entity ON watchlist(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_trucks_operator ON trucks(operator_id);
CREATE INDEX IF NOT EXISTS idx_users_kyc ON users(kyc_status);
CREATE INDEX IF NOT EXISTS idx_acs_blocks_expires ON acs_blocks(expires_at);

-- 9. Sample seed data: users (shipper/operator/driver/admin)

INSERT INTO users (id, role, name, mobile_masked, kyc_status, risk_score, created_at)
VALUES
('11111111-1111-1111-1111-111111111111', 'shipper', 'Acme Industries', '+91-98xxxxxx01', 'VERIFIED', 10, '2025-01-01T08:00:00Z'),
('22222222-2222-2222-2222-222222222222', 'operator', 'Kumar Transport Co', '+91-98xxxxxx02', 'VERIFIED', 20, '2025-01-05T09:00:00Z'),
('33333333-3333-3333-3333-333333333333', 'driver', 'Raju', '+91-98xxxxxx03', 'VERIFIED', 30, '2025-02-01T06:00:00Z'),
('44444444-4444-4444-4444-444444444444', 'admin', 'Rodistaa Admin', '+91-98xxxxxx04', 'VERIFIED', 5, '2025-03-01T10:00:00Z');

-- 10. Sample seed data: trucks

INSERT INTO trucks (id, operator_id, reg_no, model_year, bs_type, chassis_number, status, last_inspection_at, created_at)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'AP09AA1234', 2019, 'BS6', 'CHASSIS-0001', 'ACTIVE', '2025-08-01T10:00:00Z', '2025-01-06T09:00:00Z'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'AP09BB5678', 2017, 'BS4', 'CHASSIS-0002', 'EXPIRED_DOCS', '2023-05-01T10:00:00Z', '2024-05-01T09:00:00Z');

-- 11. Sample seed data: pod_files (one valid, one reused)

INSERT INTO pod_files (id, shipment_id, uploader_id, file_hash, file_name, file_size_bytes, metadata, created_at)
VALUES
('d11d11d1-d11d-11d1-d11d-d11d11d11d11d', '70000000-7000-7000-7000-700000000000', '33333333-3333-3333-3333-333333333333', 'hash-abc-123', 'pod_70000000.pdf', 124000, '{"timestamp":"2025-11-20T12:10:00Z","gps":{"lat":17.3850,"lon":78.4867}}', '2025-11-20T12:11:00Z'),
('d22d22d2-d22d-22d2-d22d-d22d22d22d22d', '70000001-7000-7000-7000-700000000001', '33333333-3333-3333-3333-333333333333', 'hash-abc-123', 'pod_70000001.pdf', 123800, '{"timestamp":"2025-11-21T09:20:00Z","gps":{"lat":17.4000,"lon":78.5000}}', '2025-11-21T09:22:00Z');

-- 12. Sample seed data: audit_logs (chain-style small sample)

INSERT INTO audit_logs (id, source, event, rule_id, rule_version, created_at, prev_hash, hash, signer)
VALUES
('aaaaaaaa-1111-aaaa-1111-aaaaaaaa1111', 'acs', '{"action":"seed_audit","notes":"initial"}', 'seed-RF', 'v1', '2025-11-20T12:00:00Z', NULL, 'hashroot-0001', 'rodistaa-svc'),
('aaaaaaaa-1111-aaaa-1112-aaaaaaaa1112', 'acs', '{"action":"pod_uploaded","podId":"d11d11d1-d11d-11d1-d11d-d11d11d11d11d"}', 'RF07_POD_DUPLICATE_HASH', 'v1', '2025-11-20T12:12:00Z', 'hashroot-0001', 'hash-0002', 'rodistaa-svc');

-- 13. Sample seed data: acs_blocks (block the expired truck)

INSERT INTO acs_blocks (id, entity_type, entity_id, reason, severity, scope, expires_at, created_by, created_at, audit_id)
VALUES
('f1111111-1111-1111-1111-111111111111', 'truck', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'EXPIRED_DOCUMENTS', 'critical', '{"policy":"doc_expiry"}', NULL, '44444444-4444-4444-4444-444444444444', '2025-11-21T08:00:00Z', 'aaaaaaaa-1111-aaaa-1112-aaaaaaaa1112'),
('f2222222-2222-2222-2222-222222222222', 'user', '33333333-3333-3333-3333-333333333333', 'DEVICE_SPOOF_SUSPECT', 'high', '{"deviceId":"device-xyz-0001"}', '2025-12-01T00:00:00Z', '44444444-4444-4444-4444-444444444444', '2025-11-21T09:00:00Z', 'aaaaaaaa-1111-aaaa-1111-aaaaaaaa1111');

-- 14. Sample seed data: watchlist

INSERT INTO watchlist (id, entity_type, entity_id, reason, risk_score, notes, created_at)
VALUES
('w1111111-1111-1111-1111-111111111111', 'unit_franchise', 'UF-0001', 'POTENTIAL_FAKE_INSPECTION', 85, 'Seed: duplicate inspection images detected', '2025-11-21T09:05:00Z');

-- 15. Sample seed data: override_requests (one pending)

INSERT INTO override_requests (id, requester_id, target_entity_type, target_entity_id, rule_id, justification, evidence, status, created_at)
VALUES
('ovr-000000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'truck', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'RF11_TRUCK_OWNER_MISMATCH', 'Operator provided scanned RC; urgent business need to reassign', '{"attachments":["rc_scan_1.jpg"]}', 'PENDING', '2025-11-21T09:30:00Z');

-- 16. Safety: sample grants / function placeholders (optional)

-- (DB-side functions and triggers can be added later by engineering as required)

COMMIT;

-- ============================================================================
-- End of migration + seed
-- ============================================================================

