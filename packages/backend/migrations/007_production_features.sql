-- ============================================================================
-- Rodistaa Platform - Production-Grade Features
-- Migration: 007_production_features.sql
-- Description: Audit Logs, API Keys, Webhooks, Feature Flags, Admin Settings
-- Created: December 4, 2025
-- General Platform Features Training Spec Compliance
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. AUDIT LOGS (Immutable Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id VARCHAR(100) UNIQUE NOT NULL, -- AUDIT-<ulid>
  
  -- Actor (who performed the action)
  actor_id VARCHAR(255) NOT NULL REFERENCES users(id),
  actor_role VARCHAR(32) NOT NULL,
  actor_ip VARCHAR(45), -- IPv4 or IPv6
  
  -- Action details
  action VARCHAR(100) NOT NULL, -- APPROVE_KYC, BLOCK_TRUCK, WAIVE_FEE, etc.
  resource_type VARCHAR(50) NOT NULL, -- TRUCK, KYC, PAYMENT, etc.
  resource_id VARCHAR(255),
  
  -- Change delta (before → after)
  delta JSONB, -- { before: {...}, after: {...} }
  
  -- Reason (mandatory for admin actions)
  reason TEXT,
  
  -- Metadata
  metadata JSONB,
  user_agent TEXT,
  
  -- Timestamp (immutable)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_action CHECK (action IN (
    'LOGIN', 'LOGOUT', 'VIEW_PII', 'APPROVE_KYC', 'REJECT_KYC', 'REVOKE_KYC',
    'BLOCK_TRUCK', 'UNBLOCK_TRUCK', 'BLOCK_USER', 'UNBLOCK_USER',
    'WAIVE_FEE', 'ADJUST_WALLET', 'APPROVE_PAYOUT', 'REJECT_PAYOUT',
    'FORCE_STN_RELEASE', 'OVERRIDE_CTL', 'APPROVE_CYR', 'REJECT_CYR',
    'CREATE_ROLE', 'EDIT_ROLE', 'ASSIGN_ROLE', 'REVOKE_ROLE',
    'CREATE_USER', 'EDIT_USER', 'DELETE_USER', 'LOGIN_AS',
    'EXPORT_DATA', 'BULK_ACTION', 'RUN_SCRIPT', 'TOGGLE_MAINTENANCE',
    'CREATE_FEATURE_FLAG', 'EDIT_FEATURE_FLAG', 'CREATE_API_KEY', 'REVOKE_API_KEY',
    'CREATE_WEBHOOK', 'DELETE_WEBHOOK', 'EDIT_SETTINGS'
  )),
  CONSTRAINT valid_resource_type CHECK (resource_type IN (
    'TRUCK', 'KYC', 'PAYMENT', 'BOOKING', 'SHIPMENT', 'BID', 'USER',
    'ROLE', 'API_KEY', 'WEBHOOK', 'FEATURE_FLAG', 'SETTINGS', 'SCRIPT'
  ))
);

-- Indexes for fast queries (audit logs grow large)
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Make table append-only (no UPDATE or DELETE allowed except by superuser)
CREATE OR REPLACE FUNCTION prevent_audit_modification() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_update
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

COMMENT ON TABLE audit_logs IS 'Immutable audit trail for all admin and sensitive actions';

-- ============================================================================
-- 2. API KEYS (Partner & Internal Access)
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id VARCHAR(100) UNIQUE NOT NULL, -- KEY-<ulid>
  
  -- Key details
  key_hash VARCHAR(255) NOT NULL UNIQUE, -- bcrypt hash of actual key
  key_prefix VARCHAR(20) NOT NULL, -- First 8 chars for display (e.g., "rod_live_1234...")
  
  -- Owner
  created_by VARCHAR(255) NOT NULL REFERENCES users(id),
  label VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Scope & permissions
  scope VARCHAR(32) DEFAULT 'READ_ONLY', -- READ_ONLY, READ_WRITE, ADMIN
  allowed_endpoints TEXT[], -- Specific endpoints allowed, null = all
  
  -- Rate limiting
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_day INTEGER DEFAULT 10000,
  
  -- Usage tracking
  last_used_at TIMESTAMPTZ,
  total_requests BIGINT DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_scope CHECK (scope IN ('READ_ONLY', 'READ_WRITE', 'ADMIN', 'WEBHOOK_ONLY'))
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_created_by ON api_keys(created_by);
CREATE INDEX idx_api_keys_active ON api_keys(is_active, expires_at);

-- ============================================================================
-- 3. API KEY USAGE (for rate limiting & analytics)
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_key_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  
  -- Request details
  endpoint VARCHAR(200) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  
  -- Timing
  response_time_ms INTEGER,
  
  -- Client
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partitioned by date for performance
CREATE INDEX idx_api_key_usage_key ON api_key_usage(api_key_id, created_at DESC);
CREATE INDEX idx_api_key_usage_date ON api_key_usage(created_at DESC);

-- ============================================================================
-- 4. WEBHOOKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id VARCHAR(100) UNIQUE NOT NULL,
  
  -- Owner
  created_by VARCHAR(255) NOT NULL REFERENCES users(id),
  label VARCHAR(200) NOT NULL,
  
  -- Endpoint
  url TEXT NOT NULL,
  secret VARCHAR(255), -- HMAC signing secret
  
  -- Events subscription
  events TEXT[] NOT NULL, -- ['BID_WON', 'TRIP_STARTED', 'POD_UPLOADED', etc.]
  
  -- Retry policy
  max_retries INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  total_deliveries BIGINT DEFAULT 0,
  total_failures BIGINT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhooks_created_by ON webhooks(created_by);
CREATE INDEX idx_webhooks_active ON webhooks(is_active);

-- ============================================================================
-- 5. WEBHOOK DELIVERY LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  
  -- Event
  event_type VARCHAR(50) NOT NULL,
  event_id VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  
  -- Delivery attempt
  attempt_number INTEGER DEFAULT 1,
  status VARCHAR(32) NOT NULL, -- PENDING, SUCCESS, FAILED, RETRYING
  
  -- Response
  status_code INTEGER,
  response_body TEXT,
  error_message TEXT,
  
  -- Timing
  sent_at TIMESTAMPTZ,
  response_time_ms INTEGER,
  
  -- Retry
  next_retry_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_delivery_status CHECK (status IN (
    'PENDING', 'SUCCESS', 'FAILED', 'RETRYING', 'ABANDONED'
  ))
);

CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id, created_at DESC);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status, next_retry_at);
CREATE INDEX idx_webhook_deliveries_event ON webhook_deliveries(event_type, event_id);

-- ============================================================================
-- 6. FEATURE FLAGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key VARCHAR(100) UNIQUE NOT NULL, -- snake_case key
  
  -- Flag details
  label VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Targeting
  enabled BOOLEAN DEFAULT FALSE,
  enabled_regions TEXT[], -- District codes: ['KNL', 'VJA', etc.]
  enabled_for_users VARCHAR(255)[], -- Specific user IDs
  rollout_percentage INTEGER DEFAULT 0, -- 0-100
  
  -- Type
  flag_type VARCHAR(32) DEFAULT 'BOOLEAN', -- BOOLEAN, STRING, NUMBER, JSON
  default_value TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_by VARCHAR(255) REFERENCES users(id),
  last_modified_by VARCHAR(255) REFERENCES users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_rollout CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  CONSTRAINT valid_flag_type CHECK (flag_type IN ('BOOLEAN', 'STRING', 'NUMBER', 'JSON'))
);

CREATE INDEX idx_feature_flags_key ON feature_flags(flag_key);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(enabled, is_active);

-- ============================================================================
-- 7. FEATURE FLAG HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_flag_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  
  -- Change details
  changed_by VARCHAR(255) NOT NULL REFERENCES users(id),
  change_type VARCHAR(32) NOT NULL, -- CREATED, ENABLED, DISABLED, UPDATED, DELETED
  
  -- Delta
  old_value JSONB,
  new_value JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_change_type CHECK (change_type IN (
    'CREATED', 'ENABLED', 'DISABLED', 'UPDATED', 'DELETED', 'ROLLOUT_CHANGED'
  ))
);

CREATE INDEX idx_feature_flag_history_flag ON feature_flag_history(flag_id, created_at DESC);

-- ============================================================================
-- 8. ADMIN SETTINGS (Platform Configuration)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  
  -- Value
  setting_value TEXT NOT NULL,
  value_type VARCHAR(32) DEFAULT 'STRING', -- STRING, NUMBER, BOOLEAN, JSON
  
  -- Metadata
  label VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- PAYMENT, TRACKING, COMPLIANCE, SYSTEM, etc.
  
  -- Validation
  validation_rules JSONB, -- { min: 0, max: 100, regex: "...", enum: [...] }
  
  -- Access control
  requires_2fa BOOLEAN DEFAULT FALSE,
  requires_reason BOOLEAN DEFAULT FALSE,
  
  -- History
  last_modified_by VARCHAR(255) REFERENCES users(id),
  last_modified_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_value_type CHECK (value_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON')),
  CONSTRAINT valid_category CHECK (category IN (
    'PAYMENT', 'TRACKING', 'COMPLIANCE', 'SYSTEM', 'FRAUD', 'NOTIFICATION', 'REGIONAL'
  ))
);

CREATE INDEX idx_admin_settings_key ON admin_settings(setting_key);
CREATE INDEX idx_admin_settings_category ON admin_settings(category);

-- ============================================================================
-- 9. ADMIN SETTINGS HISTORY (Versioning)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_settings_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_id UUID NOT NULL REFERENCES admin_settings(id) ON DELETE CASCADE,
  
  -- Change
  changed_by VARCHAR(255) NOT NULL REFERENCES users(id),
  old_value TEXT,
  new_value TEXT NOT NULL,
  reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_settings_history_setting ON admin_settings_history(setting_id, created_at DESC);

-- ============================================================================
-- 10. DYNAMIC ROLES (Admin RBAC)
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key VARCHAR(100) UNIQUE NOT NULL,
  
  -- Role details
  role_name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Hierarchy
  parent_role_id UUID REFERENCES roles(id),
  level INTEGER DEFAULT 0, -- 0 = top level, higher = more restricted
  
  -- Status
  is_system_role BOOLEAN DEFAULT FALSE, -- System roles cannot be deleted
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_by VARCHAR(255) REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_roles_key ON roles(role_key);
CREATE INDEX idx_roles_parent ON roles(parent_role_id);

-- ============================================================================
-- 11. PERMISSIONS (Granular Permission Matrix)
-- ============================================================================

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_key VARCHAR(100) UNIQUE NOT NULL,
  
  -- Permission details
  resource VARCHAR(50) NOT NULL, -- TRUCK, KYC, PAYMENT, etc.
  action VARCHAR(50) NOT NULL, -- CREATE, READ, UPDATE, DELETE, APPROVE, EXPORT, etc.
  
  -- Description
  label VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Risk level
  risk_level VARCHAR(16) DEFAULT 'LOW', -- LOW, MEDIUM, HIGH, CRITICAL
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_permission UNIQUE (resource, action),
  CONSTRAINT valid_risk_level CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

CREATE INDEX idx_permissions_resource ON permissions(resource);

-- ============================================================================
-- 12. ROLE PERMISSIONS (Many-to-Many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  
  -- Grant details
  granted_by VARCHAR(255) REFERENCES users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_role_permission UNIQUE (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- ============================================================================
-- 13. USER ROLES (Many-to-Many with expiry)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  
  -- Assignment details
  assigned_by VARCHAR(255) REFERENCES users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Expiry
  expires_at TIMESTAMPTZ,
  
  -- Region scope (for franchise roles)
  region_districts TEXT[], -- null = global
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT,
  
  CONSTRAINT unique_user_role UNIQUE (user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id, is_active);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_expiry ON user_roles(expires_at);

-- ============================================================================
-- 14. EXPORT JOBS (Async CSV/XLSX Generation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id VARCHAR(100) UNIQUE NOT NULL,
  
  -- Job details
  export_type VARCHAR(50) NOT NULL, -- TRUCKS, BOOKINGS, SHIPMENTS, PAYOUTS, etc.
  format VARCHAR(10) DEFAULT 'CSV', -- CSV, XLSX, JSON
  
  -- Requester
  requested_by VARCHAR(255) NOT NULL REFERENCES users(id),
  
  -- Filters applied
  filters JSONB,
  
  -- Status
  status VARCHAR(32) DEFAULT 'PENDING',
  
  -- Results
  total_rows INTEGER,
  file_url TEXT, -- S3 URL or local path
  file_size_bytes BIGINT,
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- Download link expiry
  
  -- Error
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_export_type CHECK (export_type IN (
    'TRUCKS', 'DRIVERS', 'OPERATORS', 'SHIPPERS', 'BOOKINGS', 'BIDS',
    'SHIPMENTS', 'PAYMENTS', 'PAYOUTS', 'FRAUD_ALERTS', 'AUDIT_LOGS',
    'CTL', 'STN', 'CYR', 'KYC_RECORDS'
  )),
  CONSTRAINT valid_export_status CHECK (status IN (
    'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED'
  )),
  CONSTRAINT valid_format CHECK (format IN ('CSV', 'XLSX', 'JSON'))
);

CREATE INDEX idx_export_jobs_requested ON export_jobs(requested_by, created_at DESC);
CREATE INDEX idx_export_jobs_status ON export_jobs(status);

COMMIT;

-- ============================================================================
-- Migration Complete: Production-Grade Features (Part 1)
-- ============================================================================

