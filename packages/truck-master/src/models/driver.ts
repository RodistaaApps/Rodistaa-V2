/**
 * Driver Management Models
 * TypeScript interfaces for driver and assignment management
 */

export type DLClass = 'LMV' | 'LMV-NT' | 'HMV' | 'HMV-NT' | 'Transport' | 'MCWG' | 'MCWOG';
export type TruckCategory = 'LCV' | 'MCV' | 'HCV' | 'TRAILER';
export type ShiftPreference = 'DAY' | 'NIGHT' | 'ANY';
export type Gender = 'M' | 'F' | 'O' | 'PREFER_NOT_TO_SAY';
export type DocumentType = 'DL_SCAN' | 'AADHAAR_SCAN' | 'MEDICAL_CERT' | 'POLICE_VERIFICATION' | 'PHOTO' | 'OTHER';
export type FlagCode = 
  | 'DL_EXPIRED'
  | 'DL_EXPIRING_SOON'
  | 'MEDICAL_EXPIRED'
  | 'MEDICAL_EXPIRING_SOON'
  | 'BACKGROUND_ISSUE'
  | 'MULTI_ASSIGNMENT_CONFLICT'
  | 'POLICE_VERIFICATION_PENDING'
  | 'DUPLICATE_DRIVER'
  | 'DL_VERIFICATION_FAILED';

/**
 * Driver Address
 */
export interface DriverAddress {
  city: string;
  state: string;
  pincode: string;
  full_address?: string;
}

/**
 * Driver Create DTO
 */
export interface DriverCreateDTO {
  operator_id: string;
  name: string;
  mobile: string;
  alt_mobile?: string;
  aadhaar_number?: string; // Will be hashed
  dl_number: string;
  dl_class: DLClass;
  dl_valid_from: Date;
  dl_valid_till: Date;
  dob: Date;
  gender?: Gender;
  address: DriverAddress;
  preferred_shift?: ShiftPreference;
}

/**
 * Driver Record
 */
export interface DriverRecord {
  id: string;
  operator_id: string;
  name: string;
  mobile: string;
  alt_mobile?: string;
  aadhaar_hash?: string;
  dl_number: string; // Encrypted
  dl_class: DLClass;
  dl_valid_from: Date;
  dl_valid_till: Date;
  dob: Date;
  gender?: Gender;
  address: DriverAddress;
  is_active: boolean;
  preferred_shift: ShiftPreference;
  created_at: Date;
  updated_at: Date;
}

/**
 * Driver Document
 */
export interface DriverDocument {
  id: string;
  driver_id: string;
  doc_type: DocumentType;
  doc_blob: Buffer; // Encrypted
  uploaded_by: string;
  uploaded_at: Date;
  expiry_date?: Date;
  meta: {
    file_name?: string;
    file_type?: string;
    file_size?: number;
    verification_status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  };
}

/**
 * Truck Driver Assignment
 */
export interface TruckDriverAssignment {
  id: string;
  truck_id: number;
  primary_driver_id?: string;
  co_driver_ids: string[];
  assigned_by: string;
  assigned_by_role: 'OPERATOR' | 'FRANCHISE' | 'HQ_ADMIN';
  start_at: Date;
  end_at?: Date;
  is_active: boolean;
  assignment_reason?: string;
  force_assigned: boolean;
  force_assignment_reason?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Driver Availability
 */
export interface DriverAvailability {
  id: string;
  driver_id: string;
  start_at: Date;
  end_at: Date;
  reason: string;
  status: 'AVAILABLE' | 'BLOCKED';
  created_by: string;
  created_at: Date;
  notes?: string;
}

/**
 * Driver Flag
 */
export interface DriverFlag {
  id: string;
  driver_id: string;
  flag_code: FlagCode;
  meta: {
    reason?: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    details?: any;
  };
  created_at: Date;
  resolved_by?: string;
  resolved_at?: Date;
}

/**
 * Assignment Create DTO
 */
export interface AssignmentCreateDTO {
  truck_id: number;
  primary_driver_id?: string;
  co_driver_ids?: string[];
  start_at: Date;
  end_at?: Date;
  assignment_reason?: string;
  force_assigned?: boolean;
  force_assignment_reason?: string;
}

/**
 * Assignment Response with Warnings
 */
export interface AssignmentResponse {
  assignment_id: string;
  warnings: Array<{
    type: 'DL_EXPIRING' | 'DL_EXPIRED' | 'MEDICAL_EXPIRING' | 'CONFLICT' | 'AVAILABILITY';
    driver_id?: string;
    driver_name?: string;
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
  assignment: TruckDriverAssignment;
}

/**
 * DL Class to Truck Category Mapping
 */
export const DL_TRUCK_MAPPING: Record<TruckCategory, DLClass[]> = {
  LCV: ['LMV', 'LMV-NT', 'Transport'],
  MCV: ['HMV', 'LMV'], // HMV preferred
  HCV: ['HMV', 'Transport'],
  TRAILER: ['HMV', 'Transport'],
};

/**
 * Check if DL class is compatible with truck category
 */
export function isDLClassCompatible(dlClass: DLClass, truckCategory: TruckCategory): boolean {
  const allowedClasses = DL_TRUCK_MAPPING[truckCategory];
  return allowedClasses.includes(dlClass);
}

/**
 * Get required DL class priority for truck category
 */
export function getRequiredDLClassPriority(
  dlClass: DLClass,
  truckCategory: TruckCategory
): number {
  const mapping = DL_TRUCK_MAPPING[truckCategory];
  const index = mapping.indexOf(dlClass);
  return index === -1 ? 999 : index + 1; // Lower = better
}

