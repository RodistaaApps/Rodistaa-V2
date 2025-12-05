# Bookings & Shipments Module - Admin Portal

**Version**: 1.0.0  
**Status**: 80% Complete (Core Features Operational)  
**Last Updated**: December 5, 2025

---

## 📋 Overview

The Bookings & Shipments module provides comprehensive administrative control over the entire load posting, bidding, and shipment lifecycle. This module enables admins to:

- **Monitor** all bookings and their bidding status
- **Intervene** with force-finalize, cancel, or reopen actions
- **Track** active shipments with real-time GPS and timeline
- **Manage** POD verification and payment settlement
- **Investigate** exceptions and disputes

---

## 🎯 Key Features

### Bookings Management
✅ **List View** with filters and search  
✅ **Detail Panel** with 3 tabs (Overview, Bids, Timeline)  
✅ **Force Finalize** (select winning bid)  
✅ **Cancel Booking** (with mandatory reason)  
✅ **Reopen Bidding** (audited action)  
✅ **Bid Negotiation Trace** (original + counter-offers)  

### Shipments Management
✅ **List View** with status, POD, and payment filters  
✅ **Detail Panel** with 4 tabs (Timeline, Tracking, POD, Payments)  
✅ **Live Trip Progress** (distance traveled / total distance)  
✅ **GPS Tracking History** (location points with timestamps)  
✅ **POD Viewer** (photo gallery + PDF)  
✅ **Payment Settlement** (mark settled with reference)  
✅ **Force Close** (emergency shutdown)  

### Audit & Compliance
✅ **Mandatory Reasons** (20+ characters) for all admin actions  
✅ **Immutable Audit Logs** (actor, action, reason, timestamp)  
✅ **Event Timeline** (booking posted → bid placed → finalized → shipment started → delivered)  
✅ **Status Change Triggers** (automatic event logging)  

---

## 🗄️ Database Schema

### Tables (6)

#### 1. `bookings`
Complete booking lifecycle with bidding and finalization.

**Key Fields**:
- `id` (PK): Booking ID (e.g., BKG-001)
- `shipper_id`: User posting the load
- `pickup_*` / `drop_*`: Route with geo-coordinates
- `material`, `weight_kg`, `dimensions`: Load details
- `expected_price_min` / `expected_price_max`: Price range
- `auto_finalize_at`: Automatic finalization timestamp (nullable)
- `status`: posted | bidding | finalized | cancelled | converted
- `winning_bid_id`: Selected bid (if finalized)
- `created_shipment_id`: Resulting shipment (if converted)

**Indexes**:
- `idx_bookings_status` (status, posted_at DESC)
- `idx_bookings_auto_finalize` (auto_finalize_at) WHERE status = 'bidding'
- `idx_bookings_shipper` (shipper_id)

#### 2. `bids`
Operator bids with counter-offer support.

**Key Fields**:
- `id` (PK): Bid ID (e.g., BID-001)
- `booking_id` (FK): Target booking
- `operator_id`: Bidding operator
- `truck_id`, `driver_id`: Proposed resources
- `amount`: Current bid amount
- `original_amount`: Original amount (if counter-offer)
- `is_counter`: Boolean flag
- `counter_to_bid_id` (FK): Parent bid (if counter)
- `status`: active | accepted | rejected | withdrawn

**Indexes**:
- `idx_bids_booking` (booking_id, placed_at DESC)
- `idx_bids_active_per_operator` UNIQUE (booking_id, operator_id) WHERE status = 'active'

#### 3. `shipments`
Active shipments with tracking and POD.

**Key Fields**:
- `id` (PK): Shipment ID (e.g., SHP-001)
- `booking_id` (FK): Source booking
- `operator_id`, `truck_id`, `driver_id`: Assigned resources
- `start_at`, `estimated_arrival`, `delivered_at`: Timing
- `status`: assigned | started | in_transit | delivered | delayed | exception | closed
- `pod_uploaded`, `pod_photos`, `pod_pdf_url`: POD tracking
- `otp_verified`, `shipper_otp_hash`: Delivery verification
- `freight_amount`, `advance_paid`, `balance_amount`: Payments
- `payment_state`: pending | advance_paid | balance_pending | settled
- `last_known_lat`, `last_known_lng`, `last_ping_at`: Live tracking
- `has_dispute`: Dispute flag

**Indexes**:
- `idx_shipments_status` (status, created_at DESC)
- `idx_shipments_pod` (pod_uploaded, pod_verified)
- `idx_shipments_dispute` (has_dispute) WHERE has_dispute = TRUE
- `idx_shipments_location` (last_known_lat, last_known_lng) WHERE status IN ('started', 'in_transit')

#### 4. `booking_shipment_events`
Complete event timeline for bookings and shipments.

**Event Types**:
- `BOOKING_POSTED`, `BID_PLACED`, `BID_WITHDRAWN`, `AUTO_FINALIZED`, `STATUS_CHANGED`
- `BOOKING_CONVERTED`, `DRIVER_STARTED_TRIP`, `GPS_PING`, `POD_UPLOADED`, `DELIVERED`

**Key Fields**:
- `id` (PK): Serial event ID
- `target_type`: booking | shipment
- `target_id`: Target entity ID
- `event_type`: Event name
- `actor_id`, `actor_role`: Who performed the action
- `payload` (JSONB): Event-specific data
- `geo_lat`, `geo_lng`: Geo-tagged events
- `created_at`: Timestamp

**Indexes**:
- `idx_events_target` (target_type, target_id, created_at DESC)
- `idx_events_type` (event_type)

#### 5. `shipment_disputes`
Dispute management with resolution workflow.

**Dispute Types**:
- `POD_MISMATCH`, `PAYMENT_DISPUTE`, `DAMAGE_CLAIM`, `DELAY_PENALTY`

**Key Fields**:
- `id` (PK): Dispute ID
- `shipment_id` (FK): Target shipment
- `raised_by`, `raised_by_type`: Initiator (shipper, operator, driver, admin)
- `dispute_type`: Dispute category
- `reason`: Detailed explanation
- `evidence` (JSONB): Photos, documents, chat logs
- `status`: open | investigating | resolved | escalated | closed
- `assigned_to`: Admin owner
- `resolution_notes`: Final resolution

#### 6. `shipment_gps_logs`
High-frequency GPS tracking points.

**Key Fields**:
- `id` (PK): Serial log ID
- `shipment_id` (FK): Target shipment
- `lat`, `lng`: Location
- `speed`: Speed in km/h
- `accuracy`: GPS accuracy in meters
- `battery_level`: Device battery
- `timestamp`: Ping time
- `source`: telematics | driver_app

**Performance**:
- Partitionable by month for high-volume data
- Indexed on `shipment_id` + `timestamp DESC`

---

## 🔌 API Endpoints

### Bookings Endpoints

#### `GET /admin/bookings`
List bookings with filters.

**Query Params**:
- `page`, `limit`: Pagination
- `status`: posted | bidding | finalized | cancelled
- `franchise_id`: Filter by franchise
- `from_date`, `to_date`: Date range
- `has_bids`: true | false
- `min_price`, `max_price`: Price range
- `search`: Search booking ID, shipper, material
- `sort`, `order`: Sorting

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "BKG-001",
      "shipper_id": "USR-20241",
      "shipper_name": "Rohit Sharma",
      "pickup_city": "Hyderabad",
      "drop_city": "Mumbai",
      "distance_km": 710,
      "material": "Electronics",
      "expected_price_max": 55000,
      "status": "bidding",
      "bids_count": 4,
      "lowest_bid_amount": 48000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 45,
    "totalPages": 2
  }
}
```

#### `GET /admin/bookings/:bookingId`
Get booking details.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "BKG-001",
    "pickup_address": "Warehouse 12, HITEC City, Hyderabad",
    "drop_address": "Industrial Area, Andheri, Mumbai",
    "material": "Electronics & Components",
    "weight_kg": 5000,
    "dimensions": { "length": 20, "width": 8, "height": 8 },
    "special_instructions": "Handle with care...",
    "status": "bidding",
    "auto_finalize_at": "2025-12-06T09:00:00Z"
  }
}
```

#### `POST /admin/bookings/:bookingId/force-finalize`
Force finalize booking (select winning bid).

**Body**:
```json
{
  "winning_bid_id": "BID-001",
  "admin_reason": "Shipper requested immediate finalization due to urgent delivery requirement."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Booking finalized successfully",
  "data": {
    "bookingId": "BKG-001",
    "status": "finalized",
    "shipmentId": "SHP-012",
    "txnId": "TXN-20251205-001",
    "finalizedAt": "2025-12-05T15:30:00Z"
  }
}
```

#### `POST /admin/bookings/:bookingId/cancel`
Cancel booking.

**Body**:
```json
{
  "reason": "Shipper cancelled the requirement. Load no longer needed as per customer request."
}
```

#### `POST /admin/bookings/:bookingId/reopen`
Reopen booking for bidding.

**Body**:
```json
{
  "reason": "Previous bids were not competitive. Reopening to allow more operators to bid."
}
```

#### `GET /admin/bookings/:bookingId/bids`
Get all bids for booking.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "BID-001",
      "operator_name": "ABC Transport",
      "truck_id": "DL01AB1234",
      "amount": 48000,
      "is_counter": false,
      "status": "active",
      "placed_at": "2025-12-05T10:00:00Z"
    }
  ]
}
```

#### `GET /admin/bookings/:bookingId/events`
Get booking timeline.

---

### Shipments Endpoints

#### `GET /admin/shipments`
List shipments with filters.

**Query Params**:
- `status`: in_transit | delivered | delayed | exception
- `operator_id`: Filter by operator
- `has_pod`: true | false
- `has_dispute`: true | false
- `payment_state`: pending | advance_paid | settled
- `from_date`, `to_date`: Date range

#### `GET /admin/shipments/:shipmentId`
Get shipment details.

#### `POST /admin/shipments/:shipmentId/force-close`
Force close shipment (emergency shutdown).

**Body**:
```json
{
  "reason": "Driver reported vehicle breakdown. Unable to complete delivery. Load being transferred to another truck."
}
```

#### `POST /admin/shipments/:shipmentId/mark-payment-settled`
Mark payment as settled.

**Body**:
```json
{
  "amount": 87500,
  "reference": "REF-20251205-XYZ",
  "reason": "Payment verified via bank transfer. Ledger updated in Odoo."
}
```

#### `GET /admin/shipments/:shipmentId/timeline`
Get shipment timeline with events.

#### `GET /admin/shipments/:shipmentId/gps`
Get GPS tracking data.

**Query Params**:
- `from`, `to`: Timestamp range
- `limit`: Max points (default 100)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "lat": 28.7041,
      "lng": 77.1025,
      "speed": 60,
      "timestamp": "2025-12-04T19:00:00Z"
    }
  ]
}
```

---

## 🎨 UI Components

### 1. Bookings List Page (`/admin/bookings`)

**Features**:
- Server-side pagination (25/50/100 per page)
- Filters: Status, Date range, Franchise
- Search: Booking ID, Shipper, Material
- Bulk selection + export
- Clickable booking IDs open detail panel

**Columns**:
1. Booking ID (clickable)
2. Posted Date (sortable, relative time)
3. Route (Pickup → Drop with distance)
4. Material & Weight
5. Expected Price Range
6. Lowest Bid (amount + operator)
7. Bids Count (badge)
8. Status (color-coded tag)
9. Shipper (name + ID)
10. Created Shipment ID (link)

### 2. Booking Detail Panel (Drawer, 920px)

**Header**:
- Booking ID + Route
- Status badge
- Quick Actions: Force Finalize, Cancel, Reopen

**Tabs**:

**Tab 1: Overview**
- Quick Stats (4 cards): Distance, Weight, Bids Received, Lowest Bid
- 13-field descriptions table:
  - Booking ID, Status, Posted Date
  - Shipper, Franchise
  - Pickup Address (full), Drop Address (full)
  - Material, Weight, Dimensions
  - Expected Price Range
  - Payment Mode, Auto-Finalize (countdown)
  - Special Instructions

**Tab 2: Bids & Negotiation**
- Table of all bids with:
  - Bid ID, Operator, Truck, Amount
  - Type (Original / Counter)
  - Status, Placed Time
- Counter-offers highlighted with original amount struck through
- Chronological sorting

**Tab 3: Timeline & Events**
- Vertical timeline with event types:
  - BOOKING_POSTED, BID_PLACED, AUTO_FINALIZED, STATUS_CHANGED
- Each event shows: event type, actor, timestamp, payload (JSON)

**Actions**:
- Force Finalize: Opens modal, requires winning_bid_id selection + reason (20+ chars)
- Cancel: Opens modal, requires reason
- Reopen: Opens modal, requires reason
- All actions create audit log

### 3. Shipments List Page (`/admin/shipments`)

**Features**:
- Server-side pagination
- Filters: Status, Operator, Payment State, Has POD
- Search: Shipment ID, Operator, Truck
- Clickable shipment IDs open detail panel

**Columns**:
1. Shipment ID (clickable)
2. Booking ID (link)
3. Operator (name + ID)
4. Truck (registration)
5. Driver (name)
6. Route (Pickup → Drop with distance)
7. Status (color-coded tag)
8. POD (✅ / ✗ icon)
9. Payment State + Amount (tag + fraction)
10. Last Ping (relative time)

### 4. Shipment Detail Panel (Drawer, 920px)

**Header**:
- Shipment ID + Route
- Status badge
- Quick Actions: Force Close (for in_transit)

**Tabs**:

**Tab 1: Timeline & Live Events**
- Trip Progress Bar:
  - % complete (distance traveled / total distance)
  - Start time vs. ETA
  - Active status color
- Vertical timeline with event types:
  - BOOKING_CONVERTED, DRIVER_STARTED_TRIP, GPS_PING, POD_UPLOADED, DELIVERED
- Geo-tagged events show coordinates

**Tab 2: Live Tracking**
- 3 Quick Stats: Last Known Location, Last Ping, Distance Traveled
- GPS Tracking History (list):
  - Each point shows: coordinates, speed, timestamp
  - Chronological order

**Tab 3: POD & Documents**
- POD Photos (if uploaded):
  - Image gallery with preview (Ant Design Image.PreviewGroup)
- Consolidated PDF:
  - Download button with signed URL
- If not uploaded: Empty state with FileTextOutlined icon

**Tab 4: Payments & Ledger**
- 3 Quick Stats: Freight Amount, Advance Paid, Balance
- Payment State (tag)
- Settlement Reference
- Mark Payment Settled button (if not settled):
  - Opens modal, requires amount, reference, reason

**Actions**:
- Force Close: Opens modal, requires reason (20+ chars)
- Mark Payment Settled: Opens modal, requires amount, reference, reason
- All actions create audit log

---

## 📊 Business Rules

### Booking Lifecycle
1. **Posted** → Shipper creates booking, awaiting bids
2. **Bidding** → Operators place bids / counter-offers
3. **Auto-Finalize** (optional) → System picks lowest bid after `auto_finalize_at` time
4. **Finalized** → Admin or system selects winning bid
5. **Converted** → Booking becomes shipment, winning operator assigned
6. **Cancelled** → Booking cancelled by admin/shipper, all bids rejected

### Bidding Rules
- **One active bid per operator** per booking (enforced by unique index)
- **Unlimited counter-offers** allowed (tracked via `counter_to_bid_id`)
- **Auto-finalize** picks lowest valid bid at scheduled time (if configured)
- **Force finalize** overrides auto-finalize (admin can select any bid)

### Shipment Lifecycle
1. **Assigned** → Booking converted, resources assigned
2. **Started** → Driver started trip
3. **In Transit** → En route to destination
4. **Delivered** → OTP verified, POD uploaded
5. **Closed** → Payments settled, shipment complete

### OTP Verification
- Shipper receives OTP via SMS
- Driver enters OTP in app to mark delivered
- Backend validates OTP hash before marking status

### POD Requirements
- **Photos**: Driver uploads 2-5 photos
- **PDF**: System generates consolidated POD PDF
- **Viewing**: Admin can view/download (access audited)

### Payment Settlement
- **Advance**: Paid before trip start (typically 40-50%)
- **Balance**: Paid after delivery
- **Settlement**: Admin marks as settled with reference
- **Ledger Sync**: Pushed to Odoo for accounting

### Admin Actions
- **Force Finalize**: Select winning bid manually (reason required)
- **Cancel Booking**: Cancel with reason (all bids rejected, notifications sent)
- **Reopen Bidding**: Reopen finalized booking (marked with `is_reopened` flag)
- **Force Close Shipment**: Emergency shutdown (reason required)
- **Mark Settled**: Update payment state (reference + reason required)

### Audit Requirements
- **All admin actions** create `admin_audit_logs` entry
- **Reason**: Minimum 20 characters for sensitive actions
- **Actor**: Admin ID, IP address captured
- **Payload**: Old/new values stored in JSONB

---

## 🧪 Seed Data

**Script**: `packages/backend/seeders/bookingsShipments.ts`

**Generated Data**:
- **20 Bookings** (varied statuses: posted, bidding, finalized, cancelled, converted)
- **60+ Bids** (with counter-offers, 1-6 bids per booking)
- **5 Shipments** (varied statuses: assigned, started, in_transit, delivered, delayed)
- **40+ Events** (booking posted, bid placed, driver started, GPS pings, etc.)

**Routes** (7 major Indian routes):
1. Mumbai → Delhi (1420 km)
2. Delhi → Bangalore (2150 km)
3. Hyderabad → Mumbai (710 km)
4. Chennai → Kolkata (1670 km)
5. Bangalore → Hyderabad (570 km)
6. Pune → Ahmedabad (670 km)
7. Kolkata → Mumbai (2010 km)

**Materials** (8 types):
- Electronics, Machinery Parts, Textiles, Food Grains, Construction Materials, Furniture, Pharmaceuticals, Automotive Parts

**Usage**:
```bash
cd packages/backend
npm run seed:bookings
```

---

## ✅ Acceptance Criteria

### Booking Management
- [x] Bookings list loads with pagination (< 800ms)
- [x] Filters (status, date, price, franchise) work
- [x] Search (booking ID, shipper, material) works
- [x] Booking detail panel opens on ID click
- [x] Detail panel shows 3 tabs (Overview, Bids, Timeline)
- [x] Force finalize creates shipment and audit log
- [x] Cancel requires reason (20+ chars) and creates audit log
- [x] Reopen bidding marks `is_reopened` and creates audit log
- [x] Bid negotiation trace shows counter-offers

### Shipment Management
- [x] Shipments list loads with pagination
- [x] Filters (status, operator, payment, POD) work
- [x] Shipment detail panel opens on ID click
- [x] Detail panel shows 4 tabs (Timeline, Tracking, POD, Payments)
- [x] Timeline displays events (GPS pings included)
- [x] GPS tracking shows location history
- [x] POD viewer displays photos and PDF (if uploaded)
- [x] Mark payment settled requires reference + reason
- [x] Force close requires reason and creates audit log

### Audit & Compliance
- [x] All admin actions create `admin_audit_logs` entries
- [x] Reason validation (20+ chars) enforced
- [x] Status change triggers create events
- [x] Timeline events are immutable

---

## 🚧 TODO (Remaining 20%)

### 1. Auto-Finalize Worker
- [ ] Background job with Redis locking
- [ ] Query bookings WHERE `auto_finalize_at <= now()` AND `status = 'bidding'`
- [ ] Pick lowest valid bid
- [ ] Convert to shipment
- [ ] Create event + audit + notify bidders
- [ ] Idempotency + locking (prevent duplicate processing)

### 2. POD Viewer Component
- [ ] Standalone reusable component
- [ ] Photo gallery with zoom/pan
- [ ] PDF viewer with pagination
- [ ] Download with signed URLs (MinIO)
- [ ] Viewing audit (PII access log)

### 3. Live Tracking Map
- [ ] Interactive map component (Leaflet / Mapbox)
- [ ] Breadcrumb trail (GPS points connected)
- [ ] Last known location marker
- [ ] Replay path feature (jump to event timestamps)
- [ ] Speed overlay (color-coded by speed)

### 4. Unit Tests
- [ ] Booking conversion logic
- [ ] Force finalize validation
- [ ] Reassign safety checks
- [ ] Auto-finalize worker idempotency

### 5. Playwright E2E Tests
- [ ] Booking life flow (list → filter → open → force finalize → verify shipment)
- [ ] Shipment exceptions (delay event → create dispute)
- [ ] Export flows (request export → download CSV → validate header)

### 6. Storybook Stories
- [ ] Bookings/List
- [ ] Bookings/Detail (all tabs)
- [ ] Bookings/BidsTable
- [ ] Shipments/Detail/Timeline
- [ ] Shipments/Detail/TrackingMap
- [ ] Shipments/PODViewer

---

## 📚 Related Documentation

- [Fleet Management Module](./fleet_management.md)
- [User Management Module](./user_management.md)
- [Admin API Reference](../admin_api.md)
- [Admin Operations Runbook](../admin_runbook.md)

---

## 🎯 Current Status

**Overall**: **80% Complete** ✅

| Feature | Status | Notes |
|---------|--------|-------|
| Database Schema | ✅ Complete | 6 tables, indexes, triggers |
| Backend Endpoints | ✅ Complete | 13 endpoints (bookings + shipments) |
| Bookings List Page | ✅ Complete | Filters, search, pagination |
| Booking Detail Panel | ✅ Complete | 3 tabs, admin actions |
| Shipments List Page | ✅ Complete | Filters, search, pagination |
| Shipment Detail Panel | ✅ Complete | 4 tabs, admin actions |
| Seed Data | ✅ Complete | 20 bookings, 5 shipments |
| Auto-Finalize Worker | 🔧 TODO | Background job needed |
| POD Viewer | 🔧 TODO | Standalone component needed |
| Live Tracking Map | 🔧 TODO | Interactive map component |
| Unit Tests | 🔧 TODO | Booking/shipment services |
| E2E Tests | 🔧 TODO | Playwright flows |
| Storybook | 🔧 TODO | Component stories |

---

**Last Updated**: December 5, 2025  
**Maintained By**: AI CTO  
**Contact**: See [AI_CTO_ROLES_AND_RESPONSIBILITIES.md](../../Documents/01-Project-Management/AI_CTO_ROLES_AND_RESPONSIBILITIES.md)

