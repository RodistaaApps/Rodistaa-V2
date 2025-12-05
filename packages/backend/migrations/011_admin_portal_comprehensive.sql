-- Migration: Comprehensive Admin Portal Schema
-- Created: 2025-12-05
-- Purpose: Complete enterprise admin portal with RBAC, KYC, fraud, payouts, Odoo

-- ============================================================================
-- DYNAMIC RBAC SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_roles (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]', -- Array of permission strings
  parent_role_id VARCHAR(50), -- For hierarchy
  scope VARCHAR(20) NOT NULL DEFAULT 'global' CHECK (scope IN ('global', 'region', 'franchise')),
  is_system_role BOOLEAN NOT NULL DEFAULT FALSE, -- Cannot be deleted
  created_by VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_role_parent FOREIGN KEY (parent_role_id) REFERENCES admin_roles(id) ON DELETE SET NULL
);

CREATE INDEX idx_admin_roles_name ON admin_roles(name);
CREATE INDEX idx_admin_roles_scope ON admin_roles(scope);

-- Update admin_users to reference dynamic roles
ALTER TABLE admin_users 
  DROP COLUMN IF EXISTS role CASCADE,
  ADD COLUMN role_ids TEXT[] DEFAULT '{}', -- Array of role IDs
  ADD COLUMN regions TEXT[] DEFAULT '{}', -- Regions this admin can access
  ADD COLUMN role_expires_at TIMESTAMPTZ;

-- ============================================================================
-- KYC MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS kyc_queue (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('operator', 'driver', 'shipper')),
  kyc_type VARCHAR(30) NOT NULL CHECK (kyc_type IN ('aadhar', 'pan', 'dl', 'rc', 'gst', 'business_proof')),
  document_url TEXT NOT NULL,
  document_hash VARCHAR(64), -- For duplicate detection
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revoked')),
  submitted_at TIMESTAMPTZ NOT NULL,
  reviewed_by VARCHAR(50),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  rejection_reason TEXT,
  metadata JSONB DEFAULT '{}', -- OCR data, LLM scores, etc.
  priority INTEGER NOT NULL DEFAULT 5, -- 1=highest, 5=normal
  
  CONSTRAINT fk_kyc_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_kyc_queue_status ON kyc_queue(status, priority, submitted_at DESC);
CREATE INDEX idx_kyc_queue_user ON kyc_queue(user_id, user_type);
CREATE INDEX idx_kyc_queue_reviewer ON kyc_queue(reviewed_by);
CREATE INDEX idx_kyc_queue_hash ON kyc_queue(document_hash) WHERE document_hash IS NOT NULL;

-- PII access audit
CREATE TABLE IF NOT EXISTS pii_access_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255) NOT NULL,
  pii_field VARCHAR(100) NOT NULL, -- 'owner_mobile', 'aadhar_number', etc.
  reason TEXT NOT NULL,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_pii_access_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_pii_access_admin ON pii_access_logs(admin_id, created_at DESC);
CREATE INDEX idx_pii_access_resource ON pii_access_logs(resource_type, resource_id);

-- ============================================================================
-- FRAUD DETECTION & INVESTIGATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS fraud_alerts (
  id VARCHAR(50) PRIMARY KEY,
  alert_type VARCHAR(50) NOT NULL, -- IMAGE_FRAUD, ROUTE_DEVIATION, WEIGHT_ANOMALY, DUPLICATE_POD, KYC_FRAUD
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'false_positive', 'confirmed', 'escalated')),
  
  -- Target
  target_type VARCHAR(20) NOT NULL, -- operator, driver, shipment, load
  target_id VARCHAR(50) NOT NULL,
  
  -- Detection
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  detection_method VARCHAR(50) NOT NULL, -- llm, rule_engine, anomaly_detector
  confidence_score DECIMAL(5,2), -- 0-100
  
  -- Evidence
  evidence JSONB NOT NULL DEFAULT '{}', -- Images, telemetry, chat logs
  evidence_snapshot JSONB, -- Immutable snapshot on escalation
  
  -- Investigation
  assigned_to VARCHAR(50),
  investigated_by VARCHAR(50),
  investigation_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_action VARCHAR(50), -- BLOCK_PERMANENT, TEMP_BLOCK, FALSE_POSITIVE, ESCALATE_LEGAL
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_fraud_assigned FOREIGN KEY (assigned_to) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_fraud_investigated FOREIGN KEY (investigated_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_fraud_alerts_status ON fraud_alerts(status, severity, detected_at DESC);
CREATE INDEX idx_fraud_alerts_target ON fraud_alerts(target_type, target_id);
CREATE INDEX idx_fraud_alerts_assigned ON fraud_alerts(assigned_to);
CREATE INDEX idx_fraud_alerts_type ON fraud_alerts(alert_type);

-- Fraud detection rules (editable by admin)
CREATE TABLE IF NOT EXISTS fraud_detection_rules (
  id VARCHAR(50) PRIMARY KEY,
  rule_name VARCHAR(100) NOT NULL UNIQUE,
  rule_type VARCHAR(50) NOT NULL,
  conditions JSONB NOT NULL, -- Rule definition (DSL or JSON)
  threshold JSONB NOT NULL, -- Thresholds for triggering
  severity VARCHAR(20) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by VARCHAR(50),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_fraud_rule_creator FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- ============================================================================
-- ADMIN OVERRIDES
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_overrides (
  id BIGSERIAL PRIMARY KEY,
  admin_id VARCHAR(50) NOT NULL,
  override_type VARCHAR(50) NOT NULL, -- FORCE_STN_RELEASE, ADJUST_FEE, FORCE_PAYOUT, etc.
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT NOT NULL,
  approval_required BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by VARCHAR(50),
  approved_at TIMESTAMPTZ,
  txn_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_override_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_override_approver FOREIGN KEY (approved_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_overrides_admin ON admin_overrides(admin_id, created_at DESC);
CREATE INDEX idx_overrides_resource ON admin_overrides(resource_type, resource_id);
CREATE INDEX idx_overrides_type ON admin_overrides(override_type);

-- ============================================================================
-- WALLET & PAYOUTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS wallet_ledger (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('operator', 'driver', 'shipper')),
  transaction_type VARCHAR(30) NOT NULL, -- CREDIT, DEBIT, PAYOUT, REFUND, ADJUSTMENT
  amount DECIMAL(12,2) NOT NULL,
  balance_before DECIMAL(12,2) NOT NULL,
  balance_after DECIMAL(12,2) NOT NULL,
  reference_id VARCHAR(100), -- Shipment ID, payout ID, etc.
  description TEXT,
  created_by VARCHAR(50), -- Admin ID for manual adjustments
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_wallet_admin FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_wallet_ledger_user ON wallet_ledger(user_id, created_at DESC);
CREATE INDEX idx_wallet_ledger_type ON wallet_ledger(transaction_type);
CREATE INDEX idx_wallet_ledger_reference ON wallet_ledger(reference_id);

CREATE TABLE IF NOT EXISTS payout_batches (
  id VARCHAR(50) PRIMARY KEY,
  batch_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'preview' CHECK (status IN ('preview', 'approved', 'processing', 'completed', 'failed')),
  total_amount DECIMAL(14,2) NOT NULL,
  total_count INTEGER NOT NULL,
  preview_csv_url TEXT,
  final_csv_url TEXT,
  approved_by VARCHAR(50),
  approved_at TIMESTAMPTZ,
  processed_by VARCHAR(50),
  processed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_payout_approver FOREIGN KEY (approved_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payout_items (
  id BIGSERIAL PRIMARY KEY,
  batch_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  user_type VARCHAR(20) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  bank_account VARCHAR(100),
  ifsc VARCHAR(11),
  utr_number VARCHAR(50), -- Bank transaction reference
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  
  CONSTRAINT fk_payout_batch FOREIGN KEY (batch_id) REFERENCES payout_batches(id) ON DELETE CASCADE
);

CREATE INDEX idx_payout_items_batch ON payout_items(batch_id);
CREATE INDEX idx_payout_items_user ON payout_items(user_id);

-- ============================================================================
-- ODOO INTEGRATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS odoo_mappings (
  id VARCHAR(50) PRIMARY KEY,
  mapping_type VARCHAR(50) NOT NULL, -- ACCOUNT_CODE, TAX_RULE, PAYMENT_METHOD
  rodistaa_value VARCHAR(100) NOT NULL,
  odoo_value VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS odoo_sync_log (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- INVOICE_PUSHED, PAYOUT_PUSHED, RECONCILIATION_RECEIVED
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('push', 'pull')),
  payload JSONB NOT NULL,
  odoo_response JSONB,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_odoo_sync_status ON odoo_sync_log(status, created_at DESC);
CREATE INDEX idx_odoo_sync_type ON odoo_sync_log(event_type);

-- ============================================================================
-- FEATURE FLAGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id VARCHAR(50) PRIMARY KEY,
  flag_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_regions TEXT[],
  target_users TEXT[],
  config JSONB DEFAULT '{}',
  created_by VARCHAR(50),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_flag_creator FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS maintenance_mode (
  id SERIAL PRIMARY KEY,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  message TEXT,
  whitelisted_admins TEXT[],
  started_by VARCHAR(50),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

-- ============================================================================
-- API KEYS & WEBHOOKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
  id VARCHAR(50) PRIMARY KEY,
  key_name VARCHAR(100) NOT NULL,
  api_key_hash VARCHAR(255) NOT NULL UNIQUE,
  api_key_prefix VARCHAR(20) NOT NULL, -- First few chars for identification
  scopes TEXT[] NOT NULL DEFAULT '{}',
  rate_limit_per_min INTEGER DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_by VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_apikey_creator FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_api_keys_hash ON api_keys(api_key_hash);
CREATE INDEX idx_api_keys_active ON api_keys(is_active, expires_at);

CREATE TABLE IF NOT EXISTS webhook_delivery_logs (
  id BIGSERIAL PRIMARY KEY,
  webhook_id VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  response_code INTEGER,
  response_body TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'retrying')),
  retry_count INTEGER NOT NULL DEFAULT 0,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_webhook_delivery FOREIGN KEY (webhook_id) REFERENCES webhook_subscriptions(id) ON DELETE CASCADE
);

CREATE INDEX idx_webhook_delivery_status ON webhook_delivery_logs(status, created_at DESC);

-- ============================================================================
-- SCHEDULED REPORTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS scheduled_reports (
  id VARCHAR(50) PRIMARY KEY,
  report_name VARCHAR(100) NOT NULL,
  report_type VARCHAR(50) NOT NULL, -- FRAUD_DIGEST, PAYOUTS, OPERATOR_PERFORMANCE
  schedule_cron VARCHAR(100) NOT NULL, -- Cron expression
  recipients TEXT[] NOT NULL, -- Email addresses
  filters JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_by VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_report_creator FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS report_executions (
  id BIGSERIAL PRIMARY KEY,
  report_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  file_url TEXT,
  row_count INTEGER,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  
  CONSTRAINT fk_report_execution FOREIGN KEY (report_id) REFERENCES scheduled_reports(id) ON DELETE CASCADE
);

-- ============================================================================
-- EXPORT JOBS (Enhanced from fleet module)
-- ============================================================================

CREATE TABLE IF NOT EXISTS export_jobs (
  export_id VARCHAR(50) PRIMARY KEY,
  admin_id VARCHAR(50) NOT NULL,
  export_type VARCHAR(50) NOT NULL, -- trucks, operators, trips, payouts, fraud
  format VARCHAR(10) NOT NULL CHECK (format IN ('csv', 'xlsx', 'pdf')),
  filename VARCHAR(255) NOT NULL,
  filepath TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  size_bytes BIGINT,
  row_count INTEGER,
  include_pii BOOLEAN NOT NULL DEFAULT FALSE,
  filters JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  downloaded_at TIMESTAMPTZ,
  
  CONSTRAINT fk_export_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_export_jobs_admin ON export_jobs(admin_id, created_at DESC);
CREATE INDEX idx_export_jobs_status ON export_jobs(status);
CREATE INDEX idx_export_jobs_expires ON export_jobs(expires_at) WHERE status = 'completed';

-- ============================================================================
-- USER IMPERSONATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS impersonation_sessions (
  id BIGSERIAL PRIMARY KEY,
  admin_id VARCHAR(50) NOT NULL,
  target_user_id VARCHAR(50) NOT NULL,
  target_user_type VARCHAR(20) NOT NULL,
  reason TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  ip_address INET,
  session_token VARCHAR(255) UNIQUE,
  
  CONSTRAINT fk_impersonation_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_impersonation_admin ON impersonation_sessions(admin_id, started_at DESC);
CREATE INDEX idx_impersonation_target ON impersonation_sessions(target_user_id);
CREATE INDEX idx_impersonation_active ON impersonation_sessions(ended_at) WHERE ended_at IS NULL;

-- ============================================================================
-- NOTIFICATION TEMPLATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_templates (
  id VARCHAR(50) PRIMARY KEY,
  template_name VARCHAR(100) NOT NULL UNIQUE,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'whatsapp')),
  subject VARCHAR(255), -- For email
  body_template TEXT NOT NULL, -- With variables like {{name}}, {{amount}}
  variables TEXT[] NOT NULL DEFAULT '{}', -- List of available variables
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by VARCHAR(50),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_template_creator FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- ============================================================================
-- DATA DELETION TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS deletion_requests (
  id VARCHAR(50) PRIMARY KEY,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255) NOT NULL,
  deletion_type VARCHAR(20) NOT NULL CHECK (deletion_type IN ('soft', 'hard')),
  reason TEXT NOT NULL,
  requested_by VARCHAR(50) NOT NULL,
  approved_by VARCHAR(50),
  executed_at TIMESTAMPTZ,
  backup_location TEXT, -- Export before deletion
  confirmation_code VARCHAR(50), -- Typed confirmation for hard delete
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_deletion_requester FOREIGN KEY (requested_by) REFERENCES admin_users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_deletion_approver FOREIGN KEY (approved_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- ============================================================================
-- SYSTEM HEALTH & MONITORING
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_health_checks (
  id BIGSERIAL PRIMARY KEY,
  service_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
  response_time_ms INTEGER,
  error_message TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_health_checks_service ON system_health_checks(service_name, checked_at DESC);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE admin_roles IS 'Dynamic role definitions with hierarchy and regional scoping';
COMMENT ON TABLE kyc_queue IS 'Central KYC approval queue for all user types';
COMMENT ON TABLE pii_access_logs IS 'Audit trail for PII viewing with mandatory reason';
COMMENT ON TABLE fraud_alerts IS 'Fraud detection alerts with investigation workflow';
COMMENT ON TABLE fraud_detection_rules IS 'Configurable fraud detection rules';
COMMENT ON TABLE admin_overrides IS 'Admin data overrides with reason tracking';
COMMENT ON TABLE wallet_ledger IS 'Complete wallet transaction history';
COMMENT ON TABLE payout_batches IS 'Payout batches with approval workflow';
COMMENT ON TABLE odoo_sync_log IS 'Odoo integration event log';
COMMENT ON TABLE feature_flags IS 'Feature flag management with targeting';
COMMENT ON TABLE api_keys IS 'API key lifecycle management';
COMMENT ON TABLE impersonation_sessions IS 'User impersonation audit trail';
COMMENT ON TABLE notification_templates IS 'Editable notification templates';
COMMENT ON TABLE deletion_requests IS 'Soft/hard deletion tracking';
COMMENT ON TABLE export_jobs IS 'Async export job queue';

