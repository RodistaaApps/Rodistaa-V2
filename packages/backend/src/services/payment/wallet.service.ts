/**
 * Wallet Service
 * Manages operator wallet operations: balance, transactions, locks
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { logger } from '../../utils/logger';

const log = logger.child({ module: 'wallet-service' });

export interface WalletBalance {
  walletId: string;
  operatorId: string;
  balance: number;
  lockedAmount: number;
  availableBalance: number;
  currency: string;
  status: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'CREDIT' | 'DEBIT' | 'LOCK' | 'UNLOCK' | 'REFUND';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  createdAt: Date;
}

/**
 * Get or create wallet for operator
 */
export async function getOrCreateWallet(operatorId: string): Promise<WalletBalance> {
  try {
    // Try to get existing wallet
    let result = await query(
      `SELECT id, operator_id, balance, locked_amount, currency, status
       FROM operator_wallets
       WHERE operator_id = $1`,
      [operatorId]
    );

    if (result.rows.length === 0) {
      // Create new wallet
      const walletId = uuid();
      await query(
        `INSERT INTO operator_wallets (id, operator_id, balance, locked_amount, currency, status)
         VALUES ($1, $2, 0.00, 0.00, 'INR', 'ACTIVE')`,
        [walletId, operatorId]
      );

      result = await query(
        `SELECT id, operator_id, balance, locked_amount, currency, status
         FROM operator_wallets
         WHERE id = $1`,
        [walletId]
      );

      log.info({ operatorId, walletId }, 'Created new wallet');
    }

    const wallet = result.rows[0];
    return {
      walletId: wallet.id,
      operatorId: wallet.operator_id,
      balance: parseFloat(wallet.balance),
      lockedAmount: parseFloat(wallet.locked_amount),
      availableBalance: parseFloat(wallet.balance) - parseFloat(wallet.locked_amount),
      currency: wallet.currency,
      status: wallet.status,
    };
  } catch (error) {
    log.error({ error, operatorId }, 'Failed to get/create wallet');
    throw new Error('Failed to access wallet');
  }
}

/**
 * Add money to wallet (recharge)
 */
export async function creditWallet(
  operatorId: string,
  amount: number,
  description: string,
  referenceId?: string,
  transactionId?: string
): Promise<WalletTransaction> {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  try {
    const wallet = await getOrCreateWallet(operatorId);
    const txnId = uuid();
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;

    await query(
      `INSERT INTO wallet_transactions 
       (id, wallet_id, transaction_id, type, amount, balance_before, balance_after, description, reference_id)
       VALUES ($1, $2, $3, 'CREDIT', $4, $5, $6, $7, $8)`,
      [txnId, wallet.walletId, transactionId, amount, balanceBefore, balanceAfter, description, referenceId]
    );

    log.info({ operatorId, amount, balanceAfter }, 'Wallet credited');

    return {
      id: txnId,
      walletId: wallet.walletId,
      type: 'CREDIT',
      amount,
      balanceBefore,
      balanceAfter,
      description,
      referenceId,
      createdAt: new Date(),
    };
  } catch (error) {
    log.error({ error, operatorId, amount }, 'Failed to credit wallet');
    throw new Error('Failed to credit wallet');
  }
}

/**
 * Deduct money from wallet
 */
export async function debitWallet(
  operatorId: string,
  amount: number,
  description: string,
  referenceId?: string,
  transactionId?: string
): Promise<WalletTransaction> {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  try {
    const wallet = await getOrCreateWallet(operatorId);
    const availableBalance = wallet.balance - wallet.lockedAmount;

    if (availableBalance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    const txnId = uuid();
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - amount;

    await query(
      `INSERT INTO wallet_transactions 
       (id, wallet_id, transaction_id, type, amount, balance_before, balance_after, description, reference_id)
       VALUES ($1, $2, $3, 'DEBIT', $4, $5, $6, $7, $8)`,
      [txnId, wallet.walletId, transactionId, -amount, balanceBefore, balanceAfter, description, referenceId]
    );

    log.info({ operatorId, amount, balanceAfter }, 'Wallet debited');

    return {
      id: txnId,
      walletId: wallet.walletId,
      type: 'DEBIT',
      amount: -amount,
      balanceBefore,
      balanceAfter,
      description,
      referenceId,
      createdAt: new Date(),
    };
  } catch (error) {
    log.error({ error, operatorId, amount }, 'Failed to debit wallet');
    throw error;
  }
}

/**
 * Lock amount in wallet (reserve for pending charge)
 */
export async function lockAmount(
  operatorId: string,
  amount: number,
  description: string,
  referenceId?: string
): Promise<void> {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  try {
    const wallet = await getOrCreateWallet(operatorId);
    const availableBalance = wallet.balance - wallet.lockedAmount;

    if (availableBalance < amount) {
      throw new Error('Insufficient available balance to lock');
    }

    await query(
      `UPDATE operator_wallets
       SET locked_amount = locked_amount + $1, updated_at = NOW()
       WHERE operator_id = $2`,
      [amount, operatorId]
    );

    // Log the lock transaction
    await query(
      `INSERT INTO wallet_transactions 
       (id, wallet_id, type, amount, balance_before, balance_after, description, reference_id)
       VALUES ($1, $2, 'LOCK', $3, $4, $4, $5, $6)`,
      [uuid(), wallet.walletId, amount, wallet.balance, description, referenceId]
    );

    log.info({ operatorId, amount, referenceId }, 'Amount locked in wallet');
  } catch (error) {
    log.error({ error, operatorId, amount }, 'Failed to lock amount');
    throw error;
  }
}

/**
 * Unlock amount in wallet (release reservation)
 */
export async function unlockAmount(
  operatorId: string,
  amount: number,
  description: string,
  referenceId?: string
): Promise<void> {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  try {
    const wallet = await getOrCreateWallet(operatorId);

    await query(
      `UPDATE operator_wallets
       SET locked_amount = GREATEST(locked_amount - $1, 0), updated_at = NOW()
       WHERE operator_id = $2`,
      [amount, operatorId]
    );

    // Log the unlock transaction
    await query(
      `INSERT INTO wallet_transactions 
       (id, wallet_id, type, amount, balance_before, balance_after, description, reference_id)
       VALUES ($1, $2, 'UNLOCK', $3, $4, $4, $5, $6)`,
      [uuid(), wallet.walletId, -amount, wallet.balance, description, referenceId]
    );

    log.info({ operatorId, amount, referenceId }, 'Amount unlocked in wallet');
  } catch (error) {
    log.error({ error, operatorId, amount }, 'Failed to unlock amount');
    throw error;
  }
}

/**
 * Get wallet transaction history
 */
export async function getWalletTransactions(
  operatorId: string,
  limit: number = 50,
  offset: number = 0
): Promise<WalletTransaction[]> {
  try {
    const result = await query(
      `SELECT wt.id, wt.wallet_id, wt.type, wt.amount, wt.balance_before, wt.balance_after,
              wt.description, wt.reference_id, wt.created_at
       FROM wallet_transactions wt
       JOIN operator_wallets w ON w.id = wt.wallet_id
       WHERE w.operator_id = $1
       ORDER BY wt.created_at DESC
       LIMIT $2 OFFSET $3`,
      [operatorId, limit, offset]
    );

    return result.rows.map(row => ({
      id: row.id,
      walletId: row.wallet_id,
      type: row.type,
      amount: parseFloat(row.amount),
      balanceBefore: parseFloat(row.balance_before),
      balanceAfter: parseFloat(row.balance_after),
      description: row.description,
      referenceId: row.reference_id,
      createdAt: row.created_at,
    }));
  } catch (error) {
    log.error({ error, operatorId }, 'Failed to get wallet transactions');
    throw new Error('Failed to retrieve wallet history');
  }
}

/**
 * Check if wallet has sufficient balance
 */
export async function hasSufficientBalance(
  operatorId: string,
  requiredAmount: number
): Promise<boolean> {
  const wallet = await getOrCreateWallet(operatorId);
  const availableBalance = wallet.balance - wallet.lockedAmount;
  return availableBalance >= requiredAmount;
}

