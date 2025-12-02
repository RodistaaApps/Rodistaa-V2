/**
 * Unit Tests for ACS Database Adapter
 */

import { MockDbAdapter, PostgresDbAdapter } from './dbAdapter';
import { createAuditEntry } from './auditWriter';

describe('Database Adapter', () => {
  describe('MockDbAdapter', () => {
    let mockDb: MockDbAdapter;

    beforeEach(() => {
      mockDb = new MockDbAdapter();
    });

    test('should store audit logs', async () => {
      const entry = createAuditEntry(
        'shipment',
        'SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
        'FREEZE',
        { reason: 'GPS_JUMP' }
      );

      await mockDb.insertAuditLog(entry);

      const logs = mockDb.getAuditLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].id).toBe(entry.id);
    });

    test('should store blocks', async () => {
      const block = {
        id: 'BLK-01ARZ3NDEKTSV4RRFFQ69G5FAV',
        entityType: 'truck',
        entityId: 'TRK-MH01AB1234-01ARZ3NDEKTSV4RRFFQ69G5FAV',
        ruleId: 'RF02_TRUCK_DOCS_EXPIRED',
        severity: 'CRITICAL',
        reason: 'EXPIRED_DOCUMENTS',
        context: {},
      };

      await mockDb.insertBlock(block);

      const blocks = mockDb.getBlocks();
      expect(blocks.length).toBe(1);
      expect(blocks[0].id).toBe(block.id);
    });

    test('should track POD hashes', async () => {
      const hash = 'pod-hash-123';

      expect(await mockDb.checkPodHashExists(hash)).toBe(false);

      await mockDb.addPodHash(hash);

      expect(await mockDb.checkPodHashExists(hash)).toBe(true);
    });

    test('clear should reset all data', async () => {
      const entry = createAuditEntry('shipment', 'SH-01', 'FREEZE', {});
      await mockDb.insertAuditLog(entry);
      await mockDb.addPodHash('hash-1');

      expect(mockDb.getAuditLogs().length).toBe(1);
      expect(await mockDb.checkPodHashExists('hash-1')).toBe(true);

      mockDb.clear();

      expect(mockDb.getAuditLogs().length).toBe(0);
      expect(await mockDb.checkPodHashExists('hash-1')).toBe(false);
    });
  });

  describe('PostgresDbAdapter', () => {
    test('should be instantiable without query function', () => {
      const adapter = new PostgresDbAdapter();
      expect(adapter).toBeDefined();
    });

    test('should accept query function', () => {
      const queryFn = async () => ({ rows: [] });
      const adapter = new PostgresDbAdapter(queryFn);
      expect(adapter.queryFn).toBe(queryFn);
    });
  });
});

