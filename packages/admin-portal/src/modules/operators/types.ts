/**
 * Operators Module - Type Definitions
 */

export interface TruckCounts {
  total: number;
  active: number;
  blocked: number;
}

export interface OperatorMetrics {
  trucks: TruckCounts;
  active_bids: number;
  completed_shipments: number;
  avg_response_time?: number; // in minutes
}

export interface Operator {
  id: string;
  role: 'operator';
  name: string;
  mobile: string;
  email?: string;
  franchise: string;
  franchise_id?: string;
  city: string;
  state: string;
  last_active: string;
  trucks: TruckCounts;
  active_bids: number;
  pending_inspections: number;
  ledger_balance: number;
  acs_flags_count: number;
  trust_score: number;
}

export interface OperatorDetail extends Operator {
  metrics: OperatorMetrics;
  ledger: {
    balance: number;
  };
  acs_flags: ACSFlag[];
  recent_activities: Activity[];
  documents: Document[];
  trucks_list: {
    total: number;
    items: Truck[];
  };
  bids: {
    total: number;
    items: Bid[];
  };
  shipments: {
    total: number;
    items: Shipment[];
  };
  drivers: {
    total: number;
    items: Driver[];
  };
  inspections: {
    pending: number;
    items: Inspection[];
  };
}

export interface Truck {
  id: string;
  reg_no: string;
  operator_id: string;
  truck_type: string;
  model: string;
  bs_version: 'BS4' | 'BS6';
  manufacture_year: number;
  status: 'active' | 'expired_docs' | 'blocked' | 'in_maintenance';
  last_inspection_at?: string;
  next_inspection_due?: string;
  gps_enabled: boolean;
  telematics_installed: boolean;
  documents_count: number;
  photos_count: number;
}

export interface Bid {
  id: string;
  booking_id: string;
  operator_id: string;
  amount: number;
  posted_date: string;
  status: 'active' | 'won' | 'lost' | 'withdrawn';
  outcome?: string;
  shipment_id?: string;
}

export interface Shipment {
  id: string;
  booking_id: string;
  operator_id: string;
  truck_id: string;
  truck_reg: string;
  driver_id: string;
  driver_name: string;
  start_date: string;
  delivered_date?: string;
  delivery_status: 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  pod_status: 'pending' | 'uploaded' | 'verified';
  payment_status: 'pending' | 'paid' | 'failed';
}

export interface Driver {
  id: string;
  operator_id: string;
  name: string;
  mobile: string;
  dl_number: string;
  dl_expiry: string;
  total_trips: number;
  last_active: string;
  status: 'active' | 'inactive' | 'blocked';
}

export interface Inspection {
  id: string;
  truck_id: string;
  truck_reg: string;
  scheduled_date: string;
  completed_date?: string;
  status: 'pending' | 'scheduled' | 'completed' | 'failed' | 'verified';
  inspector_id?: string;
  inspector_name?: string;
  result?: 'pass' | 'pass_with_issues' | 'fail';
  notes?: string;
  verified_by?: string;
  verified_at?: string;
}

export interface ACSFlag {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  created_at: string;
  rule_id?: string;
  evidence?: any;
  status: 'active' | 'acknowledged' | 'escalated' | 'resolved';
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  actor?: string;
  timestamp: string;
  metadata?: any;
}

export interface Document {
  id: string;
  type: 'rc_book' | 'insurance' | 'permit' | 'noa' | 'gst' | 'other';
  url: string;
  uploaded_at: string;
  expiry_date?: string;
  is_sensitive: boolean;
  masked: boolean;
  verification_status?: 'pending' | 'verified' | 'rejected';
}

export interface LedgerTransaction {
  id: string;
  type: 'credit' | 'debit' | 'adjustment' | 'fee' | 'refund';
  amount: number;
  date: string;
  reference: string;
  description?: string;
  balance_before?: number;
  balance_after?: number;
}

export interface OperatorsListParams {
  limit?: number;
  offset?: number;
  search?: string;
  franchise?: string;
  city?: string;
  state?: string;
  sort?: 'name' | 'last_active' | 'trucks_total' | 'active_bids' | 'ledger_balance' | 'trust_score';
  order?: 'asc' | 'desc';
  has_pending_inspections?: boolean;
  min_trucks?: number;
  last_active_range?: number;
}

export interface OperatorsListResponse {
  data: Operator[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

