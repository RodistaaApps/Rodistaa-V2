/**
 * Franchise Service
 * Business logic for franchise operations
 */

import { query } from '../../db/connection';

/**
 * Get franchise dashboard
 */
export async function getDashboard(franchiseId: string, franchiseType: string): Promise<any> {
  // Get franchise info
  const franchiseResult = await query(
    `SELECT * FROM franchises WHERE id = $1`,
    [franchiseId]
  );

  if (franchiseResult.rows.length === 0) {
    throw new Error('Franchise not found');
  }

  const franchise = franchiseResult.rows[0];

  // Get performance metrics based on franchise type
  if (franchiseType === 'UNIT') {
    // Unit franchise sees own metrics
    const [bookingsResult, shipmentsResult] = await Promise.all([
      query(`SELECT COUNT(*) as total FROM bookings WHERE franchise_id = $1`, [franchiseId]),
      query(`SELECT COUNT(*) as total FROM shipments WHERE franchise_id = $1`, [franchiseId]),
    ]);

    return {
      franchise,
      metrics: {
        bookings: parseInt(bookingsResult.rows[0].total) || 0,
        shipments: parseInt(shipmentsResult.rows[0].total) || 0,
      },
    };
  } else {
    // District/HQ sees aggregated metrics for child franchises
    const [unitsResult, bookingsResult] = await Promise.all([
      query(`SELECT COUNT(*) as total FROM franchises WHERE parent_id = $1`, [franchiseId]),
      query(`SELECT COUNT(*) as total FROM bookings WHERE franchise_id IN (SELECT id FROM franchises WHERE parent_id = $1)`, [franchiseId]),
    ]);

    return {
      franchise,
      metrics: {
        units: parseInt(unitsResult.rows[0].total) || 0,
        bookings: parseInt(bookingsResult.rows[0].total) || 0,
      },
    };
  }
}

/**
 * Get/set franchise targets
 */
export async function getTargets(franchiseId: string): Promise<any> {
  const result = await query(
    `SELECT targets FROM franchises WHERE id = $1`,
    [franchiseId]
  );

  if (result.rows.length === 0) {
    throw new Error('Franchise not found');
  }

  return {
    franchiseId,
    targets: result.rows[0].targets || {},
  };
}

/**
 * Set targets for franchise
 */
export async function setTargets(
  franchiseId: string,
  targets: any,
  setByFranchiseId: string
): Promise<void> {
  // Verify setter has permission (district can set for units, HQ for all)
  const setterResult = await query(
    `SELECT type, parent_id FROM franchises WHERE id = $1`,
    [setByFranchiseId]
  );

  if (setterResult.rows.length === 0) {
    throw new Error('Franchise not found');
  }

  const setter = setterResult.rows[0];
  const targetFranchiseResult = await query(
    `SELECT * FROM franchises WHERE id = $1`,
    [franchiseId]
  );

  if (targetFranchiseResult.rows.length === 0) {
    throw new Error('Target franchise not found');
  }

  // Verify permissions
  if (setter.type !== 'HQ' && setter.type !== 'DISTRICT') {
    throw new Error('Only district or HQ franchises can set targets');
  }

  if (setter.type === 'DISTRICT' && targetFranchiseResult.rows[0].parent_id !== setByFranchiseId) {
    throw new Error('District can only set targets for its own units');
  }

  await query(
    `UPDATE franchises SET targets = $1, updated_at = NOW() WHERE id = $2`,
    [JSON.stringify(targets), franchiseId]
  );
}

/**
 * Get franchise reports
 */
export async function getReports(
  franchiseId: string,
  filters: { startDate?: string; endDate?: string }
): Promise<any> {
  let bookingsQuery = `
    SELECT 
      COUNT(*) as total_bookings,
      SUM(amount) as total_revenue
    FROM bookings
    WHERE franchise_id = $1
  `;
  const params: any[] = [franchiseId];
  let paramIndex = 2;

  if (filters.startDate) {
    bookingsQuery += ` AND created_at >= $${paramIndex++}`;
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    bookingsQuery += ` AND created_at <= $${paramIndex++}`;
    params.push(filters.endDate);
  }

  const result = await query(bookingsQuery, params);

  return {
    franchiseId,
    period: {
      start: filters.startDate,
      end: filters.endDate,
    },
    metrics: {
      totalBookings: parseInt(result.rows[0].total_bookings) || 0,
      totalRevenue: parseFloat(result.rows[0].total_revenue) || 0,
    },
  };
}

