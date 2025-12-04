/**
 * User Management Service - Team Onboarding & Lifecycle
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { ulid } from 'ulid';
import { logger } from '../../utils/logger';
import { createAuditLog } from './audit.service';
import bcrypt from 'bcryptjs';

const log = logger.child({ module: 'user-management' });

export interface UserInvite {
  phone: string;
  email?: string;
  name: string;
  roleKeys: string[];
  regionDistricts?: string[];
  invitedBy: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  isActive?: boolean;
  reason?: string;
}

/**
 * Invite user (send OTP via SMS mock)
 */
export async function inviteUser(invite: UserInvite): Promise<string> {
  try {
    const userId = `USER-${ulid()}`;
    const inviteToken = crypto.randomBytes(32).toString('hex');

    // Create user with INVITED status
    await query(
      `INSERT INTO users
       (id, phone, email, name, role, is_active, created_at)
       VALUES ($1, $2, $3, $4, 'ADMIN_INVITED', FALSE, NOW())`,
      [userId, invite.phone, invite.email || null, invite.name]
    );

    // Assign roles
    for (const roleKey of invite.roleKeys) {
      await query(
        `INSERT INTO user_roles
         (id, user_id, role_id, assigned_by, region_districts, assigned_at)
         VALUES (
           $1,
           $2,
           (SELECT id FROM roles WHERE role_key = $3),
           $4,
           $5,
           NOW()
         )`,
        [uuid(), userId, roleKey, invite.invitedBy, invite.regionDistricts || null]
      );
    }

    // Send invite (mock SMS/email)
    log.info({ userId, phone: invite.phone, inviteToken }, 'User invite sent (mock)');

    // Audit log
    await createAuditLog({
      actorId: invite.invitedBy,
      actorRole: 'ADMIN',
      action: 'CREATE_USER',
      resourceType: 'USER',
      resourceId: userId,
      metadata: { phone: invite.phone, roles: invite.roleKeys },
    });

    return userId;
  } catch (error) {
    log.error({ error, invite }, 'Failed to invite user');
    throw error;
  }
}

/**
 * Update user
 */
export async function updateUser(
  userId: string,
  updates: UserUpdate,
  updatedBy: string
): Promise<void> {
  try {
    // Get current user
    const currentResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (currentResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const currentUser = currentResult.rows[0];

    // Build update query
    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      params.push(updates.name);
    }

    if (updates.email !== undefined) {
      setClauses.push(`email = $${paramIndex++}`);
      params.push(updates.email);
    }

    if (updates.isActive !== undefined) {
      setClauses.push(`is_active = $${paramIndex++}`);
      params.push(updates.isActive);
    }

    if (setClauses.length === 0) {
      return;
    }

    setClauses.push(`updated_at = NOW()`);
    params.push(userId);

    await query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`,
      params
    );

    // Audit log
    await createAuditLog({
      actorId: updatedBy,
      actorRole: 'ADMIN',
      action: 'EDIT_USER',
      resourceType: 'USER',
      resourceId: userId,
      delta: { before: currentUser, after: updates },
      reason: updates.reason,
    });

    log.info({ userId, updatedBy }, 'User updated');
  } catch (error) {
    log.error({ error, userId }, 'Failed to update user');
    throw error;
  }
}

/**
 * Suspend user (soft delete)
 */
export async function suspendUser(
  userId: string,
  reason: string,
  suspendedBy: string
): Promise<void> {
  await updateUser(userId, { isActive: false, reason }, suspendedBy);
  
  log.info({ userId, reason, suspendedBy }, 'User suspended');
}

/**
 * Login as user (impersonation - superadmin only)
 */
export async function loginAsUser(
  targetUserId: string,
  adminId: string,
  adminRole: string,
  reason: string
): Promise<string> {
  if (!reason || reason.trim().length < 20) {
    throw new Error('Login-as requires detailed reason (min 20 characters)');
  }

  // Audit log with HIGH visibility
  await createAuditLog({
    actorId: adminId,
    actorRole: adminRole,
    action: 'LOGIN_AS',
    resourceType: 'USER',
    resourceId: targetUserId,
    reason,
    metadata: { impersonation: true },
  });

  // Generate temporary auth token
  const impersonationToken = `IMP-${ulid()}`;

  log.warn({ adminId, targetUserId, reason }, 'Admin logged in as user (impersonation)');

  return impersonationToken;
}

