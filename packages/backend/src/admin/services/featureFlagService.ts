/**
 * Feature Flag Service
 * 
 * Manages feature flags with:
 * - Region-based targeting
 * - Percentage rollout (gradual release)
 * - User-specific targeting
 * - Maintenance mode control
 * - Flag versioning
 * 
 * Usage:
 *   const enabled = await featureFlagService.isEnabled('new_bidding_ui', { region: 'South', userId: 'OP-123' });
 */

import { Pool } from 'pg';
import auditService from './auditService';

const pool: Pool | null = null; // TODO: Import actual DB connection

export interface FeatureFlag {
  id: string;
  flag_name: string;
  description: string;
  is_enabled: boolean;
  rollout_percentage: number; // 0-100
  target_regions: string[];
  target_users: string[];
  config: Record<string, any>;
  created_by: string;
  updated_at: string;
}

export interface CreateFlagRequest {
  flag_name: string;
  description: string;
  is_enabled?: boolean;
  rollout_percentage?: number;
  target_regions?: string[];
  target_users?: string[];
  config?: Record<string, any>;
}

/**
 * Create feature flag
 */
export const createFlag = async (
  flagData: CreateFlagRequest,
  adminId: string
): Promise<FeatureFlag> => {
  try {
    const flagId = `FLAG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (!pool) {
      const mockFlag: FeatureFlag = {
        id: flagId,
        flag_name: flagData.flag_name,
        description: flagData.description,
        is_enabled: flagData.is_enabled || false,
        rollout_percentage: flagData.rollout_percentage || 100,
        target_regions: flagData.target_regions || [],
        target_users: flagData.target_users || [],
        config: flagData.config || {},
        created_by: adminId,
        updated_at: new Date().toISOString(),
      };

      console.log('[FEATURE FLAG - STUB] Created:', mockFlag);
      return mockFlag;
    }

    const query = `
      INSERT INTO feature_flags (
        id, flag_name, description, is_enabled, rollout_percentage,
        target_regions, target_users, config, created_by, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `;

    const values = [
      flagId,
      flagData.flag_name,
      flagData.description,
      flagData.is_enabled || false,
      flagData.rollout_percentage || 100,
      flagData.target_regions || [],
      flagData.target_users || [],
      JSON.stringify(flagData.config || {}),
      adminId,
    ];

    const result = await pool.query(query, values);

    // Audit log
    await auditService.log({
      adminId,
      actionType: 'CREATE_FEATURE_FLAG' as any,
      resourceType: 'feature_flag' as any,
      resourceId: flagId,
      payload: { flag_name: flagData.flag_name },
    });

    return {
      ...result.rows[0],
      config: result.rows[0].config || {},
    };
  } catch (error: any) {
    console.error('[FEATURE FLAG] Create failed:', error);
    throw error;
  }
};

/**
 * Update feature flag
 */
export const updateFlag = async (
  flagId: string,
  updates: Partial<CreateFlagRequest>,
  adminId: string
): Promise<FeatureFlag> => {
  try {
    if (!pool) {
      console.log('[FEATURE FLAG - STUB] Update:', flagId, updates);
      throw new Error('Database not connected');
    }

    // Build update query
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }
    if (updates.is_enabled !== undefined) {
      setClauses.push(`is_enabled = $${paramIndex++}`);
      values.push(updates.is_enabled);
    }
    if (updates.rollout_percentage !== undefined) {
      setClauses.push(`rollout_percentage = $${paramIndex++}`);
      values.push(updates.rollout_percentage);
    }
    if (updates.target_regions !== undefined) {
      setClauses.push(`target_regions = $${paramIndex++}`);
      values.push(updates.target_regions);
    }
    if (updates.target_users !== undefined) {
      setClauses.push(`target_users = $${paramIndex++}`);
      values.push(updates.target_users);
    }
    if (updates.config !== undefined) {
      setClauses.push(`config = $${paramIndex++}`);
      values.push(JSON.stringify(updates.config));
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(flagId);

    const query = `
      UPDATE feature_flags
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    // Audit log
    await auditService.log({
      adminId,
      actionType: 'UPDATE_FEATURE_FLAG' as any,
      resourceType: 'feature_flag' as any,
      resourceId: flagId,
      payload: updates,
    });

    return {
      ...result.rows[0],
      config: result.rows[0].config || {},
    };
  } catch (error: any) {
    console.error('[FEATURE FLAG] Update failed:', error);
    throw error;
  }
};

/**
 * Check if feature is enabled for user/region
 */
export const isEnabled = async (
  flagName: string,
  context: {
    userId?: string;
    region?: string;
  }
): Promise<boolean> => {
  try {
    if (!pool) {
      // Mock: return true for all flags
      console.log('[FEATURE FLAG - STUB] Check:', flagName, context);
      return true;
    }

    const query = `
      SELECT * FROM feature_flags
      WHERE flag_name = $1
    `;

    const result = await pool.query(query, [flagName]);

    if (result.rows.length === 0) {
      // Flag doesn't exist, default to disabled
      return false;
    }

    const flag = result.rows[0];

    // Check if flag is globally enabled
    if (!flag.is_enabled) {
      return false;
    }

    // Check region targeting
    if (flag.target_regions.length > 0 && context.region) {
      if (!flag.target_regions.includes(context.region)) {
        return false;
      }
    }

    // Check user targeting
    if (flag.target_users.length > 0 && context.userId) {
      if (!flag.target_users.includes(context.userId)) {
        return false;
      }
    }

    // Check percentage rollout
    if (flag.rollout_percentage < 100) {
      // Use consistent hash for user
      if (context.userId) {
        const hash = hashString(context.userId);
        const bucket = hash % 100;
        return bucket < flag.rollout_percentage;
      }
      // Random rollout if no userId
      return Math.random() * 100 < flag.rollout_percentage;
    }

    return true;
  } catch (error: any) {
    console.error('[FEATURE FLAG] Is enabled check failed:', error);
    // Fail open or closed based on criticality
    return false;
  }
};

/**
 * Hash string to number (for consistent rollout)
 */
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * List all flags
 */
export const listFlags = async (): Promise<FeatureFlag[]> => {
  try {
    if (!pool) {
      return [
        {
          id: 'FLAG-001',
          flag_name: 'new_bidding_ui',
          description: 'New bidding interface with real-time updates',
          is_enabled: true,
          rollout_percentage: 50,
          target_regions: ['South'],
          target_users: [],
          config: {},
          created_by: 'ADM-001',
          updated_at: new Date().toISOString(),
        },
      ];
    }

    const query = 'SELECT * FROM feature_flags ORDER BY flag_name ASC';
    const result = await pool.query(query);
    
    return result.rows.map(row => ({
      ...row,
      config: row.config || {},
    }));
  } catch (error: any) {
    console.error('[FEATURE FLAG] List flags failed:', error);
    return [];
  }
};

/**
 * Enable/disable maintenance mode
 */
export const setMaintenanceMode = async (
  enabled: boolean,
  message: string,
  whitelistedAdmins: string[],
  adminId: string
): Promise<void> => {
  try {
    if (!pool) {
      console.log('[MAINTENANCE MODE - STUB]', { enabled, message, whitelistedAdmins });
      return;
    }

    if (enabled) {
      // Start maintenance
      const query = `
        INSERT INTO maintenance_mode (
          is_active, message, whitelisted_admins, started_by, started_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `;

      await pool.query(query, [true, message, whitelistedAdmins, adminId]);
    } else {
      // End maintenance
      await pool.query(
        `UPDATE maintenance_mode SET is_active = FALSE, ended_at = NOW() WHERE is_active = TRUE`
      );
    }

    // Audit log
    await auditService.log({
      adminId,
      actionType: enabled ? 'START_MAINTENANCE' as any : 'END_MAINTENANCE' as any,
      resourceType: 'system' as any,
      resourceId: 'maintenance_mode',
      payload: { enabled, message },
    });

    console.log(`[MAINTENANCE MODE] ${enabled ? 'Started' : 'Ended'}`);
  } catch (error: any) {
    console.error('[MAINTENANCE MODE] Failed:', error);
    throw error;
  }
};

export default {
  createFlag,
  updateFlag,
  isEnabled,
  listFlags,
  setMaintenanceMode,
};

