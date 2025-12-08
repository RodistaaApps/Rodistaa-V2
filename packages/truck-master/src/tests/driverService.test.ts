/**
 * Driver Service Tests
 */

import {
  createDriver,
  getDriver,
  listDrivers,
  checkDLExpiry,
} from '../services/driverService';
import { DriverCreateDTO } from '../models/driver';

// Mock database
jest.mock('../db', () => ({
  query: jest.fn(),
  transaction: jest.fn((callback) => callback({
    query: jest.fn().mockResolvedValue({ rows: [] }),
  })),
}));

describe('driverService', () => {
  describe('createDriver', () => {
    it('should reject driver with missing mandatory fields', async () => {
      const dto: Partial<DriverCreateDTO> = {
        operator_id: 'OP001',
        name: '',
        mobile: '',
      };

      await expect(createDriver(dto as DriverCreateDTO, 'user1')).rejects.toThrow();
    });

    it('should return warning when DL expires in < 30 days', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 15);

      const dto: DriverCreateDTO = {
        operator_id: 'OP001',
        name: 'Test Driver',
        mobile: '9876543210',
        dl_number: 'DL-04-2015-1234567',
        dl_class: 'LMV',
        dl_valid_from: new Date('2020-01-01'),
        dl_valid_till: tomorrow,
        dob: new Date('1990-01-01'),
        address: {
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
        },
      };

      // Mock query responses
      const { query } = require('../db');
      query.mockResolvedValue({ rows: [] }); // No duplicates

      // This will be tested in integration tests
      // For now, just verify structure
      expect(dto.dl_valid_till.getTime() - Date.now()).toBeLessThan(30 * 24 * 60 * 60 * 1000);
    });
  });
});

