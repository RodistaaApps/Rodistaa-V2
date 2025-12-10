# CTO Project Understanding - Rodistaa Platform
## Comprehensive Requirements Analysis

**Date**: 2024-12-19  
**Status**: ✅ **COMPLETE UNDERSTANDING ACHIEVED**  
**Authority**: AI CTO, Rodistaa

---

## 📋 EXECUTIVE SUMMARY

Rodistaa is a **zero-commission, cash-only, AI-augmented freight logistics marketplace** connecting Shippers, Operators, Drivers, and Franchises with strict compliance enforcement through an Anti-Corruption Shield (ACS).

### Core Business Model
- **Zero-commission marketplace** - Revenue only from bidding fees
- **Cash-only payments** - No digital payments (UPI, cards, bank transfers)
- **Bidding-based allocation** - Operators bid on shipper bookings
- **Strict compliance** - HGV trucks only, 2018+, BS4/BS6, National Permit
- **Transparency** - Masked phone numbers, encrypted KYC, audit trails
- **No intermediaries** - Direct shipper-operator connection

---

## 🎯 KEY STAKEHOLDERS & ROLES

### 1. Shipper (Load Owner)
**Capabilities:**
- Create bookings (pickup, drop, goods, tonnage)
- View AI-generated expected price (not visible to operators)
- Set price range from expected price
- View all bids with masked operator details
- Negotiate unlimited times
- Accept bid → creates Shipment
- Approve driver assignment
- Track live shipment (GPS every 60 seconds)
- Provide OTP to driver for delivery completion
- Receive POD after delivery

**Restrictions:**
- Cannot see unmasked operator/driver phone numbers
- Cannot bypass driver approval
- Cannot complete without OTP
- Cannot see other operators' bid amounts
- Cannot cancel booking after bids without rejecting all bids (no refunds)

### 2. Operator (Truck Owner)
**Capabilities:**
- Self-service registration (no franchise approval needed)
- Manage maximum **10 trucks** per operator
- Place bids (ONE active bid per booking)
- Modify bids unlimited times
- Assign/change drivers (requires shipper re-approval)
- Manage ledger (cash deposits)
- Manage truck compliance (documents, inspections)

**Restrictions:**
- Ledger cannot go negative
- Bidding fee auto-deducted: ₹5 × tonnage + ₹0.25 × distance
- Only 2018+, BS4/BS6, HGV trucks with National Permit
- Truck auto-blocked if documents expired
- Truck inspection every 120 days
- Cannot see expected price (only price range)
- Cannot see other operators' bids
- Cannot cancel accepted booking

### 3. Driver (Shipment Executor)
**Capabilities:**
- Work with multiple operators
- Drive shipments
- Upload pickup/drop photos (geotagged)
- Upload POD PDF
- Complete delivery via OTP (provided by shipper)
- Report breakdown/delay

**Restrictions:**
- Must complete KYC
- One active shipment only (across all operators)
- GPS ping every 60 seconds (mandatory)
- Cannot complete delivery without OTP
- Cannot modify shipment details
- Cannot upload fake POD

### 4. Admin (HQ)
**Capabilities:**
- Full override authority (with justification)
- Reassign trucks/drivers
- Cancel bookings/shipments
- Resolve disputes
- View all system data (masked KYC)
- Full KYC access (if KYC-admin role)
- Fraud investigation and escalation

**Restrictions:**
- Cannot modify ledger (system-only)
- Cannot bypass critical compliance
- Cannot view full KYC without KYC-admin role
- Must document all overrides with justification
- Cannot modify zero-compromise business rules

### 5. Franchise Network
**Unit Franchise:**
- Conduct truck inspections (120-day cycle)
- Upload geo-tagged inspection photos
- Complete inspection checklist
- Approve/reject trucks
- Escalate suspicious cases
- Local operator support

**District Franchise:**
- Supervise all Unit Franchises
- Audit inspections (5-10% sampling)
- Set monthly targets
- Approve/reject audit results
- Handle escalations
- Monitor compliance

**Franchise Restrictions:**
- Cannot access full KYC
- Cannot modify shipments
- Cannot assign trucks/drivers
- Cannot bypass auto-blocks
- Cannot modify ledger

---

## 🔒 ZERO-COMPROMISE BUSINESS RULES

### Truck Eligibility (Absolute)
- **HGV only** (Heavy Goods Vehicle - open body/container)
- **2018+ model year** (manufacturing year)
- **BS4 or BS6** (emission standard)
- **National Permit mandatory** (valid and non-expired)
- **Maximum 10 trucks per operator**
- **Inspection every 120 days**

### Bidding Rules (Absolute)
- **ONE active bid per operator per booking**
- **Unlimited bid modifications** allowed
- **Bidding fee auto-deducted**: ₹5 × tonnage + ₹0.25 × distance (km)
- **Ledger cannot go negative**
- **Lowest bid auto-finalizes** if shipper inactive 24 hours

### Payment Rules (Absolute)
- **Cash-only payments** - No digital payments (UPI, cards, bank transfers)
- **No commissions** on shipments
- **No refunds** on booking cancellation after bids
- **Bidding fees not refunded** on cancellation

### Shipment Rules (Absolute)
- **Shipper approval mandatory** for driver assignment
- **OTP mandatory** for delivery completion (6-digit, 24-hour expiry)
- **POD mandatory** for completion
- **One active shipment per driver**
- **GPS ping every 60 seconds** (mandatory)
- **Alert if no ping for 30 minutes**

### Privacy & Security Rules (Absolute)
- **Phone numbers masked** to shipper (format: XXXXX-XXXXX)
- **KYC encrypted** (AES-256)
- **Only KYC-admin role** can view full KYC
- **No SMS/WhatsApp** - In-app notifications only (except login OTP via SMS)
- **No direct communication** - All communication through platform

### Compliance Rules (Absolute)
- **Auto-block on document expiry** (RC, Fitness, Insurance, Permit, Pollution)
- **Auto-block on failed inspection**
- **Auto-block on KYC mismatch**
- **Auto-block on suspicious tracking**
- **No bypass without HQ authorization**

---

## 📊 BUSINESS FLOWS

### Flow 1: Booking Creation
1. Shipper enters pickup, drop, goods, tonnage
2. System generates expected price (AI-based)
3. Shipper sets price range from expected price
4. System validates KYC approval
5. Booking published as `OPEN_FOR_BIDDING`
6. Operators see price range only (not expected price)

### Flow 2: Bidding
1. Operator views booking (if eligible)
2. Operator places bid (ONE active bid per booking)
3. System deducts bidding fee from ledger
4. System validates ledger balance (cannot go negative)
5. Bid visible to shipper (with masked operator details)
6. Shipper can negotiate unlimited times

### Flow 3: Auto-Finalization
1. Shipper inactive for 24 hours after bids placed
2. System selects lowest bid (amount ASC)
3. System auto-accepts lowest bid
4. System auto-rejects all other bids
5. Shipment created automatically
6. Shipper notified of auto-finalization

### Flow 4: Shipment Creation
1. Bid accepted (manual or auto-finalization)
2. Booking status → `CONFIRMED`
3. Shipment created with bid details
4. Operator must assign truck + driver
5. Shipper must approve driver
6. Shipment status → `IN_TRANSIT` after approval

### Flow 5: Driver Assignment
1. Operator assigns driver to shipment
2. System validates driver KYC and active shipment status
3. Shipper receives approval request
4. Shipper approves/rejects driver
5. If rejected, operator can assign different driver
6. Shipment cannot proceed without approval

### Flow 6: Tracking
1. Driver app sends GPS location every 60 seconds
2. System stores tracking data
3. Shipper sees live tracking on map
4. If no ping for 30 minutes → Alert triggered
5. Admin notified of tracking failures
6. Investigation triggered if pattern detected

### Flow 7: Delivery & OTP
1. Driver arrives at destination
2. Driver uploads drop photo (geotagged)
3. Driver uploads POD PDF
4. System generates 6-digit OTP (24-hour expiry)
5. OTP sent to shipper via in-app notification
6. Shipper provides OTP to driver (in-person)
7. Driver enters OTP
8. System verifies OTP
9. Shipment status → `COMPLETED`
10. Payment in cash (advance + balance)

### Flow 8: Alternate Truck (Breakdown/Accident)
1. Driver reports breakdown/accident
2. Operator assigns alternate truck
3. System validates alternate truck eligibility
4. Shipper must re-approve driver (if different)
5. Admin authorization required
6. No additional bidding fee charged
7. Shipment ID persists

### Flow 9: Compliance & Inspection
1. Truck inspection due every 120 days
2. System sends reminders (30 days, 7 days, 5 days before)
3. Unit Franchise conducts inspection
4. Franchise uploads geo-tagged photos
5. Franchise completes checklist
6. Franchise approves/rejects truck
7. District Franchise audits (5-10% sampling)
8. Auto-block if inspection failed or overdue

### Flow 10: Escalation & Governance
1. Unit Franchise escalates to District
2. District Franchise escalates to HQ
3. HQ investigates and decides
4. Admin can override (with justification)
5. All actions logged in audit trail
6. Strike system for franchise violations

---

## 🛡️ ANTI-CORRUPTION SHIELD (ACS)

### Purpose
Enforce 25+ critical business rules in real-time to prevent fraud and ensure compliance.

### Key Enforcement Areas
1. **Truck Eligibility** - HGV, 2018+, BS4/BS6, NP
2. **Bidding Rules** - One active bid, ledger validation
3. **Shipment Rules** - Driver approval, OTP, POD
4. **Tracking Rules** - 60-second ping, anomaly detection
5. **Compliance Rules** - Document expiry, inspection cycle
6. **Privacy Rules** - Masking, KYC encryption
7. **Payment Rules** - Cash-only enforcement
8. **Fraud Detection** - Fake POD, fake tracking, identity mismatch

### Enforcement Levels
- **Auto-block** - System-enforced, no bypass
- **Warning** - Category A violations
- **Temporary Block** - Category B violations
- **Suspension** - Category C violations
- **Permanent Ban** - Category D/E violations

---

## 📱 APPLICATIONS & PORTALS

### Mobile Apps (3)
1. **Shipper App** (8 screens)
   - Create bookings, view bids, track shipments, approve drivers, provide OTP

2. **Operator App** (12 screens)
   - Manage fleet, browse bookings, place bids, assign drivers, track shipments

3. **Driver App** (10 screens)
   - View assignments, GPS tracking, upload photos/POD, complete delivery

### Web Portals (2)
1. **Admin Portal** (8 modules)
   - Dashboard, KYC management, truck management, booking/shipment tracking, override requests, franchise management, reports

2. **Franchise Portal** (4 modules)
   - Dashboard (dual mode: District/Unit), truck inspections, target management, performance metrics

---

## 🔧 TECHNICAL ARCHITECTURE

### Backend
- **Framework**: Fastify 4.24
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: Knex
- **Auth**: JWT + OTP (SMS for login, in-app for others)
- **ACS**: Business Rules Engine (JEXL)

### Frontend (Portal)
- **Framework**: Next.js 14
- **UI**: Ant Design 5.22
- **State**: React Query + Zustand
- **Language**: TypeScript 5.9

### Mobile
- **Framework**: React Native 0.72 + Expo 49
- **Router**: Expo Router 2.0
- **State**: React Query + Zustand
- **Language**: TypeScript 5.1

### Infrastructure
- **Cloud**: AWS (Terraform)
- **Container**: Docker + Kubernetes (Helm)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Sentry

---

## ⚠️ CRITICAL VIOLATIONS FIXED

### ✅ Completed Fixes
1. **One Active Bid Per Operator** - ✅ FIXED
   - Added `getActiveBidByOperatorAndBooking()` repository method
   - Added validation in `createBid()` service

2. **Digital Payment Integration** - ✅ FIXED
   - Removed Razorpay mock service
   - Removed Razorpay webhook route
   - Updated payment methods to only allow 'cod'
   - Removed `razorpayPaymentId` from ledger model

3. **SMS/WhatsApp Code** - ✅ FIXED (with exception)
   - Removed SMS provider methods for general notifications
   - **Exception**: Login OTP sent via SMS (AWS SNS) - Business requirement
   - All other OTPs use in-app notifications only

4. **Commission Terminology** - ✅ FIXED
   - Clarified bidding fee distribution vs transaction commission
   - Updated comments to reflect zero-commission marketplace

---

## 📚 KEY DOCUMENTS REFERENCED

### Business Documents
1. **RODISTAA_MASTER_BUSINESS_FILE_v1.0.md** - Single source of truth for all business logic
2. **RODISTAA_BUSINESS_REQUIREMENTS_MASTER_SPECIFICATION_v1.0.md** - Complete requirements (100+)
3. **RODISTAA_BUSINESS_LAWBOOK_v1.0.md** - Zero-compromise rules, violations, penalties
4. **RODISTAA_BUSINESS_BRAIN_v1.0.md** - Unified business logic reference
5. **RODISTAA_MASTER_BUSINESS_FLOW_MAPS_v1.0.md** - 10 complete master flows

### Technical Documents
1. **CODE_ALIGNMENT_ANALYSIS.md** - Code vs business rules alignment
2. **MASTER_INDEX.md** - Complete documentation navigation
3. **README.md** - Platform overview and quick start

---

## 🎯 CURRENT STATUS

### ✅ Completed
- All dependencies installed and verified
- Critical business rule violations fixed
- SMS integration for login OTP implemented
- TypeScript errors resolved
- All packages building successfully

### ⏳ Pending Tasks
1. Verify GPS tracking implementation (60-second ping)
2. Add missing unit tests for critical business rules
3. Review and fix design-system TypeScript errors
4. Create comprehensive test suite for business rules

---

## 🚨 STRICT PROHIBITIONS

**NEVER ALLOW:**
- ❌ Showing full phone numbers to shipper
- ❌ Using WhatsApp/SMS (except login OTP)
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
- ❌ Skipping bidding fee deduction

---

## 📊 BUSINESS METRICS & KPIs

### Operator Metrics
- Fleet size (max 10 trucks)
- Bidding success rate
- Shipment completion rate
- Compliance score
- Ledger balance

### Driver Metrics
- Active shipments
- Completion rate
- Tracking compliance (60-second ping)
- OTP verification rate
- POD upload rate

### Shipper Metrics
- Booking creation rate
- Bid acceptance rate
- Negotiation frequency
- Driver approval time
- Delivery completion rate

### Franchise Metrics
- Inspection completion rate
- Inspection quality score
- Compliance violations
- Strike count
- Performance targets

### Platform Metrics
- Daily active users (DAU)
- Booking-to-shipment conversion
- Auto-finalization rate
- Compliance violations
- Fraud detection rate

---

## 🔐 SECURITY & COMPLIANCE

### Data Protection
- **KYC Encryption**: AES-256 at rest
- **Phone Masking**: Last 4 digits visible only
- **Role-Based Access**: KYC-admin for full KYC access
- **Audit Trails**: Immutable logs with hash chains

### Compliance Enforcement
- **Auto-block System**: Document expiry, failed inspection, KYC mismatch
- **Inspection Cycle**: 120 days mandatory
- **Document Validation**: Real-time checks
- **Tracking Validation**: 60-second ping enforcement

### Fraud Prevention
- **Fake POD Detection**: Duplicate detection, manipulation detection
- **Fake Tracking Detection**: GPS spoofing detection, route anomaly detection
- **Identity Verification**: Face match, KYC validation
- **Bidding Manipulation**: Collusion detection, pattern analysis

---

## 🎓 UNDERSTANDING CONFIRMED

**Status**: ✅ **COMPLETE**

I have read and understood:
- ✅ Complete business model and principles
- ✅ All stakeholder roles and capabilities
- ✅ Zero-compromise business rules
- ✅ Complete business flows (10 master flows)
- ✅ Technical architecture and stack
- ✅ Compliance and security requirements
- ✅ Fraud prevention mechanisms
- ✅ Franchise governance model
- ✅ Admin oversight requirements
- ✅ Current implementation status
- ✅ Critical violations and fixes

**I am now fully equipped to act as AI CTO and make autonomous decisions aligned with Rodistaa business requirements.**

---

**Document Created**: 2024-12-19  
**Last Updated**: 2024-12-19  
**Version**: 1.0  
**Authority**: AI CTO, Rodistaa

