/**
 * Audit Repository
 * 
 * Provides database operations for audit log entries including:
 * - Inserting audit entries with hash chaining
 * - Retrieving audit entries by entity
 * - Getting last audit hash for chain linking
 * - Verifying audit chain integrity
 */

import { Knex } from 'knex';
import { AuditEntry } from '@rodistaa/acs';

export class AuditRepository {
  constructor(private db: Knex) {}

  /**
   * Insert an audit log entry
   */
  async insertAuditLog(entry: AuditEntry): Promise<void> {
    await this.db('audit_logs').insert({
      id: entry.id,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      action: entry.action,
      performed_by: entry.performedBy || null,
      metadata: entry.metadata,
      rule_id: entry.ruleId || null,
      audit_hash: entry.auditHash,
      prev_hash: entry.prevHash || null,
      signature: entry.signature || null,
      timestamp: entry.timestamp,
    });
  }

  /**
   * Get the last audit hash for a given entity (for audit chain linking)
   */
  async getLastAuditHash(entityType: string, entityId: string): Promise<string | null> {
    const result = await this.db('audit_logs')
      .where({ entity_type: entityType, entity_id: entityId })
      .orderBy('timestamp', 'desc')
      .select('audit_hash')
      .first();

    return result?.audit_hash || null;
  }

  /**
   * Get audit entries for an entity (ordered by timestamp)
   */
  async getAuditEntriesByEntity(
    entityType: string,
    entityId: string,
    limit: number = 100
  ): Promise<AuditEntry[]> {
    const rows = await this.db('audit_logs')
      .where({ entity_type: entityType, entity_id: entityId })
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .select('*');

    return rows.map((row) => ({
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      action: row.action,
      performedBy: row.performed_by,
      metadata: row.metadata,
      ruleId: row.rule_id,
      auditHash: row.audit_hash,
      prevHash: row.prev_hash,
      signature: row.signature,
      timestamp: row.timestamp,
    }));
  }

  /**
   * Get audit entries by rule ID
   */
  async getAuditEntriesByRule(ruleId: string, limit: number = 100): Promise<AuditEntry[]> {
    const rows = await this.db('audit_logs')
      .where({ rule_id: ruleId })
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .select('*');

    return rows.map((row) => ({
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      action: row.action,
      performedBy: row.performed_by,
      metadata: row.metadata,
      ruleId: row.rule_id,
      auditHash: row.audit_hash,
      prevHash: row.prev_hash,
      signature: row.signature,
      timestamp: row.timestamp,
    }));
  }

  /**
   * Verify audit chain integrity for an entity
   * Returns array of mismatches (empty if chain is valid)
   */
  async verifyAuditChain(entityType: string, entityId: string): Promise<
    Array<{ entryId: string; expectedPrevHash: string | null; actualPrevHash: string | null }>
  > {
    const entries = await this.getAuditEntriesByEntity(entityType, entityId, 1000);
    const mismatches: Array<{
      entryId: string;
      expectedPrevHash: string | null;
      actualPrevHash: string | null;
    }> = [];

    // Sort by timestamp ascending (oldest first)
    entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    for (let i = 1; i < entries.length; i++) {
      const current = entries[i];
      const previous = entries[i - 1];
      const expectedPrevHash = previous.auditHash;

      if (current.prevHash !== expectedPrevHash) {
        mismatches.push({
          entryId: current.id,
          expectedPrevHash,
          actualPrevHash: current.prevHash || null,
        });
      }
    }

    return mismatches;
  }

  /**
   * Get recent audit entries across all entities
   */
  async getRecentAuditEntries(limit: number = 50): Promise<AuditEntry[]> {
    const rows = await this.db('audit_logs')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .select('*');

    return rows.map((row) => ({
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      action: row.action,
      performedBy: row.performed_by,
      metadata: row.metadata,
      ruleId: row.rule_id,
      auditHash: row.audit_hash,
      prevHash: row.prev_hash,
      signature: row.signature,
      timestamp: row.timestamp,
    }));
  }
}

