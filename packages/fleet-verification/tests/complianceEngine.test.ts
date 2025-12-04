/**
 * Compliance Engine Tests
 * Test compliance decision logic
 */

import { ComplianceEngine } from '../src/complianceEngine';
import { Pool } from 'pg';
import type { VahanResponse } from '../src/vahanClient';

// Mock database
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
  };
  return {
    Pool: jest.fn(() => mockPool),
  };
});

describe('ComplianceEngine', () => {
  let mockDb: any;
  let complianceEngine: ComplianceEngine;

  beforeEach(() => {
    mockDb = new Pool();
    complianceEngine = new ComplianceEngine(mockDb);
  });

  describe('checkCompliance', () => {
    it('should ALLOW valid TXL with BS6', async () => {
      const vahanResponse: VahanResponse = {
        success: true,
        provider: 'PARIVAHAN',
        txnId: 'TXN123',
        timestamp: new Date(),
        data: {
          rc_number: 'KA01AB1234',
          body_code: '7',
          body_type: 'OPEN BODY',
          maker: 'TA TA',
          model: '3521',
          gvw_kg: 35000,
          tyre_count: 12,
          axle_count: 4,
          emission_code: 'BS6',
          permit_type: 'GOODS',
          chassis_number: 'MAJ1234567890ABCD',
          engine_number: 'ENG1234567890',
        },
      };

      // Mock database queries
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // No duplicates
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '5' }] }); // Operator limit check
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // OEM lookup
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // Insert cache

      const result = await complianceEngine.checkCompliance({
        rcNumber: 'KA01AB1234',
        operatorId: 'OP001',
        vahanResponse,
      });

      expect(result.status).toBe('ALLOWED');
      expect(result.classification).toBe('TXL');
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

      // Mock duplicate found
      mockDb.query.mockResolvedValueOnce({
        rows: [{ rc_number: 'KA01AB1234', operator_id: 'OP002' }],
      });

      const result = await complianceEngine.checkCompliance({
        rcNumber: 'MH12CD5678',
        operatorId: 'OP001',
        vahanResponse,
      });

      expect(result.status).toBe('BLOCKED');
      expect(result.reasonCodes.some(code => code.includes('DUPLICATE_CHASSIS'))).toBe(true);
    });

    it('should BLOCK BS3 emission', async () => {
      const vahanResponse: VahanResponse = {
        success: true,
        provider: 'PARIVAHAN',
        txnId: 'TXN789',
        timestamp: new Date(),
        data: {
          rc_number: 'AP16UV2345',
          emission_code: 'BS3',
          chassis_number: 'MAJ9999999999OPQR',
          engine_number: 'ENG9999999999',
        },
      };

      mockDb.query.mockResolvedValueOnce({ rows: [] }); // No duplicates
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '3' }] }); // Operator limit
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // OEM lookup
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // Insert cache

      const result = await complianceEngine.checkCompliance({
        rcNumber: 'AP16UV2345',
        operatorId: 'OP001',
        vahanResponse,
      });

      expect(result.status).toBe('BLOCKED');
      expect(result.reasonCodes.some(code => code.includes('BLOCKED_EMISSION'))).toBe(true);
    });

    it('should BLOCK trailer without tractor', async () => {
      const vahanResponse: VahanResponse = {
        success: true,
        provider: 'PARIVAHAN',
        txnId: 'TXN999',
        timestamp: new Date(),
        data: {
          rc_number: 'TRL001',
          chassis_number: 'MAJ1111111111',
          engine_number: 'ENG1111111111',
        },
      };

      mockDb.query.mockResolvedValueOnce({ rows: [] }); // No duplicates
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '2' }] }); // Operator limit
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // OEM lookup
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // Insert cache

      const result = await complianceEngine.checkCompliance({
        rcNumber: 'TRL001',
        operatorId: 'OP001',
        vahanResponse,
        isTrailer: true,
        // No linkedTractorRc
      });

      expect(result.status).toBe('BLOCKED');
      expect(result.reasonCodes.includes('PENDING_TRACTOR_PAIRING')).toBe(true);
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

      mockDb.query.mockResolvedValueOnce({ rows: [] }); // No duplicates
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '5' }] }); // Operator limit
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // OEM lookup
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // Insert cache

      const result = await complianceEngine.checkCompliance({
        rcNumber: 'KA01AB1234',
        operatorId: 'OP001',
        vahanResponse,
        gpsLastPingAt: staleGPSDate,
      });

      expect(result.status).toBe('BLOCKED');
      expect(result.reasonCodes.some(code => code.includes('GPS_STALE'))).toBe(true);
    });
  });
});

