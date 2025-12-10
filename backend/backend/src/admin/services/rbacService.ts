/**
 * RBAC Service
 * 
 * Dynamic role-based access control with:
 * - Role creation and management
 * - Permission inheritance (role hierarchy)
 * - Regional scoping
 * - Role expiration
 * - Permission validation
 */

import { Pool } from 'pg';
import auditService, { AuditActionType, AuditResourceType } from './auditService';

const pool: Pool | null = null; // TODO: Import actual DB connection

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  parent_role_id: string | null;
  scope: 'global' | 'region' | 'franchise';
  is_system_role: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
  parent_role_id?: string;
  scope?: 'global' | 'region' | 'franchise';
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
  parent_role_id?: string;
}

/**
 * Generate unique role ID
 */
const generateRoleId = (name: string): string => {
  const prefix = name.toUpperCase().replace(/\s+/g, '_').substring(0, 10);
  const timestamp = Date.now().toString(36);
  return `ROLE-${prefix}-${timestamp}`;
};

/**
 * Get all available permissions
 */
export const getAvailablePermissions = (): string[] => {
  // TODO: Load from roles.json or database
  return [
    'trucks:read', 'trucks:write', 'trucks:block', 'trucks:unblock',
    'trucks:reverify', 'trucks:export', 'trucks:export_pii', 'trucks:bulk_action',
    'trailers:link', 'trailers:unlink',
    'tickets:read', 'tickets:create', 'tickets:assign', 'tickets:resolve', 'tickets:escalate',
    'analytics:read', 'audit:read',
    'users:read', 'users:write', 'users:delete',
    'notifications:send', 'webhooks:manage',
    'kyc:approve', 'kyc:reject', 'kyc:revoke',
    'fraud:investigate', 'fraud:resolve',
    'overrides:execute', 'overrides:approve',
    'wallet:adjust', 'wallet:payout', 'wallet:refund',
    'impersonation:execute',
  ];
};

/**
 * Create new role
 */
export const createRole = async (
  roleData: CreateRoleRequest,
  adminId: string
): Promise<Role> => {
  try {
    const roleId = generateRoleId(roleData.name);

    if (!pool) {
      // Mock response
      const mockRole: Role = {
        id: roleId,
        name: roleData.name,
        description: roleData.description || '',
        permissions: roleData.permissions,
        parent_role_id: roleData.parent_role_id || null,
        scope: roleData.scope || 'global',
        is_system_role: false,
        created_by: adminId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('[RBAC SERVICE - STUB] Created role:', mockRole);
      return mockRole;
    }

    // Validate permissions
    const validPermissions = getAvailablePermissions();
    const invalidPermissions = roleData.permissions.filter(p => !validPermissions.includes(p));
    if (invalidPermissions.length > 0) {
      throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
    }

    // Insert role
    const query = `
      INSERT INTO admin_roles (
        id, name, description, permissions, parent_role_id, scope, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      roleId,
      roleData.name,
      roleData.description || '',
      JSON.stringify(roleData.permissions),
      roleData.parent_role_id || null,
      roleData.scope || 'global',
      adminId,
    ];

    const result = await pool.query(query, values);
    const role = result.rows[0];

    // Audit log
    await auditService.log({
      adminId,
      actionType: 'CREATE_ROLE' as any,
      resourceType: AuditResourceType.ADMIN_USER,
      resourceId: roleId,
      payload: { name: roleData.name, permissions: roleData.permissions },
    });

    return {
      ...role,
      permissions: JSON.parse(role.permissions),
    };
  } catch (error: any) {
    console.error('[RBAC SERVICE] Create role failed:', error);
    throw error;
  }
};

/**
 * Update role
 */
export const updateRole = async (
  roleId: string,
  updates: UpdateRoleRequest,
  adminId: string
): Promise<Role> => {
  try {
    if (!pool) {
      console.log('[RBAC SERVICE - STUB] Update role:', roleId, updates);
      throw new Error('Database not connected');
    }

    // Check if system role
    const checkQuery = 'SELECT is_system_role FROM admin_roles WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [roleId]);
    
    if (checkResult.rows[0]?.is_system_role) {
      throw new Error('Cannot modify system role');
    }

    // Build update query
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.name) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }
    if (updates.permissions) {
      setClauses.push(`permissions = $${paramIndex++}`);
      values.push(JSON.stringify(updates.permissions));
    }
    if (updates.parent_role_id !== undefined) {
      setClauses.push(`parent_role_id = $${paramIndex++}`);
      values.push(updates.parent_role_id);
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(roleId);

    const query = `
      UPDATE admin_roles
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    const role = result.rows[0];

    // Audit log
    await auditService.log({
      adminId,
      actionType: 'UPDATE_ROLE' as any,
      resourceType: AuditResourceType.ADMIN_USER,
      resourceId: roleId,
      payload: updates,
    });

    return {
      ...role,
      permissions: JSON.parse(role.permissions),
    };
  } catch (error: any) {
    console.error('[RBAC SERVICE] Update role failed:', error);
    throw error;
  }
};

/**
 * Delete role
 */
export const deleteRole = async (roleId: string, adminId: string): Promise<void> => {
  try {
    if (!pool) {
      console.log('[RBAC SERVICE - STUB] Delete role:', roleId);
      return;
    }

    // Check if system role
    const checkQuery = 'SELECT is_system_role, name FROM admin_roles WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [roleId]);
    
    if (checkResult.rows[0]?.is_system_role) {
      throw new Error('Cannot delete system role');
    }

    // Check if role is in use
    const usageQuery = `
      SELECT COUNT(*) as user_count
      FROM admin_users
      WHERE $1 = ANY(role_ids)
    `;
    const usageResult = await pool.query(usageQuery, [roleId]);
    
    if (usageResult.rows[0].user_count > 0) {
      throw new Error(`Cannot delete role: ${usageResult.rows[0].user_count} users still have this role`);
    }

    // Delete role
    await pool.query('DELETE FROM admin_roles WHERE id = $1', [roleId]);

    // Audit log
    await auditService.log({
      adminId,
      actionType: 'DELETE_ROLE' as any,
      resourceType: AuditResourceType.ADMIN_USER,
      resourceId: roleId,
      payload: { roleName: checkResult.rows[0].name },
    });
  } catch (error: any) {
    console.error('[RBAC SERVICE] Delete role failed:', error);
    throw error;
  }
};

/**
 * Get role with inherited permissions
 */
export const getRoleWithInheritedPermissions = async (roleId: string): Promise<string[]> => {
  try {
    if (!pool) {
      return [];
    }

    // Recursive CTE to get role hierarchy
    const query = `
      WITH RECURSIVE role_hierarchy AS (
        SELECT id, permissions, parent_role_id
        FROM admin_roles
        WHERE id = $1
        
        UNION ALL
        
        SELECT r.id, r.permissions, r.parent_role_id
        FROM admin_roles r
        INNER JOIN role_hierarchy rh ON r.id = rh.parent_role_id
      )
      SELECT permissions
      FROM role_hierarchy
    `;

    const result = await pool.query(query, [roleId]);
    
    // Merge all permissions (remove duplicates)
    const allPermissions = new Set<string>();
    result.rows.forEach(row => {
      const perms = JSON.parse(row.permissions);
      perms.forEach((p: string) => allPermissions.add(p));
    });

    return Array.from(allPermissions);
  } catch (error: any) {
    console.error('[RBAC SERVICE] Get inherited permissions failed:', error);
    return [];
  }
};

/**
 * List all roles
 */
export const listRoles = async (scope?: string): Promise<Role[]> => {
  try {
    if (!pool) {
      // Mock roles
      return [
        {
          id: 'ROLE-SUPERADMIN-1',
          name: 'SuperAdmin',
          description: 'Full system access',
          permissions: getAvailablePermissions(),
          parent_role_id: null,
          scope: 'global',
          is_system_role: true,
          created_by: 'SYSTEM',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
    }

    const whereClause = scope ? 'WHERE scope = $1' : '';
    const values = scope ? [scope] : [];

    const query = `
      SELECT * FROM admin_roles
      ${whereClause}
      ORDER BY is_system_role DESC, name ASC
    `;

    const result = await pool.query(query, values);
    
    return result.rows.map(row => ({
      ...row,
      permissions: JSON.parse(row.permissions),
    }));
  } catch (error: any) {
    console.error('[RBAC SERVICE] List roles failed:', error);
    return [];
  }
};

/**
 * Assign role to user
 */
export const assignRoleToUser = async (
  userId: string,
  roleId: string,
  adminId: string,
  expiresAt?: Date
): Promise<void> => {
  try {
    if (!pool) {
      console.log('[RBAC SERVICE - STUB] Assign role:', userId, roleId);
      return;
    }

    // Add role to user's role_ids array
    const query = `
      UPDATE admin_users
      SET role_ids = array_append(role_ids, $1),
          role_expires_at = $2,
          updated_at = NOW()
      WHERE id = $3
        AND NOT ($1 = ANY(role_ids))
    `;

    await pool.query(query, [roleId, expiresAt || null, userId]);

    // Audit log
    await auditService.log({
      adminId,
      actionType: 'ASSIGN_ROLE' as any,
      resourceType: AuditResourceType.ADMIN_USER,
      resourceId: userId,
      payload: { roleId, expiresAt },
    });
  } catch (error: any) {
    console.error('[RBAC SERVICE] Assign role failed:', error);
    throw error;
  }
};

/**
 * Remove role from user
 */
export const removeRoleFromUser = async (
  userId: string,
  roleId: string,
  adminId: string
): Promise<void> => {
  try {
    if (!pool) {
      console.log('[RBAC SERVICE - STUB] Remove role:', userId, roleId);
      return;
    }

    const query = `
      UPDATE admin_users
      SET role_ids = array_remove(role_ids, $1),
          updated_at = NOW()
      WHERE id = $2
    `;

    await pool.query(query, [roleId, userId]);

    // Audit log
    await auditService.log({
      adminId,
      actionType: 'REMOVE_ROLE' as any,
      resourceType: AuditResourceType.ADMIN_USER,
      resourceId: userId,
      payload: { roleId },
    });
  } catch (error: any) {
    console.error('[RBAC SERVICE] Remove role failed:', error);
    throw error;
  }
};

/**
 * Get user's effective permissions (with inheritance)
 */
export const getUserPermissions = async (userId: string): Promise<string[]> => {
  try {
    if (!pool) {
      return getAvailablePermissions(); // Mock: return all for testing
    }

    // Get user's roles
    const userQuery = 'SELECT role_ids FROM admin_users WHERE id = $1';
    const userResult = await pool.query(userQuery, [userId]);
    const roleIds = userResult.rows[0]?.role_ids || [];

    // Get permissions for each role (with inheritance)
    const allPermissions = new Set<string>();
    
    for (const roleId of roleIds) {
      const perms = await getRoleWithInheritedPermissions(roleId);
      perms.forEach(p => allPermissions.add(p));
    }

    return Array.from(allPermissions);
  } catch (error: any) {
    console.error('[RBAC SERVICE] Get user permissions failed:', error);
    return [];
  }
};

/**
 * Check if user has permission
 */
export const userHasPermission = async (
  userId: string,
  permission: string
): Promise<boolean> => {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permission);
};

/**
 * Validate regional access
 */
export const userHasRegionalAccess = async (
  userId: string,
  region: string
): Promise<boolean> => {
  try {
    if (!pool) {
      return true; // Mock: allow all
    }

    const query = `
      SELECT regions FROM admin_users WHERE id = $1
    `;

    const result = await pool.query(query, [userId]);
    const regions = result.rows[0]?.regions || [];

    // Global access or specific region
    return regions.length === 0 || regions.includes(region) || regions.includes('*');
  } catch (error: any) {
    console.error('[RBAC SERVICE] Regional access check failed:', error);
    return false;
  }
};

export default {
  createRole,
  updateRole,
  deleteRole,
  listRoles,
  assignRoleToUser,
  removeRoleFromUser,
  getUserPermissions,
  userHasPermission,
  getRoleWithInheritedPermissions,
  userHasRegionalAccess,
  getAvailablePermissions,
};

