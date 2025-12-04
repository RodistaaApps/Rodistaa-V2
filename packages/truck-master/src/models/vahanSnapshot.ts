/**
 * VAHAN Snapshot Models
 * Canonical shape for VAHAN vehicle data
 */

export interface VahanSnapshot {
  rc_number: string;
  state_code?: string;
  maker?: string;
  model_name?: string;
  model_code?: string;
  gvw_kg?: number;
  ulw_kg?: number;
  wheelbase_mm?: number;
  body_type_code?: string;
  body_type_name?: string;
  vehicle_category?: string; // GOODS, PASSENGER, etc.
  permit_type?: string;
  permit_valid_upto?: string; // ISO date string
  fitness_valid_upto?: string; // ISO date string
  insurance_valid_upto?: string; // ISO date string
  puc_valid_upto?: string; // ISO date string
  registration_status?: string;
  chassis_number?: string;
  engine_number?: string;
  txn_id?: string;
  provider?: string;
  vahan_timestamp?: string; // ISO date string
  raw_json?: any;
}

export interface VahanSnapshotRow {
  id: number;
  rc_number: string;
  provider: string;
  txn_id: string | null;
  vahan_timestamp: Date | null;
  maker: string | null;
  model_name: string | null;
  model_code: string | null;
  gvw_kg: number | null;
  ulw_kg: number | null;
  wheelbase_mm: number | null;
  body_type_code: string | null;
  body_type_name: string | null;
  vehicle_category: string | null;
  permit_type: string | null;
  permit_valid_upto: Date | null;
  fitness_valid_upto: Date | null;
  insurance_valid_upto: Date | null;
  puc_valid_upto: Date | null;
  registration_status: string | null;
  chassis_number: string | null;
  engine_number: string | null;
  chassis_hash: string | null;
  engine_hash: string | null;
  raw_json: any;
  normalized_json: any | null;
  verification_status: string;
  error_message: string | null;
  verified_at: Date | null;
  created_at: Date;
}

