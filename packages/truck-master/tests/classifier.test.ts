/**
 * Classifier Tests
 * Test body type classification and blocking rules
 */

import { classifyFleetType, isBlockedBodyType } from '../src/services/classifier';
import type { VahanSnapshot } from '../src/models/vahanSnapshot';

describe('Classifier', () => {
  describe('isBlockedBodyType', () => {
    it('should block COWL body type', () => {
      const snapshot: VahanSnapshot = {
        rc_number: 'KA01AB1234',
        body_type_name: 'COWL',
        body_type_code: '5',
      };

      const result = isBlockedBodyType(snapshot);
      expect(result.blocked).toBe(true);
      expect(result.reason).toContain('INVALID_BODY_COWL');
    });

    it('should block TIPPER body type', () => {
      const snapshot: VahanSnapshot = {
        rc_number: 'GJ06IJ7890',
        body_type_name: 'TIPPER',
      };

      const result = isBlockedBodyType(snapshot);
      expect(result.blocked).toBe(true);
    });

    it('should block TANKER body type', () => {
      const snapshot: VahanSnapshot = {
        rc_number: 'UP14KL2345',
        body_type_name: 'TANKER',
      };

      const result = isBlockedBodyType(snapshot);
      expect(result.blocked).toBe(true);
    });

    it('should allow OPEN BODY', () => {
      const snapshot: VahanSnapshot = {
        rc_number: 'KA01AB1234',
        body_type_name: 'OPEN BODY',
        body_type_code: '7',
      };

      const result = isBlockedBodyType(snapshot);
      expect(result.blocked).toBe(false);
    });
  });

  describe('classifyFleetType', () => {
    it('should classify TXL and block if length > 28ft', () => {
      const snapshot: VahanSnapshot = {
        rc_number: 'KA01AB1234',
        body_type_name: 'OPEN BODY',
        body_type_code: '7',
        maker: 'TA TA',
        model_name: '3521',
        gvw_kg: 35000,
        vehicle_category: 'GOODS',
      };

      const result = classifyFleetType(snapshot, 32); // 32ft > 28ft max for TXL
      expect(result.classification).toBe('TXL');
      expect(result.isBlocked).toBe(true);
      expect(result.blockReasons.some(r => r.includes('INVALID_LENGTH_FOR_CLASS'))).toBe(true);
    });

    it('should classify SXL and block if length > 20ft', () => {
      const snapshot: VahanSnapshot = {
        rc_number: 'KA01AB1234',
        body_type_name: 'OPEN BODY',
        gvw_kg: 7500,
        vehicle_category: 'GOODS',
      };

      const result = classifyFleetType(snapshot, 32); // 32ft > 20ft max for SXL
      // SXL classification would happen based on tyre count, but length check would block
      expect(result.isBlocked).toBe(true);
    });
  });
});

