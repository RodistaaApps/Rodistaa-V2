/**
 * Availability Service
 * Manage driver availability (sick leave, vacation, etc.)
 */

import { query, PoolClient } from '../db';
import { DriverAvailability } from '../models/driver';

/**
 * Check driver availability
 */
export async function checkDriverAvailability(
  driverId: string,
  startAt: Date,
  endAt: Date
): Promise<{ available: boolean; reason?: string }> {
  // Check for blocking availability records
  const blocks = await query<DriverAvailability>(
    `SELECT * FROM driver_availability
     WHERE driver_id = $1
       AND status = 'BLOCKED'
       AND (
         (start_at <= $2 AND end_at >= $2)
         OR (start_at <= $3 AND end_at >= $3)
         OR (start_at >= $2 AND end_at <= $3)
       )`,
    [driverId, startAt, endAt]
  );

  if (blocks.rows.length > 0) {
    return {
      available: false,
      reason: blocks.rows[0].reason || 'Driver unavailable',
    };
  }

  return { available: true };
}

/**
 * Create availability block
 */
export async function createAvailabilityBlock(
  driverId: string,
  startAt: Date,
  endAt: Date,
  reason: string,
  createdBy: string,
  notes?: string
): Promise<DriverAvailability> {
  // Validate dates
  if (startAt >= endAt) {
    throw new Error('Start date must be before end date');
  }

  const result = await query<DriverAvailability>(
    `INSERT INTO driver_availability
     (driver_id, start_at, end_at, reason, status, created_by, notes)
     VALUES ($1, $2, $3, $4, 'BLOCKED', $5, $6)
     RETURNING *`,
    [driverId, startAt, endAt, reason, createdBy, notes || null]
  );

  return result.rows[0];
}

/**
 * Get driver availability blocks
 */
export async function getDriverAvailability(
  driverId: string,
  startDate?: Date,
  endDate?: Date
): Promise<DriverAvailability[]> {
  let sql = `SELECT * FROM driver_availability WHERE driver_id = $1`;
  const params: any[] = [driverId];

  if (startDate && endDate) {
    sql += ` AND (
      (start_at <= $2 AND end_at >= $2)
      OR (start_at <= $3 AND end_at >= $3)
      OR (start_at >= $2 AND end_at <= $3)
    )`;
    params.push(startDate, endDate);
  }

  sql += ` ORDER BY start_at DESC`;

  const result = await query<DriverAvailability>(sql, params);
  return result.rows;
}

/**
 * Remove availability block
 */
export async function removeAvailabilityBlock(blockId: string): Promise<void> {
  await query(
    `DELETE FROM driver_availability WHERE id = $1`,
    [blockId]
  );
}

