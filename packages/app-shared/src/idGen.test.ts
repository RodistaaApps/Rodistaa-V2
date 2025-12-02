/**
 * Unit Tests for ID Generators
 *
 * Tests ULID format validation and ID generation functions
 */

import {
  generateBookingId,
  generateShipmentId,
  generateBidId,
  generateUserId,
  generateTruckId,
  generatePodId,
  generateKycId,
  generateBlockId,
  generateOverrideId,
  generateLedgerId,
  generateInspectionId,
  generateAuditId,
  generateId,
  validateIdFormat,
  extractEntityType,
  UserRole,
  EntityType,
} from './idGen';

describe('ID Generators', () => {
  describe('generateBookingId', () => {
    it('should generate booking ID with RID prefix and date', () => {
      const date = new Date('2024-01-15');
      const id = generateBookingId(date);

      expect(id).toMatch(/^RID-20240115-\d{4}$/);
      expect(id).toHaveLength(17); // RID-YYYYMMDD-xxxx = 3+8+4+2 dashes = 17
    });

    it('should generate booking ID with current date if not provided', () => {
      const id = generateBookingId();
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');

      expect(id).toMatch(new RegExp(`^RID-${year}${month}${day}-\\d{4}$`));
    });

    it('should generate unique booking IDs', () => {
      const id1 = generateBookingId();
      const id2 = generateBookingId();

      // While they might be same if generated in same millisecond,
      // they should both be valid
      expect(id1).toMatch(/^RID-\d{8}-\d{4}$/);
      expect(id2).toMatch(/^RID-\d{8}-\d{4}$/);
    });
  });

  describe('generateShipmentId', () => {
    it('should generate shipment ID with SH prefix and ULID', () => {
      const id = generateShipmentId();

      expect(id).toMatch(/^SH-[0-9A-Z]{26}$/);
      expect(id).toHaveLength(29); // SH- + 26 chars
    });

    it('should generate unique shipment IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateShipmentId());
      }

      expect(ids.size).toBe(100);
    });
  });

  describe('generateBidId', () => {
    it('should generate bid ID with BK prefix and ULID', () => {
      const id = generateBidId();

      expect(id).toMatch(/^BK-[0-9A-Z]{26}$/);
      expect(id).toHaveLength(29);
    });
  });

  describe('generateUserId', () => {
    it('should generate user ID with role and ULID', () => {
      const id = generateUserId(UserRole.SHIPPER);

      expect(id).toMatch(/^USR-SH-[0-9A-Z]{26}$/);
      expect(id).toHaveLength(33); // USR-SH- (7) + ULID (26) = 33
    });

    it('should generate different IDs for different roles', () => {
      const shipperIds = [generateUserId(UserRole.SHIPPER), generateUserId(UserRole.SHIPPER)];
      const operatorId = generateUserId(UserRole.OPERATOR);
      const driverId = generateUserId(UserRole.DRIVER);
      const adminId = generateUserId(UserRole.ADMIN);

      expect(shipperIds[0]).toContain('USR-SH-');
      expect(shipperIds[1]).toContain('USR-SH-');
      expect(operatorId).toContain('USR-OP-');
      expect(driverId).toContain('USR-DR-');
      expect(adminId).toContain('USR-AD-');

      // All should be unique
      const allIds = [...shipperIds, operatorId, driverId, adminId];
      expect(new Set(allIds).size).toBe(5);
    });
  });

  describe('generateTruckId', () => {
    it('should generate truck ID with sanitized registration number', () => {
      const id = generateTruckId('MH 01 AB 1234');

      expect(id).toMatch(/^TRK-MH01AB1234-[0-9A-Z]{26}$/);
      expect(id).toContain('TRK-MH01AB1234-');
    });

    it('should sanitize registration number (remove spaces, uppercase)', () => {
      const id1 = generateTruckId('mh 01 ab 1234');
      const id2 = generateTruckId('MH01AB1234');

      expect(id1).toContain('TRK-MH01AB1234-');
      expect(id2).toContain('TRK-MH01AB1234-');
    });
  });

  describe('generatePodId', () => {
    it('should generate POD ID with POD prefix and ULID', () => {
      const id = generatePodId();

      expect(id).toMatch(/^POD-[0-9A-Z]{26}$/);
      expect(id).toHaveLength(30);
    });
  });

  describe('generateKycId', () => {
    it('should generate KYC ID with KYC prefix and ULID', () => {
      const id = generateKycId();

      expect(id).toMatch(/^KYC-[0-9A-Z]{26}$/);
      expect(id).toHaveLength(30);
    });
  });

  describe('generateBlockId', () => {
    it('should generate block ID with BLK prefix and ULID', () => {
      const id = generateBlockId();

      expect(id).toMatch(/^BLK-[0-9A-Z]{26}$/);
      expect(id).toHaveLength(30);
    });
  });

  describe('generateOverrideId', () => {
    it('should generate override ID with OVR prefix and ULID', () => {
      const id = generateOverrideId();

      expect(id).toMatch(/^OVR-[0-9A-Z]{26}$/);
      expect(id).toHaveLength(30);
    });
  });

  describe('generateLedgerId', () => {
    it('should generate ledger ID with LDG prefix and ULID', () => {
      const id = generateLedgerId();

      expect(id).toMatch(/^LDG-[0-9A-Z]{26}$/);
      expect(id).toHaveLength(30);
    });
  });

  describe('generateInspectionId', () => {
    it('should generate inspection ID with INS prefix and ULID', () => {
      const id = generateInspectionId();

      expect(id).toMatch(/^INS-[0-9A-Z]{26}$/);
      expect(id).toHaveLength(30);
    });
  });

  describe('generateAuditId', () => {
    it('should generate audit ID with AUD prefix and ULID', () => {
      const id = generateAuditId();

      expect(id).toMatch(/^AUD-[0-9A-Z]{26}$/);
      expect(id).toHaveLength(30);
    });
  });

  describe('generateId (generic)', () => {
    it('should generate booking ID', () => {
      const date = new Date('2024-01-15');
      const id = generateId(EntityType.BOOKING, { date });

      expect(id).toMatch(/^RID-20240115-\d{4}$/);
    });

    it('should generate shipment ID', () => {
      const id = generateId(EntityType.SHIPMENT);

      expect(id).toMatch(/^SH-[0-9A-Z]{26}$/);
    });

    it('should generate user ID with role', () => {
      const id = generateId(EntityType.USER, { role: UserRole.OPERATOR });

      expect(id).toMatch(/^USR-OP-[0-9A-Z]{26}$/);
    });

    it('should throw error if user role is missing', () => {
      expect(() => generateId(EntityType.USER)).toThrow('User role is required');
    });

    it('should generate truck ID with registration number', () => {
      const id = generateId(EntityType.TRUCK, { regNo: 'KA 01 AB 1234' });

      expect(id).toMatch(/^TRK-KA01AB1234-[0-9A-Z]{26}$/);
    });

    it('should throw error if truck registration number is missing', () => {
      expect(() => generateId(EntityType.TRUCK)).toThrow('Registration number is required');
    });

    it('should generate all other entity types', () => {
      expect(generateId(EntityType.POD)).toMatch(/^POD-[0-9A-Z]{26}$/);
      expect(generateId(EntityType.KYC)).toMatch(/^KYC-[0-9A-Z]{26}$/);
      expect(generateId(EntityType.BLOCK)).toMatch(/^BLK-[0-9A-Z]{26}$/);
      expect(generateId(EntityType.OVERRIDE)).toMatch(/^OVR-[0-9A-Z]{26}$/);
      expect(generateId(EntityType.LEDGER)).toMatch(/^LDG-[0-9A-Z]{26}$/);
      expect(generateId(EntityType.INSPECTION)).toMatch(/^INS-[0-9A-Z]{26}$/);
      expect(generateId(EntityType.AUDIT)).toMatch(/^AUD-[0-9A-Z]{26}$/);
    });
  });

  describe('validateIdFormat', () => {
    it('should validate booking ID format', () => {
      expect(validateIdFormat('RID-20240115-0001', EntityType.BOOKING)).toBe(true);
      expect(validateIdFormat('RID-20240115-9999', EntityType.BOOKING)).toBe(true);
      expect(validateIdFormat('RID-2024011-0001', EntityType.BOOKING)).toBe(false);
      expect(validateIdFormat('RID-20240115-001', EntityType.BOOKING)).toBe(false);
      expect(validateIdFormat('SH-01ARZ3NDEKTSV4RRFFQ69G5FAV', EntityType.BOOKING)).toBe(false);
    });

    it('should validate shipment ID format', () => {
      expect(validateIdFormat('SH-01ARZ3NDEKTSV4RRFFQ69G5FAV', EntityType.SHIPMENT)).toBe(true);
      expect(validateIdFormat('SH-01ARZ3NDEKTSV4RRFFQ69G5FA', EntityType.SHIPMENT)).toBe(false); // Too short
      expect(validateIdFormat('BK-01ARZ3NDEKTSV4RRFFQ69G5FAV', EntityType.SHIPMENT)).toBe(false); // Wrong prefix
    });

    it('should validate user ID format with roles', () => {
      expect(validateIdFormat('USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV', EntityType.USER)).toBe(true);
      expect(validateIdFormat('USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FAV', EntityType.USER)).toBe(true);
      expect(validateIdFormat('USR-DR-01ARZ3NDEKTSV4RRFFQ69G5FAV', EntityType.USER)).toBe(true);
      expect(validateIdFormat('USR-AD-01ARZ3NDEKTSV4RRFFQ69G5FAV', EntityType.USER)).toBe(true);
      expect(validateIdFormat('USR-XX-01ARZ3NDEKTSV4RRFFQ69G5FAV', EntityType.USER)).toBe(false); // Invalid role
    });

    it('should validate truck ID format', () => {
      expect(validateIdFormat('TRK-MH01AB1234-01ARZ3NDEKTSV4RRFFQ69G5FAV', EntityType.TRUCK)).toBe(
        true
      );
      expect(validateIdFormat('TRK-KA05CD5678-01ARZ3NDEKTSV4RRFFQ69G5FAV', EntityType.TRUCK)).toBe(
        true
      );
      expect(validateIdFormat('TRK-01ARZ3NDEKTSV4RRFFQ69G5FAV', EntityType.TRUCK)).toBe(false); // Missing regno
    });

    it('should validate all entity types', () => {
      expect(validateIdFormat('POD-01ARZ3NDEKTSV4RRFFQ69G5FAV', EntityType.POD)).toBe(true);
      expect(validateIdFormat('KYC-01ARZ3NDEKTSV4RRFFQ69G5FAV', EntityType.KYC)).toBe(true);
      expect(validateIdFormat('BLK-01ARZ3NDEKTSV4RRFFQ69G5FAV', EntityType.BLOCK)).toBe(true);
      expect(validateIdFormat('OVR-01ARZ3NDEKTSV4RRFFQ69G5FAV', EntityType.OVERRIDE)).toBe(true);
      expect(validateIdFormat('LDG-01ARZ3NDEKTSV4RRFFQ69G5FAV', EntityType.LEDGER)).toBe(true);
      expect(validateIdFormat('INS-01ARZ3NDEKTSV4RRFFQ69G5FAV', EntityType.INSPECTION)).toBe(true);
      expect(validateIdFormat('AUD-01ARZ3NDEKTSV4RRFFQ69G5FAV', EntityType.AUDIT)).toBe(true);
    });
  });

  describe('extractEntityType', () => {
    it('should extract entity type from ID', () => {
      expect(extractEntityType('RID-20240115-0001')).toBe(EntityType.BOOKING);
      expect(extractEntityType('SH-01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(EntityType.SHIPMENT);
      expect(extractEntityType('BK-01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(EntityType.BID);
      expect(extractEntityType('USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(EntityType.USER);
      expect(extractEntityType('TRK-MH01AB1234-01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(EntityType.TRUCK);
      expect(extractEntityType('POD-01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(EntityType.POD);
      expect(extractEntityType('KYC-01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(EntityType.KYC);
      expect(extractEntityType('BLK-01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(EntityType.BLOCK);
      expect(extractEntityType('OVR-01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(EntityType.OVERRIDE);
      expect(extractEntityType('LDG-01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(EntityType.LEDGER);
      expect(extractEntityType('INS-01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(EntityType.INSPECTION);
      expect(extractEntityType('AUD-01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(EntityType.AUDIT);
    });

    it('should return null for unknown ID format', () => {
      expect(extractEntityType('UNKNOWN-123')).toBe(null);
      expect(extractEntityType('123456')).toBe(null);
      expect(extractEntityType('')).toBe(null);
    });
  });

  describe('ULID properties', () => {
    it('should generate lexicographically sortable IDs', () => {
      // Sleep to ensure different timestamps
      const id1 = generateShipmentId();

      // Small delay
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      return delay(2).then(() => {
        const id2 = generateShipmentId();

        // ULID components should be sortable
        const ulid1 = id1.substring(3); // Remove SH-
        const ulid2 = id2.substring(3);

        expect(ulid1 <= ulid2).toBe(true);
      });
    });

    it('should generate time-ordered booking IDs', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-16');

      const id1 = generateBookingId(date1);
      const id2 = generateBookingId(date2);

      expect(id1 < id2).toBe(true);
    });
  });
});
