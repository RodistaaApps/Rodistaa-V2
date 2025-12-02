# 🏛️ Rodistaa Operational Governance & Audit Framework

**Admin + District Franchise + Unit Franchise**

**Date**: December 19, 2024  
**Status**: ✅ **ACTIVE - OPERATIONAL GOVERNANCE SYSTEM**  
**Version**: 1.0

---

## SECTION 1 — PURPOSE OF THIS FRAMEWORK

This framework governs:

- ✅ Operational oversight
- ✅ Compliance enforcement
- ✅ Truck inspections
- ✅ Driver & Operator governance
- ✅ Booking & Shipment lifecycle monitoring
- ✅ Franchise accountability
- ✅ Business audits
- ✅ Safety and transparency

**Goal**: Ensure Rodistaa's business model remains clean, safe, and trustworthy.

---

## SECTION 2 — ROLE DEFINITIONS

### 🟥 1. HQ / Admin (Top Authority)

#### Responsibilities:

- **Platform Governance**
  - Overall platform operations
  - Global policy enforcement
  - Strategic oversight

- **Global Compliance**
  - Ensure all business rules are followed
  - Monitor cross-district compliance
  - Enforce zero-commission model
  - Ensure cash-only payments

- **Approvals & Overrides**
  - Override shipments, bookings, trucks
  - Reassign drivers/trucks
  - Resolve disputes
  - Emergency interventions

- **KYC Supervision**
  - **KYC-admin role only** can view full KYC
  - Oversee KYC verification process
  - Monitor KYC compliance
  - Handle KYC-related escalations

- **Franchise Creation**
  - Create new franchises (Unit & District)
  - Assign franchise territories
  - Set franchise hierarchy

- **Payout Control**
  - Control all franchise payouts
  - Set incentive slabs
  - Define penalty rules
  - Manage payout cycles

- **Monitoring**
  - Monitor auctions, shipments, tracking
  - Track disputes and resolutions
  - Oversee franchise performance
  - Review compliance reports

#### Authority:

- ✅ Full override power (with mandatory audit logs)
- ✅ Can block/unblock operators, drivers, trucks
- ✅ Can reassign shipments
- ✅ Can modify booking status
- ✅ Can view all data (except KYC unless KYC-admin role)

#### Restrictions:

- ❌ Cannot view full KYC unless assigned KYC-admin role
- ❌ Cannot edit ledger entries directly (financial control separate)
- ❌ Cannot modify operator/driver KYC data
- ❌ Cannot create franchises without proper authorization

---

### 🟧 2. District Franchise (Supervisory Role)

#### Controls:

- **All Unit Franchises in the District**
  - Supervise all unit franchises
  - Monitor their performance
  - Set targets and expectations

- **Targets & Performance**
  - Set monthly load targets for units
  - Track unit performance KPIs
  - Evaluate unit franchise effectiveness

- **Incentives**
  - Calculate incentives based on performance
  - Submit incentive recommendations to HQ
  - Monitor incentive distribution

- **Inspection Quality Audits**
  - Audit 5-10% of unit franchise inspections
  - Verify inspection quality
  - Flag poor inspections

- **Regional Compliance**
  - Ensure compliance across district
  - Monitor regional issues
  - Handle district-level escalations

#### Authority:

District Franchise has the authority to:

- ✅ **Override Unit Franchise Decisions**
  - Can reverse unit franchise inspection results
  - Can approve/reject unit recommendations
  - Can reassign inspection tasks

- ✅ **Reject Poor Inspections**
  - Flag substandard inspections
  - Request re-inspections
  - Issue warnings to unit franchises

- ✅ **Request Re-Inspections**
  - Require units to re-inspect trucks
  - Escalate critical inspection issues

- ✅ **Impose Local Compliance Warnings**
  - Issue warnings to operators/drivers
  - Impose temporary restrictions
  - Escalate to HQ for severe violations

#### Cannot:

- ❌ Create new franchises (HQ only)
- ❌ Modify payouts (HQ controlled)
- ❌ Access KYC beyond masked view
- ❌ Override HQ decisions
- ❌ Edit ledger entries

---

### 🟨 3. Unit Franchise (Field-Level Operator)

#### Primary Responsibilities:

- **Conduct Truck Inspections**
  - Perform on-ground inspections
  - Validate truck eligibility
  - Follow inspection checklist
  - Upload inspection photos (mandatory)

- **Validate Truck Photos**
  - Verify truck documentation
  - Check truck condition
  - Ensure photos are authentic

- **Follow Inspection Checklist**
  - Body damage check
  - Tyres inspection
  - Lights/indicators check
  - Seatbelts check
  - Mirrors check
  - Horn check
  - Wipers check
  - Reflective tapes check
  - Number plate visibility check

- **Flag Compliance Failures**
  - Report non-compliance
  - Flag expired documents
  - Report safety issues
  - Escalate critical problems

- **Support Operators Locally**
  - Provide local support
  - Coach operators on compliance
  - Assist with onboarding
  - Monitor operator behavior

#### Cannot:

- ❌ Override District Franchise
- ❌ Modify operator financials (ledger)
- ❌ View full KYC (masked only)
- ❌ Assign drivers to shipments (operator's role)
- ❌ Edit bookings or bids
- ❌ Create or modify franchises
- ❌ Access payout controls

---

## SECTION 3 — FRANCHISE WORKFLOWS

### ⭐ Workflow 1: Truck Inspection Cycle

#### Process:

1. **Operator Requests Inspection**
   - Operator submits inspection request
   - System assigns to Unit Franchise
   - Notification sent to Unit Franchise

2. **Unit Franchise Conducts Inspection**
   - **Geo-tag + Timestamp** (mandatory)
   - Physical inspection at truck location
   - Follow complete inspection checklist

3. **Inspection Checklist (Required)**:
   - ✅ Body damage check
   - ✅ Tyres inspection
   - ✅ Lights/indicators check
   - ✅ Seatbelts check
   - ✅ Mirrors check
   - ✅ Horn check
   - ✅ Wipers check
   - ✅ Reflective tapes check
   - ✅ Number plate visibility check

4. **Upload Photos (Mandatory)**
   - Front view
   - Side view
   - Rear view
   - Interior view
   - Document photos
   - Any damage photos

5. **Unit Franchise Submits Results**
   - Inspection status: PASS/FAIL
   - Comments/notes
   - Photos uploaded
   - Timestamp recorded

6. **District Franchise Audits (5-10% Sampling)**
   - Random selection of inspections
   - Quality verification
   - Flag discrepancies
   - Request corrections if needed

7. **HQ Audits Escalations**
   - Review escalated cases
   - Handle disputes
   - Make final decisions

#### Auto-Block Triggers:

Truck is auto-blocked if:

- ❌ Inspection overdue > 0 days (120-day cycle broken)
- ❌ Document expired (insurance, permit, etc.)
- ❌ Failed inspection not fixed within grace period

---

### ⭐ Workflow 2: Compliance Escalation

#### Escalation Chain:

**Unit Franchise → District Franchise → HQ**

#### Escalations Triggered When:

- 🚨 **Bad Inspections**
  - Substandard inspection quality
  - Repeated inspection failures
  - Fake inspection photos detected

- 🚨 **Operator Misbehavior**
  - Repeated violations
  - Fraudulent activities
  - Non-compliance patterns

- 🚨 **KYC Discrepancies**
  - Document mismatch
  - Identity verification issues
  - Fraudulent KYC attempts

- 🚨 **Tracking Manipulation**
  - Fake GPS locations
  - Disabled tracking
  - Route anomalies

- 🚨 **Repeated Shipment Issues**
  - Multiple failed deliveries
  - OTP fraud attempts
  - POD issues

- 🚨 **Suspected Fraud**
  - Bidding manipulation
  - Fake documents
  - Identity theft

- 🚨 **Accident Requiring Alternate Truck**
  - Breakdown/accident cases
  - Alternate truck assignment needed
  - Insurance claims

#### Escalation Process:

1. **Unit Franchise** flags issue → escalates to District
2. **District Franchise** investigates → escalates to HQ if critical
3. **HQ** reviews → makes final decision → takes action

---

### ⭐ Workflow 3: Franchise Performance & Incentives

#### District Franchise Sets:

- **Monthly Load Targets**
  - Target bookings per month
  - Target shipments completed
  - Target operator onboarding

- **Inspection Deadlines**
  - Inspection SLA requirements
  - Response time expectations
  - Quality standards

- **Operator Onboarding KPI**
  - Number of operators onboarded
  - Quality of onboarding
  - Compliance rate

- **Compliance KPIs**
  - Inspection pass rate
  - Document compliance rate
  - Safety incident rate

#### HQ Sets:

- **Incentive Slabs**
  - Performance-based incentives
  - Target achievement bonuses
  - Quality rewards

- **Penalty Rules**
  - Non-compliance penalties
  - SLA violation penalties
  - Quality issue penalties

- **Payout Cycles**
  - Monthly/quarterly payout schedules
  - Payment terms
  - Disbursement rules

#### Unit Franchise Evaluation Based On:

- ✅ **Inspection Quality**
  - Pass rate
  - District audit results
  - Re-inspection rate

- ✅ **Inspection SLA Adherence**
  - On-time inspection completion
  - Response time
  - Backlog management

- ✅ **Operator Onboarding Quality**
  - Number of operators onboarded
  - Quality of onboarding
  - Operator retention rate

- ✅ **Complaint Ratio**
  - Number of complaints
  - Complaint resolution time
  - Complaint severity

- ✅ **Safety Incidents**
  - Accident rate
  - Safety violations
  - Incident resolution

---

## SECTION 4 — ADMIN WORKFLOWS

### ⭐ Admin Override Rules

#### Admin May Override:

- ✅ **Driver Assignment**
  - Reassign driver to shipment
  - Change driver mid-shipment
  - Force driver assignment

- ✅ **Truck Assignment**
  - Reassign truck to shipment
  - Change truck mid-shipment
  - Force truck assignment

- ✅ **Shipment Routing**
  - Change shipment route
  - Reroute shipment
  - Modify pickup/drop locations

- ✅ **Booking Cancellation**
  - Cancel booking
  - Override cancellation rules
  - Handle cancellation disputes

- ✅ **Shipment Cancellation**
  - Cancel active shipment
  - Override cancellation restrictions
  - Handle mid-shipment cancellation

- ✅ **Auto-Finalization Disputes**
  - Override auto-finalization
  - Reopen bidding
  - Handle shipper disputes

- ✅ **Accident / Breakdown Cases**
  - Approve alternate truck
  - Override alternate truck restrictions
  - Handle emergency situations

- ✅ **Alternate Truck Approvals**
  - Force alternate truck assignment
  - Override operator decisions
  - Emergency replacements

#### Admin Cannot:

- ❌ View KYC unless assigned KYC-admin role
- ❌ Edit ledger entries directly (financial control)
- ❌ Edit operator or driver KYC
- ❌ Create franchises without authorization
- ❌ Modify payout structures without approval

#### Audit Log Requirement:

**ALL admin overrides must be logged with:**
- Admin ID
- Timestamp
- Reason/justification
- Action taken
- Impact assessment
- Stakeholder notifications

---

### ⭐ Admin Intervention Required For:

- 🚨 **Shipment Stuck > 4 Hours**
  - Shipment not progressing
  - Driver not responding
  - Location not updating

- 🚨 **No Ping > 30 Minutes Repeatedly**
  - Repeated tracking failures
  - GPS disabled intentionally
  - Network issues

- 🚨 **Shipper–Operator Dispute**
  - Payment disputes
  - Service quality disputes
  - Delivery disputes

- 🚨 **Fraudulent Bids**
  - Bid manipulation detected
  - Fake bids
  - Collusion suspected

- 🚨 **Fraudulent Driver Assignment**
  - Driver identity mismatch
  - Unauthorized driver assignment
  - Driver switching without approval

- 🚨 **Fake Inspection Photos**
  - Photos don't match truck
  - Duplicate photos detected
  - Photo manipulation

- 🚨 **Document Tampering**
  - Modified documents
  - Fake documents
  - Expired documents in use

- 🚨 **Driver Identity Mismatch**
  - Driver doesn't match KYC
  - Unauthorized driver
  - Identity fraud

- 🚨 **Accident Where Alternate Truck Needed**
  - Accident/breakdown cases
  - Alternate truck required
  - Emergency replacement

- 🚨 **SOS Alerts from Driver**
  - Emergency situations
  - Safety concerns
  - Driver distress calls

---

### ⭐ Admin Audit Tools Required

Admin must have access to:

- ✅ **Shipment Timeline**
  - Complete shipment history
  - Status changes
  - Key events timeline

- ✅ **Bid History Per Booking**
  - All bids placed
  - Bid modifications
  - Bid acceptance/rejection

- ✅ **Ledger Audit Trail**
  - All transactions
  - Balance changes
  - Fee deductions
  - Payment history

- ✅ **KYC Status (Masked)**
  - KYC verification status
  - Document status
  - Compliance status
  - Full KYC (if KYC-admin role)

- ✅ **Truck Document Expiry Dashboard**
  - Upcoming expiries
  - Expired documents
  - Auto-block status
  - Renewal tracking

- ✅ **Tracking Anomalies Dashboard**
  - Missing pings
  - Route deviations
  - GPS failures
  - Alert history

- ✅ **Franchise Performance Dashboard**
  - Unit franchise performance
  - District franchise performance
  - Inspection quality metrics
  - Compliance scores

- ✅ **Risk Scores (Operator / Driver)**
  - Risk rating per operator
  - Risk rating per driver
  - Historical violations
  - Compliance trends

---

## SECTION 5 — COMPLIANCE POLICY ENGINE

### Mandatory Enforcement:

All business decisions must reference this compliance engine:

- ✅ **Cash Payments Only**
  - No digital payments
  - No bank transfers
  - No UPI/wallets
  - Advance + balance = cash only

- ✅ **No Unmasked Numbers to Shippers**
  - Shipper sees masked driver/operator numbers
  - Format: +91 XXXXX X1234
  - Full numbers never exposed

- ✅ **No Non-HGV Trucks**
  - Only HGV (open body/container)
  - No LCV, no other vehicle types
  - HGV validation mandatory

- ✅ **Auto-Block on Expired Docs**
  - Documents expired → immediate block
  - No grace period
  - Auto-unblock after renewal

- ✅ **Driver Must be KYC-Verified**
  - KYC required before operations
  - No operations without KYC
  - KYC status checked before assignment

- ✅ **No Negative Ledger**
  - Ledger balance cannot go negative
  - Bid fee check before bidding
  - Insufficient balance → bid blocked

- ✅ **No SMS/WhatsApp**
  - No SMS notifications
  - No WhatsApp messages
  - In-app notifications only

- ✅ **OTP Mandatory**
  - Delivery completion requires OTP
  - OTP tied to assigned driver
  - No completion without OTP

- ✅ **60-Sec Tracking**
  - GPS ping every 60 seconds
  - Alert if >30 minutes no ping
  - Tracking mandatory

- ✅ **120-Day Inspection Cycle**
  - Inspection every 120 days
  - 5-day reminder before due
  - Overdue → auto-block

- ✅ **Operator ≤ 10 Trucks**
  - Maximum 10 trucks per operator
  - 11th truck blocked
  - No exceptions

---

## SECTION 6 — AUDIT FRAMEWORK (HQ + District)

### HQ AUDITS:

#### Monthly Compliance Reports

- Overall compliance score
- Violation trends
- Compliance by category
- District-wise compliance
- Action items

#### Truck Inspection Audit Sample

- Random sampling of inspections
- Quality verification
- Photo authenticity check
- Checklist completeness
- Fraud detection

#### Ledger Mismatch Scan

- Transaction accuracy
- Fee calculation verification
- Balance reconciliation
- Payment verification
- Anomaly detection

#### KYC Verification Logs

- KYC completion rate
- Verification accuracy
- Document authenticity
- Identity verification
- Fraud attempts

#### Tracking Anomaly Reports

- Missing pings analysis
- Route deviation analysis
- GPS failure patterns
- Alert frequency
- Driver behavior patterns

#### Dispute Closure Audit

- Dispute resolution time
- Dispute resolution quality
- Dispute trends
- Escalation patterns
- Customer satisfaction

#### Contract Compliance

- Franchise agreement compliance
- Operator contract compliance
- Service level compliance
- Payment terms compliance

#### Franchise Payouts Audit

- Payout accuracy
- Incentive calculation verification
- Penalty application verification
- Payment timing compliance

---

### DISTRICT AUDITS:

#### Unit Franchise Inspection Quality

- Inspection pass rate
- Re-inspection rate
- District audit results
- Photo quality
- Checklist completeness

#### Onboarding Accuracy

- Operator onboarding quality
- KYC verification accuracy
- Document verification accuracy
- Compliance rate

#### SLA Compliance

- Inspection response time
- Inspection completion time
- Escalation response time
- Resolution time

#### Ratio of Blocked Trucks

- Block rate per unit
- Block reasons analysis
- Compliance improvement tracking
- Auto-block vs. manual block

#### Accidents / Incidents

- Accident rate
- Incident frequency
- Severity analysis
- Resolution time
- Preventive measures

#### Complaint & Ticket Analytics

- Complaint volume
- Complaint types
- Resolution time
- Customer satisfaction
- Recurring issues

---

### UNIT AUDITS:

#### On-Ground Inspections

- Physical inspection quality
- Checklist adherence
- Photo quality
- Documentation accuracy

#### Operator Coaching

- Compliance training
- Best practices sharing
- Issue resolution support
- Performance improvement

#### Behavior Monitoring

- Operator compliance patterns
- Violation trends
- Improvement tracking
- Risk assessment

---

## SECTION 7 — RISK & FRAUD DETECTION

### Cursor IDE Must Flag Scenarios Such As:

- 🚨 **Fake POD Uploads**
  - POD doesn't match shipment
  - Duplicate PODs
  - Manipulated PODs
  - Missing PODs

- 🚨 **Fake Tracking Paths**
  - Impossible routes
  - Route anomalies
  - GPS manipulation
  - Location jumps

- 🚨 **Driver Switching Without Approval**
  - Unauthorized driver changes
  - Driver mismatch
  - Unapproved substitutions

- 🚨 **Operator Bidding Manipulation**
  - Bid collusion
  - Fake bids
  - Bid manipulation patterns
  - Price fixing

- 🚨 **Franchise Marking Fake Inspections**
  - Inspection without physical visit
  - Duplicate inspections
  - Photo manipulation
  - Checklist fraud

- 🚨 **KYC Fraud Attempts**
  - Fake documents
  - Document tampering
  - Identity mismatch
  - Duplicate KYC

- 🚨 **Multiple Failed OTP Attempts**
  - OTP fraud attempts
  - Repeated failures
  - Unauthorized access attempts

- 🚨 **Misuse of Alternate Truck Option**
  - Unjustified alternate truck
  - Pattern of breakdowns
  - Fraudulent breakdown claims

- 🚨 **Activities During Auto-Block State**
  - Operations while blocked
  - Bid placement while blocked
  - Shipment assignment while blocked

### Escalation:

**All such events escalate: District → HQ**

- District Franchise investigates first
- Escalates to HQ if critical
- HQ makes final decision
- Action taken and logged

---

## SECTION 8 — ENFORCEMENT MECHANISM

### Violation Severity Levels:

#### 🔴 **LOW**: Warning to Unit Franchise

- Minor violations
- First-time offenses
- Non-critical issues
- Action: Warning + correction required

#### 🟠 **MEDIUM**: District-Level Investigation

- Repeated violations
- Moderate severity
- Compliance gaps
- Action: Investigation + corrective action

#### 🟡 **HIGH**: HQ Lock, Block, or Override Action

- Significant violations
- Repeated non-compliance
- Safety concerns
- Action: Block/lock + HQ intervention

#### 🚨 **CRITICAL**: Immediate HQ Intervention + Suspension

- Severe violations
- Fraudulent activities
- Safety risks
- Legal issues
- Action: Immediate suspension + investigation

### Enforcement Logging:

**All enforcement must be logged with:**
- Violation type
- Severity level
- Action taken
- Responsible party
- Timestamp
- Impact assessment
- Stakeholder notifications

---

## SECTION 9 — REPORTING STRUCTURE

### Unit Franchise → District Franchise

#### Daily Reports:
- Inspections conducted
- Onboarding activities
- Compliance issues flagged

#### Weekly Reports:
- Compliance summary
- Inspection quality metrics
- Operator support activities

#### Monthly Reports:
- Target performance
- Inspection statistics
- Compliance trends
- Operator behavior patterns

---

### District Franchise → HQ

#### Weekly Reports:
- Risk & compliance summary
- Escalation status
- Regional issues

#### Monthly Reports:
- Franchise audit report
- Performance metrics
- Compliance scores
- Incentive recommendations
- Penalty recommendations

---

### HQ to Management

#### Monthly Reports:
- Business & compliance scorecard
- Overall platform health
- Franchise performance summary
- Risk assessment
- Compliance trends

#### Quarterly Reports:
- Franchise evaluation report
- Strategic recommendations
- Performance improvements
- Compliance achievements
- Future planning

---

## SECTION 10 — BUSINESS CONTINUITY RULES

### Must Enforce:

- ✅ **Backup Franchise for Critical Districts**
  - Backup franchise identified
  - Handover procedures defined
  - Continuity plan documented

- ✅ **Alternate Inspector During Peak Load**
  - Multiple inspectors available
  - Load balancing mechanism
  - SLA maintained

- ✅ **24x7 Admin Escalation**
  - Admin availability 24x7
  - Escalation channels defined
  - Emergency response procedures

- ✅ **Accident Emergency Response**
  - Emergency protocols
  - Alternate truck assignment
  - Insurance claim process
  - Driver support

- ✅ **Shipment Rerouting Ability**
  - Route modification capability
  - Alternate route options
  - Emergency rerouting

- ✅ **Data Retention Rules**
  - Raw logs: 30 days
  - Summary logs: 1 year
  - Audit logs: 1 year minimum
  - Compliance records: As per regulations

---

## ✅ INTEGRATION WITH BUSINESS SYSTEMS

This framework integrates with:

- ✅ **Business Brain v1.0** (Master Context)
- ✅ **Business Validation Engine** (10-point checklist)
- ✅ **Constraints Enforcement Layer** (Rule enforcement)
- ✅ **Domain Issue Detector** (Violation detection)
- ✅ **Stress-Test Suite** (Scenario validation)
- ✅ **Workflow Mapping Engine** (Process documentation)

---

## 📋 USAGE GUIDELINES

### For Admin:
1. Reference this framework for all operational decisions
2. Use audit tools for monitoring
3. Follow escalation procedures
4. Log all overrides and actions

### For District Franchise:
1. Supervise unit franchises as per framework
2. Conduct audits as defined
3. Escalate critical issues to HQ
4. Report performance metrics

### For Unit Franchise:
1. Conduct inspections as per checklist
2. Flag compliance issues immediately
3. Escalate critical problems
4. Report daily/weekly/monthly

---

**Rodistaa Operational Governance & Audit Framework v1.0 - Active** 🏛️

