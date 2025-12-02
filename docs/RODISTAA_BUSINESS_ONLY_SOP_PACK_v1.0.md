# 📘 Rodistaa Business-Only SOP Pack (Admin + Franchise) v1.0

**Standard Operating Procedures for Operational Excellence**

**Date**: December 19, 2024  
**Status**: ✅ **ACTIVE - OPERATIONAL SOPs**  
**Version**: 1.0

---

## 📋 PURPOSE

This SOP Pack provides standardized operational procedures for:

- ✅ Admin (HQ)
- ✅ District Franchise
- ✅ Unit Franchise

All procedures are **business-only** (no technical/code instructions).

---

## 📚 SOP INDEX

1. 🔴 **SOP 1**: Truck Onboarding & Eligibility Verification
2. 🟠 **SOP 2**: Driver Onboarding & Verification
3. 🟡 **SOP 3**: Booking Creation (Shipper App)
4. 🟢 **SOP 4**: Bidding & Negotiation
5. 🔵 **SOP 5**: Shipment Creation & Driver Approval
6. 🟣 **SOP 6**: Pickup, Transit, Delivery, OTP Completion
7. 🟤 **SOP 7**: Alternate Truck Handling (Accident/Breakdown)
8. ⚫ **SOP 8**: Compliance Enforcement (Auto-Block Rules)
9. ⚪ **SOP 9**: Franchise Governance Model
10. 🟫 **SOP 10**: Admin Overrides & Escalation

---

=====================================================================

# 🔴 SOP 1 — Truck Onboarding & Eligibility Verification

=====================================================================

## Objective

Ensure only compliant trucks enter the Rodistaa ecosystem.

## Applies To

- ✅ Unit Franchise
- ✅ District Franchise
- ✅ Admin

---

## Required Eligibility

### Mandatory Criteria:

- ✅ **HGV only** (Open/Container)
- ✅ **Model year 2018+**
- ✅ **BS4 or BS6** emission standard
- ✅ **National Permit** mandatory
- ✅ **Valid RC** (Registration Certificate)
- ✅ **Valid Insurance**
- ✅ **Valid Fitness** certificate
- ✅ **Inspection every 120 days**

---

## SOP Steps

### Step 1: Operator Submits Truck

**Action**: Operator initiates truck registration through Operator App

**Information Required**:
- Truck registration number
- Model year
- Emission standard (BS4/BS6)
- Permit type
- Document uploads (RC, Insurance, Fitness, Permit)

**System Validation**:
- Automatic eligibility check against criteria
- Document validity verification

---

### Step 2: Unit Franchise Checks Documents (Digitally)

**Action**: Unit Franchise reviews submitted documents

**Checks Performed**:
- ✅ Document authenticity
- ✅ Expiry date verification
- ✅ Completeness of documents
- ✅ Photo quality and clarity

**Decision**:
- **PASS**: Proceed to physical inspection
- **FAIL**: Request document correction/re-submission

---

### Step 3: Unit Franchise Performs Physical Inspection

**Action**: Unit Franchise conducts on-ground inspection

**Location**: Truck location (geo-tagged)

**Timestamp**: Inspection date/time recorded

### Inspection Checklist (Mandatory):

1. ✅ **Body Damage**
   - Check for dents, scratches
   - Structural integrity
   - Container/open body condition

2. ✅ **Tyres**
   - Tread depth
   - Tyre condition
   - Pressure check
   - Spare tyre availability

3. ✅ **Reflectors**
   - Reflector tape visibility
   - Reflector positioning
   - Condition

4. ✅ **Indicators**
   - Left/right indicators
   - Hazard lights
   - Brake lights
   - Headlights
   - Tail lights

5. ✅ **Number Plate**
   - Visibility
   - Legibility
   - Proper mounting
   - Clean condition

6. ✅ **Mirrors**
   - Side mirrors
   - Rear-view mirror
   - Adjustment capability
   - Condition

7. ✅ **Additional Checks**:
   - Seatbelts
   - Horn functionality
   - Wipers
   - Windshield condition
   - Dashboard functionality

---

### Step 4: Upload Photos (Geotag + Timestamp)

**Action**: Unit Franchise uploads inspection photos

**Required Photos**:
- ✅ Front view
- ✅ Side view (both sides)
- ✅ Rear view
- ✅ Interior view
- ✅ Document photos
- ✅ Any damage photos

**Metadata Required**:
- ✅ Geo-tag (location coordinates)
- ✅ Timestamp (date/time)
- ✅ Inspector ID
- ✅ Inspection checklist completion status

---

### Step 5: District Franchise Performs Quality Check (5-10% Sampling)

**Action**: District Franchise audits random sample of inspections

**Sampling**:
- ✅ Random selection (5-10% of all inspections)
- ✅ Focus on new trucks
- ✅ Focus on flagged inspections

**Quality Checks**:
- ✅ Photo authenticity verification
- ✅ Checklist completeness
- ✅ Inspector compliance
- ✅ Document verification accuracy

**Decision**:
- **PASS**: Inspection approved
- **FAIL**: Request re-inspection or escalate to HQ

---

### Step 6: HQ Audits Escalations

**Action**: HQ reviews escalated cases

**Escalation Triggers**:
- 🚨 Disputed inspections
- 🚨 Repeated failures
- 🚨 Fraud suspicions
- 🚨 District franchise disputes

**HQ Actions**:
- ✅ Final decision on disputed cases
- ✅ Fraud investigation
- ✅ Inspector quality review
- ✅ Process improvement recommendations

---

## Failure Conditions

Truck registration **FAILS** if:

- ❌ **Truck older than 2018**
  - Action: Block registration
  - Error: "Only trucks manufactured in 2018 or later are allowed"

- ❌ **Non-HGV**
  - Action: Block registration
  - Error: "Only HGV (open body/container) trucks are allowed"

- ❌ **Invalid or Expired Documents**
  - Action: Block registration
  - Error: "Documents expired/invalid. Please update documents"

- ❌ **Failed Inspection**
  - Action: Block registration, require re-inspection
  - Error: "Inspection failed. Please fix issues and request re-inspection"

---

## Enforcement

### Auto-Block Truck:

**Triggers**:
- ✅ Inspection overdue (beyond 120-day cycle)
- ✅ Document expiry
- ✅ Failed inspection not fixed within grace period

**Actions**:
- ✅ Truck status: **BLOCKED**
- ✅ Cannot be assigned to shipments
- ✅ Operator notified immediately
- ✅ Unit Franchise alerted
- ✅ District Franchise informed

### Re-Inspection Required:

**When**:
- ✅ Inspection failed
- ✅ District Franchise audit flags issues
- ✅ Document renewal after expiry

**Process**:
- ✅ Operator requests re-inspection
- ✅ Unit Franchise conducts new inspection
- ✅ New photos uploaded
- ✅ Quality check performed
- ✅ Approval/Rejection decision

---

=====================================================================

# 🟠 SOP 2 — Driver Onboarding & Verification

=====================================================================

## Objective

Ensure safe, compliant, KYC-verified drivers operate shipments.

## Applies To

- ✅ Operator
- ✅ Admin
- ✅ KYC-Admin

---

## Requirements

### Mandatory Requirements:

- ✅ **Driver KYC completed**
  - Identity verification
  - Address proof
  - Photo verification

- ✅ **Driving license valid**
  - License number
  - Expiry date checked
  - License type (commercial) verified

- ✅ **Photo uploaded**
  - Clear face photo
  - Recent photo
  - Good quality

- ✅ **Face match** (business-level check)
  - Photo matches license photo
  - Photo matches uploaded documents
  - KYC-admin verification

- ✅ **Driver allowed to work with multiple operators**
  - No restriction on multiple operator associations
  - One active shipment at a time rule applies

---

## SOP Steps

### Step 1: Driver Registers in Driver App

**Action**: Driver creates account in Driver App

**Information Required**:
- Personal details (name, phone, email)
- Address
- Emergency contact
- Profile photo

**System Action**:
- Account created
- KYC status: **PENDING**

---

### Step 2: Driver Uploads KYC Documents

**Action**: Driver uploads required documents

**Required Documents**:
- ✅ Identity proof (Aadhaar/PAN/Passport)
- ✅ Address proof
- ✅ Driving license
- ✅ Photo (face photo)

**Upload Requirements**:
- ✅ Clear, readable images
- ✅ All documents visible
- ✅ Expiry dates visible

**System Action**:
- Documents stored (encrypted)
- KYC status: **UNDER_VERIFICATION**

---

### Step 3: Operator Links Driver

**Action**: Operator associates driver with their fleet

**Operator Actions**:
- ✅ Browse available drivers
- ✅ View driver profile (masked KYC)
- ✅ Send association request
- ✅ Link driver to fleet

**Driver Actions**:
- ✅ Accept association request
- ✅ Confirm operator link

**System Action**:
- Driver-Operator link created
- Driver available for shipment assignment

---

### Step 4: System Verifies via KYC-Admin Role

**Action**: KYC-admin role reviews and verifies KYC

**KYC-Admin Checks**:
- ✅ Document authenticity
- ✅ Photo matching
- ✅ Identity verification
- ✅ License validity
- ✅ Address verification

**Verification Decision**:
- ✅ **APPROVED**: KYC verified, driver can operate
- ❌ **REJECTED**: KYC failed, driver blocked

**KYC Status Updates**:
- ✅ **VERIFIED**: Driver can accept shipments
- ❌ **REJECTED**: Driver cannot operate

---

## Failure Conditions

Driver onboarding **FAILS** if:

- ❌ **Invalid License**
  - Action: Block driver
  - Error: "Invalid driving license. Please upload valid license"

- ❌ **Expired Documents**
  - Action: Block driver
  - Error: "Documents expired. Please update documents"

- ❌ **Fake/Mismatched Identity**
  - Action: Block driver, escalate to HQ
  - Error: "Identity verification failed. KYC rejected"

---

## Enforcement

### Driver Blocked:

**When**:
- ✅ KYC verification failed
- ✅ License expired
- ✅ Documents invalid
- ✅ Identity mismatch

**Actions**:
- ✅ Driver status: **BLOCKED**
- ✅ Cannot accept shipments
- ✅ Cannot link with operators
- ✅ Operator notified

### Re-Verification Required:

**When**:
- ✅ Documents expired
- ✅ License renewal
- ✅ Identity verification issues

**Process**:
- ✅ Driver updates documents
- ✅ Re-upload required
- ✅ KYC-admin re-verification
- ✅ Approval/Rejection decision

---

=====================================================================

# 🟡 SOP 3 — Booking Creation (Shipper App)

=====================================================================

## Objective

Ensure bookings are created with clear, complete load details.

## Applies To

- ✅ Shipper

---

## Requirements

### Mandatory Requirements:

- ✅ **KYC-verified shipper**
  - Shipper must complete KYC
  - KYC status: VERIFIED

- ✅ **Pickup + Drop**
  - Pickup location (full address)
  - Drop location (full address)
  - GPS coordinates

- ✅ **Goods type**
  - Type of goods
  - Goods description
  - Special handling requirements

- ✅ **Tonnage**
  - Weight in tonnes
  - Exact tonnage required

- ✅ **Expected price auto-generated**
  - AI calculates expected price
  - Based on distance, tonnage, route

- ✅ **Price range adjustable**
  - Shipper can adjust min/max range
  - Operator sees range only

---

## SOP Steps

### Step 1: Shipper Enters Load Details

**Action**: Shipper creates new booking

**Information Required**:
- ✅ Pickup location (address + GPS)
- ✅ Drop location (address + GPS)
- ✅ Goods type
- ✅ Goods description
- ✅ Tonnage (exact weight)
- ✅ Pickup date/time
- ✅ Delivery date/time (optional)
- ✅ Special requirements

**System Validation**:
- ✅ Address completeness
- ✅ GPS coordinates valid
- ✅ Tonnage > 0
- ✅ Pickup date valid

---

### Step 2: AI Generates Expected Price

**Action**: System automatically calculates expected price

**Calculation Factors**:
- ✅ Distance (km)
- ✅ Tonnage
- ✅ Route type
- ✅ Market rates
- ✅ Fuel costs
- ✅ Other factors

**Output**:
- ✅ Expected price (₹)
- ✅ Price breakdown (visible to shipper only)

**System Action**:
- Expected price displayed to shipper
- Price range auto-calculated (default ±10%)

---

### Step 3: Shipper Adjusts Range

**Action**: Shipper modifies price range

**Options**:
- ✅ Adjust minimum price
- ✅ Adjust maximum price
- ✅ Set custom range

**Business Rule**:
- ✅ Operator sees **PRICE RANGE** only
- ✅ Operator does **NOT** see expected price
- ✅ Shipper can adjust unlimited times before bidding starts

**System Action**:
- Price range saved
- Range visible to operators
- Expected price hidden from operators

---

### Step 4: Booking Becomes "OPEN" for Bidding

**Action**: Shipper confirms booking

**System Actions**:
- ✅ Booking status: **OPEN**
- ✅ Visible to all operators
- ✅ Bidding period starts
- ✅ Booking details shown (with masked shipper info)

**Booking Details Visible to Operators**:
- ✅ Pickup location
- ✅ Drop location
- ✅ Goods type
- ✅ Tonnage
- ✅ Price range (min - max)
- ✅ Pickup date/time
- ✅ Shipper info: **MASKED**

**Booking Status Flow**:
- OPEN → BIDDING → ACCEPTED → SHIPMENT

---

## Failure Conditions

Booking creation **FAILS** if:

- ❌ **Shipper KYC not verified**
  - Action: Block booking creation
  - Error: "KYC verification required. Complete KYC to create bookings"

- ❌ **Incomplete information**
  - Action: Require missing information
  - Error: "Please provide complete booking details"

- ❌ **Invalid locations**
  - Action: Require valid addresses
  - Error: "Invalid pickup/drop locations. Please provide valid addresses"

- ❌ **Tonnage ≤ 0**
  - Action: Require valid tonnage
  - Error: "Tonnage must be greater than zero"

---

## Enforcement

### Booking Validation:

**System Checks**:
- ✅ Shipper KYC status
- ✅ Location validity
- ✅ Information completeness
- ✅ Price range validity

**Auto-Validation**:
- ✅ Address verification
- ✅ GPS coordinate validation
- ✅ Distance calculation
- ✅ Expected price calculation

---

=====================================================================

# 🟢 SOP 4 — Bidding & Negotiation

=====================================================================

## Objective

Ensure transparent bidding with no manipulation.

## Applies To

- ✅ Operator
- ✅ Shipper

---

## Business Rules

### Mandatory Rules:

- ✅ **ONE active bid per operator** (per booking)
- ✅ **Unlimited modifications** allowed
- ✅ **Ledger cannot go negative**
- ✅ **Bidding fee auto-deducted**
  - Fee: ₹5 × tonnage + ₹0.25 × distance (km)
- ✅ **Operator sees only the price range** (not expected price)
- ✅ **Shipper can negotiate unlimited times**

---

## SOP Steps

### Step 1: Operator Places Bid

**Action**: Operator submits bid on booking

**Pre-Bid Checks**:
- ✅ Operator has sufficient ledger balance
- ✅ No existing active bid on same booking
- ✅ Operator KYC verified
- ✅ Operator trucks available

**Bid Information**:
- ✅ Bid amount (within price range)
- ✅ Proposed pickup date/time
- ✅ Any special notes

**System Actions**:
- ✅ Validate ledger balance
- ✅ Check for existing active bid
- ✅ Calculate bidding fee
- ✅ Deduct fee from ledger
- ✅ Create bid record

**Bid Status**: **PENDING**

---

### Step 2: System Deducts Bidding Fee

**Action**: Automatic fee deduction

**Fee Calculation**:
- ✅ Base fee: ₹5 × tonnage
- ✅ Distance fee: ₹0.25 × distance (km)
- ✅ Total fee: Base + Distance

**System Actions**:
- ✅ Calculate fee
- ✅ Check ledger balance
- ✅ Deduct fee from ledger
- ✅ Update ledger balance
- ✅ Record transaction

**Enforcement**:
- ❌ If insufficient balance → Bid blocked
- ✅ Fee deducted before bid creation

---

### Step 3: Shipper Views Masked Operator Info

**Action**: Shipper sees bid details

**Shipper Sees**:
- ✅ Bid amount
- ✅ Operator name (company name)
- ✅ Operator rating
- ✅ Truck details (type, age)
- ✅ Operator phone: **MASKED** (+91 XXXXX X1234)
- ✅ Driver details: Not yet assigned

**Shipper Does NOT See**:
- ❌ Full operator phone number
- ❌ Operator address
- ❌ Operator KYC details
- ❌ Other bids (only their own bid amounts if multiple)

---

### Step 4: Negotiation Allowed Unlimited Times

**Action**: Shipper and Operator negotiate

**Negotiation Process**:
- ✅ Shipper sends counter-offer or message
- ✅ Operator can modify bid amount
- ✅ Unlimited rounds of negotiation
- ✅ Both parties see masked contact info

**Operator Actions**:
- ✅ Modify bid amount (unlimited times)
- ✅ Update pickup date/time
- ✅ Add/modify notes
- ✅ Withdraw bid (before acceptance)

**Shipper Actions**:
- ✅ Accept bid
- ✅ Reject bid
- ✅ Send counter-offer
- ✅ Negotiate terms

**System Actions**:
- ✅ Each bid modification = new fee deduction
- ✅ Old bid replaced with new bid
- ✅ Negotiation history tracked

---

### Step 5: Auto-Finalize Lowest Bid if Shipper Inactive

**Action**: Automatic bid acceptance

**Trigger**:
- ✅ Shipper inactive for 24 hours after bids received
- ✅ At least one bid exists

**System Actions**:
- ✅ Identify lowest bid amount
- ✅ Auto-accept lowest bid
- ✅ Auto-reject all other bids
- ✅ Create shipment from accepted bid
- ✅ Notify shipper and operator
- ✅ **NO REFUNDS** to rejected bidders

**Finalization Status**:
- ✅ Booking status: **AUTO_FINALIZED**
- ✅ Bid status: **ACCEPTED** (lowest), **REJECTED** (others)

---

## Failure Conditions

Bidding **FAILS** if:

- ❌ **Operator without sufficient ledger**
  - Action: Block bid placement
  - Error: "Insufficient ledger balance. Required: ₹[amount], Available: ₹[balance]"

- ❌ **Attempts to place multiple active bids**
  - Action: Block second bid
  - Error: "You already have an active bid on this booking. Please modify your existing bid"

- ❌ **Operator tries to see expected price**
  - Action: Show price range only
  - Error: N/A (system enforces masking)

---

## Enforcement

### Bid Validation:

**System Checks**:
- ✅ Ledger balance sufficiency
- ✅ Single active bid per operator
- ✅ Bid amount within price range
- ✅ Operator KYC status

### Auto-Deduction:

**Fee Deduction Rules**:
- ✅ Fee deducted immediately
- ✅ No refunds except payment failures
- ✅ Ledger cannot go negative
- ✅ Fee applies on each modification

---

=====================================================================

# 🔵 SOP 5 — Shipment Creation & Driver Approval

=====================================================================

## Objective

Ensure shipments start only when fully validated.

## Applies To

- ✅ Shipper
- ✅ Operator
- ✅ Admin

---

## SOP Steps

### Step 1: Shipper Accepts Bid → Booking Becomes Shipment

**Action**: Shipper accepts operator's bid

**Shipper Actions**:
- ✅ Review bid details
- ✅ Accept bid
- ✅ Confirm booking

**System Actions**:
- ✅ Booking status: **ACCEPTED**
- ✅ Bid status: **ACCEPTED**
- ✅ Reject all other bids (status: **REJECTED**)
- ✅ Create shipment record
- ✅ Shipment status: **CREATED**
- ✅ Notify operator

**Shipment Created**:
- ✅ Shipment ID generated
- ✅ Booking details copied
- ✅ Operator assigned
- ✅ Bid details linked

---

### Step 2: Operator Assigns Truck + Driver

**Action**: Operator selects truck and driver for shipment

**Pre-Assignment Checks**:
- ✅ Truck available and compliant
- ✅ Truck documents valid
- ✅ Driver available (no active shipment)
- ✅ Driver KYC verified
- ✅ Driver linked to operator

**Operator Actions**:
- ✅ Select truck from fleet
- ✅ Select driver from linked drivers
- ✅ Assign to shipment

**System Actions**:
- ✅ Validate truck compliance
- ✅ Check driver availability
- ✅ Assign truck to shipment
- ✅ Assign driver to shipment
- ✅ Shipment status: **TRUCK_DRIVER_ASSIGNED**

---

### Step 3: Shipper MUST Approve Driver

**Action**: Shipper reviews and approves driver

**Shipper Sees**:
- ✅ Driver name
- ✅ Driver photo
- ✅ Driver rating
- ✅ Driving license number (masked)
- ✅ Driver phone: **MASKED** (+91 XXXXX X5678)

**Shipper Actions**:
- ✅ Review driver details
- ✅ Approve driver
- ✅ OR Request driver change

**System Actions**:
- ✅ If approved: Shipment status → **APPROVED_BY_SHIPPER**
- ✅ If rejected: Shipment status → **DRIVER_REJECTED**
  - Operator must assign new driver
  - New driver requires new approval

---

### Step 4: Shipment Moves to "Ready for Pickup"

**Action**: All validations complete

**System Actions**:
- ✅ Shipment status: **READY_FOR_PICKUP**
- ✅ Driver notified
- ✅ Shipper notified
- ✅ Tracking activated
- ✅ Pickup location shared with driver
- ✅ Ready for trip start

**Shipment Status Flow**:
CREATED → TRUCK_DRIVER_ASSIGNED → APPROVED_BY_SHIPPER → READY_FOR_PICKUP → IN_TRANSIT → DELIVERED → COMPLETED

---

## Restrictions

### No Direct Shipment Without Driver Approval:

- ❌ Shipment cannot start pickup without shipper approval
- ❌ Driver cannot start trip until approved
- ❌ System blocks trip start if not approved

### No Non-Compliant Trucks Allowed:

- ❌ Truck with expired documents → blocked
- ❌ Truck with failed inspection → blocked
- ❌ Truck without National Permit → blocked
- ❌ Truck not meeting eligibility → blocked

### Driver Cannot Have Another Active Shipment:

- ❌ Driver with active shipment → cannot be assigned
- ❌ One active shipment per driver rule enforced
- ❌ System validates before assignment

---

## Failure Conditions

Shipment creation/approval **FAILS** if:

- ❌ **Non-compliant truck**
  - Action: Block assignment
  - Error: "Truck does not meet compliance requirements"

- ❌ **Driver already has active shipment**
  - Action: Block assignment
  - Error: "Driver already has an active shipment. Must complete current shipment first"

- ❌ **Driver not approved by shipper**
  - Action: Block trip start
  - Error: "Driver approval required before starting trip"

- ❌ **Driver KYC not verified**
  - Action: Block assignment
  - Error: "Driver KYC verification required"

---

## Enforcement

### Validation Checks:

**System Validates**:
- ✅ Truck compliance status
- ✅ Driver availability
- ✅ Driver KYC status
- ✅ Shipper approval status
- ✅ Operator association

### Approval Requirement:

**Mandatory Steps**:
- ✅ Operator assigns truck + driver
- ✅ Shipper approves driver
- ✅ All validations pass
- ✅ Shipment ready for pickup

---

=====================================================================

# 🟣 SOP 6 — Pickup, Transit, Delivery, OTP Completion

=====================================================================

## Objective

Maintain valid shipment lifecycle and tracking integrity.

## Applies To

- ✅ Driver
- ✅ Shipper
- ✅ Operator
- ✅ Admin

---

## SOP Steps

### Step 1: Driver Starts Trip

**Action**: Driver begins shipment journey

**Driver Actions**:
- ✅ Open shipment details
- ✅ Navigate to pickup location
- ✅ Start trip in Driver App

**System Actions**:
- ✅ Shipment status: **IN_TRANSIT**
- ✅ Start tracking (GPS activated)
- ✅ Record start timestamp
- ✅ Notify shipper and operator

---

### Step 2: GPS Pings Every 60 Seconds

**Action**: Continuous location tracking

**System Actions**:
- ✅ Driver app sends GPS ping every 60 seconds
- ✅ Location coordinates recorded
- ✅ Timestamp logged
- ✅ Route tracking maintained

**Tracking Requirements**:
- ✅ GPS enabled
- ✅ Location services active
- ✅ Network connectivity
- ✅ App running in foreground

**Tracking Data**:
- ✅ Raw logs stored (30 days)
- ✅ Summary logs stored (1 year)
- ✅ Route visualization
- ✅ Speed monitoring

---

### Step 3: Pickup Photo Uploaded

**Action**: Driver completes pickup

**Driver Actions**:
- ✅ Arrive at pickup location
- ✅ Verify goods
- ✅ Take pickup photos
- ✅ Upload photos in app
- ✅ Confirm pickup completion

**Required Photos**:
- ✅ Goods loaded in truck
- ✅ Goods condition
- ✅ Loading process
- ✅ Truck with loaded goods

**System Actions**:
- ✅ Photos uploaded and stored
- ✅ Shipment status: **PICKUP_COMPLETED**
- ✅ Pickup timestamp recorded
- ✅ Notify shipper and operator

---

### Step 4: Transit Alerts and Tracking

**Action**: Monitor shipment during transit

**System Monitoring**:
- ✅ GPS ping verification (every 60 seconds)
- ✅ Route deviation detection
- ✅ Speed monitoring
- ✅ Delay detection

**Alert Triggers**:
- 🚨 **No ping for >30 minutes**
  - Alert: Operator + Admin
  - Message: "GPS tracking stopped. Last ping: [timestamp]"

- 🚨 **Route deviation**
  - Alert: Operator
  - Message: "Route deviation detected"

- 🚨 **Extended delay**
  - Alert: Shipper + Operator
  - Message: "Shipment delayed. Expected delay: [time]"

**Stakeholder Visibility**:
- ✅ Shipper: Live tracking, estimated arrival
- ✅ Operator: Full tracking, alerts
- ✅ Admin: Full tracking, all alerts

---

### Step 5: Drop Photo Uploaded

**Action**: Driver completes delivery

**Driver Actions**:
- ✅ Arrive at drop location
- ✅ Unload goods
- ✅ Take drop photos
- ✅ Upload photos in app
- ✅ Confirm goods delivered

**Required Photos**:
- ✅ Goods unloaded
- ✅ Goods condition
- ✅ Unloading process
- ✅ Empty truck verification

**System Actions**:
- ✅ Photos uploaded and stored
- ✅ Shipment status: **DELIVERY_COMPLETED**
- ✅ Delivery timestamp recorded
- ✅ Notify shipper and operator

---

### Step 6: Driver Enters OTP from Shipper

**Action**: OTP verification for completion

**Shipper Actions**:
- ✅ Receive OTP in Shipper App
- ✅ OTP valid for 24 hours
- ✅ Share OTP with driver (if needed)
- ✅ Or enter OTP directly in app

**Driver Actions**:
- ✅ Request OTP from shipper
- ✅ Enter OTP in Driver App
- ✅ Submit for verification

**System Actions**:
- ✅ Generate 6-digit OTP
- ✅ OTP tied to assigned driver
- ✅ Validate OTP entered
- ✅ Verify OTP matches shipment
- ✅ Verify driver matches assigned driver

**OTP Rules**:
- ✅ 6-digit OTP
- ✅ 24-hour validity
- ✅ Tied to assigned driver only
- ✅ Can retry (with throttling)

---

### Step 7: Shipment Marked "Completed"

**Action**: Final shipment completion

**System Actions**:
- ✅ OTP verified successfully
- ✅ Shipment status: **COMPLETED**
- ✅ Completion timestamp recorded
- ✅ Tracking stopped
- ✅ Notify all stakeholders
- ✅ Generate completion report

**Shipment Completion**:
- ✅ All steps validated
- ✅ OTP verified
- ✅ Photos uploaded
- ✅ POD uploaded (next step)

---

### Step 8: POD PDF Uploaded

**Action**: Proof of Delivery document upload

**Driver Actions**:
- ✅ Upload POD PDF document
- ✅ Confirm upload success

**POD Requirements**:
- ✅ PDF format
- ✅ Signed by recipient
- ✅ Clear and readable
- ✅ Complete document

**System Actions**:
- ✅ POD stored securely
- ✅ Linked to shipment
- ✅ Available to shipper and operator
- ✅ Shipment fully completed

---

## Failure Conditions

Shipment lifecycle **FAILS** if:

- ❌ **OTP Missing**
  - Action: Block completion
  - Error: "OTP required to complete delivery. Please request OTP from shipper"

- ❌ **No Tracking for >30 Minutes**
  - Action: Trigger alert, escalate
  - Alert: "GPS tracking stopped. Investigation required"

- ❌ **Wrong Driver/Alternate Driver Without Re-Approval**
  - Action: Block completion
  - Error: "Driver mismatch. Only assigned driver can complete delivery"

- ❌ **Pickup Photos Missing**
  - Action: Require photos
  - Error: "Pickup photos required before proceeding"

- ❌ **POD Missing**
  - Action: Require POD upload
  - Error: "POD upload required for shipment completion"

---

## Enforcement

### Tracking Enforcement:

**Mandatory Tracking**:
- ✅ GPS pings every 60 seconds
- ✅ Alert if >30 minutes no ping
- ✅ Route monitoring
- ✅ Speed monitoring

### OTP Enforcement:

**Mandatory OTP**:
- ✅ OTP required for completion
- ✅ OTP tied to assigned driver
- ✅ No completion without OTP
- ✅ Retry mechanism with throttling

### Photo Enforcement:

**Mandatory Photos**:
- ✅ Pickup photos required
- ✅ Drop photos required
- ✅ POD PDF required

---

=====================================================================

# 🟤 SOP 7 — Alternate Truck Handling (Accident/Breakdown)

=====================================================================

## Objective

Ensure continuity & fairness in case of breakdown/accident.

## Applies To

- ✅ Driver
- ✅ Operator
- ✅ Admin
- ✅ Shipper

---

## SOP Steps

### Step 1: Driver Reports Breakdown/Accident

**Action**: Driver reports incident

**Driver Actions**:
- ✅ Report breakdown/accident in Driver App
- ✅ Upload incident photos
- ✅ Provide incident details
- ✅ Update location

**Incident Information**:
- ✅ Incident type (breakdown/accident)
- ✅ Incident location
- ✅ Incident description
- ✅ Photos (if applicable)
- ✅ Estimated delay

**System Actions**:
- ✅ Incident record created
- ✅ Shipment status: **INCIDENT_REPORTED**
- ✅ Notify operator
- ✅ Notify admin
- ✅ Alert shipper (optional)

---

### Step 2: Operator Requests Alternate Truck

**Action**: Operator initiates alternate truck request

**Operator Actions**:
- ✅ Review incident details
- ✅ Select alternate truck from fleet
- ✅ Select alternate driver (if needed)
- ✅ Submit alternate truck request

**System Actions**:
- ✅ Validate alternate truck eligibility
- ✅ Check alternate truck compliance
- ✅ Check alternate driver availability
- ✅ Create alternate truck request

---

### Step 3: Admin Approves

**Action**: Admin reviews and approves alternate truck

**Admin Actions**:
- ✅ Review incident details
- ✅ Verify alternate truck eligibility
- ✅ Verify alternate driver (if applicable)
- ✅ Approve alternate truck assignment

**System Actions**:
- ✅ Admin approval recorded
- ✅ Audit log created
- ✅ Notify operator
- ✅ Ready for assignment

---

### Step 4: Operator Assigns New Truck + Driver

**Action**: Operator assigns alternate resources

**Operator Actions**:
- ✅ Assign alternate truck
- ✅ Assign alternate driver (if different)
- ✅ Confirm assignment

**System Actions**:
- ✅ Alternate truck assigned to shipment
- ✅ Alternate driver assigned (if applicable)
- ✅ Shipment status: **ALTERNATE_TRUCK_ASSIGNED**
- ✅ Original truck status: **AVAILABLE**
- ✅ Original driver status: **AVAILABLE** (if replaced)

---

### Step 5: Shipper Approves New Driver

**Action**: Shipper approves alternate driver (if changed)

**Shipper Actions**:
- ✅ Review alternate driver details
- ✅ Approve new driver
- ✅ OR Request different driver

**System Actions**:
- ✅ If approved: Continue with alternate truck
- ✅ If rejected: Request new driver assignment

**Business Rule**:
- ✅ If alternate driver same as original → No re-approval needed
- ✅ If alternate driver different → Re-approval required

---

### Step 6: Shipment Continues

**Action**: Shipment proceeds with alternate truck

**System Actions**:
- ✅ Shipment ID remains **SAME**
- ✅ Tracking continues
- ✅ Route updated (if needed)
- ✅ All stakeholders notified
- ✅ Shipment continues from incident location

**Shipment Continuity**:
- ✅ Same shipment ID
- ✅ Same goods
- ✅ Same shipper/operator
- ✅ Same destination
- ✅ Different truck/driver

---

## Rules

### NO Extra Bidding Fee:

- ✅ **No additional bidding fee** charged for alternate truck
- ✅ Original bidding fee applies
- ✅ Operator not charged again
- ✅ Business Rule: Alternate truck is operational necessity, not new booking

### Shipment ID Remains Same:

- ✅ **Shipment ID persists** through alternate truck assignment
- ✅ Same shipment ID throughout lifecycle
- ✅ Tracking history continuous
- ✅ All records linked to same shipment ID

### Full Audit Required:

- ✅ **Complete audit trail** for alternate truck assignment
- ✅ Incident report logged
- ✅ Admin approval logged
- ✅ Truck/driver change logged
- ✅ Shipper approval logged (if applicable)
- ✅ All timestamps recorded
- ✅ All stakeholders notified

---

## Failure Conditions

Alternate truck handling **FAILS** if:

- ❌ **Alternate truck not compliant**
  - Action: Block assignment
  - Error: "Alternate truck does not meet compliance requirements"

- ❌ **Alternate driver not approved (if changed)**
  - Action: Require approval
  - Error: "Alternate driver approval required from shipper"

- ❌ **Unauthorized alternate truck request**
  - Action: Require admin approval
  - Error: "Admin approval required for alternate truck assignment"

---

## Enforcement

### Approval Requirements:

**Mandatory Approvals**:
- ✅ Admin approval for alternate truck
- ✅ Shipper approval for alternate driver (if changed)
- ✅ All compliance checks passed

### Audit Requirements:

**Complete Audit Trail**:
- ✅ Incident details
- ✅ Admin approval
- ✅ Truck/driver change
- ✅ All timestamps
- ✅ All stakeholders

---

=====================================================================

# ⚫ SOP 8 — Compliance Enforcement (Auto-Block Rules)

=====================================================================

## Objective

Ensure automatic enforcement of compliance violations.

## Applies To

- ✅ System (Automatic)
- ✅ Unit Franchise
- ✅ District Franchise
- ✅ Admin

---

## System-Triggered Auto-Block Events

### 1. Truck Document Expiry

**Trigger**:
- ✅ Document expiry date reached
- ✅ Daily/hourly checks

**Documents Monitored**:
- ✅ Registration Certificate (RC)
- ✅ Insurance
- ✅ Fitness certificate
- ✅ National Permit
- ✅ PUC certificate

**Auto-Block Actions**:
- ✅ Truck status: **BLOCKED**
- ✅ Cannot be assigned to shipments
- ✅ Operator notified immediately
- ✅ Unit Franchise alerted
- ✅ District Franchise informed
- ✅ Auto-unblock after document renewal

---

### 2. Inspection Overdue

**Trigger**:
- ✅ Inspection due date passed
- ✅ 120-day cycle broken

**Calculation**:
- ✅ Next inspection due = Last inspection date + 120 days
- ✅ Overdue if current date > due date

**Auto-Block Actions**:
- ✅ Truck status: **BLOCKED**
- ✅ Cannot be assigned to shipments
- ✅ Operator notified
- ✅ Unit Franchise notified
- ✅ Inspection request required

---

### 3. Suspicious Tracking

**Trigger**:
- ✅ No GPS ping for >30 minutes
- ✅ Route anomalies detected
- ✅ Impossible speeds detected
- ✅ Location jumps detected

**Auto-Block Actions**:
- ✅ Alert: Operator + Admin
- ✅ Shipment status: **TRACKING_ISSUE**
- ✅ Investigation required
- ✅ Possible shipment hold

---

### 4. Fraudulent POD

**Trigger**:
- ✅ POD doesn't match shipment
- ✅ Duplicate PODs detected
- ✅ POD manipulation detected

**Auto-Block Actions**:
- ✅ POD flagged for review
- ✅ Shipment completion blocked
- ✅ Admin notified
- ✅ Investigation required

---

### 5. KYC Mismatch

**Trigger**:
- ✅ Driver identity mismatch
- ✅ Document tampering detected
- ✅ Fake documents detected

**Auto-Block Actions**:
- ✅ Driver status: **BLOCKED**
- ✅ KYC verification failed
- ✅ Cannot accept shipments
- ✅ KYC-admin notified
- ✅ HQ escalation required

---

### 6. Operator Ledger Misuse

**Trigger**:
- ✅ Negative ledger balance attempt
- ✅ Fraudulent transaction patterns
- ✅ Unauthorized ledger modifications

**Auto-Block Actions**:
- ✅ Transaction blocked
- ✅ Operator notified
- ✅ Admin alerted
- ✅ Ledger audit required

---

## Enforcement

### Truck Blocked Instantly:

**Block Actions**:
- ✅ Truck status: **BLOCKED**
- ✅ Immediate effect
- ✅ No shipments allowed
- ✅ Cannot bid with blocked truck
- ✅ Cannot assign blocked truck

**Notification Chain**:
- ✅ Operator notified (immediate)
- ✅ Unit Franchise alerted (immediate)
- ✅ District Franchise informed (within 1 hour)
- ✅ Admin informed (for critical cases)

---

### Operator Notified:

**Notification Methods**:
- ✅ In-app notification
- ✅ Email notification (if configured)
- ✅ Push notification

**Notification Content**:
- ✅ Block reason
- ✅ Block timestamp
- ✅ Required actions
- ✅ Resolution steps

---

### Unit Franchise Alerted:

**Alert Actions**:
- ✅ Franchise dashboard notification
- ✅ Block reason visible
- ✅ Operator details shown
- ✅ Required action items

**Franchise Actions**:
- ✅ Review block reason
- ✅ Support operator resolution
- ✅ Escalate if needed

---

### District Franchise Escalated:

**Escalation Triggers**:
- ✅ Multiple blocks in unit
- ✅ Repeated violations
- ✅ Critical compliance issues
- ✅ Fraud suspicions

**District Actions**:
- ✅ Review unit performance
- ✅ Investigate patterns
- ✅ Escalate to HQ if critical

---

### Admin Informed:

**Admin Notification**:
- ✅ Critical blocks only
- ✅ Fraud cases
- ✅ System-wide issues
- ✅ Escalations from district

**Admin Actions**:
- ✅ Review block details
- ✅ Investigate if needed
- ✅ Override if justified
- ✅ Audit compliance

---

## Auto-Unblock Process

### Document Renewal:

**Process**:
1. Operator updates expired documents
2. Documents uploaded
3. System verifies documents
4. Auto-unblock triggered
5. Truck status: **AVAILABLE**

### Inspection Completion:

**Process**:
1. Operator requests re-inspection
2. Unit Franchise conducts inspection
3. Inspection passed
4. Auto-unblock triggered
5. Truck status: **AVAILABLE**

### Issue Resolution:

**Process**:
1. Operator resolves compliance issue
2. Admin/Franchise verifies resolution
3. Manual unblock by admin
4. Truck status: **AVAILABLE**

---

=====================================================================

# ⚪ SOP 9 — Franchise Governance Model

=====================================================================

## Objective

Define clear hierarchy and responsibilities for franchise operations.

## Applies To

- ✅ Unit Franchise
- ✅ District Franchise
- ✅ HQ

---

## Unit Franchise

### Responsibilities:

#### 1. Conduct Inspections

**Actions**:
- ✅ Perform physical truck inspections
- ✅ Follow complete inspection checklist
- ✅ Upload inspection photos (geotag + timestamp)
- ✅ Submit inspection results
- ✅ Maintain inspection quality

**Standards**:
- ✅ Inspection within SLA
- ✅ Complete checklist adherence
- ✅ Quality photo uploads
- ✅ Accurate documentation

---

#### 2. Maintain Quality

**Actions**:
- ✅ Ensure inspection quality
- ✅ Verify document authenticity
- ✅ Flag compliance issues
- ✅ Support operators locally

**Quality Metrics**:
- ✅ Inspection pass rate
- ✅ Inspection SLA adherence
- ✅ Re-inspection rate
- ✅ Complaint ratio

---

#### 3. Flag Failing Trucks

**Actions**:
- ✅ Identify non-compliant trucks
- ✅ Flag expired documents
- ✅ Report failed inspections
- ✅ Escalate critical issues

**Escalation**:
- ✅ Local issues → Handle locally
- ✅ Critical issues → Escalate to District
- ✅ Fraud cases → Escalate to District → HQ

---

#### 4. Support Operators

**Actions**:
- ✅ Provide local operator support
- ✅ Coach on compliance
- ✅ Assist with onboarding
- ✅ Monitor operator behavior

**Support Activities**:
- ✅ Compliance training
- ✅ Best practices sharing
- ✅ Issue resolution
- ✅ Operator coaching

---

## District Franchise

### Responsibilities:

#### 1. Monitor All Units

**Actions**:
- ✅ Supervise all unit franchises in district
- ✅ Track unit performance
- ✅ Monitor inspection quality
- ✅ Evaluate unit effectiveness

**Monitoring**:
- ✅ Daily/weekly/monthly reports
- ✅ Performance dashboards
- ✅ Compliance tracking
- ✅ Quality metrics

---

#### 2. Audit Inspection Quality

**Actions**:
- ✅ Random sampling (5-10% of inspections)
- ✅ Quality verification
- ✅ Photo authenticity check
- ✅ Checklist completeness verification

**Audit Process**:
- ✅ Select random inspections
- ✅ Review inspection details
- ✅ Verify quality standards
- ✅ Flag discrepancies
- ✅ Request corrections

---

#### 3. Set Targets

**Actions**:
- ✅ Set monthly load targets for units
- ✅ Define inspection deadlines
- ✅ Set operator onboarding KPIs
- ✅ Define compliance KPIs

**Target Metrics**:
- ✅ Booking/shipment targets
- ✅ Inspection volume targets
- ✅ Operator onboarding targets
- ✅ Compliance rate targets

---

#### 4. Implement Incentives

**Actions**:
- ✅ Calculate incentives based on performance
- ✅ Submit incentive recommendations to HQ
- ✅ Monitor incentive distribution
- ✅ Track incentive effectiveness

**Incentive Calculation**:
- ✅ Performance-based rewards
- ✅ Target achievement bonuses
- ✅ Quality rewards
- ✅ Compliance bonuses

---

#### 5. Handle Escalations

**Actions**:
- ✅ Receive escalations from units
- ✅ Investigate district-level issues
- ✅ Resolve within authority
- ✅ Escalate to HQ if critical

**Escalation Handling**:
- ✅ Review escalation details
- ✅ Investigate thoroughly
- ✅ Make decisions within authority
- ✅ Escalate to HQ for critical issues

---

## HQ

### Responsibilities:

#### 1. Create New Franchises

**Actions**:
- ✅ Create new franchise units
- ✅ Create new district franchises
- ✅ Assign franchise territories
- ✅ Set franchise hierarchy

**Franchise Creation**:
- ✅ Territory mapping
- ✅ Franchise agreement
- ✅ Initial setup
- ✅ Training and onboarding

---

#### 2. Manage Payouts

**Actions**:
- ✅ Control all franchise payouts
- ✅ Set incentive slabs
- ✅ Define penalty rules
- ✅ Manage payout cycles

**Payout Management**:
- ✅ Monthly/quarterly payouts
- ✅ Incentive calculations
- ✅ Penalty applications
- ✅ Payment disbursement

---

#### 3. Perform Monthly Audit

**Actions**:
- ✅ Monthly compliance reports
- ✅ Truck inspection audit sample
- ✅ Ledger mismatch scan
- ✅ KYC verification logs
- ✅ Tracking anomaly reports
- ✅ Dispute closure audit
- ✅ Contract compliance
- ✅ Franchise payouts audit

**Audit Scope**:
- ✅ System-wide compliance
- ✅ Franchise performance
- ✅ Operator/driver compliance
- ✅ Financial audits

---

#### 4. Control Full Compliance

**Actions**:
- ✅ Enforce all business rules
- ✅ Monitor cross-district compliance
- ✅ Handle critical escalations
- ✅ Make final decisions

**Compliance Control**:
- ✅ Zero-commission enforcement
- ✅ Cash-only payment enforcement
- ✅ Truck compliance enforcement
- ✅ KYC compliance enforcement
- ✅ All business rule enforcement

---

## Hierarchy Structure

### Reporting Chain:

**Unit Franchise → District Franchise → HQ**

### Authority Levels:

- ✅ **Unit Franchise**: Field operations, inspections, local support
- ✅ **District Franchise**: Supervision, audits, targets, escalations
- ✅ **HQ**: Creation, payouts, system-wide audits, final decisions

### Escalation Path:

1. **Unit** handles local issues
2. **District** handles regional issues and supervises units
3. **HQ** handles system-wide issues and critical escalations

---

=====================================================================

# 🟫 SOP 10 — Admin Overrides & Escalation

=====================================================================

## Objective

Define admin override authority and escalation procedures.

## Applies To

- ✅ Admin
- ✅ HQ

---

## Admin May Override

### 1. Driver Assignment

**Override Actions**:
- ✅ Reassign driver to shipment
- ✅ Change driver mid-shipment
- ✅ Force driver assignment
- ✅ Replace driver

**Override Process**:
- ✅ Admin reviews case
- ✅ Makes override decision
- ✅ Records reason in audit log
- ✅ Notifies stakeholders

---

### 2. Truck Reassignment

**Override Actions**:
- ✅ Reassign truck to shipment
- ✅ Change truck mid-shipment
- ✅ Force truck assignment
- ✅ Replace truck

**Override Process**:
- ✅ Admin reviews case
- ✅ Validates new truck compliance
- ✅ Makes override decision
- ✅ Records audit log
- ✅ Notifies stakeholders

---

### 3. Shipment Cancellation

**Override Actions**:
- ✅ Cancel active shipment
- ✅ Override cancellation restrictions
- ✅ Handle mid-shipment cancellation
- ✅ Force cancellation

**Override Process**:
- ✅ Admin reviews cancellation reason
- ✅ Validates justification
- ✅ Makes override decision
- ✅ Handles refunds (if applicable)
- ✅ Records audit log

---

### 4. Dispute Resolution

**Override Actions**:
- ✅ Resolve shipper-operator disputes
- ✅ Resolve payment disputes
- ✅ Resolve service quality disputes
- ✅ Make final decisions

**Override Process**:
- ✅ Admin reviews dispute details
- ✅ Investigates thoroughly
- ✅ Makes resolution decision
- ✅ Records audit log
- ✅ Notifies all parties

---

### 5. Auto-Finalization Disputes

**Override Actions**:
- ✅ Override auto-finalization
- ✅ Reopen bidding
- ✅ Handle shipper disputes
- ✅ Modify finalization

**Override Process**:
- ✅ Admin reviews dispute
- ✅ Validates shipper concern
- ✅ Makes override decision
- ✅ Records audit log

---

### 6. Accident Handling

**Override Actions**:
- ✅ Approve alternate truck
- ✅ Override alternate truck restrictions
- ✅ Handle emergency situations
- ✅ Force alternate truck assignment

**Override Process**:
- ✅ Admin reviews accident details
- ✅ Validates emergency need
- ✅ Makes override decision
- ✅ Records audit log

---

### 7. Fraud Investigations

**Override Actions**:
- ✅ Block operators/drivers
- ✅ Unblock after resolution
- ✅ Investigate fraud cases
- ✅ Take corrective actions

**Override Process**:
- ✅ Admin investigates fraud
- ✅ Gathers evidence
- ✅ Makes decision
- ✅ Records complete audit trail

---

## Restrictions

### Admin Must Be Logged with Reason:

**Audit Requirements**:
- ✅ **Admin ID** recorded
- ✅ **Timestamp** recorded
- ✅ **Reason/Justification** mandatory
- ✅ **Action Taken** documented
- ✅ **Impact Assessment** recorded
- ✅ **Stakeholder Notifications** logged

**No Override Without Audit**:
- ❌ Cannot override without logging
- ❌ Cannot skip reason field
- ❌ Cannot bypass audit trail

---

### KYC Access Only if Role = KYC-Admin:

**KYC Access Rules**:
- ✅ Only **KYC-admin** role can view full KYC
- ✅ Regular admin sees masked KYC only
- ✅ KYC access logged in audit trail
- ✅ KYC export requires KYC-admin role

**Violation**:
- ❌ Regular admin cannot access full KYC
- ❌ KYC access without role = violation

---

### Ledger Cannot Be Edited:

**Ledger Restrictions**:
- ❌ Admin cannot edit ledger entries directly
- ❌ Financial control separate system
- ❌ Ledger changes require finance team
- ❌ Admin can view ledger (read-only)

**Exception**:
- ✅ Admin can view ledger for audit
- ✅ Admin can request ledger corrections through finance

---

## Escalation Path

### Unit → District → HQ → Admin

#### Level 1: Unit Franchise

**Handles**:
- ✅ Local inspections
- ✅ Local operator support
- ✅ Minor compliance issues
- ✅ Routine operations

**Escalates To**:
- ✅ District: Regional issues, quality problems, repeated violations

---

#### Level 2: District Franchise

**Handles**:
- ✅ Unit franchise supervision
- ✅ Regional compliance
- ✅ District-level issues
- ✅ Inspection audits

**Escalates To**:
- ✅ HQ: Critical issues, fraud suspicions, system-wide problems

---

#### Level 3: HQ

**Handles**:
- ✅ System-wide compliance
- ✅ Franchise creation
- ✅ Payout management
- ✅ Monthly audits

**Escalates To**:
- ✅ Admin: Critical overrides, fraud investigations, emergency situations

---

#### Level 4: Admin

**Handles**:
- ✅ Critical overrides
- ✅ Fraud investigations
- ✅ Emergency interventions
- ✅ Final decisions

**Final Authority**:
- ✅ Admin has final decision authority
- ✅ All admin actions logged
- ✅ All overrides documented

---

## Escalation Triggers

### Escalate to District:

- 🚨 Repeated unit franchise issues
- 🚨 Quality problems
- 🚨 Regional compliance issues
- 🚨 Multiple violations

### Escalate to HQ:

- 🚨 Critical compliance issues
- 🚨 Fraud suspicions
- 🚨 System-wide problems
- 🚨 District-level disputes

### Escalate to Admin:

- 🚨 Critical overrides needed
- 🚨 Fraud investigations
- 🚨 Emergency situations
- 🚨 Final decision required

---

## Audit Requirements

### All Admin Overrides Must Include:

- ✅ **Admin ID**
- ✅ **Timestamp**
- ✅ **Reason/Justification** (mandatory)
- ✅ **Action Taken**
- ✅ **Impact Assessment**
- ✅ **Stakeholder Notifications**
- ✅ **Related Records** (shipment ID, operator ID, etc.)

### Audit Trail Retention:

- ✅ All override logs stored permanently
- ✅ Audit trail available for review
- ✅ Audit reports generated monthly
- ✅ Compliance audit performed quarterly

---

=====================================================================

# END OF RODISTAA BUSINESS-ONLY SOP PACK v1.0

=====================================================================

**Status**: ✅ **ACTIVE - OPERATIONAL SOPs**

**Version**: 1.0

**Last Updated**: December 19, 2024

---

**All 10 SOPs are documented and ready for operational use.**

