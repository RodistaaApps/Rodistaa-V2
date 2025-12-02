/**
 * Migration: Enhance audit_logs table with prev_hash and signature fields
 * 
 * Adds:
 * - prev_hash: Links audit entries in a chain (for tamper detection)
 * - signature: KMS-signed hash for additional tamper protection
 * 
 * This migration enhances the audit_logs table to support:
 * - Audit chain linking (prev_hash)
 * - KMS signature verification (signature)
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add prev_hash column (links to previous audit entry for same entity)
  await knex.schema.table('audit_logs', (table) => {
    table.string('prev_hash', 64).nullable().comment('Hash of previous audit entry for same entity (audit chain)');
    table.string('signature', 128).nullable().comment('KMS-signed hash (HMAC-SHA256) for tamper detection');
  });

  // Add index on prev_hash for audit chain queries
  await knex.schema.table('audit_logs', (table) => {
    table.index('prev_hash');
  });

  // Add index on entity_type + entity_id + timestamp for getting last audit hash efficiently
  await knex.schema.table('audit_logs', (table) => {
    table.index(['entity_type', 'entity_id', 'timestamp'], 'idx_audit_logs_entity_chain');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('audit_logs', (table) => {
    table.dropIndex(['entity_type', 'entity_id', 'timestamp'], 'idx_audit_logs_entity_chain');
    table.dropIndex('prev_hash');
    table.dropColumn('signature');
    table.dropColumn('prev_hash');
  });
}

