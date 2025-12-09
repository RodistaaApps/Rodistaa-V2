/**
 * Driver Service
 * CRUD operations, document upload, DL expiry checks, duplicate detection
 */

import { query, transaction, PoolClient } from '../db';
import {
  DriverCreateDTO,
  DriverRecord,
  DriverDocument,
  DriverFlag,
  FlagCode,
} from '../models/driver';
import { encrypt, decrypt, sha256Hex } from '../utils/hashUtil';
import { dlVerificationClient } from './dlVerificationClient';
import { logAudit } from './auditService';

const MAX_CO_DRIVERS = parseInt(process.env.MAX_CO_DRIVERS || '2', 10);
const DL_EXPIRY_WARNING_DAYS = 30;

/**
 * Create driver
 */
export async function createDriver(
  dto: DriverCreateDTO,
  createdBy: string
): Promise<{ driver: DriverRecord; warnings: string[] }> {
  const warnings: string[] = [];

  // Hash Aadhaar if provided
  let aadhaarHash: string | undefined;
  if (dto.aadhaar_number) {
    aadhaarHash = sha256Hex(dto.aadhaar_number.trim());
    
    // Check for duplicate Aadhaar
    const duplicateAadhaar = await query(
      `SELECT id FROM drivers WHERE aadhaar_hash = $1`,
      [aadhaarHash]
    );
    if (duplicateAadhaar.rows.length > 0) {
      throw new Error('Driver with this Aadhaar number already exists');
    }
  }

  // Check for duplicate mobile (per operator)
  const duplicateMobile = await query(
    `SELECT id FROM drivers WHERE operator_id = $1 AND mobile = $2`,
    [dto.operator_id, dto.mobile]
  );
  if (duplicateMobile.rows.length > 0) {
    throw new Error('Driver with this mobile number already exists for this operator');
  }

  // Encrypt DL number
  const encryptedDL = encrypt(Buffer.from(dto.dl_number));
  
  // Check for duplicate DL number (compare encrypted)
  const allDrivers = await query(
    `SELECT id, dl_number FROM drivers`
  );
  
  // Note: In production, you'd want to hash DL for comparison or use encrypted comparison
  // For now, we'll check in application layer after decryption (not ideal for large datasets)
  // TODO: Implement hash-based duplicate detection for DL numbers

  // Check DL expiry
  const daysUntilExpiry = Math.floor(
    (new Date(dto.dl_valid_till).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysUntilExpiry < 0) {
    throw new Error('DL is already expired');
  }
  
  if (daysUntilExpiry < DL_EXPIRY_WARNING_DAYS) {
    warnings.push(`DL expires in ${daysUntilExpiry} days`);
  }

  return transaction(async (client) => {
    // Insert driver
    const result = await client.query<DriverRecord>(
      `INSERT INTO drivers
       (operator_id, name, mobile, alt_mobile, aadhaar_hash, dl_number, dl_class,
        dl_valid_from, dl_valid_till, dob, gender, address, preferred_shift)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        dto.operator_id,
        dto.name,
        dto.mobile,
        dto.alt_mobile || null,
        aadhaarHash || null,
        encryptedDL,
        dto.dl_class,
        dto.dl_valid_from,
        dto.dl_valid_till,
        dto.dob,
        dto.gender || null,
        JSON.stringify(dto.address),
        dto.preferred_shift || 'ANY',
      ]
    );

    const driver = result.rows[0];

    // Create flags if needed
    if (daysUntilExpiry < DL_EXPIRY_WARNING_DAYS) {
      await createDriverFlag(client, driver.id, 'DL_EXPIRING_SOON', {
        reason: `DL expires in ${daysUntilExpiry} days`,
        severity: daysUntilExpiry < 7 ? 'HIGH' : 'MEDIUM',
      });
    }

    // Verify DL with external service (async, non-blocking)
    verifyDLInBackground(driver.id, dto.dl_number).catch(error => {
      console.error('Background DL verification failed:', error);
    });

    // Log audit
    await logAudit({
      rc_number: '', // Not applicable for driver creation
      operator_id: dto.operator_id,
      event_type: 'DRIVER_CREATED',
      decision: {
        driver_id: driver.id,
        name: dto.name,
      },
    }, client);

    return { driver, warnings };
  });
}

/**
 * Get driver by ID
 */
export async function getDriver(driverId: string): Promise<DriverRecord | null> {
  const result = await query<DriverRecord>(
    `SELECT * FROM drivers WHERE id = $1`,
    [driverId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * List drivers with filters
 */
export async function listDrivers(filters: {
  operator_id?: string;
  is_active?: boolean;
  dl_expiry_days?: number; // Drivers with DL expiring in X days
  limit?: number;
  offset?: number;
}): Promise<{ drivers: DriverRecord[]; total: number }> {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.operator_id) {
    conditions.push(`operator_id = $${paramIndex++}`);
    params.push(filters.operator_id);
  }

  if (filters.is_active !== undefined) {
    conditions.push(`is_active = $${paramIndex++}`);
    params.push(filters.is_active);
  }

  if (filters.dl_expiry_days) {
    conditions.push(`dl_valid_till BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${filters.dl_expiry_days} days'`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM drivers ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get drivers
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;
  params.push(limit, offset);

  const result = await query<DriverRecord>(
    `SELECT * FROM drivers
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    params
  );

  return { drivers: result.rows, total };
}

/**
 * Update driver
 */
export async function updateDriver(
  driverId: string,
  updates: Partial<DriverCreateDTO>,
  updatedBy: string
): Promise<DriverRecord> {
  const updateFields: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (updates.name) {
    updateFields.push(`name = $${paramIndex++}`);
    params.push(updates.name);
  }
  if (updates.mobile) {
    updateFields.push(`mobile = $${paramIndex++}`);
    params.push(updates.mobile);
  }
  if (updates.alt_mobile !== undefined) {
    updateFields.push(`alt_mobile = $${paramIndex++}`);
    params.push(updates.alt_mobile);
  }
  if (updates.dl_valid_till) {
    updateFields.push(`dl_valid_till = $${paramIndex++}`);
    params.push(updates.dl_valid_till);
  }
  if (updates.address) {
    updateFields.push(`address = $${paramIndex++}`);
    params.push(JSON.stringify(updates.address));
  }
  if (updates.preferred_shift) {
    updateFields.push(`preferred_shift = $${paramIndex++}`);
    params.push(updates.preferred_shift);
  }
  if (updates.is_active !== undefined) {
    updateFields.push(`is_active = $${paramIndex++}`);
    params.push(updates.is_active);
  }

  if (updateFields.length === 0) {
    throw new Error('No fields to update');
  }

  params.push(driverId);

  const result = await query<DriverRecord>(
    `UPDATE drivers
     SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramIndex++}
     RETURNING *`,
    params
  );

  if (result.rows.length === 0) {
    throw new Error('Driver not found');
  }

  // Log audit
  await logAudit({
    rc_number: '',
    operator_id: result.rows[0].operator_id,
    event_type: 'DRIVER_UPDATED',
    decision: {
      driver_id: driverId,
      updates,
    },
  });

  return result.rows[0];
}

/**
 * Upload driver document
 */
export async function uploadDriverDocument(
  driverId: string,
  docType: string,
  docBuffer: Buffer,
  uploadedBy: string,
  expiryDate?: Date,
  meta?: any
): Promise<DriverDocument> {
  // Encrypt document
  const encryptedDoc = encrypt(docBuffer);

  const result = await query<DriverDocument>(
    `INSERT INTO driver_documents
     (driver_id, doc_type, doc_blob, uploaded_by, expiry_date, meta)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      driverId,
      docType,
      encryptedDoc,
      uploadedBy,
      expiryDate || null,
      JSON.stringify(meta || {}),
    ]
  );

  // Check for expiring medical cert
  if (docType === 'MEDICAL_CERT' && expiryDate) {
    const daysUntilExpiry = Math.floor(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilExpiry < 30) {
      await createDriverFlag(null, driverId, 'MEDICAL_EXPIRING_SOON', {
        reason: `Medical certificate expires in ${daysUntilExpiry} days`,
        severity: daysUntilExpiry < 7 ? 'HIGH' : 'MEDIUM',
      });
    }
  }

  return result.rows[0];
}

/**
 * Get driver documents
 */
export async function getDriverDocuments(driverId: string): Promise<DriverDocument[]> {
  const result = await query<DriverDocument>(
    `SELECT id, driver_id, doc_type, uploaded_by, uploaded_at, expiry_date, meta
     FROM driver_documents
     WHERE driver_id = $1
     ORDER BY uploaded_at DESC`,
    [driverId]
  );

  return result.rows;
}

/**
 * Get driver flags
 */
export async function getDriverFlags(driverId: string, activeOnly = false): Promise<DriverFlag[]> {
  let sql = `SELECT * FROM driver_flags WHERE driver_id = $1`;
  const params: any[] = [driverId];

  if (activeOnly) {
    sql += ` AND resolved_at IS NULL`;
  }

  sql += ` ORDER BY created_at DESC`;

  const result = await query<DriverFlag>(sql, params);
  return result.rows;
}

/**
 * Create driver flag
 */
export async function createDriverFlag(
  client: PoolClient | null,
  driverId: string,
  flagCode: FlagCode,
  meta: DriverFlag['meta']
): Promise<void> {
  const queryFn = client ? client.query.bind(client) : query;

  await queryFn(
    `INSERT INTO driver_flags (driver_id, flag_code, meta)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [driverId, flagCode, JSON.stringify(meta)]
  );
}

/**
 * Verify DL in background (non-blocking)
 */
async function verifyDLInBackground(driverId: string, dlNumber: string): Promise<void> {
  try {
    const result = await dlVerificationClient.verify(dlNumber);
    
    if (!result.success || result.status === 'EXPIRED' || result.status === 'SUSPENDED') {
      await createDriverFlag(null, driverId, 'DL_VERIFICATION_FAILED', {
        reason: result.error || 'DL verification failed',
        severity: 'HIGH',
        provider: result.provider,
        txn_id: result.txn_id,
      });
    }
  } catch (error) {
    console.error('DL verification error:', error);
  }
}

/**
 * Check and update DL expiry flags
 */
export async function checkDLExpiry(): Promise<void> {
  // Find expired DLs
  const expired = await query(
    `SELECT id FROM drivers 
     WHERE dl_valid_till < CURRENT_DATE 
       AND is_active = TRUE
       AND id NOT IN (
         SELECT driver_id FROM driver_flags 
         WHERE flag_code = 'DL_EXPIRED' AND resolved_at IS NULL
       )`
  );

  for (const row of expired.rows) {
    await createDriverFlag(null, row.id, 'DL_EXPIRED', {
      reason: 'DL has expired',
      severity: 'CRITICAL',
    });
  }

  // Find expiring soon
  const expiringSoon = await query(
    `SELECT id FROM drivers 
     WHERE dl_valid_till BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${DL_EXPIRY_WARNING_DAYS} days'
       AND is_active = TRUE
       AND id NOT IN (
         SELECT driver_id FROM driver_flags 
         WHERE flag_code = 'DL_EXPIRING_SOON' AND resolved_at IS NULL
       )`
  );

  for (const row of expiringSoon.rows) {
    const driver = await getDriver(row.id);
    if (driver) {
      const daysUntilExpiry = Math.floor(
        (new Date(driver.dl_valid_till).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      await createDriverFlag(null, row.id, 'DL_EXPIRING_SOON', {
        reason: `DL expires in ${daysUntilExpiry} days`,
        severity: daysUntilExpiry < 7 ? 'HIGH' : 'MEDIUM',
      });
    }
  }
}

