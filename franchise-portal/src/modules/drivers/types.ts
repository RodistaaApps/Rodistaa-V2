/**
 * Drivers Module - Type Definitions
 */

export interface DriverOperator {
  id: string;
  name: string;
  is_primary: boolean;
}

export interface DriverLocation {
  city: string;
  lat: number;
  lng: number;
  timestamp: string;
}

export interface Driver {
  id: string;
  role: 'driver';
  name: string;
  mobile: string;
  operators: DriverOperator[];
  assigned_truck: string | null;
  dl_number: string;
  dl_expiry: string;
  availability: 'available' | 'on_trip' | 'offline';
  last_ping: string;
  last_location: DriverLocation;
  trips_30d: number;
  behaviour_score: number;
  acs_flags_count: number;
  trust_score: number;
}

export interface DriverDetail extends Driver {
  email?: string;
  city: string;
  state: string;
  franchise?: string;
  last_active: string;
  metrics: {
    completed_trips_30d: number;
    avg_onroad_time: number; // hours
    last_trip_start: string | null;
    total_driving_hours_30d: number;
  };
  active_trip: ActiveTrip | null;
  trips: {
    total: number;
    items: Trip[];
  };
  assignments: {
    total: number;
    items: DriverAssignment[];
  };
  documents: Document[];
  incidents: {
    total: number;
    items: Incident[];
  };
  location_logs: {
    total: number;
    items: LocationLog[];
  };
  ledger: {
    balance: number;
  };
  recent_activities: Activity[];
  acs_flags: ACSFlag[];
}

export interface ActiveTrip {
  id: string;
  booking_id: string;
  operator_name: string;
  truck_reg: string;
  route: {
    from: string;
    to: string;
  };
  start_time: string;
  eta: string | null;
  current_speed: number | null;
  current_location: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  status: 'assigned' | 'started' | 'in_transit' | 'near_delivery';
}

export interface Trip {
  id: string;
  booking_id: string;
  route: {
    from: string;
    to: string;
  };
  start_date: string;
  end_date: string | null;
  status: 'assigned' | 'started' | 'in_transit' | 'delivered' | 'cancelled';
  pod_status: 'pending' | 'uploaded' | 'verified';
  payment_received: boolean;
  operator_name: string;
  truck_reg: string;
}

export interface DriverAssignment {
  id: string;
  operator_id: string;
  operator_name: string;
  truck_id: string | null;
  truck_reg: string | null;
  linked_at: string;
  is_primary: boolean;
  status: 'active' | 'inactive';
}

export interface Document {
  id: string;
  type: 'dl_front' | 'dl_back' | 'aadhar' | 'photo' | 'other';
  url: string;
  uploaded_at: string;
  uploaded_source: 'app' | 'web' | 'admin';
  is_sensitive: boolean;
  masked: boolean;
  expiry_date?: string;
}

export interface Incident {
  id: string;
  type: 'late_arrival' | 'cancellation' | 'complaint' | 'harsh_braking' | 'speeding' | 'missed_ping' | 'other';
  severity: 'low' | 'medium' | 'high';
  description: string;
  created_at: string;
  evidence?: any;
  status: 'open' | 'acknowledged' | 'escalated' | 'closed';
  action_taken?: string;
}

export interface LocationLog {
  id: string;
  driver_id: string;
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
  network_type: 'wifi' | '4g' | '3g' | '2g' | 'unknown';
  trip_id: string | null;
  speed?: number;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  actor?: string;
  timestamp: string;
  metadata?: any;
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

export interface LedgerTransaction {
  id: string;
  type: 'credit' | 'debit' | 'settlement' | 'advance';
  amount: number;
  date: string;
  reference: string;
  description?: string;
}

export interface DriversListParams {
  limit?: number;
  offset?: number;
  search?: string;
  operator_id?: string;
  city?: string;
  state?: string;
  availability?: 'available' | 'on_trip' | 'offline';
  dl_expiry_range?: string;
  has_flags?: boolean;
  sort?: 'name' | 'last_ping' | 'trips_30d' | 'behaviour_score' | 'dl_expiry';
  order?: 'asc' | 'desc';
}

export interface DriversListResponse {
  data: Driver[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

