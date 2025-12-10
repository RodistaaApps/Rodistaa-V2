/**
 * audit.service.ts
 * Audit logging for freight predictions
 */

import db from '../../db/connection';

export async function writeAuditLog(
  input: any,
  features: any,
  estimate: any,
  computeTime: number
) {
  // Insert feature snapshot
  const { rows: snapRows } = await db.query(
    `INSERT INTO feature_snapshots (input_payload, assembled_features, data_availability)
     VALUES ($1, $2, $3) RETURNING feature_snapshot_id`,
    [
      JSON.stringify(input),
      JSON.stringify(features),
      JSON.stringify({ corridorHistory: !!features.corridor_stats }),
    ]
  );

  const fsnap = snapRows[0]?.feature_snapshot_id;

  // Insert prediction audit
  await db.query(
    `INSERT INTO freight_predictions
     (predicted_min_amount, predicted_median_amount, predicted_max_amount,
      predicted_distance_km, model_version, feature_snapshot_id, provenance,
      confidence_score, fallback_used, compute_time_ms, corridor_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [
      estimate.predicted_range.min.amount,
      estimate.predicted_range.median.amount,
      estimate.predicted_range.max.amount,
      features.distance_km,
      estimate.model_version,
      fsnap,
      JSON.stringify(estimate.provenance),
      estimate.confidence_score,
      estimate.fallback_used,
      computeTime,
      features.corridor_id,
    ]
  );

  return fsnap;
}
