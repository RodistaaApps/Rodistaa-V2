/**
 * ACS Audit Writer
 * 
 * Creates immutable audit entries with SHA256 hashing for tamper detection.
 * Integrates with backend database adapter for persistence.
 */

import crypto from 'crypto';
import logger from 'pino';
import { generateAuditId } from '@rodistaa/app-shared';

const log = logger({ name: 'acs-audit-writer' });

export interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy?: string;
  metadata: Record<string, any>;
  ruleId?: string;
  auditHash: string;
  timestamp: Date;
}

export interface DbAdapter {
  insertAuditLog(entry: AuditEntry): Promise<void>;
}

/**
 * Creates a canonical JSON representation of an audit entry (deterministic)
 */
function canonicalizeAuditEntry(entry: Omit<AuditEntry, 'auditHash' | 'id' | 'timestamp'>): string {
  // Sort keys for deterministic JSON
  const canonical = {
    entityType: entry.entityType,
    entityId: entry.entityId,
    action: entry.action,
    performedBy: entry.performedBy || null,
    metadata: entry.metadata,
    ruleId: entry.ruleId || null,
  };

  return JSON.stringify(canonical, Object.keys(canonical).sort());
}

/**
 * Computes SHA256 hash of canonical audit entry
 */
function computeAuditHash(canonicalJson: string): string {
  return crypto.createHash('sha256').update(canonicalJson, 'utf8').digest('hex');
}

/**
 * Creates an audit entry with SHA256 hash
 */
export function createAuditEntry(
  entityType: string,
  entityId: string,
  action: string,
  metadata: Record<string, any> = {},
  options: {
    performedBy?: string;
    ruleId?: string;
  } = {}
): AuditEntry {
  const entry: Omit<AuditEntry, 'auditHash' | 'id' | 'timestamp'> = {
    entityType,
    entityId,
    action,
    performedBy: options.performedBy,
    metadata,
    ruleId: options.ruleId,
  };

  const canonical = canonicalizeAuditEntry(entry);
  const auditHash = computeAuditHash(canonical);

  return {
    id: generateAuditId(),
    ...entry,
    auditHash,
    timestamp: new Date(),
  };
}

/**
 * Writes audit entry to database via adapter
 */
export async function writeAuditEntry(
  entry: AuditEntry,
  dbAdapter?: DbAdapter
): Promise<AuditEntry> {
  log.debug(
    {
      auditId: entry.id,
      entityType: entry.entityType,
      entityId: entry.entityId,
      action: entry.action,
      ruleId: entry.ruleId,
    },
    'Writing audit entry'
  );

  if (dbAdapter) {
    try {
      await dbAdapter.insertAuditLog(entry);
      log.info({ auditId: entry.id }, 'Audit entry persisted to database');
    } catch (error) {
      log.error({ error, auditId: entry.id }, 'Failed to persist audit entry');
      // Don't throw - audit is best-effort, but log the error
    }
  } else {
    log.warn({ auditId: entry.id }, 'No DB adapter provided, audit entry not persisted');
  }

  return entry;
}

/**
 * Verifies audit entry hash (tamper detection)
 */
export function verifyAuditHash(entry: AuditEntry): boolean {
  const entryWithoutHash: Omit<AuditEntry, 'auditHash' | 'id' | 'timestamp'> = {
    entityType: entry.entityType,
    entityId: entry.entityId,
    action: entry.action,
    performedBy: entry.performedBy,
    metadata: entry.metadata,
    ruleId: entry.ruleId,
  };

  const canonical = canonicalizeAuditEntry(entryWithoutHash);
  const expectedHash = computeAuditHash(canonical);

  return expectedHash === entry.auditHash;
}

/**
 * Local KMS emulation for encryption key management
 * In production, this would use AWS KMS, GCP KMS, or Azure Key Vault
 */
export class LocalKMS {
  private keys: Map<string, Buffer> = new Map();

  /**
   * Generate or retrieve a key for a given key ID
   */
  getKey(keyId: string): Buffer {
    if (!this.keys.has(keyId)) {
      // Generate a 32-byte (256-bit) key for AES-256
      const key = crypto.randomBytes(32);
      this.keys.set(keyId, key);
      log.info({ keyId }, 'Generated new local KMS key');
    }
    return this.keys.get(keyId)!;
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  encrypt(keyId: string, plaintext: string): { ciphertext: string; iv: string; tag: string } {
    const key = this.getKey(keyId);
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    return {
      ciphertext,
      iv: iv.toString('hex'),
      tag,
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  decrypt(keyId: string, ciphertext: string, iv: string, tag: string): string {
    const key = this.getKey(keyId);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
  }
}

// Export singleton instance
export const localKMS = new LocalKMS();

