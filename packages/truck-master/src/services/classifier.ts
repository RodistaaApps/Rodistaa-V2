/**
 * Body Type Classifier
 * Rules engine with regex-based blocking and fleet classification
 */

import bodyRegexConfig from '../../config/body_regex.json';
import tyreGvwRules from '../../config/tyre_gvw_rules.json';
import fleetMatrix from '@rodistaa/fleet-verification/data/rodistaa_fleet_matrix.json';
import type { VahanSnapshot } from '../models/vahanSnapshot';

export type FleetClassification = 'SXL' | 'DXL' | 'TXL' | 'QXL' | 'PXL' | 'HX' | 'TRL';
export type BodyCategory = 'OPEN_BODY' | 'CONTAINER' | 'FLATBED' | 'LOWBED' | 'SKELETAL' | 'BLOCKED';

export interface ClassificationResult {
  classification?: FleetClassification;
  bodyCategory?: BodyCategory;
  isBlocked: boolean;
  blockReasons: string[];
  confidence: number;
  rules_applied: string[];
}

/**
 * Check if body type is blocked using regex patterns
 */
export function isBlockedBodyType(snapshot: VahanSnapshot): { blocked: boolean; reason?: string } {
  const bodyTypeUpper = (snapshot.body_type_name || '').toUpperCase();
  const bodyCodeStr = String(snapshot.body_type_code || '');

  // Check blocked patterns from config
  for (const pattern of bodyRegexConfig.blocked_patterns) {
    const regex = new RegExp(pattern.pattern, pattern.caseSensitive ? 'g' : 'gi');
    if (regex.test(bodyTypeUpper)) {
      return {
        blocked: true,
        reason: pattern.reason,
      };
    }
  }

  return { blocked: false };
}

/**
 * Check emission code compliance
 */
export function checkEmissionCompliance(emissionCode?: string): { allowed: boolean; reason?: string } {
  if (!emissionCode) {
    return { allowed: false, reason: 'MISSING_EMISSION_CODE' };
  }

  const emissionUpper = emissionCode.toUpperCase();
  const blockedCodes = fleetMatrix.blocked_patterns.emission_codes_blocked || [];

  if (blockedCodes.some(code => emissionUpper.includes(code))) {
    return {
      allowed: false,
      reason: `BLOCKED_EMISSION_${emissionCode}`,
    };
  }

  // Allow BS4 and BS6 only
  if (!emissionUpper.includes('BS4') && !emissionUpper.includes('BS6')) {
    return {
      allowed: false,
      reason: `INVALID_EMISSION_${emissionCode}`,
    };
  }

  return { allowed: true };
}

/**
 * Classify fleet type based on axles, tyres, and GVW
 */
export function classifyFleetType(snapshot: VahanSnapshot, inferredLengthFt?: number): ClassificationResult {
  const result: ClassificationResult = {
    isBlocked: false,
    blockReasons: [],
    confidence: 0,
    rules_applied: [],
  };

  // Check blocked body types first
  const blockedCheck = isBlockedBodyType(snapshot);
  if (blockedCheck.blocked) {
    result.isBlocked = true;
    result.blockReasons.push(blockedCheck.reason!);
    result.rules_applied.push('BODY_TYPE_BLOCK_CHECK');
    return result;
  }

  // Check emission compliance
  const emissionCheck = checkEmissionCompliance(snapshot.vehicle_category); // Note: emission might be in different field
  if (!emissionCheck.allowed) {
    result.isBlocked = true;
    result.blockReasons.push(emissionCheck.reason!);
    result.rules_applied.push('EMISSION_COMPLIANCE_CHECK');
    return result;
  }

  // Get tyre count and axle count (inferred if not present)
  const tyreCount = snapshot.gvw_kg ? inferTyreCount(snapshot.gvw_kg) : undefined;
  const axleCount = tyreCount ? inferAxleCount(tyreCount) : undefined;

  // Classification logic
  if (tyreCount === 6 && axleCount === 2) {
    result.classification = 'SXL';
    result.bodyCategory = inferBodyCategory(snapshot);
    result.confidence = 0.9;
    result.rules_applied.push('TYRE_AXLE_CLASSIFICATION');
    
    // Check length constraint for SXL
    if (inferredLengthFt && inferredLengthFt > 20) {
      result.isBlocked = true;
      result.blockReasons.push(`INVALID_LENGTH_FOR_CLASS_SXL_${inferredLengthFt}ft`);
      result.rules_applied.push('LENGTH_CONSTRAINT_CHECK');
    }
  } else if (tyreCount === 10 && axleCount === 3) {
    result.classification = 'DXL';
    result.bodyCategory = inferBodyCategory(snapshot);
    result.confidence = 0.9;
    result.rules_applied.push('TYRE_AXLE_CLASSIFICATION');
  } else if (tyreCount === 12 && axleCount === 4) {
    result.classification = 'TXL';
    result.bodyCategory = inferBodyCategory(snapshot);
    result.confidence = 0.9;
    result.rules_applied.push('TYRE_AXLE_CLASSIFICATION');
  } else if (tyreCount === 14 && axleCount === 5) {
    result.classification = 'QXL';
    result.bodyCategory = inferBodyCategory(snapshot);
    result.confidence = 0.9;
    result.rules_applied.push('TYRE_AXLE_CLASSIFICATION');
  } else if (tyreCount === 16 && axleCount === 5) {
    result.classification = 'PXL';
    result.bodyCategory = inferBodyCategory(snapshot);
    result.confidence = 0.9;
    result.rules_applied.push('TYRE_AXLE_CLASSIFICATION');
  } else if (tyreCount === 18 && axleCount === 6) {
    result.classification = 'HX';
    result.bodyCategory = inferBodyCategory(snapshot);
    result.confidence = 0.9;
    result.rules_applied.push('TYRE_AXLE_CLASSIFICATION');
  } else if (tyreCount && tyreCount >= 18 && tyreCount <= 22) {
    result.classification = 'TRL';
    result.bodyCategory = inferTrailerCategory(snapshot);
    result.confidence = 0.8;
    result.rules_applied.push('TRAILER_CLASSIFICATION');
  } else {
    result.confidence = 0.3;
    result.blockReasons.push('UNKNOWN_FLEET_TYPE');
    result.rules_applied.push('UNKNOWN_CLASSIFICATION');
  }

  // GVW vs tyre sanity check
  if (result.classification && snapshot.gvw_kg) {
    const sanityCheck = checkGVWTyreSanity(result.classification, snapshot.gvw_kg, tyreCount);
    if (!sanityCheck.valid) {
      result.blockReasons.push(sanityCheck.reason!);
      result.isBlocked = true;
      result.rules_applied.push('GVW_TYRE_SANITY_CHECK');
    }
  }

  return result;
}

/**
 * Infer tyre count from GVW (fallback)
 */
function inferTyreCount(gvwKg: number): number {
  if (gvwKg < 10000) return 6;
  if (gvwKg < 20000) return 10;
  if (gvwKg < 30000) return 12;
  if (gvwKg < 40000) return 14;
  if (gvwKg < 50000) return 16;
  return 18;
}

/**
 * Infer axle count from tyre count
 */
function inferAxleCount(tyreCount: number): number {
  if (tyreCount === 6) return 2;
  if (tyreCount === 10) return 3;
  if (tyreCount === 12) return 4;
  if (tyreCount === 14 || tyreCount === 16) return 5;
  if (tyreCount === 18) return 6;
  return 0;
}

/**
 * Infer body category
 */
function inferBodyCategory(snapshot: VahanSnapshot): BodyCategory {
  const bodyTypeUpper = (snapshot.body_type_name || '').toUpperCase();
  
  if (/CONTAINER|BOX|CLOSED/i.test(bodyTypeUpper)) {
    return 'CONTAINER';
  }
  if (/FLATBED|FLAT/i.test(bodyTypeUpper)) {
    return 'FLATBED';
  }
  if (/LOWBED|LOW/i.test(bodyTypeUpper)) {
    return 'LOWBED';
  }
  
  if (snapshot.vehicle_category === 'GOODS') {
    return 'OPEN_BODY';
  }
  
  return 'OPEN_BODY';
}

/**
 * Infer trailer category
 */
function inferTrailerCategory(snapshot: VahanSnapshot): BodyCategory {
  const bodyTypeUpper = (snapshot.body_type_name || '').toUpperCase();
  
  if (/CONTAINER/i.test(bodyTypeUpper)) return 'CONTAINER';
  if (/FLATBED|FLAT/i.test(bodyTypeUpper)) return 'FLATBED';
  if (/LOWBED|LOW/i.test(bodyTypeUpper)) return 'LOWBED';
  if (/SKELETAL|SKELETON/i.test(bodyTypeUpper)) return 'SKELETAL';
  
  return 'CONTAINER';
}

/**
 * Check GVW vs tyre count sanity
 */
function checkGVWTyreSanity(
  classification: FleetClassification,
  gvwKg: number,
  tyreCount?: number
): { valid: boolean; reason?: string } {
  if (!gvwKg) return { valid: true };
  
  const ranges = tyreGvwRules.sanity_ranges;
  const range = ranges[classification];
  
  if (!range) return { valid: true };
  
  // Check GVW range
  if (gvwKg < range.gvw_min_kg || gvwKg > range.gvw_max_kg) {
    return {
      valid: false,
      reason: `GVW_OUT_OF_RANGE_${classification}_${gvwKg}kg`,
    };
  }
  
  // Check tyre count if provided
  if (tyreCount && 'tyre_count' in range) {
    if (tyreCount !== range.tyre_count) {
      return {
        valid: false,
        reason: `TYRE_COUNT_MISMATCH_${classification}_expected_${range.tyre_count}_got_${tyreCount}`,
      };
    }
  }
  
  return { valid: true };
}

