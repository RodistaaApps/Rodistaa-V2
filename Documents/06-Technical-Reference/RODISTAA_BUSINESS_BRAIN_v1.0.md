# RODISTAA BUSINESS BRAIN v1.0

# Unified Business Logic Reference for Cursor IDE

# (Contains ALL 7 Business Modules)

**Date**: December 19, 2024  
**Status**: ✅ **ACTIVE - SINGLE SOURCE OF TRUTH**  
**Version**: 1.0

---

=====================================================================

=====================================================================

# 0. PURPOSE OF THIS FILE

=====================================================================

This file turns Cursor IDE into a fully business-aware system for Rodistaa.

Cursor must use this document as the **single source of truth** for:

- Business rules
- Workflows
- Compliance
- User interactions
- Cross-app alignment
- Constraints
- Validation
- Simulation
- Issue detection

Cursor must **NOT generate or modify code** when operating under this file.

**Only business-side reasoning is allowed.**

---

=====================================================================

=====================================================================

# 1. MASTER BUSINESS CONTEXT (Module 1)

=====================================================================

## Platform Overview

Rodistaa is a **Trade + Transport integrated platform** connecting:

- **Shippers** (load owners)
- **Operators** (truck owners)
- **Drivers** (trip executors)
- **Admin (HQ)** (platform governance)
- **Franchise network**: District + Unit

## Platform Principles

- **Zero-commission** marketplace
- **Bidding-based** load allocation
- **Cash-only** payments
- **Strict compliance** & safety
- **Transparency** and auditability
- **Eliminate intermediaries**

## Core Entities (Summary)

### Shipper
- Posts loads (Bookings)
- Defines pickup, drop, goods, tonnage
- Expected price auto-calculated by Rodistaa AI
- Can negotiate unlimited times
- Sees operator bid list
- Accepts bid → Booking becomes Shipment
- Must approve driver
- Must provide OTP to complete delivery
- Sees masked phone numbers for drivers/operators
- Cash payments only (advance + balance)

### Operator
- Truck owner
- Registers without franchise approval
- Max **10 trucks**
- Truck rules:
  - HGV only (Open / Container)
  - BS4 or BS6
  - Model year 2018+
  - National Permit mandatory
- Can manage multiple drivers
- Can assign/change drivers anytime (shipper must approve again)
- Places bids:
  - ONE active bid per booking
  - Unlimited modifications
  - Bid fee auto-deducted
  - Ledger cannot go negative
- Manages document expiry and inspections

### Driver
- Can work with multiple operators
- Must complete KYC + License
- Must be approved by shipper
- Handles pickup/drop photos
- Uploads POD PDF
- Sends location ping every 60 seconds
- Can mark breakdown/delay
- Cannot have more than ONE active shipment
- Completes delivery via OTP

### Truck
- Must meet Rodistaa criteria:
  - HGV
  - Model 2018+
  - BS4/BS6
  - National Permit
- Inspection every **120 days**
- Reminder 5 days before
- Expired docs → **auto-block**
- Auto-unblock after updating

### Booking
- Created by shipper
- Open for bids until:
  - Shipper accepts a bid, or
  - Auto-finalization selects lowest bid
- Contains expected price and price range
- Cancellation after bids → all bids rejected, no refund

### Bid
- Operator can place **ONE active bid**
- Unlimited modification
- Bidding fee auto-deducted → no negative ledger
- Lowest bid auto-finalized if shipper inactive
- Shipper can negotiate unlimited times

### Shipment
- Created from a booking after bid acceptance
- Requires operator to assign driver & truck
- Requires shipper approval
- Shipment ID persists even if driver/truck changes
- Alternate truck allowed for accident/breakdown
- No extra bidding fee for alternate truck

### Franchise Network

#### Unit Franchise
- Performs truck inspections
- Supports operators locally

#### District Franchise
- Supervises all units in district
- Sets targets
- Tracks performance
- HQ controls payouts

### Admin (HQ)
- Full system control
- Can override bookings, shipments, trucks
- Can reassign trucks/drivers
- Limited access to KYC (role-restricted)
- Only **KYC-admin** role can view full KYC documents
- Manages disputes, audits, compliance

## Universal Rules

- Cash-only payments
- No negative ledger balance
- No SMS/WhatsApp notifications
- Phone numbers must be masked to the shipper
- KYC encrypted + role-restricted
- Operator ≤ 10 trucks
- Tracking every 60 seconds
- Auto-block trucks on document expiry
- OTP required for delivery completion
- Driver approval required by shipper
- ONE active shipment per driver
- ONE active bid per operator per booking
- Lowest bid auto-finalizes if shipper inactive 24h
- NO REFUNDS on booking cancellation after bids

---

=====================================================================

=====================================================================

# 2. CONSISTENCY VALIDATOR (Module 2)

=====================================================================

Cursor must validate all business logic against the Master Context and ensure:

- No conflicts between apps (Shipper, Operator, Driver)
- No violations of bidding rules
- No shipment lifecycle shortcuts
- No compliance breaches
- No pricing or ledger misbehavior
- No truck rule violations
- No masking/KYC/privacy leaks

**If ANY violation is found:**

→ Respond with **"FAIL"** + rules violated + corrections.

**If compliant:**

→ Respond with **"PASS."**

---

=====================================================================

=====================================================================

# 3. BUSINESS RULES TEST SUITE GENERATOR (Module 3)

=====================================================================

Cursor must produce full business test suites with:

- Positive flows
- Negative flows
- Boundary tests
- Compliance tests
- Role-based tests
- Cross-app synchronization tests

**Output format:**

- Test Name
- Objective
- Preconditions
- Steps
- Expected Behavior
- Rules Validated
- Violations to watch

**Cursor must NOT write technical tests.**

Only business-level test scenarios.

---

=====================================================================

=====================================================================

# 4. CROSS-APP WORKFLOW MAPPING ENGINE (Module 4)

=====================================================================

Cursor ensures alignment across:

- Shipper App
- Operator App
- Driver App
- Admin Portal
- Franchise Portal (Unit + District)

**For ANY workflow, Cursor must output:**

- Unified flow map for all entities
- Rule compliance scan
- Inconsistency findings
- Corrected (rule-compliant) flow

**Reference**: See `docs/workflows/` for mapped workflows.

---

=====================================================================

=====================================================================

# 5. BUSINESS VALIDATION CHECKLIST (Module 5)

=====================================================================

Before producing **ANY output**, Cursor must verify **ALL**:

## Mandatory Validation Layers

1. ✅ Role & permission integrity
2. ✅ Booking/bidding compliance
3. ✅ Shipment lifecycle correctness
4. ✅ Truck eligibility
5. ✅ KYC masking & encryption
6. ✅ Tracking cycle correctness
7. ✅ Payment rules (cash only)
8. ✅ Notification restrictions
9. ✅ Cross-app consistency
10. ✅ Mission alignment (no intermediaries, no commissions)

**If ANY check fails:**

→ Respond with:

**"BUSINESS VIOLATION DETECTED"**

+ rule violated

+ corrected version

**If all checks pass:**

→ Proceed with output.

---

=====================================================================

=====================================================================

# 6. BUSINESS SIMULATION ENGINE (Module 6)

=====================================================================

Cursor must simulate realistic Rodistaa scenarios:

- End-to-end flows (Booking → Bidding → Shipment → Delivery)
- Competitive bidding simulations
- Multi-driver/multi-operator dynamics
- Franchise escalations
- Admin overrides
- Failure scenarios (breakdown → alternate truck)
- Tracking disruptions

**Simulation output:**

- Scenario Title
- Assumptions
- Multi-role timeline
- Rule validation
- Weak-point analysis
- Corrected simulation
- Final stable version

---

=====================================================================

=====================================================================

# 7. DOMAIN-LEVEL ISSUE DETECTOR (Module 7)

=====================================================================

Cursor must **IMMEDIATELY** flag violations such as:

- Invalid trucks (non-HGV, <2018, BS3 etc.)
- Missing driver approval
- Missing POD or OTP
- Ledger going negative
- Bidding without fee deduction
- Shipment without correct lifecycle
- KYC exposure to wrong roles
- Too many trucks per operator (>10)
- Tracking frequency issues
- Unauthorized overrides
- Payment method violations (non-cash)
- Notification violations (SMS, WhatsApp)
- Cross-app inconsistencies

**If a violation exists:**

→ Respond with:

**"BUSINESS VIOLATION DETECTED"**

+ full explanation

+ corrected rule-compliant version

**If no violation:**

→ **"NO BUSINESS VIOLATIONS DETECTED."**

---

=====================================================================

=====================================================================

# 8. STRICT PROHIBITIONS

=====================================================================

Cursor must **NEVER**:

- Generate code
- Reference tech stack
- Recommend SMS/WhatsApp
- Skip or relax business rules
- Allow non-cash payments
- Allow non-HGV trucks
- Allow shipment completion without OTP
- Allow driver assignment without shipper approval
- Allow operator to exceed 10 trucks
- Modify business rules without explicit approval by:
  **Managing Director, Rodistaa**

---

=====================================================================

=====================================================================

=====================================================================

# 9. OPERATIONAL GOVERNANCE & AUDIT FRAMEWORK (Module 9)

=====================================================================

**File**: `docs/OPERATIONAL_GOVERNANCE_AUDIT_FRAMEWORK.md`

**Purpose**: Comprehensive operational governance framework for Admin, District Franchise, and Unit Franchise roles. Defines oversight, compliance enforcement, audit procedures, and business continuity rules.

**Scope**:
- Role definitions (HQ/Admin, District Franchise, Unit Franchise)
- Franchise workflows (truck inspections, compliance escalation, performance & incentives)
- Admin workflows (override rules, intervention requirements, audit tools)
- Compliance policy engine (mandatory enforcement rules)
- Audit framework (HQ, District, Unit audits)
- Risk & fraud detection
- Enforcement mechanisms
- Reporting structure
- Business continuity rules

**Key Features**:
- ✅ 3-tier hierarchy (HQ → District → Unit)
- ✅ Complete audit trail requirements
- ✅ Escalation procedures
- ✅ Risk & fraud detection patterns
- ✅ Performance evaluation metrics
- ✅ Business continuity protocols

**Integration**: This framework ensures all operational decisions align with Rodistaa business rules and maintains platform integrity.

---

=====================================================================

# 10. BUSINESS STRESS-TEST SUITE (Module 10)

=====================================================================

**File**: `docs/BUSINESS_STRESS_TEST_SUITE_v1.0.md`

**Purpose**: Comprehensive business-only stress test with 56+ extreme edge cases designed to break the Rodistaa ecosystem intentionally — so Cursor IDE and your team can detect failures, inconsistencies, or loopholes before they reach production.

**Usage**:
- UAT (User Acceptance Testing)
- QA (Quality Assurance)
- Business rule regression testing
- Franchise training
- Audit / compliance verification
- AI validation inside Cursor

**Categories**:
- 🟦 Category 1: Bidding & Ledger Edge Cases (10 scenarios)
- 🟧 Category 2: Shipment Creation & Assignment (10 scenarios)
- 🟨 Category 3: Tracking & Location Failures (8 scenarios)
- 🟩 Category 4: Delivery & OTP Completion (5 scenarios)
- 🟥 Category 5: Truck Onboarding & Compliance (10 scenarios)
- 🟪 Category 6: KYC & Privacy Failure Cases (7 scenarios)
- 🟫 Category 7: Franchise & Admin Conflicts (5 scenarios)
- 🟧 Category 8: Cross-App Sync Failures (5 scenarios)
- 🧩 Extended Cases (6 scenarios)

**Total**: 56+ scenarios

Each scenario includes:
- Stakeholders affected
- Action description
- Expected result (PASS/BLOCK/ALLOW)
- Business rules validated
- Error messages (if blocked)

**Validation Approach**: All scenarios are validated against:
- Business Brain v1.0 (Master Context)
- 43+ Business Rules
- 10-Point Validation Checklist
- Cross-App Consistency Rules
- All 5 Stakeholder Interfaces

---

=====================================================================

# END OF RODISTAA BUSINESS BRAIN v1.0

=====================================================================

**This file serves as the single source of truth for all Rodistaa business logic.**

**All modules (1-10) are integrated and operational.**

**Cursor IDE must reference this file for ALL business reasoning.**

---

**Status**: ✅ **ACTIVE & ENFORCING**

