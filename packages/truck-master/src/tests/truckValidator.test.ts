/**
 * Truck Validator Tests
 */

import { validateTruckInput, computeFlags } from '../services/truckValidator';
import { TruckCreateDTO, VahanSnapshot } from '../models/truckDimensions';

describe('truckValidator', () => {
  describe('validateTruckInput', () => {
    it('should reject invalid tyre_count', () => {
      const dto: TruckCreateDTO = {
        operator_id: 'OP001',
        rc_number: 'MH12AB1234',
        tyre_count: 8 as any, // Invalid
        body_length_ft: 20,
        body_type: 'OPEN',
        rc_copy: Buffer.from('test'),
      };

      const result = validateTruckInput(dto);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('tyre_count'));
      expect(result.flags.some(f => f.flag_code === 'UNRECOGNIZED_TYRE_COUNT')).toBe(true);
    });

    it('should reject invalid body_length_ft', () => {
      const dto: TruckCreateDTO = {
        operator_id: 'OP001',
        rc_number: 'MH12AB1234',
        tyre_count: 6,
        body_length_ft: 25, // Not in allowed list
        body_type: 'OPEN',
        rc_copy: Buffer.from('test'),
      };

      const result = validateTruckInput(dto);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('body_length_ft'));
    });

    it('should reject invalid body_type', () => {
      const dto: TruckCreateDTO = {
        operator_id: 'OP001',
        rc_number: 'MH12AB1234',
        tyre_count: 6,
        body_length_ft: 16,
        body_type: 'INVALID' as any,
        rc_copy: Buffer.from('test'),
      };

      const result = validateTruckInput(dto);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('body_type'));
    });

    it('should accept valid input', () => {
      const dto: TruckCreateDTO = {
        operator_id: 'OP001',
        rc_number: 'MH12AB1234',
        tyre_count: 6,
        body_length_ft: 16,
        body_type: 'OPEN',
        rc_copy: Buffer.from('test'),
      };

      const result = validateTruckInput(dto);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('computeFlags', () => {
    it('should return LENGTH_MISMATCH_WARNING for 6-tyre + 24ft', async () => {
      const dto: TruckCreateDTO = {
        operator_id: 'OP001',
        rc_number: 'MH12AB1234',
        tyre_count: 6,
        body_length_ft: 24, // Outside typical range (12-18)
        body_type: 'OPEN',
        rc_copy: Buffer.from('test'),
      };

      const flags = await computeFlags(dto);
      expect(flags.some(f => f.flag_code === 'LENGTH_MISMATCH_WARNING')).toBe(true);
    });

    it('should return REQUIRES_PHOTO_VERIFICATION when length mismatch', async () => {
      const dto: TruckCreateDTO = {
        operator_id: 'OP001',
        rc_number: 'MH12AB1234',
        tyre_count: 6,
        body_length_ft: 24,
        body_type: 'OPEN',
        rc_copy: Buffer.from('test'),
      };

      const flags = await computeFlags(dto);
      expect(flags.some(f => f.flag_code === 'REQUIRES_PHOTO_VERIFICATION')).toBe(true);
    });

    it('should not flag valid configuration', async () => {
      const dto: TruckCreateDTO = {
        operator_id: 'OP001',
        rc_number: 'MH12AB1234',
        tyre_count: 6,
        body_length_ft: 16, // Within typical range
        body_type: 'OPEN',
        rc_copy: Buffer.from('test'),
      };

      const flags = await computeFlags(dto);
      expect(flags.some(f => f.flag_code === 'LENGTH_MISMATCH_WARNING')).toBe(false);
    });

    it('should flag VAHAN_DISCREPANCY when body type mismatches', async () => {
      const dto: TruckCreateDTO = {
        operator_id: 'OP001',
        rc_number: 'MH12AB1234',
        tyre_count: 6,
        body_length_ft: 16,
        body_type: 'OPEN',
        rc_copy: Buffer.from('test'),
      };

      const vahan: VahanSnapshot = {
        provider: 'PARIVAHAN',
        txn_id: 'TXN123',
        raw_json: {},
        fetched_at: new Date(),
        body_type_name: 'TIPPER', // Blocked type
      };

      const flags = await computeFlags(dto, vahan);
      expect(flags.some(f => f.flag_code === 'VAHAN_DISCREPANCY')).toBe(true);
    });
  });
});

