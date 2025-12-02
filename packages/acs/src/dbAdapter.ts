/**
 * ACS Database Adapter
 * 
 * Provides database integration for ACS audit logging and entity operations.
 * Uses backend database connection when available, otherwise provides mock implementation.
 */

import { AuditEntry, DbAdapter } from './auditWriter';
import logger from 'pino';

const log = logger({ name: 'acs-db-adapter' });

/**
 * PostgreSQL Database Adapter
 * Integrates with backend's database connection
 */
export class PostgresDbAdapter implements DbAdapter {
  public queryFn?: (text: string, params?: any[]) => Promise<any>;

  constructor(queryFn?: (text: string, params?: any[]) => Promise<any>) {
    this.queryFn = queryFn;
  }

  async insertAuditLog(entry: AuditEntry): Promise<void> {
    if (!this.queryFn) {
      log.warn('No database query function provided, skipping audit log insert');
      return;
    }

    try {
      await this.queryFn(
        `INSERT INTO audit_logs (
          id, entity_type, entity_id, action, performed_by, 
          metadata, rule_id, audit_hash, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          entry.id,
          entry.entityType,
          entry.entityId,
          entry.action,
          entry.performedBy || null,
          JSON.stringify(entry.metadata),
          entry.ruleId || null,
          entry.auditHash,
          entry.timestamp,
        ]
      );
      log.debug({ auditId: entry.id }, 'Audit log inserted into database');
    } catch (error) {
      log.error({ error, auditId: entry.id }, 'Failed to insert audit log');
      throw error;
    }
  }

  async insertBlock(block: {
    id: string;
    entityType: string;
    entityId: string;
    ruleId: string;
    severity: string;
    reason: string;
    context: Record<string, any>;
    expiresAt?: Date;
  }): Promise<void> {
    if (!this.queryFn) {
      log.warn('No database query function provided, skipping block insert');
      return;
    }

    try {
      await this.queryFn(
        `INSERT INTO acs_blocks (
          id, entity_type, entity_id, rule_id, severity, 
          reason, context, expires_at, is_active, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          block.id,
          block.entityType,
          block.entityId,
          block.ruleId,
          block.severity,
          block.reason,
          JSON.stringify(block.context),
          block.expiresAt || null,
          true,
          new Date(),
        ]
      );
      log.debug({ blockId: block.id }, 'ACS block inserted into database');
    } catch (error) {
      log.error({ error, blockId: block.id }, 'Failed to insert ACS block');
      throw error;
    }
  }

  async checkPodHashExists(hash: string): Promise<boolean> {
    if (!this.queryFn) {
      return false;
    }

    try {
      const result = await this.queryFn(
        `SELECT COUNT(*) as count FROM pod_files WHERE verification_hash = $1`,
        [hash]
      );
      return (result.rows[0]?.count || 0) > 0;
    } catch (error) {
      log.error({ error, hash }, 'Failed to check POD hash');
      return false;
    }
  }
}

/**
 * Mock Database Adapter (for testing and local development without DB)
 */
export class MockDbAdapter implements DbAdapter {
  private auditLogs: AuditEntry[] = [];
  private blocks: any[] = [];
  private podHashes: Set<string> = new Set();

  async insertAuditLog(entry: AuditEntry): Promise<void> {
    this.auditLogs.push(entry);
    log.debug({ auditId: entry.id }, 'Mock audit log stored in memory');
  }

  async insertBlock(block: any): Promise<void> {
    this.blocks.push(block);
    log.debug({ blockId: block.id }, 'Mock block stored in memory');
  }

  async checkPodHashExists(hash: string): Promise<boolean> {
    return this.podHashes.has(hash);
  }

  async addPodHash(hash: string): Promise<void> {
    this.podHashes.add(hash);
  }

  // Test helpers
  getAuditLogs(): AuditEntry[] {
    return [...this.auditLogs];
  }

  getBlocks(): any[] {
    return [...this.blocks];
  }

  clear(): void {
    this.auditLogs = [];
    this.blocks = [];
    this.podHashes.clear();
  }
}

