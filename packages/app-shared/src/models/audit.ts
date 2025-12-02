/**
 * Audit Domain Model
 */

export interface AuditEntry {
  id: string;
  source: string; // Service name (e.g., "acs", "backend")
  event: Record<string, any>; // JSONB event data
  ruleId?: string; // ACS rule ID if applicable
  ruleVersion?: string;
  createdAt: Date;
  prevHash?: string; // Previous audit log hash (for chain)
  hash: string; // SHA256 hash of this entry
  signer: string; // Service/user that created this entry
}

export interface AuditLogQuery {
  source?: string;
  ruleId?: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

