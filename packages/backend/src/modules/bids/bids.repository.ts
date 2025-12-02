/**
 * Bids Repository
 * Database operations for bids
 */

import { query } from '../../db/connection';
import logger from 'pino';
import { generateBidId, Bid, BidStatus } from '@rodistaa/app-shared';

const log = logger({ name: 'bids-repository' });

export interface BidCreateInput {
  bookingId: string;
  operatorId: string;
  truckId: string;
  driverId?: string;
  amount: number;
  notes?: string;
}

export interface BidUpdateInput {
  amount?: number;
  notes?: string;
  status?: BidStatus;
}

/**
 * Create a new bid
 */
export async function createBid(input: BidCreateInput): Promise<Bid> {
  const bidId = generateBidId();

  try {
    await query(
      `INSERT INTO bids (
        id, booking_id, operator_id, truck_id, driver_id,
        amount, notes, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [
        bidId,
        input.bookingId,
        input.operatorId,
        input.truckId,
        input.driverId || null,
        input.amount,
        input.notes || null,
        'PENDING',
      ]
    );

    return getBidById(bidId) as Promise<Bid>;
  } catch (error: any) {
    log.error({ error, bidId }, 'Failed to create bid');
    throw new Error('Failed to create bid');
  }
}

/**
 * Get bid by ID
 */
export async function getBidById(bidId: string): Promise<Bid | null> {
  try {
    const result = await query(
      `SELECT * FROM bids WHERE id = $1 LIMIT 1`,
      [bidId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapRowToBid(result.rows[0]);
  } catch (error: any) {
    log.error({ error, bidId }, 'Failed to get bid');
    throw error;
  }
}

/**
 * List bids for a booking
 */
export async function listBidsByBooking(bookingId: string): Promise<Bid[]> {
  try {
    const result = await query(
      `SELECT * FROM bids 
       WHERE booking_id = $1 
       ORDER BY amount ASC, created_at ASC`,
      [bookingId]
    );

    return result.rows.map(mapRowToBid);
  } catch (error: any) {
    log.error({ error, bookingId }, 'Failed to list bids');
    throw error;
  }
}

/**
 * Update bid
 */
export async function updateBid(bidId: string, input: BidUpdateInput): Promise<Bid> {
  try {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (input.amount !== undefined) {
      updates.push(`amount = $${paramIndex++}`);
      params.push(input.amount);
    }

    if (input.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      params.push(input.notes);
    }

    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(input.status);
    }

    if (updates.length === 0) {
      return getBidById(bidId) as Promise<Bid>;
    }

    updates.push(`updated_at = NOW()`);
    params.push(bidId);

    await query(
      `UPDATE bids SET ${updates.join(', ')} WHERE id = $${paramIndex++}`,
      params
    );

    return getBidById(bidId) as Promise<Bid>;
  } catch (error: any) {
    log.error({ error, bidId }, 'Failed to update bid');
    throw error;
  }
}

/**
 * Get lowest valid bid for a booking
 */
export async function getLowestValidBid(bookingId: string): Promise<Bid | null> {
  try {
    const result = await query(
      `SELECT * FROM bids 
       WHERE booking_id = $1 AND status = 'PENDING'
       ORDER BY amount ASC, created_at ASC
       LIMIT 1`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapRowToBid(result.rows[0]);
  } catch (error: any) {
    log.error({ error, bookingId }, 'Failed to get lowest bid');
    throw error;
  }
}

/**
 * Get all valid bids for a booking
 */
export async function getValidBids(bookingId: string): Promise<Bid[]> {
  try {
    const result = await query(
      `SELECT * FROM bids 
       WHERE booking_id = $1 AND status = 'PENDING'
       ORDER BY amount ASC`,
      [bookingId]
    );

    return result.rows.map(mapRowToBid);
  } catch (error: any) {
    log.error({ error, bookingId }, 'Failed to get valid bids');
    throw error;
  }
}

/**
 * Map database row to Bid object
 */
function mapRowToBid(row: any): Bid {
  return {
    id: row.id,
    bookingId: row.booking_id,
    operatorId: row.operator_id,
    amount: parseFloat(row.amount),
    status: row.status as BidStatus,
    biddingFee: parseFloat(row.bidding_fee || '0'),
    ledgerDeducted: row.ledger_deducted || false,
    ledgerTransactionId: row.ledger_transaction_id,
    modificationsCount: parseInt(row.modifications_count || '0'),
    modifiedAt: row.modified_at ? new Date(row.modified_at) : undefined,
    acceptedAt: row.accepted_at ? new Date(row.accepted_at) : undefined,
    rejectedAt: row.rejected_at ? new Date(row.rejected_at) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

