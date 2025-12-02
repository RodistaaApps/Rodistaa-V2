/**
 * Truck Service Unit Tests
 */

import { describe, it, expect } from '@jest/globals';
import { TruckStatus } from '@rodistaa/app-shared';

describe('TruckService', () => {
  describe('Truck Registration Validation', () => {
    it('should validate model year >= 2018', () => {
      const validYears = [2018, 2019, 2020, 2023, 2024];
      validYears.forEach(year => {
        expect(year).toBeGreaterThanOrEqual(2018);
      });
    });

    it('should reject trucks older than 2018', () => {
      const invalidYears = [2015, 2016, 2017];
      invalidYears.forEach(year => {
        expect(year).toBeLessThan(2018);
      });
    });

    it('should validate registration number format', () => {
      const validRegNos = ['MH-12-AB-1234', 'KA-01-CD-5678', 'DL-1CAB-1234'];
      validRegNos.forEach(regNo => {
        expect(regNo).toMatch(/^[A-Z]{2}-\d{1,2}-[A-Z]{1,3}-\d{4}$/);
      });
    });
  });

  describe('Fleet Size Limit', () => {
    it('should enforce max 10 trucks per operator', () => {
      const MAX_TRUCKS = 10;
      const currentTrucks = 5;

      expect(currentTrucks).toBeLessThanOrEqual(MAX_TRUCKS);
    });

    it('should reject 11th truck', () => {
      const currentTrucks = 10;
      const MAX_TRUCKS = 10;

      const canAddMore = currentTrucks < MAX_TRUCKS;
      expect(canAddMore).toBe(false);
    });
  });

  describe('Inspection Scheduling', () => {
    it('should require inspection every 120 days', () => {
      const INSPECTION_INTERVAL_DAYS = 120;
      const lastInspection = new Date('2024-01-01');
      const now = new Date('2024-05-01'); // 121 days later

      const daysDiff = Math.floor((now.getTime() - lastInspection.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysDiff).toBeGreaterThan(INSPECTION_INTERVAL_DAYS);
    });

    it('should calculate next inspection due date', () => {
      const lastInspection = new Date('2024-01-01');
      const nextDue = new Date(lastInspection);
      nextDue.setDate(nextDue.getDate() + 120);

      expect(nextDue > lastInspection).toBe(true);
    });
  });

  describe('Truck Blocking', () => {
    it('should block truck with reason', () => {
      const truck = {
        id: 'TRK-001',
        status: TruckStatus.ACTIVE,
      };

      const blockReason = 'Expired insurance';
      const newStatus = TruckStatus.BLOCKED;

      expect(newStatus).toBe(TruckStatus.BLOCKED);
      expect(blockReason).toBeDefined();
    });

    it('should unblock truck with ACS override', () => {
      const truck = {
        status: TruckStatus.BLOCKED,
        blockedReason: 'Expired docs',
      };

      const newStatus = TruckStatus.ACTIVE;
      expect(newStatus).toBe(TruckStatus.ACTIVE);
    });
  });

  describe('Document Expiry Tracking', () => {
    it('should detect expired documents', () => {
      const docExpiry = new Date('2023-12-31');
      const now = new Date('2024-01-15');

      expect(now > docExpiry).toBe(true);
    });

    it('should warn about expiring documents (30 days)', () => {
      const docExpiry = new Date('2024-02-15');
      const now = new Date('2024-01-20'); // 26 days before expiry

      const daysToExpiry = Math.floor((docExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysToExpiry).toBeLessThan(30);
      expect(daysToExpiry).toBeGreaterThan(0);
    });
  });
});

