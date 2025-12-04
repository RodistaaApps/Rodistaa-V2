/**
 * Truck Master Models
 */

export interface OperatorTruck {
  id: number;
  operator_id: string;
  rc_number: string;
  nickname?: string;
  rc_copy_url?: string;
  rc_copy_hash?: string;
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'BLOCKED' | 'PENDING_TRACTOR_PAIRING';
  is_tractor: boolean;
  is_trailer: boolean;
  onboarded_at: Date;
  onboarded_by?: string;
  legal_authorization_accepted: boolean;
  authorization_accepted_at?: Date;
  linked_tractor_rc?: string;
  linked_trailer_rc?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TruckMasterDetail {
  truck: OperatorTruck;
  latest_snapshot?: any; // VahanSnapshotRow
  inference?: any; // VehicleInferenceRow
  compliance?: any; // ComplianceCacheRow
  linked_tractor?: OperatorTruck;
  linked_trailer?: OperatorTruck;
  tickets?: any[]; // Ticket[]
}

export interface CreateTruckRequest {
  rc_number: string;
  nickname?: string;
  rc_copy?: Buffer; // File buffer
  is_tractor?: boolean;
  is_trailer?: boolean;
  legal_authorization_accepted?: boolean;
  authorization_declaration?: string;
}

