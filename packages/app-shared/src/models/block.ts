/**
 * ACS Block Domain Model
 */

export enum BlockSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface BlockEntry {
  id: string;
  entityType: 'user' | 'truck' | 'driver' | 'operator' | 'shipment' | 'device';
  entityId: string;
  reason: string;
  severity: BlockSeverity;
  scope?: Record<string, any>; // Additional context
  expiresAt?: Date; // Optional expiration
  createdBy?: string; // USR-AD-<ulid> or "system"
  createdAt: Date;
  auditId?: string; // Link to audit log
}

export interface BlockCreateRequest {
  entityType: BlockEntry['entityType'];
  entityId: string;
  reason: string;
  severity: BlockSeverity;
  scope?: Record<string, any>;
  expiresAt?: Date;
  createdBy?: string;
}

