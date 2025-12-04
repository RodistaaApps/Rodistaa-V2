/**
 * VAHAN Normalizer
 * Normalize raw provider JSON to canonical VahanSnapshot shape
 * Robust parsing for body_code, body_type strings
 */

export interface VahanSnapshot {
  rcNumber: string;
  stateCode: string;
  chassisNumber: string;
  engineNumber: string;
  bodyCode?: string;
  bodyTypeString?: string;
  maker?: string;
  model?: string;
  gvwKg?: number;
  tyreCount?: number;
  axleCount?: number;
  emissionCode?: string;
  permitType?: string;
  permitValidUntil?: string;
  fitnessValidUntil?: string;
  ownerName?: string;
  registrationDate?: string;
  vehicleCategory?: string; // GOODS, PASSENGER, etc.
  fuelType?: string;
  color?: string;
  norm?: string;
  vehicleClass?: string;
  // Additional fields from providers
  [key: string]: any;
}

/**
 * Normalize Parivahan response
 */
function normalizeParivahan(raw: any): VahanSnapshot {
  return {
    rcNumber: raw.rc_number || raw.rcNumber || '',
    stateCode: raw.state_code || raw.stateCode || '',
    chassisNumber: raw.chassis_number || raw.chassisNumber || '',
    engineNumber: raw.engine_number || raw.engineNumber || '',
    bodyCode: raw.body_code || raw.bodyCode || undefined,
    bodyTypeString: raw.body_type || raw.bodyType || raw.body_type_string || undefined,
    maker: raw.maker || raw.manufacturer || undefined,
    model: raw.model || raw.model_name || undefined,
    gvwKg: parseNumber(raw.gvw) || parseNumber(raw.gvw_kg) || undefined,
    tyreCount: parseNumber(raw.tyre_count) || parseNumber(raw.tyres) || undefined,
    axleCount: parseNumber(raw.axle_count) || parseNumber(raw.axles) || undefined,
    emissionCode: normalizeEmissionCode(raw.emission_norm || raw.emission_code || raw.bs),
    permitType: raw.permit_type || raw.permitType || undefined,
    permitValidUntil: raw.permit_valid_until || raw.permitValidUntil || undefined,
    fitnessValidUntil: raw.fitness_valid_until || raw.fitnessValidUntil || undefined,
    ownerName: raw.owner_name || raw.ownerName || undefined,
    registrationDate: raw.registration_date || raw.registrationDate || undefined,
    vehicleCategory: raw.vehicle_category || raw.vehicleCategory || undefined,
    fuelType: raw.fuel_type || raw.fuelType || undefined,
    color: raw.color || undefined,
    norm: raw.norm || undefined,
    vehicleClass: raw.vehicle_class || raw.vehicleClass || undefined,
  };
}

/**
 * Normalize Surepass response
 */
function normalizeSurepass(raw: any): VahanSnapshot {
  // Surepass may have different field names
  return {
    rcNumber: raw.rc_number || raw.rcNumber || raw.registration_number || '',
    stateCode: extractStateCode(raw.rc_number || raw.rcNumber || ''),
    chassisNumber: raw.chassis_no || raw.chassis_number || raw.chassisNumber || '',
    engineNumber: raw.engine_no || raw.engine_number || raw.engineNumber || '',
    bodyCode: raw.body_code || raw.bodyCode || undefined,
    bodyTypeString: raw.body_type || raw.bodyType || raw.body_description || undefined,
    maker: raw.maker_name || raw.maker || raw.manufacturer || undefined,
    model: raw.model || raw.model_name || undefined,
    gvwKg: parseNumber(raw.gross_vehicle_weight) || parseNumber(raw.gvw) || parseNumber(raw.gvw_kg) || undefined,
    tyreCount: parseNumber(raw.no_of_tyres) || parseNumber(raw.tyre_count) || parseNumber(raw.tyres) || undefined,
    axleCount: parseNumber(raw.no_of_axles) || parseNumber(raw.axle_count) || parseNumber(raw.axles) || undefined,
    emissionCode: normalizeEmissionCode(raw.emission_norm || raw.emission_code || raw.bs_norm),
    permitType: raw.permit_type || raw.permitType || undefined,
    permitValidUntil: raw.permit_valid_upto || raw.permit_valid_until || raw.permitValidUntil || undefined,
    fitnessValidUntil: raw.fitness_valid_upto || raw.fitness_valid_until || raw.fitnessValidUntil || undefined,
    ownerName: raw.owner_name || raw.ownerName || raw.owner || undefined,
    registrationDate: raw.registration_date || raw.registrationDate || undefined,
    vehicleCategory: raw.vehicle_category || raw.vehicleCategory || undefined,
    fuelType: raw.fuel_type || raw.fuelType || undefined,
    color: raw.color || undefined,
    norm: raw.norm || undefined,
    vehicleClass: raw.vehicle_class || raw.vehicleClass || undefined,
  };
}

/**
 * Normalize Backup provider response
 */
function normalizeBackup(raw: any): VahanSnapshot {
  // Backup provider normalization (similar to Surepass)
  return normalizeSurepass(raw);
}

/**
 * Extract state code from RC number
 */
function extractStateCode(rcNumber: string): string {
  if (!rcNumber || rcNumber.length < 2) return '';
  return rcNumber.substring(0, 2).toUpperCase();
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
 * Normalize emission code to BS format
 */
function normalizeEmissionCode(value: any): string | undefined {
  if (!value) return undefined;
  const str = String(value).toUpperCase().trim();
  
  // Handle various formats: BS4, BS-IV, BS 4, etc.
  const match = str.match(/BS[-\s]?([IVX0-9]+)/i);
  if (match) {
    const version = match[1];
    // Convert Roman numerals to numbers
    const romanMap: Record<string, string> = {
      'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5', 'VI': '6',
    };
    const normalized = romanMap[version] || version;
    return `BS${normalized}`;
  }
  
  // Handle direct number format
  if (/^[0-9]+$/.test(str)) {
    return `BS${str}`;
  }
  
  return str;
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
      // Fallback: try to normalize generically
      return normalizeParivahan(raw);
  }
}

/**
 * Validate normalized snapshot has minimum required fields
 */
export function validateSnapshot(snapshot: VahanSnapshot): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!snapshot.rcNumber || snapshot.rcNumber.trim() === '') {
    errors.push('RC number is required');
  }

  if (!snapshot.chassisNumber || snapshot.chassisNumber.trim() === '') {
    errors.push('Chassis number is required');
  }

  if (!snapshot.engineNumber || snapshot.engineNumber.trim() === '') {
    errors.push('Engine number is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

