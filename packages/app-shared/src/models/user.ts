/**
 * User Domain Model
 */

import { UserRole, generateUserId } from '../ids';

export enum KycStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SUSPICIOUS = 'SUSPICIOUS',
}

export interface User {
  id: string; // USR-<role>-<ulid>
  role: UserRole;
  name: string;
  mobileMasked: string; // e.g., +91-98xxxxxx01
  mobileFull?: string; // Encrypted, backend-only
  email?: string; // Encrypted if sensitive
  kycStatus: KycStatus;
  kycId?: string; // KYC-<ulid> - backend-only, never exposed
  isActive: boolean;
  riskScore: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface Shipper extends User {
  role: UserRole.SHIPPER;
  companyName?: string;
  gstin?: string; // Encrypted
  address?: string; // Encrypted
}

export interface Operator extends User {
  role: UserRole.OPERATOR;
  companyName?: string;
  gstin?: string; // Encrypted
  address?: string; // Encrypted
  fleetSize: number; // Max 10 trucks
}

export interface Driver extends User {
  role: UserRole.DRIVER;
  licenseNumber?: string; // Encrypted
  licenseExpiry?: Date;
  licensePhotoUrl?: string; // Encrypted
  linkedOperators: string[]; // Array of operator IDs
}

export interface Admin extends User {
  role: UserRole.ADMIN | UserRole.KYC_ADMIN;
  permissions: string[];
  lastOverrideAt?: Date;
  overrideCount: number;
}

export interface Franchise extends User {
  role: UserRole.FRANCHISE_UNIT | UserRole.FRANCHISE_DISTRICT;
  districtCode?: string;
  unitCode?: string;
  parentFranchiseId?: string; // For unit franchises
  target?: number; // Monthly target
  performanceScore?: number; // 0-100
}

export type UserEntity = Shipper | Operator | Driver | Admin | Franchise;

