/**
 * Admin Settings Service - Platform Configuration
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { logger } from '../../utils/logger';
import { createAuditLog } from './audit.service';

const log = logger.child({ module: 'settings-service' });

export interface SettingConfig {
  key: string;
  value: string;
  valueType?: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  label: string;
  description?: string;
  category: string;
  validationRules?: Record<string, any>;
  requires2FA?: boolean;
  requiresReason?: boolean;
}

/**
 * Get all settings
 */
export async function getAllSettings(category?: string): Promise<any[]> {
  try {
    let queryStr = 'SELECT * FROM admin_settings WHERE 1=1';
    const params: any[] = [];

    if (category) {
      queryStr += ' AND category = $1';
      params.push(category);
    }

    queryStr += ' ORDER BY category, label';

    const result = await query(queryStr, params);
    return result.rows;
  } catch (error) {
    log.error({ error }, 'Failed to get settings');
    throw error;
  }
}

/**
 * Get setting value
 */
export async function getSetting(key: string): Promise<any> {
  const result = await query(
    'SELECT * FROM admin_settings WHERE setting_key = $1',
    [key]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const setting = result.rows[0];
  
  // Parse value based on type
  switch (setting.value_type) {
    case 'NUMBER':
      return parseFloat(setting.setting_value);
    case 'BOOLEAN':
      return setting.setting_value === 'true';
    case 'JSON':
      return JSON.parse(setting.setting_value);
    default:
      return setting.setting_value;
  }
}

/**
 * Update setting
 */
export async function updateSetting(
  key: string,
  newValue: string,
  updatedBy: string,
  reason?: string
): Promise<void> {
  try {
    // Get current value
    const currentResult = await query(
      'SELECT * FROM admin_settings WHERE setting_key = $1',
      [key]
    );

    if (currentResult.rows.length === 0) {
      throw new Error('Setting not found');
    }

    const currentSetting = currentResult.rows[0];
    const oldValue = currentSetting.setting_value;

    // Update setting
    await query(
      `UPDATE admin_settings 
       SET setting_value = $1, last_modified_by = $2, last_modified_at = NOW()
       WHERE setting_key = $3`,
      [newValue, updatedBy, key]
    );

    // Save history
    await query(
      `INSERT INTO admin_settings_history
       (id, setting_id, changed_by, old_value, new_value, reason, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [uuid(), currentSetting.id, updatedBy, oldValue, newValue, reason || null]
    );

    // Audit log
    await createAuditLog({
      actorId: updatedBy,
      actorRole: 'ADMIN',
      action: 'EDIT_SETTINGS',
      resourceType: 'SETTINGS',
      resourceId: key,
      delta: { before: oldValue, after: newValue },
      reason,
    });

    log.info({ key, updatedBy }, 'Setting updated');
  } catch (error) {
    log.error({ error, key }, 'Failed to update setting');
    throw error;
  }
}

/**
 * Create setting
 */
export async function createSetting(config: SettingConfig, createdBy: string): Promise<void> {
  await query(
    `INSERT INTO admin_settings
     (id, setting_key, setting_value, value_type, label, description, category,
      validation_rules, requires_2fa, requires_reason, last_modified_by, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
    [
      uuid(),
      config.key,
      config.value,
      config.valueType || 'STRING',
      config.label,
      config.description || null,
      config.category,
      config.validationRules ? JSON.stringify(config.validationRules) : null,
      config.requires2FA || false,
      config.requiresReason || false,
      createdBy,
    ]
  );

  log.info({ key: config.key, createdBy }, 'Setting created');
}

