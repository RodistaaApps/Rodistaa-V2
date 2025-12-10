/**
 * Ledger Repository
 * Database operations for ledger transactions with atomic operations
 */

import { query } from '../../db/connection';
import logger from 'pino';
import pool from '../../db/connection';
import { generateLedgerId } from '@rodistaa/app-shared';

const log = logger({ name: 'ledger-repository' });

export interface LedgerEntry {
  id: string;
  operatorId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  balanceAfter: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
  createdAt: string;
}

export interface CreateLedgerEntryInput {
  operatorId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
}

/**
 * Get current balance for an operator (requires transaction)
 */
export async function getBalance(operatorId: string, client?: any): Promise<number> {
  try {
    let result;
    if (client) {
      // Use transaction client
      result = await client.query(
        `SELECT balance_after 
         FROM ledgers 
         WHERE operator_id = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [operatorId]
      );
    } else {
      // Use regular query
      result = await query(
        `SELECT balance_after 
         FROM ledgers 
         WHERE operator_id = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [operatorId]
      );
    }

    if (result.rows.length === 0) {
      return 0;
    }

    return parseFloat(result.rows[0].balance_after);
  } catch (error: any) {
    log.error({ error, operatorId }, 'Failed to get balance');
    throw error;
  }
}

/**
 * Create ledger entry within a transaction
 * Returns the new balance after the transaction
 */
export async function createLedgerEntry(
  input: CreateLedgerEntryInput,
  client?: any
): Promise<LedgerEntry> {
  const entryId = generateLedgerId();

  try {
    // Get current balance
    const currentBalance = await getBalance(input.operatorId, client);

    // Calculate new balance
    const newBalance = input.type === 'CREDIT'
      ? currentBalance + input.amount
      : currentBalance - input.amount;

    // Validate balance (prevent negative)
    if (newBalance < 0 && input.type === 'DEBIT') {
      throw new Error(`Insufficient balance. Current: ${currentBalance}, Required: ${input.amount}`);
    }

    // Insert ledger entry
    let result;
    if (client) {
      result = await client.query(
        `INSERT INTO ledgers (
          id, operator_id, type, amount, balance_after,
          description, reference_type, reference_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING *`,
        [
          entryId,
          input.operatorId,
          input.type,
          input.amount,
          newBalance,
          input.description,
          input.referenceType || null,
          input.referenceId || null,
        ]
      );
    } else {
      result = await query(
        `INSERT INTO ledgers (
          id, operator_id, type, amount, balance_after,
          description, reference_type, reference_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING *`,
        [
          entryId,
          input.operatorId,
          input.type,
          input.amount,
          newBalance,
          input.description,
          input.referenceType || null,
          input.referenceId || null,
        ]
      );
    }

    return mapRowToLedgerEntry(result.rows[0]);
  } catch (error: any) {
    log.error({ error, operatorId: input.operatorId }, 'Failed to create ledger entry');
    throw error;
  }
}

/**
 * Create multiple ledger entries atomically (all or nothing)
 */
export async function createLedgerEntriesAtomically(
  entries: CreateLedgerEntryInput[]
): Promise<LedgerEntry[]> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const results: LedgerEntry[] = [];

    for (const entry of entries) {
      const result = await createLedgerEntry(entry, client);
      results.push(result);
    }

    await client.query('COMMIT');
    return results;
  } catch (error: any) {
    await client.query('ROLLBACK');
    log.error({ error }, 'Failed to create ledger entries atomically, rolled back');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Transfer funds between two operators atomically
 */
export async function transferFunds(
  fromOperatorId: string,
  toOperatorId: string,
  amount: number,
  description: string,
  referenceType?: string,
  referenceId?: string
): Promise<{ debit: LedgerEntry; credit: LedgerEntry }> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Debit from source
    const debit = await createLedgerEntry({
      operatorId: fromOperatorId,
      type: 'DEBIT',
      amount,
      description: `Transfer to ${toOperatorId}: ${description}`,
      referenceType,
      referenceId,
    }, client);

    // Credit to destination
    const credit = await createLedgerEntry({
      operatorId: toOperatorId,
      type: 'CREDIT',
      amount,
      description: `Transfer from ${fromOperatorId}: ${description}`,
      referenceType,
      referenceId,
    }, client);

    await client.query('COMMIT');

    return { debit, credit };
  } catch (error: any) {
    await client.query('ROLLBACK');
    log.error({ error, fromOperatorId, toOperatorId, amount }, 'Fund transfer failed, rolled back');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * List ledger entries for an operator
 */
export async function listLedgerEntries(filters: {
  operatorId: string;
  type?: 'CREDIT' | 'DEBIT';
  page?: number;
  limit?: number;
}): Promise<{ data: LedgerEntry[]; total: number }> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  try {
    const conditions: string[] = ['operator_id = $1'];
    const params: any[] = [filters.operatorId];
    let paramIndex = 2;

    if (filters.type) {
      conditions.push(`type = $${paramIndex++}`);
      params.push(filters.type);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM ledgers ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.total || '0', 10);

    // Get ledger entries
    params.push(limit, offset);
    const result = await query(
      `SELECT * FROM ledgers 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      params
    );

    const entries = result.rows.map(mapRowToLedgerEntry);

    return { data: entries, total };
  } catch (error: any) {
    log.error({ error, filters }, 'Failed to list ledger entries');
    throw error;
  }
}

/**
 * Map database row to LedgerEntry object
 */
function mapRowToLedgerEntry(row: any): LedgerEntry {
  return {
    id: row.id,
    operatorId: row.operator_id,
    type: row.type,
    amount: parseFloat(row.amount),
    balanceAfter: parseFloat(row.balance_after),
    description: row.description,
    referenceType: row.reference_type || undefined,
    referenceId: row.reference_id || undefined,
    createdAt: row.created_at.toISOString(),
  };
}

