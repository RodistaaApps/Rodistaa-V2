# RODISTAA MASTER BUSINESS FILE v1.0

**The Single Source of Truth for All Rodistaa Business Analysis**

**Date**: December 19, 2024  
**Status**: ✅ **ACTIVE - AUTHORITATIVE REFERENCE**  
**Version**: 1.0

---

=====================================================================

=====================================================================

# 0. PURPOSE OF THIS MASTER FILE

=====================================================================

This document defines the **entire** Rodistaa business ecosystem:

- Business logic
- User roles & workflows
- Booking, Bidding, Shipment lifecycle
- Compliance and safety rules
- Franchise governance
- Admin oversight
- Risk & fraud detection
- Operational policies
- Multi-agent intelligence configuration
- Business flow validation & testing
- Domain-level issue detection
- Stress-test suite for edge cases

**No technical or coding instructions belong here.**

Cursor must treat this file as the **single source of truth** for all Rodistaa business analysis.

---

=====================================================================

=====================================================================

# 1. RODISTAA BUSINESS MODEL (FULL)

=====================================================================

Rodistaa is a **zero-commission, AI-augmented, trade+transport marketplace** connecting:

- **SHIPPERS** (load creators)
- **OPERATORS** (truck owners)
- **DRIVERS** (shipment executors)
- **ADMIN/HQ** (governance)
- **FRANCHISES** (District + Unit)

Rodistaa removes intermediaries, ensures transparent bidding, and enforces strict compliance.

## Core Principles:

- ✅ **Zero-commission** marketplace
- ✅ **Cash-only** payments
- ✅ **Strict compliance** & safety
- ✅ **Transparency** and auditability
- ✅ **Eliminate intermediaries**
- ✅ **AI-augmented** pricing and matching

---

=====================================================================

# 2. CORE ENTITIES & CAPABILITIES

=====================================================================

## 2.1 Shipper

### Capabilities:

- ✅ Create bookings
- ✅ Set pickup / drop / tonnage
- ✅ View operator bids
- ✅ Negotiate unlimited times
- ✅ Accept bid → creates Shipment
- ✅ Approve driver
- ✅ Track live shipment
- ✅ Complete via OTP
- ✅ Pay in CASH only

### Restrictions:

- ❌ Cannot view unmasked operator/driver number
- ❌ Cannot bypass driver approval
- ❌ Cannot complete without OTP
- ❌ Cannot see full expected price (only price range)

---

## 2.2 Operator

### Capabilities:

- ✅ Register without approval
- ✅ Manage max **10 trucks**
- ✅ Place bids (ONE active bid per booking)
- ✅ Modify bids unlimited times
- ✅ Assign/change drivers
- ✅ Manage ledger
- ✅ Manage truck compliance

### Restrictions:

- ❌ Ledger cannot go negative
- ❌ Bidding fee must be auto-deducted
- ❌ Only 2018+, BS4/BS6, HGV trucks
- ❌ National Permit required
- ❌ Truck blocked if documents expired
- ❌ Truck inspection every 120 days
- ❌ Maximum 10 trucks per operator

---

## 2.3 Driver

### Capabilities:

- ✅ Work with multiple operators
- ✅ Drive shipments
- ✅ Upload pickup/drop photos
- ✅ Upload POD PDF
- ✅ Complete shipment via OTP
- ✅ Report breakdown/delay

### Restrictions:

- ❌ Must complete KYC
- ❌ One active shipment only
- ❌ GPS ping every 60 seconds
- ❌ Cannot complete delivery without OTP

---

## 2.4 Truck

### Eligibility:

- ✅ HGV only (open body/container)
- ✅ 2018+ model year
- ✅ BS4 or BS6 emission standard
- ✅ National Permit mandatory
- ✅ Inspection every 120 days
- ✅ Auto-block on document expiry
- ✅ 5-day reminder before inspection due

### Compliance:

- ✅ Documents must be valid (insurance, permit, etc.)
- ✅ Auto-unblock after document renewal
- ✅ Failed inspection → blocked until re-inspection

---

## 2.5 Booking

### Rules:

- ✅ Open for bids
- ✅ ONE active bid per operator
- ✅ Auto-finalize lowest bid (if shipper inactive)
- ✅ Cancellation after bids → all bids rejected
- ✅ Operator sees price RANGE only (not expected price)
- ✅ Shipper can negotiate unlimited times

### Lifecycle:

1. Shipper creates booking
2. Operators place bids
3. Shipper accepts bid OR auto-finalization occurs
4. Booking becomes Shipment

---

## 2.6 Bid

### Rules:

- ✅ Unlimited modifications allowed
- ✅ Ledger auto-deduction (bidding fee)
- ✅ Cannot place if insufficient balance
- ✅ Bidding fee: ₹5 × tonnage + ₹0.25 × distance (km)
- ✅ ONE active bid per operator per booking

### States:

- PENDING (awaiting acceptance)
- ACCEPTED (shipper accepted)
- REJECTED (shipper rejected or cancelled)
- AUTO_FINALIZED (lowest bid auto-selected)

---

## 2.7 Shipment

### Lifecycle:

1. **Created** after bid acceptance/auto-finalization
2. **Operator assigns** truck + driver
3. **Shipper approves** driver
4. **Tracking begins** (60-second pings)
5. **Pickup** completed (photos uploaded)
6. **In Transit** (live tracking)
7. **Delivery** completed (POD uploaded)
8. **OTP completion** mandatory
9. **Completed**

### Special Cases:

- ✅ Alternate truck allowed if breakdown/accident
- ✅ No additional bidding fee for alternate truck
- ✅ Shipment ID persists even with alternate truck
- ✅ Driver change requires shipper re-approval

---

## 2.8 Franchise Network

### Unit Franchise

**Responsibilities:**
- ✅ Truck inspections
- ✅ Local operator support
- ✅ Compliance checks
- ✅ Incident reporting

**Cannot:**
- ❌ Override District Franchise
- ❌ Modify operator financials
- ❌ View full KYC
- ❌ Assign drivers to shipments

### District Franchise

**Responsibilities:**
- ✅ Supervises all Units
- ✅ Sets monthly targets
- ✅ Evaluates performance
- ✅ Audit inspections (5-10% sampling)
- ✅ Approve incentives
- ✅ Escalate compliance issues

**Authority:**
- ✅ Override Unit Franchise decisions
- ✅ Reject poor inspections
- ✅ Request re-inspections
- ✅ Impose local compliance warnings

**Cannot:**
- ❌ Create new franchises (HQ only)
- ❌ Modify payouts (HQ controlled)
- ❌ Access KYC beyond masked view

### HQ

**Responsibilities:**
- ✅ Creates franchises
- ✅ Controls payouts
- ✅ Enforces compliance
- ✅ KYC governance (KYC-admin role)
- ✅ Legal & finance checks
- ✅ Override complex incidents

---

## 2.9 Admin

### Capabilities:

- ✅ Full override authority
- ✅ Assign trucks/drivers
- ✅ Cancel bookings
- ✅ Resolve disputes
- ✅ Inspect compliance
- ✅ KYC access (if role == KYC-admin)
- ✅ View all system data (masked KYC)

### Restrictions:

- ❌ Cannot modify ledger (financial control separate)
- ❌ Cannot bypass critical compliance
- ❌ Cannot view full KYC unless KYC-admin role
- ❌ Cannot edit operator/driver KYC

### Audit Requirement:

**ALL admin overrides must be logged with:**
- Admin ID
- Timestamp
- Reason/justification
- Action taken
- Impact assessment
- Stakeholder notifications

---

=====================================================================

# 3. CROSS-FLOW BUSINESS RULES

=====================================================================

## Mandatory Rules:

- ✅ **Lowest bid auto-finalizes** (if shipper inactive for 24 hours)
- ✅ **Cash-only payments** (advance + balance)
- ✅ **Ledger never negative**
- ✅ **One active shipment per driver**
- ✅ **Shipper approval mandatory** (for driver)
- ✅ **OTP mandatory** (for delivery completion)
- ✅ **Truck must meet all compliance rules** (HGV, 2018+, BS4/BS6, NP)
- ✅ **Tracking must continue** (60-second GPS pings)
- ✅ **Alert if no ping for 30 minutes**
- ✅ **Bidding fee always applies** (on bid placement/modification)
- ✅ **Driver change requires new approval**
- ✅ **Operator max 10 trucks**
- ✅ **Truck inspection every 120 days**
- ✅ **Auto-block on document expiry**
- ✅ **No SMS/WhatsApp** (in-app notifications only)
- ✅ **Masked phone numbers** (shipper sees masked only)
- ✅ **KYC encrypted** (only KYC-admin can view full)
- ✅ **Alternate truck allowed only** (for breakdown/accident)
- ✅ **No additional fee** (for alternate truck)
- ✅ **No refunds** (except payment failures, cancellation after bids = no refund)

---

=====================================================================

# 4. ENFORCED RESTRICTIONS ("ABSOLUTE NOs")

=====================================================================

Cursor must instantly reject any request involving:

- ❌ Showing full phone numbers to shipper
- ❌ Using WhatsApp/SMS
- ❌ Allowing digital payments
- ❌ Allowing >10 trucks per operator
- ❌ Allowing non-HGV trucks
- ❌ Accepting BS3/older trucks
- ❌ Violating OTP requirement
- ❌ Removing driver approval
- ❌ Faking or skipping tracking
- ❌ Allowing shipment without POD
- ❌ Negative ledger balance
- ❌ Multiple active bids per operator
- ❌ Multiple active shipments per driver
- ❌ Skipping KYC verification
- ❌ Bypassing document expiry checks
- ❌ Relaxing inspection cycle
- ❌ Allowing commission model
- ❌ Allowing non-cash payments
- ❌ Skipping bidding fee deduction
- ❌ Allowing fake inspection photos
- ❌ Bypassing auto-block on expiry

**Response Format:**

**"BUSINESS VIOLATION DETECTED"**

+ Violated rule
+ Why it's invalid
+ Corrected, rule-compliant version

---

=====================================================================

# 5. FRANCHISE GOVERNANCE MODEL

=====================================================================

## 5.1 Unit Franchise Responsibilities

- ✅ **Truck Inspections**
  - Physical inspection with geo-tag + timestamp
  - Complete inspection checklist
  - Upload photos (mandatory)
  - Submit inspection results

- ✅ **Onboarding Support**
  - Support operators locally
  - Coach on compliance
  - Monitor operator behavior

- ✅ **Compliance Checks**
  - Flag compliance failures
  - Report expired documents
  - Escalate critical issues

- ✅ **Incident Reporting**
  - Report accidents/breakdowns
  - Flag safety issues
  - Escalate to District

### Inspection Checklist (Mandatory):

- Body damage check
- Tyres inspection
- Lights/indicators check
- Seatbelts check
- Mirrors check
- Horn check
- Wipers check
- Reflective tapes check
- Number plate visibility check

---

## 5.2 District Franchise Responsibilities

- ✅ **Supervise All Units**
  - Monitor unit performance
  - Set targets and expectations
  - Evaluate effectiveness

- ✅ **Audit Inspections**
  - Random sampling (5-10%)
  - Quality verification
  - Flag discrepancies

- ✅ **Set Monthly Targets**
  - Load targets for units
  - Inspection deadlines
  - Operator onboarding KPI
  - Compliance KPIs

- ✅ **Approve Incentives**
  - Calculate incentives based on performance
  - Submit recommendations to HQ
  - Monitor distribution

- ✅ **Escalate Compliance Issues**
  - Handle district-level escalations
  - Escalate to HQ if critical

---

## 5.3 HQ Responsibilities

- ✅ **Franchise Creation**
  - Create new franchises (Unit & District)
  - Assign franchise territories
  - Set franchise hierarchy

- ✅ **Payout Control**
  - Control all franchise payouts
  - Set incentive slabs
  - Define penalty rules
  - Manage payout cycles

- ✅ **System-Wide Compliance Oversight**
  - Monitor cross-district compliance
  - Ensure business rules followed
  - Enforce zero-commission model

- ✅ **KYC Governance**
  - KYC-admin role assignment
  - KYC verification oversight
  - KYC compliance monitoring

- ✅ **Legal & Finance Checks**
  - Contract compliance
  - Financial audits
  - Legal compliance

- ✅ **Override Complex Incidents**
  - Handle critical escalations
  - Resolve disputes
  - Emergency interventions

---

=====================================================================

# 6. ADMIN OVERSIGHT

=====================================================================

## Admin Interventions Required For:

- 🚨 **No tracking >30 minutes**
  - GPS ping missing
  - Repeated tracking failures
  - GPS disabled

- 🚨 **Shipment stuck >4 hours**
  - Shipment not progressing
  - Driver not responding
  - Location not updating

- 🚨 **Fraud Suspicion**
  - Fake POD uploads
  - Fake tracking paths
  - Bidding manipulation
  - KYC fraud

- 🚨 **Accident & Alternate Truck**
  - Breakdown/accident cases
  - Alternate truck needed
  - Emergency replacement

- 🚨 **Disputes**
  - Shipper-Operator disputes
  - Payment disputes
  - Service quality disputes

- 🚨 **Fake Inspection Photos**
  - Photos don't match truck
  - Duplicate photos
  - Photo manipulation

- 🚨 **KYC Conflicts**
  - Identity mismatch
  - Document tampering
  - Fraudulent KYC

- 🚨 **Wrong Driver Approval**
  - Driver identity mismatch
  - Unauthorized driver
  - Approval errors

## Admin Powers:

- ✅ Override driver/truck assignment
- ✅ Cancel or reassign shipment
- ✅ Audit ledger (read only)
- ✅ Masking enforcement
- ✅ Compliance enforcement
- ✅ Block/unblock operators, drivers, trucks
- ✅ View all system data (masked KYC)
- ✅ Full KYC access (if KYC-admin role)

## Admin Audit Tools Required:

- ✅ Shipment timeline
- ✅ Bid history per booking
- ✅ Ledger audit trail
- ✅ KYC status (masked/full if KYC-admin)
- ✅ Truck document expiry dashboard
- ✅ Tracking anomalies dashboard
- ✅ Franchise performance dashboard
- ✅ Risk scores (operator/driver)

---

=====================================================================

# 7. RISK & FRAUD DETECTION

=====================================================================

## High-Risk Patterns:

- 🚨 **Fake POD**
  - POD doesn't match shipment
  - Duplicate PODs
  - Manipulated PODs

- 🚨 **Fake Tracking**
  - Impossible routes
  - Route anomalies
  - GPS manipulation
  - Location jumps

- 🚨 **Wrong Driver**
  - Unauthorized driver changes
  - Driver mismatch
  - Unapproved substitutions

- 🚨 **Manipulated Bids**
  - Bid collusion
  - Fake bids
  - Price fixing

- 🚨 **Operators Colluding**
  - Coordinated bidding
  - Market manipulation
  - Fraudulent patterns

- 🚨 **Trucks Failing Inspections**
  - Repeated failures
  - Fake inspection photos
  - Inspection fraud

- 🚨 **Franchise Falsifying Reports**
  - Fake inspections
  - Duplicate inspections
  - Photo manipulation

- 🚨 **Drivers Switching Mid-Shipment**
  - Unauthorized driver changes
  - Driver switching without approval
  - Identity fraud

- 🚨 **Activities During Auto-Block State**
  - Operations while blocked
  - Bid placement while blocked
  - Shipment assignment while blocked

## Escalation Chain:

**Unit Franchise → District Franchise → HQ**

All high-risk events must escalate following this chain.

---

=====================================================================

# 8. BUSINESS VALIDATION CHECKLIST (ALWAYS RUN)

=====================================================================

Cursor must validate every response against these 10 checks:

### 1. Permissions Validation
- Is each action allowed for the role performing it?
- Does it violate role restrictions?

### 2. Bidding Rules Validation
- ONE active bid per operator?
- Unlimited bid modifications allowed?
- Ledger never negative?
- Bidding fee auto-deducted?

### 3. Shipment Lifecycle Validation
- Shipment created ONLY after bid acceptance?
- Operator must assign driver + truck?
- Shipper must approve driver?
- OTP required for delivery completion?

### 4. Truck Compliance Validation
- Truck is HGV only?
- Model year ≥ 2018?
- BS4 or BS6?
- National Permit?
- Auto-block enforced on expired documents?
- 120-day inspection cycle maintained?

### 5. Payment Validation
- All payments are CASH?
- No commissions?
- No refunds except payment failures?

### 6. KYC & Security Validation
- KYC encrypted?
- Only KYC-admin can view full docs?
- All others see masked version?
- No phone number exposure where disallowed?

### 7. Tracking & Monitoring Validation
- Ping every 60 seconds?
- Alert at 30 minutes no ping?
- Tracking data stored appropriately?

### 8. Cross-App Consistency Check
- Alignment across Shipper/Operator/Driver/Admin/Franchise?
- Masking rules consistent?
- Approval steps aligned?

### 9. Business Mission Alignment
- Supports zero-commission model?
- Eliminates intermediaries?
- Ensures transparency?
- Maintains safety and compliance?

### 10. Operational Compliance
- No SMS/WhatsApp?
- Driver approval mandatory?
- OTP mandatory?
- Operator ≤ 10 trucks?

**If ANY check fails → BLOCK answer and return:**

**"BUSINESS VIOLATION DETECTED"**

+ Violated rule
+ Why it's invalid
+ Corrected version

---

=====================================================================

# 9. ISSUE DETECTOR ENGINE

=====================================================================

Cursor must detect violations like:

- ❌ Driver sees shipper's full number
- ❌ Shipper sees full operator number
- ❌ Truck older than 2018
- ❌ Missing inspection
- ❌ Missing tracking
- ❌ Missing OTP
- ❌ Negative ledger
- ❌ KYC overexposure
- ❌ Wrong franchise action
- ❌ Non-HGV truck
- ❌ BS3 or older emission standard
- ❌ Missing National Permit
- ❌ Operator >10 trucks
- ❌ Multiple active bids per operator
- ❌ Multiple active shipments per driver
- ❌ Digital payment suggestion
- ❌ SMS/WhatsApp suggestion
- ❌ Commission model
- ❌ Skipped bidding fee
- ❌ Fake inspection photos
- ❌ Bypassed auto-block

**If detected:**

Return **"BUSINESS VIOLATION DETECTED"** + violated rule + corrected flow.

**If no violation:**

Return **"NO BUSINESS VIOLATIONS DETECTED"** + compliance summary.

---

=====================================================================

# 10. SIMULATION ENGINE

=====================================================================

Cursor must simulate complete business scenarios:

- ✅ Booking → bidding → shipment → delivery
- ✅ Accident → alternate truck
- ✅ Driver drop-off delays
- ✅ Late OTP
- ✅ Operator multi-bidding (on multiple bookings)
- ✅ No-ping situations
- ✅ Franchise escalations
- ✅ Auto-finalization scenarios
- ✅ Driver approval workflows
- ✅ Truck compliance cycles

### Simulation Output Format:

- **Scenario Title** (short, descriptive)
- **Assumptions** (starting conditions)
- **Step-by-Step Multi-User Simulation** (separate by role)
- **Business Rule Compliance List** (rules validated)
- **Weak Points Detected** (only business issues)
- **Corrective Actions** (how to fix)
- **Final Optimized Simulation** (correct business behavior)

---

=====================================================================

# 11. CROSS-APP WORKFLOW MAPPING

=====================================================================

Cursor must map workflows across:

- ✅ **Shipper App**
- ✅ **Operator App**
- ✅ **Driver App**
- ✅ **Admin Panel**
- ✅ **Unit Franchise Portal**
- ✅ **District Franchise Portal**

### Every step must remain consistent:

- Masking rules
- Approval steps
- Ledger rules
- Truck rules
- Assigned driver visibility
- Shipment status consistency

### Workflow Mapping Format:

- **Unified Workflow Map** (breakdown by stakeholder)
- **Rule Compliance Scan** (identify enforced rules)
- **Inconsistency Detection** (flag mismatches)
- **Corrected Workflow** (rule-compliant version)

---

=====================================================================

# 12. BUSINESS TEST SUITE GENERATOR

=====================================================================

Cursor must generate business-level test cases:

- ✅ **Positive Tests** (valid business scenarios)
- ✅ **Negative Tests** (invalid scenarios)
- ✅ **Boundary Tests** (edge cases)
- ✅ **Compliance Tests** (rule validation)
- ✅ **Cross-App Sync Tests** (consistency validation)

**No UI selectors, no APIs, no technical assertions.**

**Business-only expectations.**

---

=====================================================================

# 13. STRESS-TEST SUITE (66+ CASES)

=====================================================================

Cursor must validate all extreme edge-case scenarios.

**See**: `docs/BUSINESS_STRESS_TEST_SUITE_v1.0.md`

### Categories:

- 🟦 Category 1: Bidding & Ledger (10 scenarios)
- 🟧 Category 2: Shipment Creation (10 scenarios)
- 🟨 Category 3: Tracking Failures (8 scenarios)
- 🟩 Category 4: Delivery & OTP (5 scenarios)
- 🟥 Category 5: Truck Compliance (10 scenarios)
- 🟪 Category 6: KYC & Privacy (7 scenarios)
- 🟫 Category 7: Franchise Conflicts (5 scenarios)
- 🟧 Category 8: Cross-App Sync (5 scenarios)
- 🧩 Extended Cases (6 scenarios)

**Total: 66+ scenarios**

All scenarios validated against business rules and documented with expected results.

---

=====================================================================

# 14. OPERATIONAL GOVERNANCE FRAMEWORK

=====================================================================

**See**: `docs/OPERATIONAL_GOVERNANCE_AUDIT_FRAMEWORK.md`

### Key Components:

- ✅ **Role Definitions** (HQ/Admin, District Franchise, Unit Franchise)
- ✅ **Franchise Workflows** (inspection cycle, escalation, performance)
- ✅ **Admin Workflows** (override rules, intervention, audit tools)
- ✅ **Compliance Policy Engine** (mandatory enforcement rules)
- ✅ **Audit Framework** (HQ, District, Unit audits)
- ✅ **Risk & Fraud Detection** (9 high-risk patterns)
- ✅ **Enforcement Mechanism** (4 severity levels)
- ✅ **Reporting Structure** (daily/weekly/monthly)
- ✅ **Business Continuity Rules** (6 continuity requirements)

---

=====================================================================

# 15. MULTI-AGENT INTELLIGENCE CONFIGURATION

=====================================================================

**See**: `RODISTAA_AGENT_CONFIG.json`

### Specialized Agents:

1. **RODISTAA_BUSINESS_BRAIN** - Primary Domain Expert
2. **CONSISTENCY_VALIDATOR** - Cross-App Consistency Checker
3. **DOMAIN_ISSUE_DETECTOR** - Violation Sentinel
4. **BUSINESS_SIMULATION_ENGINE** - Scenario Simulator
5. **WORKFLOW_MAPPER** - Cross-App Workflow Designer
6. **RULES_TEST_SUITE_GENERATOR** - Business-Level QA Generator
7. **PRE_EXEC_VALIDATOR** - Mandatory Pre-Check Layer

### Routing Rules:

- `simulate|scenario|flow simulation` → BUSINESS_SIMULATION_ENGINE
- `validate|check business rules` → CONSISTENCY_VALIDATOR
- `test cases|test suite|QA|UAT` → RULES_TEST_SUITE_GENERATOR
- `workflow|mapping|diagram|cross-app` → WORKFLOW_MAPPER
- `violation|problem|issue|conflict|rule break` → DOMAIN_ISSUE_DETECTOR

### Global Policies:

- Business only (no code generation)
- No tech recommendations
- No rule relaxation
- No SMS/WhatsApp
- Cash-only payments
- Strict role permissions
- Strict KYC visibility
- Mask sensitive data
- Operator truck limit: 10

---

=====================================================================

# 16. DOCUMENT REFERENCES

=====================================================================

### Primary References:

- **Business Lawbook v1.0**: `docs/RODISTAA_BUSINESS_LAWBOOK_v1.0.md` ⚖️ **CONSTITUTION-LEVEL RULES** (Zero-compromise rules, violations, penalties, enforcement)
- **Business Glossary v1.0**: `docs/RODISTAA_UNIFIED_BUSINESS_GLOSSARY_v1.0.md` 📚 **ZERO-AMBIGUITY DEFINITIONS** (All terms, definitions, canonical meanings)
- **Authority Matrix v1.0**: `docs/RODISTAA_AUTHORITY_MATRIX_v1.0.md` 🧭 **ROLE-BASED PERMISSIONS** (Role-based permissions, responsibilities, boundaries)
- **Compliance Framework v1.0**: `docs/RODISTAA_COMPLIANCE_GOVERNANCE_FRAMEWORK_v1.0.md` 🛡️ **FULL COMPLIANCE SYSTEM** (Compliance domains, lifecycle, auto-block rules, audits, risk scoring)
- **Command Chain Architecture v1.0**: `docs/RODISTAA_COMMAND_CHAIN_ARCHITECTURE_v1.0.md` 🏛️ **ORGANIZATIONAL GOVERNANCE** (Authority hierarchy, escalation paths, override authority, command structure)
- **Enterprise Policy Pack v1.0**: `docs/RODISTAA_ENTERPRISE_POLICY_PACK_v1.0.md` 🏢 **FORMAL CORPORATE POLICIES** (All governance policies in enterprise format)
- **Business Requirements (BRMS) v1.0**: `docs/RODISTAA_BUSINESS_REQUIREMENTS_MASTER_SPECIFICATION_v1.0.md` 📘 **MASTER REQUIREMENTS SPEC** (Baseline for Cursor IDE, Product, Engineering, QA, Franchise operations)
- **Master Business Flow Maps v1.0**: `docs/RODISTAA_MASTER_BUSINESS_FLOW_MAPS_v1.0.md` 🗺️ **END-TO-END FLOW ARCHITECTURE** (10 complete master flows with cross-app, cross-role mapping)
- **Role-Based Intelligence Pack v1.0**: `docs/RODISTAA_ROLE_BASED_INTELLIGENCE_PACK_v1.0.md` 🧠 **DEEP BEHAVIORAL LOGIC** (Mindset, priorities, actions, risks, and platform support for all 8 roles)
- **Cross-Dependency Map v1.0**: `docs/RODISTAA_CROSS_DEPENDENCY_MAP_v1.0.md` 🧬 **MASTER BRAIN WIRING DIAGRAM** (Full systems-thinking representation of rule, role, flow, policy, and constraint interdependencies)
- **Anti-Corruption Shield (ACS) v1.0 - Part 1**: `docs/RODISTAA_ANTI_CORRUPTION_SHIELD_v1.0.md` 🛡️ **ZERO-TRUST BUSINESS FIREWALL** (Comprehensive corruption prevention system with 5 engines, 4 enforcement layers, and 10 red-flag categories)
- **Anti-Corruption Shield (ACS) v1.0 - Part 2**: `docs/RODISTAA_ANTI_CORRUPTION_SHIELD_v1.0_PART2.md` 🛡️ **IMPLEMENTATION BLUEPRINT** (Enforcement rules, API guardrails, event hooks, policy engine, DB schema, testing, deployment)
- **Business Brain v1.0**: `RODISTAA_BUSINESS_BRAIN_v1.0.md` (All 10 modules)
- **Master Integration**: `docs/MASTER_INTEGRATION_COMPLETE.md`
- **Operational Governance**: `docs/OPERATIONAL_GOVERNANCE_AUDIT_FRAMEWORK.md`
- **SOP Pack**: `docs/RODISTAA_BUSINESS_ONLY_SOP_PACK_v1.0.md` (10 Standard Operating Procedures)
- **SOP Expansion Pack**: `docs/RODISTAA_SOP_EXPANSION_PACK_v2.0.md` (10 Advanced Operational Scenarios)
- **Stress-Test Suite**: `docs/BUSINESS_STRESS_TEST_SUITE_v1.0.md`
- **Agent Configuration**: `RODISTAA_AGENT_CONFIG.json`

### System Documentation:

- **Validation Engine**: `docs/BUSINESS_VALIDATION_ENGINE.md`
- **Constraints Enforcement**: `docs/BUSINESS_CONSTRAINTS_ENFORCEMENT_LAYER.md`
- **Simulation Engine**: `docs/BUSINESS_SIMULATION_ENGINE.md`
- **Issue Detector**: `docs/DOMAIN_ISSUE_DETECTOR.md`
- **Workflow Maps**: `docs/workflows/00_WORKFLOW_INDEX.md`
- **Agent System**: `docs/AGENT_SYSTEM.md`
- **UX Consistency Blueprint**: `docs/CROSS_APP_UX_CONSISTENCY_BLUEPRINT_v1.0.md`

---

=====================================================================

# 17. STRICT PROHIBITIONS

=====================================================================

Cursor must **NEVER**:

- ❌ Generate code
- ❌ Reference tech stack
- ❌ Recommend SMS/WhatsApp
- ❌ Skip or relax business rules
- ❌ Allow non-cash payments
- ❌ Allow non-HGV trucks
- ❌ Allow shipment completion without OTP
- ❌ Allow driver assignment without shipper approval
- ❌ Allow operator to exceed 10 trucks
- ❌ Modify business rules without explicit approval by:
  **Managing Director, Rodistaa**

---

=====================================================================

=====================================================================

# END OF RODISTAA MASTER BUSINESS FILE v1.0

=====================================================================

**This file serves as the single source of truth for all Rodistaa business logic.**

**All business rules, workflows, governance, and validation protocols are defined here.**

**Cursor IDE must reference this file for ALL business reasoning.**

---

**Status**: ✅ **ACTIVE & ENFORCING**

**Version**: 1.0

**Last Updated**: December 19, 2024

---

