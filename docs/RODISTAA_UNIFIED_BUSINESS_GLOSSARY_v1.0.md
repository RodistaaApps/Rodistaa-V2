# 📚 RODISTAA UNIFIED BUSINESS GLOSSARY v1.0

**All Terms, Definitions & Canonical Meanings — Zero Ambiguity**

**Version**: 1.0  
**Effective Date**: December 19, 2024  
**Status**: ✅ **BINDING REFERENCE FOR ALL RODISTAA OPERATIONS**

---

## 📘 PURPOSE

This glossary defines **all business terms, definitions, and canonical meanings** used across the Rodistaa platform with **zero ambiguity**.

**This glossary must be used across**:
- All apps (Shipper/Operator/Driver)
- Admin & franchise portals
- Product requirements
- SOP and QA documents
- Cursor IDE reasoning
- Internal communication

**No deviation from these definitions is permitted.**

---

## 🟦 A — CORE PLATFORM ENTITIES

### Administrator (Admin / HQ Admin)
**Definition**: Rodistaa headquarters authority responsible for platform governance, escalation management, compliance oversight, overrides, and final decisions.

**Key Responsibilities**:
- Platform governance and policy enforcement
- Escalation management (District → HQ)
- Compliance oversight and audits
- System overrides (with justification)
- Final decision-making on critical violations
- Franchise management and payout oversight

**Access Levels**:
- **Standard Admin**: General oversight and operations
- **KYC-Admin**: Exclusive access to full KYC documents
- **Managing Director (MD)**: Ultimate authority for all decisions

---

### Booking
**Definition**: A load request created by a shipper specifying origin, destination, cargo details, tonnage, and price range.

**Characteristics**:
- Created by verified shippers only
- Open for bidding until bid acceptance or auto-finalization
- Contains: pickup location, drop location, cargo type, tonnage, price range
- Cannot be modified after bids are placed (except price range adjustment)
- Auto-finalizes after 24 hours of shipper inactivity if bids exist

**Lifecycle States**:
- `DRAFT` → `OPEN_FOR_BIDDING` → `BID_ACCEPTED` → `SHIPMENT_CREATED`
- `CANCELLED` (if cancelled before bid acceptance)

---

### Bid
**Definition**: A monetary offer submitted by an operator against a booking, representing the operator's price for transporting the load.

**Key Rules**:
- Only **ONE active bid per operator** per booking allowed
- Bid amount must fall within shipper's price range
- Bidding fee deducted from operator ledger upon bid submission
- Operators may modify bids unlimited times (subject to ledger availability)
- Lowest bid auto-accepts after 24-hour shipper inactivity

**Bid Status**:
- `ACTIVE` → `ACCEPTED` → `SHIPMENT_CREATED`
- `REJECTED` (if shipper selects different bid or cancels)
- `WITHDRAWN` (if operator cancels bid)

---

### Shipper
**Definition**: A verified user who posts loads (bookings), negotiates bids, approves drivers, tracks shipments, and completes delivery via OTP.

**Capabilities**:
- Create bookings with cargo details
- Set and adjust price range
- View operator bids (without seeing other bid amounts)
- Negotiate prices through in-app messages
- Approve or reject driver assignments
- Track live shipments via GPS
- Complete delivery via OTP entry
- Pay in cash only at delivery

**Restrictions**:
- Cannot view unmasked operator/driver phone numbers
- Cannot bypass driver approval requirement
- Cannot complete delivery without OTP
- Cannot see full expected price once price range is set

---

### Operator
**Definition**: A verified truck owner who manages trucks, bids on loads, assigns drivers, and handles shipment execution.

**Capabilities**:
- Register without approval (self-service)
- Manage maximum **10 trucks** per operator
- Place bids on bookings (one active bid per booking)
- Modify bids unlimited times
- Assign and change drivers (with shipper approval)
- Manage ledger balance
- Track truck compliance status

**Restrictions**:
- Ledger cannot go negative
- Bidding fee auto-deducted from ledger
- Only eligible trucks can bid (HGV, 2018+, BS4/BS6, National Permit)
- Trucks blocked if documents expired or inspection overdue
- Maximum 10 trucks per operator (hard limit)

---

### Driver
**Definition**: A verified individual who executes shipments, uploads photos, follows tracking requirements, and completes delivery via OTP.

**Capabilities**:
- Work with multiple operators
- Execute assigned shipments
- Upload pickup and delivery photos
- Upload POD (Proof of Delivery) PDF
- Complete shipment via OTP entry
- Report breakdown or delays

**Restrictions**:
- Must complete KYC verification
- **One active shipment only** at a time
- GPS ping required every 60 seconds during active shipment
- Cannot complete delivery without correct OTP
- Cannot be assigned if KYC unverified

---

### Franchise
**Definition**: A Rodistaa-approved entity responsible for inspections, compliance management, and local operational oversight.

**Types**:
- **Unit Franchise**: Local-level franchise responsible for truck inspections and operator support
- **District Franchise**: Supervises all Unit Franchises in its district; audits quality and sets targets

**Responsibilities**:
- Conduct truck inspections (120-day cycle)
- Verify driver identity and documents
- Manage local compliance and escalations
- Report violations to District Franchise or HQ
- Support operators and drivers locally

**Restrictions**:
- Cannot override HQ decisions
- Cannot access full KYC without authorization
- Must follow strike system for violations
- Subject to franchise termination for serious misconduct

---

## 🟥 B — BOOKING, BIDDING & PRICING TERMS

### Expected Price
**Definition**: AI-estimated cost shown **only to shipper**. Never shown to operators.

**Purpose**: Provides shipper with a baseline estimate for setting price range.

**Visibility**: 
- ✅ Visible to: Shipper only
- ❌ Not visible to: Operators, Drivers, Franchises

**Usage**: Shipper uses expected price as reference point to set price range.

---

### Price Range
**Definition**: Adjustable range that shipper sets from expected price. **Only this is visible to operators** (not the expected price).

**Characteristics**:
- Shipper can adjust range up or down from expected price
- Operators see only the range, not individual bid amounts or expected price
- Operators must bid within this range
- Range can be adjusted before bids are placed

**Visibility**:
- ✅ Visible to: Shipper, Operators
- ❌ Not visible to: Other operators' bid amounts

---

### Active Bid
**Definition**: The current valid bid submitted by an operator against a booking. **Only ONE allowed per booking** per operator.

**Rules**:
- Operator can have only one active bid per booking at any time
- Submitting a new bid automatically cancels the previous bid
- Bidding fee charged only once per active bid
- Bid remains active until: accepted, rejected, withdrawn, or booking cancelled

**Status Tracking**:
- `PENDING` → `ACTIVE` → `ACCEPTED` / `REJECTED` / `WITHDRAWN`

---

### Bid Modification
**Definition**: An operator's ability to change bid values unlimited times, subject to ledger availability for bidding fees.

**Rules**:
- No limit on number of modifications
- Each modification requires ledger balance check
- Modified bid must still fall within shipper's price range
- Previous bid is cancelled when new bid is submitted

**Fee Structure**:
- Bidding fee deducted only once per active bid submission
- Modifications do not incur additional fees

---

### Negotiation
**Definition**: A back-and-forth price discussion between shipper and operator through in-app messages.

**Characteristics**:
- All communication through platform (no direct phone numbers)
- Shipper and operator can discuss price, timing, conditions
- Negotiation does not automatically modify bid
- Operator must submit new bid if price changes
- All messages logged for audit trail

**Rules**:
- Must remain within platform communication system
- Phone numbers remain masked
- No offline negotiations permitted

---

### Auto-Finalization
**Definition**: System mechanism that automatically selects the lowest bid when shipper takes no action for 24 hours after bids are placed.

**Trigger Conditions**:
- At least one bid exists on the booking
- Shipper has been inactive for exactly 24 hours
- No bid has been manually accepted by shipper

**Selection Logic**:
- Lowest bid amount (ascending order) is automatically accepted
- Shipment is created automatically
- Shipper is notified of auto-finalization
- No refund if shipper wanted different bid

**Exception**: If booking is cancelled before 24-hour window, auto-finalization does not occur.

---

## 🟧 C — SHIPMENT TERMS

### Shipment
**Definition**: A confirmed movement created when a bid is accepted (by shipper) or auto-finalized (by system).

**Creation**:
- Created automatically when bid is accepted
- Created automatically when auto-finalization occurs
- Links booking, operator, driver, and truck

**Binding Contract**:
- Shipper commits to payment at delivery
- Operator commits to transport service
- Driver commits to execution
- Cash payment only at delivery

---

### Shipment Lifecycle
**Definition**: The complete sequence of status changes from bid acceptance to delivery completion.

**Status Sequence**:
1. **ASSIGNED**: Shipment created, operator assigned
2. **DRIVER_PENDING_APPROVAL**: Driver assigned, awaiting shipper approval
3. **IN_TRANSIT**: Driver approved, en route to pickup location
4. **AT_PICKUP**: Driver reached pickup, uploading pickup photo
5. **AT_DESTINATION**: Driver reached delivery location, uploading drop photo
6. **OTP_PENDING**: Drop photo uploaded, awaiting OTP entry
7. **COMPLETED**: OTP entered correctly, shipment complete

**Status Transitions**:
- All status changes are logged with timestamps
- Cannot skip statuses (must follow sequence)
- Exception handling for breakdown/accident scenarios

---

### Pickup
**Definition**: Driver reaches the pickup location and uploads the required photo.

**Requirements**:
- Driver must be at pickup location (GPS verified)
- Pickup photo must be uploaded
- Photo must show cargo being loaded
- Status changes to `AT_PICKUP`

**Photo Requirements**:
- Must be clear and show cargo
- Timestamped automatically
- Geotagged with location
- Uploaded within reasonable time after arrival

---

### Drop
**Definition**: Driver reaches the delivery location and uploads the required photo.

**Requirements**:
- Driver must be at delivery location (GPS verified)
- Drop photo must be uploaded
- Photo must show cargo being unloaded
- Status changes to `AT_DESTINATION`

**Photo Requirements**:
- Must be clear and show cargo
- Timestamped automatically
- Geotagged with location
- Uploaded before OTP entry

---

### POD (Proof of Delivery)
**Definition**: A PDF uploaded by driver confirming package delivery, typically containing recipient signature or acknowledgment.

**Requirements**:
- PDF format only
- Must contain delivery confirmation (signature, stamp, or acknowledgment)
- Uploaded by driver after drop photo
- Stored in shipment records for audit

**Purpose**:
- Legal proof of delivery completion
- Required for dispute resolution
- Part of audit trail
- Used for insurance claims if needed

---

### OTP Delivery Completion
**Definition**: Shipment completes only when the shipper's OTP is entered by the assigned driver.

**OTP Characteristics**:
- **6-digit code** generated by system
- **24-hour validity** period
- Generated when shipment reaches `AT_DESTINATION` status
- Shipper receives OTP via platform notification
- Driver enters OTP in driver app

**Completion Process**:
1. Drop photo uploaded → Status: `OTP_PENDING`
2. Shipper receives OTP notification
3. Shipper provides OTP to driver (in-person, as cash payment occurs)
4. Driver enters OTP in app
5. System verifies OTP matches
6. Status changes to `COMPLETED`

**No Exceptions**: Shipment cannot complete without correct OTP entry.

---

## 🟨 D — COMPLIANCE, INSPECTION & TRUCK TERMS

### Truck Eligibility
**Definition**: Mandatory criteria that ALL trucks must meet to be registered and bid on bookings.

**Requirements (ALL must be met)**:
- **HGV only** (Heavy Goods Vehicle - open body or container)
- **Model year 2018+** (manufacturing year)
- **BS4 or BS6** (emission standard)
- **National Permit** (valid and non-expired)

**Verification**:
- Documents verified during registration
- Auto-block if any criteria fails
- Inspection verifies physical compliance
- Re-inspection required if failed

**No Exceptions**: This rule is absolute and cannot be overridden without HQ authorization.

---

### Inspection
**Definition**: A mandatory 120-day physical verification conducted by Unit Franchise to ensure truck eligibility and compliance.

**Frequency**: Every **120 days** from last inspection date

**Conducted By**: Unit Franchise (licensed inspector)

**Inspection Checklist**:
- Physical verification of truck condition
- Document verification (RC, Permit, Insurance, Pollution)
- Emission standard verification
- Photo documentation
- Inspection report generated

**Outcomes**:
- **PASSED**: Truck remains active, next inspection due in 120 days
- **FAILED**: Truck blocked, must fix issues and re-inspect
- **OVERDUE**: Truck auto-blocked if inspection not completed within grace period

---

### Inspection Due
**Definition**: Truck nearing or crossing the 120-day limit from last inspection date.

**Alert System**:
- **30 days before due**: Warning notification to operator
- **7 days before due**: Reminder notification
- **Due date**: Final notification
- **After due date**: Auto-block if inspection not completed

**Grace Period**: Typically 7-15 days after due date (system-configurable)

**Auto-Block**: Truck automatically blocked from bidding if inspection overdue.

---

### Auto-Block
**Definition**: Automatic blocking of trucks, drivers, or operators due to compliance violations, with no human override without HQ authorization.

**Trigger Conditions**:
- **Expired documents** (RC, Permit, Insurance, Pollution)
- **Invalid inspection** (failed or overdue inspection)
- **Fake documents** (forged or tampered documents detected)
- **Fraud suspicion** (pattern of violations or suspicious activity)
- **KYC mismatch** (driver identity does not match documents)
- **Negative ledger** (operator ledger balance below zero)
- **Multiple active bids** (operator attempts second bid on same booking)

**Enforcement**:
- System-enforced (automatic, no manual intervention)
- Cannot be bypassed by franchise or standard admin
- HQ authorization required for override (with justification)
- Auto-block lifted only after compliance restored

---

### Document Expiry
**Definition**: Expiry of any required truck document: RC (Registration Certificate), Fitness Certificate, National Permit, Insurance, or Pollution Certificate.

**Monitoring**:
- System tracks all document expiry dates
- Alerts sent 30 days, 7 days, and on expiry date
- Auto-block triggered if document expired

**Renewal Process**:
1. Operator uploads renewed document
2. System verifies document validity
3. Document expiry date updated
4. Auto-block lifted if all documents valid

**Critical Documents**:
- RC (Registration Certificate)
- Fitness Certificate
- National Permit
- Insurance Certificate
- Pollution Certificate (PUC)

---

### Re-Inspection
**Definition**: Re-checking a failed or blocked truck before re-activation.

**Triggers**:
- Truck failed previous inspection
- Truck blocked due to compliance issues
- Operator requests re-inspection after fixing issues

**Process**:
1. Operator fixes identified issues
2. Operator requests re-inspection through platform
3. Unit Franchise schedules re-inspection
4. Inspector verifies fixes and compliance
5. If passed: Truck unblocked and activated
6. If failed: Operator must fix again and request another re-inspection

**Cost**: May involve re-inspection fees (franchise policy)

---

## 🟩 E — IDENTITY, PERMISSIONS & KYC TERMS

### KYC (Know Your Customer)
**Definition**: Identity verification process for shipper, operator, or driver, including identity proof, address proof, and document validation.

**Required Documents**:
- **Identity Proof**: Aadhaar, PAN, Driving License, or Passport
- **Address Proof**: Aadhaar, Utility Bill, or Bank Statement
- **Photo**: Recent photograph matching identity document

**Verification Process**:
1. User submits KYC documents
2. System validates document authenticity
3. Facial recognition match (for drivers)
4. Document expiry check
5. Approval or rejection notification

**Verification Status**:
- `PENDING`: Documents submitted, awaiting verification
- `APPROVED`: KYC verified, user can operate
- `REJECTED`: Documents invalid, user must resubmit
- `SUSPICIOUS`: Flagged for manual review

**Access Control**: Full KYC visible only to KYC-admin role.

---

### KYC-Admin
**Definition**: Special HQ role with exclusive access to full KYC documents and personal information.

**Capabilities**:
- View complete KYC documents (identity, address, photos)
- Access unmasked personal information
- Approve or reject KYC submissions
- Flag suspicious KYC for investigation
- Audit KYC access logs

**Restrictions**:
- Only HQ personnel with explicit authorization
- All access logged and audited
- Cannot share KYC data without authorization
- Subject to strict data privacy policies

**Access Logging**: All KYC access is logged with timestamp, admin identity, and purpose.

---

### Masked Details
**Definition**: Personal information hidden from other users to protect privacy and prevent direct communication.

**Masked Information**:
- **Phone Numbers**: Shown as `XXXXX-XXXXX` (first 5 and last 5 digits masked)
- **Email Addresses**: Partial masking if displayed
- **Address Details**: Only city/state shown, not full address
- **Full Names**: Only first name and last initial shown in some contexts

**Purpose**:
- Prevent direct contact outside platform
- Protect user privacy
- Ensure all communication through platform
- Prevent fraud and collusion

**Unmasking**: Only KYC-admin can view unmasked details (with authorization).

---

### Suspicious KYC
**Definition**: A KYC submission flagged for mismatch or potential fraud.

**Flag Triggers**:
- Photo does not match identity document
- Document appears forged or tampered
- Information mismatch between documents
- Duplicate identity detected
- Pattern of violations associated with identity

**Handling Process**:
1. System flags as suspicious automatically
2. KYC-admin reviews manually
3. Investigation conducted if needed
4. Rejection if fraud confirmed
5. Legal escalation if criminal activity detected

**Consequences**:
- Account blocked until verification complete
- Legal action if fraud confirmed
- Permanent ban if identity theft confirmed

---

### Identity Match
**Definition**: Ensuring driver's face matches the submitted photo ID during verification.

**Verification Methods**:
- Facial recognition technology
- Manual photo comparison by inspector
- Video verification if required
- In-person verification during inspection

**Requirements**:
- Driver photo must clearly match ID photo
- Same person must appear in all documents
- No impersonation allowed

**Violations**:
- Driver impersonation → Block driver + investigation
- Fake identity → Permanent ban + legal escalation

---

## 🟪 F — LEDGER, FINANCE & REVENUE TERMS

### Ledger
**Definition**: Operator's account balance on the platform, used to pay bidding fees and manage financial transactions.

**Characteristics**:
- Balance stored in operator account
- Used exclusively for bidding fees
- Cannot go negative (hard limit)
- Replenished by operator through platform

**Operations**:
- **Credit**: Operator adds funds to ledger
- **Debit**: Bidding fees automatically deducted
- **Balance Check**: System verifies balance before bid submission

**Restrictions**:
- **No Negative Balance Rule**: Ledger cannot go below zero
- Cannot be used for any purpose other than bidding fees
- No interest or earnings on balance

---

### Bidding Fee
**Definition**: The cost paid by operator for each bid, calculated as: **₹5 × tonnage + ₹0.25 × distance**.

**Calculation Formula**:
```
Bidding Fee = (₹5 × Tonnage) + (₹0.25 × Distance in km)
```

**Example**:
- Tonnage: 10 tons
- Distance: 500 km
- Bidding Fee = (₹5 × 10) + (₹0.25 × 500) = ₹50 + ₹125 = ₹175

**Deduction**:
- Automatically deducted from operator ledger upon bid submission
- Bid rejected if ledger balance insufficient
- Fee charged only once per active bid (modifications don't incur additional fees)

**Refund Policy**: No refunds if bid accepted, rejected, or withdrawn (except transaction failures).

---

### No Negative Balance Rule
**Definition**: Ledger can never go below zero. Absolute rule with no exceptions.

**Enforcement**:
- System prevents bid submission if balance insufficient
- Auto-block operator if ledger goes negative (system error scenario)
- Operator must add funds before bidding

**No Exceptions**: Cannot bid with negative or zero balance.

---

### No Refund Rule
**Definition**: No refunds are provided except for specific transaction failure scenarios.

**No Refund Scenarios**:
- Bid accepted by shipper
- Bid rejected by shipper
- Bid withdrawn by operator
- Booking cancelled after bids placed
- Shipment completed
- Operator decision to cancel bid

**Refund Exceptions (Only)**:
- **Transaction failure**: Bidding fee deducted but bid not created (technical error)
- **Incorrect gateway deduction**: Multiple deductions for single bid (system error)
- **HQ decision**: Special cases authorized by Managing Director only

**Policy**: All bidding fees are final once bid is successfully submitted.

---

### Revenue Share
**Definition**: Franchises earn revenue share only from assigned roles; operators pay bidding fees only (no commission).

**Franchise Revenue**:
- Earned from assigned operational roles
- Based on franchise performance and compliance
- Paid by HQ according to franchise agreement
- Not tied to individual bookings or bids

**Operator Costs**:
- Operators pay only bidding fees
- No commission on shipments
- No platform fees
- No revenue sharing with platform

**Platform Model**: Zero-commission marketplace (no fees on successful shipments).

---

## 🟫 G — TRACKING & SAFETY TERMS

### Ping Interval
**Definition**: Driver app sends GPS location every 60 seconds during active shipment.

**Technical Specification**:
- **Frequency**: Every 60 seconds (1 minute)
- **Transmission**: Automatic, continuous during shipment
- **Data**: GPS coordinates, timestamp, speed, direction

**Requirements**:
- Must be continuous during `IN_TRANSIT`, `AT_PICKUP`, `AT_DESTINATION` statuses
- Cannot be disabled by driver
- System verifies ping frequency

**Violations**: Missing pings trigger tracking alerts.

---

### Tracking Alert
**Definition**: Triggered when no GPS ping is received for 30 minutes during active shipment.

**Alert Conditions**:
- No GPS ping received for >30 minutes
- Shipment status is `IN_TRANSIT`, `AT_PICKUP`, or `AT_DESTINATION`
- Driver has not reported breakdown or exception

**Alert Actions**:
- **Immediate**: Alert sent to operator, shipper, and HQ
- **Investigation**: System flags shipment for review
- **Driver Contact**: Operator attempts to contact driver
- **Escalation**: HQ notified if no response within 1 hour

**Resolution**:
- Driver reports breakdown → Alternate truck assigned
- Driver reports exception → Admin review
- GPS issue → Technical investigation
- Suspicious activity → Fraud investigation

---

### Location Spoofing
**Definition**: Fraudulent manipulation of GPS coordinates to show false location.

**Methods**:
- GPS spoofing apps
- Hardware GPS manipulation devices
- VPN or location masking software
- Fake GPS coordinates injection

**Detection**:
- System compares GPS data with expected route
- Speed inconsistencies detected
- Sudden location jumps flagged
- Pattern analysis identifies anomalies

**Consequences**:
- **Category D Violation**: Major violation
- Immediate block of driver and operator
- Investigation by HQ
- Legal escalation if fraud confirmed
- Permanent ban if intentional spoofing

---

### Suspicious Tracking
**Definition**: Tracking patterns inconsistent with expected behavior or route.

**Pattern Indicators**:
- Vehicle moving away from destination
- Stops at unauthorized locations
- Excessive delays at intermediate points
- Speed anomalies (too fast or too slow)
- Route deviations without explanation

**Investigation Process**:
1. System flags suspicious pattern
2. Alert sent to operator and HQ
3. Operator contacts driver for explanation
4. If unexplained: Investigation escalated
5. If fraud suspected: Category D violation triggered

**Consequences**: Depends on severity and intent (warning → block → permanent ban).

---

### Breakdown
**Definition**: Driver-reported mechanical failure requiring alternate truck assignment.

**Reporting Process**:
1. Driver reports breakdown through driver app
2. Breakdown location captured (GPS)
3. Breakdown photo required (optional but recommended)
4. Operator notified immediately
5. Alternate truck assignment process initiated

**Alternate Truck Rules**:
- No additional bidding fee charged
- Original shipment ID persists
- Shipper approval required for alternate driver
- Breakdown must be genuine (investigated if suspicious)

**Documentation**: Breakdown reports logged for operator performance tracking.

---

### Alternate Truck
**Definition**: Replacement truck assigned due to accident, breakdown, or emergency.

**Assignment Rules**:
- **Allowed Only For**: Breakdown, accident, or emergency
- **No Additional Fee**: Original bidding fee applies
- **Shipment ID Persists**: Same shipment ID maintained
- **Shipper Approval**: Required for alternate driver assignment

**Process**:
1. Breakdown/accident reported
2. Operator selects alternate truck from available trucks
3. Operator assigns alternate driver
4. Shipper approves alternate driver
5. Alternate truck proceeds with shipment

**Restrictions**:
- Alternate truck must meet all eligibility criteria
- Alternate driver must be KYC-verified
- Cannot be used for convenience or scheduling issues

---

## 🟦 H — FRANCHISE TERMS

### Unit Franchise
**Definition**: Local-level franchise responsible for inspections and operator support.

**Responsibilities**:
- Conduct truck inspections (120-day cycle)
- Verify driver identity and documents
- Support local operators and drivers
- Report violations to District Franchise
- Manage local compliance issues

**Authority**:
- Category A violations (Minor) - full authority
- Category B violations (Operational) - initial handling
- Must escalate Category C+ violations to District or HQ

**Limitations**:
- Cannot override HQ decisions
- Cannot access full KYC without authorization
- Subject to strike system for violations

---

### District Franchise
**Definition**: Supervises all Unit Franchises in its district; audits quality and sets targets.

**Responsibilities**:
- Supervise all Unit Franchises in district
- Audit Unit Franchise performance and quality
- Set targets and performance metrics
- Handle Category B and C violations (full authority)
- Escalate Category D+ violations to HQ

**Authority**:
- Category B violations (Operational) - full authority
- Category C violations (Compliance) - enforcement
- Oversight of Unit Franchise operations
- District-level audits and investigations

**Limitations**:
- Cannot override HQ decisions
- Cannot handle Category D+ violations independently
- Subject to strike system for violations

---

### HQ Franchise Functions
**Definition**: Central HQ responsibilities for franchise management.

**Functions**:
- **Franchise Creation**: Approve and onboard new franchises
- **Payout Management**: Process franchise revenue share payments
- **Compliance Oversight**: Monitor franchise compliance and performance
- **Performance Audits**: Conduct regular franchise audits
- **Strike Enforcement**: Apply strike system for violations
- **Termination Authority**: Terminate franchises for serious violations

**Management**:
- Franchise agreements and contracts
- Performance metrics and KPIs
- Revenue share calculations
- Compliance reporting

---

### Franchise Strike
**Definition**: Penalty issued for franchise misbehavior or non-compliance.

**Strike Levels**:
- **1 Strike**: Warning + mandatory training
- **2 Strikes**: Payout suspension (30 days)
- **3 Strikes**: Payout suspension (90 days) + HQ audit
- **4 Strikes**: Franchise termination process initiated

**Strike Triggers**:
- Category C violation involving franchise → 1 strike
- Category D violation involving franchise → 2 strikes
- Category E violation involving franchise → 3 strikes
- Repeated violations (3+ within 6 months) → 1 strike per violation
- HQ override of franchise decision → 1 strike
- Compliance failure (not reporting violations) → 1 strike

**Strike Expiration**: Strikes expire after 12 months of clean operation.

---

## 🟧 I — ADMIN & GOVERNANCE TERMS

### Admin Override
**Definition**: Authority to change truck, driver, or shipment assignment with justification and HQ authorization.

**Override Scenarios**:
- Breakdown requiring alternate truck (with shipper approval)
- Driver emergency requiring driver change (with shipper approval)
- System error requiring manual correction
- Special circumstances authorized by HQ

**Requirements**:
- **HQ Authorization**: Must be authorized by HQ
- **Justification**: Clear business reason documented
- **Audit Trail**: All overrides logged with timestamp and admin identity
- **Shipper Approval**: Required for driver/truck changes

**Prohibited Overrides**:
- Cannot override zero-compromise rules (Section 2 of Lawbook)
- Cannot override auto-blocks without HQ authorization
- Cannot override fraud detection without investigation

---

### Compliance Flag
**Definition**: A serious issue requiring investigation (e.g., expired docs, fake KYC, fraud suspicion).

**Flag Types**:
- **Document Expiry**: Expired RC, Permit, Insurance, or Pollution Certificate
- **Fake KYC**: Suspicious or tampered identity documents
- **Fraud Suspicion**: Pattern of violations or suspicious activity
- **Tracking Anomaly**: GPS spoofing or location manipulation
- **Compliance Violation**: Failed inspection or non-compliance

**Flag Handling**:
1. System automatically flags violations
2. Alert sent to relevant admin/franchise
3. Investigation initiated within 24 hours
4. Resolution or escalation based on severity

**Escalation**: Category D+ flags escalated to HQ immediately.

---

### Escalation
**Definition**: A structured process from Unit → District → HQ for handling violations and issues.

**Escalation Path**:
1. **Unit Franchise** → Initial handling of minor/operational violations
2. **District Franchise** → Handles operational/compliance violations
3. **HQ (Admin)** → Handles major/critical violations, final decisions
4. **Managing Director** → Ultimate authority for appeals and policy changes

**Escalation Triggers**:
- Category C+ violations
- Franchise cannot resolve locally
- Requires HQ authorization
- Appeals process

**Escalation Timeframes**:
- Unit → District: Within 24 hours
- District → HQ: Within 48 hours
- HQ Decision: Within 5 business days

---

### HQ Review
**Definition**: Final decision-maker on critical violations, appeals, and policy enforcement.

**HQ Authority**:
- Category D violations (Major) - full authority
- Category E violations (Critical) - full authority
- Final appeals decisions (before MD)
- Override authorization
- Franchise strike enforcement
- Legal escalation decisions

**Review Process**:
1. Case received from District Franchise or auto-flagged
2. HQ reviews all evidence and documentation
3. Investigation conducted if needed
4. Decision made and communicated
5. Enforcement action taken

**Limitations**: Cannot modify zero-compromise rules (MD authority only).

---

## 🟨 J — FRAUD TERMS

### Fake POD
**Definition**: Using an old or manipulated POD document that does not represent the actual delivery.

**Methods**:
- Reusing POD from previous shipment
- Digitally manipulating POD image
- Using POD from different shipment
- Creating fake POD document

**Detection**:
- System compares POD with shipment details
- Timestamp verification
- GPS location verification
- Pattern analysis

**Consequences**:
- **Category D Violation**: Major violation
- Immediate block of driver and operator
- Investigation by HQ
- Permanent ban if fraud confirmed
- Legal escalation if financial loss

---

### Fake Tracking
**Definition**: GPS manipulated with spoofing apps or hardware to show false location.

**Methods**: See "Location Spoofing" (Section G)

**Consequences**:
- **Category D Violation**: Major violation
- Immediate block
- Investigation
- Permanent ban if intentional
- Legal escalation if fraud confirmed

---

### Bidding Collusion
**Definition**: Multiple operators coordinating unfair pricing to manipulate the bidding process.

**Collusion Patterns**:
- Operators agreeing on bid amounts
- Operators taking turns to win bids
- Operators sharing bidding strategies
- Operators coordinating to exclude competition

**Detection**:
- Pattern analysis of bid amounts
- Communication analysis (if detected)
- Operator relationship analysis
- Reporting by shippers or other operators

**Consequences**:
- **Category D Violation**: Major violation
- All involved operators blocked
- Investigation by HQ
- Permanent ban if collusion confirmed
- Legal escalation if market manipulation

---

### Tampered KYC
**Definition**: Deliberately altered or forged identity documents submitted for KYC verification.

**Methods**:
- Digitally altering photo or information
- Using fake or stolen identity documents
- Manipulating document expiry dates
- Creating synthetic identities

**Detection**:
- Document authenticity verification
- Facial recognition mismatch
- Database cross-reference
- Pattern analysis

**Consequences**:
- **Category E Violation**: Critical violation
- Immediate permanent ban
- Legal escalation (identity theft)
- System-wide alert
- Police complaint filed

---

### Driver Impersonation
**Definition**: A driver executing a shipment who is not the approved driver assigned to that shipment.

**Methods**:
- Driver allowing another person to drive
- Driver sharing credentials with another person
- Driver substitution without approval

**Detection**:
- Facial recognition mismatch
- Photo comparison during pickup
- KYC verification failure
- Shipper reporting

**Consequences**:
- **Category D Violation**: Major violation
- Immediate block of driver and operator
- Investigation by HQ
- Permanent ban if intentional
- Shipper safety concern escalation

---

### Franchise Misconduct
**Definition**: Fake inspections, missing audits, or non-compliance by franchise entities.

**Misconduct Types**:
- **Fake Inspections**: Approving ineligible trucks without proper inspection
- **Missing Audits**: Not conducting required audits or reviews
- **Non-Compliance**: Violating franchise agreement or platform rules
- **Covering Up Violations**: Not reporting Category D+ violations

**Consequences**:
- **Strike System**: 1-4 strikes based on severity
- **Payout Suspension**: Temporary or permanent
- **HQ Investigation**: Mandatory audit
- **Franchise Termination**: If 4 strikes or Category E violation
- **Legal Action**: If fraud or criminal activity

---

## 🟩 K — ALERTS & NOTIFICATION TERMS

### Compliance Alert
**Definition**: Sent when truck, driver, or operator is blocked or inspection expired.

**Alert Triggers**:
- Document expiry (30 days, 7 days, on expiry)
- Inspection due (30 days, 7 days, overdue)
- Auto-block activation
- KYC rejection
- Compliance violation detected

**Recipients**:
- **Operator**: All compliance alerts for their trucks/drivers
- **Driver**: Alerts for their own account
- **Franchise**: Alerts for trucks under their jurisdiction
- **HQ**: Critical alerts for Category D+ violations

**Alert Content**:
- Violation type
- Action required
- Deadline for compliance
- Consequences of non-compliance

---

### Tracking Alert
**Definition**: Triggered after 30 minutes of missing GPS pings during active shipment.

**Alert Details**: See "Tracking Alert" (Section G)

**Recipients**:
- Operator (immediate)
- Shipper (notification)
- HQ (if unresolved)

---

### Approval Request
**Definition**: Shipper prompts to approve driver or alternate driver assignment.

**Request Types**:
- **Driver Approval**: Initial driver assignment requires shipper approval
- **Alternate Driver Approval**: Alternate driver assignment requires shipper approval
- **Truck Change Approval**: If truck changes (rare, requires approval)

**Process**:
1. Operator assigns driver
2. Approval request sent to shipper
3. Shipper reviews driver details (masked)
4. Shipper approves or rejects
5. If approved: Shipment proceeds
6. If rejected: Operator must assign different driver

**Time Limit**: Shipper has 24 hours to approve (otherwise shipment delayed).

---

### Shipment Exception
**Definition**: A condition requiring admin intervention beyond normal workflow.

**Exception Types**:
- **Breakdown**: Mechanical failure requiring alternate truck
- **Accident**: Vehicle accident requiring emergency response
- **Delay**: Excessive delay without explanation
- **Tracking Issue**: GPS failure or suspicious tracking
- **Delivery Issue**: Cannot complete delivery (wrong address, refused delivery)
- **Payment Dispute**: Cash payment dispute

**Handling Process**:
1. Exception reported (driver, operator, or shipper)
2. System flags for admin review
3. Admin investigates and resolves
4. Exception logged for audit

**Resolution**: Admin can authorize overrides, alternate assignments, or cancellations.

---

## 🟪 L — ESCALATION & SAFETY TERMS

### Critical Event
**Definition**: Any event involving accident, breakdown, or fraud requiring immediate attention.

**Event Types**:
- **Accident**: Vehicle accident involving injury or significant damage
- **Breakdown**: Mechanical failure requiring emergency response
- **Fraud**: Confirmed or suspected fraudulent activity
- **Safety Incident**: Driver or cargo safety compromised
- **Legal Issue**: Police or RTO involvement required

**Response Process**:
1. Event reported immediately
2. System alerts HQ and relevant admin
3. Emergency response initiated (if safety issue)
4. Investigation launched
5. Resolution and documentation

**Escalation**: All critical events escalated to HQ immediately.

---

### Investigation Request
**Definition**: A formal escalation to District Franchise or HQ for violation investigation.

**Request Types**:
- **Compliance Violation**: Suspected non-compliance
- **Fraud Suspicion**: Suspected fraudulent activity
- **Franchise Misconduct**: Suspected franchise violation
- **Admin Misconduct**: Suspected admin violation

**Process**:
1. Request submitted with evidence
2. Reviewed by District Franchise (initial)
3. Escalated to HQ if Category D+ violation
4. Investigation conducted
5. Decision and enforcement action

**Timeframes**: See "Escalation" (Section I)

---

### Suspension
**Definition**: Temporary removal of platform access for violations or investigations.

**Suspension Types**:
- **Temporary Block**: 24-48 hours (Category B violations)
- **Short Suspension**: 7-30 days (Category C violations)
- **Long Suspension**: 30-90 days (Category D violations, repeat offenses)

**Suspension Triggers**:
- Category B+ violations
- Repeated Category A violations (3+)
- Under investigation for fraud
- Franchise strike accumulation

**Reinstatement**: User must resolve violations and comply before reinstatement.

---

### Termination
**Definition**: Permanent removal from platform for critical violations.

**Termination Triggers**:
- **Category E Violations**: Critical violations (fraud, identity theft, criminal activity)
- **Repeated Category D Violations**: 3+ major violations
- **Franchise Termination**: 4 strikes or Category E violation
- **Legal Escalation**: Criminal activity requiring permanent ban

**Termination Process**:
1. Violation confirmed
2. HQ decision to terminate
3. User notified of termination
4. Account permanently blocked
5. Legal action if required

**No Reinstatement**: Terminations are permanent with no appeals process (except MD override in exceptional cases).

---

## 🟫 M — AUDIT & VERIFICATION TERMS

### Audit Trail
**Definition**: Timestamped record of all actions by operators, drivers, franchises, or admin.

**Logged Actions**:
- Bid submissions and modifications
- Driver assignments and approvals
- Shipment status changes
- Admin overrides
- KYC access
- Compliance flags and resolutions
- Franchise inspections and audits

**Audit Data**:
- **Timestamp**: Exact date and time of action
- **Actor**: User or system performing action
- **Action**: Type of action performed
- **Details**: Relevant data and context
- **Outcome**: Result of action

**Retention**: 7 years (legal requirement)

**Access**: HQ and audit teams only

---

### Inspection Log
**Definition**: Record of truck inspections, photos, and checklist completion.

**Log Contents**:
- Inspection date and time
- Inspector identity (Unit Franchise)
- Truck details (registration, model, year)
- Inspection checklist results
- Inspection photos
- Pass/fail status
- Next inspection due date

**Purpose**:
- Compliance verification
- Audit trail for franchise performance
- Operator performance tracking
- Dispute resolution

**Access**: Operator (their trucks), Franchise (their inspections), HQ (all logs)

---

### Compliance Report
**Definition**: Monthly evaluation of trucks, drivers, and operator behavior.

**Report Contents**:
- **Truck Compliance**: Document expiry status, inspection status
- **Driver Compliance**: KYC status, violation history
- **Operator Compliance**: Ledger status, violation history, performance score
- **Franchise Compliance**: Inspection quality, violation reporting

**Report Frequency**: Monthly (generated automatically)

**Recipients**:
- **Operators**: Their own compliance report
- **Franchises**: Compliance report for their jurisdiction
- **HQ**: System-wide compliance report

**Purpose**:
- Performance tracking
- Compliance monitoring
- Risk assessment
- Improvement planning

---

### Operator Performance Score
**Definition**: Rating based on on-time performance, tracking consistency, and compliance history.

**Score Components**:
- **On-Time Performance**: Percentage of shipments completed on time
- **Tracking Consistency**: GPS ping compliance rate
- **Compliance History**: Document expiry violations, inspection compliance
- **Violation History**: Number and severity of violations
- **Shipper Ratings**: Feedback from shippers (if applicable)

**Score Calculation**:
- Weighted combination of all factors
- Updated monthly with compliance report
- Range: 0-100 (higher is better)

**Use Cases**:
- Operator ranking and visibility
- Bidding priority (if implemented)
- Risk assessment
- Performance improvement tracking

**Score Impact**: Low scores may result in warnings or restrictions.

---

## 📌 GLOSSARY USAGE REQUIREMENTS

### Mandatory Usage

This glossary **must be used across**:

1. **All Apps** (Shipper/Operator/Driver)
   - All UI text, labels, tooltips, error messages
   - All user-facing documentation
   - All help text and onboarding

2. **Admin & Franchise Portals**
   - All admin interfaces and dashboards
   - All franchise portals and tools
   - All compliance and audit interfaces

3. **Product Requirements**
   - All PRDs and product specifications
   - All feature documentation
   - All user stories and acceptance criteria

4. **SOP and QA Documents**
   - All Standard Operating Procedures
   - All Quality Assurance test cases
   - All training materials

5. **Cursor IDE Reasoning**
   - All business logic validation
   - All rule enforcement
   - All violation detection

6. **Internal Communication**
   - All team communications
   - All documentation
   - All presentations

### Zero Ambiguity Policy

- **No synonyms**: Use exact terms from glossary only
- **No abbreviations**: Use full terms (unless defined in glossary)
- **No alternative terms**: Stick to canonical definitions
- **No interpretation**: Use definitions exactly as written

### Glossary Updates

- **Authority**: Only Managing Director can approve glossary changes
- **Process**: All changes must be documented and versioned
- **Notification**: All teams must be notified of glossary updates
- **Implementation**: All systems must reflect glossary updates immediately

---

## ✅ GLOSSARY COMPLETION STATUS

**Total Sections**: 13 (A through M)  
**Total Terms Defined**: 80+ Terms  
**Status**: ✅ **COMPLETE**

---

## 📍 QUICK REFERENCE

### By Category
- **Entities**: Section A (8 terms)
- **Booking/Bidding**: Section B (6 terms)
- **Shipment**: Section C (6 terms)
- **Compliance**: Section D (6 terms)
- **KYC/Identity**: Section E (5 terms)
- **Finance**: Section F (5 terms)
- **Tracking**: Section G (5 terms)
- **Franchise**: Section H (4 terms)
- **Admin**: Section I (4 terms)
- **Fraud**: Section J (6 terms)
- **Alerts**: Section K (4 terms)
- **Escalation**: Section L (4 terms)
- **Audit**: Section M (4 terms)

---

**📚 The Rodistaa Unified Business Glossary v1.0 is now COMPLETE.**

**Status**: ✅ **READY FOR USE ACROSS ALL PLATFORMS**

---

**Version**: 1.0  
**Last Updated**: December 19, 2024  
**Authority**: Managing Director, Rodistaa

