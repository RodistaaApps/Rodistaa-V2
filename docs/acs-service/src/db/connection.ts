import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  max: 20,
});

/**
 * Execute a database query with proper connection management
 * 
 * @param text - SQL query text
 * @param params - Query parameters
 * @returns Query result
 */
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

export default pool;

