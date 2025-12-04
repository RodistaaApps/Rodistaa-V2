/**
 * Compliance Engine Tests
 * Test compliance decision logic
 */

import { checkCompliance } from '../src/services/complianceEngine';
import type { VahanResponse } from '../src/services/vahanClient';

// Mock database
jest.mock('../src/db', () => ({
  query: jest.fn(),
  transaction: jest.fn((callback) => callback({ query: jest.fn() })),
}));

// Mock VAHAN client
jest.mock('../src/services/vahanClient', () => ({
  VahanClient: jest.fn(),
}));

describe('ComplianceEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkCompliance', () => {
    it('should ALLOW valid TXL with BS6 and blank permit', async () => {
      const vahanResponse: VahanResponse = {
        success: true,
        provider: 'PARIVAHAN',
        txnId: 'TXN123',
        timestamp: new Date(),
        data: {
          rc_number: 'KA01AB1234',
          body_type_code: '7',
          body_type_name: 'OPEN BODY',
          maker: 'TA TA',
          model_name: '3521',
          gvw_kg: 35000,
          vehicle_category: 'GOODS',
          chassis_number: 'MAJ1234567890ABCD',
          engine_number: 'ENG1234567890',
          permit_type: 'GOODS',
          permit_valid_upto: '', // Blank permit
        },
      };

      const { query } = require('../src/db');
      query.mockResolvedValueOnce({ rows: [] }); // No duplicates
      query.mockResolvedValueOnce({ rows: [{ count: '5' }] }); // Operator limit
      query.mockResolvedValueOnce({ rows: [] }); // OEM lookup
      query.mockResolvedValueOnce({ rows: [] }); // Insert cache

      const result = await checkCompliance({
        rc_number: 'KA01AB1234',
        operator_id: 'OP001',
        vahan_response: vahanResponse,
      });

      expect(result.allow).toBe(true);
    });

    it('should BLOCK duplicate chassis', async () => {
      const vahanResponse: VahanResponse = {
        success: true,
        provider: 'SUREPASS',
        txnId: 'TXN456',
        timestamp: new Date(),
        data: {
          rc_number: 'MH12CD5678',
          chassis_number: 'MAJ1234567890ABCD', // Duplicate
          engine_number: 'ENG9876543210',
        },
      };

      const { query } = require('../src/db');
      query.mockResolvedValueOnce({
        rows: [{ rc_number: 'KA01AB1234', operator_id: 'OP002' }],
      }); // Duplicate found

      const result = await checkCompliance({
        rc_number: 'MH12CD5678',
        operator_id: 'OP001',
        vahan_response: vahanResponse,
      });

      expect(result.allow).toBe(false);
      expect(result.reasons.some(r => r.includes('DUPLICATE_CHASSIS'))).toBe(true);
    });

    it('should BLOCK trailer without tractor', async () => {
      const vahanResponse: VahanResponse = {
        success: true,
        provider: 'PARIVAHAN',
        txnId: 'TXN789',
        timestamp: new Date(),
        data: {
          rc_number: 'TRL001',
          chassis_number: 'MAJ1111111111',
          engine_number: 'ENG1111111111',
        },
      };

      const { query } = require('../src/db');
      query.mockResolvedValueOnce({ rows: [] }); // No duplicates
      query.mockResolvedValueOnce({ rows: [{ count: '2' }] }); // Operator limit
      query.mockResolvedValueOnce({ rows: [] }); // OEM lookup
      query.mockResolvedValueOnce({ rows: [] }); // Insert cache

      const result = await checkCompliance({
        rc_number: 'TRL001',
        operator_id: 'OP001',
        vahan_response: vahanResponse,
        is_trailer: true,
        // No linked_tractor_rc
      });

      expect(result.allow).toBe(false);
      expect(result.reasons.includes('PENDING_TRACTOR_PAIRING')).toBe(true);
    });

    it('should BLOCK GPS stale (>60 minutes)', async () => {
      const vahanResponse: VahanResponse = {
        success: true,
        provider: 'PARIVAHAN',
        txnId: 'TXN888',
        timestamp: new Date(),
        data: {
          rc_number: 'KA01AB1234',
          chassis_number: 'MAJ1234567890ABCD',
          engine_number: 'ENG1234567890',
        },
      };

      const staleGPSDate = new Date(Date.now() - 61 * 60 * 1000); // 61 minutes ago

      const { query } = require('../src/db');
      query.mockResolvedValueOnce({ rows: [] }); // No duplicates
      query.mockResolvedValueOnce({ rows: [{ count: '5' }] }); // Operator limit
      query.mockResolvedValueOnce({ rows: [] }); // OEM lookup
      query.mockResolvedValueOnce({ rows: [] }); // Insert cache

      const result = await checkCompliance({
        rc_number: 'KA01AB1234',
        operator_id: 'OP001',
        vahan_response: vahanResponse,
        gps_last_ping_at: staleGPSDate,
      });

      expect(result.allow).toBe(false);
      expect(result.reasons.some(r => r.includes('GPS_STALE'))).toBe(true);
    });

    it('should ALLOW blank permit with other checks valid', async () => {
      const vahanResponse: VahanResponse = {
        success: true,
        provider: 'PARIVAHAN',
        txnId: 'TXN999',
        timestamp: new Date(),
        data: {
          rc_number: 'TN09EF9012',
          body_type_name: 'FLATBED',
          vehicle_category: 'GOODS',
          chassis_number: 'MAJ5555555555IJKL',
          engine_number: 'ENG5555555555',
          permit_type: 'GOODS',
          permit_valid_upto: '', // Blank permit
        },
      };

      const { query } = require('../src/db');
      query.mockResolvedValueOnce({ rows: [] }); // No duplicates
      query.mockResolvedValueOnce({ rows: [{ count: '3' }] }); // Operator limit
      query.mockResolvedValueOnce({ rows: [] }); // OEM lookup
      query.mockResolvedValueOnce({ rows: [] }); // Insert cache

      const result = await checkCompliance({
        rc_number: 'TN09EF9012',
        operator_id: 'OP001',
        vahan_response: vahanResponse,
      });

      // Should allow blank permit
      expect(result.allow).toBe(true);
    });
  });
});

