/**
 * KYC Service
 * 
 * Central KYC approval system where admin approves ALL verifications.
 * Franchises DO NOT perform verification.
 * 
 * Features:
 * - Centralized KYC queue
 * - Batch approval/rejection
 * - PII viewing audit
 * - Revoke and re-trigger KYC
 * - Document authenticity checks (LLM-powered)
 * - Duplicate detection
 */

import { Pool } from 'pg';
import auditService, { AuditActionType, AuditResourceType } from './auditService';
import notificationService, { NotificationType, NotificationSeverity } from './notificationService';

const pool: Pool | null = null; // TODO: Import actual DB connection

export interface KYCItem {
  id: number;
  user_id: string;
  user_type: 'operator' | 'driver' | 'shipper';
  user_name?: string;
  kyc_type: 'aadhar' | 'pan' | 'dl' | 'rc' | 'gst' | 'business_proof';
  document_url: string;
  document_hash: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  rejection_reason: string | null;
  metadata: Record<string, any>;
  priority: number;
}

export interface KYCApprovalRequest {
  kycId: number;
  action: 'approve' | 'reject';
  notes?: string;
  rejectionReason?: string; // Required for rejection
}

export interface BatchKYCRequest {
  kycIds: number[];
  action: 'approve' | 'reject';
  notes?: string;
  rejectionReason?: string;
}

/**
 * Get KYC queue with filters
 */
export const getKYCQueue = async (filters: {
  status?: string;
  userType?: string;
  kycType?: string;
  priority?: number;
  page?: number;
  limit?: number;
}): Promise<{ items: KYCItem[]; total: number }> => {
  try {
    if (!pool) {
      // Mock data
      const mockItems: KYCItem[] = [
        {
          id: 1,
          user_id: 'OP-001',
          user_type: 'operator',
          user_name: 'ABC Transport',
          kyc_type: 'gst',
          document_url: '/uploads/kyc/gst-op001.pdf',
          document_hash: 'abc123',
          status: 'pending',
          submitted_at: '2025-12-05T09:00:00Z',
          reviewed_by: null,
          reviewed_at: null,
          review_notes: null,
          rejection_reason: null,
          metadata: { ocr_confidence: 95 },
          priority: 1,
        },
        {
          id: 2,
          user_id: 'DR-001',
          user_type: 'driver',
          user_name: 'Ramesh Kumar',
          kyc_type: 'dl',
          document_url: '/uploads/kyc/dl-dr001.jpg',
          document_hash: 'def456',
          status: 'pending',
          submitted_at: '2025-12-05T10:30:00Z',
          reviewed_by: null,
          reviewed_at: null,
          review_notes: null,
          rejection_reason: null,
          metadata: { llm_authenticity_score: 88 },
          priority: 2,
        },
      ];

      return { items: mockItems, total: 2 };
    }

    // Build query with filters
    let whereConditions: string[] = [];
    let values: any[] = [];
    let paramIndex = 1;

    if (filters.status) {
      whereConditions.push(`status = $${paramIndex++}`);
      values.push(filters.status);
    }
    if (filters.userType) {
      whereConditions.push(`user_type = $${paramIndex++}`);
      values.push(filters.userType);
    }
    if (filters.kycType) {
      whereConditions.push(`kyc_type = $${paramIndex++}`);
      values.push(filters.kycType);
    }
    if (filters.priority) {
      whereConditions.push(`priority <= $${paramIndex++}`);
      values.push(filters.priority);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const countQuery = `SELECT COUNT(*) as total FROM kyc_queue ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = countResult.rows[0].total;

    const limit = filters.limit || 25;
    const offset = ((filters.page || 1) - 1) * limit;

    const dataQuery = `
      SELECT * FROM kyc_queue
      ${whereClause}
      ORDER BY priority ASC, submitted_at ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    values.push(limit, offset);

    const result = await pool.query(dataQuery, values);

    return {
      items: result.rows.map(row => ({
        ...row,
        metadata: row.metadata || {},
      })),
      total,
    };
  } catch (error: any) {
    console.error('[KYC SERVICE] Get queue failed:', error);
    return { items: [], total: 0 };
  }
};

/**
 * Approve KYC
 */
export const approveKYC = async (
  kycId: number,
  adminId: string,
  notes?: string,
  reasonForPIIAccess?: string
): Promise<void> => {
  try {
    if (!pool) {
      console.log('[KYC SERVICE - STUB] Approve KYC:', kycId);
      return;
    }

    // Get KYC item
    const getQuery = 'SELECT * FROM kyc_queue WHERE id = $1';
    const getResult = await pool.query(getQuery, [kycId]);
    const kycItem = getResult.rows[0];

    if (!kycItem) {
      throw new Error('KYC item not found');
    }

    // Update status
    const updateQuery = `
      UPDATE kyc_queue
      SET status = 'approved',
          reviewed_by = $1,
          reviewed_at = NOW(),
          review_notes = $2
      WHERE id = $3
    `;

    await pool.query(updateQuery, [adminId, notes || null, kycId]);

    // TODO: Update user's KYC status
    // await pool.query(
    //   'UPDATE users SET kyc_status = $1 WHERE id = $2',
    //   ['verified', kycItem.user_id]
    // );

    // Audit log
    await auditService.log({
      adminId,
      actionType: 'APPROVE_KYC' as any,
      resourceType: kycItem.user_type as any,
      resourceId: kycItem.user_id,
      payload: { kycId, kycType: kycItem.kyc_type, notes },
    });

    // Log PII access
    await logPIIAccess(adminId, kycItem.user_type, kycItem.user_id, kycItem.kyc_type, reasonForPIIAccess || 'KYC approval');

    // Notify user
    // TODO: Send notification to user
  } catch (error: any) {
    console.error('[KYC SERVICE] Approve KYC failed:', error);
    throw error;
  }
};

/**
 * Reject KYC
 */
export const rejectKYC = async (
  kycId: number,
  adminId: string,
  rejectionReason: string,
  notes?: string
): Promise<void> => {
  try {
    if (!rejectionReason) {
      throw new Error('Rejection reason is required');
    }

    if (!pool) {
      console.log('[KYC SERVICE - STUB] Reject KYC:', kycId, rejectionReason);
      return;
    }

    // Get KYC item
    const getQuery = 'SELECT * FROM kyc_queue WHERE id = $1';
    const getResult = await pool.query(getQuery, [kycId]);
    const kycItem = getResult.rows[0];

    if (!kycItem) {
      throw new Error('KYC item not found');
    }

    // Update status
    const updateQuery = `
      UPDATE kyc_queue
      SET status = 'rejected',
          reviewed_by = $1,
          reviewed_at = NOW(),
          rejection_reason = $2,
          review_notes = $3
      WHERE id = $4
    `;

    await pool.query(updateQuery, [adminId, rejectionReason, notes || null, kycId]);

    // Audit log
    await auditService.log({
      adminId,
      actionType: 'REJECT_KYC' as any,
      resourceType: kycItem.user_type as any,
      resourceId: kycItem.user_id,
      payload: { kycId, kycType: kycItem.kyc_type, rejectionReason, notes },
    });

    // Notify user
    // TODO: Send rejection notification to user with reason
  } catch (error: any) {
    console.error('[KYC SERVICE] Reject KYC failed:', error);
    throw error;
  }
};

/**
 * Batch approve/reject KYC
 */
export const batchProcessKYC = async (
  request: BatchKYCRequest,
  adminId: string
): Promise<{ success: number; failed: number; errors: any[] }> => {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as any[],
  };

  for (const kycId of request.kycIds) {
    try {
      if (request.action === 'approve') {
        await approveKYC(kycId, adminId, request.notes);
      } else {
        await rejectKYC(kycId, adminId, request.rejectionReason || 'Batch rejection', request.notes);
      }
      results.success++;
    } catch (error: any) {
      results.failed++;
      results.errors.push({ kycId, error: error.message });
    }
  }

  // Send batch completion notification
  await notificationService.notify({
    type: NotificationType.BULK_ACTION_COMPLETE,
    severity: results.failed > 0 ? NotificationSeverity.WARNING : NotificationSeverity.INFO,
    title: `Batch KYC ${request.action} Complete`,
    message: `${results.success}/${request.kycIds.length} succeeded, ${results.failed} failed`,
    targetAdminId: adminId,
  });

  return results;
};

/**
 * Revoke KYC and trigger re-verification
 */
export const revokeKYC = async (
  userId: string,
  userType: string,
  kycType: string,
  adminId: string,
  reason: string
): Promise<void> => {
  try {
    if (!pool) {
      console.log('[KYC SERVICE - STUB] Revoke KYC:', userId, kycType, reason);
      return;
    }

    // Mark existing KYC as revoked
    const updateQuery = `
      UPDATE kyc_queue
      SET status = 'revoked',
          review_notes = $1
      WHERE user_id = $2 AND kyc_type = $3 AND status = 'approved'
    `;

    await pool.query(updateQuery, [reason, userId, kycType]);

    // TODO: Update user status to require re-KYC
    // await pool.query('UPDATE users SET kyc_status = $1 WHERE id = $2', ['pending_reverification', userId]);

    // Audit log
    await auditService.log({
      adminId,
      actionType: 'REVOKE_KYC' as any,
      resourceType: userType as any,
      resourceId: userId,
      payload: { kycType, reason },
    });

    // Notify user
    // TODO: Send notification to user requesting re-submission
  } catch (error: any) {
    console.error('[KYC SERVICE] Revoke KYC failed:', error);
    throw error;
  }
};

/**
 * Log PII access (mandatory for viewing sensitive documents)
 */
export const logPIIAccess = async (
  adminId: string,
  resourceType: string,
  resourceId: string,
  piiField: string,
  reason: string
): Promise<void> => {
  try {
    if (!pool) {
      console.log('[PII ACCESS LOG - STUB]', { adminId, resourceType, resourceId, piiField, reason });
      return;
    }

    const query = `
      INSERT INTO pii_access_logs (
        admin_id, resource_type, resource_id, pii_field, reason, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `;

    await pool.query(query, [adminId, resourceType, resourceId, piiField, reason]);
  } catch (error: any) {
    console.error('[KYC SERVICE] PII access log failed:', error);
  }
};

/**
 * Check for duplicate documents
 */
export const checkDuplicateDocument = async (
  documentHash: string
): Promise<KYCItem[]> => {
  try {
    if (!pool) {
      return [];
    }

    const query = `
      SELECT * FROM kyc_queue
      WHERE document_hash = $1 AND status != 'rejected'
      ORDER BY submitted_at ASC
    `;

    const result = await pool.query(query, [documentHash]);
    return result.rows;
  } catch (error: any) {
    console.error('[KYC SERVICE] Duplicate check failed:', error);
    return [];
  }
};

/**
 * Get KYC statistics
 */
export const getKYCStats = async (): Promise<any> => {
  try {
    if (!pool) {
      return {
        total: 45,
        pending: 12,
        approved: 28,
        rejected: 5,
        byType: {
          aadhar: 15,
          pan: 10,
          dl: 8,
          gst: 7,
          business_proof: 5,
        },
        byUserType: {
          operator: 20,
          driver: 15,
          shipper: 10,
        },
        avgApprovalTimeHours: 4.5,
      };
    }

    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        AVG(EXTRACT(EPOCH FROM (reviewed_at - submitted_at))/3600) 
          FILTER (WHERE reviewed_at IS NOT NULL) as avg_approval_time_hours
      FROM kyc_queue
    `;

    const result = await pool.query(query);
    return result.rows[0] || {};
  } catch (error: any) {
    console.error('[KYC SERVICE] Get stats failed:', error);
    return {};
  }
};

export default {
  getKYCQueue,
  approveKYC,
  rejectKYC,
  batchProcessKYC,
  revokeKYC,
  logPIIAccess,
  checkDuplicateDocument,
  getKYCStats,
};

