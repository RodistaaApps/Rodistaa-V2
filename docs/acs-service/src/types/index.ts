// Common types for ACS service

export interface ACSContext {
  userId?: string;
  userRole?: string;
  userKycStatus?: string;
  deviceId?: string;
  ip?: string;
  route?: string;
  payload?: any;
}

export interface ACSDecision {
  allow: boolean;
  status: 200 | 403 | 423 | 429;
  code: string;
  message: string;
  context: {
    auditId: string;
    riskScore: number;
    flags: string[];
  };
}

export interface BlockRequest {
  entityType: "user" | "device" | "truck" | "ip" | "shipment";
  entityId: string;
  reason: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  expiresAt?: string;
}

export interface OverrideRequest {
  targetType: "shipment" | "truck" | "driver" | "user";
  targetId: string;
  ruleId: string;
  justification: string;
  evidenceUrl?: string;
  expiresAt?: string;
  tier?: 1 | 2 | 3;
}

