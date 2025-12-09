-- Migration: Bookings & Shipments Module
-- Created: 2025-12-05
-- Purpose: Complete booking lifecycle, bidding, shipment tracking, POD, disputes

-- ============================================================================
-- BOOKINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(50) PRIMARY KEY,
  shipper_id VARCHAR(50) NOT NULL,
  franchise_id VARCHAR(50),
  
  -- Route
  pickup_address TEXT NOT NULL,
  pickup_city VARCHAR(100) NOT NULL,
  pickup_state VARCHAR(100) NOT NULL,
  pickup_lat DECIMAL(10, 7),
  pickup_lng DECIMAL(10, 7),
  drop_address TEXT NOT NULL,
  drop_city VARCHAR(100) NOT NULL,
  drop_state VARCHAR(100) NOT NULL,
  drop_lat DECIMAL(10, 7),
  drop_lng DECIMAL(10, 7),
  distance_km DECIMAL(8, 2),
  
  -- Load details
  material VARCHAR(255) NOT NULL,
  weight_kg DECIMAL(10, 2),
  dimensions JSONB, -- {length, width, height}
  special_instructions TEXT,
  attachments TEXT[], -- URLs
  
  -- Pricing
  expected_price_min DECIMAL(12, 2),
  expected_price_max DECIMAL(12, 2),
  payment_mode VARCHAR(20) DEFAULT 'online' CHECK (payment_mode IN ('online', 'cash', 'credit')),
  
  -- Scheduling
  posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  auto_finalize_at TIMESTAMPTZ, -- Null = manual finalization only
  finalized_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'posted' CHECK (status IN ('posted', 'bidding', 'finalized', 'cancelled', 'converted')),
  is_reopened BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Lifecycle
  winning_bid_id VARCHAR(50),
  created_shipment_id VARCHAR(50),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_shipper ON bookings(shipper_id);
CREATE INDEX idx_bookings_status ON bookings(status, posted_at DESC);
CREATE INDEX idx_bookings_auto_finalize ON bookings(auto_finalize_at) WHERE status = 'bidding' AND auto_finalize_at IS NOT NULL;
CREATE INDEX idx_bookings_created ON bookings(created_at DESC);
CREATE INDEX idx_bookings_franchise ON bookings(franchise_id);
CREATE INDEX idx_bookings_cities ON bookings(pickup_city, drop_city);

-- ============================================================================
-- BIDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS bids (
  id VARCHAR(50) PRIMARY KEY,
  booking_id VARCHAR(50) NOT NULL,
  operator_id VARCHAR(50) NOT NULL,
  truck_id VARCHAR(50), -- Proposed truck
  driver_id VARCHAR(50), -- Proposed driver
  
  -- Bid details
  amount DECIMAL(12, 2) NOT NULL,
  original_amount DECIMAL(12, 2), -- For counter-offers
  is_counter BOOLEAN NOT NULL DEFAULT FALSE,
  counter_to_bid_id VARCHAR(50), -- If this is a counter-offer
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'rejected', 'withdrawn')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}', -- Transit time estimate, notes, etc.
  
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_at TIMESTAMPTZ,
  
  CONSTRAINT fk_bid_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_bid_counter FOREIGN KEY (counter_to_bid_id) REFERENCES bids(id) ON DELETE SET NULL
);

CREATE INDEX idx_bids_booking ON bids(booking_id, placed_at DESC);
CREATE INDEX idx_bids_operator ON bids(operator_id);
CREATE INDEX idx_bids_status ON bids(status);
CREATE UNIQUE INDEX idx_bids_active_per_operator ON bids(booking_id, operator_id) WHERE status = 'active';

-- ============================================================================
-- SHIPMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS shipments (
  id VARCHAR(50) PRIMARY KEY,
  booking_id VARCHAR(50) NOT NULL,
  operator_id VARCHAR(50) NOT NULL,
  truck_id VARCHAR(50) NOT NULL,
  driver_id VARCHAR(50) NOT NULL,
  
  -- Route (copied from booking)
  pickup_address TEXT NOT NULL,
  pickup_city VARCHAR(100) NOT NULL,
  drop_address TEXT NOT NULL,
  drop_city VARCHAR(100) NOT NULL,
  distance_km DECIMAL(8, 2),
  
  -- Timing
  start_at TIMESTAMPTZ,
  estimated_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'assigned' CHECK (status IN (
    'assigned', 'started', 'in_transit', 'near_delivery', 'delivered', 
    'delayed', 'exception', 'cancelled', 'closed'
  )),
  
  -- POD
  pod_uploaded BOOLEAN NOT NULL DEFAULT FALSE,
  pod_photos TEXT[], -- Photo URLs
  pod_pdf_url TEXT, -- Consolidated PDF
  pod_verified BOOLEAN NOT NULL DEFAULT FALSE,
  otp_verified BOOLEAN NOT NULL DEFAULT FALSE,
  shipper_otp_hash VARCHAR(255),
  
  -- Payments
  freight_amount DECIMAL(12, 2) NOT NULL,
  advance_paid DECIMAL(12, 2) DEFAULT 0,
  balance_amount DECIMAL(12, 2),
  payment_state VARCHAR(20) DEFAULT 'pending' CHECK (payment_state IN ('pending', 'advance_paid', 'balance_pending', 'settled')),
  settlement_reference VARCHAR(100),
  settlement_notes TEXT,
  
  -- Exception handling
  has_dispute BOOLEAN NOT NULL DEFAULT FALSE,
  exceptions JSONB DEFAULT '[]', -- Array of exception events
  
  -- Tracking
  last_known_lat DECIMAL(10, 7),
  last_known_lng DECIMAL(10, 7),
  last_ping_at TIMESTAMPTZ,
  total_distance_traveled DECIMAL(8, 2), -- Actual odometer
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_shipment_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT
);

CREATE INDEX idx_shipments_booking ON shipments(booking_id);
CREATE INDEX idx_shipments_operator ON shipments(operator_id);
CREATE INDEX idx_shipments_status ON shipments(status, created_at DESC);
CREATE INDEX idx_shipments_driver ON shipments(driver_id);
CREATE INDEX idx_shipments_pod ON shipments(pod_uploaded, pod_verified);
CREATE INDEX idx_shipments_payment ON shipments(payment_state);
CREATE INDEX idx_shipments_dispute ON shipments(has_dispute) WHERE has_dispute = TRUE;
CREATE INDEX idx_shipments_location ON shipments(last_known_lat, last_known_lng) WHERE status IN ('started', 'in_transit');

-- ============================================================================
-- EVENTS / TIMELINE
-- ============================================================================

CREATE TABLE IF NOT EXISTS booking_shipment_events (
  id BIGSERIAL PRIMARY KEY,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('booking', 'shipment')),
  target_id VARCHAR(50) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- BOOKING_POSTED, BID_PLACED, AUTO_FINALIZED, SHIPMENT_STARTED, GPS_PING, POD_UPLOADED, etc.
  actor_id VARCHAR(50), -- User/Admin/SYSTEM
  actor_role VARCHAR(20), -- shipper, operator, driver, admin, system
  payload JSONB NOT NULL DEFAULT '{}',
  geo_lat DECIMAL(10, 7),
  geo_lng DECIMAL(10, 7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_target ON booking_shipment_events(target_type, target_id, created_at DESC);
CREATE INDEX idx_events_type ON booking_shipment_events(event_type);
CREATE INDEX idx_events_actor ON booking_shipment_events(actor_id);
CREATE INDEX idx_events_created ON booking_shipment_events(created_at DESC);

-- ============================================================================
-- DISPUTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS shipment_disputes (
  id VARCHAR(50) PRIMARY KEY,
  shipment_id VARCHAR(50) NOT NULL,
  booking_id VARCHAR(50) NOT NULL,
  raised_by VARCHAR(50) NOT NULL, -- User ID
  raised_by_type VARCHAR(20) NOT NULL, -- shipper, operator, driver, admin
  dispute_type VARCHAR(50) NOT NULL, -- POD_MISMATCH, PAYMENT_DISPUTE, DAMAGE_CLAIM, DELAY_PENALTY
  reason TEXT NOT NULL,
  evidence JSONB DEFAULT '{}', -- Photos, documents, chat logs
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'escalated', 'closed')),
  assigned_to VARCHAR(50), -- Admin ID
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_dispute_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
  CONSTRAINT fk_dispute_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT
);

CREATE INDEX idx_disputes_shipment ON shipment_disputes(shipment_id);
CREATE INDEX idx_disputes_status ON shipment_disputes(status, created_at DESC);
CREATE INDEX idx_disputes_assigned ON shipment_disputes(assigned_to);

-- ============================================================================
-- GPS TRACKING LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS shipment_gps_logs (
  id BIGSERIAL PRIMARY KEY,
  shipment_id VARCHAR(50) NOT NULL,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  speed DECIMAL(5, 2), -- km/h
  accuracy DECIMAL(6, 2), -- meters
  battery_level INTEGER,
  timestamp TIMESTAMPTZ NOT NULL,
  source VARCHAR(20) DEFAULT 'telematics', -- telematics, driver_app
  
  CONSTRAINT fk_gps_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
);

CREATE INDEX idx_gps_shipment ON shipment_gps_logs(shipment_id, timestamp DESC);
CREATE INDEX idx_gps_timestamp ON shipment_gps_logs(timestamp DESC);

-- Partition by month for performance
-- ALTER TABLE shipment_gps_logs PARTITION BY RANGE (timestamp);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Auto-update updated_at
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create event on booking status change
CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO booking_shipment_events (
      target_type, target_id, event_type, actor_id, actor_role, payload, created_at
    ) VALUES (
      'booking',
      NEW.id,
      'STATUS_CHANGED',
      'SYSTEM',
      'system',
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_status_change AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION log_booking_status_change();

-- Create event on shipment status change
CREATE OR REPLACE FUNCTION log_shipment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO booking_shipment_events (
      target_type, target_id, event_type, actor_id, actor_role, payload, created_at
    ) VALUES (
      'shipment',
      NEW.id,
      'STATUS_CHANGED',
      'SYSTEM',
      'system',
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shipment_status_change AFTER UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION log_shipment_status_change();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE bookings IS 'Shipper load postings with bidding lifecycle';
COMMENT ON TABLE bids IS 'Operator bids with counter-offer support';
COMMENT ON TABLE shipments IS 'Active shipments with tracking and POD';
COMMENT ON TABLE booking_shipment_events IS 'Complete event timeline for bookings and shipments';
COMMENT ON TABLE shipment_disputes IS 'Dispute management with resolution workflow';
COMMENT ON TABLE shipment_gps_logs IS 'GPS tracking points for live shipment monitoring';

