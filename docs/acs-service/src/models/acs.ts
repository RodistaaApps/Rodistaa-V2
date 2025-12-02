import { query } from "../db";
import { v4 as uuidv4 } from "uuid";

export interface AuditRow {
  id: string;
  source: string;
  event: any;
  rule_id?: string;
  rule_version?: string;
  created_at?: string;
  prev_hash?: string;
  hash: string;
  signer?: string;
}

/**
 * Insert an audit log entry
 */
export async function insertAudit(audit: Partial<AuditRow>) {
  const id = audit.id || uuidv4();
  const hash = audit.hash || computeHash(audit); // placeholder hash
  const now = new Date().toISOString();
  await query(
    `INSERT INTO audit_logs (id, source, event, rule_id, rule_version, created_at, prev_hash, hash, signer)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      id,
      audit.source || "acs",
      audit.event || {},
      audit.rule_id || null,
      audit.rule_version || null,
      now,
      audit.prev_hash || null,
      hash,
      audit.signer || "acs-service",
    ]
  );
  return id;
}

/**
 * Insert a new ACS block
 */
export async function insertBlock(
  entityType: string,
  entityId: string,
  reason: string,
  severity: string,
  scope: any,
  createdBy?: string,
  auditId?: string
) {
  const id = uuidv4();
  const now = new Date().toISOString();
  await query(
    `INSERT INTO acs_blocks (id, entity_type, entity_id, reason, severity, scope, created_by, created_at, audit_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      id,
      entityType,
      entityId,
      reason,
      severity,
      scope ? JSON.stringify(scope) : null,
      createdBy || null,
      now,
      auditId || null,
    ]
  );
  return id;
}

/**
 * Get all active blocks for an entity
 */
export async function getBlocksByEntity(entityType: string, entityId: string) {
  const res = await query(
    `SELECT * FROM acs_blocks WHERE entity_type=$1 AND entity_id=$2 ORDER BY created_at DESC`,
    [entityType, entityId]
  );
  return res.rows;
}

/**
 * Get POD files by hash (for duplicate detection)
 */
export async function getPodHashes(hash: string) {
  const res = await query(`SELECT * FROM pod_files WHERE file_hash=$1 LIMIT 1`, [hash]);
  return res.rows;
}

/**
 * Compute hash for audit log entry
 * Lightweight placeholder: in production use SHA256 over canonicalized JSON + nonce
 */
function computeHash(obj: any) {
  const str = JSON.stringify(obj) + Date.now().toString();
  // simple hash placeholder
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return "h" + Math.abs(h).toString(16);
}
