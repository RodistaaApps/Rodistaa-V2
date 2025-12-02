/**
 * Override Request Domain Model
 */

export enum OverrideStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface OverrideRequest {
  id: string;
  requesterId: string; // USR-AD-<ulid>
  targetEntityType: string; // e.g., "shipment", "truck", "user"
  targetEntityId: string;
  ruleId?: string; // ACS rule that would block this
  justification: string;
  evidence?: Record<string, any>; // Supporting documents/links
  status: OverrideStatus;
  approverId?: string; // Second approver for critical overrides
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

