/**
 * VAHAN Normalizer
 * Normalize provider responses to canonical VahanSnapshot shape
 * Robust parsing for body_code variations
 */

import type { VahanSnapshot } from '../models/vahanSnapshot';

/**
 * Parse body code from various formats
 */
function parseBodyCode(value: any): string | undefined {
  if (!value) return undefined;
  
  // If already a string/number, return as string
  if (typeof value === 'string') {
    // Strip whitespace and extract digits
    const digits = value.trim().replace(/[^0-9]/g, '');
    return digits || undefined;
  }
  
  if (typeof value === 'number') {
    return String(value);
  }
  
  return undefined;
}

/**
 * Parse body type name from various formats
 */
function parseBodyTypeName(value: any): string | undefined {
  if (!value) return undefined;
  
  if (typeof value === 'string') {
    return value.trim().toUpperCase();
  }
  
  return undefined;
}

/**
 * Parse number from various formats
 */
function parseNumber(value: any): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Parse date string
 */
function parseDate(value: any): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString().split('T')[0];
  if (typeof value === 'string') {
    // Try to parse and normalize
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  return undefined;
}

/**
 * Extract state code from RC number
 */
function extractStateCode(rcNumber: string): string {
  if (!rcNumber || rcNumber.length < 2) return '';
  return rcNumber.substring(0, 2).toUpperCase();
}

/**
 * Normalize Parivahan response
 */
function normalizeParivahan(raw: any): VahanSnapshot {
  return {
    rc_number: raw.rc_number || raw.rcNumber || '',
    state_code: raw.state_code || raw.stateCode || extractStateCode(raw.rc_number || ''),
    maker: raw.maker || raw.manufacturer || undefined,
    model_name: raw.model_name || raw.modelName || raw.model || undefined,
    model_code: raw.model_code || raw.modelCode || undefined,
    gvw_kg: parseNumber(raw.gvw_kg || raw.gvwKg || raw.gvw),
    ulw_kg: parseNumber(raw.ulw_kg || raw.ulwKg || raw.ulw),
    wheelbase_mm: parseNumber(raw.wheelbase_mm || raw.wheelbaseMm || raw.wheelbase),
    body_type_code: parseBodyCode(raw.body_type_code || raw.bodyCode || raw.body_code),
    body_type_name: parseBodyTypeName(raw.body_type_name || raw.bodyType || raw.body_type_string),
    vehicle_category: raw.vehicle_category || raw.vehicleCategory || undefined,
    permit_type: raw.permit_type || raw.permitType || undefined,
    permit_valid_upto: parseDate(raw.permit_valid_upto || raw.permitValidUntil || raw.permit_valid_until),
    fitness_valid_upto: parseDate(raw.fitness_valid_upto || raw.fitnessValidUntil || raw.fitness_valid_until),
    insurance_valid_upto: parseDate(raw.insurance_valid_upto || raw.insuranceValidUntil || raw.insurance_valid_until),
    puc_valid_upto: parseDate(raw.puc_valid_upto || raw.pucValidUntil || raw.puc_valid_upto),
    registration_status: raw.registration_status || raw.registrationStatus || undefined,
    chassis_number: raw.chassis_number || raw.chassisNumber || raw.chassis_no || '',
    engine_number: raw.engine_number || raw.engineNumber || raw.engine_no || '',
    txn_id: raw.txn_id || raw.txnId || raw.transaction_id,
    provider: 'PARIVAHAN',
    vahan_timestamp: raw.timestamp || raw.verified_at || new Date().toISOString(),
    raw_json: raw,
  };
}

/**
 * Normalize Surepass response
 */
function normalizeSurepass(raw: any): VahanSnapshot {
  return {
    rc_number: raw.rc_number || raw.rcNumber || raw.registration_number || '',
    state_code: extractStateCode(raw.rc_number || raw.rcNumber || ''),
    maker: raw.maker_name || raw.maker || raw.manufacturer || undefined,
    model_name: raw.model_name || raw.model || undefined,
    model_code: raw.model_code || undefined,
    gvw_kg: parseNumber(raw.gross_vehicle_weight || raw.gvw_kg || raw.gvw),
    ulw_kg: parseNumber(raw.unladen_weight || raw.ulw_kg || raw.ulw),
    wheelbase_mm: parseNumber(raw.wheelbase_mm || raw.wheelbase),
    body_type_code: parseBodyCode(raw.body_code || raw.bodyCode),
    body_type_name: parseBodyTypeName(raw.body_type || raw.bodyType || raw.body_description),
    vehicle_category: raw.vehicle_category || raw.vehicleCategory || undefined,
    permit_type: raw.permit_type || raw.permitType || undefined,
    permit_valid_upto: parseDate(raw.permit_valid_upto || raw.permit_valid_upto || raw.permitValidUntil),
    fitness_valid_upto: parseDate(raw.fitness_valid_upto || raw.fitness_valid_upto || raw.fitnessValidUntil),
    insurance_valid_upto: parseDate(raw.insurance_valid_upto || raw.insurance_valid_upto || raw.insuranceValidUntil),
    puc_valid_upto: parseDate(raw.puc_valid_upto || raw.puc_valid_upto || raw.pucValidUntil),
    registration_status: raw.registration_status || raw.registrationStatus || undefined,
    chassis_number: raw.chassis_no || raw.chassis_number || raw.chassisNumber || '',
    engine_number: raw.engine_no || raw.engine_number || raw.engineNumber || '',
    txn_id: raw.txn_id || raw.txnId || raw.transaction_id,
    provider: 'SUREPASS',
    vahan_timestamp: raw.timestamp || raw.verified_at || new Date().toISOString(),
    raw_json: raw,
  };
}

/**
 * Normalize Backup provider response
 */
function normalizeBackup(raw: any): VahanSnapshot {
  // Similar to Surepass
  return normalizeSurepass(raw);
}

/**
 * Normalize raw provider response to canonical VahanSnapshot
 */
export function normalizeVahanResponse(
  raw: any,
  provider: 'PARIVAHAN' | 'SUREPASS' | 'BACKUP'
): VahanSnapshot {
  switch (provider) {
    case 'PARIVAHAN':
      return normalizeParivahan(raw);
    case 'SUREPASS':
      return normalizeSurepass(raw);
    case 'BACKUP':
      return normalizeBackup(raw);
    default:
      return normalizeParivahan(raw);
  }
}

/**
 * Validate normalized snapshot has minimum required fields
 */
export function validateSnapshot(snapshot: VahanSnapshot): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!snapshot.rc_number || snapshot.rc_number.trim() === '') {
    errors.push('RC number is required');
  }

  if (!snapshot.chassis_number || snapshot.chassis_number.trim() === '') {
    errors.push('Chassis number is required');
  }

  if (!snapshot.engine_number || snapshot.engine_number.trim() === '') {
    errors.push('Engine number is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

