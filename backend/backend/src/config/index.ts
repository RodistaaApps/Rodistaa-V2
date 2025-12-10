/**
 * Backend Configuration
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Database
  db: {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'rodistaa',
    password: process.env.PGPASSWORD || 'rodistaa_dev',
    database: process.env.PGDATABASE || 'rodistaa_local',
  },
  
  // Security
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  
  // ACS
  acs: {
    enabled: process.env.ACS_ENABLED !== 'false',
  },
  
  // Adapters
  adapterMode: process.env.ADAPTER_MODE || 'mock',
};

