/**
 * Audit Service
 * 
 * Provides immutable audit logging for all admin actions.
 * All entries are written to admin_audit_logs table (no updates/deletes allowed).
 * 
 * Usage:
 *   await auditService.log({
 *     adminId: req.admin.id,
 *     actionType: 'BLOCK_TRUCK',
 *     resourceType: 'truck',
 *     resourceId: 'DL01AB1234',
 *     payload: { reason: 'Suspicious activity' },
 *     ipAddress: req.ip,
 *   });
 */

import { Pool } from 'pg';
import crypto from 'crypto';

// TODO: Import actual DB connection
// import { pool } from '../../db';
const pool: Pool | null = null; // Stub for now

export interface AuditLogEntry {
  adminId: string;
  actionType: string;
  resourceType: string;
  resourceId: string;
  payload?: Record<string, any>;
  providerTxnId?: string;
  txnId?: string; // Auto-generated if not provided
  correlationId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogQuery {
  adminId?: string;
  actionType?: string | string[];
  resourceType?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  txnId?: string;
  correlationId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Action types (enum for type safety)
 */
export enum AuditActionType {
  // Truck actions
  BLOCK_TRUCK = 'BLOCK_TRUCK',
  UNBLOCK_TRUCK = 'UNBLOCK_TRUCK',
  REVERIFY_TRUCK = 'REVERIFY_ENQUEUE',
  UPDATE_TRUCK = 'UPDATE_TRUCK',
  DELETE_TRUCK = 'DELETE_TRUCK',
  
  // Trailer actions
  LINK_TRAILER = 'TRAILER_LINKED',
  UNLINK_TRAILER = 'TRAILER_UNLINKED',
  
  // Ticket actions
  CREATE_TICKET = 'TICKET_CREATED',
  ASSIGN_TICKET = 'TICKET_ASSIGNED',
  RESOLVE_TICKET = 'TICKET_RESOLVED',
  ESCALATE_TICKET = 'TICKET_ESCALATED',
  COMMENT_TICKET = 'TICKET_COMMENTED',
  
  // Bulk actions
  BULK_BLOCK = 'BULK_BLOCK',
  BULK_UNBLOCK = 'BULK_UNBLOCK',
  BULK_REVERIFY = 'BULK_REVERIFY',
  
  // Export actions
  EXPORT_TRUCKS = 'EXPORT_TRUCKS',
  EXPORT_TICKETS = 'EXPORT_TICKETS',
  
  // Admin user actions
  CREATE_ADMIN = 'ADMIN_CREATED',
  UPDATE_ADMIN = 'ADMIN_UPDATED',
  DELETE_ADMIN = 'ADMIN_DELETED',
  
  // System actions
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
}

/**
 * Resource types
 */
export enum AuditResourceType {
  TRUCK = 'truck',
  TRAILER = 'trailer',
  TICKET = 'ticket',
  OPERATOR = 'operator',
  ADMIN_USER = 'admin_user',
  EXPORT = 'export',
  SYSTEM = 'system',
}

/**
 * Generate unique transaction ID
 */
const generateTxnId = (): string => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `AUD-${date}-${random}`;
};

/**
 * Write audit log entry
 */
export const log = async (entry: AuditLogEntry): Promise<string> => {
  try {
    const txnId = entry.txnId || generateTxnId();
    
    // TODO: Replace with actual DB query
    if (!pool) {
      console.log('[AUDIT LOG - STUB]', {
        ...entry,
        txnId,
        timestamp: new Date().toISOString(),
      });
      return txnId;
    }

    const query = `
      INSERT INTO admin_audit_logs (
        admin_id,
        action_type,
        resource_type,
        resource_id,
        payload,
        provider_txn_id,
        txn_id,
        correlation_id,
        ip_address,
        user_agent,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING txn_id
    `;

    const values = [
      entry.adminId,
      entry.actionType,
      entry.resourceType,
      entry.resourceId,
      JSON.stringify(entry.payload || {}),
      entry.providerTxnId || null,
      txnId,
      entry.correlationId || null,
      entry.ipAddress || null,
      entry.userAgent || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0].txn_id;
  } catch (error: any) {
    console.error('[AUDIT SERVICE] Failed to write audit log:', error);
    // Don't throw - audit failure shouldn't block the operation
    // But log to monitoring service
    return 'AUDIT_FAILED';
  }
};

/**
 * Query audit logs
 */
export const query = async (filters: AuditLogQuery): Promise<any[]> => {
  try {
    // TODO: Replace with actual DB query
    if (!pool) {
      console.log('[AUDIT QUERY - STUB]', filters);
      return [];
    }

    let whereConditions: string[] = [];
    let values: any[] = [];
    let paramIndex = 1;

    if (filters.adminId) {
      whereConditions.push(`admin_id = $${paramIndex++}`);
      values.push(filters.adminId);
    }

    if (filters.actionType) {
      if (Array.isArray(filters.actionType)) {
        whereConditions.push(`action_type = ANY($${paramIndex++})`);
        values.push(filters.actionType);
      } else {
        whereConditions.push(`action_type = $${paramIndex++}`);
        values.push(filters.actionType);
      }
    }

    if (filters.resourceType) {
      whereConditions.push(`resource_type = $${paramIndex++}`);
      values.push(filters.resourceType);
    }

    if (filters.resourceId) {
      whereConditions.push(`resource_id = $${paramIndex++}`);
      values.push(filters.resourceId);
    }

    if (filters.startDate) {
      whereConditions.push(`created_at >= $${paramIndex++}`);
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      whereConditions.push(`created_at <= $${paramIndex++}`);
      values.push(filters.endDate);
    }

    if (filters.txnId) {
      whereConditions.push(`txn_id = $${paramIndex++}`);
      values.push(filters.txnId);
    }

    if (filters.correlationId) {
      whereConditions.push(`correlation_id = $${paramIndex++}`);
      values.push(filters.correlationId);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    const queryText = `
      SELECT 
        id,
        admin_id,
        action_type,
        resource_type,
        resource_id,
        payload,
        provider_txn_id,
        txn_id,
        correlation_id,
        ip_address,
        user_agent,
        created_at
      FROM admin_audit_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++}
      OFFSET $${paramIndex++}
    `;

    values.push(limit, offset);

    const result = await pool.query(queryText, values);
    return result.rows;
  } catch (error: any) {
    console.error('[AUDIT SERVICE] Failed to query audit logs:', error);
    throw error;
  }
};

/**
 * Get audit log by transaction ID
 */
export const getByTxnId = async (txnId: string): Promise<any | null> => {
  try {
    if (!pool) {
      console.log('[AUDIT GET BY TXN_ID - STUB]', txnId);
      return null;
    }

    const query = `
      SELECT * FROM admin_audit_logs
      WHERE txn_id = $1
    `;

    const result = await pool.query(query, [txnId]);
    return result.rows[0] || null;
  } catch (error: any) {
    console.error('[AUDIT SERVICE] Failed to get audit log:', error);
    return null;
  }
};

/**
 * Get audit trail for a specific resource
 */
export const getResourceAudit = async (
  resourceType: string,
  resourceId: string,
  limit: number = 50
): Promise<any[]> => {
  return query({
    resourceType,
    resourceId,
    limit,
  });
};

/**
 * Get recent actions by admin
 */
export const getAdminActivity = async (
  adminId: string,
  days: number = 7
): Promise<any[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return query({
    adminId,
    startDate,
    limit: 1000,
  });
};

/**
 * Log bulk action with correlation ID
 */
export const logBulkAction = async (
  adminId: string,
  actionType: string,
  resources: { resourceType: string; resourceId: string }[],
  payload: Record<string, any>,
  ipAddress?: string
): Promise<string> => {
  const correlationId = `BULK-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  // Log parent action
  await log({
    adminId,
    actionType,
    resourceType: 'bulk_operation',
    resourceId: correlationId,
    payload: {
      ...payload,
      totalResources: resources.length,
    },
    correlationId,
    ipAddress,
  });

  // Log individual resource actions (async, don't await)
  Promise.all(
    resources.map(resource =>
      log({
        adminId,
        actionType: `${actionType}_ITEM`,
        resourceType: resource.resourceType,
        resourceId: resource.resourceId,
        payload,
        correlationId,
        ipAddress,
      })
    )
  ).catch(err => console.error('[AUDIT SERVICE] Bulk log failed:', err));

  return correlationId;
};

/**
 * Get statistics for audit logs
 */
export const getStats = async (adminId?: string): Promise<any> => {
  try {
    if (!pool) {
      return {
        total: 0,
        byAction: {},
        byResource: {},
      };
    }

    const whereClause = adminId ? 'WHERE admin_id = $1' : '';
    const values = adminId ? [adminId] : [];

    const query = `
      SELECT 
        COUNT(*) as total_logs,
        COUNT(DISTINCT admin_id) as unique_admins,
        COUNT(DISTINCT DATE(created_at)) as days_active,
        json_object_agg(action_type, count) as actions_count
      FROM (
        SELECT 
          admin_id,
          created_at,
          action_type,
          COUNT(*) as count
        FROM admin_audit_logs
        ${whereClause}
        GROUP BY admin_id, DATE(created_at), action_type
      ) subquery
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || {};
  } catch (error: any) {
    console.error('[AUDIT SERVICE] Failed to get stats:', error);
    return {};
  }
};

/**
 * Cleanup old audit logs (respecting retention policy)
 * Called by cron job
 */
export const cleanup = async (): Promise<number> => {
  try {
    if (!pool) {
      console.log('[AUDIT CLEANUP - STUB] Would delete old logs');
      return 0;
    }

    // Get retention policy
    const policyQuery = `
      SELECT retention_days 
      FROM data_retention_policies 
      WHERE resource_type = 'audit_logs'
    `;
    const policyResult = await pool.query(policyQuery);
    const retentionDays = policyResult.rows[0]?.retention_days || 2555; // Default 7 years

    // Note: We don't actually delete from audit_logs due to immutability
    // Instead, we archive to cold storage or mark for archival
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const archiveQuery = `
      SELECT COUNT(*) as archived_count
      FROM admin_audit_logs
      WHERE created_at < $1
    `;

    const result = await pool.query(archiveQuery, [cutoffDate]);
    const archivedCount = result.rows[0]?.archived_count || 0;

    // TODO: Implement actual archival to S3/cold storage

    return archivedCount;
  } catch (error: any) {
    console.error('[AUDIT SERVICE] Cleanup failed:', error);
    return 0;
  }
};

export default {
  log,
  query,
  getByTxnId,
  getResourceAudit,
  getAdminActivity,
  logBulkAction,
  getStats,
  cleanup,
  AuditActionType,
  AuditResourceType,
};

