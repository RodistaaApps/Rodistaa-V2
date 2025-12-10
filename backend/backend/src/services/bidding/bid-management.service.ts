/**
 * Bid Management Service
 * Handles bid lifecycle: expiry, retraction, notifications
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { ulid } from 'ulid';
import { logger } from '../../utils/logger';

const log = logger.child({ module: 'bid-management' });

export interface BidRetraction {
  bidId: string;
  reason: string;
  penalty?: number;
  allowedWithinMinutes: number;
}

/**
 * Auto-expire old bids
 * Runs as scheduled job (every 5 minutes)
 */
export async function expireOldBids(): Promise<{ expired: number }> {
  try {
    // Expire bids older than 24 hours (configurable)
    const result = await query(
      `UPDATE bids
       SET status = 'EXPIRED', updated_at = NOW()
       WHERE status = 'PENDING'
       AND created_at < NOW() - INTERVAL '24 hours'
       RETURNING id`
    );

    const expiredCount = result.rowCount || 0;

    if (expiredCount > 0) {
      log.info({ expiredCount }, 'Bids auto-expired');
      
      // Send notifications to operators about expired bids
      for (const row of result.rows) {
        await sendBidExpiredNotification(row.id);
      }
    }

    return { expired: expiredCount };
  } catch (error) {
    log.error({ error }, 'Failed to expire old bids');
    throw new Error('Failed to expire bids');
  }
}

/**
 * Retract bid (operator cancels their bid)
 */
export async function retractBid(
  bidId: string,
  operatorId: string,
  reason: string
): Promise<{ success: boolean; penalty?: number; message: string }> {
  try {
    // Get bid details
    const bidResult = await query(
      `SELECT id, operator_id, bid_amount, created_at, status
       FROM bids
       WHERE id = $1`,
      [bidId]
    );

    if (bidResult.rows.length === 0) {
      return { success: false, message: 'Bid not found' };
    }

    const bid = bidResult.rows[0];

    if (bid.operator_id !== operatorId) {
      return { success: false, message: 'Unauthorized' };
    }

    if (bid.status !== 'PENDING') {
      return { success: false, message: `Cannot retract ${bid.status.toLowerCase()} bid` };
    }

    // Check retraction rules
    const minutesSinceBid = (Date.now() - new Date(bid.created_at).getTime()) / (1000 * 60);
    const freeRetractionWindow = 30; // 30 minutes free retraction

    let penalty = 0;

    if (minutesSinceBid > freeRetractionWindow) {
      // Apply penalty: 1% of bid amount after free window
      penalty = parseFloat(bid.bid_amount) * 0.01;
      
      // Deduct penalty from wallet (if applicable)
      // For MVP, just log it
      log.warn({ bidId, operatorId, penalty }, 'Bid retraction penalty applied');
    }

    // Retract the bid
    await query(
      `UPDATE bids
       SET 
         status = 'RETRACTED',
         retraction_reason = $1,
         retracted_at = NOW(),
         updated_at = NOW()
       WHERE id = $2`,
      [reason, bidId]
    );

    log.info({ bidId, operatorId, penalty, reason }, 'Bid retracted');

    return {
      success: true,
      penalty: penalty > 0 ? penalty : undefined,
      message: penalty > 0 
        ? `Bid retracted. Penalty: ₹${penalty} (retracted after ${freeRetractionWindow} min window)`
        : 'Bid retracted successfully',
    };
  } catch (error: any) {
    log.error({ error, bidId }, 'Failed to retract bid');
    return {
      success: false,
      message: 'Failed to retract bid',
    };
  }
}

/**
 * Send bid expiry notification
 */
async function sendBidExpiredNotification(bidId: string): Promise<void> {
  try {
    // In production, send push notification/SMS
    // For MVP, create in-app notification record
    await query(
      `INSERT INTO notifications (id, user_id, type, title, message, created_at)
       SELECT 
         $1,
         operator_id,
         'BID_EXPIRED',
         'Bid Expired',
         'Your bid for booking ' || booking_id || ' has expired',
         NOW()
       FROM bids
       WHERE id = $2`,
      [uuid(), bidId]
    );

    log.info({ bidId }, 'Bid expiry notification sent');
  } catch (error) {
    log.error({ error, bidId }, 'Failed to send expiry notification');
  }
}

/**
 * Send bid win notification
 */
export async function sendBidWinNotification(bidId: string): Promise<void> {
  try {
    const bidResult = await query(
      `SELECT operator_id, booking_id, bid_amount
       FROM bids
       WHERE id = $1`,
      [bidId]
    );

    if (bidResult.rows.length === 0) return;

    const bid = bidResult.rows[0];

    // Create notification
    await query(
      `INSERT INTO notifications (id, user_id, type, title, message, created_at)
       VALUES ($1, $2, 'BID_WON', 'Congratulations! You Won the Bid', 
               'Your bid of ₹' || $3 || ' for booking ' || $4 || ' was accepted. Start the trip to begin earning!', 
               NOW())`,
      [uuid(), bid.operator_id, bid.bid_amount, bid.booking_id]
    );

    log.info({ bidId, operatorId: bid.operator_id }, 'Bid win notification sent');
  } catch (error) {
    log.error({ error, bidId }, 'Failed to send win notification');
  }
}

/**
 * Send bid loss notification
 */
export async function sendBidLossNotification(bidId: string): Promise<void> {
  try {
    const bidResult = await query(
      `SELECT operator_id, booking_id
       FROM bids
       WHERE id = $1`,
      [bidId]
    );

    if (bidResult.rows.length === 0) return;

    const bid = bidResult.rows[0];

    await query(
      `INSERT INTO notifications (id, user_id, type, title, message, created_at)
       VALUES ($1, $2, 'BID_LOST', 'Bid Not Selected', 
               'Your bid for booking ' || $3 || ' was not selected. No fees charged - keep bidding!', 
               NOW())`,
      [uuid(), bid.operator_id, bid.booking_id]
    );

    log.info({ bidId, operatorId: bid.operator_id }, 'Bid loss notification sent');
  } catch (error) {
    log.error({ error, bidId }, 'Failed to send loss notification');
  }
}

/**
 * Get bid analytics for operator
 */
export async function getOperatorBidAnalytics(operatorId: string): Promise<{
  totalBids: number;
  pendingBids: number;
  wonBids: number;
  lostBids: number;
  retractedBids: number;
  winRate: number;
  avgBidAmount: number;
  avgWinAmount: number;
}> {
  try {
    const result = await query(
      `SELECT 
         COUNT(*) AS total_bids,
         COUNT(CASE WHEN status = 'PENDING' THEN 1 END) AS pending_bids,
         COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) AS won_bids,
         COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) AS lost_bids,
         COUNT(CASE WHEN status = 'RETRACTED' THEN 1 END) AS retracted_bids,
         AVG(bid_amount) AS avg_bid_amount,
         AVG(CASE WHEN status = 'ACCEPTED' THEN bid_amount END) AS avg_win_amount
       FROM bids
       WHERE operator_id = $1
       AND created_at >= NOW() - INTERVAL '6 months'`,
      [operatorId]
    );

    const stats = result.rows[0];
    const totalBids = parseInt(stats.total_bids);
    const wonBids = parseInt(stats.won_bids || '0');

    return {
      totalBids,
      pendingBids: parseInt(stats.pending_bids || '0'),
      wonBids,
      lostBids: parseInt(stats.lost_bids || '0'),
      retractedBids: parseInt(stats.retracted_bids || '0'),
      winRate: totalBids > 0 ? (wonBids / totalBids) * 100 : 0,
      avgBidAmount: parseFloat(stats.avg_bid_amount || '0'),
      avgWinAmount: parseFloat(stats.avg_win_amount || '0'),
    };
  } catch (error) {
    log.error({ error, operatorId }, 'Failed to get bid analytics');
    throw new Error('Failed to retrieve bid analytics');
  }
}

