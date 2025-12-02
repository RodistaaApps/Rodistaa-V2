/**
 * Truck Domain Model
 */

import { generateTruckId } from '../ids';

export enum TruckStatus {
  PENDING_INSPECTION = 'PENDING_INSPECTION',
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  NEEDS_INSPECTION = 'NEEDS_INSPECTION',
  EXPIRED_DOCUMENTS = 'EXPIRED_DOCUMENTS',
  INACTIVE = 'INACTIVE',
}

export enum BsType {
  BS4 = 'BS4',
  BS6 = 'BS6',
}

export interface Truck {
  id: string; // TRK-<regno>-<ulid>
  operatorId: string; // USR-OP-<ulid>
  regNo: string; // Registration number (e.g., MH-12-AB-1234)
  modelYear: number; // Must be >= 2018
  bsType: BsType; // BS4 or BS6
  chassisNumber: string; // Encrypted
  vehicleType: 'HGV'; // Only HGV allowed
  tonnage: number; // Tonnage capacity
  status: TruckStatus;
  lastInspectionAt?: Date;
  nextInspectionDue?: Date; // 120 days from last inspection
  documents: TruckDocuments;
  createdAt: Date;
  updatedAt: Date;
}

export interface TruckDocuments {
  rcExpiry?: Date;
  fitnessExpiry?: Date;
  permitExpiry?: Date;
  insuranceExpiry?: Date;
  pollutionExpiry?: Date;
  rcUrl?: string; // Encrypted
  fitnessUrl?: string; // Encrypted
  permitUrl?: string; // Encrypted
  insuranceUrl?: string; // Encrypted
  pollutionUrl?: string; // Encrypted
}

export interface TruckInspection {
  id: string;
  truckId: string;
  franchiseId: string; // USR-FU-<ulid> or USR-FD-<ulid>
  status: 'PASS' | 'FAIL';
  inspectionDate: Date;
  geoTag: {
    lat: number;
    lng: number;
    address?: string;
  };
  photos: string[]; // Encrypted URLs
  checklist: InspectionChecklist;
  notes?: string;
  createdAt: Date;
}

export interface InspectionChecklist {
  tyres: boolean;
  lights: boolean;
  brakes: boolean;
  mirrors: boolean;
  body: boolean;
  numberPlate: boolean;
  allChecksPassed: boolean;
}

