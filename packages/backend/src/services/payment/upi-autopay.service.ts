/**
 * UPI Autopay Mandate Service
 * Handles UPI mandate creation, charging, and management
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { logger } from '../../utils/logger';
import { ulid } from 'ulid';

const log = logger.child({ module: 'upi-autopay-service' });

export interface UPIMandate {
  id: string;
  mandateId: string;
  operatorId: string;
  upiId: string;
  maxAmount: number;
  frequency: string;
  status: string;
  startDate: Date;
  endDate?: Date;
  failureCount: number;
}

export interface MandateChargeRequest {
  mandateId: string;
  amount: number;
  description: string;
  referenceId: string; // Shipment ID or booking ID
}

export interface MandateChargeResponse {
  success: boolean;
  transactionId?: string;
  gatewayTransactionId?: string;
  message: string;
}

/**
 * Create UPI Autopay mandate
 */
export async function createMandate(
  operatorId: string,
  upiId: string,
  maxAmount: number,
  startDate: Date,
  endDate?: Date
): Promise<UPIMandate> {
  try {
    const id = uuid();
    const mandateId = `MND-${ulid()}`;

    // In production, this would call actual UPI gateway API
    // For MVP, we simulate the mandate creation
    const gatewayResponse = await simulateMandateCreation({
      mandateId,
      upiId,
      maxAmount,
      startDate,
      endDate,
    });

    if (!gatewayResponse.success) {
      throw new Error(gatewayResponse.message || 'Mandate creation failed');
    }

    await query(
      `INSERT INTO upi_mandates 
       (id, mandate_id, operator_id, upi_id, max_amount, frequency, start_date, end_date, 
        status, gateway_reference, metadata)
       VALUES ($1, $2, $3, $4, $5, 'AS_PRESENTED', $6, $7, 'PENDING', $8, $9)`,
      [
        id,
        mandateId,
        operatorId,
        upiId,
        maxAmount,
        startDate,
        endDate,
        gatewayResponse.reference,
        JSON.stringify(gatewayResponse.metadata || {}),
      ]
    );

    log.info({ operatorId, mandateId, upiId }, 'UPI mandate created');

    return {
      id,
      mandateId,
      operatorId,
      upiId,
      maxAmount,
      frequency: 'AS_PRESENTED',
      status: 'PENDING',
      startDate,
      endDate,
      failureCount: 0,
    };
  } catch (error) {
    log.error({ error, operatorId, upiId }, 'Failed to create UPI mandate');
    throw error;
  }
}

/**
 * Approve mandate (simulates user approval in UPI app)
 */
export async function approveMandate(mandateId: string): Promise<void> {
  try {
    await query(
      `UPDATE upi_mandates
       SET status = 'ACTIVE', approved_at = NOW(), updated_at = NOW()
       WHERE mandate_id = $1 AND status = 'PENDING'`,
      [mandateId]
    );

    log.info({ mandateId }, 'UPI mandate approved');
  } catch (error) {
    log.error({ error, mandateId }, 'Failed to approve mandate');
    throw new Error('Failed to approve mandate');
  }
}

/**
 * Charge using UPI Autopay mandate
 */
export async function chargeMandate(
  request: MandateChargeRequest
): Promise<MandateChargeResponse> {
  const { mandateId, amount, description, referenceId } = request;

  try {
    // Get mandate details
    const mandateResult = await query(
      `SELECT id, operator_id, upi_id, max_amount, status, failure_count
       FROM upi_mandates
       WHERE mandate_id = $1`,
      [mandateId]
    );

    if (mandateResult.rows.length === 0) {
      return {
        success: false,
        message: 'Mandate not found',
      };
    }

    const mandate = mandateResult.rows[0];

    // Validate mandate status
    if (mandate.status !== 'ACTIVE') {
      return {
        success: false,
        message: `Mandate is ${mandate.status}, cannot charge`,
      };
    }

    // Validate amount
    if (amount > parseFloat(mandate.max_amount)) {
      return {
        success: false,
        message: `Amount ${amount} exceeds mandate limit ${mandate.max_amount}`,
      };
    }

    // Check failure threshold
    if (mandate.failure_count >= 3) {
      await query(
        `UPDATE upi_mandates SET status = 'PAUSED', updated_at = NOW() WHERE id = $1`,
        [mandate.id]
      );
      return {
        success: false,
        message: 'Mandate paused due to multiple failures',
      };
    }

    // Simulate gateway charge
    const gatewayResponse = await simulateAutopayCharge({
      mandateId,
      upiId: mandate.upi_id,
      amount,
      description,
    });

    if (gatewayResponse.success) {
      // Update mandate last used
      await query(
        `UPDATE upi_mandates
         SET last_used_at = NOW(), failure_count = 0, updated_at = NOW()
         WHERE id = $1`,
        [mandate.id]
      );

      log.info({ mandateId, amount, transactionId: gatewayResponse.transactionId }, 'Autopay charge successful');

      return {
        success: true,
        transactionId: gatewayResponse.transactionId,
        gatewayTransactionId: gatewayResponse.gatewayTransactionId,
        message: 'Charge successful',
      };
    } else {
      // Update failure count
      await query(
        `UPDATE upi_mandates
         SET 
           failure_count = failure_count + 1,
           last_failure_reason = $1,
           last_failure_at = NOW(),
           updated_at = NOW()
         WHERE id = $2`,
        [gatewayResponse.message, mandate.id]
      );

      log.warn({ mandateId, amount, reason: gatewayResponse.message }, 'Autopay charge failed');

      return {
        success: false,
        message: gatewayResponse.message || 'Charge failed',
      };
    }
  } catch (error) {
    log.error({ error, mandateId, amount }, 'Failed to charge mandate');
    return {
      success: false,
      message: 'Internal error during charge',
    };
  }
}

/**
 * Get operator's active mandates
 */
export async function getOperatorMandates(operatorId: string): Promise<UPIMandate[]> {
  try {
    const result = await query(
      `SELECT id, mandate_id, operator_id, upi_id, max_amount, frequency, status,
              start_date, end_date, failure_count
       FROM upi_mandates
       WHERE operator_id = $1
       ORDER BY created_at DESC`,
      [operatorId]
    );

    return result.rows.map(row => ({
      id: row.id,
      mandateId: row.mandate_id,
      operatorId: row.operator_id,
      upiId: row.upi_id,
      maxAmount: parseFloat(row.max_amount),
      frequency: row.frequency,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      failureCount: row.failure_count,
    }));
  } catch (error) {
    log.error({ error, operatorId }, 'Failed to get mandates');
    throw new Error('Failed to retrieve mandates');
  }
}

/**
 * Revoke mandate
 */
export async function revokeMandate(mandateId: string): Promise<void> {
  try {
    await query(
      `UPDATE upi_mandates
       SET status = 'REVOKED', revoked_at = NOW(), updated_at = NOW()
       WHERE mandate_id = $1`,
      [mandateId]
    );

    log.info({ mandateId }, 'UPI mandate revoked');
  } catch (error) {
    log.error({ error, mandateId }, 'Failed to revoke mandate');
    throw new Error('Failed to revoke mandate');
  }
}

// ============================================================================
// MOCK GATEWAY FUNCTIONS (For MVP)
// ============================================================================

/**
 * Simulate UPI mandate creation (mock gateway)
 */
async function simulateMandateCreation(request: {
  mandateId: string;
  upiId: string;
  maxAmount: number;
  startDate: Date;
  endDate?: Date;
}): Promise<{ success: boolean; reference?: string; metadata?: any; message?: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // In development mode, always succeed
  if (process.env.NODE_ENV === 'development') {
    return {
      success: true,
      reference: `GW-${ulid()}`,
      metadata: {
        gatewayName: 'RAZORPAY_MOCK',
        requestTime: new Date().toISOString(),
        mandateId: request.mandateId,
      },
    };
  }

  // Simulate 10% failure rate in production mock
  const random = Math.random();
  if (random < 0.1) {
    return {
      success: false,
      message: 'Mock gateway error: Temporary failure',
    };
  }

  return {
    success: true,
    reference: `GW-${ulid()}`,
    metadata: {
      gatewayName: 'RAZORPAY_MOCK',
      requestTime: new Date().toISOString(),
    },
  };
}

/**
 * Simulate UPI Autopay charge (mock gateway)
 */
async function simulateAutopayCharge(request: {
  mandateId: string;
  upiId: string;
  amount: number;
  description: string;
}): Promise<{ success: boolean; transactionId?: string; gatewayTransactionId?: string; message?: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // In development mode, always succeed
  if (process.env.NODE_ENV === 'development') {
    const txnId = `TXN-${ulid()}`;
    const gatewayTxnId = `GW-TXN-${ulid()}`;
    
    log.info({ 
      mandateId: request.mandateId, 
      amount: request.amount,
      transactionId: txnId,
    }, 'Mock autopay charge successful');

    return {
      success: true,
      transactionId: txnId,
      gatewayTransactionId: gatewayTxnId,
    };
  }

  // Simulate 15% failure rate for realistic testing
  const random = Math.random();
  if (random < 0.15) {
    const failureReasons = [
      'Insufficient funds in customer account',
      'Mandate limit exceeded',
      'Customer bank declined',
      'Network timeout',
      'Gateway temporarily unavailable',
    ];
    const reason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
    
    return {
      success: false,
      message: reason,
    };
  }

  const txnId = `TXN-${ulid()}`;
  const gatewayTxnId = `GW-TXN-${ulid()}`;

  return {
    success: true,
    transactionId: txnId,
    gatewayTransactionId: gatewayTxnId,
  };
}

