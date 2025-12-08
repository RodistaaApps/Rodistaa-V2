# Freight Estimation Engine Architecture

**Purpose:** Generate fast, defensible, real-time market freight estimates (min, median, max) per booking request using a hybrid stack: rule-based baseline + ML model for corridor tuning + demand-supply signal adjustments.

## Key Principles

- Separate from operator-fee engine (₹3/ton + ₹0.30/km)
- Provide estimate as a range (min–max) to reduce disputes
- Real-time: return within 150–300 ms for typical requests
- Explainable: every estimate must carry provenance (which factors moved the price)
- Safe defaults & fallbacks: deterministic rule-based pricing when data sparse
- Continuous learning: model retrains daily/weekly on confirmed job data

## Architecture Components

1. **API Gateway** — routes /freight/estimate calls, auth, throttling
2. **Estimation Service** — orchestrates rules + ML model inference + feature assembly
3. **Feature Store** — Redis (low-latency) + Postgres for historical features
4. **Corridor Rate DB** — Postgres table with aggregated corridor statistics
5. **Model Scoring Service** — scalable inferencing (TensorFlow/ONNX/LightGBM)
6. **Data Ingest Pipeline** — Kafka ingestion; ETL jobs populate feature store
7. **Training Pipeline** — Airflow orchestrated; retrains models
8. **Admin Dashboard** — Ops can view corridor rates, model version, overrides
9. **Audit Store** — append-only storage for predictions and provenance

## Inputs (Features)

**Required:**
- pickup_lat, pickup_lng
- drop_lat, drop_lng
- truck_type (LCV/MCV/HCV/Trailer)
- body_type (Open/Container/Flatbed/Lowbed)
- payload_tonnes
- cargo_type
- pickup_time_local

**Optional:**
- preferred_route_hint
- requirements (forklift, permits)
- shipper_tier
- historic_booking_id

## Output Contract

```json
{
  "predicted_range": {
    "min": {"amount": 16500, "currency": "INR"},
    "median": {"amount": 18000, "currency": "INR"},
    "max": {"amount": 19500, "currency": "INR"}
  },
  "predicted_distance_km": 260,
  "model_version": "v2025-12-01-001",
  "provenance": [
    {"factor": "corridor_median_rate", "effect": 0.9},
    {"factor": "diesel_delta", "effect": 0.08}
  ],
  "confidence_score": 0.82,
  "fallback_used": false,
  "compute_time_ms": 85,
  "feature_snapshot_id": "fsnap-20251208-0001"
}
```

## Estimation Logic (Hybrid Pipeline)

1. **Feature Assembly** — Compute distance, lookup corridor, fetch diesel/DSI
2. **Rule-Based Baseline** — Deterministic pricing based on corridor medians
3. **ML Model Uplift** — Optional ML prediction for corridors with sufficient history
4. **Range Derivation** — Calculate min/median/max with uncertainty
5. **Post-Processing** — Apply business rules, admin overrides
6. **Provenance** — Build explainable factor list

## Data Sources

1. Historical confirmed fares (primary target)
2. Live platform telemetry (DSI computation)
3. Diesel price feeds (daily per zone)
4. Toll & permit databases
5. Open incident feeds / heatmaps
6. External market data (optional)
7. Weather & seasonal calendars
8. Operator performance DB

## ML Model Design

- **Model Type:** Gradient-boosted trees (LightGBM/XGBoost)
- **Features:** Numeric (distance, payload, corridor stats) + Categorical (truck_type, cargo_type)
- **Label:** agreed_fare / distance_km
- **Uncertainty:** Quantile regression or historical stddev
- **Training:** Daily incremental, weekly retrain

## Fallbacks & Edge Cases

1. Cold corridors — use rule-based baseline from adjacent corridors
2. Routing unavailable — use Haversine + detour factor
3. Data stale — use last known values with flags
4. High uncertainty — widen range, lower confidence
5. Manual overrides — Ops can set corridor rates
6. Model drift — fallback to baseline, escalate retraining

## Metrics & Alerts

- estimate_latency_p50, estimate_latency_p95 (<200ms target)
- model_coverage (% using ML vs fallback)
- prediction_drift (distribution shifts)
- conversion_rate (shipper confirms after seeing estimate)
- dispute_rate per 1000 bookings

## Deployment

- Containerized services (Docker)
- Kubernetes orchestration
- Horizontal autoscaling
- Caching (Redis, TTL 1-5 min)
- Canary deploys for model updates

## Roadmap

- **Sprint 0:** Scaffolding, feature store, corridor DB
- **Sprint 1:** POST /freight/estimate with rule-based estimates
- **Sprint 2:** Data pipeline, corridor aggregation
- **Sprint 3:** ML model training & integration
- **Sprint 4:** Monitoring, alerts, admin dashboard
- **Sprint 5:** Continuous retraining, A/B testing
