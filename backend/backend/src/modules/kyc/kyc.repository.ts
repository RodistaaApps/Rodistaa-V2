/**
 * KYC Repository
 * Database operations for KYC records with encryption
 */

import { query } from '../../db/connection';
import logger from 'pino';
import { generateKycId } from '@rodistaa/app-shared';

const log = logger({ name: 'kyc-repository' });

export interface KycRecord {
  id: string;
  userId: string;
  documentType: string;
  encryptedData: string;
  encryptionKeyId: string;
  fileUrl?: string;
  status: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface CreateKycRecordInput {
  userId: string;
  documentType: string;
  encryptedData: string;
  encryptionKeyId: string;
  fileUrl?: string;
}

/**
 * Create KYC record
 */
export async function createKycRecord(input: CreateKycRecordInput): Promise<KycRecord> {
  const kycId = generateKycId();

  try {
    const result = await query(
      `INSERT INTO kyc_records (
        id, user_id, document_type, encrypted_data, encryption_key_id,
        file_url, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *`,
      [
        kycId,
        input.userId,
        input.documentType,
        input.encryptedData,
        input.encryptionKeyId,
        input.fileUrl || null,
        'PENDING',
      ]
    );

    return mapRowToKycRecord(result.rows[0]);
  } catch (error: any) {
    log.error({ error, kycId }, 'Failed to create KYC record');
    throw new Error('Failed to create KYC record');
  }
}

/**
 * Get KYC record by ID
 */
export async function getKycRecordById(kycId: string): Promise<KycRecord | null> {
  try {
    const result = await query(
      `SELECT * FROM kyc_records WHERE id = $1 LIMIT 1`,
      [kycId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapRowToKycRecord(result.rows[0]);
  } catch (error: any) {
    log.error({ error, kycId }, 'Failed to get KYC record');
    throw error;
  }
}

/**
 * Get KYC records for user
 */
export async function getKycRecordsByUserId(userId: string): Promise<KycRecord[]> {
  try {
    const result = await query(
      `SELECT * FROM kyc_records 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows.map(mapRowToKycRecord);
  } catch (error: any) {
    log.error({ error, userId }, 'Failed to get KYC records');
    throw error;
  }
}

/**
 * Update KYC status
 */
export async function updateKycStatus(
  kycId: string,
  status: 'VERIFIED' | 'REJECTED',
  verifiedBy: string,
  rejectionReason?: string
): Promise<KycRecord> {
  try {
    await query(
      `UPDATE kyc_records 
       SET status = $1, verified_by = $2, verified_at = NOW(), 
           rejection_reason = $3
       WHERE id = $4`,
      [status, verifiedBy, rejectionReason || null, kycId]
    );

    return getKycRecordById(kycId) as Promise<KycRecord>;
  } catch (error: any) {
    log.error({ error, kycId }, 'Failed to update KYC status');
    throw error;
  }
}

/**
 * Map database row to KycRecord object
 */
function mapRowToKycRecord(row: any): KycRecord {
  return {
    id: row.id,
    userId: row.user_id,
    documentType: row.document_type,
    encryptedData: row.encrypted_data,
    encryptionKeyId: row.encryption_key_id,
    fileUrl: row.file_url || undefined,
    status: row.status,
    verifiedBy: row.verified_by || undefined,
    verifiedAt: row.verified_at?.toISOString() || undefined,
    rejectionReason: row.rejection_reason || undefined,
    createdAt: row.created_at.toISOString(),
  };
}

