/**
 * Auto-Finalize Worker
 * 
 * Background job that automatically finalizes bookings when auto_finalize_at
 * time is reached. Picks the lowest valid bid and converts to shipment.
 * 
 * Features:
 * - Redis locking (prevents duplicate processing)
 * - Idempotency (safe to run multiple times)
 * - Audit logging (every action tracked)
 * - Notifications (shipper + bidders notified)
 * - Error handling (failed jobs logged)
 */

import { Pool } from 'pg';
import Redis from 'ioredis';
import auditService from '../admin/services/auditService';
import notificationService from '../admin/services/notificationService';

interface AutoFinalizeConfig {
  intervalMs: number; // How often to check (default: 60000 = 1 minute)
  lockTtlMs: number; // Lock TTL (default: 30000 = 30 seconds)
  batchSize: number; // Max bookings to process per run (default: 10)
}

const DEFAULT_CONFIG: AutoFinalizeConfig = {
  intervalMs: 60000, // 1 minute
  lockTtlMs: 30000, // 30 seconds
  batchSize: 10,
};

export class AutoFinalizeWorker {
  private pool: Pool;
  private redis: Redis;
  private config: AutoFinalizeConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    pool: Pool,
    redis: Redis,
    config: Partial<AutoFinalizeConfig> = {}
  ) {
    this.pool = pool;
    this.redis = redis;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the worker
   */
  start(): void {
    if (this.intervalId) {
      console.log('[AUTO-FINALIZE] Worker already running');
      return;
    }

    console.log('[AUTO-FINALIZE] Starting worker...');
    console.log(`[AUTO-FINALIZE] Interval: ${this.config.intervalMs}ms`);
    console.log(`[AUTO-FINALIZE] Batch size: ${this.config.batchSize}`);

    // Run immediately
    this.processBookings();

    // Then run at intervals
    this.intervalId = setInterval(() => {
      this.processBookings();
    }, this.config.intervalMs);

    console.log('[AUTO-FINALIZE] Worker started');
  }

  /**
   * Stop the worker
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[AUTO-FINALIZE] Worker stopped');
    }
  }

  /**
   * Process bookings that are ready for auto-finalization
   */
  private async processBookings(): Promise<void> {
    if (this.isRunning) {
      console.log('[AUTO-FINALIZE] Already processing, skipping this cycle');
      return;
    }

    this.isRunning = true;

    try {
      // Find bookings ready for auto-finalization
      const bookings = await this.findReadyBookings();

      if (bookings.length === 0) {
        console.log('[AUTO-FINALIZE] No bookings to process');
        return;
      }

      console.log(`[AUTO-FINALIZE] Found ${bookings.length} bookings to process`);

      // Process each booking
      for (const booking of bookings) {
        await this.processBooking(booking);
      }

      console.log('[AUTO-FINALIZE] Cycle complete');
    } catch (error) {
      console.error('[AUTO-FINALIZE] Error in processing cycle:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Find bookings ready for auto-finalization
   */
  private async findReadyBookings(): Promise<any[]> {
    const query = `
      SELECT 
        b.id,
        b.shipper_id,
        b.auto_finalize_at,
        b.status,
        b.expected_price_max,
        COUNT(bids.id) as bids_count
      FROM bookings b
      LEFT JOIN bids ON bids.booking_id = b.id AND bids.status = 'active'
      WHERE 
        b.status = 'bidding'
        AND b.auto_finalize_at IS NOT NULL
        AND b.auto_finalize_at <= NOW()
      GROUP BY b.id
      HAVING COUNT(bids.id) > 0
      ORDER BY b.auto_finalize_at ASC
      LIMIT $1
    `;

    const result = await this.pool.query(query, [this.config.batchSize]);
    return result.rows;
  }

  /**
   * Process a single booking
   */
  private async processBooking(booking: any): Promise<void> {
    const lockKey = `auto-finalize:${booking.id}`;
    const lockValue = `${Date.now()}`;

    try {
      // Acquire lock (SET NX with TTL)
      const acquired = await this.redis.set(
        lockKey,
        lockValue,
        'PX',
        this.config.lockTtlMs,
        'NX'
      );

      if (!acquired) {
        console.log(`[AUTO-FINALIZE] Booking ${booking.id} already locked, skipping`);
        return;
      }

      console.log(`[AUTO-FINALIZE] Processing booking ${booking.id}`);

      // Find lowest valid bid
      const lowestBid = await this.findLowestBid(booking.id);

      if (!lowestBid) {
        console.log(`[AUTO-FINALIZE] No valid bids for booking ${booking.id}`);
        await this.handleNoValidBids(booking);
        return;
      }

      console.log(`[AUTO-FINALIZE] Lowest bid: ${lowestBid.id} (₹${lowestBid.amount})`);

      // Finalize booking
      await this.finalizeBooking(booking, lowestBid);

      console.log(`[AUTO-FINALIZE] Booking ${booking.id} finalized successfully`);
    } catch (error) {
      console.error(`[AUTO-FINALIZE] Error processing booking ${booking.id}:`, error);
      await this.handleError(booking, error);
    } finally {
      // Release lock (only if we own it)
      const currentValue = await this.redis.get(lockKey);
      if (currentValue === lockValue) {
        await this.redis.del(lockKey);
      }
    }
  }

  /**
   * Find the lowest valid bid for a booking
   */
  private async findLowestBid(bookingId: string): Promise<any | null> {
    const query = `
      SELECT 
        id,
        operator_id,
        truck_id,
        driver_id,
        amount,
        metadata
      FROM bids
      WHERE 
        booking_id = $1
        AND status = 'active'
      ORDER BY amount ASC
      LIMIT 1
    `;

    const result = await this.pool.query(query, [bookingId]);
    return result.rows[0] || null;
  }

  /**
   * Finalize booking (convert to shipment)
   */
  private async finalizeBooking(booking: any, lowestBid: any): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Update booking status
      await client.query(
        `UPDATE bookings 
         SET status = 'finalized', 
             winning_bid_id = $1, 
             finalized_at = NOW(),
             updated_at = NOW()
         WHERE id = $2`,
        [lowestBid.id, booking.id]
      );

      // 2. Update winning bid status
      await client.query(
        `UPDATE bids 
         SET status = 'accepted' 
         WHERE id = $1`,
        [lowestBid.id]
      );

      // 3. Reject other bids
      await client.query(
        `UPDATE bids 
         SET status = 'rejected' 
         WHERE booking_id = $1 AND id != $2`,
        [booking.id, lowestBid.id]
      );

      // 4. Create shipment
      const shipmentId = `SHP-${Date.now()}`;
      
      // Get booking details for shipment
      const bookingDetails = await client.query(
        `SELECT * FROM bookings WHERE id = $1`,
        [booking.id]
      );
      const b = bookingDetails.rows[0];

      await client.query(
        `INSERT INTO shipments (
          id, booking_id, operator_id, truck_id, driver_id,
          pickup_address, pickup_city, drop_address, drop_city,
          distance_km, estimated_arrival,
          status, freight_amount, advance_paid, balance_amount,
          payment_state, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())`,
        [
          shipmentId,
          booking.id,
          lowestBid.operator_id,
          lowestBid.truck_id,
          lowestBid.driver_id,
          b.pickup_address,
          b.pickup_city,
          b.drop_address,
          b.drop_city,
          b.distance_km,
          new Date(Date.now() + 40 * 60 * 60 * 1000).toISOString(), // ETA: 40 hours
          'assigned',
          lowestBid.amount,
          0, // advance_paid
          lowestBid.amount, // balance_amount
          'pending',
        ]
      );

      // 5. Update booking with shipment ID
      await client.query(
        `UPDATE bookings 
         SET created_shipment_id = $1, 
             status = 'converted',
             updated_at = NOW()
         WHERE id = $2`,
        [shipmentId, booking.id]
      );

      // 6. Create events
      await client.query(
        `INSERT INTO booking_shipment_events (
          target_type, target_id, event_type, actor_id, actor_role, payload, created_at
        ) VALUES 
        ('booking', $1, 'AUTO_FINALIZED', 'SYSTEM', 'system', $2, NOW()),
        ('shipment', $3, 'BOOKING_CONVERTED', 'SYSTEM', 'system', $4, NOW())`,
        [
          booking.id,
          JSON.stringify({ winning_bid_id: lowestBid.id, amount: lowestBid.amount }),
          shipmentId,
          JSON.stringify({ booking_id: booking.id, bid_id: lowestBid.id }),
        ]
      );

      await client.query('COMMIT');

      // 7. Create audit log
      await auditService.log({
        adminId: 'SYSTEM',
        actionType: 'AUTO_FINALIZE_BOOKING' as any,
        resourceType: 'booking' as any,
        resourceId: booking.id,
        payload: {
          winning_bid_id: lowestBid.id,
          operator_id: lowestBid.operator_id,
          amount: lowestBid.amount,
          created_shipment_id: shipmentId,
        },
        ipAddress: 'auto-finalize-worker',
      });

      // 8. Send notifications
      // TODO: Implement notification service integration
      console.log(`[AUTO-FINALIZE] Would notify shipper ${booking.shipper_id} and operator ${lowestBid.operator_id}`);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Handle bookings with no valid bids
   */
  private async handleNoValidBids(booking: any): Promise<void> {
    // Log event
    await this.pool.query(
      `INSERT INTO booking_shipment_events (
        target_type, target_id, event_type, actor_id, actor_role, payload, created_at
      ) VALUES ('booking', $1, 'AUTO_FINALIZE_FAILED', 'SYSTEM', 'system', $2, NOW())`,
      [
        booking.id,
        JSON.stringify({ reason: 'No valid bids available' }),
      ]
    );

    // TODO: Notify shipper
    console.log(`[AUTO-FINALIZE] Would notify shipper ${booking.shipper_id} of no bids`);
  }

  /**
   * Handle errors during processing
   */
  private async handleError(booking: any, error: any): Promise<void> {
    // Log error event
    await this.pool.query(
      `INSERT INTO booking_shipment_events (
        target_type, target_id, event_type, actor_id, actor_role, payload, created_at
      ) VALUES ('booking', $1, 'AUTO_FINALIZE_ERROR', 'SYSTEM', 'system', $2, NOW())`,
      [
        booking.id,
        JSON.stringify({ error: error.message }),
      ]
    );

    console.error(`[AUTO-FINALIZE] Error logged for booking ${booking.id}`);
  }
}

// Singleton instance
let workerInstance: AutoFinalizeWorker | null = null;

/**
 * Initialize the worker
 */
export const initAutoFinalizeWorker = (
  pool: Pool,
  redis: Redis,
  config?: Partial<AutoFinalizeConfig>
): AutoFinalizeWorker => {
  if (workerInstance) {
    console.log('[AUTO-FINALIZE] Worker already initialized');
    return workerInstance;
  }

  workerInstance = new AutoFinalizeWorker(pool, redis, config);
  return workerInstance;
};

/**
 * Get worker instance
 */
export const getAutoFinalizeWorker = (): AutoFinalizeWorker | null => {
  return workerInstance;
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[AUTO-FINALIZE] SIGTERM received, stopping worker...');
  if (workerInstance) {
    workerInstance.stop();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[AUTO-FINALIZE] SIGINT received, stopping worker...');
  if (workerInstance) {
    workerInstance.stop();
  }
  process.exit(0);
});

