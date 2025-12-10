/**
 * Feature Flag Service - Release Control & Rollout
 * Enables gradual rollout and A/B testing
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { logger } from '../../utils/logger';

const log = logger.child({ module: 'feature-flag-service' });

export interface FeatureFlagConfig {
  flagKey: string;
  label: string;
  description?: string;
  enabled?: boolean;
  enabledRegions?: string[];
  enabledForUsers?: string[];
  rolloutPercentage?: number;
  flagType?: 'BOOLEAN' | 'STRING' | 'NUMBER' | 'JSON';
  defaultValue?: string;
  createdBy: string;
}

/**
 * Create feature flag
 */
export async function createFeatureFlag(config: FeatureFlagConfig): Promise<string> {
  try {
    await query(
      `INSERT INTO feature_flags
       (id, flag_key, label, description, enabled, enabled_regions, enabled_for_users,
        rollout_percentage, flag_type, default_value, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
      [
        uuid(),
        config.flagKey,
        config.label,
        config.description || null,
        config.enabled || false,
        config.enabledRegions || [],
        config.enabledForUsers || [],
        config.rolloutPercentage || 0,
        config.flagType || 'BOOLEAN',
        config.defaultValue || null,
        config.createdBy,
      ]
    );

    // Log creation
    await query(
      `INSERT INTO feature_flag_history
       (id, flag_id, changed_by, change_type, new_value, created_at)
       VALUES ($1, (SELECT id FROM feature_flags WHERE flag_key = $2), $3, 'CREATED', $4, NOW())`,
      [uuid(), config.flagKey, config.createdBy, JSON.stringify(config)]
    );

    log.info({ flagKey: config.flagKey }, 'Feature flag created');

    return config.flagKey;
  } catch (error) {
    log.error({ error, config }, 'Failed to create feature flag');
    throw error;
  }
}

/**
 * Check if feature is enabled for user
 */
export async function isFeatureEnabled(
  flagKey: string,
  userId?: string,
  userRegion?: string
): Promise<boolean> {
  try {
    const result = await query(
      `SELECT * FROM feature_flags WHERE flag_key = $1 AND is_active = TRUE`,
      [flagKey]
    );

    if (result.rows.length === 0) {
      return false; // Flag doesn't exist = disabled
    }

    const flag = result.rows[0];

    // If globally disabled, return false
    if (!flag.enabled) {
      return false;
    }

    // Check user-specific targeting
    if (userId && flag.enabled_for_users && flag.enabled_for_users.includes(userId)) {
      return true;
    }

    // Check region targeting
    if (userRegion && flag.enabled_regions && flag.enabled_regions.length > 0) {
      if (!flag.enabled_regions.includes(userRegion)) {
        return false;
      }
    }

    // Check rollout percentage
    if (userId && flag.rollout_percentage > 0 && flag.rollout_percentage < 100) {
      const hash = crypto.createHash('md5').update(userId + flagKey).digest('hex');
      const hashInt = parseInt(hash.substring(0, 8), 16);
      const bucket = hashInt % 100;
      return bucket < flag.rollout_percentage;
    }

    return flag.enabled;
  } catch (error) {
    log.error({ error, flagKey }, 'Failed to check feature flag');
    return false; // Fail closed (safer)
  }
}

/**
 * Update feature flag
 */
export async function updateFeatureFlag(
  flagKey: string,
  updates: Partial<FeatureFlagConfig>,
  changedBy: string
): Promise<void> {
  try {
    // Get current value
    const currentResult = await query(
      `SELECT * FROM feature_flags WHERE flag_key = $1`,
      [flagKey]
    );

    if (currentResult.rows.length === 0) {
      throw new Error('Feature flag not found');
    }

    const currentFlag = currentResult.rows[0];

    // Update flag
    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updates.enabled !== undefined) {
      setClauses.push(`enabled = $${paramIndex++}`);
      params.push(updates.enabled);
    }

    if (updates.enabledRegions !== undefined) {
      setClauses.push(`enabled_regions = $${paramIndex++}`);
      params.push(updates.enabledRegions);
    }

    if (updates.rolloutPercentage !== undefined) {
      setClauses.push(`rollout_percentage = $${paramIndex++}`);
      params.push(updates.rolloutPercentage);
    }

    if (setClauses.length === 0) {
      return;
    }

    setClauses.push(`last_modified_by = $${paramIndex++}`);
    params.push(changedBy);
    setClauses.push(`updated_at = NOW()`);

    params.push(flagKey);

    await query(
      `UPDATE feature_flags SET ${setClauses.join(', ')} WHERE flag_key = $${paramIndex}`,
      params
    );

    // Log change
    const changeType = updates.enabled !== undefined
      ? (updates.enabled ? 'ENABLED' : 'DISABLED')
      : 'UPDATED';

    await query(
      `INSERT INTO feature_flag_history
       (id, flag_id, changed_by, change_type, old_value, new_value, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        uuid(),
        currentFlag.id,
        changedBy,
        changeType,
        JSON.stringify(currentFlag),
        JSON.stringify({ ...currentFlag, ...updates }),
      ]
    );

    log.info({ flagKey, changeType, changedBy }, 'Feature flag updated');
  } catch (error) {
    log.error({ error, flagKey }, 'Failed to update feature flag');
    throw error;
  }
}

/**
 * Get all feature flags
 */
export async function getAllFeatureFlags(): Promise<any[]> {
  const result = await query(
    `SELECT * FROM feature_flags WHERE is_active = TRUE ORDER BY label ASC`
  );

  return result.rows;
}

