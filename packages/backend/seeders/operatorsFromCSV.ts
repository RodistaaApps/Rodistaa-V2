/**
 * Operators CSV Seeder
 * 
 * Seeds operator data from CSV file (operators.csv)
 * Expected format: id,name,mobile,email,city,state,region,franchise
 * 
 * Usage:
 *   npm run seed:operators -- --file=/path/to/operators.csv
 *   npm run seed:operators --mock  (use mock data)
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Pool } from 'pg';

const pool: Pool | null = null; // TODO: Import actual DB connection

interface OperatorCSVRow {
  id?: string;
  name: string;
  mobile: string;
  email?: string;
  city: string;
  state: string;
  region: string;
  franchise?: string;
  trust_score?: number;
}

/**
 * Parse CSV file
 */
const parseCSV = (filepath: string): OperatorCSVRow[] => {
  try {
    const fileContent = fs.readFileSync(filepath, 'utf-8');
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`[SEEDER] Parsed ${records.length} operators from CSV`);
    return records;
  } catch (error: any) {
    console.error('[SEEDER] Failed to parse CSV:', error);
    throw error;
  }
};

/**
 * Generate mock operator data (fallback if no CSV provided)
 */
const generateMockOperators = (): OperatorCSVRow[] => {
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const states = {
    North: ['Delhi', 'Haryana', 'Punjab', 'Uttar Pradesh'],
    South: ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu'],
    East: ['West Bengal', 'Odisha', 'Bihar'],
    West: ['Maharashtra', 'Gujarat', 'Rajasthan'],
    Central: ['Madhya Pradesh', 'Chhattisgarh'],
  };

  const operators: OperatorCSVRow[] = [];

  regions.forEach((region, regionIdx) => {
    const regionStates = states[region as keyof typeof states];
    
    regionStates.forEach((state, stateIdx) => {
      // Generate 2-3 operators per state
      for (let i = 0; i < 3; i++) {
        const opNum = (regionIdx * 100) + (stateIdx * 10) + i + 1;
        operators.push({
          id: `OP-${opNum.toString().padStart(5, '0')}`,
          name: `${state} Transport ${i + 1}`,
          mobile: `+919${opNum.toString().padStart(9, '0')}`,
          email: `operator${opNum}@example.com`,
          city: state === 'Delhi' ? 'New Delhi' : state.split(' ')[0],
          state,
          region,
          franchise: `${state} - Unit ${i + 1}`,
          trust_score: 70 + Math.floor(Math.random() * 30), // 70-100
        });
      }
    });
  });

  console.log(`[SEEDER] Generated ${operators.length} mock operators`);
  return operators;
};

/**
 * Seed operators into database
 */
export const seedOperators = async (operators: OperatorCSVRow[]): Promise<{
  inserted: number;
  skipped: number;
  errors: any[];
}> => {
  const results = {
    inserted: 0,
    skipped: 0,
    errors: [] as any[],
  };

  try {
    if (!pool) {
      console.log('[SEEDER - STUB] Would insert', operators.length, 'operators');
      return {
        inserted: operators.length,
        skipped: 0,
        errors: [],
      };
    }

    for (const op of operators) {
      try {
        // Generate ID if not provided
        const operatorId = op.id || `OP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Insert operator
        const query = `
          INSERT INTO users (
            id, role, name, mobile, email, city, state, franchise, 
            kyc_status, trust_score, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
          ON CONFLICT (id) DO NOTHING
        `;

        const values = [
          operatorId,
          'operator',
          op.name,
          op.mobile,
          op.email || null,
          op.city,
          op.state,
          op.franchise || `${op.city} - Default`,
          'pending', // KYC status
          op.trust_score || 75,
        ];

        const result = await pool.query(query, values);
        
        if (result.rowCount && result.rowCount > 0) {
          results.inserted++;
        } else {
          results.skipped++;
        }

        // Create regional assignment
        if (op.region) {
          await pool.query(
            `INSERT INTO regional_assignments (user_id, region) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [operatorId, op.region]
          );
        }

      } catch (error: any) {
        results.errors.push({
          operator: op.name,
          error: error.message,
        });
      }
    }

    console.log(`[SEEDER] Results: ${results.inserted} inserted, ${results.skipped} skipped, ${results.errors.length} errors`);
    return results;

  } catch (error: any) {
    console.error('[SEEDER] Seed operators failed:', error);
    throw error;
  }
};

/**
 * Main seeder function
 */
export const run = async (options: { csvPath?: string; useMock?: boolean } = {}) => {
  console.log('[SEEDER] Starting operator seeding...');

  let operators: OperatorCSVRow[];

  if (options.csvPath) {
    // Load from CSV file
    const filepath = path.resolve(options.csvPath);
    
    if (!fs.existsSync(filepath)) {
      throw new Error(`CSV file not found: ${filepath}`);
    }

    operators = parseCSV(filepath);
  } else if (options.useMock) {
    // Generate mock data
    operators = generateMockOperators();
  } else {
    // Try default location
    const defaultPath = path.join(__dirname, '../../../data/operators.csv');
    
    if (fs.existsSync(defaultPath)) {
      operators = parseCSV(defaultPath);
    } else {
      console.warn('[SEEDER] No CSV file provided and default not found. Using mock data.');
      operators = generateMockOperators();
    }
  }

  const results = await seedOperators(operators);

  console.log('[SEEDER] ====================================');
  console.log(`[SEEDER] Total Operators: ${operators.length}`);
  console.log(`[SEEDER] Inserted: ${results.inserted}`);
  console.log(`[SEEDER] Skipped (duplicates): ${results.skipped}`);
  console.log(`[SEEDER] Errors: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('[SEEDER] Errors:', JSON.stringify(results.errors, null, 2));
  }

  console.log('[SEEDER] ====================================');

  return results;
};

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const csvPath = args.find(arg => arg.startsWith('--file='))?.split('=')[1];
  const useMock = args.includes('--mock');

  run({ csvPath, useMock })
    .then(() => {
      console.log('[SEEDER] Seeding complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('[SEEDER] Seeding failed:', error);
      process.exit(1);
    });
}

export default {
  run,
  seedOperators,
  parseCSV,
  generateMockOperators,
};

