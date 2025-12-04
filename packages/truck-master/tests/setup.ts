/**
 * Test Setup
 * Global test configuration
 */

// Mock environment variables
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'test-encryption-key-32-bytes-long!!';
process.env.VAHAN_PARIVAHAN_API_KEY = process.env.VAHAN_PARIVAHAN_API_KEY || 'test-key';
process.env.VAHAN_SUREPASS_API_KEY = process.env.VAHAN_SUREPASS_API_KEY || 'test-key';
process.env.VAHAN_BACKUP_API_KEY = process.env.VAHAN_BACKUP_API_KEY || 'test-key';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

// Set test timeout
jest.setTimeout(30000);

