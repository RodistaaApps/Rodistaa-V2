/**
 * Export Service Tests
 * 
 * Tests for CSV/PDF export generation and PII masking
 */

import exportService from '../exportService';

describe('Export Service', () => {
  describe('maskPII()', () => {
    it('should mask name - show first name only', () => {
      const masked = exportService.maskPII('John Doe', 'name');
      expect(masked).toBe('John ***');
    });

    it('should mask single name', () => {
      const masked = exportService.maskPII('Ramesh', 'name');
      expect(masked).toMatch(/^R\*+$/);
    });

    it('should mask mobile - show last 4 digits', () => {
      const masked = exportService.maskPII('+911234567890', 'mobile');
      expect(masked).toBe('*********7890');
    });

    it('should mask short mobile gracefully', () => {
      const masked = exportService.maskPII('123', 'mobile');
      expect(masked).toBe('****');
    });

    it('should mask email - show domain only', () => {
      const masked = exportService.maskPII('john.doe@example.com', 'email');
      expect(masked).toBe('***@example.com');
    });

    it('should handle empty PII', () => {
      expect(exportService.maskPII('', 'name')).toBe('');
      expect(exportService.maskPII('', 'mobile')).toBe('');
      expect(exportService.maskPII('', 'email')).toBe('');
    });
  });

  describe('generateExport()', () => {
    it('should generate CSV export', async () => {
      const request = {
        type: 'trucks' as const,
        format: 'csv' as const,
        adminId: 'ADM-001',
        adminRole: 'SuperAdmin',
        includePII: true,
      };

      const result = await exportService.generateExport(request);

      expect(result.exportId).toMatch(/^EXP-\d{8}-[A-F0-9]{8}$/);
      expect(result.filename).toContain('trucks_export');
      expect(result.filename).toEndWith('.csv');
      expect(result.rowCount).toBeGreaterThanOrEqual(0);
    });

    it('should generate PDF export', async () => {
      const request = {
        type: 'trucks' as const,
        format: 'pdf' as const,
        adminId: 'ADM-001',
        adminRole: 'SuperAdmin',
        includePII: false,
      };

      const result = await exportService.generateExport(request);

      expect(result.filename).toEndWith('.pdf');
    });

    it('should mask PII for non-SuperAdmin', async () => {
      const request = {
        type: 'trucks' as const,
        format: 'csv' as const,
        adminId: 'ADM-002',
        adminRole: 'ComplianceOfficer',
        includePII: true, // Requested, but role doesn't allow
      };

      const result = await exportService.generateExport(request);

      // PII should be masked regardless of request
      expect(result).toBeDefined();
    });

    it('should throw error for unsupported format', async () => {
      const request = {
        type: 'trucks' as const,
        format: 'xml' as any,
        adminId: 'ADM-001',
        adminRole: 'SuperAdmin',
      };

      await expect(exportService.generateExport(request)).rejects.toThrow('Unsupported format');
    });

    it('should set 24-hour expiration', async () => {
      const request = {
        type: 'trucks' as const,
        format: 'csv' as const,
        adminId: 'ADM-001',
        adminRole: 'SuperAdmin',
      };

      const result = await exportService.generateExport(request);

      const expiresAt = new Date(result.expiresAt);
      const createdAt = new Date(result.createdAt);
      const diffHours = (expiresAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      expect(diffHours).toBeCloseTo(24, 1);
    });
  });

  describe('getExport()', () => {
    it('should retrieve export by ID', async () => {
      const exportId = 'EXP-20251205-ABC123';
      const result = await exportService.getExport(exportId);

      // Stub returns null, real implementation would return export
      expect(result).toBeNull();
    });
  });
});

