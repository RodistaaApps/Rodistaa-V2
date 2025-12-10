-- migrations/014_freight_estimation_corridors.sql
-- Creates corridor_rates, feature_snapshots, freight_predictions
-- Postgres SQL, tested for PG12+

BEGIN;

-- ===================================================================
-- Table: corridor_rates
-- Purpose: stores aggregated corridor statistics and admin overrides
-- ===================================================================
CREATE TABLE IF NOT EXISTS corridor_rates (
  corridor_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_geo_id          TEXT NOT NULL,               -- e.g. geohash / admin region id
  to_geo_id            TEXT NOT NULL,
  from_label           TEXT,                        -- human friendly label
  to_label             TEXT,
  median_rate_per_km   NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  median_rate_per_tonne_km NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
  stddev_rate_per_km   NUMERIC(12,2) DEFAULT 0.00,
  volume_30d           BIGINT DEFAULT 0,            -- trip count last 30 days
  empty_return_pct     NUMERIC(5,2) DEFAULT 0.00,   -- percent 0-100
  avg_lead_time_hours  NUMERIC(8,2) DEFAULT 0.00,
  last_updated         TIMESTAMPTZ DEFAULT now(),
  override_min_rate_per_km NUMERIC(12,2),           -- admin override (optional)
  override_max_rate_per_km NUMERIC(12,2),
  locked               BOOLEAN DEFAULT FALSE,       -- when true, prefer overrides
  metadata             JSONB DEFAULT '{}',          -- extensible (e.g., city tiers)
  UNIQUE(from_geo_id, to_geo_id)
);

COMMENT ON TABLE corridor_rates IS 'Aggregated corridor statistics used by freight estimation engine.';

CREATE INDEX IF NOT EXISTS idx_corridor_from_to ON corridor_rates (from_geo_id, to_geo_id);
CREATE INDEX IF NOT EXISTS idx_corridor_volume_30d ON corridor_rates (volume_30d);

-- ===================================================================
-- Table: feature_snapshots
-- Purpose: store the assembled features for an individual prediction request
-- ===================================================================
CREATE TABLE IF NOT EXISTS feature_snapshots (
  feature_snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  input_payload JSONB NOT NULL,   -- original request payload
  assembled_features JSONB NOT NULL, -- the features fed to model (or baseline engine)
  routing_info JSONB,            -- routing / distance info used
  data_availability JSONB,       -- flags about which data sources were present
  created_by TEXT DEFAULT 'estimation-service', -- component that created snapshot
  note TEXT
);

COMMENT ON TABLE feature_snapshots IS 'Holds assembled features and contextual info used to produce an estimate.';

CREATE INDEX IF NOT EXISTS idx_feature_snapshots_created_at ON feature_snapshots (created_at);

-- ===================================================================
-- Table: freight_predictions
-- Purpose: audit log of each prediction (min/median/max), provenance and model metadata
-- ===================================================================
CREATE TABLE IF NOT EXISTS freight_predictions (
  prediction_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id           UUID NULL,                   -- optional correlate to booking draft
  created_at           TIMESTAMPTZ DEFAULT now(),
  corridor_id          UUID REFERENCES corridor_rates(corridor_id) ON DELETE SET NULL,
  predicted_min_amount NUMERIC(18,2) NOT NULL,
  predicted_median_amount NUMERIC(18,2) NOT NULL,
  predicted_max_amount NUMERIC(18,2) NOT NULL,
  predicted_distance_km NUMERIC(10,2) NOT NULL,
  model_version        TEXT NOT NULL DEFAULT 'baseline',
  feature_snapshot_id  UUID REFERENCES feature_snapshots(feature_snapshot_id) ON DELETE SET NULL,
  provenance           JSONB DEFAULT '[]',          -- list of factors with effects
  confidence_score     NUMERIC(5,4) DEFAULT 0.0000, -- 0.0 - 1.0
  fallback_used        BOOLEAN DEFAULT FALSE,
  compute_time_ms      INTEGER DEFAULT 0,
  extra_meta           JSONB DEFAULT '{}'
);

COMMENT ON TABLE freight_predictions IS 'Stores prediction output and provenance for audit and model governance.';

CREATE INDEX IF NOT EXISTS idx_freight_predictions_corridor ON freight_predictions (corridor_id);
CREATE INDEX IF NOT EXISTS idx_freight_predictions_created_at ON freight_predictions (created_at);

-- ===================================================================
-- Example seed rows (adjust values for your market)
-- ===================================================================
INSERT INTO corridor_rates (from_geo_id, to_geo_id, from_label, to_label, median_rate_per_km, median_rate_per_tonne_km, stddev_rate_per_km, volume_30d, empty_return_pct, last_updated)
VALUES
('HYD', 'VJA', 'Hyderabad', 'Vijayawada', 65.00, 0.25, 8.50, 420, 18.00, now())
ON CONFLICT (from_geo_id, to_geo_id) DO NOTHING;

COMMIT;
