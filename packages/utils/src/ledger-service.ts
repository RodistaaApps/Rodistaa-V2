/**
 * @rodistaa/utils - Ledger Balance Management Service
 * 
 * Manages operator ledger balance with strict business rules:
 * - Ledger CANNOT go negative
 * - Auto-deduct bidding fees
 * - Credit operator payments
 * - Maintain transaction history
 * 
 * BUSINESS RULE: Ledger balance cannot go negative.
 */

import { PrismaClient, Prisma } from '@prisma/client';

export interface DeductFromLedgerParams {
  operatorId: string;
  amount: number;
  transactionType: 'BIDDING_FEE' | 'PAYMENT' | 'ADJUSTMENT' | 'REFUND';
  referenceId?: string; // Bid ID, Payment ID, etc.
  description?: string;
}

export interface CreditToLedgerParams {
  operatorId: string;
  amount: number;
  transactionType: 'PAYMENT' | 'REFUND' | 'ADJUSTMENT';
  referenceId?: string;
  description?: string;
}

export interface LedgerBalance {
  operatorId: string;
  currentBalance: number;
  canDeduct: boolean;
  availableBalance: number;
}

export class LedgerService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get current ledger balance for operator
   * 
   * BUSINESS RULE: Balance must be available for query
   */
  async getBalance(operatorId: string): Promise<LedgerBalance> {
    const operator = await this.prisma.operatorProfile.findUnique({
      where: { operatorId },
      select: {
        operatorId: true,
        ledgerBalance: true,
      },
    });

    if (!operator) {
      throw new Error(`Operator ${operatorId} not found`);
    }

    const currentBalance = Number(operator.ledgerBalance || 0);

    return {
      operatorId,
      currentBalance,
      canDeduct: currentBalance >= 0,
      availableBalance: Math.max(0, currentBalance), // Cannot be negative
    };
  }

  /**
   * Check if operator can afford a deduction
   * 
   * BUSINESS RULE: Ledger cannot go negative
   */
  async canDeduct(operatorId: string, amount: number): Promise<{
    canDeduct: boolean;
    currentBalance: number;
    wouldBeBalance: number;
    message?: string;
  }> {
    if (amount <= 0) {
      return {
        canDeduct: false,
        currentBalance: 0,
        wouldBeBalance: 0,
        message: 'Amount must be greater than 0',
      };
    }

    const balance = await this.getBalance(operatorId);
    const wouldBeBalance = balance.currentBalance - amount;

    // BUSINESS RULE: Ledger cannot go negative
    if (wouldBeBalance < 0) {
      return {
        canDeduct: false,
        currentBalance: balance.currentBalance,
        wouldBeBalance,
        message: `Insufficient balance. Current: ₹${balance.currentBalance.toFixed(2)}, Required: ₹${amount.toFixed(2)}, Shortfall: ₹${Math.abs(wouldBeBalance).toFixed(2)}`,
      };
    }

    return {
      canDeduct: true,
      currentBalance: balance.currentBalance,
      wouldBeBalance,
    };
  }

  /**
   * Deduct amount from operator ledger
   * 
   * BUSINESS RULE:
   * - Ledger cannot go negative
   * - Transaction must be recorded
   * - Balance updated atomically
   */
  async deductFromLedger(params: DeductFromLedgerParams): Promise<{
    success: boolean;
    previousBalance: number;
    newBalance: number;
    transactionId: string;
  }> {
    const { operatorId, amount, transactionType, referenceId, description } = params;

    if (amount <= 0) {
      throw new Error('Deduction amount must be greater than 0');
    }

    // Check if deduction is possible
    const canDeduct = await this.canDeduct(operatorId, amount);
    if (!canDeduct.canDeduct) {
      throw new Error(canDeduct.message || 'Insufficient ledger balance');
    }

    // BUSINESS RULE: Atomic transaction to prevent negative balance
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Get current balance with lock
      const operator = await tx.operatorProfile.findUnique({
        where: { operatorId },
      });

      if (!operator) {
        throw new Error(`Operator ${operatorId} not found`);
      }

      const previousBalance = Number(operator.ledgerBalance || 0);
      const newBalance = previousBalance - amount;

      // BUSINESS RULE: Double-check balance cannot go negative
      if (newBalance < 0) {
        throw new Error(
          `Insufficient ledger balance. Current: ₹${previousBalance.toFixed(2)}, Required: ₹${amount.toFixed(2)}. BUSINESS RULE: Ledger cannot go negative.`
        );
      }

      // Update operator balance
      await tx.operatorProfile.update({
        where: { operatorId },
        data: {
          ledgerBalance: newBalance,
        },
      });

      // Create ledger transaction record
      const transaction = await tx.ledgerTransaction.create({
        data: {
          operatorId,
          amount: -amount, // Negative for deduction
          transactionType,
          balanceBefore: previousBalance,
          balanceAfter: newBalance,
          referenceId,
          description: description || `Deduction: ${transactionType}`,
        },
      });

      return {
        success: true,
        previousBalance,
        newBalance,
        transactionId: transaction.id,
      };
    });
  }

  /**
   * Credit amount to operator ledger
   * 
   * BUSINESS RULE:
   * - Transaction must be recorded
   * - Balance updated atomically
   */
  async creditToLedger(params: CreditToLedgerParams): Promise<{
    success: boolean;
    previousBalance: number;
    newBalance: number;
    transactionId: string;
  }> {
    const { operatorId, amount, transactionType, referenceId, description } = params;

    if (amount <= 0) {
      throw new Error('Credit amount must be greater than 0');
    }

    // BUSINESS RULE: Atomic transaction
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const operator = await tx.operatorProfile.findUnique({
        where: { operatorId },
      });

      if (!operator) {
        throw new Error(`Operator ${operatorId} not found`);
      }

      const previousBalance = Number(operator.ledgerBalance || 0);
      const newBalance = previousBalance + amount;

      // Update operator balance
      await tx.operatorProfile.update({
        where: { operatorId },
        data: {
          ledgerBalance: newBalance,
        },
      });

      // Create ledger transaction record
      const transaction = await tx.ledgerTransaction.create({
        data: {
          operatorId,
          amount: +amount, // Positive for credit
          transactionType,
          balanceBefore: previousBalance,
          balanceAfter: newBalance,
          referenceId,
          description: description || `Credit: ${transactionType}`,
        },
      });

      return {
        success: true,
        previousBalance,
        newBalance,
        transactionId: transaction.id,
      };
    });
  }

  /**
   * Deduct bidding fee from operator ledger
   * 
   * BUSINESS RULE:
   * - Auto-deducted when bid is placed
   * - Ledger cannot go negative
   * - Transaction recorded
   */
  async deductBiddingFee(operatorId: string, biddingFee: number, bidId: string): Promise<{
    success: boolean;
    previousBalance: number;
    newBalance: number;
    transactionId: string;
  }> {
    return this.deductFromLedger({
      operatorId,
      amount: biddingFee,
      transactionType: 'BIDDING_FEE',
      referenceId: bidId,
      description: `Bidding fee deduction for bid ${bidId}`,
    });
  }

  /**
   * Get transaction history for operator
   */
  async getTransactionHistory(operatorId: string, limit: number = 50) {
    return this.prisma.ledgerTransaction.findMany({
      where: { operatorId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

