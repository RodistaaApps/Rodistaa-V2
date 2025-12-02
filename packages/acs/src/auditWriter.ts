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
  prevHash?: string; // Link to previous audit entry for same entity
  signature?: string; // KMS-signed hash for tamper detection
  timestamp: Date;
}

export interface DbAdapter {
  insertAuditLog(entry: AuditEntry): Promise<void>;
  getLastAuditHash?(entityType: string, entityId: string): Promise<string | null>;
}

/**
 * Creates a canonical JSON representation of an audit entry (deterministic)
 */
function canonicalizeAuditEntry(entry: Omit<AuditEntry, 'auditHash' | 'id' | 'timestamp' | 'signature'> & { prevHash?: string }): string {
  // Sort keys for deterministic JSON
  const canonical: any = {
    entityType: entry.entityType,
    entityId: entry.entityId,
    action: entry.action,
    performedBy: entry.performedBy || null,
    metadata: entry.metadata,
    ruleId: entry.ruleId || null,
  };
  
  // Include prevHash if present (for audit chain linking)
  if (entry.prevHash) {
    canonical.prevHash = entry.prevHash;
  }

  // Sort keys alphabetically for deterministic output
  const sortedKeys = Object.keys(canonical).sort();
  const sorted: any = {};
  for (const key of sortedKeys) {
    sorted[key] = canonical[key];
  }

  return JSON.stringify(sorted);
}

/**
 * Computes SHA256 hash of canonical audit entry
 */
function computeAuditHash(canonicalJson: string): string {
  return crypto.createHash('sha256').update(canonicalJson, 'utf8').digest('hex');
}

/**
 * Sign audit hash using local KMS (HMAC-SHA256)
 * In production, this would use AWS KMS, GCP KMS, or Azure Key Vault
 */
function signAuditHash(auditHash: string, keyId?: string): string {
  const kmsKeyId = keyId || process.env.LOCAL_KMS_KEY_ID || 'audit-signing-key-dev';
  const key = localKMS.getKey(kmsKeyId);
  
  // Use HMAC-SHA256 for signing
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(auditHash);
  return hmac.digest('hex');
}

/**
 * Creates an audit entry with SHA256 hash and optional KMS signature
 */
export function createAuditEntry(
  entityType: string,
  entityId: string,
  action: string,
  metadata: Record<string, any> = {},
  options: {
    performedBy?: string;
    ruleId?: string;
    prevHash?: string;
    sign?: boolean;
    keyId?: string;
  } = {}
): AuditEntry {
  const entry: Omit<AuditEntry, 'auditHash' | 'id' | 'timestamp' | 'prevHash' | 'signature'> = {
    entityType,
    entityId,
    action,
    performedBy: options.performedBy,
    metadata,
    ruleId: options.ruleId,
  };

  // Include prevHash in canonical form if present
  const canonical = options.prevHash
    ? canonicalizeAuditEntry({ ...entry, prevHash: options.prevHash })
    : canonicalizeAuditEntry(entry);
  
  const auditHash = computeAuditHash(canonical);
  const signature = options.sign !== false ? signAuditHash(auditHash, options.keyId) : undefined;

  return {
    id: generateAuditId(),
    ...entry,
    auditHash,
    prevHash: options.prevHash,
    signature,
    timestamp: new Date(),
  };
}

/**
 * Writes audit entry to database via adapter
 * Links prev_hash from last audit entry for same entity if available
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

  // Link to previous audit entry for same entity (audit chain)
  let prevHash: string | undefined = entry.prevHash;
  if (!prevHash && dbAdapter && dbAdapter.getLastAuditHash) {
    try {
      prevHash = (await dbAdapter.getLastAuditHash(entry.entityType, entry.entityId)) || undefined;
    } catch (error) {
      log.warn({ error, entityType: entry.entityType, entityId: entry.entityId }, 'Failed to get last audit hash');
    }
  }

  // Recreate entry with prevHash linked
  const linkedEntry: AuditEntry = prevHash && !entry.prevHash
    ? {
        ...entry,
        prevHash,
        // Recompute hash with prevHash included
        auditHash: computeAuditHash(canonicalizeAuditEntry({ ...entry, prevHash })),
        signature: entry.signature || signAuditHash(computeAuditHash(canonicalizeAuditEntry({ ...entry, prevHash }))),
      }
    : entry;

  if (dbAdapter) {
    try {
      await dbAdapter.insertAuditLog(linkedEntry);
      log.info({ auditId: linkedEntry.id, prevHash }, 'Audit entry persisted to database');
    } catch (error) {
      log.error({ error, auditId: linkedEntry.id }, 'Failed to persist audit entry');
      // Don't throw - audit is best-effort, but log the error
    }
  } else {
    log.warn({ auditId: linkedEntry.id }, 'No DB adapter provided, audit entry not persisted');
  }

  return linkedEntry;
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

