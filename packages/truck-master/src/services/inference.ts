/**
 * Body Length Inference Engine
 * OEM mapping logic for body-length inference with confidence scoring
 */

import { query } from '../db';
import type { VahanSnapshot } from '../models/vahanSnapshot';

export interface InferenceResult {
  inferred_length_ft?: number;
  candidate_lengths: Array<{ length_ft: number; confidence: number; method: string }>;
  confidence: number;
  method: 'OEM_MAPPING' | 'WHEELBASE' | 'ULW_FALLBACK' | 'MANUAL';
  oem_model_id?: number;
  rules_applied: string[];
}

/**
 * Infer body length from snapshot
 */
export async function inferBodyLength(snapshot: VahanSnapshot): Promise<InferenceResult> {
  const candidateLengths: Array<{ length_ft: number; confidence: number; method: string }> = [];
  const rulesApplied: string[] = [];

  // Try OEM mapping first (highest confidence)
  const oemResult = await inferFromOEM(snapshot);
  if (oemResult.confidence >= 0.8) {
    candidateLengths.push({
      length_ft: oemResult.inferred_length_ft!,
      confidence: oemResult.confidence,
      method: 'OEM_MAPPING',
    });
    rulesApplied.push('OEM_MAPPING');
  }

  // Try wheelbase-based inference
  const wheelbaseResult = inferFromWheelbase(snapshot);
  if (wheelbaseResult.confidence >= 0.7) {
    candidateLengths.push({
      length_ft: wheelbaseResult.inferred_length_ft!,
      confidence: wheelbaseResult.confidence,
      method: 'WHEELBASE',
    });
    rulesApplied.push('WHEELBASE');
  }

  // Try ULW fallback
  const ulwResult = inferFromULW(snapshot);
  if (ulwResult.confidence >= 0.6) {
    candidateLengths.push({
      length_ft: ulwResult.inferred_length_ft!,
      confidence: ulwResult.confidence,
      method: 'ULW_FALLBACK',
    });
    rulesApplied.push('ULW_FALLBACK');
  }

  // Select best candidate
  const bestCandidate = candidateLengths.sort((a, b) => b.confidence - a.confidence)[0];

  if (bestCandidate && bestCandidate.confidence >= 0.6) {
    return {
      inferred_length_ft: bestCandidate.length_ft,
      candidate_lengths: candidateLengths,
      confidence: bestCandidate.confidence,
      method: bestCandidate.method as any,
      rules_applied: rulesApplied,
    };
  }

  // Low confidence fallback
  return {
    candidate_lengths: candidateLengths,
    confidence: 0.3,
    method: 'ULW_FALLBACK',
    rules_applied: rulesApplied,
  };
}

/**
 * Infer from OEM model mapping
 */
async function inferFromOEM(snapshot: VahanSnapshot): Promise<{
  inferred_length_ft?: number;
  confidence: number;
  oem_model_id?: number;
}> {
  if (!snapshot.maker || !snapshot.model_name) {
    return { confidence: 0 };
  }

  const normalizedMaker = normalizeOEMName(snapshot.maker);
  const normalizedModel = normalizeModelCode(snapshot.model_name);

  const result = await query(
    `SELECT * FROM oem_model_bodylength
     WHERE LOWER(oem_name) = LOWER($1)
     AND (LOWER(model_code) = LOWER($2) OR LOWER(model_name) LIKE LOWER($3))
     LIMIT 1`,
    [normalizedMaker, normalizedModel, `%${normalizedModel}%`]
  );

  if (result.rows.length > 0) {
    const oemModel = result.rows[0];
    return {
      inferred_length_ft: oemModel.typical_body_length_ft || undefined,
      confidence: 0.9,
      oem_model_id: oemModel.id,
    };
  }

  return { confidence: 0 };
}

/**
 * Infer from wheelbase
 */
function inferFromWheelbase(snapshot: VahanSnapshot): {
  inferred_length_ft?: number;
  confidence: number;
} {
  const wheelbaseMm = snapshot.wheelbase_mm;
  if (!wheelbaseMm || wheelbaseMm < 2000 || wheelbaseMm > 8000) {
    return { confidence: 0 };
  }

  // Approximate: body_length_ft ≈ (wheelbase_mm / 1000) * 1.35
  const estimatedLengthFt = (wheelbaseMm / 1000) * 1.35;

  return {
    inferred_length_ft: Math.round(estimatedLengthFt * 10) / 10,
    confidence: 0.7,
  };
}

/**
 * Infer from ULW (Unladen Weight) fallback
 */
function inferFromULW(snapshot: VahanSnapshot): {
  inferred_length_ft?: number;
  confidence: number;
} {
  const ulwKg = snapshot.ulw_kg;
  const gvwKg = snapshot.gvw_kg;
  const weightKg = ulwKg || (gvwKg ? gvwKg * 0.6 : undefined);

  if (!weightKg) {
    return { confidence: 0 };
  }

  // Very rough estimation
  let estimatedLengthFt: number;
  if (weightKg < 5000) {
    estimatedLengthFt = 18;
  } else if (weightKg < 10000) {
    estimatedLengthFt = 22;
  } else if (weightKg < 20000) {
    estimatedLengthFt = 26;
  } else if (weightKg < 30000) {
    estimatedLengthFt = 30;
  } else if (weightKg < 40000) {
    estimatedLengthFt = 35;
  } else {
    estimatedLengthFt = 40;
  }

  return {
    inferred_length_ft: estimatedLengthFt,
    confidence: 0.5,
  };
}

/**
 * Normalize OEM name
 */
function normalizeOEMName(name: string): string {
  const normalized = name.toUpperCase().trim();
  const mappings: Record<string, string> = {
    'TA TA': 'TATA',
    'TATA MOTORS': 'TATA',
    'ASHOK LEYLAND': 'ASHOK_LEYLAND',
    'BHARAT BENZ': 'BHARATBENZ',
    'BHARATBENZ': 'BHARATBENZ',
    'EICHER': 'EICHER',
    'MAHINDRA': 'MAHINDRA',
    'VOLVO': 'VOLVO',
  };
  return mappings[normalized] || normalized.replace(/\s+/g, '_');
}

/**
 * Normalize model code
 */
function normalizeModelCode(model: string): string {
  return model.toUpperCase().trim().replace(/\s+/g, '_');
}

