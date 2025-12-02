/**
 * KYC Domain Model
 */

import { generateKycId } from '../ids';
import { KycStatus } from './user';

export interface Kyc {
  id: string; // KYC-<ulid> - BACKEND ONLY, never exposed
  userId: string; // USR-<role>-<ulid>
  status: KycStatus;
  documents: KycDocuments;
  verification: {
    verifiedBy?: string; // USR-KA-<ulid> (KYC Admin)
    verifiedAt?: Date;
    rejectionReason?: string;
    suspiciousFlags?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface KycDocuments {
  // Encrypted at rest
  aadhar?: {
    number: string; // Encrypted
    frontUrl: string; // Encrypted
    backUrl?: string; // Encrypted
    maskedNumber: string; // For display (e.g., XXXX-XXXX-1234)
  };
  pan?: {
    number: string; // Encrypted
    url: string; // Encrypted
    maskedNumber: string; // For display (e.g., ABCDE****F)
  };
  driverLicense?: {
    number: string; // Encrypted
    url: string; // Encrypted
    expiry?: Date;
    maskedNumber: string;
  };
  photo: {
    url: string; // Encrypted
    livenessVerified: boolean;
    faceMatchScore?: number; // 0-100
  };
}

export interface KycVerificationRequest {
  userId: string;
  documents: KycDocuments;
}

