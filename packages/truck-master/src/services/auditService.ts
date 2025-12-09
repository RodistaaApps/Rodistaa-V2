/**
 * Audit Service
 * Write audit entries for admin actions and automated escalations
 */

import { query, PoolClient } from '../db';

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  rc_number: string;
  operator_id?: string;
  event_type: string;
  provider?: string;
  txn_id?: string;
  decision?: any;
  rules_applied?: string[];
  inference_confidence?: number;
  error_message?: string;
}

/**
 * Log audit entry
 */
export async function logAudit(
  entry: AuditLogEntry,
  client?: PoolClient
): Promise<void> {
  const queryFn = client ? client.query.bind(client) : query;

  await queryFn(
    `INSERT INTO verification_audit_log
     (rc_number, operator_id, event_type, provider, txn_id, decision, 
      rules_applied, inference_confidence, error_message)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      entry.rc_number,
      entry.operator_id || null,
      entry.event_type,
      entry.provider || null,
      entry.txn_id || null,
      entry.decision ? JSON.stringify(entry.decision) : null,
      entry.rules_applied || null,
      entry.inference_confidence || null,
      entry.error_message || null,
    ]
  );
}

/**
 * Log admin action audit
 */
export async function logAdminAction(
  adminId: string,
  actionType: string,
  resourceType: string,
  resourceId: string,
  payload: any
): Promise<void> {
  // Use admin_audit_logs table if it exists, otherwise use verification_audit_log
  try {
    await query(
      `INSERT INTO admin_audit_logs
       (admin_id, action_type, resource_type, resource_id, payload)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminId, actionType, resourceType, resourceId, JSON.stringify(payload)]
    );
  } catch (error) {
    // Fallback to verification_audit_log if admin_audit_logs doesn't exist
    await logAudit({
      rc_number: resourceId,
      event_type: `ADMIN_${actionType}`,
      decision: { admin_id: adminId, resource_type: resourceType, payload },
    });
  }
}

