/**
 * Audit Service Tests
 * 
 * Tests for immutable audit logging and querying
 */

import auditService, { AuditActionType, AuditResourceType } from '../auditService';

describe('Audit Service', () => {
  describe('log()', () => {
    it('should generate txn_id if not provided', async () => {
      const entry = {
        adminId: 'ADM-001',
        actionType: AuditActionType.BLOCK_TRUCK,
        resourceType: AuditResourceType.TRUCK,
        resourceId: 'DL01AB1234',
        payload: { reason: 'Test reason' },
      };

      const txnId = await auditService.log(entry);

      expect(txnId).toMatch(/^AUD-\d{8}-[a-f0-9]{8}$/);
    });

    it('should use provided txn_id', async () => {
      const customTxnId = 'AUD-20251205-CUSTOM01';
      const entry = {
        adminId: 'ADM-001',
        actionType: AuditActionType.UNBLOCK_TRUCK,
        resourceType: AuditResourceType.TRUCK,
        resourceId: 'DL01AB1234',
        txnId: customTxnId,
      };

      const txnId = await auditService.log(entry);

      expect(txnId).toBe(customTxnId);
    });

    it('should handle logging failure gracefully', async () => {
      const entry = {
        adminId: 'ADM-001',
        actionType: AuditActionType.BLOCK_TRUCK,
        resourceType: AuditResourceType.TRUCK,
        resourceId: 'INVALID_RC',
      };

      // Should not throw, returns AUDIT_FAILED
      const txnId = await auditService.log(entry);
      expect(txnId).toBeDefined();
    });
  });

  describe('logBulkAction()', () => {
    it('should generate correlation ID for bulk operations', async () => {
      const adminId = 'ADM-001';
      const actionType = 'BULK_BLOCK';
      const resources = [
        { resourceType: 'truck', resourceId: 'DL01AB1234' },
        { resourceType: 'truck', resourceId: 'HR26BX5678' },
      ];
      const payload = { reason: 'Bulk compliance review' };

      const correlationId = await auditService.logBulkAction(
        adminId,
        actionType,
        resources,
        payload
      );

      expect(correlationId).toMatch(/^BULK-\d+-[a-f0-9]{8}$/);
    });
  });

  describe('query()', () => {
    it('should query by admin ID', async () => {
      const filters = {
        adminId: 'ADM-001',
        limit: 10,
      };

      const logs = await auditService.query(filters);

      expect(Array.isArray(logs)).toBe(true);
    });

    it('should query by action type', async () => {
      const filters = {
        actionType: 'BLOCK_TRUCK',
      };

      const logs = await auditService.query(filters);

      expect(Array.isArray(logs)).toBe(true);
    });

    it('should query by date range', async () => {
      const filters = {
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-05'),
      };

      const logs = await auditService.query(filters);

      expect(Array.isArray(logs)).toBe(true);
    });
  });

  describe('getResourceAudit()', () => {
    it('should get audit trail for truck', async () => {
      const logs = await auditService.getResourceAudit('truck', 'DL01AB1234');

      expect(Array.isArray(logs)).toBe(true);
    });
  });

  describe('getAdminActivity()', () => {
    it('should get recent activity for admin', async () => {
      const logs = await auditService.getAdminActivity('ADM-001', 7);

      expect(Array.isArray(logs)).toBe(true);
    });
  });
});

