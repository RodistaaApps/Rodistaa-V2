/**
 * Payment Gateway Mock Service
 * Simulates UPI gateway (Razorpay/Paytm/PhonePe) for MVP development
 * Provides realistic success/failure patterns for testing
 */

import { v4 as uuid } from 'uuid';
import { ulid } from 'ulid';
import { logger } from '../../utils/logger';
import { query } from '../../db';

const log = logger.child({ module: 'payment-gateway-mock' });

export interface GatewayMandateRequest {
  operatorId: string;
  upiId: string;
  maxAmount: number;
  frequency: string;
  startDate: Date;
  endDate?: Date;
}

export interface GatewayMandateResponse {
  success: boolean;
  mandateId?: string;
  gatewayReference?: string;
  message?: string;
  metadata?: any;
}

export interface GatewayChargeRequest {
  mandateId: string;
  amount: number;
  description: string;
  referenceId: string;
}

export interface GatewayChargeResponse {
  success: boolean;
  transactionId?: string;
  gatewayTransactionId?: string;
  status?: 'SUCCESS' | 'PENDING' | 'FAILED';
  message?: string;
  timestamp?: Date;
}

export interface GatewayWebhookPayload {
  event: string;
  mandateId?: string;
  transactionId?: string;
  status: string;
  amount?: number;
  timestamp: Date;
  signature: string; // Mock signature for webhook verification
}

/**
 * Mock UPI Mandate Creation
 * Simulates Razorpay/UPI gateway mandate creation
 */
export async function createMandateMock(
  request: GatewayMandateRequest
): Promise<GatewayMandateResponse> {
  const startTime = Date.now();

  try {
    // Validate UPI ID format
    if (!isValidUPIId(request.upiId)) {
      await logGatewayRequest('CREATE_MANDATE', request, {
        success: false,
        message: 'Invalid UPI ID format',
      }, Date.now() - startTime);

      return {
        success: false,
        message: 'Invalid UPI ID format. Expected: username@bankname',
      };
    }

    // Validate amount
    if (request.maxAmount < 100 || request.maxAmount > 100000) {
      return {
        success: false,
        message: 'Amount must be between ₹100 and ₹100,000',
      };
    }

    // Simulate network delay (100-500ms)
    await delay(100 + Math.random() * 400);

    const mandateId = `MND-MOCK-${ulid()}`;
    const gatewayReference = `GW-REF-${ulid()}`;

    // Simulate success with realistic patterns
    const random = Math.random();
    
    // 90% success rate in development
    if (process.env.NODE_ENV === 'development' || random > 0.1) {
      const response: GatewayMandateResponse = {
        success: true,
        mandateId,
        gatewayReference,
        message: 'Mandate created successfully. Awaiting customer approval.',
        metadata: {
          gateway: 'RAZORPAY_MOCK',
          upiId: request.upiId,
          maxAmount: request.maxAmount,
          frequency: request.frequency,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min expiry
        },
      };

      await logGatewayRequest('CREATE_MANDATE', request, response, Date.now() - startTime);
      
      // Simulate auto-approval after 2 seconds (in real scenario, user approves in UPI app)
      setTimeout(() => {
        simulateMandateApproval(mandateId);
      }, 2000);

      return response;
    } else {
      // 10% failure scenarios
      const failures = [
        'Bank server temporarily unavailable',
        'Invalid bank account',
        'UPI ID not found',
        'Mandate limit exceeded for this UPI ID',
        'Request timeout',
      ];
      const failureMessage = failures[Math.floor(Math.random() * failures.length)];

      const response: GatewayMandateResponse = {
        success: false,
        message: failureMessage,
      };

      await logGatewayRequest('CREATE_MANDATE', request, response, Date.now() - startTime);
      return response;
    }
  } catch (error) {
    log.error({ error, request }, 'Gateway mandate creation failed');
    return {
      success: false,
      message: 'Internal gateway error',
    };
  }
}

/**
 * Mock UPI Autopay Charge
 * Simulates charging against an active mandate
 */
export async function chargeMandate Mock(
  request: GatewayChargeRequest
): Promise<GatewayChargeResponse> {
  const startTime = Date.now();

  try {
    // Simulate network delay (200-800ms)
    await delay(200 + Math.random() * 600);

    const transactionId = `TXN-MOCK-${ulid()}`;
    const gatewayTransactionId = `GWTXN-${ulid()}`;

    // Simulate success/failure patterns
    const random = Math.random();

    // In development: 95% success rate
    // In production mock: 85% success rate (more realistic)
    const successThreshold = process.env.NODE_ENV === 'development' ? 0.95 : 0.85;

    if (random < successThreshold) {
      const response: GatewayChargeResponse = {
        success: true,
        transactionId,
        gatewayTransactionId,
        status: 'SUCCESS',
        message: 'Payment successful',
        timestamp: new Date(),
      };

      await logGatewayRequest('CHARGE_MANDATE', request, response, Date.now() - startTime);

      // Simulate webhook callback after 1 second
      setTimeout(() => {
        simulateWebhook({
          event: 'charge.success',
          transactionId,
          status: 'SUCCESS',
          amount: request.amount,
          timestamp: new Date(),
          signature: generateMockSignature(transactionId),
        });
      }, 1000);

      return response;
    } else {
      // Failure scenarios
      const failures = [
        { message: 'Insufficient funds in customer account', code: 'INSUFFICIENT_FUNDS' },
        { message: 'Customer bank declined transaction', code: 'BANK_DECLINED' },
        { message: 'Mandate limit exceeded', code: 'LIMIT_EXCEEDED' },
        { message: 'Network timeout', code: 'TIMEOUT' },
        { message: 'Mandate paused by customer', code: 'MANDATE_PAUSED' },
      ];
      const failure = failures[Math.floor(Math.random() * failures.length)];

      const response: GatewayChargeResponse = {
        success: false,
        transactionId,
        status: 'FAILED',
        message: failure.message,
        timestamp: new Date(),
      };

      await logGatewayRequest('CHARGE_MANDATE', request, response, Date.now() - startTime);

      // Simulate webhook for failure too
      setTimeout(() => {
        simulateWebhook({
          event: 'charge.failed',
          transactionId,
          status: 'FAILED',
          amount: request.amount,
          timestamp: new Date(),
          signature: generateMockSignature(transactionId),
        });
      }, 1000);

      return response;
    }
  } catch (error) {
    log.error({ error, request }, 'Gateway charge failed');
    return {
      success: false,
      transactionId: `TXN-ERR-${ulid()}`,
      status: 'FAILED',
      message: 'Internal gateway error',
      timestamp: new Date(),
    };
  }
}

/**
 * Mock Refund
 */
export async function refundMock(
  transactionId: string,
  amount: number,
  reason: string
): Promise<GatewayChargeResponse> {
  const startTime = Date.now();

  try {
    await delay(300 + Math.random() * 500);

    const refundId = `RFD-MOCK-${ulid()}`;
    const random = Math.random();

    if (random < 0.95) {
      const response: GatewayChargeResponse = {
        success: true,
        transactionId: refundId,
        gatewayTransactionId: `GWRFD-${ulid()}`,
        status: 'SUCCESS',
        message: 'Refund processed successfully',
        timestamp: new Date(),
      };

      await logGatewayRequest('REFUND', { transactionId, amount, reason }, response, Date.now() - startTime);
      return response;
    } else {
      return {
        success: false,
        transactionId: refundId,
        status: 'FAILED',
        message: 'Refund failed - original transaction not found',
        timestamp: new Date(),
      };
    }
  } catch (error) {
    log.error({ error, transactionId }, 'Gateway refund failed');
    return {
      success: false,
      status: 'FAILED',
      message: 'Internal error during refund',
      timestamp: new Date(),
    };
  }
}

/**
 * Check mandate status (for testing)
 */
export async function checkMandateStatus(mandateId: string): Promise<{
  status: string;
  active: boolean;
  message: string;
}> {
  await delay(100 + Math.random() * 200);

  // Mock mandate status check
  return {
    status: 'ACTIVE',
    active: true,
    message: 'Mandate is active and ready for charges',
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate UPI ID format
 */
function isValidUPIId(upiId: string): boolean {
  // Format: username@bankname
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return upiRegex.test(upiId);
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate mock webhook signature
 */
function generateMockSignature(data: string): string {
  // In production, this would be HMAC-SHA256 with secret key
  // For mock, just generate a random signature
  return `SIG-${Buffer.from(data).toString('base64').substring(0, 32)}`;
}

/**
 * Simulate mandate approval (happens in customer's UPI app)
 */
async function simulateMandateApproval(mandateId: string): Promise<void> {
  try {
    log.info({ mandateId }, 'Simulating mandate approval');
    
    // In real scenario, this would be triggered by webhook from UPI gateway
    // For mock, we auto-approve after delay
    
    simulateWebhook({
      event: 'mandate.approved',
      mandateId,
      status: 'ACTIVE',
      timestamp: new Date(),
      signature: generateMockSignature(mandateId),
    });
  } catch (error) {
    log.error({ error, mandateId }, 'Failed to simulate mandate approval');
  }
}

/**
 * Simulate webhook callback
 */
function simulateWebhook(payload: GatewayWebhookPayload): void {
  log.info({ event: payload.event, mandateId: payload.mandateId, transactionId: payload.transactionId }, 'Mock webhook triggered');
  
  // In production, this would be received via HTTP webhook endpoint
  // For mock, we just log it
  // The actual webhook handling would update database accordingly
}

/**
 * Log gateway request/response for debugging and reconciliation
 */
async function logGatewayRequest(
  requestType: string,
  requestPayload: any,
  responsePayload: any,
  durationMs: number
): Promise<void> {
  try {
    await query(
      `INSERT INTO payment_gateway_logs
       (id, request_type, request_payload, response_payload, status_code, status_message,
        is_success, requested_at, responded_at, duration_ms, gateway_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW() + INTERVAL '${durationMs} milliseconds',
               $8, 'RAZORPAY_MOCK')`,
      [
        uuid(),
        requestType,
        JSON.stringify(requestPayload),
        JSON.stringify(responsePayload),
        responsePayload.success ? 200 : 400,
        responsePayload.message || 'OK',
        responsePayload.success,
        durationMs,
      ]
    );
  } catch (error) {
    log.error({ error, requestType }, 'Failed to log gateway request');
  }
}

/**
 * Get gateway statistics (for monitoring)
 */
export async function getGatewayStats(hours: number = 24): Promise<{
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  avgDurationMs: number;
}> {
  try {
    const result = await query(
      `SELECT 
         COUNT(*) AS total,
         COUNT(CASE WHEN is_success THEN 1 END) AS successful,
         COUNT(CASE WHEN NOT is_success THEN 1 END) AS failed,
         AVG(duration_ms) AS avg_duration
       FROM payment_gateway_logs
       WHERE requested_at >= NOW() - INTERVAL '${hours} hours'`
    );

    const stats = result.rows[0];
    const total = parseInt(stats.total);
    const successful = parseInt(stats.successful);

    return {
      totalRequests: total,
      successfulRequests: successful,
      failedRequests: parseInt(stats.failed),
      successRate: total > 0 ? (successful / total) * 100 : 0,
      avgDurationMs: parseFloat(stats.avg_duration || 0),
    };
  } catch (error) {
    log.error({ error }, 'Failed to get gateway stats');
    throw new Error('Failed to retrieve gateway statistics');
  }
}

/**
 * Simulate different failure scenarios for testing
 */
export function setMockFailureMode(mode: 'normal' | 'high_failure' | 'all_fail' | 'all_success'): void {
  // This would be used in testing to simulate different scenarios
  log.info({ mode }, 'Mock gateway failure mode set');
  // In real implementation, this would adjust internal failure rates
}

