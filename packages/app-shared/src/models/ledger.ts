/**
 * Ledger Domain Model
 */

export enum LedgerTransactionType {
  DEPOSIT = 'DEPOSIT',
  BIDDING_FEE = 'BIDDING_FEE',
  REFUND = 'REFUND', // Only for failed payments
}

export interface Ledger {
  id: string;
  operatorId: string; // USR-OP-<ulid>
  balance: number; // Cannot go negative
  currency: 'INR';
  createdAt: Date;
  updatedAt: Date;
}

export interface LedgerTransaction {
  id: string;
  ledgerId: string;
  type: LedgerTransactionType;
  amount: number; // Positive for deposit/refund, negative for fees
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string; // e.g., bid ID, payment ID
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface LedgerDepositRequest {
  operatorId: string;
  amount: number;
  paymentGatewayTransactionId: string;
  razorpayPaymentId?: string;
}

