/**
 * Users Repository
 * Database operations for users
 */

import { query } from '../../db/connection';
import logger from 'pino';

const log = logger({ name: 'users-repository' });

export interface User {
  id: string;
  mobile: string;
  name: string;
  role: string;
  email?: string;
  kycStatus: string;
  isActive: boolean;
  isBlocked: boolean;
  deviceId?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get user by ID with optional field masking
 */
export async function getUserById(userId: string, maskSensitive: boolean = true): Promise<User | null> {
  try {
    const result = await query(
      `SELECT * FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapRowToUser(result.rows[0], maskSensitive);
  } catch (error: any) {
    log.error({ error, userId }, 'Failed to get user');
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUser(userId: string, updates: {
  name?: string;
  email?: string;
}): Promise<User> {
  try {
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      params.push(updates.name);
    }

    if (updates.email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      params.push(updates.email);
    }

    if (updateFields.length === 0) {
      return getUserById(userId, false) as Promise<User>;
    }

    updateFields.push(`updated_at = NOW()`);
    params.push(userId);

    await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex++}`,
      params
    );

    return getUserById(userId, false) as Promise<User>;
  } catch (error: any) {
    log.error({ error, userId }, 'Failed to update user');
    throw error;
  }
}

/**
 * Mask sensitive fields for UI display
 */
function maskMobile(mobile: string): string {
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.length < 4) return mobile;
  const visible = cleaned.slice(-4);
  return `+${cleaned.slice(0, -4).replace(/\d/g, 'X')}${visible}`;
}

/**
 * Map database row to User object
 */
function mapRowToUser(row: any, maskSensitive: boolean = true): User {
  return {
    id: row.id,
    mobile: maskSensitive ? maskMobile(row.mobile) : row.mobile,
    name: row.name,
    role: row.role,
    email: maskSensitive && row.email ? maskEmail(row.email) : row.email,
    kycStatus: row.kyc_status,
    isActive: row.is_active,
    isBlocked: row.is_blocked,
    deviceId: maskSensitive ? undefined : row.device_id,
    lastLoginAt: row.last_login_at?.toISOString(),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at?.toISOString(),
  };
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = local.slice(0, 2) + '***' + local.slice(-1);
  return `${maskedLocal}@${domain}`;
}

