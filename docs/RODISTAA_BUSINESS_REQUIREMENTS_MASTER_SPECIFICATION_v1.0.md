# 📘 RODISTAA BUSINESS REQUIREMENTS MASTER SPECIFICATION (BRMS) v1.0

**Baseline for Cursor IDE, Product, Engineering, QA, and Franchise Operations**

**Version**: 1.0  
**Effective Date**: December 19, 2024  
**Status**: ✅ **MANDATORY REFERENCE FOR ALL DEVELOPMENT & OPERATIONS**

---

## 📘 PURPOSE

This is the **single most important business requirements document** for Rodistaa.

It defines all mandatory requirements across:

- **Shipper App**
- **Operator App**
- **Driver App**
- **Admin Portal**
- **Franchise Portals (Unit & District)**
- **System Logic**
- **Compliance**
- **Governance**
- **Workflows**
- **Pricing**
- **Safety**
- **Tracking**
- **Escalations**
- **Fraud**
- **Audits**

**This is the baseline for**:
- Cursor IDE
- Product
- Engineering
- QA
- Franchise operations

**No tech. No code. Pure business requirements.**

---

## 🟥 SECTION 1 — MASTER BUSINESS MODEL REQUIREMENTS

### BR-1: Zero Commission

**Requirement**: Rodistaa earns no commission on loads. Revenue is only from bidding fees.

**Business Rules**:
- No percentage-based fees on shipments
- No transaction fees on deliveries
- Zero-commission marketplace model
- Revenue only from operator bidding fees (₹5 × tonnage + ₹0.25 × distance)

**Validation**: Any commission calculation or fee on shipments is a violation of this requirement.

---

### BR-2: No Intermediaries

**Requirement**: No broker, agent, or middleman is allowed in any flow.

**Business Rules**:
- No third-party booking agents
- No freight brokers on platform
- No commission-based intermediaries
- Direct shipper-operator interaction only
- Identity verification prevents intermediary accounts

**Validation**: Any flow that allows or enables intermediaries violates this requirement.

---

### BR-3: Cash Payments Only

**Requirement**: All settlements between Shipper ↔ Operator ↔ Driver occur in cash.

**Business Rules**:
- Cash-only payments at delivery location
- No online payments
- No UPI transfers
- No bank transfers
- No digital settlements
- No payment gateway integration for shipper payments

**Validation**: Any non-cash payment method is a violation of this requirement.

---

### BR-4: Mandatory KYC

**Requirement**: Shipper, Operator, Driver must complete KYC before full usage.

**Business Rules**:
- KYC verification mandatory for all users
- Platform access blocked until KYC approved
- No booking creation without KYC
- No bidding without KYC
- No shipment assignment without KYC

**Validation**: Any user activity without approved KYC violates this requirement.

---

### BR-5: Compliance-Driven Marketplace

**Requirement**: Only eligible trucks, drivers, and operators can participate.

**Business Rules**:
- Truck eligibility: HGV, 2018+, BS4/BS6, National Permit
- Driver eligibility: KYC verified, valid license
- Operator eligibility: KYC verified
- Auto-block prevents ineligible participation
- Compliance checks at every stage

**Validation**: Any ineligible entity participating violates this requirement.

---

### BR-6: End-to-End Lifecycle Enforcement

**Requirement**: Booking → Bidding → Shipment → Tracking → OTP → POD → Completion must be strictly followed.

**Business Rules**:
- No status skipping allowed
- All stages must be completed in sequence
- Cannot bypass any lifecycle stage
- OTP mandatory for completion
- POD mandatory for completion

**Validation**: Any flow that skips or bypasses lifecycle stages violates this requirement.

---

## 🟧 SECTION 2 — SHIPPER APP REQUIREMENTS

### Booking Requirements

#### BR-S01: Shipper must submit pickup, drop, goods, tonnage.

**Requirement**: Shipper must provide complete booking information.

**Business Rules**:
- Pickup location (address, coordinates)
- Drop location (address, coordinates)
- Goods description (cargo type, specifications)
- Tonnage (weight in tons)

**Validation**: Booking cannot be created without all required information.

---

#### BR-S02: System must generate expected price using AI.

**Requirement**: System must automatically calculate expected price.

**Business Rules**:
- AI-based price estimation
- Factors: distance, tonnage, route, market rates
- Expected price shown only to shipper
- Not visible to operators

**Validation**: Expected price must be generated before booking publication.

---

#### BR-S03: Shipper chooses price range.

**Requirement**: Shipper must set price range from expected price.

**Business Rules**:
- Shipper can adjust range up or down from expected price
- Price range visible to operators
- Expected price not visible to operators
- Range cannot be negative or zero

**Validation**: Price range must be set before booking is published for bidding.

---

#### BR-S04: Shipper must complete KYC before publishing booking.

**Requirement**: KYC verification mandatory before booking creation.

**Business Rules**:
- KYC must be approved
- Booking creation blocked if KYC pending or rejected
- KYC approval notification required

**Validation**: Booking cannot be published without approved KYC.

---

### Bidding Requirements

#### BR-S05: Shipper sees masked operator details only.

**Requirement**: Privacy protection for operator contact information.

**Business Rules**:
- Phone numbers shown as `XXXXX-XXXXX` (masked)
- Full contact information not visible
- Operator names visible (not masked)

**Validation**: Full operator phone numbers must never be visible to shipper.

---

#### BR-S06: Shipper can negotiate unlimited times.

**Requirement**: Unlimited negotiation capability.

**Business Rules**:
- No limit on negotiation messages
- Negotiation through in-app messaging
- All negotiations logged for audit

**Validation**: Shipper must be able to negotiate without restrictions.

---

#### BR-S07: Shipper must be able to view all bids.

**Requirement**: Complete bid visibility for shipper.

**Business Rules**:
- All bids visible with masked operator details
- Bid amounts visible
- Bid timestamps visible
- Can sort/filter bids

**Validation**: Shipper must see all bids placed on their booking.

---

#### BR-S08: Auto-finalization must trigger if no action.

**Requirement**: Automatic bid acceptance after 24-hour inactivity.

**Business Rules**:
- Auto-finalization after exactly 24 hours of shipper inactivity
- Lowest bid amount (ascending order) wins
- Shipment created automatically
- Shipper notified of auto-finalization

**Validation**: Auto-finalization must occur if shipper takes no action within 24 hours.

---

### Shipment Requirements

#### BR-S09: Shipper must approve driver before shipment begins.

**Requirement**: Mandatory driver approval step.

**Business Rules**:
- Operator assigns driver
- Shipper receives approval request
- Shipper must approve or reject driver
- Shipment cannot proceed without approval
- Cannot bypass approval step

**Validation**: Shipment status cannot change to IN_TRANSIT without shipper approval.

---

#### BR-S10: Shipper must receive POD after completion.

**Requirement**: Proof of Delivery must be received by shipper.

**Business Rules**:
- POD PDF uploaded by driver
- POD automatically sent to shipper
- POD stored in shipment records
- POD accessible for download/view

**Validation**: Shipper must receive POD upon delivery completion.

---

#### BR-S11: OTP for completion must be sent only to shipper.

**Requirement**: OTP delivery to shipper only.

**Business Rules**:
- 6-digit OTP generated by system
- OTP sent to shipper via platform notification
- OTP not visible to operator or driver in system
- Shipper provides OTP to driver (in-person at delivery)

**Validation**: OTP must only be sent to shipper, not operator or driver.

---

#### BR-S12: Shipper can track live shipment.

**Requirement**: Real-time GPS tracking capability.

**Business Rules**:
- Real-time GPS location display
- Route visualization
- Estimated time to destination
- Historical route tracking

**Validation**: Shipper must be able to view live tracking during active shipment.

---

### Restrictions

#### BR-S13: Cannot cancel booking after bids without rejecting all bids.

**Requirement**: Booking cancellation restrictions.

**Business Rules**:
- Booking can be cancelled before bids
- After bids placed: must reject all bids first
- No refunds if cancelled after bids
- All bids automatically rejected on cancellation

**Validation**: Booking cancellation after bids must reject all bids first.

---

#### BR-S14: Cannot see truck owner details.

**Requirement**: Privacy protection for operator information.

**Business Rules**:
- Truck owner/operator details not visible
- Only masked contact information
- No operator profile access

**Validation**: Full operator/truck owner details must never be visible.

---

#### BR-S15: Cannot see unmasked numbers.

**Requirement**: Phone number masking enforcement.

**Business Rules**:
- All phone numbers masked
- Full numbers never visible
- Masking format: `XXXXX-XXXXX`

**Validation**: Unmasked phone numbers must never be visible to shipper.

---

#### BR-S16: Cannot modify prices after accepting bid.

**Requirement**: Price lock after bid acceptance.

**Business Rules**:
- Price locked after bid acceptance
- Cannot modify price range after acceptance
- Shipment created with accepted bid amount

**Validation**: Price modification must be blocked after bid acceptance.

---

## 🟨 SECTION 3 — OPERATOR APP REQUIREMENTS

### Registration & KYC

#### BR-O01: Operator must complete KYC.

**Requirement**: KYC mandatory for operator registration.

**Business Rules**:
- KYC verification required
- Platform access blocked until KYC approved
- No bidding without approved KYC
- Self-service registration (no franchise approval)

**Validation**: Operator cannot use platform without approved KYC.

---

#### BR-O02: No franchise approval required.

**Requirement**: Operator registration without franchise approval.

**Business Rules**:
- Self-service registration
- No approval from Unit or District Franchise
- Registration completed after KYC approval
- Immediate platform access after KYC approval

**Validation**: Operator registration must not require franchise approval.

---

### Truck Requirements

#### BR-O03: Operator may onboard up to 10 trucks only.

**Requirement**: Maximum truck limit per operator.

**Business Rules**:
- Hard limit: 10 trucks per operator
- System prevents 11th truck registration
- Existing trucks remain active if limit reached

**Validation**: System must reject any attempt to register more than 10 trucks.

---

#### BR-O04: Trucks must be: HGV, 2018+, BS4/BS6, NP valid.

**Requirement**: Truck eligibility criteria.

**Business Rules**:
- **HGV**: Heavy Goods Vehicle only
- **2018+**: Manufacturing year 2018 or later
- **BS4/BS6**: Emission standard BS4 or BS6
- **NP**: National Permit valid and non-expired

**Validation**: Trucks not meeting all criteria must be rejected.

---

#### BR-O05: Trucks must undergo inspection every 120 days.

**Requirement**: Mandatory inspection cycle.

**Business Rules**:
- Inspection required every 120 days
- Inspection cycle from last inspection date
- Alerts at 30 days, 7 days, and on due date
- Auto-block if inspection overdue

**Validation**: System must track and enforce 120-day inspection cycle.

---

#### BR-O06: Trucks with expired docs auto-block.

**Requirement**: Automatic blocking for expired documents.

**Business Rules**:
- Auto-block triggered on document expiry
- Documents: RC, Fitness, Insurance, Permit, Pollution
- Bidding access blocked
- Unblocked only after document renewal

**Validation**: System must automatically block trucks with expired documents.

---

### Bidding Requirements

#### BR-O07: One active bid per booking.

**Requirement**: Single bid restriction per booking.

**Business Rules**:
- Only one active bid per operator per booking
- Submitting new bid cancels previous bid
- Multiple bids not allowed

**Validation**: System must prevent multiple active bids on same booking.

---

#### BR-O08: Unlimited bid modifications allowed.

**Requirement**: No limit on bid modifications.

**Business Rules**:
- Unlimited modifications allowed
- No restrictions on number of changes
- Subject to ledger balance availability

**Validation**: Operator must be able to modify bids without limit.

---

#### BR-O09: Bidding fee must be auto-deducted.

**Requirement**: Automatic bidding fee deduction.

**Business Rules**:
- Fee deducted from ledger upon bid submission
- Formula: ₹5 × tonnage + ₹0.25 × distance (km)
- Bid rejected if balance insufficient
- Fee charged only once per active bid

**Validation**: Bidding fee must be automatically deducted from operator ledger.

---

#### BR-O10: Ledger cannot go negative.

**Requirement**: Negative balance prevention.

**Business Rules**:
- Ledger balance cannot go below zero
- Hard limit enforced by system
- Bid rejected if balance insufficient
- Operator must add funds before bidding

**Validation**: System must prevent negative ledger balance.

---

#### BR-O11: Operator sees only price range.

**Requirement**: Limited price visibility for operators.

**Business Rules**:
- Operator sees shipper-adjusted price range
- Cannot see expected price
- Cannot see other operators' bid amounts
- Fair bidding environment maintained

**Validation**: Operators must not see expected price or other bid amounts.

---

#### BR-O12: Operator cannot cancel accepted booking.

**Requirement**: Booking cancellation restriction after acceptance.

**Business Rules**:
- Operator cannot cancel booking after bid accepted
- Shipment binding once accepted
- Only shipper or admin can cancel after acceptance

**Validation**: Operator cancellation option must be removed after bid acceptance.

---

### Shipment Assignment Requirements

#### BR-O13: Operator must assign truck & driver.

**Requirement**: Mandatory assignment of truck and driver.

**Business Rules**:
- Operator must assign truck from eligible trucks
- Operator must assign driver from linked drivers
- Both assignments required before shipment proceeds
- Cannot proceed without assignments

**Validation**: Shipment cannot proceed without truck and driver assignment.

---

#### BR-O14: Operator may reassign new driver (must trigger shipper approval).

**Requirement**: Driver reassignment with approval.

**Business Rules**:
- Operator can change driver assignment
- Change triggers shipper approval request
- Shipper must approve new driver
- Cannot proceed without approval

**Validation**: Driver reassignment must require shipper approval.

---

#### BR-O15: Operator may assign alternate truck for accident/breakdown.

**Requirement**: Alternate truck assignment capability.

**Business Rules**:
- Allowed only for accident/breakdown
- Alternate truck must meet eligibility criteria
- Full compliance verification required
- Shipper approval required for alternate driver
- Admin authorization required

**Validation**: Alternate truck assignment must follow proper approval process.

---

#### BR-O16: Operator cannot start shipment.

**Requirement**: Shipment start restriction.

**Business Rules**:
- Shipment starts only after shipper approval
- Operator cannot manually start shipment
- Status change to IN_TRANSIT requires shipper approval

**Validation**: Operator must not be able to start shipment without shipper approval.

---

### Restrictions

#### BR-O17: Cannot see shipper personal details.

**Requirement**: Privacy protection for shipper information.

**Business Rules**:
- Shipper personal details masked
- Only masked contact information visible
- No access to shipper profile details

**Validation**: Full shipper personal details must never be visible to operator.

---

#### BR-O18: Cannot modify shipment details.

**Requirement**: Shipment modification restriction.

**Business Rules**:
- Shipment details locked after creation
- Operator cannot modify route, pickup, or drop
- Only admin can override shipment details

**Validation**: Operator must not be able to modify shipment details.

---

#### BR-O19: Cannot assign more than one driver at a time.

**Requirement**: Single driver assignment restriction.

**Business Rules**:
- Only one driver can be assigned per shipment
- Cannot assign multiple drivers simultaneously
- One active shipment per driver rule enforced

**Validation**: System must prevent multiple driver assignments.

---

## 🟩 SECTION 4 — DRIVER APP REQUIREMENTS

### Driver Requirements

#### BR-D01: Driver must complete KYC.

**Requirement**: KYC mandatory for driver registration.

**Business Rules**:
- KYC verification required
- Cannot be assigned to shipment without approved KYC
- Identity verification mandatory

**Validation**: Driver cannot execute shipment without approved KYC.

---

#### BR-D02: Driver license must be valid.

**Requirement**: Valid driving license mandatory.

**Business Rules**:
- Valid, non-expired driving license
- Appropriate license class (HGV for truck drivers)
- License expiry tracking
- License verification during inspection

**Validation**: Driver with expired or invalid license must be blocked.

---

#### BR-D03: Driver can work under multiple operators.

**Requirement**: Multi-operator capability.

**Business Rules**:
- Driver can be linked to multiple operators
- Can accept shipments from different operators
- One active shipment at a time (across all operators)

**Validation**: Driver must be able to work with multiple operators.

---

### Shipment Requirements

#### BR-D04: Driver must upload pickup photo.

**Requirement**: Mandatory pickup photo upload.

**Business Rules**:
- Photo must show cargo being loaded
- Geotagged and timestamped
- Uploaded when status changes to AT_PICKUP

**Validation**: Pickup photo must be uploaded before shipment can proceed.

---

#### BR-D05: Driver must upload drop photo.

**Requirement**: Mandatory drop photo upload.

**Business Rules**:
- Photo must show cargo being unloaded
- Geotagged and timestamped
- Uploaded when status changes to AT_DESTINATION

**Validation**: Drop photo must be uploaded before OTP entry.

---

#### BR-D06: Driver must upload POD PDF.

**Requirement**: Mandatory Proof of Delivery upload.

**Business Rules**:
- POD PDF required
- Contains delivery confirmation (signature, stamp, acknowledgment)
- Uploaded after drop photo
- Stored in shipment records

**Validation**: POD PDF must be uploaded for shipment completion.

---

#### BR-D07: Driver must complete delivery via OTP.

**Requirement**: OTP-based delivery completion.

**Business Rules**:
- 6-digit OTP entered by driver
- OTP provided by shipper (in-person)
- OTP verified by system
- Delivery completes only after correct OTP entry

**Validation**: Shipment cannot complete without correct OTP entry.

---

#### BR-D08: Driver can report breakdown.

**Requirement**: Breakdown reporting capability.

**Business Rules**:
- Breakdown report with location (GPS)
- Breakdown photo (optional but recommended)
- Operator notified immediately
- Alternate truck process initiated

**Validation**: Driver must be able to report breakdown and trigger alternate truck process.

---

#### BR-D09: Driver can report delay.

**Requirement**: Delay reporting capability.

**Business Rules**:
- Delay report with reason
- Location and timestamp captured
- Operator and shipper notified
- Admin monitoring triggered if significant delay

**Validation**: Driver must be able to report delays with reason.

---

### Tracking Requirements

#### BR-D10: GPS ping every 60 seconds.

**Requirement**: Continuous GPS tracking.

**Business Rules**:
- Driver app sends GPS location every 60 seconds
- Automatic, continuous transmission
- Cannot be disabled by driver

**Validation**: GPS ping must occur every 60 seconds during active shipment.

---

#### BR-D11: Tracking must continue throughout shipment.

**Requirement**: Complete tracking coverage.

**Business Rules**:
- Tracking active from IN_TRANSIT to COMPLETED
- Continuous tracking during all statuses
- No gaps in tracking data

**Validation**: Tracking must be continuous throughout entire shipment lifecycle.

---

#### BR-D12: Tracking >30 min missing = alert.

**Requirement**: Tracking failure alert.

**Business Rules**:
- Alert triggered if no GPS ping for 30+ minutes
- Alert sent to operator, shipper, and HQ
- Investigation triggered automatically

**Validation**: Tracking alert must trigger after 30 minutes of missing pings.

---

### Restrictions

#### BR-D13: Cannot modify shipment.

**Requirement**: Shipment modification restriction.

**Business Rules**:
- Driver cannot modify shipment details
- Cannot change route, pickup, or drop
- Cannot modify shipment status manually

**Validation**: Driver must not be able to modify any shipment details.

---

#### BR-D14: Cannot bypass OTP.

**Requirement**: OTP bypass prevention.

**Business Rules**:
- OTP mandatory for completion
- No manual override without HQ authorization
- System prevents completion without OTP

**Validation**: Shipment cannot complete without correct OTP entry.

---

#### BR-D15: Cannot upload fake POD.

**Requirement**: POD authenticity validation.

**Business Rules**:
- POD authenticity check
- Reused POD detection
- Digitally manipulated POD detection

**Validation**: Fake POD upload must trigger investigation and block.

---

#### BR-D16: Cannot have more than one active shipment.

**Requirement**: Single active shipment restriction.

**Business Rules**:
- One active shipment per driver at a time
- Cannot accept new shipment with active one
- Must complete current shipment first

**Validation**: System must prevent multiple active shipments per driver.

---

## 🟦 SECTION 5 — ADMIN PORTAL REQUIREMENTS

### Admin Authority Requirements

#### BR-A01: Admin can override shipments.

**Requirement**: Shipment override capability.

**Business Rules**:
- Override shipment status or lifecycle
- Change shipment assignments
- Must document justification
- Audit trail maintained

**Validation**: Admin must be able to override shipments with proper authorization.

---

#### BR-A02: Admin can reassign truck or driver.

**Requirement**: Assignment override capability.

**Business Rules**:
- Reassign truck or driver
- Shipper approval required for driver changes
- Justification documentation required
- Audit trail maintained

**Validation**: Admin must be able to reassign with proper approvals.

---

#### BR-A03: Admin must justify override.

**Requirement**: Override justification mandatory.

**Business Rules**:
- Justification required for all overrides
- Documentation in audit trail
- Reason clearly stated
- Authorization logged

**Validation**: All admin overrides must include justification.

---

#### BR-A04: Admin can escalate fraud.

**Requirement**: Fraud escalation capability.

**Business Rules**:
- Launch fraud investigations
- Escalate to legal authorities if needed
- Coordinate with compliance team
- Maintain fraud database

**Validation**: Admin must be able to escalate fraud cases.

---

#### BR-A05: Admin cannot modify ledger.

**Requirement**: Ledger modification restriction.

**Business Rules**:
- Ledger is immutable (system-only modifications)
- Admin cannot manually modify balances
- No ledger override capability

**Validation**: Admin ledger modification must be completely blocked.

---

#### BR-A06: Admin cannot bypass compliance flags.

**Requirement**: Compliance flag bypass restriction.

**Business Rules**:
- Cannot suppress compliance flags
- Cannot lower violation severity without evidence
- Must follow proper escalation procedures

**Validation**: Compliance flags must not be bypassable by admin.

---

#### BR-A07: Admin sees masked KYC unless KYC-admin.

**Requirement**: KYC access restriction.

**Business Rules**:
- Standard admin sees masked KYC only
- KYC-admin role required for full KYC access
- Access logging and auditing

**Validation**: Standard admin must not see full KYC without KYC-admin role.

---

#### BR-A08: Admin must view shipment timeline.

**Requirement**: Complete shipment timeline visibility.

**Business Rules**:
- Full shipment lifecycle timeline
- All status changes with timestamps
- All actions and actors logged
- Complete audit trail visible

**Validation**: Admin must see complete shipment timeline.

---

### Dashboard Requirements

#### BR-A09: Booking dashboard (status-wise).

**Requirement**: Booking status dashboard.

**Business Rules**:
- View bookings by status (DRAFT, OPEN_FOR_BIDDING, BID_ACCEPTED, CANCELLED)
- Filter and search capabilities
- Status-wise counts and metrics

**Validation**: Admin must have booking dashboard with status filtering.

---

#### BR-A10: Shipment dashboard.

**Requirement**: Shipment monitoring dashboard.

**Business Rules**:
- View all active shipments
- Status-wise grouping
- Real-time updates
- Filter and search capabilities

**Validation**: Admin must have comprehensive shipment dashboard.

---

#### BR-A11: Tracking dashboard.

**Requirement**: GPS tracking monitoring dashboard.

**Business Rules**:
- Real-time tracking visualization
- Tracking anomaly alerts
- Missing ping indicators
- Route deviation detection

**Validation**: Admin must have tracking monitoring dashboard.

---

#### BR-A12: Compliance dashboard.

**Requirement**: Compliance monitoring dashboard.

**Business Rules**:
- Compliance violations view
- Auto-block status
- Document expiry alerts
- Inspection due status
- Compliance metrics

**Validation**: Admin must have compliance monitoring dashboard.

---

#### BR-A13: Franchise performance dashboard.

**Requirement**: Franchise performance tracking.

**Business Rules**:
- Franchise performance metrics
- Inspection quality scores
- Strike system status
- Payout information

**Validation**: Admin must have franchise performance dashboard.

---

#### BR-A14: Fraud detection dashboard.

**Requirement**: Fraud monitoring dashboard.

**Business Rules**:
- Fraud alerts and flags
- Suspicious activity indicators
- Fraud pattern detection
- Investigation status

**Validation**: Admin must have fraud detection dashboard.

---

### Notification Requirements

#### BR-A15: Alert when tracking missing >30 min.

**Requirement**: Tracking failure alert.

**Business Rules**:
- Alert triggered after 30 minutes
- Alert sent to admin dashboard
- Investigation prompt
- Escalation if unresolved

**Validation**: Admin must receive alert when tracking missing for 30+ minutes.

---

#### BR-A16: Alert for expired trucks.

**Requirement**: Document expiry alert.

**Business Rules**:
- Alert when truck documents expire
- Alert when inspection overdue
- Compliance flag notification
- Auto-block status update

**Validation**: Admin must receive alerts for expired trucks.

---

#### BR-A17: Alert for suspicious tracking.

**Requirement**: Tracking anomaly alert.

**Business Rules**:
- Alert for GPS spoofing
- Alert for route deviation
- Alert for speed anomalies
- Pattern-based alerts

**Validation**: Admin must receive alerts for suspicious tracking patterns.

---

#### BR-A18: Alert for KYC mismatch.

**Requirement**: Identity verification alert.

**Business Rules**:
- Alert when KYC mismatch detected
- Alert when identity fraud suspected
- Driver impersonation alerts
- Investigation prompt

**Validation**: Admin must receive alerts for KYC mismatches.

---

## 🟪 SECTION 6 — FRANCHISE PORTAL REQUIREMENTS

### Unit Franchise Requirements

#### BR-FU01: Conduct inspections.

**Requirement**: Physical truck inspection capability.

**Business Rules**:
- Conduct mandatory 120-day inspections
- Complete inspection checklist
- Physical verification of truck
- Document verification

**Validation**: Unit Franchise must be able to conduct inspections.

---

#### BR-FU02: Upload geo-tagged photos.

**Requirement**: Photo documentation with geotagging.

**Business Rules**:
- Upload inspection photos
- Photos must be geotagged
- Timestamp included
- Multiple photos allowed

**Validation**: Inspection photos must be geo-tagged and timestamped.

---

#### BR-FU03: Fill inspection checklist.

**Requirement**: Complete inspection documentation.

**Business Rules**:
- Complete all checklist items
- Document findings
- Pass/fail determination
- Report generation

**Validation**: Inspection checklist must be completed for each inspection.

---

#### BR-FU04: Approve/reject trucks.

**Requirement**: Truck approval/rejection authority.

**Business Rules**:
- Approve trucks meeting eligibility
- Reject non-compliant trucks
- Document rejection reasons
- Cannot approve ineligible trucks

**Validation**: Unit Franchise must be able to approve or reject trucks.

---

#### BR-FU05: Escalate suspicious cases.

**Requirement**: Suspicious activity escalation.

**Business Rules**:
- Escalate fake documents
- Escalate identity mismatches
- Escalate fraud attempts
- Report to District Franchise

**Validation**: Unit Franchise must be able to escalate suspicious cases.

---

### District Franchise Requirements

#### BR-FD01: Audit unit inspections.

**Requirement**: Inspection quality audit capability.

**Business Rules**:
- Review Unit Franchise inspections
- Quality control and accuracy verification
- Random sampling
- Audit reports

**Validation**: District Franchise must be able to audit unit inspections.

---

#### BR-FD02: Approve/reject audit results.

**Requirement**: Audit result authority.

**Business Rules**:
- Approve audit results
- Reject and require re-inspection
- Override unit decisions if needed
- Document audit findings

**Validation**: District Franchise must be able to approve/reject audit results.

---

#### BR-FD03: Set targets for units.

**Requirement**: Performance target setting.

**Business Rules**:
- Set performance targets for Unit Franchises
- Quality targets
- Compliance targets
- Inspection targets

**Validation**: District Franchise must be able to set targets for units.

---

#### BR-FD04: Assign inspection SLAs.

**Requirement**: Service level agreement assignment.

**Business Rules**:
- Define inspection timeframes
- Set response time requirements
- Monitor SLA compliance
- Report violations

**Validation**: District Franchise must be able to assign inspection SLAs.

---

#### BR-FD05: Handle escalations.

**Requirement**: Escalation management capability.

**Business Rules**:
- Handle escalations from Unit Franchise
- Investigate issues
- Make decisions
- Escalate to HQ if needed

**Validation**: District Franchise must be able to handle escalations.

---

#### BR-FD06: Monitor compliance.

**Requirement**: Compliance monitoring capability.

**Business Rules**:
- Monitor unit compliance
- Track compliance metrics
- Identify violations
- Generate compliance reports

**Validation**: District Franchise must be able to monitor compliance.

---

### Franchise Restrictions

#### BR-FX01: No access to full KYC.

**Requirement**: KYC access restriction.

**Business Rules**:
- Franchise sees masked KYC only
- No full KYC access
- Privacy protection enforced

**Validation**: Franchise must not have access to full KYC.

---

#### BR-FX02: Cannot modify shipments.

**Requirement**: Shipment modification restriction.

**Business Rules**:
- Cannot modify shipment details
- Cannot change assignments
- Cannot override shipments

**Validation**: Franchise must not be able to modify shipments.

---

#### BR-FX03: Cannot assign trucks or drivers.

**Requirement**: Assignment restriction.

**Business Rules**:
- Cannot assign trucks
- Cannot assign drivers
- Assignment is operator/admin authority

**Validation**: Franchise must not be able to assign trucks or drivers.

---

#### BR-FX04: Cannot bypass auto-block.

**Requirement**: Auto-block bypass restriction.

**Business Rules**:
- Cannot override auto-blocks
- Cannot remove blocks
- Must escalate to HQ for overrides

**Validation**: Franchise must not be able to bypass auto-blocks.

---

#### BR-FX05: Cannot modify ledger.

**Requirement**: Ledger modification restriction.

**Business Rules**:
- Cannot access ledger
- Cannot modify balances
- No financial access

**Validation**: Franchise must not have ledger access or modification capability.

---

## 🟫 SECTION 7 — SYSTEM LOGIC REQUIREMENTS

### Auto-Block Logic

#### BR-SL01: Expired documents.

**Requirement**: Auto-block on document expiry.

**Business Rules**:
- Auto-block triggered immediately on expiry
- Documents: RC, Fitness, Insurance, Permit, Pollution
- Bidding access blocked
- Unblocked only after renewal

**Validation**: System must auto-block trucks with expired documents.

---

#### BR-SL02: Failed inspection.

**Requirement**: Auto-block on inspection failure.

**Business Rules**:
- Auto-block if inspection failed
- Blocked until re-inspection passed
- Bidding access blocked

**Validation**: System must auto-block trucks with failed inspections.

---

#### BR-SL03: Suspicious tracking.

**Requirement**: Auto-block on tracking manipulation.

**Business Rules**:
- Auto-block if GPS spoofing detected
- Auto-block if tracking data manipulated
- Investigation triggered

**Validation**: System must auto-block on suspicious tracking detection.

---

#### BR-SL04: KYC mismatch.

**Requirement**: Auto-block on identity mismatch.

**Business Rules**:
- Auto-block if driver identity doesn't match KYC
- Auto-block if face match fails
- Investigation triggered

**Validation**: System must auto-block on KYC mismatch.

---

#### BR-SL05: Ledger attempts negative.

**Requirement**: Negative balance prevention.

**Business Rules**:
- Bid rejected if balance insufficient
- System prevents negative balance
- Hard limit at zero

**Validation**: System must prevent ledger from going negative.

---

#### BR-SL06: Operator attempts >10 trucks.

**Requirement**: Truck limit enforcement.

**Business Rules**:
- Registration rejected if operator has 10 trucks
- Hard limit enforcement
- Cannot exceed 10 trucks

**Validation**: System must reject any attempt to register more than 10 trucks.

---

### Auto-Finalization Logic

#### BR-SL07: Lowest bid wins after timeout.

**Requirement**: Automatic bid acceptance.

**Business Rules**:
- Auto-finalization after 24 hours of shipper inactivity
- Lowest bid amount (ascending order) wins
- Shipment created automatically

**Validation**: Auto-finalization must trigger with lowest bid after 24 hours.

---

### Tracking Logic

#### BR-SL08: 60 sec ping

**Requirement**: GPS ping frequency.

**Business Rules**:
- GPS location transmitted every 60 seconds
- Continuous during active shipment
- Automatic transmission

**Validation**: System must transmit GPS ping every 60 seconds.

---

#### BR-SL09: Alert at 30 min

**Requirement**: Tracking failure alert.

**Business Rules**:
- Alert if no ping for 30+ minutes
- Alert sent to operator, shipper, HQ
- Investigation triggered

**Validation**: System must alert when tracking missing for 30+ minutes.

---

#### BR-SL10: Log retention 30 days raw, 1 year summary

**Requirement**: Tracking data retention.

**Business Rules**:
- Raw GPS data retained for 30 days
- Summary data retained for 1 year
- Historical tracking available
- Data purged after retention period

**Validation**: System must retain tracking data as specified.

---

### Driver Assignment Logic

#### BR-SL11: Driver cannot have active shipment.

**Requirement**: Single active shipment restriction.

**Business Rules**:
- Driver with active shipment cannot be assigned
- System checks before assignment
- One active shipment per driver enforced

**Validation**: System must prevent assigning driver with active shipment.

---

#### BR-SL12: Driver must be linked to operator.

**Requirement**: Driver-operator linkage requirement.

**Business Rules**:
- Driver must be linked to operator account
- Cannot assign unlinked driver
- Linkage verification before assignment

**Validation**: System must verify driver-operator linkage before assignment.

---

#### BR-SL13: Driver must be approved by shipper.

**Requirement**: Shipper approval requirement.

**Business Rules**:
- Approval required before shipment proceeds
- Cannot bypass approval step
- Status change blocked until approval

**Validation**: System must require shipper approval before shipment proceeds.

---

### Shipment Completion Logic

#### BR-SL14: OTP mandatory.

**Requirement**: OTP-based completion.

**Business Rules**:
- OTP mandatory for completion
- Cannot complete without OTP
- OTP verification required

**Validation**: System must prevent completion without correct OTP.

---

#### BR-SL15: POD mandatory.

**Requirement**: POD upload requirement.

**Business Rules**:
- POD PDF mandatory
- Cannot complete without POD
- POD validation required

**Validation**: System must require POD upload for completion.

---

#### BR-SL16: Driver identity match mandatory.

**Requirement**: Identity verification at delivery.

**Business Rules**:
- Driver identity verified at delivery
- Face match or photo verification
- Cannot complete with wrong driver

**Validation**: System must verify driver identity matches approved driver.

---

## 🟧 SECTION 8 — COMPLIANCE REQUIREMENTS

#### BR-C01: Mandatory inspection every 120 days.

**Requirement**: Inspection cycle enforcement.

**Business Rules**:
- Inspection required every 120 days
- Cycle from last inspection date
- Auto-block if overdue

**Validation**: System must enforce 120-day inspection cycle.

---

#### BR-C02: Auto-reminder 5 days before.

**Requirement**: Inspection reminder system.

**Business Rules**:
- Reminder sent 5 days before due date
- Also at 30 days and 7 days before
- Final reminder on due date

**Validation**: System must send inspection reminders.

---

#### BR-C03: Compliance failure = auto-block.

**Requirement**: Automatic compliance enforcement.

**Business Rules**:
- Auto-block on compliance violations
- Immediate enforcement
- No bypass without HQ authorization

**Validation**: System must auto-block on compliance failures.

---

#### BR-C04: Tracking anomalies must trigger compliance check.

**Requirement**: Tracking-based compliance monitoring.

**Business Rules**:
- Anomaly detection triggers compliance check
- Pattern analysis
- Investigation initiation

**Validation**: Tracking anomalies must trigger compliance verification.

---

#### BR-C05: Incident reports must be logged.

**Requirement**: Incident logging requirement.

**Business Rules**:
- All incidents logged
- Breakdown, accident, delay reports
- Complete audit trail

**Validation**: All incident reports must be logged with timestamps.

---

#### BR-C06: KYC data must be encrypted.

**Requirement**: Data security requirement.

**Business Rules**:
- KYC documents encrypted at rest
- Secure storage
- Access logging

**Validation**: KYC data must be encrypted in storage.

---

#### BR-C07: Masking rules must be enforced across all apps.

**Requirement**: Privacy protection enforcement.

**Business Rules**:
- Masking enforced in all apps
- Consistent masking format
- No unmasking without authorization

**Validation**: Masking rules must be enforced across all applications.

---

## 🟥 SECTION 9 — SAFETY & INCIDENT REQUIREMENTS

#### BR-SI01: Driver can report breakdown.

**Requirement**: Breakdown reporting capability.

**Business Rules**:
- Breakdown report with location
- Photo documentation
- Operator notification

**Validation**: Driver must be able to report breakdown.

---

#### BR-SI02: Operator must assign alternate truck.

**Requirement**: Alternate truck assignment requirement.

**Business Rules**:
- Alternate truck required for breakdown/accident
- Full compliance verification
- Shipper approval required

**Validation**: Operator must assign alternate truck for breakdown/accident.

---

#### BR-SI03: Shipper must re-approve driver.

**Requirement**: Driver re-approval for alternate truck.

**Business Rules**:
- Shipper approval required for alternate driver
- Cannot proceed without approval
- Approval notification sent

**Validation**: Shipper must approve alternate driver.

---

#### BR-SI04: Admin must monitor accident logs.

**Requirement**: Accident monitoring requirement.

**Business Rules**:
- Accident logs visible to admin
- Real-time monitoring
- Alert system

**Validation**: Admin must have access to accident logs.

---

#### BR-SI05: District Franchise must audit accident cases.

**Requirement**: Accident audit requirement.

**Business Rules**:
- District Franchise reviews accident cases
- Quality audit
- Compliance verification

**Validation**: District Franchise must audit accident cases.

---

#### BR-SI06: Post-accident truck must undergo inspection.

**Requirement**: Post-accident inspection requirement.

**Business Rules**:
- Inspection required after accident
- Before truck can be used again
- Safety verification

**Validation**: Post-accident truck must be inspected before reuse.

---

## 🟦 SECTION 10 — FRAUD PREVENTION REQUIREMENTS

#### BR-FP01: Fake KYC triggers auto-lock.

**Requirement**: Identity fraud detection.

**Business Rules**:
- Fake KYC detected
- Account auto-locked immediately
- Investigation triggered

**Validation**: Fake KYC must trigger immediate account lock.

---

#### BR-FP02: Fake POD triggers audit.

**Requirement**: POD fraud detection.

**Business Rules**:
- Fake POD detected
- Audit triggered
- Shipment flagged
- Investigation initiated

**Validation**: Fake POD must trigger audit and investigation.

---

#### BR-FP03: Fake tracking triggers monitoring.

**Requirement**: Tracking fraud detection.

**Business Rules**:
- GPS spoofing detected
- Tracking manipulation identified
- Enhanced monitoring activated

**Validation**: Fake tracking must trigger monitoring and alerts.

---

#### BR-FP04: Collusive bidding must be detected.

**Requirement**: Collusion detection.

**Business Rules**:
- Pattern-based collusion detection
- Multiple operators coordinating
- Market manipulation identification

**Validation**: System must detect collusive bidding patterns.

---

#### BR-FP05: Identity mismatch triggers investigation.

**Requirement**: Identity verification requirement.

**Business Rules**:
- Driver identity mismatch detected
- Investigation triggered
- Account blocked pending investigation

**Validation**: Identity mismatch must trigger investigation.

---

#### BR-FP06: Wrong driver triggers shipment freeze.

**Requirement**: Driver verification requirement.

**Business Rules**:
- Wrong driver detected
- Shipment frozen immediately
- Investigation triggered
- Driver reassignment required

**Validation**: Wrong driver must trigger shipment freeze.

---

#### BR-FP07: Franchise misconduct triggers strike.

**Requirement**: Franchise violation enforcement.

**Business Rules**:
- Franchise violation detected
- Strike assigned
- Strike system enforced
- Escalation if severe

**Validation**: Franchise misconduct must trigger strike system.

---

## 🟩 SECTION 11 — AUDIT REQUIREMENTS

### Unit Franchise

#### BR-AU01: Daily inspections log.

**Requirement**: Daily inspection logging.

**Business Rules**:
- All inspections logged daily
- Complete inspection records
- Timestamp and details

**Validation**: Daily inspection log must be maintained.

---

#### BR-AU02: Weekly compliance report.

**Requirement**: Weekly reporting requirement.

**Business Rules**:
- Compliance report generated weekly
- Violations and issues documented
- Performance metrics included

**Validation**: Weekly compliance report must be generated.

---

### District Franchise

#### BR-AU03: Monthly audit.

**Requirement**: Monthly audit requirement.

**Business Rules**:
- District Franchise audits Unit Franchises monthly
- Quality review
- Performance evaluation

**Validation**: Monthly audit must be conducted.

---

#### BR-AU04: Compliance grading.

**Requirement**: Compliance scoring requirement.

**Business Rules**:
- Unit Franchise compliance graded
- Score-based evaluation
- Performance tracking

**Validation**: Compliance grading system must be implemented.

---

### HQ

#### BR-AU05: Quarterly compliance review.

**Requirement**: Quarterly review requirement.

**Business Rules**:
- Platform-wide compliance review
- Policy effectiveness evaluation
- System performance analysis

**Validation**: Quarterly compliance review must be conducted.

---

#### BR-AU06: Fraud pattern audit.

**Requirement**: Fraud pattern analysis requirement.

**Business Rules**:
- Cross-user fraud pattern analysis
- Pattern detection and correlation
- Fraud alert generation

**Validation**: Fraud pattern audit must be conducted regularly.

---

#### BR-AU07: Franchise performance audit.

**Requirement**: Franchise performance evaluation requirement.

**Business Rules**:
- Franchise performance reviewed
- Quality metrics evaluated
- Payout decisions based on performance

**Validation**: Franchise performance audit must be conducted.

---

## 🟨 SECTION 12 — REPORTING REQUIREMENTS

#### BR-R01: Daily shipment status report.

**Requirement**: Daily shipment reporting.

**Business Rules**:
- Shipment status summary daily
- Status-wise counts
- Metrics and trends

**Validation**: Daily shipment status report must be generated.

---

#### BR-R02: Tracking anomaly report.

**Requirement**: Tracking anomaly reporting.

**Business Rules**:
- Tracking issues documented
- Anomaly patterns identified
- Alert summary

**Validation**: Tracking anomaly report must be generated.

---

#### BR-R03: Compliance report.

**Requirement**: Compliance reporting.

**Business Rules**:
- Compliance violations documented
- Auto-block status
- Compliance metrics

**Validation**: Compliance report must be generated.

---

#### BR-R04: Fraud detection log.

**Requirement**: Fraud log maintenance.

**Business Rules**:
- Fraud cases logged
- Investigation status tracked
- Pattern analysis

**Validation**: Fraud detection log must be maintained.

---

#### BR-R05: Franchise performance scorecard.

**Requirement**: Franchise performance reporting.

**Business Rules**:
- Franchise performance metrics
- Quality scores
- Strike status
- Payout information

**Validation**: Franchise performance scorecard must be generated.

---

#### BR-R06: Operator/Driver risk score.

**Requirement**: Risk scoring reporting.

**Business Rules**:
- Risk scores calculated
- Performance metrics included
- Trend analysis

**Validation**: Operator/Driver risk scores must be calculated and reported.

---

## 🟧 SECTION 13 — RELEASE BLOCKERS (Non-Negotiable)

A feature **CANNOT be released** if:

### Business Brain Violations

- Any flow violates the Business Brain
- Business rules not enforced
- Zero-compromise rules bypassed

### Privacy Violations

- Masking exposed (unmasked data visible)
- KYC access violations
- Privacy rules broken

### Approval Flow Issues

- Approval flow broken
- Driver approval bypassed
- Shipper approval skipped

### Compliance Violations

- KYC rules incomplete
- Tracking not working
- OTP bypass exists
- Auto-finalization disabled
- Auto-block disabled

### Eligibility Compromises

- Operator/Driver/Truck eligibility compromised
- Ineligible entities can participate
- Eligibility rules bypassed

### Governance Issues

- Franchise governance not mapped
- Escalation missing
- Compliance not validated

**These are hard blockers. Feature cannot be released until all blockers resolved.**

---

## ✅ BRMS COMPLETION STATUS

**Total Sections**: 13 Complete Sections  
**Total Requirements**: 100+ Business Requirements  
**App Coverage**: 5 Apps/Portals (Shipper, Operator, Driver, Admin, Franchise)  
**Status**: ✅ **COMPLETE**

---

## 📌 USAGE AREAS

This BRMS is the baseline for:

1. **Cursor IDE**: Business rule enforcement and validation
2. **Product**: Feature requirements and specifications
3. **Engineering**: Development requirements and constraints
4. **QA**: Test case creation and validation
5. **Franchise Operations**: Operational requirements and procedures

---

**📘 The Rodistaa Business Requirements Master Specification v1.0 is now COMPLETE.**

**Status**: ✅ **READY FOR DEVELOPMENT & OPERATIONS**

---

**Version**: 1.0  
**Last Updated**: December 19, 2024  
**Authority**: Managing Director, Rodistaa

