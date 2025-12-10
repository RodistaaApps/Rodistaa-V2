-- Migration: Ticket Management System
-- Created: 2025-12-05
-- Purpose: Complete ticketing system for support, operations, and compliance

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE ticket_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE ticket_status AS ENUM (
  'NEW', 'OPEN', 'IN_PROGRESS', 
  'AWAITING_SHIPPER', 'AWAITING_OPERATOR', 'AWAITING_FRANCHISE', 'AWAITING_FINANCE',
  'RESOLVED', 'CLOSED', 'ESCALATED', 'REOPENED'
);
CREATE TYPE ticket_linked_type AS ENUM (
  'booking', 'shipment', 'user', 'truck', 'operator', 'franchise', 'document', 'payment'
);

-- ============================================================================
-- SLA CONFIGURATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS sla_config (
  id VARCHAR(50) PRIMARY KEY,
  priority ticket_priority NOT NULL UNIQUE,
  response_time_minutes INTEGER NOT NULL,
  resolution_time_minutes INTEGER NOT NULL,
  escalation_chain JSONB NOT NULL, -- Array of roles: ["ops_agent", "ops_manager", "hq_support"]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default SLA policies
INSERT INTO sla_config (id, priority, response_time_minutes, resolution_time_minutes, escalation_chain) VALUES
  ('SLA-LOW', 'LOW', 1440, 4320, '["franchise_agent", "ops_manager", "regional_manager"]'),
  ('SLA-MEDIUM', 'MEDIUM', 480, 2880, '["ops_agent", "ops_manager", "regional_manager"]'),
  ('SLA-HIGH', 'HIGH', 120, 1440, '["ops_manager", "regional_manager", "hq_support"]'),
  ('SLA-CRITICAL', 'CRITICAL', 30, 240, '["hq_support", "regional_manager", "ceo_oncall"]')
ON CONFLICT (priority) DO UPDATE SET
  response_time_minutes = EXCLUDED.response_time_minutes,
  resolution_time_minutes = EXCLUDED.resolution_time_minutes,
  escalation_chain = EXCLUDED.escalation_chain,
  updated_at = NOW();

-- ============================================================================
-- TICKETS
-- ============================================================================

CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  
  -- Creator info
  created_by_id VARCHAR(50) NOT NULL,
  created_by_role VARCHAR(50) NOT NULL,
  
  -- Assignment
  owner_id VARCHAR(50), -- Current assignee (nullable)
  owner_role VARCHAR(50), -- Current assignment group
  assigned_franchise_id VARCHAR(50),
  
  -- Priority & Status
  priority ticket_priority NOT NULL DEFAULT 'MEDIUM',
  status ticket_status NOT NULL DEFAULT 'NEW',
  severity VARCHAR(20), -- For ACS-related tickets
  
  -- Linked entities
  linked_type ticket_linked_type,
  linked_id VARCHAR(50),
  
  -- SLA tracking
  sla_due_at TIMESTAMPTZ,
  sla_escalation_level INTEGER NOT NULL DEFAULT 0,
  sla_breached BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  resolution_summary TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Indexes for tickets
CREATE INDEX idx_tickets_status ON tickets(status, created_at DESC);
CREATE INDEX idx_tickets_priority ON tickets(priority, sla_due_at ASC);
CREATE INDEX idx_tickets_owner ON tickets(owner_id, status);
CREATE INDEX idx_tickets_owner_role ON tickets(owner_role, status);
CREATE INDEX idx_tickets_franchise ON tickets(assigned_franchise_id) WHERE assigned_franchise_id IS NOT NULL;
CREATE INDEX idx_tickets_linked ON tickets(linked_type, linked_id) WHERE linked_type IS NOT NULL;
CREATE INDEX idx_tickets_sla_due ON tickets(sla_due_at ASC) WHERE status NOT IN ('RESOLVED', 'CLOSED') AND sla_due_at IS NOT NULL;
CREATE INDEX idx_tickets_creator ON tickets(created_by_id);
CREATE INDEX idx_tickets_search ON tickets USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_tickets_archived ON tickets(archived) WHERE archived = FALSE;

-- ============================================================================
-- TICKET MESSAGES (Timeline / Comments)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ticket_messages (
  id BIGSERIAL PRIMARY KEY,
  ticket_id VARCHAR(50) NOT NULL,
  actor_id VARCHAR(50) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}', -- URLs to attachments
  is_internal_note BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_ticket_messages_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id, created_at DESC);
CREATE INDEX idx_ticket_messages_actor ON ticket_messages(actor_id);

-- ============================================================================
-- TICKET AUDIT (History)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ticket_audit (
  id BIGSERIAL PRIMARY KEY,
  ticket_id VARCHAR(50) NOT NULL,
  actor_id VARCHAR(50) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL, -- CREATED, ASSIGNED, STATUS_CHANGED, PRIORITY_CHANGED, ESCALATED, etc.
  payload JSONB NOT NULL DEFAULT '{}',
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_ticket_audit_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

CREATE INDEX idx_ticket_audit_ticket ON ticket_audit(ticket_id, created_at DESC);
CREATE INDEX idx_ticket_audit_action ON ticket_audit(action);
CREATE INDEX idx_ticket_audit_actor ON ticket_audit(actor_id);
CREATE INDEX idx_ticket_audit_created ON ticket_audit(created_at DESC);

-- ============================================================================
-- TICKET WATCHERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ticket_watchers (
  id BIGSERIAL PRIMARY KEY,
  ticket_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  notify_email BOOLEAN NOT NULL DEFAULT TRUE,
  notify_push BOOLEAN NOT NULL DEFAULT TRUE,
  notify_sms BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_ticket_watchers_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  UNIQUE(ticket_id, user_id)
);

CREATE INDEX idx_ticket_watchers_ticket ON ticket_watchers(ticket_id);
CREATE INDEX idx_ticket_watchers_user ON ticket_watchers(user_id);

-- ============================================================================
-- TICKET ATTACHMENTS (Linking to documents)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ticket_attachments (
  id VARCHAR(50) PRIMARY KEY,
  ticket_id VARCHAR(50) NOT NULL,
  uploaded_by_id VARCHAR(50) NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL, -- MinIO signed URL or S3 URL
  file_type VARCHAR(100),
  file_size_bytes BIGINT,
  is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_ticket_attachments_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

CREATE INDEX idx_ticket_attachments_ticket ON ticket_attachments(ticket_id, created_at DESC);

-- ============================================================================
-- TICKET EXPORT JOBS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ticket_export_jobs (
  id VARCHAR(50) PRIMARY KEY,
  requested_by_id VARCHAR(50) NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  file_url TEXT,
  error_message TEXT,
  total_records INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_ticket_export_jobs_user ON ticket_export_jobs(requested_by_id);
CREATE INDEX idx_ticket_export_jobs_status ON ticket_export_jobs(status, created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at for tickets
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for sla_config
CREATE TRIGGER update_sla_config_updated_at BEFORE UPDATE ON sla_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create audit entry on ticket status change
CREATE OR REPLACE FUNCTION log_ticket_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO ticket_audit (ticket_id, actor_id, actor_role, action, payload, created_at)
    VALUES (
      NEW.id,
      'SYSTEM',
      'system',
      'STATUS_CHANGED',
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status),
      NOW()
    );
  END IF;
  
  IF OLD.owner_id IS DISTINCT FROM NEW.owner_id OR OLD.owner_role IS DISTINCT FROM NEW.owner_role THEN
    INSERT INTO ticket_audit (ticket_id, actor_id, actor_role, action, payload, created_at)
    VALUES (
      NEW.id,
      'SYSTEM',
      'system',
      'ASSIGNED',
      jsonb_build_object(
        'old_owner_id', OLD.owner_id,
        'new_owner_id', NEW.owner_id,
        'old_owner_role', OLD.owner_role,
        'new_owner_role', NEW.owner_role
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_status_change AFTER UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION log_ticket_status_change();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Calculate SLA due date based on priority
CREATE OR REPLACE FUNCTION calculate_sla_due_at(
  p_priority ticket_priority,
  p_created_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_resolution_minutes INTEGER;
BEGIN
  SELECT resolution_time_minutes INTO v_resolution_minutes
  FROM sla_config
  WHERE priority = p_priority;
  
  RETURN p_created_at + (v_resolution_minutes || ' minutes')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Get SLA status for a ticket
CREATE OR REPLACE FUNCTION get_sla_status(
  p_sla_due_at TIMESTAMPTZ,
  p_status ticket_status
)
RETURNS TEXT AS $$
DECLARE
  v_time_left INTERVAL;
  v_total_time INTERVAL;
  v_percent_remaining NUMERIC;
BEGIN
  -- If ticket is resolved/closed, SLA is met
  IF p_status IN ('RESOLVED', 'CLOSED') THEN
    RETURN 'completed';
  END IF;
  
  -- If no SLA set
  IF p_sla_due_at IS NULL THEN
    RETURN 'no_sla';
  END IF;
  
  -- Calculate time left
  v_time_left := p_sla_due_at - NOW();
  
  -- If breached
  IF v_time_left < INTERVAL '0' THEN
    RETURN 'breached';
  END IF;
  
  -- Calculate percent remaining (assuming 24-hour total for LOW priority as baseline)
  v_total_time := p_sla_due_at - (NOW() - INTERVAL '24 hours');
  v_percent_remaining := EXTRACT(EPOCH FROM v_time_left) / EXTRACT(EPOCH FROM v_total_time) * 100;
  
  -- If less than 20% remaining
  IF v_percent_remaining <= 20 THEN
    RETURN 'near_breach';
  END IF;
  
  RETURN 'on_track';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE tickets IS 'Ticket management system for support, operations, and compliance';
COMMENT ON TABLE ticket_messages IS 'Timeline messages and comments for tickets';
COMMENT ON TABLE ticket_audit IS 'Immutable audit trail for all ticket changes';
COMMENT ON TABLE ticket_watchers IS 'Users watching tickets for notifications';
COMMENT ON TABLE sla_config IS 'SLA policies by priority level';

