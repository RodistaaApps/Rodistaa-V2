# Shippers Management - Admin Portal Feature Documentation

**Feature**: Shippers List + Detail View  
**Module**: Admin Portal  
**Date**: December 4, 2025  
**Status**: Production-Ready ✅

---

## Overview

The Shippers Management feature provides administrators with comprehensive tools to view, manage, and monitor all shippers on the Rodistaa platform. It includes a powerful list view with advanced filtering and a detailed panel with 9 tabs covering all operational aspects.

---

## 1. Shippers List View

### Location
**URL**: `/admin/users?role=shipper`

### Features

#### Table Columns (9 total)
1. **User ID / Role** - Shipper ID (monospace) + role badge
2. **Name & Mobile** - Full name + masked mobile number
3. **Franchise** - Assigned franchise unit
4. **City, State** - Geographic location
5. **Last Active** - Relative time (hover for exact timestamp)
6. **Activity** - Metrics format: `B:12 • C:10` (Bookings • Completed)
7. **Ledger Balance** - Color-coded (green=positive, red=negative)
8. **ACS** - Flag count indicator (if any)
9. **Actions** - View, Message, Export, More menu

#### Filters & Search

**Filter Options**:
- **Search**: Free-text search (ID, name, mobile)
- **Franchise**: Dropdown (Vijayawada, Kurnool, Guntur, etc.)
- **City**: Dropdown
- **Has ACS Flags**: Toggle (Yes/No)
- **Min Balance**: Numeric input
- **Clear Filters**: Reset button

**Table Behavior**:
- Server-side pagination (10/25/50/100 per page)
- Column sorting (Name, Last Active, Bookings, Balance, Trust Score)
- Responsive design
- Loading states with skeleton rows

---

## 2. Shipper Detail Panel

### Opening the Panel
Click **View** (eye icon) on any shipper row → Opens slide-in drawer

### Panel Layout
- **Width**: 90% of screen (max 1400px)
- **Position**: Slides in from right
- **Header**: Shipper name, ID, role badge, franchise tag
- **Tabs**: 9 tabs with icons and badges

---

## 3. Tab Details

### Tab 1: Overview

**Purpose**: Quick summary and key metrics

**Components**:
- **Trust Score**: Circular progress (0-100)
  - 90+: Excellent (green)
  - 75-89: Good (blue)
  - 60-74: Fair (orange)
  - <60: Needs Improvement (red)

- **Quick Stats** (4 cards):
  - Active Bookings
  - Completed Shipments (30d)
  - Average Rating
  - Ledger Balance

- **Contact Information**:
  - Email
  - Mobile
  - Location (city, state)
  - Franchise

- **ACS Flags Alert**: Banner if any active flags
- **Performance Metrics**: 3 progress bars
  - On-Time Booking Rate
  - Payment Reliability
  - Booking Completion Rate

### Tab 2: Bookings

**Purpose**: View all shipper's bookings with filters

**Table Columns**:
- Booking ID
- Route (from → to)
- Posted Date
- Expected Price
- Lowest Bid
- Status (posted/awarded/converted/cancelled)
- Actions (View button)

**Filters**:
- Search bookings
- Status dropdown
- Date range picker
- Clear filters button

**Pagination**: Server-side (10/20/50 per page)

### Tab 3: Shipments

**Purpose**: Track shipper's shipments and deliveries

**Table Columns**:
- Shipment ID
- Linked Booking ID
- Truck (masked for privacy)
- Operator (masked)
- Start Date
- Delivered Date (or "In Transit")
- POD Status (pending/uploaded/verified)
- Payment Status (pending/paid/failed)
- Actions (Details button)

**Filters**:
- POD Status dropdown
- Payment Status dropdown

### Tab 4: Ledger

**Purpose**: Financial tracking and manual adjustments

**Balance Summary** (3 cards):
- Current Balance
- Total Credits (30d)
- Total Debits (30d)

**Transactions Table**:
- Transaction ID
- Type (Credit/Debit/Adjustment)
- Amount (color-coded: green=credit, red=debit)
- Date & Time
- Reference
- Description

**Actions**:
- **Manual Adjustment** button (admin-only)
- **Export CSV** button

#### Manual Adjustment Flow:
1. Click "Manual Adjustment"
2. Select type (Credit or Debit)
3. Enter amount
4. **Enter reason** (required for audit - min 10 chars)
5. Confirm
6. Audit log automatically created

### Tab 5: Documents 🔐

**Purpose**: View KYC and business documents with security

**Document Grid**:
- Document thumbnail/icon
- Type (Aadhaar, GST, Business Proof)
- Sensitive badge (if applicable)
- Upload date and source
- Actions: View, Download

#### Permission-Based Access:

**For Non-Privileged Users**:
1. Document shows "SENSITIVE" badge
2. View button changes to "Request View"
3. Click → Opens "Request Document Access" modal
4. Must enter reason (required)
5. Submit → Creates audit log entry
6. Compliance officer reviews request

**For Privileged Users** (super_admin, compliance_officer, kyc_admin):
1. Click "View" button
2. Reason optional (but recommended)
3. Document opens in PDF viewer
4. Audit log automatically created

**Security Features**:
- All document views are logged
- Reason tracking
- IP address captured
- Timestamp recorded
- Actor ID logged

### Tab 6: Messages

**Purpose**: Admin-to-shipper communication

**Features**:
- **Send Notification** button
- Quick notify modal with:
  - Channel selection (SMS/Push/Both)
  - Template selection (optional)
  - Custom message input
  - Character counter

**Templates**:
- KYC Approved
- Document Required
- Payment Reminder
- Custom

### Tab 7: Activity

**Purpose**: Complete activity and audit trail

**Timeline Display**:
- Chronological list (newest first)
- Icons for activity types
- Color-coded events
- Admin actions highlighted in orange

**Activity Types**:
- User logins
- Bookings created
- Bids accepted
- Document uploads
- KYC views (admin)
- Impersonations
- Blocks/Unblocks
- Ledger adjustments

**Metadata Expansion**:
- Click any activity to see full details
- Shows IP address, device info, etc.

### Tab 8: ACS / Risk

**Purpose**: View and manage compliance flags

**Flag Display** (for each flag):
- Severity badge (Low/Medium/High/Critical)
- Flag ID
- Summary description
- Detection date
- Rule ID
- Evidence (expandable JSON)

**Actions**:
- **Acknowledge**: Mark as reviewed (requires notes)
- **Escalate**: Send to compliance team (requires notes)

**Empty State**:
- Shows checkmark icon
- "No Active ACS Flags" message

### Tab 9: Admin Actions 🔐

**Purpose**: Sensitive admin operations

**Available Actions**:

#### 1. Impersonate User
- **What**: Log in as this shipper
- **Why**: Debug issues, support
- **Security**: Requires reason, creates audit log
- **Warning**: All actions tracked

#### 2. Export Profile
- **Formats**: JSON or CSV
- **Content**: Complete shipper data
- **Metadata**: Export timestamp, admin ID included

#### 3. Assign/Change Franchise
- **Current**: Shows current franchise
- **Action**: Modal to select new franchise
- **Audit**: Logged with reason

#### 4. Add Internal Note
- **Visibility**: Admin and franchise managers only
- **Purpose**: Record observations, warnings, etc.

#### 5. Block/Unblock User
- **Block Options**:
  - Permanent
  - 7 days
  - 30 days
  - 90 days
- **Reason**: Mandatory (min 10 characters)
- **Effect**: User cannot access platform
- **Audit**: Fully logged

---

## 4. API Endpoints

### List Shippers
```
GET /api/admin/users?role=shipper&limit=25&offset=0&search=&franchise=&city=&sort=last_active&order=desc
```

**Response**:
```json
{
  "data": [/* array of shippers */],
  "meta": {
    "total": 9123,
    "limit": 25,
    "offset": 0
  }
}
```

### Get Shipper Detail
```
GET /api/admin/users/:id
```

### Get Bookings
```
GET /api/admin/users/:id/bookings?limit=20&offset=0&status=posted
```

### Get Shipments
```
GET /api/admin/users/:id/shipments?limit=20&offset=0
```

### Get Ledger
```
GET /api/admin/users/:id/ledger?limit=20&offset=0
```

### Adjust Ledger (Admin-Only)
```
POST /api/admin/users/:id/ledger/adjust

Body:
{
  "type": "credit",
  "amount": 5000,
  "reason": "Refund for cancelled booking BKG-123"
}
```

### Get Documents
```
GET /api/admin/users/:id/documents
```

### View Document (with audit)
```
GET /api/admin/users/:id/documents/:docId/view?reason=KYC verification check

Response:
{
  "access_granted": true,
  "url": "https://...",
  "document": { /* metadata */ }
}
```

### Get Audit Trail
```
GET /api/admin/users/:id/audit?limit=20&offset=0
```

### Create Audit Action
```
POST /api/admin/users/:id/audit/actions

Body:
{
  "action": "request_kyc_view",
  "payload": { /* context */ }
}
```

### Block User
```
POST /api/admin/users/:id/block

Body:
{
  "block": true,
  "reason": "Multiple fraud alerts",
  "duration": "30d"
}
```

---

## 5. Security & Permissions

### Role Requirements
- **View Shippers List**: `super_admin`, `compliance_officer`
- **View Shipper Detail**: `super_admin`, `compliance_officer`
- **View Sensitive Documents**: `super_admin`, `compliance_officer`, `kyc_admin`
- **Adjust Ledger**: `super_admin` only
- **Block User**: `super_admin` only
- **Impersonate**: `super_admin` only

### Audit Logging
All sensitive actions create audit logs with:
- Actor ID (admin who performed action)
- Target ID (shipper ID)
- Action type
- Payload (action-specific data)
- Timestamp
- IP address
- User agent

**Logged Actions**:
- Document views
- Ledger adjustments
- User blocks/unblocks
- Impersonations
- ACS flag acknowledgements
- Franchise changes

---

## 6. Data Models

### User (Extended)
```typescript
{
  id: string;
  role: 'shipper';
  name: string;
  mobile: string; // Encrypted at rest
  email: string;
  franchise_id: string;
  city: string;
  state: string;
  trust_score: number; // 0-100
  last_active: Date;
  ledger_balance: number; // Decimal
  is_blocked: boolean;
  block_reason: string;
}
```

### AuditLog
```typescript
{
  id: string;
  actor_id: string; // Admin who acted
  target_type: 'user';
  target_id: string; // Shipper ID
  action: string;
  payload: any; // JSON
  ip_address: string;
  user_agent: string;
  created_at: Date;
}
```

### Document
```typescript
{
  id: string;
  user_id: string;
  document_type: 'aadhar' | 'gst' | 'business_proof';
  file_url: string;
  is_sensitive: boolean;
  uploaded_at: Date;
  verification_status: 'pending' | 'verified' | 'rejected';
}
```

---

## 7. Usage Examples

### Example 1: Finding a Shipper
1. Navigate to `/admin/users?role=shipper`
2. Use search box: Type "Rohit"
3. Select franchise filter: "Vijayawada"
4. Results update automatically

### Example 2: Viewing Shipper Details
1. Click "View" button (eye icon) on any shipper
2. Panel slides in from right
3. Overview tab shows by default
4. Navigate between tabs to see all information

### Example 3: Adjusting Ledger (Admin)
1. Open shipper detail panel
2. Go to "Ledger" tab
3. Click "Manual Adjustment"
4. Select "Credit" or "Debit"
5. Enter amount: ₹5,000
6. Enter reason: "Refund for cancelled booking"
7. Confirm
8. Audit log created automatically
9. Balance updates instantly

### Example 4: Viewing Sensitive Document
1. Open shipper detail panel
2. Go to "Documents" tab
3. Find Aadhaar document
4. Click "Request View" (if no permission) or "View" (if permitted)
5. Enter reason: "KYC verification check"
6. Submit
7. Audit log created
8. Document opens in viewer (if permitted)

---

## 8. Testing

### Run Unit Tests
```bash
cd packages/portal
pnpm test shippers
```

### Run E2E Tests
```bash
cd packages/tests
pnpm test:e2e shippers.spec.ts
```

### Manual Testing Checklist
- [ ] Load shippers list
- [ ] Apply each filter type
- [ ] Sort by each column
- [ ] Change pagination size
- [ ] Open detail panel
- [ ] Switch between all 9 tabs
- [ ] Test document permission flow
- [ ] Test ledger adjustment
- [ ] Test admin actions
- [ ] Verify audit logs created

---

## 9. Performance

**Target Metrics**:
- List load: < 800ms (first page)
- Detail panel open: < 400ms
- Tab switching: < 100ms (instant)
- Pagination: < 300ms per page

**Optimization**:
- Server-side pagination (reduces payload)
- Lazy-loading tabs (load data on tab activation)
- Cached franchise/city lists
- Indexed database queries

---

## 10. Troubleshooting

### Issue: Shippers list not loading
**Solution**: Check backend API is running and `/api/admin/users?role=shipper` endpoint is accessible

### Issue: Document view permission denied
**Solution**: Verify user role includes `kyc_admin`, `compliance_officer`, or `super_admin`

### Issue: Audit logs not appearing
**Solution**: Check `audit_logs` table exists and service is creating logs

### Issue: Ledger balance incorrect
**Solution**: Check `ledger_transactions` table for transaction history

---

## 11. Related Documentation
- [API Documentation](../api/openapi.yaml)
- [Database Schema](../database/schema.md)
- [Security & Permissions](../security/rbac.md)
- [Audit Logging](../security/audit.md)

---

## 12. Contact & Support
For issues or questions, contact the development team or check the GitHub repository issues page.

