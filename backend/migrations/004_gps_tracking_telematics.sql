-- ============================================================================
-- Rodistaa Platform - GPS Tracking & Telematics Schema
-- Migration: 004_gps_tracking_telematics.sql
-- Description: Live location tracking, geofencing, route history, OEM integration
-- Created: December 4, 2025
-- Week 2 Deliverable
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. GPS LOCATION POINTS (60-second tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gps_location_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Shipment and driver
  shipment_id VARCHAR(255) NOT NULL,
  driver_id VARCHAR(255) NOT NULL REFERENCES users(id),
  truck_id VARCHAR(255) REFERENCES trucks(id),
  
  -- Location data (PostGIS Point for efficient geo queries)
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  -- If PostGIS is available: location GEOGRAPHY(POINT, 4326),
  
  -- Additional GPS metadata
  accuracy DECIMAL(8, 2), -- Accuracy in meters
  altitude DECIMAL(8, 2), -- Altitude in meters
  speed DECIMAL(8, 2), -- Speed in km/h
  bearing DECIMAL(6, 2), -- Direction in degrees (0-360)
  
  -- Timestamp
  recorded_at TIMESTAMPTZ NOT NULL, -- When GPS was recorded by device
  received_at TIMESTAMPTZ DEFAULT NOW(), -- When server received it
  
  -- Data source
  source VARCHAR(32) DEFAULT 'DRIVER_APP', -- DRIVER_APP, OEM_TELEMATIC, MANUAL
  
  -- Sequence number (for ordering and duplicate detection)
  sequence_number BIGINT,
  
  -- Network quality
  network_type VARCHAR(16), -- 4G, 3G, 2G, WIFI
  battery_level INTEGER, -- 0-100
  
  -- Status flags
  is_mock BOOLEAN DEFAULT FALSE, -- For testing
  is_interpolated BOOLEAN DEFAULT FALSE, -- Calculated between points
  
  -- Metadata
  metadata JSONB, -- Device info, app version, etc.
  
  CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180),
  CONSTRAINT valid_accuracy CHECK (accuracy >= 0),
  CONSTRAINT valid_speed CHECK (speed >= 0),
  CONSTRAINT valid_bearing CHECK (bearing >= 0 AND bearing <= 360)
);

-- Indexes for efficient querying
CREATE INDEX idx_gps_points_shipment ON gps_location_points(shipment_id, recorded_at DESC);
CREATE INDEX idx_gps_points_driver ON gps_location_points(driver_id, recorded_at DESC);
CREATE INDEX idx_gps_points_recorded_at ON gps_location_points(recorded_at DESC);
CREATE INDEX idx_gps_points_received_at ON gps_location_points(received_at DESC);

-- Spatial index if PostGIS is available
-- CREATE INDEX idx_gps_points_location ON gps_location_points USING GIST(location);

-- ============================================================================
-- 2. GEOFENCES (Yards, Pickup, Delivery locations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS geofences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  geofence_id VARCHAR(100) UNIQUE NOT NULL, -- GEO-<ulid>
  
  -- Geofence details
  name VARCHAR(200) NOT NULL,
  type VARCHAR(32) NOT NULL,
  
  -- Location (center point for circle, or polygon vertices)
  center_latitude DECIMAL(10, 8),
  center_longitude DECIMAL(11, 8),
  radius_meters DECIMAL(10, 2), -- For circle geofences
  
  -- Polygon geofence (for yards, complex areas)
  polygon_coordinates JSONB, -- Array of [lat, lng] points
  
  -- Associated entities
  yard_id VARCHAR(255), -- If this is a yard geofence
  booking_id VARCHAR(255), -- If this is for specific booking
  
  -- Geographic hierarchy
  district_id VARCHAR(100),
  region_id VARCHAR(100),
  address TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_geofence_type CHECK (type IN (
    'YARD', 'PICKUP', 'DELIVERY', 'TOLL_PLAZA', 'REST_STOP', 'CHECKPOINT', 'CUSTOM'
  )),
  CONSTRAINT valid_radius CHECK (radius_meters IS NULL OR radius_meters > 0)
);

CREATE INDEX idx_geofences_type ON geofences(type);
CREATE INDEX idx_geofences_yard ON geofences(yard_id);
CREATE INDEX idx_geofences_booking ON geofences(booking_id);
CREATE INDEX idx_geofences_district ON geofences(district_id);

-- ============================================================================
-- 3. GEOFENCE EVENTS (Entry/Exit events)
-- ============================================================================

CREATE TABLE IF NOT EXISTS geofence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event details
  event_id VARCHAR(100) UNIQUE NOT NULL, -- EVT-<ulid>
  geofence_id UUID NOT NULL REFERENCES geofences(id),
  shipment_id VARCHAR(255) NOT NULL,
  driver_id VARCHAR(255) NOT NULL REFERENCES users(id),
  
  -- Event type
  event_type VARCHAR(16) NOT NULL, -- ENTRY, EXIT
  
  -- Location at event
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  gps_point_id UUID REFERENCES gps_location_points(id),
  
  -- Timestamp
  occurred_at TIMESTAMPTZ NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Notifications sent
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,
  
  -- Metadata
  dwell_time_seconds INTEGER, -- For EXIT events, time spent inside
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_event_type CHECK (event_type IN ('ENTRY', 'EXIT'))
);

CREATE INDEX idx_geofence_events_geofence ON geofence_events(geofence_id);
CREATE INDEX idx_geofence_events_shipment ON geofence_events(shipment_id);
CREATE INDEX idx_geofence_events_occurred_at ON geofence_events(occurred_at DESC);

-- ============================================================================
-- 4. ROUTE HISTORY (Compressed route storage)
-- ============================================================================

CREATE TABLE IF NOT EXISTS route_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Shipment reference
  shipment_id VARCHAR(255) NOT NULL UNIQUE,
  driver_id VARCHAR(255) NOT NULL REFERENCES users(id),
  truck_id VARCHAR(255) REFERENCES trucks(id),
  
  -- Route summary
  total_distance_km DECIMAL(10, 2),
  total_duration_minutes INTEGER,
  average_speed_kmph DECIMAL(6, 2),
  max_speed_kmph DECIMAL(6, 2),
  
  -- Timestamps
  route_start_at TIMESTAMPTZ NOT NULL,
  route_end_at TIMESTAMPTZ,
  
  -- Compressed route data (array of points with timestamp)
  -- Stored as compressed JSON for efficient storage
  route_points_compressed JSONB, -- [{t: timestamp, lat, lng, spd}, ...]
  
  -- Statistics
  total_points INTEGER DEFAULT 0,
  stops_count INTEGER DEFAULT 0,
  overspeed_count INTEGER DEFAULT 0,
  
  -- Quality metrics
  data_quality_score DECIMAL(3, 2), -- 0.00 to 1.00
  missing_data_intervals INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_route_history_shipment ON route_history(shipment_id);
CREATE INDEX idx_route_history_driver ON route_history(driver_id);
CREATE INDEX idx_route_history_start_at ON route_history(route_start_at DESC);

-- ============================================================================
-- 5. OEM TELEMATICS DEVICES
-- ============================================================================

CREATE TABLE IF NOT EXISTS oem_telematic_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(100) UNIQUE NOT NULL, -- OEM-provided device ID
  
  -- Device details
  manufacturer VARCHAR(100) NOT NULL, -- TATA, ASHOK_LEYLAND, etc.
  model VARCHAR(100),
  imei VARCHAR(20) UNIQUE,
  sim_number VARCHAR(20),
  
  -- Truck assignment
  truck_id VARCHAR(255) REFERENCES trucks(id),
  installed_at TIMESTAMPTZ,
  
  -- Device status
  status VARCHAR(32) DEFAULT 'ACTIVE',
  last_heartbeat_at TIMESTAMPTZ,
  
  -- Connection details
  api_endpoint VARCHAR(500), -- OEM's API endpoint
  api_key_encrypted TEXT, -- Encrypted API key
  protocol VARCHAR(32), -- HTTP, MQTT, NMEA, etc.
  
  -- Data format
  data_format VARCHAR(32), -- JSON, XML, NMEA, BINARY
  polling_interval_seconds INTEGER DEFAULT 60,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_device_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FAULTY')),
  CONSTRAINT valid_protocol CHECK (protocol IN ('HTTP', 'HTTPS', 'MQTT', 'NMEA', 'CUSTOM'))
);

CREATE INDEX idx_oem_devices_truck ON oem_telematic_devices(truck_id);
CREATE INDEX idx_oem_devices_status ON oem_telematic_devices(status);
CREATE INDEX idx_oem_devices_imei ON oem_telematic_devices(imei);

-- ============================================================================
-- 6. OEM TELEMATIC DATA (Raw data from OEM devices)
-- ============================================================================

CREATE TABLE IF NOT EXISTS oem_telematic_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES oem_telematic_devices(id),
  
  -- Location
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- Vehicle data
  speed DECIMAL(6, 2),
  odometer DECIMAL(12, 2), -- Total distance traveled
  fuel_level DECIMAL(5, 2), -- Percentage or liters
  engine_status VARCHAR(16), -- ON, OFF, IDLE
  
  -- Timestamps
  device_timestamp TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Raw data
  raw_payload JSONB, -- Full payload from OEM for debugging
  
  -- Processing status
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_engine_status CHECK (engine_status IN ('ON', 'OFF', 'IDLE', 'UNKNOWN'))
);

CREATE INDEX idx_oem_data_device ON oem_telematic_data(device_id, device_timestamp DESC);
CREATE INDEX idx_oem_data_processed ON oem_telematic_data(processed, received_at);
CREATE INDEX idx_oem_data_received_at ON oem_telematic_data(received_at DESC);

-- ============================================================================
-- 7. TRACKING SESSIONS (Active tracking periods)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tracking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) UNIQUE NOT NULL, -- TRK-<ulid>
  
  -- Session details
  shipment_id VARCHAR(255) NOT NULL,
  driver_id VARCHAR(255) NOT NULL REFERENCES users(id),
  truck_id VARCHAR(255) REFERENCES trucks(id),
  
  -- Session lifecycle
  status VARCHAR(32) DEFAULT 'ACTIVE',
  started_at TIMESTAMPTZ NOT NULL,
  paused_at TIMESTAMPTZ,
  resumed_at TIMESTAMPTZ,
  stopped_at TIMESTAMPTZ,
  
  -- Tracking stats
  total_points_received INTEGER DEFAULT 0,
  last_point_at TIMESTAMPTZ,
  expected_interval_seconds INTEGER DEFAULT 60,
  
  -- Quality metrics
  missed_intervals INTEGER DEFAULT 0,
  network_dropouts INTEGER DEFAULT 0,
  
  -- Privacy compliance
  user_consent BOOLEAN DEFAULT TRUE,
  consent_timestamp TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_tracking_status CHECK (status IN ('ACTIVE', 'PAUSED', 'STOPPED', 'COMPLETED'))
);

CREATE INDEX idx_tracking_sessions_shipment ON tracking_sessions(shipment_id);
CREATE INDEX idx_tracking_sessions_driver ON tracking_sessions(driver_id);
CREATE INDEX idx_tracking_sessions_status ON tracking_sessions(status);
CREATE INDEX idx_tracking_sessions_started_at ON tracking_sessions(started_at DESC);

-- ============================================================================
-- 8. CALCULATED ETAS (Estimated Time of Arrival)
-- ============================================================================

CREATE TABLE IF NOT EXISTS shipment_etas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Shipment reference
  shipment_id VARCHAR(255) NOT NULL,
  
  -- ETA calculation
  calculated_eta TIMESTAMPTZ NOT NULL,
  original_eta TIMESTAMPTZ, -- Original promised ETA
  confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
  
  -- Calculation method
  calculation_method VARCHAR(32) NOT NULL,
  
  -- Factors considered
  remaining_distance_km DECIMAL(10, 2),
  current_speed_kmph DECIMAL(6, 2),
  average_speed_kmph DECIMAL(6, 2),
  traffic_factor DECIMAL(3, 2), -- 1.0 = normal, > 1.0 = slower
  weather_factor DECIMAL(3, 2),
  
  -- Delay detection
  is_delayed BOOLEAN DEFAULT FALSE,
  delay_minutes INTEGER DEFAULT 0,
  
  -- Timestamp
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  calculation_details JSONB,
  
  CONSTRAINT valid_calculation_method CHECK (calculation_method IN (
    'DISTANCE_BASED', 'AVERAGE_SPEED', 'HISTORICAL', 'ML_PREDICTED', 'MANUAL'
  )),
  CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

CREATE INDEX idx_etas_shipment ON shipment_etas(shipment_id, calculated_at DESC);
CREATE INDEX idx_etas_delayed ON shipment_etas(is_delayed, calculated_at DESC);

-- ============================================================================
-- 9. TRACKING ALERTS (Automated alerts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tracking_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id VARCHAR(100) UNIQUE NOT NULL, -- ALT-<ulid>
  
  -- Alert details
  shipment_id VARCHAR(255) NOT NULL,
  driver_id VARCHAR(255) NOT NULL REFERENCES users(id),
  
  -- Alert type and severity
  alert_type VARCHAR(32) NOT NULL,
  severity VARCHAR(16) NOT NULL DEFAULT 'INFO',
  
  -- Alert message
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  
  -- Location context
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_name VARCHAR(200),
  
  -- Status
  status VARCHAR(32) DEFAULT 'NEW',
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by VARCHAR(255) REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  
  -- Notifications
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_channels TEXT[], -- SMS, EMAIL, PUSH, WHATSAPP
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_alert_type CHECK (alert_type IN (
    'GEOFENCE_ENTRY', 'GEOFENCE_EXIT', 'OVERSPEED', 'ROUTE_DEVIATION', 
    'LONG_STOP', 'NETWORK_LOSS', 'BATTERY_LOW', 'ETA_DELAY', 'SOS'
  )),
  CONSTRAINT valid_severity CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL', 'EMERGENCY')),
  CONSTRAINT valid_alert_status CHECK (status IN ('NEW', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'))
);

CREATE INDEX idx_tracking_alerts_shipment ON tracking_alerts(shipment_id, created_at DESC);
CREATE INDEX idx_tracking_alerts_driver ON tracking_alerts(driver_id);
CREATE INDEX idx_tracking_alerts_status ON tracking_alerts(status, severity);
CREATE INDEX idx_tracking_alerts_type ON tracking_alerts(alert_type);

-- ============================================================================
-- 10. TRACKING ANALYTICS (Aggregated metrics)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tracking_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Period
  date DATE NOT NULL,
  hour INTEGER, -- NULL for daily aggregates, 0-23 for hourly
  
  -- Aggregation level
  level VARCHAR(32) NOT NULL, -- PLATFORM, REGION, DISTRICT, OPERATOR, DRIVER
  level_id VARCHAR(255), -- NULL for PLATFORM
  
  -- Metrics
  total_tracking_sessions INTEGER DEFAULT 0,
  total_gps_points INTEGER DEFAULT 0,
  total_distance_km DECIMAL(12, 2) DEFAULT 0,
  average_speed_kmph DECIMAL(6, 2),
  
  -- Quality metrics
  average_accuracy_meters DECIMAL(8, 2),
  data_quality_score DECIMAL(3, 2),
  network_dropouts INTEGER DEFAULT 0,
  
  -- Alert metrics
  total_alerts INTEGER DEFAULT 0,
  critical_alerts INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_level CHECK (level IN ('PLATFORM', 'REGION', 'DISTRICT', 'OPERATOR', 'DRIVER')),
  CONSTRAINT valid_hour CHECK (hour IS NULL OR (hour >= 0 AND hour <= 23)),
  CONSTRAINT unique_analytics UNIQUE (date, hour, level, level_id)
);

CREATE INDEX idx_tracking_analytics_date ON tracking_analytics(date DESC, hour DESC);
CREATE INDEX idx_tracking_analytics_level ON tracking_analytics(level, level_id);

-- ============================================================================
-- 11. TRACKING PRIVACY SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS tracking_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(id),
  
  -- Consent
  tracking_enabled BOOLEAN DEFAULT TRUE,
  consent_given_at TIMESTAMPTZ,
  consent_withdrawn_at TIMESTAMPTZ,
  
  -- Privacy preferences
  share_location_with_shipper BOOLEAN DEFAULT TRUE,
  share_location_with_admin BOOLEAN DEFAULT TRUE,
  share_location_history BOOLEAN DEFAULT FALSE,
  
  -- Data retention
  retain_location_data BOOLEAN DEFAULT TRUE,
  retention_period_days INTEGER DEFAULT 365,
  
  -- Compliance
  gdpr_compliant BOOLEAN DEFAULT TRUE,
  data_processing_agreement_accepted BOOLEAN DEFAULT FALSE,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 12. FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 DECIMAL, lon1 DECIMAL,
  lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  earth_radius_km CONSTANT DECIMAL := 6371;
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := RADIANS(lat2 - lat1);
  dlon := RADIANS(lon2 - lon1);
  
  a := SIN(dlat/2) * SIN(dlat/2) + 
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * 
       SIN(dlon/2) * SIN(dlon/2);
  
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  
  RETURN earth_radius_km * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 13. VIEWS FOR REPORTING
-- ============================================================================

-- Active tracking sessions view
CREATE OR REPLACE VIEW active_tracking_sessions AS
SELECT 
  ts.session_id,
  ts.shipment_id,
  ts.driver_id,
  u.name AS driver_name,
  ts.started_at,
  ts.total_points_received,
  ts.last_point_at,
  EXTRACT(EPOCH FROM (NOW() - ts.last_point_at))/60 AS minutes_since_last_point,
  CASE 
    WHEN ts.last_point_at IS NULL THEN 'NO_DATA'
    WHEN (NOW() - ts.last_point_at) > INTERVAL '5 minutes' THEN 'STALE'
    WHEN (NOW() - ts.last_point_at) > INTERVAL '2 minutes' THEN 'DELAYED'
    ELSE 'LIVE'
  END AS data_freshness
FROM tracking_sessions ts
JOIN users u ON u.id = ts.driver_id
WHERE ts.status = 'ACTIVE'
ORDER BY ts.last_point_at DESC NULLS LAST;

-- Latest location view
CREATE OR REPLACE VIEW latest_shipment_locations AS
SELECT DISTINCT ON (shipment_id)
  shipment_id,
  driver_id,
  latitude,
  longitude,
  speed,
  bearing,
  recorded_at,
  received_at,
  source
FROM gps_location_points
ORDER BY shipment_id, recorded_at DESC;

COMMIT;

-- ============================================================================
-- Migration Complete: GPS Tracking & Telematics
-- ============================================================================

