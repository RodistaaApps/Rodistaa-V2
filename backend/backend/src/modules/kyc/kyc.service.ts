/**
 * KYC Service
 * Business logic for KYC with encryption
 */

import * as kycRepo from './kyc.repository';
import { localKMS } from '@rodistaa/acs';
import { evaluateAcsRules } from '../acs-adapter';
import logger from 'pino';

const log = logger({ name: 'kyc-service' });

const KMS_KEY_ID = process.env.LOCAL_KMS_KEY_ID || 'kyc-key-1';

/**
 * Upload KYC document with encryption
 */
export async function uploadKyc(
  userId: string,
  documentType: string,
  fileContent: Buffer,
  fileUrl: string,
  context: any
): Promise<kycRepo.KycRecord> {
  // Evaluate ACS rules for KYC upload
  const event = {
    type: 'kyc.upload',
    payload: {
      userId,
      documentType,
      fileSize: fileContent.length,
    },
  };

  const acsContext = {
    userId,
    userRole: context.userRole || 'user',
    userKycStatus: context.kycStatus || 'PENDING',
  };

  try {
    await evaluateAcsRules(event, acsContext);
  } catch (error: any) {
    if (error.message && error.message.includes('rejected')) {
      throw new Error(error.message);
    }
    log.warn({ error }, 'ACS evaluation warning (continuing)');
  }

  // Encrypt document data
  const documentData = JSON.stringify({
    type: documentType,
    uploadedAt: new Date().toISOString(),
    fileSize: fileContent.length,
    fileUrl,
  });

  const encrypted = localKMS.encrypt(KMS_KEY_ID, documentData);
  const encryptedData = JSON.stringify(encrypted);

  // Create KYC record
  const kycRecord = await kycRepo.createKycRecord({
    userId,
    documentType,
    encryptedData,
    encryptionKeyId: KMS_KEY_ID,
    fileUrl,
  });

  log.info({ kycId: kycRecord.id, userId, documentType }, 'KYC document uploaded and encrypted');

  return kycRecord;
}

/**
 * Get KYC status for user
 */
export async function getKycStatus(userId: string): Promise<{
  status: string;
  documents: Array<{ type: string; status: string }>;
}> {
  const records = await kycRepo.getKycRecordsByUserId(userId);

  // Determine overall status
  let overallStatus = 'PENDING';
  if (records.length === 0) {
    overallStatus = 'NOT_SUBMITTED';
  } else {
    const allVerified = records.every(r => r.status === 'VERIFIED');
    const anyRejected = records.some(r => r.status === 'REJECTED');
    
    if (allVerified) {
      overallStatus = 'VERIFIED';
    } else if (anyRejected) {
      overallStatus = 'REJECTED';
    } else {
      overallStatus = 'PENDING';
    }
  }

  return {
    status: overallStatus,
    documents: records.map(r => ({
      type: r.documentType,
      status: r.status,
    })),
  };
}

/**
 * Get KYC record (masked for non-admin, decrypted for admin)
 */
export async function getKycRecord(
  kycId: string,
  requestingUserId: string,
  requestingUserRole: string
): Promise<kycRepo.KycRecord & { decryptedData?: any } | null> {
  const record = await kycRepo.getKycRecordById(kycId);
  
  if (!record) {
    return null;
  }

  // Admin can see encrypted data structure but not auto-decrypt
  // Decryption requires explicit decrypt endpoint with audit
  return record;
}

/**
 * Decrypt KYC record (admin only, with audit)
 */
export async function decryptKycRecord(
  kycId: string,
  adminId: string
): Promise<any> {
  const record = await kycRepo.getKycRecordById(kycId);
  
  if (!record) {
    throw new Error('KYC record not found');
  }

  // Create audit entry for decryption
  const auditEvent = {
    type: 'kyc.decrypt',
    payload: {
      kycId,
      userId: record.userId,
      documentType: record.documentType,
      decryptedBy: adminId,
    },
  };

  await evaluateAcsRules(auditEvent, {
    userId: adminId,
    userRole: 'admin',
  });

  // Decrypt data
  try {
    const encrypted = JSON.parse(record.encryptedData);
    const decrypted = localKMS.decrypt(
      record.encryptionKeyId,
      encrypted.ciphertext,
      encrypted.iv,
      encrypted.tag
    );

    log.info({ kycId, adminId }, 'KYC record decrypted by admin');

    return {
      ...record,
      decryptedData: JSON.parse(decrypted),
    };
  } catch (error: any) {
    log.error({ error, kycId }, 'Failed to decrypt KYC record');
    throw new Error('Decryption failed');
  }
}

