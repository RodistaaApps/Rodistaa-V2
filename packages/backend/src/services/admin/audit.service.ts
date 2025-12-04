/**
 * Audit Service - Immutable Activity Trail
 * Logs all admin and sensitive actions
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { ulid } from 'ulid';
import { logger } from '../../utils/logger';

const log = logger.child({ module: 'audit-service' });

export interface AuditLogEntry {
  actorId: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  delta?: {
    before?: any;
    after?: any;
  };
  reason?: string;
  metadata?: Record<string, any>;
  actorIp?: string;
  userAgent?: string;
}

/**
 * Create audit log entry
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<string> {
  try {
    const auditId = `AUDIT-${ulid()}`;

    await query(
      `INSERT INTO audit_logs
       (id, audit_id, actor_id, actor_role, actor_ip, action, resource_type, 
        resource_id, delta, reason, metadata, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
      [
        uuid(),
        auditId,
        entry.actorId,
        entry.actorRole,
        entry.actorIp || null,
        entry.action,
        entry.resourceType,
        entry.resourceId || null,
        entry.delta ? JSON.stringify(entry.delta) : null,
        entry.reason || null,
        entry.metadata ? JSON.stringify(entry.metadata) : null,
        entry.userAgent || null,
      ]
    );

    log.info({ auditId, action: entry.action, actor: entry.actorId }, 'Audit log created');

    return auditId;
  } catch (error) {
    log.error({ error, entry }, 'Failed to create audit log');
    throw error;
  }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters: {
  actorId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ logs: any[]; total: number }> {
  try {
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.actorId) {
      whereConditions.push(`al.actor_id = $${paramIndex++}`);
      params.push(filters.actorId);
    }

    if (filters.action) {
      whereConditions.push(`al.action = $${paramIndex++}`);
      params.push(filters.action);
    }

    if (filters.resourceType) {
      whereConditions.push(`al.resource_type = $${paramIndex++}`);
      params.push(filters.resourceType);
    }

    if (filters.resourceId) {
      whereConditions.push(`al.resource_id = $${paramIndex++}`);
      params.push(filters.resourceId);
    }

    if (filters.startDate) {
      whereConditions.push(`al.created_at >= $${paramIndex++}`);
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      whereConditions.push(`al.created_at <= $${paramIndex++}`);
      params.push(filters.endDate);
    }

    const whereClause = whereConditions.length > 0
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM audit_logs al ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get logs
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const logsResult = await query(
      `SELECT al.*, u.name AS actor_name, u.phone AS actor_phone
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.actor_id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return {
      logs: logsResult.rows,
      total,
    };
  } catch (error) {
    log.error({ error, filters }, 'Failed to get audit logs');
    throw error;
  }
}

/**
 * Log PII access (requires reason)
 */
export async function logPIIAccess(
  actorId: string,
  actorRole: string,
  resourceType: string,
  resourceId: string,
  reason: string,
  actorIp?: string
): Promise<string> {
  if (!reason || reason.trim().length < 10) {
    throw new Error('PII access requires detailed reason (min 10 characters)');
  }

  return createAuditLog({
    actorId,
    actorRole,
    action: 'VIEW_PII',
    resourceType,
    resourceId,
    reason,
    actorIp,
    metadata: { piiAccessJustified: true },
  });
}

/**
 * Log admin action (with before/after delta)
 */
export async function logAdminAction(
  actorId: string,
  actorRole: string,
  action: string,
  resourceType: string,
  resourceId: string,
  before: any,
  after: any,
  reason?: string,
  actorIp?: string
): Promise<string> {
  return createAuditLog({
    actorId,
    actorRole,
    action,
    resourceType,
    resourceId,
    delta: { before, after },
    reason,
    actorIp,
  });
}

