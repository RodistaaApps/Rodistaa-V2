/**
 * Override Service
 * 
 * Handles all admin data overrides with mandatory reason tracking:
 * - Force CTL → STN conversion
 * - Force STN OTP release
 * - Adjust bidding fees
 * - Manual payout release
 * - Wallet credit/debit adjustments
 * - POD mismatch overrides
 * - Truck verification overrides
 * - Load reassignment
 * 
 * All overrides require:
 * - Detailed reason (min 20 characters)
 * - Audit log entry
 * - High-risk actions require typed confirmation ("CONFIRM")
 */

import { Pool } from 'pg';
import auditService, { AuditActionType, AuditResourceType } from './auditService';
import notificationService, { NotificationType, NotificationSeverity } from './notificationService';

const pool: Pool | null = null; // TODO: Import actual DB connection

export interface OverrideRequest {
  overrideType: OverrideType;
  resourceType: string;
  resourceId: string;
  oldValue: any;
  newValue: any;
  reason: string;
  confirmation?: string; // Required for high-risk actions
  evidenceUrls?: string[];
  approvalRequired?: boolean;
}

export type OverrideType =
  | 'FORCE_CTL_TO_STN'
  | 'FORCE_STN_RELEASE'
  | 'ADJUST_BIDDING_FEE'
  | 'MANUAL_PAYOUT'
  | 'WALLET_CREDIT'
  | 'WALLET_DEBIT'
  | 'POD_OVERRIDE'
  | 'TRUCK_VERIFICATION_OVERRIDE'
  | 'LOAD_REASSIGN'
  | 'FORCE_BOOKING_CANCEL';

const HIGH_RISK_OVERRIDES: OverrideType[] = [
  'FORCE_STN_RELEASE',
  'MANUAL_PAYOUT',
  'WALLET_DEBIT',
  'FORCE_BOOKING_CANCEL',
];

/**
 * Execute override
 */
export const executeOverride = async (
  request: OverrideRequest,
  adminId: string,
  adminRole: string
): Promise<{ txnId: string; overrideId: string }> => {
  try {
    // Validate reason length
    if (!request.reason || request.reason.length < 20) {
      throw new Error('Reason must be at least 20 characters');
    }

    // Check typed confirmation for high-risk actions
    if (HIGH_RISK_OVERRIDES.includes(request.overrideType)) {
      if (request.confirmation !== 'CONFIRM') {
        throw new Error('High-risk action requires typed confirmation: "CONFIRM"');
      }
    }

    const overrideId = `OVR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (!pool) {
      console.log('[OVERRIDE SERVICE - STUB] Execute override:', {
        overrideId,
        type: request.overrideType,
        resource: `${request.resourceType}:${request.resourceId}`,
        reason: request.reason,
      });

      // Mock audit
      const txnId = await auditService.log({
        adminId,
        actionType: request.overrideType as any,
        resourceType: request.resourceType as any,
        resourceId: request.resourceId,
        payload: {
          overrideType: request.overrideType,
          oldValue: request.oldValue,
          newValue: request.newValue,
          reason: request.reason,
        },
      });

      return { txnId, overrideId };
    }

    // Store override in database
    const query = `
      INSERT INTO admin_overrides (
        id, admin_id, override_type, resource_type, resource_id,
        old_value, new_value, reason, approval_required, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING id, txn_id
    `;

    const values = [
      overrideId,
      adminId,
      request.overrideType,
      request.resourceType,
      request.resourceId,
      JSON.stringify(request.oldValue),
      JSON.stringify(request.newValue),
      request.reason,
      request.approvalRequired || false,
    ];

    const result = await pool.query(query, values);

    // Create audit log
    const txnId = await auditService.log({
      adminId,
      actionType: request.overrideType as any,
      resourceType: request.resourceType as any,
      resourceId: request.resourceId,
      payload: {
        overrideId,
        overrideType: request.overrideType,
        oldValue: request.oldValue,
        newValue: request.newValue,
        reason: request.reason,
        evidenceUrls: request.evidenceUrls,
      },
    });

    // Apply the override (execute actual data change)
    await applyOverride(request);

    // Send notification for high-risk overrides
    if (HIGH_RISK_OVERRIDES.includes(request.overrideType)) {
      await notificationService.notify({
        type: NotificationType.SYSTEM_ALERT,
        severity: NotificationSeverity.WARNING,
        title: `High-Risk Override: ${request.overrideType}`,
        message: `Admin ${adminId} executed ${request.overrideType} on ${request.resourceType}:${request.resourceId}`,
        payload: { overrideId, txnId, reason: request.reason },
      });
    }

    return { txnId, overrideId };
  } catch (error: any) {
    console.error('[OVERRIDE SERVICE] Execute override failed:', error);
    throw error;
  }
};

/**
 * Apply the actual override (execute data changes)
 */
const applyOverride = async (request: OverrideRequest): Promise<void> => {
  switch (request.overrideType) {
    case 'FORCE_CTL_TO_STN':
      // TODO: Update load table: SET type = 'STN' WHERE id = resourceId
      console.log('[OVERRIDE] Converting CTL to STN:', request.resourceId);
      break;

    case 'FORCE_STN_RELEASE':
      // TODO: Update shipment: SET stn_released = TRUE, stn_otp_verified = TRUE
      console.log('[OVERRIDE] Force releasing STN:', request.resourceId);
      break;

    case 'ADJUST_BIDDING_FEE':
      // TODO: Update bid: SET fee = newValue WHERE id = resourceId
      console.log('[OVERRIDE] Adjusting fee:', request.resourceId, request.newValue);
      break;

    case 'MANUAL_PAYOUT':
      // TODO: Create payout entry and mark as approved
      console.log('[OVERRIDE] Manual payout:', request.resourceId, request.newValue);
      break;

    case 'WALLET_CREDIT':
    case 'WALLET_DEBIT':
      // TODO: Insert wallet transaction
      console.log('[OVERRIDE] Wallet adjustment:', request.overrideType, request.newValue);
      break;

    case 'POD_OVERRIDE':
      // TODO: Update shipment POD status
      console.log('[OVERRIDE] POD override:', request.resourceId);
      break;

    case 'TRUCK_VERIFICATION_OVERRIDE':
      // TODO: Update truck compliance status
      console.log('[OVERRIDE] Truck verification override:', request.resourceId);
      break;

    case 'LOAD_REASSIGN':
      // TODO: Update load operator assignment
      console.log('[OVERRIDE] Load reassignment:', request.resourceId);
      break;

    default:
      console.warn('[OVERRIDE] Unknown override type:', request.overrideType);
  }
};

/**
 * List overrides with filters
 */
export const listOverrides = async (filters: {
  adminId?: string;
  overrideType?: string;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}): Promise<{ items: any[]; total: number }> => {
  try {
    if (!pool) {
      return { items: [], total: 0 };
    }

    // Build query
    let whereConditions: string[] = [];
    let values: any[] = [];
    let paramIndex = 1;

    if (filters.adminId) {
      whereConditions.push(`admin_id = $${paramIndex++}`);
      values.push(filters.adminId);
    }
    if (filters.overrideType) {
      whereConditions.push(`override_type = $${paramIndex++}`);
      values.push(filters.overrideType);
    }
    if (filters.resourceType) {
      whereConditions.push(`resource_type = $${paramIndex++}`);
      values.push(filters.resourceType);
    }
    if (filters.startDate) {
      whereConditions.push(`created_at >= $${paramIndex++}`);
      values.push(filters.startDate);
    }
    if (filters.endDate) {
      whereConditions.push(`created_at <= $${paramIndex++}`);
      values.push(filters.endDate);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM admin_overrides ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = countResult.rows[0].total;

    // Get paginated data
    const limit = filters.limit || 25;
    const offset = ((filters.page || 1) - 1) * limit;

    const dataQuery = `
      SELECT * FROM admin_overrides
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    values.push(limit, offset);

    const result = await pool.query(dataQuery, values);

    return {
      items: result.rows.map(row => ({
        ...row,
        old_value: row.old_value,
        new_value: row.new_value,
      })),
      total,
    };
  } catch (error: any) {
    console.error('[OVERRIDE SERVICE] List overrides failed:', error);
    return { items: [], total: 0 };
  }
};

export default {
  executeOverride,
  listOverrides,
  HIGH_RISK_OVERRIDES,
};

