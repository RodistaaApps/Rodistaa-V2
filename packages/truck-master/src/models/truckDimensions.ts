/**
 * Truck Dimensions Models
 * TypeScript interfaces for truck onboarding with body length and tyre count
 */

export type TyreCount = 6 | 10 | 12 | 14 | 16 | 18 | 20 | 22;
export type BodyType = 'OPEN' | 'CONTAINER' | 'FLATBED' | 'LOWBED' | 'TRAILER' | 'OTHER';
export type ComplianceStatus = 'PENDING' | 'ACTIVE' | 'BLOCKED';
export type FlagCode = 
  | 'LENGTH_MISMATCH_WARNING'
  | 'TYRE_COUNT_UNUSUAL'
  | 'REQUIRES_PHOTO_VERIFICATION'
  | 'PAYLOAD_TYRE_MISMATCH'
  | 'UNRECOGNIZED_TYRE_COUNT'
  | 'CANNOT_CLASSIFY'
  | 'PERSISTENT_MISMATCH'
  | 'VAHAN_DISCREPANCY'
  | 'DUPLICATE_CHASSIS'
  | 'DUPLICATE_ENGINE';

/**
 * Truck Create DTO - Required fields for onboarding
 */
export interface TruckCreateDTO {
  operator_id: string;
  rc_number: string;
  tyre_count: TyreCount;
  body_length_ft: number;
  body_type: BodyType;
  rc_copy: Buffer; // File buffer
  payload_kg?: number;
  axle_count?: number;
  nickname?: string;
}

/**
 * Truck Record - Database representation
 */
export interface TruckRecord {
  id: number;
  operator_id: string;
  rc_number: string;
  nickname?: string;
  rc_copy_bytea: Buffer; // Encrypted
  chassis_hash: string; // SHA256
  engine_hash: string; // SHA256
  tyre_count: TyreCount;
  body_length_ft: number;
  body_type: BodyType;
  payload_kg?: number;
  axle_count?: number;
  vahan_snapshot?: VahanSnapshot;
  flags: FlagRecord[];
  flags_history: FlagRecord[];
  compliance_status: ComplianceStatus;
  last_verified_at?: Date;
  status: string; // Legacy field
  created_at: Date;
  updated_at: Date;
}

/**
 * VAHAN Snapshot - Canonical structure
 */
export interface VahanSnapshot {
  provider: 'PARIVAHAN' | 'SUREPASS' | 'BACKUP';
  txn_id: string;
  raw_json: any;
  fetched_at: Date;
  
  // Canonical fields
  maker?: string;
  model_name?: string;
  body_type_code?: string;
  body_type_name?: string;
  vehicle_category?: string;
  chassis_number?: string;
  engine_number?: string;
  gvw_kg?: number;
  ulw_kg?: number;
  wheelbase_mm?: number;
  permit_valid_upto?: Date;
  fitness_valid_upto?: Date;
  insurance_valid_upto?: Date;
  registration_status?: string;
}

/**
 * Flag Record
 */
export interface FlagRecord {
  flag_code: FlagCode;
  meta: {
    reason?: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    operator_declared?: any;
    vahan_value?: any;
    first_seen_at?: string;
    occurrence_count?: number;
  };
  created_at: string;
  resolved_by?: string;
  resolved_at?: string;
}

/**
 * Franchise Task
 */
export interface FranchiseTask {
  id: number;
  truck_id: number;
  task_type: 'PHOTO_VERIFY' | 'MANUAL_VERIFY' | 'DOCUMENT_REVIEW';
  assigned_franchise_id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  payload: {
    required_photos?: string[];
    instructions?: string;
    flags_to_verify?: FlagCode[];
  };
  created_at: Date;
  due_at: Date;
  completed_at?: Date;
  completed_by?: string;
  result?: {
    verified: boolean;
    photos_urls: string[];
    notes: string;
  };
  notes?: string;
}

/**
 * Admin Ticket
 */
export interface AdminTicket {
  id: number;
  truck_id?: number;
  operator_id?: string;
  reason_code: FlagCode | string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assigned_to?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  notes: {
    description: string;
    flags: FlagCode[];
    provider_data?: any;
    operator_data?: any;
  };
  created_at: Date;
  resolved_at?: Date;
  resolved_by?: string;
}

/**
 * Typical Length by Tyre Count Mapping
 */
export const TYPICAL_LENGTH_BY_TYRE: Record<TyreCount, { min: number; max: number; common: number[] }> = {
  6: { min: 12, max: 18, common: [14, 16, 18] },
  10: { min: 18, max: 24, common: [20, 22, 24] },
  12: { min: 22, max: 28, common: [24, 26, 28] },
  14: { min: 24, max: 30, common: [26, 28, 30] },
  16: { min: 26, max: 32, common: [28, 30, 32] },
  18: { min: 28, max: 40, common: [30, 32, 40] }, // Trailers
  20: { min: 30, max: 45, common: [32, 40, 45] }, // Trailers
  22: { min: 32, max: 45, common: [40, 45] }, // Large trailers
};

/**
 * Allowed Body Length Values (in feet)
 */
export const ALLOWED_BODY_LENGTHS = [
  12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 40, 42, 45
];

