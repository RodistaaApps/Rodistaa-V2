/**
 * Body Length Inference Engine
 * OEM mapping logic for body-length inference with confidence scoring
 */

import { Pool, PoolClient } from 'pg';
import type { VahanSnapshot } from './normalizer';

export interface OEMModel {
  id: number;
  oem_name: string;
  model_code: string;
  model_name: string;
  typical_body_length_ft?: number;
  typical_wheelbase_mm?: number;
  typical_ulw_kg?: number;
  typical_gvw_kg?: number;
  typical_tyre_count?: number;
  typical_axle_count?: number;
  body_type_category?: string;
}

export interface InferenceResult {
  inferredLengthFt?: number;
  confidence: number;
  method: 'OEM_MAPPING' | 'WHEELBASE' | 'ULW_FALLBACK' | 'MANUAL';
  oemModelId?: number;
  notes?: string;
}

/**
 * Body Length Inference Engine
 */
export class BodyLengthInference {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  /**
   * Infer body length from snapshot
   */
  async inferBodyLength(snapshot: VahanSnapshot): Promise<InferenceResult> {
    // Try OEM mapping first (highest confidence)
    const oemResult = await this.inferFromOEM(snapshot);
    if (oemResult.confidence >= 0.8) {
      return oemResult;
    }

    // Try wheelbase-based inference
    const wheelbaseResult = await this.inferFromWheelbase(snapshot);
    if (wheelbaseResult.confidence >= 0.7) {
      return wheelbaseResult;
    }

    // Try ULW fallback
    const ulwResult = await this.inferFromULW(snapshot);
    if (ulwResult.confidence >= 0.6) {
      return ulwResult;
    }

    // Low confidence fallback
    return {
      confidence: 0.3,
      method: 'ULW_FALLBACK',
      notes: 'Unable to infer with high confidence',
    };
  }

  /**
   * Infer from OEM model mapping
   */
  private async inferFromOEM(snapshot: VahanSnapshot): Promise<InferenceResult> {
    if (!snapshot.maker || !snapshot.model) {
      return {
        confidence: 0,
        method: 'OEM_MAPPING',
        notes: 'Missing maker or model',
      };
    }

    const normalizedMaker = this.normalizeOEMName(snapshot.maker);
    const normalizedModel = this.normalizeModelCode(snapshot.model);

    const query = `
      SELECT * FROM oem_model_bodylength
      WHERE LOWER(oem_name) = LOWER($1)
      AND (LOWER(model_code) = LOWER($2) OR LOWER(model_name) LIKE LOWER($3))
      LIMIT 1
    `;

    try {
      const result = await this.db.query(query, [
        normalizedMaker,
        normalizedModel,
        `%${normalizedModel}%`,
      ]);

      if (result.rows.length > 0) {
        const oemModel = result.rows[0] as OEMModel;
        return {
          inferredLengthFt: oemModel.typical_body_length_ft || undefined,
          confidence: 0.9,
          method: 'OEM_MAPPING',
          oemModelId: oemModel.id,
          notes: `Matched OEM model: ${oemModel.oem_name} ${oemModel.model_name}`,
        };
      }
    } catch (error) {
      console.error('Error in OEM inference:', error);
    }

    return {
      confidence: 0,
      method: 'OEM_MAPPING',
      notes: 'No OEM model match found',
    };
  }

  /**
   * Infer from wheelbase
   */
  private async inferFromWheelbase(snapshot: VahanSnapshot): Promise<InferenceResult> {
    // Wheelbase-based inference requires wheelbase data
    // This is a simplified implementation
    // In production, use regression models or lookup tables

    // Typical wheelbase to body length ratios
    // This is approximate and varies by vehicle type
    const wheelbaseMm = (snapshot as any).wheelbaseMm;
    if (!wheelbaseMm || wheelbaseMm < 2000 || wheelbaseMm > 8000) {
      return {
        confidence: 0,
        method: 'WHEELBASE',
        notes: 'Invalid or missing wheelbase',
      };
    }

    // Approximate conversion: body_length_ft ≈ (wheelbase_mm / 1000) * 1.2 to 1.5
    const estimatedLengthFt = (wheelbaseMm / 1000) * 1.35;

    return {
      inferredLengthFt: Math.round(estimatedLengthFt * 10) / 10,
      confidence: 0.7,
      method: 'WHEELBASE',
      notes: `Estimated from wheelbase: ${wheelbaseMm}mm`,
    };
  }

  /**
   * Infer from ULW (Unladen Weight) fallback
   */
  private async inferFromULW(snapshot: VahanSnapshot): Promise<InferenceResult> {
    const ulwKg = (snapshot as any).ulwKg;
    const gvwKg = snapshot.gvwKg;

    if (!ulwKg && !gvwKg) {
      return {
        confidence: 0,
        method: 'ULW_FALLBACK',
        notes: 'Missing ULW and GVW data',
      };
    }

    // Rough estimation: heavier vehicles tend to be longer
    // This is a very rough heuristic
    const weightKg = ulwKg || (gvwKg ? gvwKg * 0.6 : undefined);
    if (!weightKg) {
      return {
        confidence: 0,
        method: 'ULW_FALLBACK',
        notes: 'Cannot estimate from weight',
      };
    }

    // Very rough estimation (not accurate, but better than nothing)
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
      inferredLengthFt: estimatedLengthFt,
      confidence: 0.5,
      method: 'ULW_FALLBACK',
      notes: `Estimated from weight: ${weightKg}kg (low confidence)`,
    };
  }

  /**
   * Normalize OEM name for matching
   */
  private normalizeOEMName(name: string): string {
    const normalized = name.toUpperCase().trim();
    
    // Handle common variations
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
   * Normalize model code for matching
   */
  private normalizeModelCode(model: string): string {
    return model.toUpperCase().trim().replace(/\s+/g, '_');
  }
}

