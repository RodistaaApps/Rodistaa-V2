/**
 * Bookings Repository
 * Database operations for bookings
 */

import { query } from '../../db/connection';
import logger from 'pino';
import { generateBookingId, Booking, BookingStatus } from '@rodistaa/app-shared';

const log = logger({ name: 'bookings-repository' });

export interface BookingCreateInput {
  shipperId: string;
  pickup: any;
  drop: any;
  goods: any;
  tonnage: number;
  expectedPrice?: number;
  priceRangeMin: number;
  priceRangeMax: number;
  autoFinalizeAt?: Date;
}

export interface BookingUpdateInput {
  status?: BookingStatus;
  finalizedBidId?: string;
  cancellationReason?: string;
}

/**
 * Create a new booking
 */
export async function createBooking(input: BookingCreateInput): Promise<Booking> {
  const bookingId = generateBookingId();

  try {
    await query(
      `INSERT INTO bookings (
        id, shipper_id, pickup, drop, goods, tonnage,
        expected_price, price_range_min, price_range_max,
        status, auto_finalize_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
      [
        bookingId,
        input.shipperId,
        JSON.stringify(input.pickup),
        JSON.stringify(input.drop),
        JSON.stringify(input.goods),
        input.tonnage,
        input.expectedPrice || null,
        input.priceRangeMin,
        input.priceRangeMax,
        'OPEN',
        input.autoFinalizeAt || null,
      ]
    );

    return getBookingById(bookingId);
  } catch (error: any) {
    log.error({ error, bookingId }, 'Failed to create booking');
    throw new Error('Failed to create booking');
  }
}

/**
 * Get booking by ID
 */
export async function getBookingById(bookingId: string): Promise<Booking | null> {
  try {
    const result = await query(
      `SELECT * FROM bookings WHERE id = $1 LIMIT 1`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapRowToBooking(result.rows[0]);
  } catch (error: any) {
    log.error({ error, bookingId }, 'Failed to get booking');
    throw error;
  }
}

/**
 * List bookings with filters
 */
export async function listBookings(filters: {
  shipperId?: string;
  status?: BookingStatus;
  page?: number;
  limit?: number;
}): Promise<{ data: Booking[]; total: number }> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  try {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.shipperId) {
      conditions.push(`shipper_id = $${paramIndex++}`);
      params.push(filters.shipperId);
    }

    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(filters.status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM bookings ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.total || '0', 10);

    // Get bookings
    params.push(limit, offset);
    const result = await query(
      `SELECT * FROM bookings 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      params
    );

    const bookings = result.rows.map(mapRowToBooking);

    return { data: bookings, total };
  } catch (error: any) {
    log.error({ error, filters }, 'Failed to list bookings');
    throw error;
  }
}

/**
 * Update booking
 */
export async function updateBooking(bookingId: string, input: BookingUpdateInput): Promise<Booking> {
  try {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(input.status);
    }

    if (input.finalizedBidId !== undefined) {
      updates.push(`finalized_bid_id = $${paramIndex++}`);
      params.push(input.finalizedBidId);
    }

    if (input.cancellationReason !== undefined) {
      updates.push(`cancellation_reason = $${paramIndex++}, cancelled_at = NOW()`);
      params.push(input.cancellationReason);
    }

    if (updates.length === 0) {
      return getBookingById(bookingId) as Promise<Booking>;
    }

    updates.push(`updated_at = NOW()`);
    params.push(bookingId);

    await query(
      `UPDATE bookings SET ${updates.join(', ')} WHERE id = $${paramIndex++}`,
      params
    );

    return getBookingById(bookingId) as Promise<Booking>;
  } catch (error: any) {
    log.error({ error, bookingId }, 'Failed to update booking');
    throw error;
  }
}

/**
 * Map database row to Booking object
 */
function mapRowToBooking(row: any): Booking {
  return {
    id: row.id,
    shipperId: row.shipper_id,
    pickup: typeof row.pickup === 'string' ? JSON.parse(row.pickup) : row.pickup,
    drop: typeof row.drop === 'string' ? JSON.parse(row.drop) : row.drop,
    goods: typeof row.goods === 'string' ? JSON.parse(row.goods) : row.goods,
    tonnage: parseFloat(row.tonnage),
    expectedPrice: row.expected_price ? parseFloat(row.expected_price) : undefined,
    priceRange: {
      min: parseFloat(row.price_range_min),
      max: parseFloat(row.price_range_max),
    },
    status: row.status as BookingStatus,
    finalizedBidId: row.finalized_bid_id,
    cancellationReason: row.cancellation_reason,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at?.toISOString(),
  };
}

import { generateBookingId, Booking, BookingStatus } from '@rodistaa/app-shared';

