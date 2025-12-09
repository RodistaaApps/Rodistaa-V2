/**
 * Truck Input Validator and Flag Computation
 * Validates operator-declared fields and computes flags based on rules
 */

import {
  TruckCreateDTO,
  FlagRecord,
  FlagCode,
  TyreCount,
  TYPICAL_LENGTH_BY_TYRE,
  ALLOWED_BODY_LENGTHS,
  VahanSnapshot,
} from '../models/truckDimensions';
import { query } from '../db';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  flags: FlagRecord[];
}

/**
 * Validate truck input
 */
export function validateTruckInput(dto: TruckCreateDTO): ValidationResult {
  const errors: string[] = [];
  const flags: FlagRecord[] = [];

  // Validate tyre_count
  const validTyreCounts: TyreCount[] = [6, 10, 12, 14, 16, 18, 20, 22];
  if (!validTyreCounts.includes(dto.tyre_count)) {
    errors.push(`tyre_count must be one of: ${validTyreCounts.join(', ')}`);
    flags.push(createFlag('UNRECOGNIZED_TYRE_COUNT', {
      operator_declared: dto.tyre_count,
    }));
  }

  // Validate body_length_ft
  if (!ALLOWED_BODY_LENGTHS.includes(dto.body_length_ft)) {
    errors.push(`body_length_ft must be one of: ${ALLOWED_BODY_LENGTHS.join(', ')}`);
  }

  // Validate body_type
  const validBodyTypes = ['OPEN', 'CONTAINER', 'FLATBED', 'LOWBED', 'TRAILER', 'OTHER'];
  if (!validBodyTypes.includes(dto.body_type)) {
    errors.push(`body_type must be one of: ${validBodyTypes.join(', ')}`);
  }

  // Validate RC number format (basic check)
  if (!dto.rc_number || dto.rc_number.trim().length < 10) {
    errors.push('rc_number is required and must be at least 10 characters');
  }

  // Validate RC copy
  if (!dto.rc_copy || dto.rc_copy.length === 0) {
    errors.push('rc_copy is required');
  }

  // Validate payload if provided
  if (dto.payload_kg !== undefined && dto.payload_kg < 0) {
    errors.push('payload_kg must be non-negative');
  }

  // Validate axle_count if provided
  if (dto.axle_count !== undefined && (dto.axle_count < 2 || dto.axle_count > 10)) {
    errors.push('axle_count must be between 2 and 10');
  }

  return {
    valid: errors.length === 0,
    errors,
    flags,
  };
}

/**
 * Compute flags based on operator-declared data and VAHAN snapshot
 */
export async function computeFlags(
  dto: TruckCreateDTO,
  vahanSnapshot?: VahanSnapshot
): Promise<FlagRecord[]> {
  const flags: FlagRecord[] = [];

  // Flag: LENGTH_MISMATCH_WARNING - body length outside typical range for tyre_count
  const typicalRange = TYPICAL_LENGTH_BY_TYRE[dto.tyre_count];
  if (dto.body_length_ft < typicalRange.min || dto.body_length_ft > typicalRange.max) {
    flags.push(createFlag('LENGTH_MISMATCH_WARNING', {
      reason: `Body length ${dto.body_length_ft}ft is outside typical range ${typicalRange.min}-${typicalRange.max}ft for ${dto.tyre_count}-tyre vehicles`,
      operator_declared: {
        tyre_count: dto.tyre_count,
        body_length_ft: dto.body_length_ft,
      },
      severity: 'LOW',
    }));
  }

  // Flag: TYRE_COUNT_UNUSUAL - check against OEM model mapping (if available)
  if (vahanSnapshot?.maker && vahanSnapshot?.model_name) {
    const oemMapping = await getOemTypicalTyreCount(vahanSnapshot.maker, vahanSnapshot.model_name);
    if (oemMapping && !oemMapping.includes(dto.tyre_count)) {
      flags.push(createFlag('TYRE_COUNT_UNUSUAL', {
        reason: `Tyre count ${dto.tyre_count} is unusual for ${vahanSnapshot.maker} ${vahanSnapshot.model_name}`,
        operator_declared: dto.tyre_count,
        vahan_value: oemMapping,
        severity: 'MEDIUM',
      }));
    }
  }

  // Flag: PAYLOAD_TYRE_MISMATCH - if payload declared, check against GVW/tyre ratio
  if (dto.payload_kg && vahanSnapshot?.gvw_kg) {
    const payloadRatio = dto.payload_kg / dto.tyre_count;
    const typicalMaxPayloadPerTyre = vahanSnapshot.gvw_kg / dto.tyre_count;
    
    if (payloadRatio > typicalMaxPayloadPerTyre * 1.2) {
      flags.push(createFlag('PAYLOAD_TYRE_MISMATCH', {
        reason: `Declared payload ${dto.payload_kg}kg appears inconsistent with GVW ${vahanSnapshot.gvw_kg}kg for ${dto.tyre_count} tyres`,
        operator_declared: dto.payload_kg,
        vahan_value: vahanSnapshot.gvw_kg,
        severity: 'MEDIUM',
      }));
    }
  }

  // Flag: VAHAN_DISCREPANCY - compare critical fields if VAHAN data available
  if (vahanSnapshot) {
    // Check body type mismatch
    if (vahanSnapshot.body_type_code && !matchesBodyType(dto.body_type, vahanSnapshot.body_type_name)) {
      flags.push(createFlag('VAHAN_DISCREPANCY', {
        reason: `Body type mismatch: operator declared ${dto.body_type}, VAHAN shows ${vahanSnapshot.body_type_name}`,
        operator_declared: dto.body_type,
        vahan_value: vahanSnapshot.body_type_name,
        severity: 'HIGH',
      }));
    }

    // Check for blocked body types (tipper, dumper, tanker, etc.)
    const blockedTypes = ['TIPPER', 'DUMPER', 'TANKER', 'COWL', 'CHASSIS', 'CAB-CHASSIS'];
    const vahanBodyType = vahanSnapshot.body_type_name?.toUpperCase() || '';
    if (blockedTypes.some(blocked => vahanBodyType.includes(blocked))) {
      flags.push(createFlag('VAHAN_DISCREPANCY', {
        reason: `VAHAN body type ${vahanSnapshot.body_type_name} is blocked (${blockedTypes.join('/')})`,
        vahan_value: vahanSnapshot.body_type_name,
        severity: 'CRITICAL',
      }));
    }
  }

  // Flag: REQUIRES_PHOTO_VERIFICATION - if length mismatch or unusual config
  const hasLengthMismatch = flags.some(f => f.flag_code === 'LENGTH_MISMATCH_WARNING');
  const hasUnusualConfig = flags.some(f => f.flag_code === 'TYRE_COUNT_UNUSUAL');
  
  if (hasLengthMismatch || hasUnusualConfig) {
    flags.push(createFlag('REQUIRES_PHOTO_VERIFICATION', {
      reason: 'Photo verification required due to unusual configuration',
      severity: 'MEDIUM',
    }));
  }

  return flags;
}

/**
 * Create a flag record
 */
function createFlag(code: FlagCode, meta: FlagRecord['meta']): FlagRecord {
  return {
    flag_code: code,
    meta: {
      ...meta,
      first_seen_at: new Date().toISOString(),
      occurrence_count: 1,
    },
    created_at: new Date().toISOString(),
  };
}

/**
 * Get typical tyre counts for OEM model from database
 */
async function getOemTypicalTyreCount(
  maker: string,
  modelName: string
): Promise<TyreCount[] | null> {
  try {
    const result = await query<{ typical_tyre_count: TyreCount[] }>(
      `SELECT typical_tyre_count 
       FROM oem_model_bodylength 
       WHERE maker = $1 AND model_name = $2 AND is_active = TRUE
       LIMIT 1`,
      [maker, modelName]
    );

    return result.rows[0]?.typical_tyre_count || null;
  } catch (error) {
    console.error('Error fetching OEM mapping:', error);
    return null;
  }
}

/**
 * Check if operator-declared body type matches VAHAN body type
 */
function matchesBodyType(declared: string, vahanBodyType?: string): boolean {
  if (!vahanBodyType) return true; // No VAHAN data, assume match

  const vahanUpper = vahanBodyType.toUpperCase();
  const declaredUpper = declared.toUpperCase();

  // Basic matching logic
  if (declaredUpper === 'OPEN' && (vahanUpper.includes('OPEN') || vahanUpper.includes('GOODS'))) {
    return true;
  }
  if (declaredUpper === 'CONTAINER' && vahanUpper.includes('CONTAINER')) {
    return true;
  }
  if (declaredUpper === 'FLATBED' && (vahanUpper.includes('FLAT') || vahanUpper.includes('PLATFORM'))) {
    return true;
  }
  if (declaredUpper === 'LOWBED' && vahanUpper.includes('LOW')) {
    return true;
  }
  if (declaredUpper === 'TRAILER' && (vahanUpper.includes('TRAILER') || vahanUpper.includes('SEMI'))) {
    return true;
  }

  return false; // Mismatch
}

/**
 * Check for persistent mismatch (same flag 3+ times)
 */
export function checkPersistentMismatch(flagsHistory: FlagRecord[]): FlagCode[] {
  const flagCounts = new Map<FlagCode, number>();
  const persistentFlags: FlagCode[] = [];

  // Count occurrences of each flag code
  for (const flag of flagsHistory) {
    if (!flag.resolved_at) {
      const count = flagCounts.get(flag.flag_code) || 0;
      flagCounts.set(flag.flag_code, count + 1);
    }
  }

  // Find flags that occurred 3+ times
  for (const [code, count] of flagCounts.entries()) {
    if (count >= 3) {
      persistentFlags.push(code);
    }
  }

  return persistentFlags;
}

