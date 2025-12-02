# 🗺️ RODISTAA MASTER BUSINESS FLOW MAPS v1.0

**End-to-End, Cross-App, Cross-Role Flow Architecture**

**Version**: 1.0  
**Effective Date**: December 19, 2024  
**Status**: ✅ **BINDING REFERENCE FOR ALL BUSINESS FLOWS**

---

## 📘 PURPOSE

This Master Business Flow Maps document provides **end-to-end, cross-app, cross-role flow architecture** for all major Rodistaa business processes.

These flow maps are structured into **10 master flows**, each showing actions and visibility for:
- **Shipper**
- **Operator**
- **Driver**
- **Admin**
- **Unit Franchise**
- **District Franchise**
- **System**

**This is the complete flow architecture for all business operations.**

---

## 🗺️ FLOW ARCHITECTURE OVERVIEW

### 10 Master Flows

1. **Booking Creation Flow**
2. **Bidding Flow**
3. **Auto-Finalization Flow**
4. **Shipment Creation Flow**
5. **Driver Assignment Flow**
6. **Compliance & Inspection Flow**
7. **Tracking Flow**
8. **Accident/Breakdown (Alternate Truck) Flow**
9. **Delivery & OTP Completion Flow**
10. **Escalation & Governance Flow**

Each flow maps the complete journey from start to completion, showing all role interactions and system validations.

---

## 🟥 FLOW 1 — BOOKING CREATION FLOW

### Flow Overview

**Purpose**: Create a new booking and publish it to the marketplace for bidding.

**Start Condition**: Shipper wants to post a load  
**End Condition**: Booking is public and available for bidding  
**Final State**: `OPEN_FOR_BIDDING`

---

### Shipper App Actions

#### Step 1: Enter Booking Details
**Shipper Actions**:
- Enters pickup location (address, coordinates)
- Enters drop location (address, coordinates)
- Enters goods description (cargo type, specifications)
- Enters tonnage (weight in tons)

**Validation**: All fields must be completed before proceeding.

---

#### Step 2: AI Price Generation
**System Action**:
- AI generates expected price based on:
  - Distance (pickup to drop)
  - Tonnage
  - Route type
  - Market rates
  - Historical data

**Shipper Visibility**: 
- ✅ Sees expected price
- ✅ Uses expected price as reference

**Operator Visibility**: 
- ❌ Cannot see expected price

---

#### Step 3: Price Range Selection
**Shipper Actions**:
- Shipper adjusts price range from expected price
- Can set range higher or lower
- Confirms price range

**Shipper Visibility**:
- ✅ Sees expected price and price range

**Operator Visibility**:
- ✅ Sees price range only (not expected price)

---

#### Step 4: Booking Confirmation
**Shipper Actions**:
- Reviews all booking details
- Confirms booking creation
- Booking moves to `OPEN_FOR_BIDDING` state

**Validation**: KYC must be approved before booking can be published.

---

### Operator App Visibility

**Operator Sees Booking Only If**:

#### Meets Truck Category
- Booking requires truck type that operator has
- Operator has eligible trucks (HGV, 2018+, BS4/BS6, NP valid)

#### Operator KYC Approved
- Operator KYC status is `APPROVED`
- KYC verification complete

#### Operator Ledger ≥ Bidding Fee
- Operator ledger balance sufficient for bidding fee
- Bidding fee calculated: ₹5 × tonnage + ₹0.25 × distance

#### Operator Not Blocked
- Operator account not blocked
- No active suspensions
- No compliance violations blocking access

**Operator Actions**: Can view booking details (price range only) and place bid.

---

### Driver App Visibility

**No Visibility**.

**Driver Actions**: None at this stage.

**Reason**: Drivers are assigned after bidding, not involved in booking creation.

---

### Admin Portal Actions

**Read-only view of booking creation**.

**Admin Can View**:
- ✅ All booking details
- ✅ Shipper information (masked)
- ✅ Expected price and price range
- ✅ Booking status
- ✅ Creation timestamp

**Admin Actions**:
- View booking details
- Monitor booking activity
- No modification capability (read-only)

---

### Franchise Portal Actions

**No involvement**.

**Franchise Actions**: None at this stage.

**Reason**: Franchises are involved in inspections and compliance, not booking creation.

---

### System Actions

#### Validates Booking Completeness
- ✅ Pickup location provided
- ✅ Drop location provided
- ✅ Goods description provided
- ✅ Tonnage provided
- ✅ Price range set

#### Ensures Shipper KYC
- ✅ Shipper KYC status checked
- ✅ Booking creation blocked if KYC not approved
- ✅ KYC approval required before publishing

#### Publishes Booking into Marketplace
- ✅ Booking status set to `OPEN_FOR_BIDDING`
- ✅ Booking visible to eligible operators
- ✅ Booking available for bidding

---

### Flow Completion

**End of Flow 1**: Booking is now public.

**Next Flow**: Bidding Flow (Flow 2)

**Booking State**: `OPEN_FOR_BIDDING`

---

## 🟧 FLOW 2 — BIDDING FLOW

### Flow Overview

**Purpose**: Operators place bids on open bookings, with shipper negotiation capability.

**Start Condition**: Booking is `OPEN_FOR_BIDDING`  
**End Condition**: Bid accepted by shipper or auto-finalization triggered  
**Final State**: `BID_ACCEPTED` or `AUTO_FINALIZED`

---

### Operator App Actions

#### Step 1: View Booking
**Operator Visibility**:
- ✅ Sees booking details (pickup, drop, goods, tonnage)
- ✅ Sees price range only (not expected price)
- ✅ Cannot see other operators' bid amounts

**Operator Actions**: Views booking and decides to bid.

---

#### Step 2: Enter Bid
**Operator Actions**:
- Enters bid amount (must be within price range)
- Reviews bidding fee calculation
- Confirms bid submission

**Validation**: Bid amount must fall within shipper's price range.

---

#### Step 3: System Fee Calculation
**System Actions**:
- Calculates bidding fee: ₹5 × tonnage + ₹0.25 × distance (km)
- Checks operator ledger balance
- Validates fee can be deducted

**Operator Visibility**: 
- ✅ Sees calculated bidding fee
- ✅ Sees ledger balance after deduction (if sufficient)

---

#### Step 4: Ledger Check & Fee Deduction
**System Validations**:
- ✅ Ledger balance ≥ bidding fee
- ✅ Ledger cannot go negative
- ✅ Insufficiency = BLOCK (bid rejected)

**If Ledger Sufficient**:
- Fee auto-deducted from ledger
- Bid placed successfully

**If Ledger Insufficient**:
- Bid rejected
- Operator notified
- Ledger top-up required

---

#### Step 5: Bid State
**System Actions**:
- Bid state set to `ACTIVE_BID`
- Operator notified of successful bid placement
- Bid visible to shipper

**Operator Visibility**:
- ✅ Sees own bid status: `ACTIVE_BID`
- ✅ Can modify bid unlimited times

---

### Shipper App Actions

#### Views List of Bids
**Shipper Sees**:
- ✅ Bid amount
- ✅ Masked operator details (name, rating)
- ✅ Time of bid
- ✅ Bid status

**Shipper Cannot See**:
- ❌ Operator phone numbers (masked)
- ❌ Other bid amounts (if comparing)
- ❌ Operator ledger balance

**Shipper Actions**:
- Can view all bids
- Can negotiate with operators (unlimited times)
- Can accept a bid
- Can wait for auto-finalization

---

### Admin Portal Actions

#### Monitor Bids
**Admin Can View**:
- ✅ All bids on all bookings
- ✅ Bid amounts and operators
- ✅ Bid timestamps
- ✅ Operator ledger status

**Admin Actions**:
- Monitor bid activity
- Detect abnormal patterns (collusion, manipulation)
- Investigate suspicious bidding

---

### System Validations

**System Ensures**:

#### One Active Bid per Operator
- ✅ Operator can have only one active bid per booking
- ✅ Submitting new bid cancels previous bid
- ✅ Multiple bids not allowed

#### Unlimited Modifications Allowed
- ✅ Operator can modify bid unlimited times
- ✅ Each modification requires ledger balance check
- ✅ Modified bid must still be within price range

#### Ledger Never Negative
- ✅ System prevents negative ledger balance
- ✅ Bid rejected if balance insufficient
- ✅ Hard limit at zero enforced

---

### Franchise Portal Actions

**No role**.

**Franchise Actions**: None at this stage.

**Reason**: Franchises are not involved in bidding process.

---

### Flow Completion

**End of Flow 2**: Bids accumulate.

**Next Flow**: Auto-Finalization Flow (Flow 3) or Shipment Creation Flow (Flow 4)

**Bid State**: `ACTIVE_BID` or `ACCEPTED`

---

## 🟨 FLOW 3 — AUTO-FINALIZATION FLOW

### Flow Overview

**Purpose**: Automatically select lowest bid if shipper is inactive for configured time period.

**Start Condition**: At least one bid exists, shipper inactive for configured time  
**End Condition**: Lowest bid auto-accepted, shipment created  
**Final State**: `FINALIZED` (auto-finalized)

---

### Trigger Conditions

**System Configuration**:
- **Trigger Time**: Shipper inactive for **24 hours** (configurable)
- **Minimum Bids**: At least one active bid must exist
- **Shipper Action**: No manual bid acceptance during trigger period

**Auto-Finalization Cannot Occur If**:
- Shipper has accepted a bid manually
- Booking is cancelled
- No active bids exist

---

### System Actions

#### Step 1: Detect Shipper Inactivity
**System Monitoring**:
- Tracks shipper activity on booking
- Measures time since last action
- Detects when inactivity threshold reached

**Inactivity Timer**: 
- Starts when first bid is placed
- Resets if shipper takes any action
- Triggers auto-finalization at 24 hours

---

#### Step 2: Sort Bids by Lowest Price
**System Logic**:
- Retrieves all active bids for booking
- Sorts bids by amount (ascending order)
- Selects lowest bid amount

**Tie-Breaker**: If multiple bids at same lowest amount, earliest bid wins.

---

#### Step 3: Select Lowest Valid Bid
**System Validation**:
- ✅ Bid is still active (not withdrawn)
- ✅ Operator account not blocked
- ✅ Operator ledger sufficient (already checked at bid time)
- ✅ Truck eligibility maintained

**Selection**: Lowest bid that meets all criteria is selected.

---

#### Step 4: Auto-Finalize
**System Actions**:
- Lowest bid marked as `ACCEPTED`
- Booking state changes to `FINALIZED` (auto-finalized)
- Shipment creation process initiated
- All other bids automatically set to `REJECTED`

---

#### Step 5: Notify Parties
**System Notifications**:
- **Shipper**: Receives "Auto-Finalized" notification with winning bid details
- **Winning Operator**: Receives "Bid Winner" notification
- **Other Operators**: Receive "Bid Rejected" notification

---

### Shipper App Actions

#### Receives Auto-Finalization Notification
**Shipper Sees**:
- ✅ "Booking Auto-Finalized" notification
- ✅ Winning bid amount
- ✅ Winning operator details (masked)
- ✅ Can proceed with shipment tracking once driver assigned

**Shipper Actions**:
- Can view shipment details
- Can track shipment once driver assigned
- Cannot reject auto-finalization (binding decision)

**No Refund**: Shipper cannot claim refund if auto-finalization occurred.

---

### Operator App Actions

#### Winning Operator
**Receives "Bid Winner" Notification**:
- ✅ Notification of bid acceptance
- ✅ Booking details
- ✅ Next steps: assign truck and driver

**Actions**:
- Must assign truck and driver
- Must submit for shipper approval
- Can proceed to Shipment Creation Flow

---

#### Other Operators
**Receive "Bid Rejected" Notification**:
- ✅ Notification of bid rejection
- ✅ Reason: Auto-finalization selected different bid
- ✅ Bidding fee not refunded (standard policy)

**Actions**:
- Can bid on other bookings
- No further action on this booking

---

### Admin Portal Actions

**Sees auto-finalization log**.

**Admin Can View**:
- ✅ Auto-finalization events
- ✅ Selected bid and operator
- ✅ Timestamp of auto-finalization
- ✅ Shipper inactivity period

**Admin Actions**:
- Monitor auto-finalization patterns
- Review auto-finalization logs
- Investigate if issues reported

---

### Franchise Portal Actions

**No involvement**.

**Franchise Actions**: None at this stage.

**Reason**: Franchises are not involved in auto-finalization process.

---

### Flow Completion

**End of Flow 3**: Booking finalized, ready for shipment creation.

**Next Flow**: Shipment Creation Flow (Flow 4)

**Booking State**: `FINALIZED` (auto-finalized)

---

## 🟩 FLOW 4 — SHIPMENT CREATION FLOW

### Flow Overview

**Purpose**: Create shipment from finalized booking and prepare for driver assignment.

**Start Condition**: Bid accepted (manual or auto-finalization)  
**End Condition**: Shipment created, ready for driver assignment  
**Final State**: `ASSIGNING_DRIVER`

---

### Trigger Events

**Shipment Creation Triggered By**:

#### Shipper Accepts a Bid
- Shipper manually selects a bid
- Confirms bid acceptance
- Shipment creation initiated

#### Auto-Finalization Chooses Lowest Bid
- System auto-selects lowest bid
- Auto-finalization completes
- Shipment creation initiated automatically

---

### System Actions

#### Step 1: Create New Shipment ID
**System Generation**:
- Creates unique shipment ID
- Links shipment to booking
- Preserves all booking details
- Sets initial shipment state

**Shipment Data**:
- Booking reference
- Shipper information
- Pickup and drop locations
- Cargo details
- Agreed price

---

#### Step 2: Assign Operator as Winner
**System Assignment**:
- Winning operator assigned to shipment
- Operator linked to shipment ID
- Operator notification sent

**System Validation**:
- ✅ Operator account still active
- ✅ Operator not blocked
- ✅ Operator eligibility maintained

---

#### Step 3: Block Other Operators
**System Actions**:
- All other bids on booking marked as `REJECTED`
- Other operators cannot access this booking
- Booking no longer available for bidding

**Reason**: Booking is now assigned, no further bids allowed.

---

#### Step 4: Set Shipment State
**System Actions**:
- Shipment state set to `ASSIGNING_DRIVER`
- Shipment ready for truck and driver assignment
- Next step: Operator assigns truck and driver

---

### Operator App Actions

#### Must Assign Compliant Truck
**Operator Actions**:
- Selects truck from eligible trucks
- Truck must meet all eligibility criteria:
  - HGV, 2018+, BS4/BS6, National Permit valid
  - Not blocked
  - Documents not expired
  - Inspection current

**Validation**: System validates truck eligibility before assignment.

---

#### Must Assign Driver
**Operator Actions**:
- Selects driver from linked drivers
- Driver must be:
  - KYC verified
  - License valid
  - Not have active shipment

**Validation**: System validates driver eligibility before assignment.

---

#### Submit for Shipper Approval
**Operator Actions**:
- Submits truck and driver assignment
- Triggers shipper approval request
- Waits for shipper approval

**Next Step**: Driver Assignment & Approval Flow (Flow 5)

---

### Shipper App Actions

#### Sees Assignment Request
**Shipper Sees**:
- ✅ Selected operator (masked details)
- ✅ Driver approval pending status
- ✅ Truck details (if visible)
- ✅ Request to approve driver

**Shipper Actions**:
- Can view driver details (masked)
- Can approve or reject driver
- Cannot proceed without approval

---

### Driver App Actions

#### Sees Assignment Notification
**Driver Sees**:
- ✅ "Pending Assignment" status
- ✅ Shipment details (pickup, drop, cargo)
- ✅ Awaiting shipper approval

**Driver Actions**:
- Can view shipment details
- Cannot proceed until approved
- Receives notification when approved

---

### Admin Portal Actions

**Has read-only view unless incident arises**.

**Admin Can View**:
- ✅ Shipment details
- ✅ Operator assignment
- ✅ Driver assignment status
- ✅ Shipper approval status

**Admin Actions**:
- Monitor shipment creation
- View shipment timeline
- Intervene only if incident occurs

---

### Franchise Portal Actions

**Not involved yet**.

**Franchise Actions**: None at this stage.

**Reason**: Franchises become involved during inspection and compliance phases.

---

### Flow Completion

**End of Flow 4**: Shipment exists but not active.

**Next Flow**: Driver Assignment & Approval Flow (Flow 5)

**Shipment State**: `ASSIGNING_DRIVER`

---

## 🟦 FLOW 5 — DRIVER ASSIGNMENT & APPROVAL FLOW

### Flow Overview

**Purpose**: Assign truck and driver to shipment with shipper approval.

**Start Condition**: Shipment created, operator ready to assign  
**End Condition**: Driver approved, shipment ready to start  
**Final State**: `DRIVER_PENDING_APPROVAL` → `APPROVED` → `IN_TRANSIT`

---

### Operator App Actions

#### Step 1: Select Truck
**Operator Actions**:
- Selects truck from eligible trucks
- Truck must pass compliance rules:
  - HGV, 2018+, BS4/BS6, National Permit valid
  - Documents not expired
  - Inspection current (within 120 days)
  - Not blocked

**System Validation**: Truck eligibility verified automatically.

---

#### Step 2: Select Driver
**Operator Actions**:
- Selects driver from linked drivers
- Driver must be:
  - KYC verified and approved
  - License valid (non-expired)
  - Not have active shipment (one active shipment per driver)

**System Validation**: Driver eligibility verified automatically.

---

#### Step 3: Send for Shipper Approval
**Operator Actions**:
- Submits truck and driver assignment
- Triggers approval request to shipper
- Waits for shipper response

**Assignment Data**:
- Truck details (registration, model, year)
- Driver details (name, rating, masked contact)

---

### Shipper App Actions

#### Receives Driver Request
**Shipper Sees**:
- ✅ Driver approval request notification
- ✅ Driver rating (if available)
- ✅ Driver name
- ✅ Masked contact information
- ✅ Truck details (if visible)

**Shipper Cannot See**:
- ❌ Full driver phone number (masked)
- ❌ Driver full address
- ❌ Operator full details

---

#### Approves or Rejects
**Shipper Actions**:

**If Approves**:
- Driver assignment confirmed
- Shipment status changes to `APPROVED`
- Shipment ready to start (status: `IN_TRANSIT`)
- Driver notified of approval

**If Rejects**:
- Driver assignment rejected
- Operator notified
- Operator must assign different driver
- Process repeats with new driver

**Cannot Bypass**: Shipper approval is mandatory. Cannot skip this step.

---

### Driver App Actions

#### Receives Assignment Notification
**Driver Sees**:
- ✅ "Awaiting Approval" status
- ✅ Shipment details (pickup, drop, cargo)
- ✅ Truck assignment details

**Driver Actions**:
- Can view shipment information
- Cannot start shipment until approved
- Waits for shipper approval

---

#### Once Approved
**Driver Sees**:
- ✅ Shipment appears in driver dashboard
- ✅ Shipment status: `IN_TRANSIT` (ready to start)
- ✅ Pickup location and details

**Driver Actions**:
- Can start shipment
- Can navigate to pickup location
- Can begin tracking

---

### Admin Portal Actions

**Only involved if disputes or unresponsive shipper**.

**Admin Scenarios**:

#### Dispute Handling
- Shipper-operator dispute
- Driver assignment conflicts
- Approval issues

#### Unresponsive Shipper
- Shipper not responding to approval request
- Admin can intervene if needed
- Override with proper justification

**Admin Actions**:
- View assignment status
- Monitor approval requests
- Intervene only when necessary

---

### System Validations

**System Ensures**:

#### Driver Must Not Have Active Shipment
- ✅ Checks driver's active shipments
- ✅ Prevents assignment if driver has active shipment
- ✅ One active shipment per driver enforced

#### Truck Must Not Be Blocked
- ✅ Verifies truck compliance status
- ✅ Checks for blocks or suspensions
- ✅ Prevents assignment of blocked trucks

#### Operator Cannot Assign More Than 10 Trucks Total
- ✅ Verifies operator truck count
- ✅ Prevents exceeding 10-truck limit
- ✅ Hard limit enforcement

#### Compliance Checks Run Automatically
- ✅ Truck eligibility verified
- ✅ Driver KYC verified
- ✅ Document expiry checked
- ✅ Inspection status validated

---

### Flow Completion

**End of Flow 5**: Driver approved, shipment ready to start.

**Next Flow**: Tracking Flow (Flow 7) or Compliance & Inspection Flow (Flow 6)

**Shipment State**: `APPROVED` → `IN_TRANSIT`

---

## 🟪 FLOW 6 — COMPLIANCE & INSPECTION FLOW

### Flow Overview

**Purpose**: Conduct mandatory truck inspections and enforce compliance requirements.

**Start Condition**: Truck requires inspection (120-day cycle) or compliance check  
**End Condition**: Inspection completed, compliance verified  
**Final State**: `PASSED` or `FAILED` (with auto-block if failed)

---

### Unit Franchise Actions

#### Step 1: Receive Truck Inspection Tasks
**Unit Franchise Receives**:
- ✅ Inspection schedule (120-day cycle)
- ✅ Truck details (registration, model, year, operator)
- ✅ Inspection due date
- ✅ Previous inspection history

**Unit Franchise Actions**:
- Schedules inspection appointment
- Contacts operator for inspection
- Arranges inspection location

---

#### Step 2: Perform Physical Inspection
**Unit Franchise Conducts**:
- Physical verification of truck
- Complete inspection checklist
- Visual inspection of all components

**Inspection Checklist**:
- ✅ Tyres (condition, tread depth, pressure)
- ✅ Lights (headlights, taillights, indicators)
- ✅ Brakes (brake pad condition, brake fluid)
- ✅ Mirrors (all mirrors present and functional)
- ✅ Body (structural integrity, damage)
- ✅ Number plate visibility (clear and legible)

**Documentation**:
- Inspection report completed
- Findings documented
- Pass/fail determination

---

#### Step 3: Upload Geo-Tagged Photos
**Unit Franchise Actions**:
- Uploads inspection photos (multiple angles)
- Photos must be geo-tagged (location verification)
- Photos must be timestamped
- Photos show truck condition and components

**Photo Requirements**:
- Clear, high-quality images
- Show all checked components
- Verify truck identity (number plate visible)
- Location verified via geotag

---

#### Step 4: Mark Truck Status
**Unit Franchise Determines**:

**If PASS**:
- Truck marked as `PASSED`
- Inspection record updated
- Next inspection due in 120 days
- Truck remains active

**If FAIL**:
- Truck marked as `FAILED`
- Failure reasons documented
- Auto-block triggered immediately
- Truck blocked from bidding

---

### District Franchise Actions

#### Step 1: Audit Random Inspections
**District Franchise Conducts**:
- Random sampling of Unit Franchise inspections
- Quality control and accuracy verification
- Review of inspection reports and photos

**Audit Scope**:
- Inspection report completeness
- Photo authenticity verification
- Checklist completion verification
- Pass/fail determination accuracy

---

#### Step 2: Validate Quality
**District Franchise Validates**:
- Inspection quality meets standards
- Photos are authentic (not reused or manipulated)
- Checklist items properly verified
- Pass/fail decisions justified

**Quality Issues Detected**:
- Fake inspection photos → Strike to Unit Franchise
- Incomplete inspections → Strike to Unit Franchise
- Poor quality → Retraining required

---

#### Step 3: Issue Strikes for Poor Inspections
**District Franchise Actions**:
- Issues strikes to Unit Franchise for violations
- Strike system enforcement:
  - 1 Strike: Warning
  - 2 Strikes: Retraining
  - 3 Strikes: Payout hold
  - 4 Strikes: Suspension
  - 5 Strikes: Termination

---

### Admin Portal Actions

**Receives compliance alerts**.

**Admin Alerts**:

#### Expired Docs
- Alert when truck documents expire
- RC, Fitness, Insurance, Permit, Pollution expiry
- Auto-block status notification

#### Inspection Overdue
- Alert when inspection overdue (>120 days)
- Grace period expired
- Auto-block triggered

#### Fake Inspection Suspicion
- Alert when fake inspection detected
- Photo manipulation identified
- Investigation required

**Admin Actions**:
- Review compliance alerts
- Investigate violations
- Monitor auto-block status
- Override if justified (with authorization)

---

### System Actions

#### Auto-Block Triggers

**System Auto-Blocks If**:

#### Documentation Expired
- RC (Registration Certificate) expired
- Fitness Certificate expired
- Insurance Certificate expired
- National Permit expired
- Pollution Certificate (PUC) expired

#### Inspection Overdue
- Last inspection date >120 days ago
- No inspection scheduled or in progress
- Grace period expired

#### Compliance Flag Present
- Failed inspection
- Compliance violation detected
- Safety issue identified

**Auto-Block Process**:
1. System detects violation
2. Automatic block applied immediately
3. Operator notified
4. Bidding access blocked
5. Compliance restoration required before unblocking

---

### Flow Completion

**End of Flow 6**: Inspection completed, compliance status verified.

**Next Flow**: Continues as part of ongoing compliance monitoring

**Truck Status**: `PASSED` (active) or `FAILED` (blocked)

---

## 🟫 FLOW 7 — TRACKING FLOW

### Flow Overview

**Purpose**: Real-time GPS tracking of active shipments with continuous monitoring.

**Start Condition**: Shipment status is `IN_TRANSIT`, `AT_PICKUP`, or `AT_DESTINATION`  
**End Condition**: Shipment completed or tracking stopped  
**Final State**: `COMPLETED` (tracking ends)

---

### Driver App Actions

#### Step 1: Send GPS Pings
**Driver App Actions**:
- Automatically sends GPS location every 60 seconds
- Continuous transmission during active shipment
- Cannot be disabled by driver

**GPS Data Transmitted**:
- GPS coordinates (latitude, longitude)
- Timestamp
- Speed
- Direction
- Accuracy

**Driver Cannot**:
- ❌ Disable GPS tracking
- ❌ Stop ping transmission
- ❌ Manipulate location data

---

### Operator App Actions

#### Step 2: View Real-Time Tracking
**Operator Visibility**:
- ✅ Sees real-time tracking map for active shipments
- ✅ Current driver location
- ✅ Route progress
- ✅ Estimated time to destination

**Operator Actions**:
- Monitor shipment progress
- Contact driver if needed (masked communication)
- View tracking history

**Operator Can See**:
- ✅ Active shipments assigned to operator
- ✅ Real-time GPS location
- ✅ Route visualization

**Operator Cannot See**:
- ❌ Other operators' shipments
- ❌ Shipper location (unless pickup/drop)

---

### Shipper App Actions

#### Step 3: View Live Location
**Shipper Visibility**:
- ✅ Sees live location (masked route)
- ✅ Current driver location on map
- ✅ Estimated time to destination
- ✅ Route progress

**Shipper Actions**:
- Monitor shipment in real-time
- Track delivery progress
- Receive location updates

**Shipper Can See**:
- ✅ Real-time GPS tracking
- ✅ Driver location updates
- ✅ Route visualization

**Privacy Protection**:
- Route data shown but detailed tracking limited
- Full route history not visible to shipper

---

### Admin Portal Actions

#### Step 4: Tracking Dashboard
**Admin Visibility**:
- ✅ Tracking dashboard for all shipments
- ✅ Real-time tracking of all active shipments
- ✅ Tracking anomaly detection
- ✅ Missing ping alerts

**Admin Dashboard Shows**:
- All active shipments
- Current GPS locations
- Tracking status
- Alert indicators

---

#### Step 5: Receive Alerts

**Admin Alerts Triggered If**:

#### No Ping > 30 Minutes
- Alert triggered after 30 minutes of missing GPS pings
- Investigation prompt
- Operator and driver contacted

#### Suspicious Jumps
- Sudden location changes
- Impossible movement patterns
- Route deviations

#### Device Rooted
- GPS manipulation detected
- Device tampering identified
- Fraud investigation triggered

**Admin Actions**:
- Review tracking alerts
- Investigate anomalies
- Contact operator/driver
- Escalate if needed

---

### System Actions

#### Step 6: Log Tracking Data

**System Logging**:
- **Raw GPS data**: Retained for 30 days
  - Complete GPS coordinates
  - Timestamps
  - Speed and movement data
- **Summary data**: Retained for 1 year
  - Route summary
  - Key locations
  - Timeline events

**Data Retention**:
- Raw data: 30 days (detailed tracking)
- Summary data: 1 year (for audits and disputes)
- Historical data: Available for compliance reviews

---

#### Step 7: Trigger Compliance Alerts

**System Alerts**:

#### Missing Pings
- No GPS ping for 30+ minutes
- Alert sent to operator, shipper, HQ
- Investigation triggered

#### Route Deviation
- Significant route deviation detected
- Alert sent to admin
- Driver contacted for explanation

#### Speed Anomalies
- Excessive speed detected
- Safety alert triggered
- Admin notified

---

### Flow Completion

**End of Flow 7**: Tracking continues until shipment completion.

**Next Flow**: Delivery & OTP Completion Flow (Flow 9) or Accident/Breakdown Flow (Flow 8)

**Tracking Status**: Active until shipment `COMPLETED`

---

## 🟧 FLOW 8 — ACCIDENT / BREAKDOWN (ALTERNATE TRUCK) FLOW

### Flow Overview

**Purpose**: Handle emergency situations requiring alternate truck assignment.

**Start Condition**: Driver reports breakdown or accident  
**End Condition**: Alternate truck assigned and approved, shipment continues  
**Final State**: `IN_TRANSIT` (with alternate truck)

---

### Driver App Actions

#### Step 1: Report Breakdown/Accident
**Driver Actions**:
- Reports breakdown or accident through driver app
- Specifies emergency type:
  - Breakdown (mechanical failure)
  - Accident (vehicle accident)
  - Safety hazard

**Reporting Requirements**:
- Location captured automatically (GPS)
- Emergency type selected
- Description provided (optional)

---

#### Step 2: Upload Mandatory Photos
**Driver Actions**:
- Uploads photos of breakdown/accident
- Photos show:
  - Vehicle condition
  - Location
  - Damage (if accident)

**Photo Requirements**:
- Geotagged and timestamped
- Clear and visible
- Shows emergency situation

---

#### Step 3: System Alerts
**System Actions**:
- Immediately alerts operator
- Immediately alerts admin
- Creates emergency incident record
- Initiates alternate truck process

**Driver Visibility**:
- ✅ Sees emergency report submitted
- ✅ Sees operator and admin notified
- ✅ Waits for alternate truck assignment

---

### Operator App Actions

#### Step 4: Assign Alternate Truck
**Operator Actions**:
- Receives breakdown/accident notification
- Selects alternate truck from available trucks
- Alternate truck must meet all eligibility criteria:
  - HGV, 2018+, BS4/BS6, National Permit valid
  - Not blocked
  - Documents valid
  - Inspection current

**System Validation**: Full compliance check on alternate truck.

---

#### Step 5: Assign Alternate Driver
**Operator Actions**:
- Assigns alternate driver for alternate truck
- Driver must be:
  - KYC verified
  - License valid
  - Not have active shipment
  - Linked to operator

**Alternate Driver Approval**: Requires shipper re-approval.

---

#### Step 6: Send for Re-Approval
**Operator Actions**:
- Submits alternate truck and driver assignment
- Triggers shipper approval request
- Waits for shipper approval

**Important**: Original shipment ID persists. No new shipment created.

---

### Shipper App Actions

#### Step 7: Must Re-Approve Driver
**Shipper Receives**:
- ✅ Alternate truck assignment notification
- ✅ Alternate driver approval request
- ✅ Reason for alternate assignment (breakdown/accident)

**Shipper Actions**:
- Reviews alternate driver details
- Approves or rejects alternate driver
- Cannot proceed without approval

**Shipper Sees**:
- ✅ Alternate driver details (masked)
- ✅ Alternate truck details
- ✅ Reason for alternate assignment

---

### Admin Portal Actions

#### Step 8: Log Accident
**Admin Actions**:
- Accident/breakdown logged in system
- Incident record created
- Timeline documented

**Admin Log Contains**:
- Incident type (breakdown/accident)
- Location (GPS coordinates)
- Timestamp
- Driver and operator information
- Photos uploaded
- Alternate truck assignment

---

#### Step 9: Ensure Alternate Assignment Happens Within SLA
**Admin Monitoring**:
- Monitors alternate truck assignment timeline
- Ensures assignment within 30-60 minutes
- Escalates if assignment delayed

**SLA Requirements**:
- **30 minutes**: Standard response time
- **60 minutes**: Maximum allowed time
- **Escalation**: If not assigned within 60 minutes

---

#### Step 10: Ensure Compliance Team Reviews Case
**Admin Actions**:
- Routes accident case to compliance team
- Ensures compliance review
- Verifies safety protocols followed

**Compliance Review**:
- Accident severity assessment
- Safety protocol compliance
- Documentation completeness
- Follow-up actions required

---

### Franchise Portal Actions

#### Unit Franchise: Inspect Damaged Truck
**Unit Franchise Actions**:
- Inspects damaged truck (if accident)
- Assesses vehicle condition
- Determines repair requirements
- Documents inspection findings

**Inspection Required**:
- Post-accident truck must undergo inspection
- Truck cannot be used again until inspected
- Safety verification mandatory

---

#### District Franchise: Review Accident Reason
**District Franchise Actions**:
- Reviews accident case
- Validates accident reason
- Audits Unit Franchise inspection
- Ensures compliance with protocols

**Review Scope**:
- Accident cause verification
- Driver responsibility assessment
- Safety protocol compliance
- Inspection quality review

---

### System Actions

#### Step 11: No Bidding Fee for Alternate Truck
**System Logic**:
- Original bidding fee applies
- No additional bidding fee charged
- Original shipment ID persists
- Financial transaction unchanged

**Important**: Operator does not pay additional fee for alternate truck.

---

#### Step 12: Shipment ID Persists
**System Logic**:
- Same shipment ID maintained
- No new shipment created
- Original booking reference preserved
- All history linked to same shipment

**Reason**: Maintains shipment continuity and audit trail.

---

### Flow Completion

**End of Flow 8**: Alternate truck assigned, shipment continues.

**Next Flow**: Tracking Flow (Flow 7) continues with alternate truck

**Shipment State**: `IN_TRANSIT` (with alternate truck)

---

## 🟨 FLOW 9 — DELIVERY & OTP COMPLETION FLOW

### Flow Overview

**Purpose**: Complete shipment delivery with OTP verification and POD upload.

**Start Condition**: Driver reaches delivery location  
**End Condition**: Shipment completed with OTP and POD  
**Final State**: `COMPLETED`

---

### Driver App Actions

#### Step 1: Upload Drop Photo
**Driver Actions**:
- Reaches delivery location
- Uploads drop photo showing cargo being unloaded
- Photo must be:
  - Geotagged (location verified)
  - Timestamped
  - Clear and visible

**System Validation**: GPS location verified at delivery location.

---

#### Step 2: Request OTP Entry
**Driver Actions**:
- Drop photo uploaded successfully
- OTP entry screen appears
- Driver requests OTP from shipper
- Waits for OTP from shipper (in-person)

**OTP Process**:
- System generates 6-digit OTP
- OTP sent to shipper via platform notification
- Shipper provides OTP to driver (in-person, as cash payment occurs)
- Driver enters OTP in driver app

---

#### Step 3: Enter OTP
**Driver Actions**:
- Receives OTP from shipper (in-person)
- Enters 6-digit OTP in driver app
- System verifies OTP matches

**OTP Validation**:
- ✅ OTP must match system-generated code
- ✅ OTP valid for 24 hours
- ✅ Cannot complete without correct OTP

**If OTP Correct**:
- Shipment status changes to `OTP_PENDING` → `COMPLETED`
- Delivery confirmed

**If OTP Incorrect**:
- Error message shown
- Driver can retry (limited attempts)
- Investigation triggered if multiple failures

---

#### Step 4: Upload POD PDF
**Driver Actions**:
- After OTP entry, uploads POD PDF
- POD must contain delivery confirmation:
  - Recipient signature
  - Delivery stamp
  - Acknowledgment

**POD Requirements**:
- PDF format only
- Clear and readable
- Contains delivery proof
- Authentic (not reused or manipulated)

**System Validation**: POD authenticity checked automatically.

---

### Shipper App Actions

#### Step 1: Receive OTP
**Shipper Receives**:
- ✅ OTP notification via platform
- ✅ 6-digit OTP code
- ✅ 24-hour validity period
- ✅ Delivery location details

**Shipper Actions**:
- Receives OTP when driver reaches delivery location
- Provides OTP to driver in-person (as cash payment occurs)
- Confirms delivery completion

**OTP Security**:
- OTP only visible to shipper
- Not visible to operator or driver in system
- Provided in-person for security

---

#### Step 2: Confirm Delivery Automatically After OTP Used
**Shipper Actions**:
- OTP provided to driver
- Driver enters OTP
- Delivery automatically confirmed
- Shipment status changes to `COMPLETED`

**Automatic Confirmation**:
- No additional action required from shipper
- Confirmation automatic upon OTP verification
- POD received automatically

---

### Operator App Actions

#### Receives Completion Confirmation
**Operator Receives**:
- ✅ Shipment completion notification
- ✅ Delivery confirmation
- ✅ Completion timestamp

**Operator Actions**:
- Views completed shipment
- Receives POD (if accessible)
- Completes shipment record

**Operator Visibility**:
- ✅ Shipment completion status
- ✅ Delivery confirmation
- ✅ Completion timeline

---

### Admin Portal Actions

#### Monitors Suspicious OTP Attempts
**Admin Monitoring**:
- Tracks OTP entry attempts
- Detects multiple incorrect attempts
- Identifies suspicious patterns

**Admin Alerts**:
- Multiple OTP failures
- OTP misuse patterns
- Unusual OTP entry timing

**Admin Actions**:
- Investigate suspicious OTP activity
- Review OTP entry logs
- Take action if fraud detected

---

#### Verifies POD Authenticity
**Admin Verification**:
- Reviews POD documents
- Verifies POD authenticity
- Detects fake or manipulated PODs

**POD Validation**:
- ✅ POD matches shipment details
- ✅ POD is authentic (not reused)
- ✅ POD is not digitally manipulated
- ✅ Timestamp and location verified

**Admin Actions**:
- Verify POD authenticity
- Flag suspicious PODs
- Investigate if fake POD detected

---

### System Actions

#### Finalizes Shipment
**System Actions**:
- Shipment status set to `COMPLETED`
- All lifecycle stages completed
- Shipment record finalized
- Payment processing (cash, outside system)

**Completion Checklist**:
- ✅ Drop photo uploaded
- ✅ OTP entered correctly
- ✅ POD uploaded
- ✅ All requirements met

---

#### Archives Tracking and Proof
**System Archiving**:
- Tracking data archived
- Photos archived
- POD archived
- Complete shipment record stored

**Archive Retention**:
- Tracking data: 30 days raw, 1 year summary
- Photos: Permanent storage
- POD: Permanent storage
- Shipment record: Permanent storage

---

### Flow Completion

**End of Flow 9**: Shipment completed successfully.

**Next Flow**: Post-completion audit and compliance review

**Shipment State**: `COMPLETED`

---

## 🟥 FLOW 10 — ESCALATION & GOVERNANCE FLOW

### Flow Overview

**Purpose**: Handle escalations from lower to higher authority levels based on severity.

**Start Condition**: Issue identified requiring escalation  
**End Condition**: Issue resolved or escalated to appropriate authority  
**Final State**: Resolution or ongoing investigation

---

### Escalation Hierarchy

**Escalation Path**: **Unit Franchise → District Franchise → HQ Admin → Managing Director**

**No Skipping**: Escalations must follow proper path. Cannot skip levels (except emergencies).

---

### Low Severity Escalations

**Path**: **Driver/Operator → Unit Franchise**

**Examples**:
- Minor inspection delays
- Process clarifications
- Training needs
- Non-critical documentation issues

**Unit Franchise Authority**:
- Full authority to resolve
- No escalation needed
- Resolution within 48 hours

**Resolution Process**:
1. Driver/Operator reports issue to Unit Franchise
2. Unit Franchise investigates
3. Unit Franchise resolves or provides guidance
4. Issue closed

---

### Medium Severity Escalations

**Path**: **Unit Franchise → District Franchise**

**Examples**:
- Document expiry issues
- Inspection quality concerns
- Minor tracking anomalies
- Performance issues

**District Franchise Authority**:
- Full authority to resolve
- Can override Unit Franchise decisions
- Resolution within 5 business days

**Resolution Process**:
1. Unit Franchise escalates to District Franchise
2. District Franchise reviews case
3. District Franchise makes decision
4. Decision implemented
5. Unit Franchise notified

---

### High Severity Escalations

**Path**: **District Franchise → HQ Admin**

**Examples**:
- Suspicious KYC submissions
- Fake document attempts
- Tracking manipulation attempts
- Collusion patterns

**HQ Admin Authority**:
- Full authority to resolve
- Can launch investigations
- Can escalate to MD if needed

**Resolution Process**:
1. District Franchise escalates to HQ Admin
2. HQ Admin investigates (within 24 hours)
3. HQ Admin makes decision
4. Decision implemented
5. District Franchise notified

---

### Critical Severity Escalations

**Path**: **HQ Admin → Managing Director**

**Examples**:
- Confirmed identity theft
- Document forgery confirmed
- Fraudulent POD confirmed
- Criminal activity detected
- System-level policy changes

**Managing Director Authority**:
- Absolute authority
- Final decision on all escalations
- No further escalation possible

**Resolution Process**:
1. HQ Admin escalates to Managing Director
2. MD reviews case (within 7 business days)
3. MD makes final binding decision
4. Decision implemented immediately
5. All parties notified

---

### Cases Requiring Escalation

**Escalation Triggers**:

#### Fake Tracking
- GPS location spoofing detected
- Tracking data manipulated
- Route inconsistencies

**Escalation Path**: Unit → District → HQ → MD (if critical)

---

#### Fake KYC
- Forged identity documents
- Identity theft suspected
- KYC manipulation detected

**Escalation Path**: Unit → District → HQ → MD (if critical)

---

#### Fake POD
- Reused POD from previous shipment
- Digitally manipulated POD
- Fake delivery proof

**Escalation Path**: Unit → District → HQ → MD (if critical)

---

#### Wrong Driver Assigned
- Driver executing shipment not the approved driver
- Driver impersonation
- Unauthorized driver substitution

**Escalation Path**: Unit → District → HQ (high severity)

---

#### Accident
- Vehicle accident occurred
- Injury or significant damage
- Safety hazard

**Escalation Path**: Immediate → HQ (emergency escalation)

---

#### Unresponsive Operator
- Operator not responding to assignments
- Operator not assigning driver
- Operator not handling breakdown

**Escalation Path**: Unit → District → HQ

---

#### Operator Misconduct
- Fraudulent bidding
- Collusion
- Compliance violations

**Escalation Path**: Unit → District → HQ → MD (if critical)

---

#### Franchise Misconduct
- Fake inspections
- Poor inspection quality
- Compliance failures

**Escalation Path**: District → HQ → MD (if critical)

---

#### Safety Violation
- Dangerous driving reported
- Safety protocol violations
- Unsafe conditions

**Escalation Path**: Unit → District → HQ

---

#### Ledger Manipulation Attempt
- Attempt to bypass ledger checks
- Unauthorized ledger modifications
- Financial fraud

**Escalation Path**: Immediate → HQ (high severity)

---

### Escalation Process Requirements

#### Timestamping
- All escalations must be timestamped
- Response times tracked
- Resolution times monitored

#### Auditability
- All escalations logged in audit trail
- Complete documentation required
- Decision rationale documented

#### No Skipping
- Cannot skip District Franchise level
- Cannot go directly to HQ (except emergencies)
- Must follow proper escalation path

---

### Flow Completion

**End of Flow 10**: Issue escalated to appropriate authority or resolved.

**Next Flow**: Depends on escalation outcome (investigation, resolution, or further escalation)

**Escalation Status**: Ongoing or Resolved

---

## ✅ FLOW MAPS COMPLETION STATUS

**Total Flows**: 10 Complete Master Flows  
**Total Roles Mapped**: 7 Roles (Shipper, Operator, Driver, Admin, Unit Franchise, District Franchise, System)  
**Cross-App Coverage**: Complete  
**Status**: ✅ **COMPLETE**

---

## 📌 FLOW MAP USAGE

These flow maps are used for:

1. **Product Development**: Understanding complete user journeys
2. **Engineering**: System design and implementation
3. **QA Testing**: Test case creation and validation
4. **User Training**: Role-based training materials
5. **Documentation**: Complete process documentation
6. **Cursor IDE**: Business flow validation and reasoning

---

**🗺️ The Rodistaa Master Business Flow Maps v1.0 is now COMPLETE.**

**Status**: ✅ **READY FOR DEVELOPMENT & OPERATIONS**

---

**Version**: 1.0  
**Last Updated**: December 19, 2024  
**Authority**: Managing Director, Rodistaa

