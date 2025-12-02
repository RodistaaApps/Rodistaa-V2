# 📋 WORKFLOW 1: Booking → Bidding → Shipment → Delivery

**Workflow ID**: WF-001  
**Priority**: CRITICAL  
**Last Updated**: December 19, 2024

---

## 🎯 WORKFLOW OVERVIEW

Complete end-to-end flow from shipper creating a booking through final delivery completion.

---

## 📊 UNIFIED WORKFLOW MAP

### **SHIPPER APP**

#### Step 1: Create Booking
- **Action**: Shipper creates new booking
- **Data Entered**:
  - Pickup location (city, pincode, address)
  - Drop location (city, pincode, address)
  - Material type
  - Weight (tons)
  - Body type required
  - Tyre count
  - Date/time preferences
- **System Action**: Booking status = `POSTED`
- **Visible**: Booking appears in "My Bookings" with status "Open for Bids"

#### Step 2: View Bids Received
- **View**: List of all bids on booking
- **Data Visible**:
  - Operator name (business name)
  - Bid amount (₹)
  - Truck details (registration, type)
  - Operator rating
  - Bidding timestamp
- **Data Masked**: Operator phone number (masked: +91 XXXXX X1234)
- **Action Options**:
  - View bid details
  - Accept bid (manual)
  - Wait for more bids
  - Cancel booking

#### Step 3: Accept Bid (Manual)
- **Action**: Shipper manually selects and accepts a bid
- **System Action**:
  - Selected bid status → `ACCEPTED`
  - All other bids → `REJECTED`
  - Booking status → `CONFIRMED`
  - Shipment created automatically
- **Visible**: Booking status changes to "Confirmed - Awaiting Driver Assignment"

#### Step 4: Review Driver Assignment Request
- **Notification**: "Driver assignment pending your approval"
- **View**: Driver details screen
- **Data Visible**:
  - Driver name
  - Driver license number (masked: KA-XXXX-1234)
  - Driver rating/experience
  - Truck assignment details
  - Driver photo (if available)
- **Data Masked**: Driver phone number (masked: +91 XXXXX X5678)
- **Action Options**:
  - Approve driver assignment
  - Reject driver assignment (with reason)

#### Step 5: Approve Driver
- **Action**: Shipper approves driver
- **System Action**:
  - Assignment status → `APPROVED`
  - Shipment status → `ASSIGNED`
  - Driver status → `ON_TRIP`
- **Visible**: Booking status → "Driver Assigned - Ready for Pickup"

#### Step 6: Track Shipment (Live)
- **View**: Real-time GPS tracking map
- **Data Visible**:
  - Current truck location (updated every 60 seconds)
  - Route path
  - Estimated arrival time
  - Shipment timeline stages
- **Alert**: If no GPS ping for 30+ minutes → Alert notification
- **Timeline Stages Visible**:
  - Assigned
  - En Route to Pickup
  - Pickup Completed
  - In Transit
  - En Route to Delivery
  - Delivery Completed

#### Step 7: Provide OTP for Delivery
- **Trigger**: Driver reaches delivery location
- **Action**: Shipper receives OTP request
- **View**: OTP display screen
- **Data**: 6-digit OTP (valid for 24 hours)
- **Action**: Share OTP with driver (or delivery contact person)

#### Step 8: Delivery Completion
- **Action**: Driver enters OTP to complete delivery
- **System Action**:
  - Shipment status → `DELIVERED`
  - Booking status → `COMPLETED`
- **View**: Delivery confirmation screen
- **Visible**: Payment details (cash payment on delivery)

---

### **OPERATOR APP**

#### Step 1: View Available Bookings
- **View**: List of open bookings (matching filters)
- **Filters Available**:
  - Route (from city → to city)
  - Material type
  - Weight range
  - Date range
- **Data Visible**:
  - Booking ID
  - Route (from → to)
  - Material, weight, body type
  - Posted date/time
  - Current bid count
  - Lowest bid amount (if bids exist)

#### Step 2: Select Booking & Place Bid
- **Action**: Operator selects booking to bid on
- **Validation Checks**:
  - ✅ Only ONE active bid per operator per booking (enforced)
  - ✅ Ledger balance sufficient for bidding fee
  - ✅ Operator has verified trucks available
- **Bid Entry**:
  - Select truck from fleet
  - Enter bid amount
  - Add notes (optional)
- **System Action**:
  - Bidding fee calculated: (₹5 × tonnage) + (₹0.25 × distance)
  - Fee deducted from operator ledger (if balance sufficient)
  - Bid status → `PENDING`
  - Booking shows operator's bid in list

#### Step 3: Update Existing Bid
- **Scenario**: Operator wants to change bid amount or truck
- **Action**: Update existing pending bid
- **System Action**:
  - Old bid updated (no new fee charged)
  - Bid timestamp updated
- **Restriction**: Cannot place second bid (enforced by system)

#### Step 4: Bid Acceptance/Rejection
- **View**: Bid status notification
- **If Accepted**:
  - Bid status → `ACCEPTED`
  - Booking status → `CONFIRMED`
  - Shipment created automatically
  - Visible in "My Shipments" → Status: "Assigned - Awaiting Driver"
- **If Rejected**:
  - Bid status → `REJECTED`
  - Bidding fee NOT refunded (business rule)
  - Booking no longer visible in active list

#### Step 5: Assign Driver to Shipment
- **Action**: Operator assigns driver to accepted shipment
- **Validation Checks**:
  - ✅ Driver belongs to operator
  - ✅ Driver has only ONE active shipment (enforced)
  - ✅ Driver is available
  - ✅ Driver KYC verified
- **Driver Selection**:
  - View available drivers
  - Select driver
  - Submit assignment request
- **System Action**:
  - Assignment status → `PENDING_SHIPPER_APPROVAL`
  - Driver status → `ASSIGNED` (temporary, until shipper approves)
  - Notification sent to shipper

#### Step 6: Driver Approval/Rejection Received
- **If Approved**:
  - Assignment status → `APPROVED`
  - Driver status → `ON_TRIP`
  - Shipment status → `ASSIGNED`
  - Visible: "Driver Approved - Ready for Pickup"
- **If Rejected**:
  - Assignment status → `REJECTED`
  - Driver status → `AVAILABLE` (released)
  - Action: Assign different driver (restart Step 5)

#### Step 7: Monitor Shipment Progress
- **View**: Active shipments dashboard
- **Data Visible**:
  - Shipment status
  - Driver name
  - Current location (live GPS)
  - Timeline stages
  - Estimated completion time
- **Actions Available**:
  - View shipment details
  - Contact driver (operator sees full driver phone number)
  - Report issue/breakdown

#### Step 8: Shipment Completion
- **View**: Delivery completion notification
- **Data Visible**:
  - Delivery timestamp
  - OTP used (confirmation)
  - Payment status
- **System Action**: Shipment status → `DELIVERED`

---

### **DRIVER APP**

#### Step 1: View Assigned Shipment
- **Trigger**: Driver assigned to shipment (after shipper approval)
- **View**: Shipment details screen
- **Data Visible**:
  - Pickup location (full address)
  - Drop location (full address)
  - Material details
  - Weight
  - Booking ID
  - Shipper contact (masked: +91 XXXXX X1234)
  - Pickup contact person & number

#### Step 2: Start Journey to Pickup
- **Action**: Driver confirms "En Route to Pickup"
- **System Action**: Shipment status → `EN_ROUTE_TO_PICKUP`
- **GPS Tracking**: Starts automatically (pings every 60 seconds)
- **Visible**: Route navigation to pickup location

#### Step 3: Complete Pickup
- **Action**: Driver reaches pickup location
- **Action**: Driver marks "Pickup Completed"
- **System Action**: Shipment status → `PICKUP_COMPLETED`
- **Visible**: Next step → "In Transit to Delivery"

#### Step 4: In Transit
- **Status**: Shipment status → `IN_TRANSIT`
- **GPS Tracking**: Continuous (every 60 seconds)
- **Visible**: Route to delivery location
- **Alert**: If GPS ping stops for 30+ minutes → System alert to operator/admin

#### Step 5: En Route to Delivery
- **Action**: Driver approaches delivery location
- **System Action**: Shipment status → `EN_ROUTE_TO_DELIVERY`
- **Visible**: Delivery location details

#### Step 6: Request OTP for Delivery
- **Action**: Driver reaches delivery location
- **Action**: Driver requests OTP from shipper
- **System Action**: OTP request sent to shipper
- **View**: "Waiting for OTP" screen

#### Step 7: Enter OTP & Complete Delivery
- **Action**: Driver enters 6-digit OTP (received from shipper/delivery contact)
- **Validation**: OTP verified (must be valid, within 24-hour expiry)
- **System Action**:
  - Shipment status → `DELIVERED`
  - Driver status → `AVAILABLE` (can take new shipment)
- **View**: Delivery completion confirmation

#### Step 8: View Payment Details
- **View**: Payment receipt screen
- **Data Visible**:
  - Shipment ID
  - Payment amount
  - Payment method: CASH
  - Delivery timestamp

---

### **ADMIN PORTAL**

#### Visibility & Monitoring
- **Dashboard**: All bookings, bids, shipments (real-time)
- **Data Visible**:
  - All booking details (full shipper info)
  - All bid details (full operator info)
  - All shipment details (full driver info)
  - All KYC data (unmasked, full access)
  - GPS tracking (all shipments)
  - Payment transactions
  - System alerts (GPS tracking failures, document expiries)

#### Interventions
- **Booking Issues**: Can view/cancel problematic bookings
- **Bid Disputes**: Can review and resolve bid conflicts
- **Shipment Issues**: Can intervene in stalled shipments
- **Driver/Truck Issues**: Can block drivers/trucks
- **Payment Disputes**: Can review and resolve payment issues

#### Reporting
- **Analytics**: Booking volumes, bid patterns, completion rates
- **Revenue**: Fee collection, distribution tracking
- **Compliance**: Document expiry monitoring, KYC status

---

### **FRANCHISE UNIT PORTAL**

#### Visibility
- **Local Operations**: Bookings/shipments within unit jurisdiction
- **Data Visible**:
  - Local operators (in unit)
  - Local bookings
  - Local shipments
  - Payment transactions (local)
- **Data Masked**: Shipper/operator contact details (limited access)

#### Actions
- **Local Support**: Assist local operators/drivers
- **Issue Resolution**: Handle local disputes
- **Reporting**: Generate local operational reports

#### Revenue Visibility
- **Fee Distribution**: See unit's 5% share
- **Payout Tracking**: Monitor unit-level payouts from HQ

---

### **FRANCHISE DISTRICT PORTAL**

#### Visibility
- **District-Wide Operations**: All units within district
- **Data Visible**:
  - District-wide bookings/shipments
  - All units' performance
  - District revenue
- **Data Masked**: Limited access (same as unit level)

#### Actions
- **District Management**: Oversee all units
- **Cross-Unit Coordination**: Coordinate shipments across units
- **Reporting**: Generate district-level reports

#### Revenue Visibility
- **District Share**: Aggregate 5% from all units
- **Payout Management**: District-level payout tracking

---

## ✅ RULE COMPLIANCE SCAN

### Booking & Bidding Rules
- ✅ **ONE active bid per operator per booking** - Enforced in bids service
- ✅ **Bidding fee auto-deducted** - Fee = (₹5 × tonnage) + (₹0.25 × distance)
- ✅ **Lowest bid auto-finalizes** - If shipper inactive 24h, auto-accept lowest bid
- ✅ **NO refunds on cancellation** - Bidding fees retained if booking cancelled

### Shipment & Driver Rules
- ✅ **Driver approval required** - Assignment must be approved by shipper
- ✅ **One active shipment per driver** - Enforced in driver assignment service
- ✅ **OTP required for delivery** - 6-digit OTP, 24-hour expiry

### Payment Rules
- ✅ **Cash payments only** - No online payment options
- ✅ **Ledger cannot go negative** - Balance check before fee deduction

### Tracking Rules
- ✅ **GPS ping every 60 seconds** - Continuous tracking
- ✅ **Alert if no ping for 30 minutes** - System alert generated

### Privacy Rules
- ✅ **Masked phone numbers** - Shipper sees masked operator/driver numbers
- ✅ **KYC encrypted** - Only admin sees full KYC details
- ✅ **No SMS/WhatsApp** - In-app notifications only

---

## 🔍 INCONSISTENCY DETECTION

### ✅ No Violations Detected

All workflow steps comply with business rules:
- Driver approval checkpoint exists
- One bid per operator enforced
- OTP requirement enforced
- Masking implemented correctly
- Tracking intervals correct

---

## 📋 CORRECTED WORKFLOW

**Status**: ✅ **NO CORRECTIONS NEEDED**

Workflow is fully compliant with all Rodistaa business rules.

---

## 🔄 WORKFLOW VARIATIONS

### Variation A: Auto-Finalization
- **Trigger**: Shipper inactive for 24 hours with pending bids
- **System Action**: Auto-accept lowest bid, reject others
- **Shipper View**: Notification "Booking auto-confirmed - Lowest bid accepted"
- **Operator View**: Bid automatically accepted/rejected
- **Result**: Proceeds to Step 4 (Driver Assignment) automatically

### Variation B: Booking Cancellation
- **Trigger**: Shipper cancels booking after bids placed
- **System Action**: All pending bids → `REJECTED`, NO refunds
- **Operator Impact**: Bidding fees retained (business rule)
- **Shipper Impact**: Booking status → `CANCELLED`

---

## 📊 WORKFLOW STATUS TRANSITIONS

### Booking Status Flow
```
POSTED → OPEN → CONFIRMED → ASSIGNED → IN_TRANSIT → DELIVERED → COMPLETED
         ↓
      CANCELLED (any time)
```

### Bid Status Flow
```
PENDING → ACCEPTED → (creates shipment)
       → REJECTED (manual or auto)
       → REJECTED (on booking cancellation)
```

### Shipment Status Flow
```
ASSIGNED → EN_ROUTE_TO_PICKUP → PICKUP_COMPLETED → IN_TRANSIT → 
EN_ROUTE_TO_DELIVERY → DELIVERED
```

### Driver Assignment Status Flow
```
PENDING_SHIPPER_APPROVAL → APPROVED → (driver active)
                        → REJECTED → (driver released)
```

---

**Workflow Mapping Status**: ✅ **COMPLETE & COMPLIANT**

