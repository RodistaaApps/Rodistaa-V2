/**
 * Body Type Classifier
 * Regex-based classification for blocked types and fleet matrix mapping
 */

import fleetMatrix from '../data/rodistaa_fleet_matrix.json';

export type FleetClassification = 'SXL' | 'DXL' | 'TXL' | 'QXL' | 'PXL' | 'HX' | 'TRL';
export type BodyCategory = 'OPEN_BODY' | 'CONTAINER' | 'FLATBED' | 'LOWBED' | 'SKELETAL' | 'BLOCKED';

export interface ClassificationResult {
  classification?: FleetClassification;
  bodyCategory?: BodyCategory;
  isBlocked: boolean;
  blockReasons: string[];
  confidence: number;
}

export interface VahanSnapshot {
  rcNumber: string;
  bodyCode?: string;
  bodyTypeString?: string;
  gvwKg?: number;
  tyreCount?: number;
  axleCount?: number;
  emissionCode?: string;
  permitType?: string;
  vehicleCategory?: string;
  [key: string]: any;
}

/**
 * Load blocked patterns from fleet matrix
 */
function getBlockedPatterns(): string[] {
  return fleetMatrix.blocked_patterns.body_type_keywords || [];
}

/**
 * Check if body type is blocked
 */
export function isBlockedBodyType(snapshot: VahanSnapshot): { blocked: boolean; reason?: string } {
  const blockedPatterns = getBlockedPatterns();
  const bodyTypeUpper = (snapshot.bodyTypeString || '').toUpperCase();
  const bodyCodeStr = String(snapshot.bodyCode || '');

  // Check body type string
  for (const pattern of blockedPatterns) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(bodyTypeUpper)) {
      return {
        blocked: true,
        reason: `INVALID_BODY_${pattern}`,
      };
    }
  }

  // Check body code against blocked list
  const blockedCodes = fleetMatrix.blocked_patterns.body_code_blocked || [];
  if (blockedCodes.includes(bodyCodeStr)) {
    return {
      blocked: true,
      reason: `INVALID_BODY_CODE_${bodyCodeStr}`,
    };
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

  const blockedCodes = fleetMatrix.blocked_patterns.emission_codes_blocked || [];
  const emissionUpper = emissionCode.toUpperCase();

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
 * Classify fleet type based on axles, tyres, and length
 */
export function classifyFleetType(snapshot: VahanSnapshot): ClassificationResult {
  const result: ClassificationResult = {
    isBlocked: false,
    blockReasons: [],
    confidence: 0,
  };

  // Check blocked body types first
  const blockedCheck = isBlockedBodyType(snapshot);
  if (blockedCheck.blocked) {
    result.isBlocked = true;
    result.blockReasons.push(blockedCheck.reason!);
    return result;
  }

  // Check emission compliance
  const emissionCheck = checkEmissionCompliance(snapshot.emissionCode);
  if (!emissionCheck.allowed) {
    result.isBlocked = true;
    result.blockReasons.push(emissionCheck.reason!);
    return result;
  }

  const axleCount = snapshot.axleCount;
  const tyreCount = snapshot.tyreCount;
  const gvwKg = snapshot.gvwKg;

  // Classification logic based on axles and tyres
  if (axleCount === 2 && tyreCount === 6) {
    result.classification = 'SXL';
    result.bodyCategory = inferBodyCategory(snapshot);
    result.confidence = 0.9;
  } else if (axleCount === 3 && tyreCount === 10) {
    result.classification = 'DXL';
    result.bodyCategory = inferBodyCategory(snapshot);
    result.confidence = 0.9;
  } else if (axleCount === 4 && tyreCount === 12) {
    result.classification = 'TXL';
    result.bodyCategory = inferBodyCategory(snapshot);
    result.confidence = 0.9;
  } else if (axleCount === 5 && tyreCount === 14) {
    result.classification = 'QXL';
    result.bodyCategory = inferBodyCategory(snapshot);
    result.confidence = 0.9;
  } else if (axleCount === 5 && tyreCount === 16) {
    result.classification = 'PXL';
    result.bodyCategory = inferBodyCategory(snapshot);
    result.confidence = 0.9;
  } else if (axleCount === 6 && tyreCount === 18) {
    result.classification = 'HX';
    result.bodyCategory = inferBodyCategory(snapshot);
    result.confidence = 0.9;
  } else if (tyreCount && tyreCount >= 18 && tyreCount <= 22) {
    // Trailer classification
    result.classification = 'TRL';
    result.bodyCategory = inferTrailerCategory(snapshot);
    result.confidence = 0.8;
  } else {
    // Unable to classify
    result.confidence = 0.3;
    result.blockReasons.push('UNKNOWN_FLEET_TYPE');
  }

  // GVW vs tyre sanity check
  if (result.classification) {
    const sanityCheck = checkGVWTyreSanity(result.classification, gvwKg, tyreCount);
    if (!sanityCheck.valid) {
      result.blockReasons.push(sanityCheck.reason!);
      result.isBlocked = true;
    }
  }

  return result;
}

/**
 * Infer body category from snapshot
 */
function inferBodyCategory(snapshot: VahanSnapshot): BodyCategory {
  const bodyTypeUpper = (snapshot.bodyTypeString || '').toUpperCase();
  const bodyCode = String(snapshot.bodyCode || '');

  if (/CONTAINER|BOX|CLOSED/i.test(bodyTypeUpper)) {
    return 'CONTAINER';
  }
  if (/FLATBED|FLAT/i.test(bodyTypeUpper)) {
    return 'FLATBED';
  }
  if (/LOWBED|LOW/i.test(bodyTypeUpper)) {
    return 'LOWBED';
  }
  if (/TRAILER/i.test(bodyTypeUpper)) {
    return inferTrailerCategory(snapshot);
  }

  // Default to OPEN_BODY for goods vehicles
  if (snapshot.vehicleCategory === 'GOODS') {
    return 'OPEN_BODY';
  }

  return 'OPEN_BODY';
}

/**
 * Infer trailer category
 */
function inferTrailerCategory(snapshot: VahanSnapshot): BodyCategory {
  const bodyTypeUpper = (snapshot.bodyTypeString || '').toUpperCase();

  if (/CONTAINER/i.test(bodyTypeUpper)) {
    return 'CONTAINER';
  }
  if (/FLATBED|FLAT/i.test(bodyTypeUpper)) {
    return 'FLATBED';
  }
  if (/LOWBED|LOW/i.test(bodyTypeUpper)) {
    return 'LOWBED';
  }
  if (/SKELETAL|SKELETON/i.test(bodyTypeUpper)) {
    return 'SKELETAL';
  }

  return 'CONTAINER'; // Default trailer type
}

/**
 * Check GVW vs tyre count sanity
 */
function checkGVWTyreSanity(
  classification: FleetClassification,
  gvwKg?: number,
  tyreCount?: number
): { valid: boolean; reason?: string } {
  if (!gvwKg || !tyreCount) {
    return { valid: true }; // Skip if data missing
  }

  const ranges = fleetMatrix.validation_rules.gvw_tyre_sanity_ranges;
  const range = ranges[classification];

  if (!range) {
    return { valid: true }; // No range defined
  }

  // Check GVW range
  if (gvwKg < range.gvw_min_kg || gvwKg > range.gvw_max_kg) {
    return {
      valid: false,
      reason: `GVW_OUT_OF_RANGE_${classification}_${gvwKg}kg`,
    };
  }

  // Check tyre count
  if ('tyres' in range) {
    if (tyreCount !== range.tyres) {
      return {
        valid: false,
        reason: `TYRE_COUNT_MISMATCH_${classification}_expected_${range.tyres}_got_${tyreCount}`,
      };
    }
  } else if ('tyres_min' in range && 'tyres_max' in range) {
    if (tyreCount < range.tyres_min || tyreCount > range.tyres_max) {
      return {
        valid: false,
        reason: `TYRE_COUNT_OUT_OF_RANGE_${classification}_${tyreCount}`,
      };
    }
  }

  return { valid: true };
}

