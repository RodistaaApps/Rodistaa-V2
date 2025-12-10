/**
 * Fleet Management Module - Type Definitions
 */

// ============================================================================
// TRUCK TYPES
// ============================================================================

export interface Truck {
  rc_number: string;
  operator_id: string;
  operator_name: string;
  compliance_status: 'allowed' | 'blocked' | 'pending';
  last_verified: string;
  provider: string;
  provider_txn_id: string;
  tyres: number;
  label: string;
  body_type: string;
  gvw: number;
  inferred_length: number;
  fit_score: number;
  tickets_count: number;
  linked_trailer: string | null;
}

export interface TruckDetail {
  truckMaster: {
    rc_number: string;
    operator_id: string;
    operator_name: string;
    owner_name: string;
    owner_mobile: string;
    tyres: number;
    label: string;
    body_type: string;
    gvw: number;
    model: string;
    manufacture_year: number;
    fitness_upto: string;
    status: string;
  };
  complianceDecision: {
    status: 'allowed' | 'blocked' | 'pending';
    reason: string | null;
    blocked_by: string | null;
    blocked_at: string | null;
    last_verified_at: string;
    confidence_score: number;
  };
  inferenceResult: {
    inferred_length: number;
    inferred_body_type: string;
    candidate_lengths: number[];
    confidence: number;
    rules_applied: string[];
    fit_score: number;
  };
  snapshots: VAHANSnapshot[];
  complianceHistory: ComplianceHistoryEntry[];
  tickets: Ticket[];
  auditLogs: AuditLog[];
  linkedTrailer: TrailerLink | null;
}

export interface VAHANSnapshot {
  id: number;
  provider: string;
  txn_id: string;
  raw_data: Record<string, any>;
  fetched_at: string;
}

export interface ComplianceHistoryEntry {
  timestamp: string;
  action: string;
  admin_id: string;
  reason: string | null;
  confidence: number;
}

export interface TrailerLink {
  id: string;
  tractor_rc: string;
  trailer_rc: string;
  linked_by: string;
  linked_at: string;
  status: 'active' | 'inactive';
}

// ============================================================================
// TICKET TYPES
// ============================================================================

export interface Ticket {
  id: string;
  ticket_type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  title: string;
  description?: string;
  resource_type: string;
  resource_id: string;
  created_by: string;
  assigned_to: string | null;
  resolved_by: string | null;
  sla_due_at: string;
  resolved_at: string | null;
  escalated_at: string | null;
  resolution: string | null;
  resolution_type: string | null;
  metadata: Record<string, any>;
  tags: string[];
  created_at: string;
  updated_at: string;
  is_sla_breached?: boolean;
  time_until_sla?: string;
}

export interface TicketComment {
  id: number;
  ticket_id: string;
  admin_id: string;
  admin_name: string;
  comment: string;
  is_internal: boolean;
  attachments: string[];
  created_at: string;
}

export type TicketType =
  | 'PROVIDER_MISMATCH'
  | 'DUPLICATE_CHASSIS'
  | 'MANUAL_REVIEW'
  | 'DISPUTE'
  | 'COMPLIANCE_ISSUE'
  | 'DATA_QUALITY';

export type TicketPriority = 'P0' | 'P1' | 'P2' | 'P3';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED' | 'CLOSED';

export type ResolutionType =
  | 'APPROVED'
  | 'REJECTED'
  | 'FIXED'
  | 'NO_ACTION_NEEDED'
  | 'ESCALATED_TO_EXTERNAL';

// ============================================================================
// AUDIT & NOTIFICATION TYPES
// ============================================================================

export interface AuditLog {
  id: number;
  admin_id: string;
  admin_name?: string;
  action_type: string;
  resource_type: string;
  resource_id: string;
  payload: Record<string, any>;
  provider_txn_id: string | null;
  txn_id: string;
  correlation_id: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface Notification {
  id: number;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string | null;
  payload: Record<string, any>;
  action_url: string | null;
  read: boolean;
  created_at: string;
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

export interface TruckListParams {
  page?: number;
  limit?: number;
  search?: string;
  compliance?: 'allowed' | 'blocked' | 'pending';
  operator?: string;
  provider?: string;
  city?: string;
  state?: string;
  bodyType?: string;
  minGVW?: number;
  maxGVW?: number;
  hasTickets?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface TicketListParams {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
  ticketType?: TicketType;
  resourceType?: string;
  resourceId?: string;
  slaBreached?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SavedFilter {
  id: string;
  name: string;
  filter_json: TruckListParams | TicketListParams;
  is_public: boolean;
  created_at: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface FleetKPIs {
  totalTrucks: number;
  allowedTrucks: number;
  blockedTrucks: number;
  pendingVerifications: number;
  allowedRatio: number;
  providerSuccessRate: number;
  avgVerificationTime: number; // minutes
  ticketsSLACompliance: number; // percentage
}

export interface ProviderStats {
  provider: string;
  totalRequests: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgLatency: number; // ms
  lastFailure: string | null;
}

export interface RTOStats {
  rto_code: string;
  total_trucks: number;
  blocked_trucks: number;
  blocked_ratio: number;
}

// ============================================================================
// BULK ACTION TYPES
// ============================================================================

export interface BulkActionRequest {
  action: 'block' | 'unblock' | 'reverify' | 'export';
  rcNumbers: string[];
  reason?: string;
}

export interface BulkActionResult {
  correlationId: string;
  results: {
    total: number;
    success: number;
    failed: number;
    errors: Array<{ rc: string; error: string }>;
  };
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportRequest {
  format: 'csv' | 'pdf';
  filters?: TruckListParams;
  columns?: string[];
}

export interface ExportResult {
  exportId: string;
  filename: string;
  downloadUrl: string;
  size: number;
  rowCount: number;
  createdAt: string;
  expiresAt: string;
}

