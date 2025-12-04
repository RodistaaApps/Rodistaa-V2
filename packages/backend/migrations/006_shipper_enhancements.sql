-- ============================================================================
-- Rodistaa Platform - Shipper App Enhancements
-- Migration: 006_shipper_enhancements.sql
-- Description: Gamification, Tickets, Notifications, Settings for Shipper App
-- Created: December 4, 2025
-- Shipper App Training Spec Compliance
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. GAMIFICATION - BADGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS shipper_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id VARCHAR(100) UNIQUE NOT NULL,
  
  -- Shipper
  shipper_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Badge details
  badge_type VARCHAR(32) NOT NULL,
  badge_level VARCHAR(16) NOT NULL, -- BRONZE, SILVER, GOLD, PLATINUM
  
  -- Award details
  awarded_at TIMESTAMPTZ NOT NULL,
  awarded_for_period_start DATE,
  awarded_for_period_end DATE,
  
  -- Criteria met
  shipments_completed INTEGER,
  on_time_percentage DECIMAL(5, 2),
  dispute_rate DECIMAL(5, 2),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_badge_type CHECK (badge_type IN (
    'RELIABILITY', 'VOLUME', 'QUALITY', 'EARLY_ADOPTER', 'SPECIAL'
  )),
  CONSTRAINT valid_badge_level CHECK (badge_level IN (
    'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'
  ))
);

CREATE INDEX idx_shipper_badges_shipper ON shipper_badges(shipper_id, awarded_at DESC);
CREATE INDEX idx_shipper_badges_type ON shipper_badges(badge_type, badge_level);

-- ============================================================================
-- 2. BADGE PROGRESS TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS shipper_badge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipper_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Current period metrics (rolling 30/90/180 days)
  shipments_last_30_days INTEGER DEFAULT 0,
  shipments_last_90_days INTEGER DEFAULT 0,
  shipments_last_180_days INTEGER DEFAULT 0,
  
  -- Quality metrics
  on_time_percentage_30d DECIMAL(5, 2) DEFAULT 0,
  on_time_percentage_90d DECIMAL(5, 2) DEFAULT 0,
  dispute_rate_30d DECIMAL(5, 2) DEFAULT 0,
  dispute_rate_90d DECIMAL(5, 2) DEFAULT 0,
  
  -- Current badge level
  current_badge_level VARCHAR(16) DEFAULT 'NONE',
  
  -- Progress to next badge
  progress_to_next_badge DECIMAL(5, 2) DEFAULT 0,
  next_badge_level VARCHAR(16),
  
  -- Last calculation
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_current_badge CHECK (current_badge_level IN (
    'NONE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'
  ))
);

-- ============================================================================
-- 3. SUPPORT TICKETS
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id VARCHAR(100) UNIQUE NOT NULL, -- TKT-<ulid>
  
  -- Ticket details
  shipper_id VARCHAR(255) NOT NULL REFERENCES users(id),
  shipment_id VARCHAR(255), -- Optional, if related to shipment
  
  -- Category
  category VARCHAR(32) NOT NULL,
  sub_category VARCHAR(64),
  
  -- Content
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  
  -- LLM summary (for admin quick view)
  ai_summary TEXT,
  ai_summary_generated_at TIMESTAMPTZ,
  
  -- Priority (auto-calculated or manual)
  priority VARCHAR(16) DEFAULT 'MEDIUM',
  
  -- Status
  status VARCHAR(32) DEFAULT 'OPEN',
  
  -- Assignment
  assigned_to VARCHAR(255) REFERENCES users(id), -- Admin/support user
  assigned_at TIMESTAMPTZ,
  
  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR(255) REFERENCES users(id),
  resolution_notes TEXT,
  
  -- Escalation
  escalated BOOLEAN DEFAULT FALSE,
  escalated_at TIMESTAMPTZ,
  escalation_reason TEXT,
  
  -- SLA tracking
  response_due_at TIMESTAMPTZ,
  resolution_due_at TIMESTAMPTZ,
  is_overdue BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_ticket_category CHECK (category IN (
    'DELIVERY_ISSUE', 'QUALITY_ISSUE', 'BILLING', 'SAFETY', 'TECHNICAL', 'GENERAL'
  )),
  CONSTRAINT valid_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  CONSTRAINT valid_ticket_status CHECK (status IN (
    'OPEN', 'IN_PROGRESS', 'PENDING_INFO', 'RESOLVED', 'CLOSED', 'ESCALATED'
  ))
);

CREATE INDEX idx_support_tickets_ticket_id ON support_tickets(ticket_id);
CREATE INDEX idx_support_tickets_shipper ON support_tickets(shipper_id, created_at DESC);
CREATE INDEX idx_support_tickets_shipment ON support_tickets(shipment_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status, priority);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_overdue ON support_tickets(is_overdue, status);

-- ============================================================================
-- 4. TICKET ATTACHMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  -- File details
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- image/jpeg, application/pdf, etc.
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL, -- S3 URL or local path
  
  -- Upload details
  uploaded_by VARCHAR(255) NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  is_evidence BOOLEAN DEFAULT TRUE,
  description TEXT
);

CREATE INDEX idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);

-- ============================================================================
-- 5. TICKET TIMELINE (Audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ticket_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  -- Event details
  event_type VARCHAR(32) NOT NULL,
  event_description TEXT NOT NULL,
  
  -- Actor
  actor_id VARCHAR(255) REFERENCES users(id),
  actor_role VARCHAR(32),
  
  -- Metadata
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_ticket_event_type CHECK (event_type IN (
    'CREATED', 'ASSIGNED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'COMMENT_ADDED',
    'ESCALATED', 'RESOLVED', 'REOPENED', 'CLOSED'
  ))
);

CREATE INDEX idx_ticket_timeline_ticket ON ticket_timeline(ticket_id, created_at ASC);

-- ============================================================================
-- 6. NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id VARCHAR(100) UNIQUE NOT NULL,
  
  -- Recipient
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification details
  type VARCHAR(32) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  
  -- Delivery channels
  channels TEXT[] DEFAULT ARRAY['IN_APP'], -- IN_APP, EMAIL, SMS, PUSH
  
  -- Related entities
  related_entity_type VARCHAR(32), -- BOOKING, SHIPMENT, BID, TICKET, etc.
  related_entity_id VARCHAR(255),
  
  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Delivery status
  delivered_in_app BOOLEAN DEFAULT FALSE,
  delivered_email BOOLEAN DEFAULT FALSE,
  delivered_sms BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  CONSTRAINT valid_notification_type CHECK (type IN (
    'BID_RECEIVED', 'BID_ACCEPTED', 'TRIP_STARTED', 'ETA_UPDATE', 'POD_UPLOADED',
    'TICKET_UPDATE', 'BADGE_AWARDED', 'PAYMENT_RECEIVED', 'ALERT', 'SYSTEM'
  )),
  CONSTRAINT valid_related_entity CHECK (related_entity_type IN (
    'BOOKING', 'SHIPMENT', 'BID', 'TICKET', 'PAYMENT', 'BADGE', 'SYSTEM'
  ))
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_entity ON notifications(related_entity_type, related_entity_id);

-- ============================================================================
-- 7. SHIPPER SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS shipper_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipper_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Payment preferences
  upi_autopay_enabled BOOLEAN DEFAULT FALSE,
  upi_autopay_mandate_id UUID REFERENCES upi_mandates(id),
  preferred_payment_method VARCHAR(32) DEFAULT 'UPI',
  
  -- Invoice preferences
  invoice_email VARCHAR(255),
  invoice_gst_number VARCHAR(20),
  invoice_company_name VARCHAR(200),
  invoice_address TEXT,
  auto_generate_invoice BOOLEAN DEFAULT TRUE,
  
  -- Notification preferences
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  
  -- Notification events (which events to receive)
  notify_on_bid_received BOOLEAN DEFAULT TRUE,
  notify_on_trip_started BOOLEAN DEFAULT TRUE,
  notify_on_eta_change BOOLEAN DEFAULT TRUE,
  notify_on_pod_uploaded BOOLEAN DEFAULT TRUE,
  notify_on_ticket_update BOOLEAN DEFAULT TRUE,
  
  -- Tracking preferences
  allow_live_tracking BOOLEAN DEFAULT TRUE,
  share_eta_with_consignee BOOLEAN DEFAULT FALSE,
  
  -- Default preferences for new bookings
  default_verification_mode VARCHAR(16) DEFAULT 'NONE',
  default_bid_type VARCHAR(16) DEFAULT 'OPEN_AUCTION',
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_payment_method CHECK (preferred_payment_method IN (
    'UPI', 'NETBANKING', 'WALLET', 'CREDIT'
  )),
  CONSTRAINT valid_default_verification CHECK (default_verification_mode IN (
    'NONE', 'CYM', 'RVA', 'RLV', 'CTL'
  )),
  CONSTRAINT valid_default_bid_type CHECK (default_bid_type IN (
    'OPEN_AUCTION', 'SEALED', 'DIRECT_INVITE'
  ))
);

-- ============================================================================
-- 8. ADDRESS BOOK (Multiple pickup/delivery addresses)
-- ============================================================================

CREATE TABLE IF NOT EXISTS shipper_address_book (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipper_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Address details
  address_label VARCHAR(100) NOT NULL, -- 'Office', 'Warehouse 1', etc.
  address_type VARCHAR(16) NOT NULL, -- PICKUP, DELIVERY, BOTH
  
  -- Location
  address_line1 VARCHAR(200) NOT NULL,
  address_line2 VARCHAR(200),
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  
  -- Geolocation
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Contact at location
  contact_person VARCHAR(200),
  contact_phone VARCHAR(20),
  
  -- Status
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_address_type CHECK (address_type IN ('PICKUP', 'DELIVERY', 'BOTH'))
);

CREATE INDEX idx_address_book_shipper ON shipper_address_book(shipper_id, is_active);
CREATE INDEX idx_address_book_type ON shipper_address_book(shipper_id, address_type);

-- ============================================================================
-- 9. RECOMMENDED OPERATORS (Cached for performance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS shipper_operator_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipper_id VARCHAR(255) NOT NULL REFERENCES users(id),
  
  -- Recommended operator
  operator_id VARCHAR(255) NOT NULL REFERENCES users(id),
  
  -- Scoring
  match_score DECIMAL(5, 2) NOT NULL, -- 0-100
  reliability_score DECIMAL(5, 2),
  avg_eta_hours DECIMAL(6, 2),
  avg_price_per_ton DECIMAL(10, 2),
  
  -- Reasoning
  recommendation_reason TEXT,
  based_on_routes TEXT[], -- Routes they excel at
  
  -- Ranking
  rank INTEGER NOT NULL,
  
  -- Freshness
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  
  CONSTRAINT unique_shipper_operator_recommendation UNIQUE (shipper_id, operator_id, calculated_at)
);

CREATE INDEX idx_operator_recommendations_shipper ON shipper_operator_recommendations(shipper_id, rank);

-- ============================================================================
-- 10. VIEWS FOR SHIPPER DASHBOARD
-- ============================================================================

-- Shipper dashboard metrics view
CREATE OR REPLACE VIEW shipper_dashboard_metrics AS
SELECT 
  u.id AS shipper_id,
  u.name AS shipper_name,
  
  -- Shipment counts
  COUNT(DISTINCT s.id) AS total_shipments,
  COUNT(DISTINCT CASE WHEN s.status IN ('IN_TRANSIT', 'PICKUP_PENDING') THEN s.id END) AS active_shipments,
  COUNT(DISTINCT CASE WHEN s.status = 'COMPLETED' THEN s.id END) AS completed_shipments,
  
  -- Booking counts
  COUNT(DISTINCT b.id) AS total_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'OPEN' THEN b.id END) AS open_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'ASSIGNED' THEN b.id END) AS assigned_bookings,
  
  -- Bid counts
  COUNT(DISTINCT bid.id) AS total_bids_received,
  COUNT(DISTINCT CASE WHEN bid.status = 'PENDING' THEN bid.id END) AS pending_bids,
  
  -- On-time performance (last 30 days)
  ROUND(
    COUNT(DISTINCT CASE 
      WHEN s.status = 'COMPLETED' 
      AND s.actual_delivery_at IS NOT NULL 
      AND s.estimated_delivery_at IS NOT NULL
      AND s.actual_delivery_at <= s.estimated_delivery_at 
      AND s.created_at >= NOW() - INTERVAL '30 days'
      THEN s.id 
    END)::DECIMAL / 
    NULLIF(COUNT(DISTINCT CASE 
      WHEN s.status = 'COMPLETED' 
      AND s.created_at >= NOW() - INTERVAL '30 days'
      THEN s.id 
    END), 0) * 100,
    2
  ) AS on_time_percentage_30d,
  
  -- Average ETA
  AVG(CASE 
    WHEN s.status IN ('IN_TRANSIT', 'PICKUP_PENDING') 
    AND s.estimated_delivery_at IS NOT NULL
    THEN EXTRACT(EPOCH FROM (s.estimated_delivery_at - NOW()))/3600 
  END) AS avg_eta_hours,
  
  -- Freight spend (last 30 days)
  COALESCE(SUM(CASE 
    WHEN s.created_at >= NOW() - INTERVAL '30 days'
    AND s.status = 'COMPLETED'
    THEN s.final_amount 
  END), 0) AS freight_spend_30d
  
FROM users u
LEFT JOIN bookings b ON b.shipper_id = u.id
LEFT JOIN shipments s ON s.booking_id = b.id
LEFT JOIN bids bid ON bid.booking_id = b.id
WHERE u.role = 'SH'
GROUP BY u.id, u.name;

COMMIT;

-- ============================================================================
-- Migration Complete: Shipper App Enhancements
-- ============================================================================

