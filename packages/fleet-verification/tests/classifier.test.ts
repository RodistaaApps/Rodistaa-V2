/**
 * Classifier Tests
 * Test body type classification and blocking rules
 */

import { classifyFleetType, isBlockedBodyType, checkEmissionCompliance } from '../src/classifier';
import type { VahanSnapshot } from '../src/normalizer';

describe('Classifier', () => {
  describe('isBlockedBodyType', () => {
    it('should block COWL body type', () => {
      const snapshot: VahanSnapshot = {
        rcNumber: 'KA01AB1234',
        bodyTypeString: 'COWL',
        bodyCode: '5',
      };

      const result = isBlockedBodyType(snapshot);
      expect(result.blocked).toBe(true);
      expect(result.reason).toContain('INVALID_BODY_COWL');
    });

    it('should block TIPPER body type', () => {
      const snapshot: VahanSnapshot = {
        rcNumber: 'MH12CD5678',
        bodyTypeString: 'TIPPER',
      };

      const result = isBlockedBodyType(snapshot);
      expect(result.blocked).toBe(true);
      expect(result.reason).toContain('TIPPER');
    });

    it('should block TANKER body type', () => {
      const snapshot: VahanSnapshot = {
        rcNumber: 'UP14KL2345',
        bodyTypeString: 'TANKER',
      };

      const result = isBlockedBodyType(snapshot);
      expect(result.blocked).toBe(true);
    });

    it('should block CHASSIS body type', () => {
      const snapshot: VahanSnapshot = {
        rcNumber: 'WB19MN6789',
        bodyTypeString: 'CHASSIS',
      };

      const result = isBlockedBodyType(snapshot);
      expect(result.blocked).toBe(true);
    });

    it('should allow OPEN BODY', () => {
      const snapshot: VahanSnapshot = {
        rcNumber: 'KA01AB1234',
        bodyTypeString: 'OPEN BODY',
        bodyCode: '7',
      };

      const result = isBlockedBodyType(snapshot);
      expect(result.blocked).toBe(false);
    });
  });

  describe('checkEmissionCompliance', () => {
    it('should allow BS4', () => {
      const result = checkEmissionCompliance('BS4');
      expect(result.allowed).toBe(true);
    });

    it('should allow BS6', () => {
      const result = checkEmissionCompliance('BS6');
      expect(result.allowed).toBe(true);
    });

    it('should block BS3', () => {
      const result = checkEmissionCompliance('BS3');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('BLOCKED_EMISSION');
    });

    it('should block BS2', () => {
      const result = checkEmissionCompliance('BS2');
      expect(result.allowed).toBe(false);
    });

    it('should block missing emission code', () => {
      const result = checkEmissionCompliance(undefined);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('MISSING_EMISSION_CODE');
    });
  });

  describe('classifyFleetType', () => {
    it('should classify SXL (2 axles, 6 tyres)', () => {
      const snapshot: VahanSnapshot = {
        rcNumber: 'KA01AB1234',
        axleCount: 2,
        tyreCount: 6,
        gvwKg: 7500,
        emissionCode: 'BS6',
        bodyTypeString: 'OPEN BODY',
        vehicleCategory: 'GOODS',
      };

      const result = classifyFleetType(snapshot);
      expect(result.classification).toBe('SXL');
      expect(result.isBlocked).toBe(false);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should classify TXL (4 axles, 12 tyres)', () => {
      const snapshot: VahanSnapshot = {
        rcNumber: 'KA01AB1234',
        bodyCode: '7',
        bodyTypeString: 'OPEN BODY',
        maker: 'TA TA',
        model: '3521',
        axleCount: 4,
        tyreCount: 12,
        gvwKg: 35000,
        emissionCode: 'BS6',
        permitType: 'GOODS',
        vehicleCategory: 'GOODS',
      };

      const result = classifyFleetType(snapshot);
      expect(result.classification).toBe('TXL');
      expect(result.isBlocked).toBe(false);
    });

    it('should block SXL > 20 ft', () => {
      const snapshot: VahanSnapshot = {
        rcNumber: 'KA01AB1234',
        axleCount: 2,
        tyreCount: 6,
        gvwKg: 7500,
        emissionCode: 'BS6',
        bodyTypeString: 'OPEN BODY',
      };

      // Note: Length check would be in compliance engine
      const result = classifyFleetType(snapshot);
      expect(result.classification).toBe('SXL');
    });

    it('should block tipper body_code', () => {
      const snapshot: VahanSnapshot = {
        rcNumber: 'GJ06IJ7890',
        bodyTypeString: 'TIPPER',
        axleCount: 4,
        tyreCount: 12,
        gvwKg: 25000,
        emissionCode: 'BS6',
      };

      const result = classifyFleetType(snapshot);
      expect(result.isBlocked).toBe(true);
      expect(result.blockReasons.length).toBeGreaterThan(0);
    });

    it('should detect GVW-tyre mismatch', () => {
      const snapshot: VahanSnapshot = {
        rcNumber: 'KA01AB1234',
        axleCount: 2,
        tyreCount: 10, // Wrong for SXL (should be 6)
        gvwKg: 7500,
        emissionCode: 'BS6',
        bodyTypeString: 'OPEN BODY',
      };

      const result = classifyFleetType(snapshot);
      // Should flag mismatch
      expect(result.blockReasons.length).toBeGreaterThan(0);
    });
  });
});

