/**
 * Shipment Payment Integration
 * Connects shipment lifecycle events with payment collection
 * KEY: Win-based fee is triggered when trip starts, not when bid is won
 */

import { logger } from '../../utils/logger';
import * as winFeeService from './win-fee.service';
import * as commissionService from './commission.service';
import { query } from '../../db';

const log = logger.child({ module: 'shipment-payment-integration' });

/**
 * Handle trip start event
 * This is THE critical business logic: collect win-based fee when trip actually starts
 */
export async function onTripStart(shipmentId: string): Promise<{
  feeCollected: boolean;
  feeAmount: number;
  paymentMethod?: string;
  message: string;
}> {
  try {
    log.info({ shipmentId }, 'Trip started - initiating win fee collection');

    // Get shipment details
    const shipmentResult = await query(
      `SELECT s.id, s.booking_id, b.shipper_id, b.operator_id, b.winning_bid_id, b.winning_bid_amount,
              b.pickup_district_id, b.pickup_region_id
       FROM shipments s
       JOIN bookings b ON b.id = s.booking_id
       WHERE s.id = $1`,
      [shipmentId]
    );

    if (shipmentResult.rows.length === 0) {
      throw new Error('Shipment not found');
    }

    const shipment = shipmentResult.rows[0];

    // Check if fee charge already exists
    const existingChargeResult = await query(
      `SELECT charge_id, payment_status, fee_amount
       FROM win_fee_charges
       WHERE booking_id = $1 AND bid_id = $2`,
      [shipment.booking_id, shipment.winning_bid_id]
    );

    let chargeId: string;
    let feeAmount: number;

    if (existingChargeResult.rows.length > 0) {
      // Charge already created (at bid win time for tracking)
      const existingCharge = existingChargeResult.rows[0];
      chargeId = existingCharge.charge_id;
      feeAmount = parseFloat(existingCharge.fee_amount);

      // If already paid, skip
      if (existingCharge.payment_status === 'SUCCESS') {
        return {
          feeCollected: true,
          feeAmount,
          message: 'Fee already collected',
        };
      }
    } else {
      // Create new charge (if not created at bid win)
      const newCharge = await winFeeService.createWinFeeCharge(
        shipment.operator_id,
        shipment.booking_id,
        shipment.winning_bid_id,
        parseFloat(shipment.winning_bid_amount),
        shipment.pickup_district_id,
        shipment.pickup_region_id
      );
      chargeId = newCharge.chargeId;
      feeAmount = newCharge.feeAmount;
    }

    // NOW COLLECT THE FEE (this is the key moment!)
    const collectionResult = await winFeeService.collectWinFee(chargeId, shipmentId);

    if (collectionResult.success) {
      // Fee collected successfully - record commissions
      await recordCommissionsForFee(
        chargeId,
        shipment.pickup_district_id,
        shipment.pickup_region_id
      );

      log.info({ 
        shipmentId, 
        chargeId, 
        feeAmount, 
        transactionId: collectionResult.transactionId 
      }, 'Win fee collected on trip start');

      return {
        feeCollected: true,
        feeAmount,
        paymentMethod: 'Collected',
        message: 'Fee collected successfully',
      };
    } else {
      // Fee collection failed - trip can still start, but operator has outstanding balance
      log.warn({ 
        shipmentId, 
        chargeId, 
        feeAmount, 
        reason: collectionResult.message 
      }, 'Win fee collection failed - trip proceeding, fee queued for retry');

      return {
        feeCollected: false,
        feeAmount,
        message: `Fee collection failed: ${collectionResult.message}. Trip can proceed, fee will be retried.`,
      };
    }
  } catch (error: any) {
    log.error({ error, shipmentId }, 'Failed to process trip start payment');
    
    // Don't block trip start even if payment fails
    return {
      feeCollected: false,
      feeAmount: 0,
      message: `Payment processing error: ${error.message}. Trip can proceed.`,
    };
  }
}

/**
 * Record commission splits for collected fee
 */
async function recordCommissionsForFee(
  chargeId: string,
  districtId?: string,
  regionId?: string
): Promise<void> {
  try {
    // Get franchise IDs for this district/region
    // For MVP, using hardcoded franchise IDs - in production, fetch from franchise assignments
    const hqFranchiseId = 'USR-FU-HQ001'; // HQ franchise
    const regionalFranchiseId = districtId ? `USR-FD-${regionId || 'AP'}` : 'USR-FD-AP'; // Regional
    const unitFranchiseId = districtId ? `USR-FD-${districtId}` : 'USR-FD-VIJAYAWADA'; // Unit

    // Get win fee charge UUID
    const result = await query(
      `SELECT id FROM win_fee_charges WHERE charge_id = $1`,
      [chargeId]
    );

    if (result.rows.length > 0) {
      await commissionService.recordCommissions(
        result.rows[0].id,
        hqFranchiseId,
        regionalFranchiseId,
        unitFranchiseId,
        districtId,
        regionId
      );

      log.info({ chargeId }, 'Commission splits recorded');
    }
  } catch (error) {
    log.error({ error, chargeId }, 'Failed to record commissions');
    // Don't throw - commission recording failure shouldn't block trip
  }
}

/**
 * Handle bid win event (create fee charge for tracking, but don't collect yet)
 */
export async function onBidWin(
  operatorId: string,
  bookingId: string,
  bidId: string,
  bidAmount: number,
  districtId?: string,
  regionId?: string
): Promise<{ chargeId: string; feeAmount: number }> {
  try {
    log.info({ operatorId, bookingId, bidId, bidAmount }, 'Bid won - creating fee charge (not collecting yet)');

    const charge = await winFeeService.createWinFeeCharge(
      operatorId,
      bookingId,
      bidId,
      bidAmount,
      districtId,
      regionId
    );

    log.info({ 
      chargeId: charge.chargeId, 
      feeAmount: charge.feeAmount 
    }, 'Fee charge created - will be collected when trip starts');

    return {
      chargeId: charge.chargeId,
      feeAmount: charge.feeAmount,
    };
  } catch (error: any) {
    log.error({ error, operatorId, bookingId }, 'Failed to create fee charge on bid win');
    throw error;
  }
}

/**
 * Handle trip completion (for analytics, no payment action)
 */
export async function onTripComplete(shipmentId: string): Promise<void> {
  try {
    log.info({ shipmentId }, 'Trip completed - updating payment records');

    // Mark any pending fees as overdue if not collected
    await query(
      `UPDATE win_fee_charges
       SET trigger_event = 'TRIP_COMPLETE'
       WHERE shipment_id = $1 AND payment_status != 'SUCCESS'`,
      [shipmentId]
    );

    log.info({ shipmentId }, 'Payment records updated for completed trip');
  } catch (error) {
    log.error({ error, shipmentId }, 'Failed to update payment records on trip complete');
  }
}

/**
 * Handle trip cancellation (refund logic if applicable)
 */
export async function onTripCancellation(
  shipmentId: string,
  cancellationReason: string
): Promise<void> {
  try {
    log.info({ shipmentId, cancellationReason }, 'Trip cancelled - checking for refund');

    // If fee was collected and trip is cancelled early, may need refund
    const result = await query(
      `SELECT charge_id, fee_amount, payment_status, charged_at
       FROM win_fee_charges
       WHERE shipment_id = $1 AND payment_status = 'SUCCESS'`,
      [shipmentId]
    );

    if (result.rows.length > 0) {
      const charge = result.rows[0];
      const chargedAt = new Date(charge.charged_at);
      const now = new Date();
      const hoursSinceCharge = (now.getTime() - chargedAt.getTime()) / (1000 * 60 * 60);

      // If cancelled within 1 hour of charge, auto-refund
      if (hoursSinceCharge < 1) {
        log.info({ 
          shipmentId, 
          chargeId: charge.charge_id, 
          hoursSinceCharge 
        }, 'Auto-refund triggered for early cancellation');

        // Mark for refund processing (admin approval may be needed)
        await query(
          `UPDATE win_fee_charges
           SET payment_status = 'REFUNDED', updated_at = NOW()
           WHERE charge_id = $1`,
          [charge.charge_id]
        );
      }
    }

    log.info({ shipmentId }, 'Trip cancellation payment processing complete');
  } catch (error) {
    log.error({ error, shipmentId }, 'Failed to process cancellation payments');
  }
}

