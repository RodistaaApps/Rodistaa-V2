import {
  generateBookingId,
  generateShipmentId,
  generateBidId,
  generateUserId,
  generateTruckId,
  generatePodId,
  generateKycId,
  parseId,
  UserRole,
} from './index';

describe('ID Generators', () => {
  describe('generateBookingId', () => {
    it('should generate booking ID with correct format', () => {
      const id = generateBookingId();
      expect(id).toMatch(/^RID-\d{8}-\d{4}$/);
    });

    it('should use provided date', () => {
      const date = new Date('2025-12-02');
      const id = generateBookingId(date);
      expect(id).toContain('20251202');
    });
  });

  describe('generateShipmentId', () => {
    it('should generate shipment ID with correct format', () => {
      const id = generateShipmentId();
      expect(id).toMatch(/^SH-[A-Z0-9]{26}$/);
    });
  });

  describe('generateBidId', () => {
    it('should generate bid ID with correct format', () => {
      const id = generateBidId();
      expect(id).toMatch(/^BK-[A-Z0-9]{26}$/);
    });
  });

  describe('generateUserId', () => {
    it('should generate user ID with correct format', () => {
      const id = generateUserId(UserRole.OPERATOR);
      expect(id).toMatch(/^USR-OP-[A-Z0-9]{26}$/);
    });
  });

  describe('generateTruckId', () => {
    it('should generate truck ID with correct format', () => {
      const id = generateTruckId('MH-12-AB-1234');
      expect(id).toMatch(/^TRK-MH12AB1234-[A-Z0-9]{26}$/);
    });

    it('should sanitize registration number', () => {
      const id = generateTruckId('mh 12 ab 1234');
      expect(id).toMatch(/^TRK-MH12AB1234-[A-Z0-9]{26}$/);
    });
  });

  describe('generatePodId', () => {
    it('should generate POD ID with correct format', () => {
      const id = generatePodId();
      expect(id).toMatch(/^POD-[A-Z0-9]{26}$/);
    });
  });

  describe('generateKycId', () => {
    it('should generate KYC ID with correct format', () => {
      const id = generateKycId();
      expect(id).toMatch(/^KYC-[A-Z0-9]{26}$/);
    });
  });

  describe('parseId', () => {
    it('should parse booking ID', () => {
      const id = 'RID-20251202-0001';
      const parsed = parseId(id);
      expect(parsed.type).toBe('booking');
      expect(parsed.components.date).toBe('20251202');
      expect(parsed.components.sequence).toBe('0001');
    });

    it('should parse shipment ID', () => {
      const id = 'SH-01ARZ3NDEKTSV4RRFFQ69G5FAV';
      const parsed = parseId(id);
      expect(parsed.type).toBe('shipment');
      expect(parsed.components.ulid).toBe('01ARZ3NDEKTSV4RRFFQ69G5FAV');
    });

    it('should parse user ID', () => {
      const id = 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FAV';
      const parsed = parseId(id);
      expect(parsed.type).toBe('user');
      expect(parsed.components.role).toBe('OP');
    });
  });
});

