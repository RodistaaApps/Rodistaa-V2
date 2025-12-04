/**
 * Database Connection Pool and Query Helpers
 */

import { Pool, PoolClient, QueryResult } from 'pg';

let pool: Pool | null = null;

/**
 * Initialize database connection pool
 */
export function initDb(connectionString: string): Pool {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
  });

  return pool;
}

/**
 * Get database pool
 */
export function getDb(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return pool;
}

/**
 * Execute query with error handling
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const db = getDb();
  try {
    return await db.query<T>(text, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const db = getDb();
  const client = await db.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close database pool
 */
export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

