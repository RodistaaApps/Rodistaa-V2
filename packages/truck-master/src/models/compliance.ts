/**
 * Compliance Models
 */

export interface ComplianceDecision {
  allow: boolean;
  reasons: string[];
  decision_at: Date;
  provider: string;
  last_verified_at: Date | null;
  rules_applied: string[];
  inference_confidence?: number;
}

export interface ComplianceCacheRow {
  id: number;
  rc_number: string;
  operator_id: string;
  allow: boolean;
  reasons: string[];
  decision_at: Date;
  provider: string | null;
  last_verified_at: Date | null;
  permit_status: string | null;
  fitness_status: string | null;
  insurance_status: string | null;
  puc_status: string | null;
  category_status: string | null;
  emission_status: string | null;
  gvw_tyre_status: string | null;
  duplicate_status: string | null;
  telemetry_status: string | null;
  rules_applied: string[];
  cache_expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

