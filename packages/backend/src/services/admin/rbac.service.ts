/**
 * RBAC Service - Dynamic Role-Based Access Control
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { logger } from '../../utils/logger';
import { createAuditLog } from './audit.service';

const log = logger.child({ module: 'rbac-service' });

export interface RoleConfig {
  roleKey: string;
  roleName: string;
  description?: string;
  parentRoleId?: string;
  level?: number;
  isSystemRole?: boolean;
  createdBy: string;
}

export interface PermissionConfig {
  permissionKey: string;
  resource: string;
  action: string;
  label: string;
  description?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * Create role
 */
export async function createRole(config: RoleConfig): Promise<string> {
  try {
    const roleId = uuid();

    await query(
      `INSERT INTO roles
       (id, role_key, role_name, description, parent_role_id, level, 
        is_system_role, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        roleId,
        config.roleKey,
        config.roleName,
        config.description || null,
        config.parentRoleId || null,
        config.level || 0,
        config.isSystemRole || false,
        config.createdBy,
      ]
    );

    // Audit log
    await createAuditLog({
      actorId: config.createdBy,
      actorRole: 'ADMIN',
      action: 'CREATE_ROLE',
      resourceType: 'ROLE',
      resourceId: config.roleKey,
      metadata: config,
    });

    log.info({ roleKey: config.roleKey, createdBy: config.createdBy }, 'Role created');

    return config.roleKey;
  } catch (error) {
    log.error({ error, config }, 'Failed to create role');
    throw error;
  }
}

/**
 * Assign permission to role
 */
export async function assignPermissionToRole(
  roleKey: string,
  permissionKey: string,
  grantedBy: string
): Promise<void> {
  try {
    await query(
      `INSERT INTO role_permissions
       (id, role_id, permission_id, granted_by, granted_at)
       VALUES (
         $1,
         (SELECT id FROM roles WHERE role_key = $2),
         (SELECT id FROM permissions WHERE permission_key = $3),
         $4,
         NOW()
       )
       ON CONFLICT (role_id, permission_id) DO NOTHING`,
      [uuid(), roleKey, permissionKey, grantedBy]
    );

    log.info({ roleKey, permissionKey, grantedBy }, 'Permission assigned to role');
  } catch (error) {
    log.error({ error, roleKey, permissionKey }, 'Failed to assign permission');
    throw error;
  }
}

/**
 * Assign role to user
 */
export async function assignRoleToUser(
  userId: string,
  roleKey: string,
  assignedBy: string,
  expiresAt?: Date,
  regionDistricts?: string[]
): Promise<void> {
  try {
    await query(
      `INSERT INTO user_roles
       (id, user_id, role_id, assigned_by, assigned_at, expires_at, region_districts)
       VALUES (
         $1,
         $2,
         (SELECT id FROM roles WHERE role_key = $3),
         $4,
         NOW(),
         $5,
         $6
       )
       ON CONFLICT (user_id, role_id) DO UPDATE
       SET is_active = TRUE, assigned_at = NOW(), expires_at = EXCLUDED.expires_at`,
      [uuid(), userId, roleKey, assignedBy, expiresAt || null, regionDistricts || null]
    );

    // Audit log
    await createAuditLog({
      actorId: assignedBy,
      actorRole: 'ADMIN',
      action: 'ASSIGN_ROLE',
      resourceType: 'USER',
      resourceId: userId,
      metadata: { roleKey, expiresAt, regionDistricts },
    });

    log.info({ userId, roleKey, assignedBy }, 'Role assigned to user');
  } catch (error) {
    log.error({ error, userId, roleKey }, 'Failed to assign role');
    throw error;
  }
}

/**
 * Check if user has permission
 */
export async function hasPermission(
  userId: string,
  permissionKey: string
): Promise<boolean> {
  try {
    const result = await query(
      `SELECT EXISTS (
         SELECT 1
         FROM user_roles ur
         JOIN role_permissions rp ON rp.role_id = ur.role_id
         JOIN permissions p ON p.id = rp.permission_id
         WHERE ur.user_id = $1 
         AND p.permission_key = $2
         AND ur.is_active = TRUE
         AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
       ) AS has_permission`,
      [userId, permissionKey]
    );

    return result.rows[0].has_permission;
  } catch (error) {
    log.error({ error, userId, permissionKey }, 'Failed to check permission');
    return false; // Fail closed
  }
}

/**
 * Get user permissions
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const result = await query(
    `SELECT DISTINCT p.permission_key
     FROM user_roles ur
     JOIN role_permissions rp ON rp.role_id = ur.role_id
     JOIN permissions p ON p.id = rp.permission_id
     WHERE ur.user_id = $1 
     AND ur.is_active = TRUE
     AND (ur.expires_at IS NULL OR ur.expires_at > NOW())`,
    [userId]
  );

  return result.rows.map(r => r.permission_key);
}

