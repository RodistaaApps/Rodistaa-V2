/**
 * Win-Based Fee Service
 * Core business logic: Charge fee ONLY when operator wins bid and starts trip
 * No fee on lost bids - this is Rodistaa's key differentiator
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { ulid } from 'ulid';
import { logger } from '../../utils/logger';
import * as walletService from './wallet.service';
import * as upiAutopayService from './upi-autopay.service';

const log = logger.child({ module: 'win-fee-service' });

export interface FeeConfiguration {
  feePercentage: number;
  feeFixed?: number;
  minimumFee?: number;
  maximumFee?: number;
  chargeOn: 'BID_WIN' | 'TRIP_START' | 'TRIP_COMPLETE' | 'POD_UPLOAD';
}

export interface WinFeeCharge {
  chargeId: string;
  operatorId: string;
  bookingId: string;
  bidId: string;
  shipmentId?: string;
  bidAmount: number;
  feePercentage: number;
  feeAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  triggerEvent: string;
}

/**
 * Calculate fee amount based on bid and configuration
 */
export function calculateFee(bidAmount: number, config: FeeConfiguration): number {
  let fee = 0;

  // Calculate percentage-based fee
  if (config.feePercentage > 0) {
    fee = (bidAmount * config.feePercentage) / 100;
  }

  // Add fixed fee if configured
  if (config.feeFixed) {
    fee += config.feeFixed;
  }

  // Apply minimum fee
  if (config.minimumFee && fee < config.minimumFee) {
    fee = config.minimumFee;
  }

  // Apply maximum fee cap
  if (config.maximumFee && fee > config.maximumFee) {
    fee = config.maximumFee;
  }

  return Math.round(fee * 100) / 100; // Round to 2 decimal places
}

/**
 * Get fee configuration for operator/booking
 * Checks hierarchy: Operator-specific > District > Region > Global
 */
async function getFeeConfiguration(
  operatorId: string,
  districtId?: string,
  regionId?: string
): Promise<FeeConfiguration> {
  try {
    // Try operator-specific config first
    let result = await query(
      `SELECT fee_percentage, fee_fixed, minimum_fee, maximum_fee, charge_on
       FROM fee_configurations
       WHERE scope = 'OPERATOR' AND scope_id = $1 AND is_active = TRUE
       AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
       ORDER BY created_at DESC
       LIMIT 1`,
      [operatorId]
    );

    // Try district config
    if (result.rows.length === 0 && districtId) {
      result = await query(
        `SELECT fee_percentage, fee_fixed, minimum_fee, maximum_fee, charge_on
         FROM fee_configurations
         WHERE scope = 'DISTRICT' AND scope_id = $1 AND is_active = TRUE
         AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
         ORDER BY created_at DESC
         LIMIT 1`,
        [districtId]
      );
    }

    // Try region config
    if (result.rows.length === 0 && regionId) {
      result = await query(
        `SELECT fee_percentage, fee_fixed, minimum_fee, maximum_fee, charge_on
         FROM fee_configurations
         WHERE scope = 'REGION' AND scope_id = $1 AND is_active = TRUE
         AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
         ORDER BY created_at DESC
         LIMIT 1`,
        [regionId]
      );
    }

    // Fall back to global config
    if (result.rows.length === 0) {
      result = await query(
        `SELECT fee_percentage, fee_fixed, minimum_fee, maximum_fee, charge_on
         FROM fee_configurations
         WHERE scope = 'GLOBAL' AND is_active = TRUE
         AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
         ORDER BY created_at DESC
         LIMIT 1`
      );
    }

    if (result.rows.length === 0) {
      // Default configuration
      log.warn({ operatorId }, 'No fee configuration found, using default');
      return {
        feePercentage: 5.0, // Default 5%
        minimumFee: 100, // Minimum ₹100
        chargeOn: 'TRIP_START',
      };
    }

    const config = result.rows[0];
    return {
      feePercentage: parseFloat(config.fee_percentage || 0),
      feeFixed: config.fee_fixed ? parseFloat(config.fee_fixed) : undefined,
      minimumFee: config.minimum_fee ? parseFloat(config.minimum_fee) : undefined,
      maximumFee: config.maximum_fee ? parseFloat(config.maximum_fee) : undefined,
      chargeOn: config.charge_on || 'TRIP_START',
    };
  } catch (error) {
    log.error({ error, operatorId }, 'Failed to get fee configuration');
    // Return default on error
    return {
      feePercentage: 5.0,
      minimumFee: 100,
      chargeOn: 'TRIP_START',
    };
  }
}

/**
 * Create win fee charge (when operator wins bid)
 * This creates the charge record but doesn't collect payment yet
 */
export async function createWinFeeCharge(
  operatorId: string,
  bookingId: string,
  bidId: string,
  bidAmount: number,
  districtId?: string,
  regionId?: string
): Promise<WinFeeCharge> {
  try {
    const config = await getFeeConfiguration(operatorId, districtId, regionId);
    const feeAmount = calculateFee(bidAmount, config);
    const chargeId = `FEE-${ulid()}`;

    await query(
      `INSERT INTO win_fee_charges
       (id, charge_id, operator_id, booking_id, bid_id, bid_amount, fee_percentage, fee_amount,
        trigger_event, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'BID_WIN', 'PENDING')`,
      [uuid(), chargeId, operatorId, bookingId, bidId, bidAmount, config.feePercentage, feeAmount]
    );

    log.info({ operatorId, bookingId, bidAmount, feeAmount, chargeId }, 'Win fee charge created');

    return {
      chargeId,
      operatorId,
      bookingId,
      bidId: bidId,
      bidAmount,
      feePercentage: config.feePercentage,
      feeAmount,
      paymentMethod: 'PENDING',
      paymentStatus: 'PENDING',
      triggerEvent: 'BID_WIN',
    };
  } catch (error) {
    log.error({ error, operatorId, bookingId, bidAmount }, 'Failed to create win fee charge');
    throw new Error('Failed to create fee charge');
  }
}

/**
 * Collect win fee when trip starts
 * This is the key business logic: fee collected ONLY on trip start, not on bid win
 */
export async function collectWinFee(
  chargeId: string,
  shipmentId: string
): Promise<{ success: boolean; transactionId?: string; message: string }> {
  try {
    // Get charge details
    const chargeResult = await query(
      `SELECT operator_id, fee_amount, payment_status, charge_id
       FROM win_fee_charges
       WHERE charge_id = $1`,
      [chargeId]
    );

    if (chargeResult.rows.length === 0) {
      return { success: false, message: 'Fee charge not found' };
    }

    const charge = chargeResult.rows[0];

    if (charge.payment_status === 'SUCCESS') {
      return { success: true, message: 'Fee already collected' };
    }

    const operatorId = charge.operator_id;
    const feeAmount = parseFloat(charge.fee_amount);

    // Strategy 1: Try UPI Autopay first
    const mandates = await upiAutopayService.getOperatorMandates(operatorId);
    const activeMandate = mandates.find(m => m.status === 'ACTIVE' && m.maxAmount >= feeAmount);

    if (activeMandate) {
      log.info({ chargeId, operatorId, method: 'UPI_AUTOPAY' }, 'Attempting autopay charge');
      
      const autopayResult = await upiAutopayService.chargeMandate({
        mandateId: activeMandate.mandateId,
        amount: feeAmount,
        description: `Win fee for shipment ${shipmentId}`,
        referenceId: shipmentId,
      });

      if (autopayResult.success) {
        // Record successful payment
        await recordSuccessfulPayment(
          chargeId,
          shipmentId,
          'UPI_AUTOPAY',
          autopayResult.transactionId!,
          autopayResult.gatewayTransactionId
        );

        return {
          success: true,
          transactionId: autopayResult.transactionId,
          message: 'Fee collected via UPI Autopay',
        };
      }

      log.warn({ chargeId, autopayResult }, 'UPI Autopay failed, trying wallet');
    }

    // Strategy 2: Try wallet deduction
    const hasBalance = await walletService.hasSufficientBalance(operatorId, feeAmount);

    if (hasBalance) {
      log.info({ chargeId, operatorId, method: 'WALLET' }, 'Attempting wallet deduction');
      
      const transactionId = `TXN-${ulid()}`;
      await walletService.debitWallet(
        operatorId,
        feeAmount,
        `Win fee for shipment ${shipmentId}`,
        shipmentId,
        transactionId
      );

      await recordSuccessfulPayment(
        chargeId,
        shipmentId,
        'WALLET',
        transactionId
      );

      return {
        success: true,
        transactionId,
        message: 'Fee collected from wallet',
      };
    }

    // Strategy 3: Both failed - mark for manual collection
    log.warn({ chargeId, operatorId }, 'Both autopay and wallet failed, marking for retry');
    
    await query(
      `UPDATE win_fee_charges
       SET 
         payment_status = 'FAILED',
         failure_reason = 'Insufficient balance and autopay failed',
         retry_count = retry_count + 1,
         updated_at = NOW()
       WHERE charge_id = $1`,
      [chargeId]
    );

    // Add to retry queue
    await addToRetryQueue(chargeId, feeAmount);

    return {
      success: false,
      message: 'Payment failed - queued for retry. Operator must add balance or fix mandate.',
    };
  } catch (error) {
    log.error({ error, chargeId }, 'Failed to collect win fee');
    return {
      success: false,
      message: 'Internal error during fee collection',
    };
  }
}

/**
 * Record successful payment
 */
async function recordSuccessfulPayment(
  chargeId: string,
  shipmentId: string,
  paymentMethod: string,
  transactionId: string,
  gatewayTransactionId?: string
): Promise<void> {
  await query(
    `UPDATE win_fee_charges
     SET 
       shipment_id = $1,
       payment_method = $2,
       payment_status = 'SUCCESS',
       transaction_id = $3,
       charged_at = NOW(),
       updated_at = NOW()
     WHERE charge_id = $4`,
    [shipmentId, paymentMethod, transactionId, chargeId]
  );

  log.info({ chargeId, shipmentId, paymentMethod, transactionId }, 'Win fee payment recorded');
}

/**
 * Add failed payment to retry queue
 */
async function addToRetryQueue(chargeId: string, amount: number): Promise<void> {
  // Get transaction ID from charge
  const result = await query(
    `SELECT transaction_id FROM win_fee_charges WHERE charge_id = $1`,
    [chargeId]
  );

  if (result.rows.length > 0 && result.rows[0].transaction_id) {
    const nextRetry = new Date(Date.now() + 5 * 60 * 1000); // Retry in 5 minutes

    await query(
      `INSERT INTO payment_retry_queue 
       (id, transaction_id, retry_count, max_retries, next_retry_at, backoff_strategy, status)
       VALUES ($1, $2, 0, 3, $3, 'EXPONENTIAL', 'QUEUED')
       ON CONFLICT (transaction_id) DO UPDATE
       SET retry_count = payment_retry_queue.retry_count + 1,
           next_retry_at = $3,
           status = 'QUEUED'`,
      [uuid(), result.rows[0].transaction_id, nextRetry]
    );

    log.info({ chargeId, nextRetry }, 'Added to payment retry queue');
  }
}

/**
 * Get operator's outstanding fees
 */
export async function getOutstandingFees(operatorId: string): Promise<WinFeeCharge[]> {
  try {
    const result = await query(
      `SELECT charge_id, operator_id, booking_id, bid_id, shipment_id,
              bid_amount, fee_percentage, fee_amount, payment_method, 
              payment_status, trigger_event
       FROM win_fee_charges
       WHERE operator_id = $1 AND payment_status IN ('PENDING', 'FAILED')
       ORDER BY triggered_at DESC`,
      [operatorId]
    );

    return result.rows.map(row => ({
      chargeId: row.charge_id,
      operatorId: row.operator_id,
      bookingId: row.booking_id,
      bidId: row.bid_id,
      shipmentId: row.shipment_id,
      bidAmount: parseFloat(row.bid_amount),
      feePercentage: parseFloat(row.fee_percentage),
      feeAmount: parseFloat(row.fee_amount),
      paymentMethod: row.payment_method || 'PENDING',
      paymentStatus: row.payment_status,
      triggerEvent: row.trigger_event,
    }));
  } catch (error) {
    log.error({ error, operatorId }, 'Failed to get outstanding fees');
    throw new Error('Failed to retrieve outstanding fees');
  }
}

/**
 * Process retry queue (called by scheduled job)
 */
export async function processRetryQueue(): Promise<{
  processed: number;
  successful: number;
  failed: number;
}> {
  try {
    // Get charges due for retry
    const result = await query(
      `SELECT q.id AS queue_id, q.transaction_id, q.retry_count, 
              wf.charge_id, wf.operator_id, wf.fee_amount, wf.shipment_id
       FROM payment_retry_queue q
       JOIN transactions t ON t.id = q.transaction_id
       JOIN win_fee_charges wf ON wf.transaction_id = t.id
       WHERE q.status = 'QUEUED' 
       AND q.next_retry_at <= NOW()
       AND q.retry_count < q.max_retries
       LIMIT 100`
    );

    let successful = 0;
    let failed = 0;

    for (const row of result.rows) {
      const collectionResult = await collectWinFee(row.charge_id, row.shipment_id);
      
      if (collectionResult.success) {
        successful++;
        // Mark as completed in retry queue
        await query(
          `UPDATE payment_retry_queue 
           SET status = 'COMPLETED', completed_at = NOW()
           WHERE id = $1`,
          [row.queue_id]
        );
      } else {
        failed++;
        // Check if max retries reached
        if (row.retry_count + 1 >= 3) {
          await query(
            `UPDATE payment_retry_queue 
             SET status = 'FAILED', last_error = $1, completed_at = NOW()
             WHERE id = $2`,
            [collectionResult.message, row.queue_id]
          );
        } else {
          // Schedule next retry with exponential backoff
          const backoffMinutes = Math.pow(2, row.retry_count + 1) * 5; // 10, 20, 40 minutes
          const nextRetry = new Date(Date.now() + backoffMinutes * 60 * 1000);
          
          await query(
            `UPDATE payment_retry_queue
             SET 
               retry_count = retry_count + 1,
               last_retry_at = NOW(),
               next_retry_at = $1,
               last_error = $2,
               status = 'QUEUED'
             WHERE id = $3`,
            [nextRetry, collectionResult.message, row.queue_id]
          );
        }
      }
    }

    log.info({ 
      processed: result.rows.length, 
      successful, 
      failed 
    }, 'Payment retry queue processed');

    return {
      processed: result.rows.length,
      successful,
      failed,
    };
  } catch (error) {
    log.error({ error }, 'Failed to process retry queue');
    throw new Error('Failed to process payment retry queue');
  }
}

/**
 * Waive fee (admin action)
 */
export async function waiveFee(
  chargeId: string,
  adminUserId: string,
  reason: string
): Promise<void> {
  try {
    await query(
      `UPDATE win_fee_charges
       SET 
         payment_status = 'WAIVED',
         failure_reason = $1,
         updated_at = NOW()
       WHERE charge_id = $2`,
      [reason, chargeId]
    );

    log.info({ chargeId, adminUserId, reason }, 'Fee waived by admin');
  } catch (error) {
    log.error({ error, chargeId }, 'Failed to waive fee');
    throw new Error('Failed to waive fee');
  }
}

/**
 * Get fee statistics for operator
 */
export async function getOperatorFeeStats(operatorId: string): Promise<{
  totalFeesCharged: number;
  totalFeesPaid: number;
  totalFeesOutstanding: number;
  successRate: number;
}> {
  try {
    const result = await query(
      `SELECT 
         COUNT(*) AS total_charges,
         COUNT(CASE WHEN payment_status = 'SUCCESS' THEN 1 END) AS paid_count,
         COALESCE(SUM(fee_amount), 0) AS total_charged,
         COALESCE(SUM(CASE WHEN payment_status = 'SUCCESS' THEN fee_amount ELSE 0 END), 0) AS total_paid,
         COALESCE(SUM(CASE WHEN payment_status IN ('PENDING', 'FAILED') THEN fee_amount ELSE 0 END), 0) AS total_outstanding
       FROM win_fee_charges
       WHERE operator_id = $1`,
      [operatorId]
    );

    const stats = result.rows[0];
    const totalCharges = parseInt(stats.total_charges);
    const paidCount = parseInt(stats.paid_count);

    return {
      totalFeesCharged: parseFloat(stats.total_charged),
      totalFeesPaid: parseFloat(stats.total_paid),
      totalFeesOutstanding: parseFloat(stats.total_outstanding),
      successRate: totalCharges > 0 ? (paidCount / totalCharges) * 100 : 0,
    };
  } catch (error) {
    log.error({ error, operatorId }, 'Failed to get fee stats');
    throw new Error('Failed to retrieve fee statistics');
  }
}

