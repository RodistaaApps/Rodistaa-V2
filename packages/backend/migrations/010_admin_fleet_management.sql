-- Migration: Admin Fleet Management Portal Schema
-- Created: 2025-12-05
-- Purpose: Support admin fleet management, audit logging, ticketing, and RBAC

-- ============================================================================
-- ADMIN USERS & RBAC
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('SuperAdmin', 'ComplianceOfficer', 'OpsManager', 'ReadOnlyAnalyst')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  password_hash VARCHAR(255) NOT NULL,
  totp_secret VARCHAR(100), -- For 2FA
  last_login_at TIMESTAMPTZ,
  last_login_ip INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(50),
  
  -- Indexes
  CONSTRAINT fk_admin_users_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_status ON admin_users(status);

-- ============================================================================
-- AUDIT LOGGING (Immutable)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id VARCHAR(50) NOT NULL,
  action_type VARCHAR(100) NOT NULL, -- BLOCK_TRUCK, UNBLOCK_TRUCK, REVERIFY_ENQUEUE, etc.
  resource_type VARCHAR(50) NOT NULL, -- truck, trailer, ticket, operator
  resource_id VARCHAR(255) NOT NULL, -- RC number, ticket ID, etc.
  payload JSONB NOT NULL DEFAULT '{}', -- Action details, reason, evidence_ids
  provider_txn_id VARCHAR(100), -- VAHAN transaction ID if applicable
  txn_id VARCHAR(100) UNIQUE, -- Unique transaction ID for this audit entry
  correlation_id VARCHAR(100), -- For grouping related actions
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_audit_admin_user FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE RESTRICT
);

-- Immutable table - no updates or deletes allowed
CREATE RULE no_update_audit_logs AS ON UPDATE TO admin_audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit_logs AS ON DELETE TO admin_audit_logs DO INSTEAD NOTHING;

-- Indexes for fast queries
CREATE INDEX idx_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX idx_audit_logs_action_type ON admin_audit_logs(action_type);
CREATE INDEX idx_audit_logs_resource ON admin_audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_txn_id ON admin_audit_logs(txn_id);
CREATE INDEX idx_audit_logs_correlation ON admin_audit_logs(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX idx_audit_logs_payload_gin ON admin_audit_logs USING GIN (payload);

-- ============================================================================
-- NOTIFICATIONS & ALERTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_notifications (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- SLA_BREACH, PROVIDER_OUTAGE, DUPLICATE_CHASSIS, BLOCKING_EVENT
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  payload JSONB DEFAULT '{}',
  target_admin_id VARCHAR(50), -- Null = broadcast to all
  read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  action_url VARCHAR(500), -- Deep link to relevant resource
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Auto-hide after this time
  
  CONSTRAINT fk_notification_admin FOREIGN KEY (target_admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_admin ON admin_notifications(target_admin_id);
CREATE INDEX idx_notifications_read ON admin_notifications(read, created_at DESC);
CREATE INDEX idx_notifications_type ON admin_notifications(type);
CREATE INDEX idx_notifications_severity ON admin_notifications(severity);

-- ============================================================================
-- SAVED FILTERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_saved_filters (
  id VARCHAR(50) PRIMARY KEY,
  admin_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  filter_json JSONB NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE, -- Can other admins see this filter?
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_saved_filter_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  CONSTRAINT unique_filter_name_per_admin UNIQUE (admin_id, name)
);

CREATE INDEX idx_saved_filters_admin ON admin_saved_filters(admin_id);
CREATE INDEX idx_saved_filters_public ON admin_saved_filters(is_public) WHERE is_public = TRUE;

-- ============================================================================
-- TICKETS & SLA MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS hq_tickets (
  id VARCHAR(50) PRIMARY KEY,
  ticket_type VARCHAR(50) NOT NULL, -- PROVIDER_MISMATCH, DUPLICATE_CHASSIS, MANUAL_REVIEW, DISPUTE
  priority VARCHAR(5) NOT NULL CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED', 'CLOSED')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Resource references
  resource_type VARCHAR(50) NOT NULL, -- truck, operator, shipment
  resource_id VARCHAR(255) NOT NULL, -- RC number, operator ID
  
  -- Assignments
  created_by VARCHAR(50) NOT NULL, -- admin_id or 'SYSTEM'
  assigned_to VARCHAR(50), -- admin_id
  resolved_by VARCHAR(50), -- admin_id
  
  -- SLA tracking
  sla_due_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ,
  
  -- Resolution
  resolution TEXT,
  resolution_type VARCHAR(50), -- APPROVED, REJECTED, FIXED, NO_ACTION_NEEDED
  
  -- Metadata
  metadata JSONB DEFAULT '{}', -- Provider diffs, evidence, etc.
  tags TEXT[], -- For categorization
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_ticket_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ticket_assigned_to FOREIGN KEY (assigned_to) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_ticket_resolved_by FOREIGN KEY (resolved_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_tickets_status ON hq_tickets(status);
CREATE INDEX idx_tickets_priority ON hq_tickets(priority);
CREATE INDEX idx_tickets_assigned_to ON hq_tickets(assigned_to);
CREATE INDEX idx_tickets_sla ON hq_tickets(sla_due_at) WHERE status IN ('OPEN', 'IN_PROGRESS');
CREATE INDEX idx_tickets_resource ON hq_tickets(resource_type, resource_id);
CREATE INDEX idx_tickets_created_at ON hq_tickets(created_at DESC);
CREATE INDEX idx_tickets_tags_gin ON hq_tickets USING GIN (tags);

-- ============================================================================
-- TICKET COMMENTS / ACTIVITY LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS ticket_comments (
  id BIGSERIAL PRIMARY KEY,
  ticket_id VARCHAR(50) NOT NULL,
  admin_id VARCHAR(50) NOT NULL,
  comment TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE, -- Internal notes vs customer-facing
  attachments JSONB DEFAULT '[]', -- Array of file URLs
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_comment_ticket FOREIGN KEY (ticket_id) REFERENCES hq_tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_ticket_comments_ticket ON ticket_comments(ticket_id, created_at DESC);

-- ============================================================================
-- FLEET ANALYTICS CACHE (for dashboard performance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fleet_analytics_cache (
  metric_key VARCHAR(100) PRIMARY KEY,
  metric_value JSONB NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_analytics_cache_expires ON fleet_analytics_cache(expires_at);

-- ============================================================================
-- TRAILER LINKS (for tractor-trailer pairing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS trailer_links (
  id VARCHAR(50) PRIMARY KEY,
  tractor_rc VARCHAR(20) NOT NULL,
  trailer_rc VARCHAR(20) NOT NULL,
  linked_by VARCHAR(50) NOT NULL,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlinked_by VARCHAR(50),
  unlinked_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  metadata JSONB DEFAULT '{}',
  
  CONSTRAINT fk_trailer_link_linked_by FOREIGN KEY (linked_by) REFERENCES admin_users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_trailer_link_unlinked_by FOREIGN KEY (unlinked_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT unique_active_link UNIQUE (tractor_rc, trailer_rc, status) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX idx_trailer_links_tractor ON trailer_links(tractor_rc);
CREATE INDEX idx_trailer_links_trailer ON trailer_links(trailer_rc);
CREATE INDEX idx_trailer_links_status ON trailer_links(status);

-- ============================================================================
-- WEBHOOK SUBSCRIPTIONS (for real-time updates)
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id VARCHAR(50) PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL, -- truck.verified, truck.blocked, ticket.created
  endpoint_url VARCHAR(500) NOT NULL,
  secret VARCHAR(255) NOT NULL, -- For HMAC verification
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhooks_event_type ON webhook_subscriptions(event_type) WHERE is_active = TRUE;

-- ============================================================================
-- DATA RETENTION & CLEANUP
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_retention_policies (
  resource_type VARCHAR(50) PRIMARY KEY,
  retention_days INTEGER NOT NULL,
  last_cleanup_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO data_retention_policies (resource_type, retention_days) VALUES
  ('audit_logs', 2555), -- 7 years
  ('notifications', 90),
  ('tickets', 1825), -- 5 years
  ('analytics_cache', 7)
ON CONFLICT (resource_type) DO NOTHING;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_filters_updated_at BEFORE UPDATE ON admin_saved_filters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON hq_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate audit txn_id if not provided
CREATE OR REPLACE FUNCTION generate_audit_txn_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.txn_id IS NULL THEN
    NEW.txn_id := 'AUD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_audit_txn_id BEFORE INSERT ON admin_audit_logs
  FOR EACH ROW EXECUTE FUNCTION generate_audit_txn_id();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Create default SuperAdmin (password should be changed on first login)
-- Password: AdminPass123! (hashed with bcrypt)
INSERT INTO admin_users (id, name, email, role, status, password_hash, created_at) VALUES
  ('ADM-001', 'System Administrator', 'admin@rodistaa.com', 'SuperAdmin', 'active', 
   '$2b$10$rQZ9uExO7ON/VKeEEPT5xuJvHXqBpFQJTGUNVpvvF4BCv8rrGPxEy', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- COMMENTS & DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE admin_users IS 'Admin portal users with RBAC roles';
COMMENT ON TABLE admin_audit_logs IS 'Immutable audit trail of all admin actions';
COMMENT ON TABLE admin_notifications IS 'In-app notifications and alerts for admin users';
COMMENT ON TABLE admin_saved_filters IS 'User-saved filter configurations for fleet list';
COMMENT ON TABLE hq_tickets IS 'HQ ticket queue for manual reviews and disputes';
COMMENT ON TABLE ticket_comments IS 'Comments and activity log for tickets';
COMMENT ON TABLE fleet_analytics_cache IS 'Cached analytics metrics for dashboard performance';
COMMENT ON TABLE trailer_links IS 'Tractor-trailer linking relationships';
COMMENT ON TABLE webhook_subscriptions IS 'Webhook endpoints for real-time event notifications';
COMMENT ON TABLE data_retention_policies IS 'Data retention policies for automatic cleanup';

COMMENT ON COLUMN admin_audit_logs.payload IS 'JSON object with action details: {reason, evidence_ids, previous_value, new_value}';
COMMENT ON COLUMN hq_tickets.metadata IS 'JSON object with ticket-specific data: {provider_diffs, confidence_scores, evidence_urls}';

