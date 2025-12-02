/**
 * Ledger Service
 * Business logic for ledger with atomic transactions
 */

import * as ledgerRepo from './ledger.repository';
import logger from 'pino';
import { LedgerEntry } from './ledger.repository';

const log = logger({ name: 'ledger-service' });

/**
 * Calculate and deduct fees atomically
 * Used when bid is finalized to deduct platform fees
 */
export async function deductFees(
  operatorId: string,
  amount: number,
  feePercentage: number = 5, // Default 5% platform fee
  referenceType: string = 'bid',
  referenceId: string
): Promise<{ feeAmount: number; netAmount: number; debitEntry: LedgerEntry }> {
  try {
    const feeAmount = Math.round(amount * (feePercentage / 100));
    const netAmount = amount - feeAmount;

    // Deduct fee atomically
    const debitEntry = await ledgerRepo.createLedgerEntry({
      operatorId,
      type: 'DEBIT',
      amount: feeAmount,
      description: `Platform fee (${feePercentage}%) for ${referenceType} ${referenceId}`,
      referenceType: 'fee',
      referenceId,
    });

    log.info({ operatorId, feeAmount, netAmount, referenceId }, 'Fees deducted');

    return {
      feeAmount,
      netAmount,
      debitEntry,
    };
  } catch (error: any) {
    log.error({ error, operatorId, amount }, 'Failed to deduct fees');
    throw error;
  }
}

/**
 * Credit amount to operator (e.g., when shipment is completed)
 */
export async function creditOperator(
  operatorId: string,
  amount: number,
  description: string,
  referenceType?: string,
  referenceId?: string
): Promise<LedgerEntry> {
  try {
    const creditEntry = await ledgerRepo.createLedgerEntry({
      operatorId,
      type: 'CREDIT',
      amount,
      description,
      referenceType,
      referenceId,
    });

    log.info({ operatorId, amount, referenceId }, 'Operator credited');

    return creditEntry;
  } catch (error: any) {
    log.error({ error, operatorId, amount }, 'Failed to credit operator');
    throw error;
  }
}

/**
 * Get operator balance
 */
export async function getOperatorBalance(operatorId: string): Promise<number> {
  return ledgerRepo.getBalance(operatorId);
}

/**
 * Get ledger entries for operator
 */
export async function getLedgerEntries(filters: {
  operatorId: string;
  type?: 'CREDIT' | 'DEBIT';
  page?: number;
  limit?: number;
}): Promise<{ data: LedgerEntry[]; total: number; page: number; limit: number; totalPages: number }> {
  const result = await ledgerRepo.listLedgerEntries(filters);
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const totalPages = Math.ceil(result.total / limit);

  return {
    ...result,
    page,
    limit,
    totalPages,
  };
}

/**
 * Process payment for completed shipment
 * Credits operator with payment amount, deducts platform fee
 */
export async function processPayment(
  operatorId: string,
  paymentAmount: number,
  shipmentId: string,
  feePercentage: number = 5
): Promise<{
  creditEntry: LedgerEntry;
  feeDebitEntry: LedgerEntry;
  netAmount: number;
}> {
  const entries = await ledgerRepo.createLedgerEntriesAtomically([
    // Credit full payment amount
    {
      operatorId,
      type: 'CREDIT',
      amount: paymentAmount,
      description: `Payment for shipment ${shipmentId}`,
      referenceType: 'shipment',
      referenceId: shipmentId,
    },
    // Deduct platform fee
    {
      operatorId,
      type: 'DEBIT',
      amount: Math.round(paymentAmount * (feePercentage / 100)),
      description: `Platform fee (${feePercentage}%) for shipment ${shipmentId}`,
      referenceType: 'fee',
      referenceId: shipmentId,
    },
  ]);

  const feeAmount = Math.round(paymentAmount * (feePercentage / 100));
  const netAmount = paymentAmount - feeAmount;

  log.info({ operatorId, paymentAmount, feeAmount, netAmount, shipmentId }, 'Payment processed');

  return {
    creditEntry: entries[0],
    feeDebitEntry: entries[1],
    netAmount,
  };
}

/**
 * Refund amount to operator
 */
export async function refund(
  operatorId: string,
  amount: number,
  reason: string,
  referenceType?: string,
  referenceId?: string
): Promise<LedgerEntry> {
  try {
    const refundEntry = await ledgerRepo.createLedgerEntry({
      operatorId,
      type: 'CREDIT',
      amount,
      description: `Refund: ${reason}`,
      referenceType: referenceType || 'refund',
      referenceId,
    });

    log.info({ operatorId, amount, reason, referenceId }, 'Refund processed');

    return refundEntry;
  } catch (error: any) {
    log.error({ error, operatorId, amount }, 'Failed to process refund');
    throw error;
  }
}

