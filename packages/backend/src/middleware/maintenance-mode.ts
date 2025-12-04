/**
 * Maintenance Mode Middleware
 * Blocks non-admin traffic during maintenance
 */

import { Request, Response, NextFunction } from 'express';
import { getSetting } from '../services/admin/settings.service';

const WHITELISTED_IPS = ['127.0.0.1', '::1', 'localhost'];

export async function maintenanceMode(req: Request, res: Response, next: NextFunction) {
  try {
    // Check if maintenance mode is enabled
    const isMaintenanceMode = await getSetting('MAINTENANCE_MODE_ENABLED');

    if (!isMaintenanceMode) {
      return next();
    }

    // Check if user is admin
    const user = (req as any).user;
    if (user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')) {
      return next();
    }

    // Check if IP is whitelisted
    const clientIp = req.ip || req.socket.remoteAddress || '';
    if (WHITELISTED_IPS.includes(clientIp)) {
      return next();
    }

    // Return maintenance page
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Platform is currently under maintenance. Please try again later.',
      estimatedEndTime: await getSetting('MAINTENANCE_ESTIMATED_END'),
    });
  } catch (error) {
    // If settings check fails, allow traffic (fail open for availability)
    next();
  }
}

/**
 * Toggle maintenance mode
 */
export async function toggleMaintenanceMode(
  enabled: boolean,
  adminId: string,
  estimatedEndTime?: string,
  reason?: string
): Promise<void> {
  const { updateSetting } = require('../services/admin/settings.service');
  
  await updateSetting('MAINTENANCE_MODE_ENABLED', enabled.toString(), adminId, reason);
  
  if (estimatedEndTime) {
    await updateSetting('MAINTENANCE_ESTIMATED_END', estimatedEndTime, adminId, reason);
  }
}

