/**
 * rule-engine.service.ts
 * Rule-based baseline estimator
 */

export async function ruleEstimate(features: any) {
  const baseRate = features.corridor_stats?.median_rate_per_km || 55;
  const distance = features.distance_km;
  let median = baseRate * distance;

  // commodity adjustments
  if (features.cargo?.type === 'Fragile') median *= 1.05;
  if (features.cargo?.type === 'HighValue') median *= 1.12;

  // truck type multipliers
  if (features.truck_type === 'TRAILER') median *= 1.15;

  // diesel adjustment
  median *= 1 + features.diesel_delta;

  // supply-demand (DSI)
  median *= features.dsi;

  const min = median * 0.9;
  const max = median * 1.1;

  return {
    predicted_range: {
      min: { amount: Math.round(min), currency: 'INR' },
      median: { amount: Math.round(median), currency: 'INR' },
      max: { amount: Math.round(max), currency: 'INR' },
    },
    provenance: [
      { factor: 'corridor_median_rate', effect: baseRate },
      { factor: 'diesel_delta', effect: features.diesel_delta },
      { factor: 'dsi', effect: features.dsi },
    ],
    model_version: 'baseline-v1',
    confidence_score: 0.7,
    fallback_used: true,
  };
}
