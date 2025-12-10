/**
 * merge-engine.service.ts
 * Combine rule-based and ML predictions
 */

export function mergeEstimates(rule: any, ml: any) {
  if (!ml) return rule;

  // Weighted merge example (custom policy)
  const wRule = 0.6;
  const wML = 0.4;

  return {
    predicted_range: {
      min: {
        amount: Math.round(
          rule.predicted_range.min.amount * wRule + ml.min * wML
        ),
        currency: 'INR',
      },
      median: {
        amount: Math.round(
          rule.predicted_range.median.amount * wRule + ml.median * wML
        ),
        currency: 'INR',
      },
      max: {
        amount: Math.round(
          rule.predicted_range.max.amount * wRule + ml.max * wML
        ),
        currency: 'INR',
      },
    },
    provenance: [...rule.provenance, ...(ml.provenance || [])],
    confidence_score: Math.max(rule.confidence_score, ml.confidence_score || 0),
    model_version: ml.model_version || rule.model_version,
    fallback_used: false,
  };
}
