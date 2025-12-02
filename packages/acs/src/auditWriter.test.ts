/**
 * Unit Tests for ACS Audit Writer
 */

import {
  createAuditEntry,
  writeAuditEntry,
  verifyAuditHash,
  LocalKMS,
  localKMS,
} from './auditWriter';
import { MockDbAdapter } from './dbAdapter';

describe('Audit Writer', () => {
  test('createAuditEntry should generate audit entry with hash', () => {
    const entry = createAuditEntry(
      'shipment',
      'SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      'FREEZE',
      { reason: 'GPS_JUMP' },
      { performedBy: 'USR-AD-01ARZ3NDEKTSV4RRFFQ69G5FAV', ruleId: 'RF05_GPS_JUMP_ANOMALY' }
    );

    expect(entry.id).toBeDefined();
    expect(entry.id.startsWith('AUD-')).toBe(true);
    expect(entry.entityType).toBe('shipment');
    expect(entry.entityId).toBe('SH-01ARZ3NDEKTSV4RRFFQ69G5FAV');
    expect(entry.action).toBe('FREEZE');
    expect(entry.auditHash).toBeDefined();
    expect(entry.auditHash.length).toBe(64); // SHA256 hex length
    expect(entry.timestamp).toBeInstanceOf(Date);
  });

  test('verifyAuditHash should detect tampering', () => {
    const entry = createAuditEntry(
      'shipment',
      'SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      'FREEZE',
      { reason: 'GPS_JUMP' }
    );

    expect(verifyAuditHash(entry)).toBe(true);

    // Tamper with metadata
    entry.metadata.reason = 'TAMPERED';
    expect(verifyAuditHash(entry)).toBe(false);
  });

  test('writeAuditEntry should persist to DB adapter', async () => {
    const mockDb = new MockDbAdapter();
    const entry = createAuditEntry(
      'shipment',
      'SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      'FREEZE',
      { reason: 'GPS_JUMP' }
    );

    await writeAuditEntry(entry, mockDb);

    const auditLogs = mockDb.getAuditLogs();
    expect(auditLogs.length).toBe(1);
    expect(auditLogs[0].id).toBe(entry.id);
  });

  test('writeAuditEntry should work without DB adapter', async () => {
    const entry = createAuditEntry(
      'shipment',
      'SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      'FREEZE',
      { reason: 'GPS_JUMP' }
    );

    // Should not throw
    await expect(writeAuditEntry(entry, undefined)).resolves.toBeDefined();
  });

  test('LocalKMS should encrypt and decrypt data', () => {
    const kms = new LocalKMS();
    const keyId = 'test-key-1';
    const plaintext = 'sensitive-data-123';

    const encrypted = kms.encrypt(keyId, plaintext);
    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.tag).toBeDefined();

    const decrypted = kms.decrypt(keyId, encrypted.ciphertext, encrypted.iv, encrypted.tag);
    expect(decrypted).toBe(plaintext);
  });

  test('LocalKMS should generate consistent keys', () => {
    const kms = new LocalKMS();
    const keyId = 'test-key-2';

    const key1 = kms.getKey(keyId);
    const key2 = kms.getKey(keyId);

    expect(key1).toEqual(key2);
  });

  test('localKMS singleton should work', () => {
    const plaintext = 'test-data';
    const keyId = 'singleton-key';

    const encrypted = localKMS.encrypt(keyId, plaintext);
    const decrypted = localKMS.decrypt(keyId, encrypted.ciphertext, encrypted.iv, encrypted.tag);

    expect(decrypted).toBe(plaintext);
  });
});

