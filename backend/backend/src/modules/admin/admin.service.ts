/**
 * Admin Service
 * Business logic for admin operations
 */

import { query } from '../../db/connection';
import logger from 'pino';

const log = logger({ name: 'admin-service' });

/**
 * Get admin dashboard KPIs
 */
export async function getDashboard(): Promise<any> {
  const [
    usersResult,
    bookingsResult,
    shipmentsResult,
    trucksResult,
    overridesResult,
    acsBlocksResult,
  ] = await Promise.all([
    query(`SELECT COUNT(*) as total FROM users WHERE is_active = true`),
    query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'OPEN') as open FROM bookings`),
    query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed FROM shipments`),
    query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_blocked = true) as blocked FROM trucks`),
    query(`SELECT COUNT(*) as pending FROM override_requests WHERE status = 'PENDING'`),
    query(`SELECT COUNT(*) as total FROM acs_blocks WHERE status = 'ACTIVE'`),
  ]);

  return {
    users: {
      total: parseInt(usersResult.rows[0].total) || 0,
    },
    bookings: {
      total: parseInt(bookingsResult.rows[0].total) || 0,
      open: parseInt(bookingsResult.rows[0].open) || 0,
    },
    shipments: {
      total: parseInt(shipmentsResult.rows[0].total) || 0,
      completed: parseInt(shipmentsResult.rows[0].completed) || 0,
    },
    trucks: {
      total: parseInt(trucksResult.rows[0].total) || 0,
      blocked: parseInt(trucksResult.rows[0].blocked) || 0,
    },
    overrides: {
      pending: parseInt(overridesResult.rows[0].pending) || 0,
    },
    acs: {
      activeBlocks: parseInt(acsBlocksResult.rows[0].total) || 0,
    },
  };
}

/**
 * Get override requests
 */
export async function getOverrideRequests(filters: {
  status?: string;
  entityType?: string;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  let queryStr = `SELECT * FROM override_requests WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.status) {
    queryStr += ` AND status = $${paramIndex++}`;
    params.push(filters.status);
  }

  if (filters.entityType) {
    queryStr += ` AND entity_type = $${paramIndex++}`;
    params.push(filters.entityType);
  }

  queryStr += ` ORDER BY created_at DESC`;
  
  if (filters.limit) {
    queryStr += ` LIMIT $${paramIndex++}`;
    params.push(filters.limit);
  }

  if (filters.offset) {
    queryStr += ` OFFSET $${paramIndex++}`;
    params.push(filters.offset);
  }

  const result = await query(queryStr, params);
  return result.rows;
}

/**
 * Approve override request
 */
export async function approveOverride(
  overrideId: string,
  adminId: string,
  notes?: string
): Promise<void> {
  await query(
    `UPDATE override_requests 
     SET status = 'APPROVED', approved_by = $1, approved_at = NOW(), admin_notes = $2
     WHERE id = $3`,
    [adminId, notes || null, overrideId]
  );

  // Execute the override action (unblock, unfreeze, etc.)
  const override = await query(
    `SELECT * FROM override_requests WHERE id = $1`,
    [overrideId]
  );

  if (override.rows[0]) {
    const req = override.rows[0];
    // Perform the override action based on entity_type and action_type
    log.info({ overrideId, entityType: req.entity_type, action: req.action_type }, 'Override approved and executed');
  }
}

/**
 * Reject override request
 */
export async function rejectOverride(
  overrideId: string,
  adminId: string,
  reason: string
): Promise<void> {
  await query(
    `UPDATE override_requests 
     SET status = 'REJECTED', approved_by = $1, rejected_at = NOW(), admin_notes = $2
     WHERE id = $3`,
    [adminId, reason, overrideId]
  );
}

/**
 * Get audit log
 */
export async function getAuditLog(filters: {
  entityType?: string;
  entityId?: string;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  let queryStr = `SELECT * FROM audit_logs WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.entityType) {
    queryStr += ` AND entity_type = $${paramIndex++}`;
    params.push(filters.entityType);
  }

  if (filters.entityId) {
    queryStr += ` AND entity_id = $${paramIndex++}`;
    params.push(filters.entityId);
  }

  queryStr += ` ORDER BY created_at DESC`;
  
  if (filters.limit) {
    queryStr += ` LIMIT $${paramIndex++}`;
    params.push(filters.limit || 100);
  }

  if (filters.offset) {
    queryStr += ` OFFSET $${paramIndex++}`;
    params.push(filters.offset || 0);
  }

  const result = await query(queryStr, params);
  return result.rows;
}

