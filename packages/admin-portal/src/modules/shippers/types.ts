/**
 * Shippers Module - Type Definitions
 */

export interface ShipperMetrics {
  bookings: number;
  completed_shipments: number;
  open_shipments?: number;
}

export interface Shipper {
  id: string;
  role: 'shipper';
  name: string;
  mobile: string;
  email?: string;
  franchise: string;
  city: string;
  state: string;
  last_active: string;
  metrics: ShipperMetrics;
  ledger_balance: number;
  acs_flags_count: number;
  trust_score: number;
}

export interface ShipperDetail extends Shipper {
  ledger: {
    balance: number;
  };
  acs_flags: ACSFlag[];
  recent_activities: Activity[];
  documents: Document[];
  bookings: {
    total: number;
    items: Booking[];
  };
  shipments: {
    total: number;
    items: Shipment[];
  };
}

export interface ACSFlag {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  created_at: string;
  rule_id?: string;
  evidence?: any;
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
  type: 'aadhar' | 'gst' | 'business_proof' | 'other';
  url: string;
  uploaded_at: string;
  is_sensitive: boolean;
  masked: boolean;
}

export interface Booking {
  id: string;
  route: {
    from: string;
    to: string;
  };
  posted_date: string;
  expected_price: number;
  lowest_bid?: number;
  status: 'posted' | 'awarded' | 'converted' | 'cancelled';
}

export interface Shipment {
  id: string;
  booking_id: string;
  truck: string;
  operator: string;
  start_date: string;
  delivered_date?: string;
  pod_status: 'pending' | 'uploaded' | 'verified';
  payment_status: 'pending' | 'paid' | 'failed';
}

export interface LedgerTransaction {
  id: string;
  type: 'credit' | 'debit' | 'adjustment';
  amount: number;
  date: string;
  reference: string;
  description?: string;
}

export interface ShippersListParams {
  limit?: number;
  offset?: number;
  search?: string;
  franchise?: string;
  city?: string;
  state?: string;
  sort?: 'name' | 'last_active' | 'bookings' | 'ledger_balance' | 'trust_score';
  order?: 'asc' | 'desc';
  has_acs?: boolean;
  min_balance?: number;
  last_active_range?: number;
}

export interface ShippersListResponse {
  data: Shipper[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

