-- Migration: Drivers Feature - Location logs, incidents, assignments
-- Date: 2025-12-04

-- Extend users table for driver-specific fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS dl_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS dl_expiry DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability VARCHAR(20) DEFAULT 'available' CHECK (availability IN ('available', 'on_trip', 'offline'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_ping TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_location_lat DECIMAL(10, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_location_lng DECIMAL(11, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_location_city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS behaviour_score INTEGER DEFAULT 0;

-- Create driver_assignments table for multi-operator support
CREATE TABLE IF NOT EXISTS driver_assignments (
  id VARCHAR(36) PRIMARY KEY,
  driver_id VARCHAR(36) NOT NULL,
  operator_id VARCHAR(36) NOT NULL,
  truck_id VARCHAR(36),
  is_primary BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  linked_at TIMESTAMP DEFAULT NOW(),
  unlinked_at TIMESTAMP,
  unlink_reason TEXT,
  FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (truck_id) REFERENCES trucks(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_driver_assignments_driver ON driver_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_operator ON driver_assignments(operator_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_status ON driver_assignments(status);

-- Create location_logs table for GPS tracking
CREATE TABLE IF NOT EXISTS location_logs (
  id VARCHAR(36) PRIMARY KEY,
  driver_id VARCHAR(36) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(6, 2),
  timestamp TIMESTAMP NOT NULL,
  network_type VARCHAR(20),
  trip_id VARCHAR(36),
  speed DECIMAL(6, 2),
  heading DECIMAL(6, 2),
  FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_location_logs_driver ON location_logs(driver_id);
CREATE INDEX IF NOT EXISTS idx_location_logs_trip ON location_logs(trip_id);
CREATE INDEX IF NOT EXISTS idx_location_logs_timestamp ON location_logs(timestamp DESC);

-- Create incidents table for behaviour tracking
CREATE TABLE IF NOT EXISTS incidents (
  id VARCHAR(36) PRIMARY KEY,
  driver_id VARCHAR(36) NOT NULL,
  incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('late_arrival', 'cancellation', 'complaint', 'harsh_braking', 'speeding', 'missed_ping', 'other')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  evidence JSONB,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'escalated', 'closed')),
  action_taken TEXT,
  acknowledged_by VARCHAR(36),
  acknowledged_at TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_incidents_driver ON incidents(driver_id);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);

-- Create location_alerts table for missed ping alerts
CREATE TABLE IF NOT EXISTS location_alerts (
  id VARCHAR(36) PRIMARY KEY,
  driver_id VARCHAR(36) NOT NULL,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('missed_ping', 'prolonged_stop', 'off_route', 'speeding')),
  created_at TIMESTAMP DEFAULT NOW(),
  last_ping_at TIMESTAMP,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by VARCHAR(36),
  acknowledged_at TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_location_alerts_driver ON location_alerts(driver_id);
CREATE INDEX IF NOT EXISTS idx_location_alerts_ack ON location_alerts(acknowledged);

-- Comments
COMMENT ON TABLE driver_assignments IS 'Drivers can be linked to multiple operators and trucks';
COMMENT ON TABLE location_logs IS 'GPS tracking logs - PRIVACY SENSITIVE, access is audit-logged';
COMMENT ON TABLE incidents IS 'Driver behaviour incidents for compliance and scoring';
COMMENT ON TABLE location_alerts IS 'Automated alerts for missed pings and location anomalies';

