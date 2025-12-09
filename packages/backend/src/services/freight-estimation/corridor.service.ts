/**
 * corridor.service.ts
 * Corridor lookup and normalization service
 */

import db from '../../db/connection';

export async function fetchCorridor(input: any) {
  // TODO: implement proper corridor lookup by region grid
  const { rows } = await db.query(
    `SELECT * FROM corridor_rates
     WHERE from_geo_id = $1 AND to_geo_id = $2
     LIMIT 1`,
    [input.pickup.city || 'UNKNOWN', input.drop.city || 'UNKNOWN']
  );

  if (rows.length === 0) {
    // Return default corridor stats
    return {
      id: null,
      median_rate_per_km: 55,
      volume_30d: 0,
      empty_return_pct: 0,
    };
  }

  return rows[0];
}
