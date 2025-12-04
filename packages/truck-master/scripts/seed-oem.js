/**
 * Seed OEM Model Data
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function seedOEM() {
  const client = await pool.connect();
  
  try {
    // Read seed file
    const seedPath = path.join(__dirname, '../data/oem_model_bodylength_seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    // Execute seed
    await client.query(seedSQL);
    
    console.log('✅ OEM seed data inserted successfully');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedOEM().catch(console.error);

