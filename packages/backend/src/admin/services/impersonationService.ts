/**
 * Impersonation Service
 * 
 * Allows SuperAdmin to impersonate users for troubleshooting.
 * All impersonation sessions are:
 * - Logged with mandatory reason
 * - Time-limited (default 1 hour)
 * - Fully audited (every action tracked)
 * - Restricted to SuperAdmin role only
 * 
 * Usage:
 *   const session = await impersonationService.startSession({
 *     adminId: 'ADM-001',
 *     targetUserId: 'OP-123',
 *     targetUserType: 'operator',
 *     reason: 'Troubleshooting payment issue reported in ticket TKT-456'
 *   });
 */

import { Pool } from 'pg';
import crypto from 'crypto';
import auditService, { AuditActionType, AuditResourceType } from './auditService';
import notificationService, { NotificationType, NotificationSeverity } from './notificationService';

const pool: Pool | null = null; // TODO: Import actual DB connection

export interface ImpersonationSession {
  id: number;
  admin_id: string;
  admin_name?: string;
  target_user_id: string;
  target_user_name?: string;
  target_user_type: 'operator' | 'driver' | 'shipper';
  reason: string;
  started_at: string;
  ended_at: string | null;
  ip_address: string | null;
  session_token: string;
  is_active: boolean;
}

export interface StartImpersonationRequest {
  adminId: string;
  targetUserId: string;
  targetUserType: 'operator' | 'driver' | 'shipper';
  reason: string;
  ipAddress?: string;
}

/**
 * Generate unique session token
 */
const generateSessionToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Start impersonation session
 */
export const startSession = async (
  request: StartImpersonationRequest
): Promise<ImpersonationSession> => {
  try {
    // Validate reason
    if (!request.reason || request.reason.length < 30) {
      throw new Error('Reason must be at least 30 characters for impersonation');
    }

    const sessionToken = generateSessionToken();

    if (!pool) {
      // Mock session
      const mockSession: ImpersonationSession = {
        id: Date.now(),
        admin_id: request.adminId,
        admin_name: 'Admin User',
        target_user_id: request.targetUserId,
        target_user_name: 'Target User',
        target_user_type: request.targetUserType,
        reason: request.reason,
        started_at: new Date().toISOString(),
        ended_at: null,
        ip_address: request.ipAddress || null,
        session_token: sessionToken,
        is_active: true,
      };

      console.log('[IMPERSONATION - STUB] Session started:', mockSession);

      // Audit log
      await auditService.log({
        adminId: request.adminId,
        actionType: 'START_IMPERSONATION' as any,
        resourceType: request.targetUserType as any,
        resourceId: request.targetUserId,
        payload: { reason: request.reason },
        ipAddress: request.ipAddress,
      });

      return mockSession;
    }

    // Insert session
    const query = `
      INSERT INTO impersonation_sessions (
        admin_id, target_user_id, target_user_type, reason, 
        started_at, ip_address, session_token
      ) VALUES ($1, $2, $3, $4, NOW(), $5, $6)
      RETURNING *
    `;

    const values = [
      request.adminId,
      request.targetUserId,
      request.targetUserType,
      request.reason,
      request.ipAddress || null,
      sessionToken,
    ];

    const result = await pool.query(query, values);
    const session = result.rows[0];

    // Audit log
    await auditService.log({
      adminId: request.adminId,
      actionType: 'START_IMPERSONATION' as any,
      resourceType: request.targetUserType as any,
      resourceId: request.targetUserId,
      payload: { 
        reason: request.reason,
        sessionId: session.id,
        sessionToken: sessionToken.substring(0, 8) + '...',
      },
      ipAddress: request.ipAddress,
    });

    // Send critical alert
    await notificationService.notify({
      type: NotificationType.SYSTEM_ALERT,
      severity: NotificationSeverity.CRITICAL,
      title: `User Impersonation Started`,
      message: `Admin ${request.adminId} is impersonating ${request.targetUserType} ${request.targetUserId}`,
      payload: {
        sessionId: session.id,
        adminId: request.adminId,
        targetUserId: request.targetUserId,
        reason: request.reason,
      },
    });

    return {
      ...session,
      is_active: true,
    };
  } catch (error: any) {
    console.error('[IMPERSONATION] Start session failed:', error);
    throw error;
  }
};

/**
 * End impersonation session
 */
export const endSession = async (
  sessionId: number,
  adminId: string
): Promise<void> => {
  try {
    if (!pool) {
      console.log('[IMPERSONATION - STUB] Session ended:', sessionId);

      // Audit log
      await auditService.log({
        adminId,
        actionType: 'END_IMPERSONATION' as any,
        resourceType: AuditResourceType.SYSTEM,
        resourceId: sessionId.toString(),
        payload: { sessionId },
      });

      return;
    }

    // Update session
    const query = `
      UPDATE impersonation_sessions
      SET ended_at = NOW()
      WHERE id = $1 AND admin_id = $2 AND ended_at IS NULL
      RETURNING *
    `;

    const result = await pool.query(query, [sessionId, adminId]);

    if (result.rows.length === 0) {
      throw new Error('Active session not found');
    }

    const session = result.rows[0];

    // Audit log
    await auditService.log({
      adminId,
      actionType: 'END_IMPERSONATION' as any,
      resourceType: session.target_user_type as any,
      resourceId: session.target_user_id,
      payload: { 
        sessionId,
        duration: new Date().getTime() - new Date(session.started_at).getTime(),
      },
    });

    console.log('[IMPERSONATION] Session ended:', sessionId);
  } catch (error: any) {
    console.error('[IMPERSONATION] End session failed:', error);
    throw error;
  }
};

/**
 * Get active sessions
 */
export const getActiveSessions = async (): Promise<ImpersonationSession[]> => {
  try {
    if (!pool) {
      return [];
    }

    const query = `
      SELECT 
        s.*,
        a.name as admin_name,
        u.name as target_user_name
      FROM impersonation_sessions s
      LEFT JOIN admin_users a ON s.admin_id = a.id
      LEFT JOIN users u ON s.target_user_id = u.id
      WHERE s.ended_at IS NULL
      ORDER BY s.started_at DESC
    `;

    const result = await pool.query(query);
    
    return result.rows.map(row => ({
      ...row,
      is_active: true,
    }));
  } catch (error: any) {
    console.error('[IMPERSONATION] Get active sessions failed:', error);
    return [];
  }
};

/**
 * Get session history
 */
export const getSessionHistory = async (
  adminId?: string,
  targetUserId?: string,
  limit: number = 50
): Promise<ImpersonationSession[]> => {
  try {
    if (!pool) {
      return [];
    }

    let whereConditions: string[] = [];
    let values: any[] = [];
    let paramIndex = 1;

    if (adminId) {
      whereConditions.push(`s.admin_id = $${paramIndex++}`);
      values.push(adminId);
    }

    if (targetUserId) {
      whereConditions.push(`s.target_user_id = $${paramIndex++}`);
      values.push(targetUserId);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const query = `
      SELECT 
        s.*,
        a.name as admin_name,
        u.name as target_user_name
      FROM impersonation_sessions s
      LEFT JOIN admin_users a ON s.admin_id = a.id
      LEFT JOIN users u ON s.target_user_id = u.id
      ${whereClause}
      ORDER BY s.started_at DESC
      LIMIT $${paramIndex}
    `;

    values.push(limit);

    const result = await pool.query(query, values);
    
    return result.rows.map(row => ({
      ...row,
      is_active: row.ended_at === null,
    }));
  } catch (error: any) {
    console.error('[IMPERSONATION] Get session history failed:', error);
    return [];
  }
};

/**
 * Auto-expire sessions after timeout (cron job)
 */
export const expireOldSessions = async (): Promise<number> => {
  try {
    if (!pool) {
      return 0;
    }

    // End sessions older than 1 hour
    const query = `
      UPDATE impersonation_sessions
      SET ended_at = NOW()
      WHERE ended_at IS NULL
        AND started_at < NOW() - INTERVAL '1 hour'
      RETURNING id
    `;

    const result = await pool.query(query);
    
    console.log(`[IMPERSONATION] Expired ${result.rowCount || 0} old sessions`);
    
    return result.rowCount || 0;
  } catch (error: any) {
    console.error('[IMPERSONATION] Expire sessions failed:', error);
    return 0;
  }
};

export default {
  startSession,
  endSession,
  getActiveSessions,
  getSessionHistory,
  expireOldSessions,
};

