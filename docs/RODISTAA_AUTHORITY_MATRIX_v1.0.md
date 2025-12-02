# 🧭 RODISTAA AUTHORITY MATRIX v1.0

**Role-Based Permissions, Responsibilities, and Boundaries**

**Version**: 1.0  
**Effective Date**: December 19, 2024  
**Status**: ✅ **BINDING REFERENCE FOR ALL ROLE-BASED OPERATIONS**

---

## 📌 PURPOSE

This Authority Matrix defines **role-based permissions, responsibilities, and boundaries** for all users across the Rodistaa platform. It serves as the **ultimate permissions reference** for determining what each role can and cannot do.

**This matrix must be enforced by**:
- All Rodistaa applications (Shipper, Operator, Driver, Admin, Franchise portals)
- System-level access control
- Business logic validation
- Cursor IDE reasoning
- Product specifications

---

## 📘 INTERPRETATION RULES

### Permission Levels

**"FULL CONTROL"** = Unrestricted authority with override rights. Can perform action without additional authorization, but must log justification for audit trail.

**"LIMITED CONTROL"** = Allowed but within strict business conditions. Action permitted only under specific circumstances with required approvals or conditions.

**"READ-ONLY"** = Can view but not modify. Access granted for viewing/reading purposes only, no editing capabilities.

**"NO ACCESS"** = Strictly forbidden. Action is completely prohibited for this role under all circumstances.

**"MASKED ONLY"** = Can view partial/masked information but not full details. Privacy-protected access level.

---

## 🟥 SECTION 1 — ADMIN (HQ)

**Role Description**: Rodistaa headquarters authority responsible for platform governance, escalation management, compliance oversight, overrides, and final decisions.

**Authority Level**: **Highest operational authority** (subject only to Managing Director)

### Permissions Matrix

| Action | Permission | Notes |
|--------|-----------|-------|
| **View all bookings** | FULL CONTROL | Only role with universal visibility across all bookings |
| **Modify bookings** | FULL CONTROL | Must log justification for all modifications |
| **Cancel bookings** | FULL CONTROL | Must audit cancellation reason and impact |
| **View all shipments** | FULL CONTROL | Includes complete timeline, tracking history, all status changes |
| **Override shipment** | FULL CONTROL | Can override shipment status, assignments, or lifecycle. Must record reason in audit trail |
| **Assign/reassign truck** | FULL CONTROL | Can assign or change truck assignments with shipper approval |
| **Assign/reassign driver** | FULL CONTROL | Can assign or change driver assignments with shipper approval |
| **Access KYC** | LIMITED | Only if Admin has KYC-admin role. Standard admin cannot access full KYC |
| **Modify ledger** | NO ACCESS | Ledger is immutable - cannot modify operator balances |
| **Modify pricing** | NO ACCESS | Only shipper controls prices (expected price and price range) |
| **Create franchise** | FULL CONTROL | HQ only - can create and onboard new franchises |
| **Modify franchise payout** | FULL CONTROL | HQ only - manages franchise revenue share and payments |
| **View operator/driver numbers** | READ-ONLY | Masking lifted for HQ only - can see full phone numbers |
| **Resolve disputes** | FULL CONTROL | Includes handling escalations from District Franchise |
| **Trigger fraud investigations** | FULL CONTROL | Mandatory for anomalies, suspicious activity, or fraud patterns |
| **Block/unblock users** | FULL CONTROL | Can block or unblock operators, drivers, shippers, or franchises |
| **Override auto-blocks** | FULL CONTROL | Can override system auto-blocks with justification |
| **View audit trails** | FULL CONTROL | Complete access to all audit logs and system actions |
| **Modify business rules** | NO ACCESS | Cannot modify zero-compromise rules (Section 2 of Lawbook) - MD authority only |

**Key Notes**:
- Admin is the **top operational authority** for day-to-day platform management
- KYC visibility requires **special permission** (KYC-admin role)
- All overrides and modifications **must be logged** in audit trail
- Admin decisions are binding but subject to MD appeal

---

## 🟧 SECTION 2 — DISTRICT FRANCHISE

**Role Description**: Supervisory entity that oversees all Unit Franchises within a district, audits quality, sets targets, and handles compliance.

**Authority Level**: **Supervisory + Compliance Authority** (subject to HQ oversight)

### Permissions Matrix

| Action | Permission | Notes |
|--------|-----------|-------|
| **View all units in district** | FULL CONTROL | Supervisory role - complete visibility of all Unit Franchises |
| **View truck inspections** | FULL CONTROL | Must review randomly to ensure quality control |
| **Approve/reject inspections** | FULL CONTROL | Quality control mandate - can override Unit Franchise decisions |
| **Assign targets** | FULL CONTROL | Can set performance targets for all units in district |
| **Audit compliance** | FULL CONTROL | Monthly required audits of Unit Franchise performance |
| **Handle escalations** | LIMITED CONTROL | Must escalate major issues (Category D+) to HQ |
| **View KYC** | NO ACCESS | Masked details only - cannot access full KYC |
| **Modify shipments** | NO ACCESS | Not permitted - shipments are operator/admin controlled |
| **Modify bookings** | NO ACCESS | Not permitted - bookings are shipper/admin controlled |
| **Penalize unit franchises** | LIMITED CONTROL | Can apply strike system penalties to Unit Franchises |
| **Create franchise** | NO ACCESS | HQ only - cannot create new franchises |
| **View operator/driver numbers** | NO ACCESS | Masked only - privacy protection |
| **Override truck blocks** | NO ACCESS | Cannot override auto-blocks - HQ authority only |
| **Manage franchise payouts** | NO ACCESS | HQ authority only |

**Key Notes**:
- District = **supervisory + compliance authority** for multiple Unit Franchises
- **Cannot override HQ** decisions or system auto-blocks
- Must escalate Category D+ violations to HQ immediately
- Subject to strike system for violations

---

## 🟨 SECTION 3 — UNIT FRANCHISE

**Role Description**: Field-level operational entity responsible for conducting truck inspections, local compliance management, and operator support.

**Authority Level**: **Field-Level Operational Body** (subject to District Franchise oversight)

### Permissions Matrix

| Action | Permission | Notes |
|--------|-----------|-------|
| **Conduct truck inspections** | FULL CONTROL | Primary role - mandatory 120-day inspection cycle |
| **Upload inspection photos** | FULL CONTROL | Must include geotag + timestamp for verification |
| **Approve/Reject truck** | LIMITED CONTROL | Cannot override district decisions or HQ blocks |
| **View operators in area** | FULL CONTROL | For local operations and support |
| **Support operators** | FULL CONTROL | Non-financial support - guidance, compliance help |
| **View KYC** | NO ACCESS | Masked details only - no full KYC access |
| **Modify shipments/bookings** | NO ACCESS | Forbidden - not authorized for these actions |
| **Escalate issues** | LIMITED CONTROL | Must escalate to District Franchise (cannot go directly to HQ) |
| **Assign drivers/trucks** | NO ACCESS | Operator/Admin only - franchise cannot assign |
| **View operator/driver numbers** | NO ACCESS | Masked only - privacy protection |
| **Block users** | NO ACCESS | Cannot block - must escalate violations |
| **Modify ledger** | NO ACCESS | No financial access |
| **Override compliance** | NO ACCESS | Cannot override auto-blocks or compliance flags |

**Key Notes**:
- Unit = **field-level operational body** for local inspections and support
- **No access to sensitive data** or financial information
- Must escalate all violations beyond Category A/B to District Franchise
- Subject to strike system and District Franchise audits

---

## 🟩 SECTION 4 — OPERATOR

**Role Description**: Verified truck owner who manages trucks, bids on bookings, assigns drivers, and handles shipment execution.

**Authority Level**: **Commercial Participant** (subject to strict compliance boundaries)

### Permissions Matrix

| Action | Permission | Notes |
|--------|-----------|-------|
| **Add trucks** | FULL CONTROL | Max 10 trucks per operator (hard limit) |
| **Modify trucks** | LIMITED CONTROL | Cannot bypass compliance - must meet all eligibility criteria |
| **Assign drivers** | FULL CONTROL | Drivers must be linked to operator and KYC-verified |
| **Manage ledger** | FULL CONTROL | Can add funds, track balance, view transaction history |
| **Place bid** | FULL CONTROL | One active bid per booking only |
| **Modify bid** | FULL CONTROL | Unlimited modifications (subject to ledger availability) |
| **Assign truck** | FULL CONTROL | Must be compliant (eligible, documents valid, inspection current) |
| **Assign alternate truck** | LIMITED CONTROL | Requires admin authorization + shipper approval (breakdown/accident only) |
| **View shipper number** | MASKED ONLY | Full number forbidden - privacy protection |
| **View driver KYC** | NO ACCESS | Driver may choose to show masked version, but full KYC not accessible |
| **Modify booking** | NO ACCESS | Booking belongs to shipper - cannot modify |
| **Complete shipment** | NO ACCESS | Driver only - operator cannot complete delivery |
| **View tracking** | FULL CONTROL | For assigned shipments only - cannot view other operators' shipments |
| **Cancel bid** | FULL CONTROL | Can withdraw bid before acceptance (no refund) |
| **Cancel booking** | NO ACCESS | Cannot cancel booking - shipper or admin only |
| **View other bids** | NO ACCESS | Cannot see other operators' bid amounts |

**Key Notes**:
- Operator is the **commercial participant** with strict compliance boundaries
- Must comply with all truck eligibility, document, and inspection requirements
- Cannot modify shipper bookings or view sensitive information
- Subject to auto-block if compliance violations detected

---

## 🟦 SECTION 5 — DRIVER

**Role Description**: Verified individual who executes shipments, uploads photos, follows tracking requirements, and completes delivery via OTP.

**Authority Level**: **Journey Executor** (subject to lifecycle rules)

### Permissions Matrix

| Action | Permission | Notes |
|--------|-----------|-------|
| **Accept shipments** | FULL CONTROL | Must be assigned by operator (cannot self-assign) |
| **Upload photos** | FULL CONTROL | Pickup/Drop photos mandatory |
| **Upload POD** | FULL CONTROL | Required for delivery completion |
| **Start tracking** | FULL CONTROL | Automated when shipment status changes to IN_TRANSIT |
| **Complete delivery** | LIMITED CONTROL | Only via OTP entry - cannot complete without correct OTP |
| **Mark breakdown/delay** | FULL CONTROL | Creates alerts and triggers alternate truck process |
| **View shipper number** | MASKED ONLY | Full number forbidden - privacy protection |
| **Assign self to shipment** | NO ACCESS | Operator or Admin only - driver cannot self-assign |
| **Modify pricing** | NO ACCESS | Forbidden - pricing is operator/shipper controlled |
| **View KYC of others** | NO ACCESS | Forbidden - privacy protection |
| **View operator number** | MASKED ONLY | Privacy protection |
| **Modify shipment** | NO ACCESS | Cannot modify shipment details or status |
| **Cancel shipment** | NO ACCESS | Cannot cancel - operator or admin only |
| **View tracking history** | FULL CONTROL | Can view own shipment tracking history |

**Key Notes**:
- Driver is the **executor of the journey** and cannot bypass lifecycle rules
- Must follow GPS tracking requirements (60-second ping interval)
- Cannot complete delivery without correct OTP from shipper
- Subject to one active shipment limit

---

## 🟪 SECTION 6 — SHIPPER

**Role Description**: Verified user who posts loads, negotiates bids, approves drivers, tracks shipments, and completes delivery via OTP.

**Authority Level**: **Demand Side** (subject to approval/visibility rules)

### Permissions Matrix

| Action | Permission | Notes |
|--------|-----------|-------|
| **Create booking** | FULL CONTROL | After KYC verification complete |
| **Modify booking** | FULL CONTROL | Until bids exist - cannot modify after bids placed |
| **View bids** | FULL CONTROL | Can see all bids with masked operator details |
| **Negotiate** | FULL CONTROL | Unlimited negotiations through in-app messaging |
| **Accept bid** | FULL CONTROL | Creates shipment - binding commitment |
| **Approve driver** | FULL CONTROL | Mandatory step - cannot bypass driver approval |
| **Track shipment** | FULL CONTROL | Real-time GPS tracking for assigned shipments |
| **Complete delivery** | FULL CONTROL | OTP entry required - must provide OTP to driver |
| **View operator/driver number** | MASKED ONLY | Privacy rule - full numbers forbidden |
| **Modify shipment** | NO ACCESS | Admin or operator only - shipper cannot modify |
| **Access KYC** | NO ACCESS | Forbidden - privacy protection |
| **Cancel booking** | FULL CONTROL | Can cancel before bids - no refund if cancelled after bids |
| **Assign driver** | NO ACCESS | Operator assigns - shipper only approves |
| **Assign truck** | NO ACCESS | Operator assigns - shipper cannot assign |
| **View other shipper bookings** | NO ACCESS | Cannot view other shippers' bookings |

**Key Notes**:
- Shipper is the **demand side** and must follow strict approval/visibility rules
- Must approve driver before shipment can proceed
- Cannot view unmasked operator/driver contact information
- Can cancel booking but no refund if cancelled after bids placed

---

## 🟫 SECTION 7 — KYC ADMIN (HQ SPECIAL ROLE)

**Role Description**: Special HQ role with exclusive access to full KYC documents and personal information for identity verification and fraud detection.

**Authority Level**: **Ultra-Sensitive Role** (strict auditing required)

### Permissions Matrix

| Action | Permission | Notes |
|--------|-----------|-------|
| **View full KYC** | FULL CONTROL | Only role allowed to view complete, unmasked KYC documents |
| **Approve/Reject KYC** | FULL CONTROL | Final authority for KYC verification decisions |
| **Handle suspicious KYC** | FULL CONTROL | Fraud-sensitive - can flag for investigation |
| **Report KYC fraud** | FULL CONTROL | Direct escalation to HQ for legal action |
| **Modify KYC** | NO ACCESS | Only user can update their own KYC - admin cannot modify |
| **View masked data** | FULL CONTROL | Standard access to masked information like other admins |
| **Modify other business data** | NO ACCESS | Forbidden - KYC-admin role is limited to KYC functions |
| **Access audit logs** | FULL CONTROL | Can view all KYC access logs for compliance |
| **Override KYC blocks** | FULL CONTROL | Can unblock users after KYC verification |
| **Export KYC data** | LIMITED CONTROL | Only for legal/compliance purposes with authorization |

**Key Notes**:
- KYC Admin = **ultra-sensitive role** with strict auditing requirements
- All KYC access is **logged and audited** with timestamp and purpose
- Cannot modify user KYC data - only approve/reject
- Subject to data privacy regulations and policies

---

## 🟧 SECTION 8 — ROLE INTERACTION MATRIX

**Who Interacts with Whom?** - Defining allowed cross-role interactions.

| Role | Interacts With | Rule | Communication Method |
|------|---------------|------|---------------------|
| **Shipper ↔ Operator** | Negotiation only | Masked numbers | In-app messaging platform only |
| **Shipper ↔ Driver** | Delivery only | Masked numbers | In-app messaging for delivery coordination only |
| **Operator ↔ Driver** | Full control | Driver must be linked | Direct assignment and communication allowed |
| **Operator ↔ Franchise** | Compliance only | Inspections only | Inspection-related communication only |
| **Franchise ↔ Admin** | Escalations | Compliance chain | District → HQ escalation path only |
| **Driver ↔ Admin** | Safety only | For incidents | Emergency and safety incidents only |
| **Shipper ↔ Admin** | Disputes | Admin override | Dispute resolution and overrides only |
| **Operator ↔ Admin** | Shipment + incidents | Admin override | Shipment issues and incidents only |
| **District ↔ Unit Franchise** | Supervision | Compliance chain | District supervises Unit Franchises |

**No other cross-role interactions allowed.**

**Interaction Rules**:
- All interactions through platform channels only (no direct phone numbers)
- Masked contact information enforced
- Audit trail maintained for all cross-role interactions
- No unauthorized communication outside platform

---

## 🟨 SECTION 9 — ENFORCEMENT POWER MATRIX

**Who Has What Enforcement Powers?** - Defining authority to take enforcement actions.

| Power | Who Has It | Notes | Authority Level |
|-------|-----------|-------|----------------|
| **Terminate user** | HQ | Critical violations only | Category E violations, permanent ban |
| **Block truck/driver/operator** | System + HQ | Auto-block + manual override | System auto-block + HQ manual block |
| **Reverse shipment** | Admin | With justification required | Override shipment status or lifecycle |
| **Override driver/truck** | Admin | Logged mandatory | Change assignments with shipper approval |
| **Approve inspections** | Franchise | Multi-level approval | Unit Franchise → District Franchise → HQ |
| **Cancel booking** | Shipper + Admin | Operator cannot cancel | Shipper can cancel, Admin can cancel with justification |
| **Auto-finalize bids** | System | Lowest amount wins | System-enforced after 24-hour inactivity |
| **Validate identity** | KYC-Admin | Only role allowed | Approve/reject KYC submissions |
| **Apply strikes** | District Franchise + HQ | Franchise penalty system | Strike system enforcement |
| **Suspend user** | HQ | Temporary removal | Category B-D violations |
| **Override auto-block** | HQ | With justification | Override system auto-blocks with audit trail |
| **Modify ledger** | System only | Automated billing | Bidding fee deduction only - no manual modification |

**Enforcement Authority Hierarchy**:
1. **System** (automatic enforcement - auto-blocks, auto-finalization)
2. **HQ (Admin)** (manual override and critical enforcement)
3. **District Franchise** (compliance enforcement, strike system)
4. **Unit Franchise** (inspection enforcement, minor violations)

---

## 🟩 SECTION 10 — AUTHORITY VIOLATION CONSEQUENCES

**What Happens When Roles Exceed Their Authority?** - Violation consequences based on severity.

### Minor Violation (Category A)
**Examples**:
- Role attempts to view data beyond scope (but no access granted)
- Unauthorized communication attempt (blocked by system)
- Attempt to perform unauthorized action (system rejects)

**Consequence**: 
- **Warning** issued automatically
- **Training reminder** sent
- **No account restrictions**

---

### Operational Violation (Category B)
**Examples**:
- Role successfully accesses unauthorized data (system bug)
- Role modifies data without proper authorization (system bug)
- Role bypasses required approvals (system bug)

**Consequence**:
- **Temporary block** (24-48 hours)
- **Operational penalty score** assigned
- **Franchise alert** if franchise involved
- **System audit** to fix access control

---

### Compliance Violation (Category C)
**Examples**:
- Admin accesses KYC without KYC-admin role (access logged)
- Franchise attempts to override HQ decision (blocked)
- Operator attempts to bypass compliance (auto-block triggered)

**Consequence**:
- **Auto-block** enforced immediately
- **Mandatory re-verification** required
- **District Franchise audit** triggered
- **Account restrictions** until compliance restored
- **Strike** assigned if franchise involved

---

### Major Violation (Category D)
**Examples**:
- Admin modifies ledger (system should prevent, but if successful)
- Franchise approves ineligible truck (fraudulent inspection)
- Admin suppresses compliance flags (misconduct)

**Consequence**:
- **Immediate BLOCK** of user account
- **Franchise strike** (if franchise involved)
- **HQ investigation** mandatory
- **Suspension** (30-90 days)
- **Financial penalties** possible
- **Legal escalation** if fraud confirmed

---

### Critical Violation (Category E)
**Examples**:
- Admin grants unauthorized KYC access with malicious intent
- Franchise covers up fraud or criminal activity
- Admin manipulates system to enable fraud

**Consequence**:
- **Permanent ban** from platform
- **Legal escalation** mandatory
- **Franchise termination** if involved
- **Operator blacklisting** (permanent)
- **System-wide alert** to all roles
- **Police/RTO intervention** if required
- **Financial recovery** actions initiated

---

## 🔒 SECTION 11 — DATA ACCESS CONTROL

**Who Can Access What Data?** - Comprehensive data access permissions.

### Booking Data

| Data Element | Shipper | Operator | Driver | Unit Franchise | District Franchise | Admin | KYC-Admin |
|--------------|---------|----------|--------|----------------|-------------------|-------|-----------|
| Own bookings | FULL | NO | NO | NO | NO | FULL | READ-ONLY |
| All bookings | NO | NO | NO | NO | NO | FULL | READ-ONLY |
| Booking details | FULL | MASKED | NO | NO | NO | FULL | READ-ONLY |
| Price range | FULL | READ-ONLY | NO | NO | NO | FULL | READ-ONLY |
| Expected price | FULL | NO | NO | NO | NO | FULL | READ-ONLY |
| Bid amounts | FULL | OWN ONLY | NO | NO | NO | FULL | READ-ONLY |

### Shipment Data

| Data Element | Shipper | Operator | Driver | Unit Franchise | District Franchise | Admin | KYC-Admin |
|--------------|---------|----------|--------|----------------|-------------------|-------|-----------|
| Own shipments | FULL | FULL | FULL | NO | NO | FULL | READ-ONLY |
| All shipments | NO | NO | NO | NO | NO | FULL | READ-ONLY |
| Tracking data | FULL | FULL | FULL | NO | NO | FULL | READ-ONLY |
| Delivery status | FULL | FULL | FULL | NO | NO | FULL | READ-ONLY |

### KYC Data

| Data Element | Shipper | Operator | Driver | Unit Franchise | District Franchise | Admin | KYC-Admin |
|--------------|---------|----------|--------|----------------|-------------------|-------|-----------|
| Own KYC | FULL | FULL | FULL | NO | NO | MASKED | FULL |
| Other users' KYC | NO | NO | NO | NO | NO | MASKED | FULL |
| KYC status | OWN | OWN | OWN | NO | NO | FULL | FULL |
| Suspicious KYC flags | NO | NO | NO | NO | NO | FULL | FULL |

### Contact Information

| Data Element | Shipper | Operator | Driver | Unit Franchise | District Franchise | Admin | KYC-Admin |
|--------------|---------|----------|--------|----------------|-------------------|-------|-----------|
| Own contact | FULL | FULL | FULL | NO | NO | FULL | FULL |
| Shipper number | NO | MASKED | MASKED | NO | NO | FULL | FULL |
| Operator number | MASKED | OWN | MASKED | NO | NO | FULL | FULL |
| Driver number | MASKED | FULL | OWN | NO | NO | FULL | FULL |

### Financial Data

| Data Element | Shipper | Operator | Driver | Unit Franchise | District Franchise | Admin | KYC-Admin |
|--------------|---------|----------|--------|----------------|-------------------|-------|-----------|
| Ledger balance | NO | OWN | NO | NO | NO | READ-ONLY | NO |
| Bidding fees | NO | OWN | NO | NO | NO | READ-ONLY | NO |
| Transaction history | NO | OWN | NO | NO | NO | FULL | NO |
| Franchise payouts | NO | NO | NO | NO | NO | FULL | NO |

---

## ✅ SECTION 12 — AUTHORITY MATRIX ENFORCEMENT

### Enforcement Methods

1. **System-Level Access Control**
   - Role-based access control (RBAC) enforced at application level
   - API-level permissions checking
   - Database-level row-level security

2. **Business Logic Validation**
   - All actions validated against Authority Matrix before execution
   - Violations blocked automatically by system
   - Audit trail maintained for all permission checks

3. **Audit Trail**
   - All permission violations logged
   - All override actions logged with justification
   - Regular audit reviews of permission usage

4. **Manual Enforcement**
   - HQ reviews for complex scenarios
   - Compliance audits for franchise permissions
   - Violation penalties applied per Lawbook

---

## 📌 GLOSSARY REFERENCES

For definitions of terms used in this matrix, refer to:
- **Business Glossary**: `docs/RODISTAA_UNIFIED_BUSINESS_GLOSSARY_v1.0.md`

For violation consequences, refer to:
- **Business Lawbook**: `docs/RODISTAA_BUSINESS_LAWBOOK_v1.0.md` (Section 3: Violation Categories)

---

## ✅ MATRIX COMPLETION STATUS

**Total Sections**: 12 Complete Sections  
**Total Roles Defined**: 7 Roles (Admin, District Franchise, Unit Franchise, Operator, Driver, Shipper, KYC-Admin)  
**Total Permissions Mapped**: 100+ Permission Definitions  
**Status**: ✅ **COMPLETE**

---

## 📍 QUICK REFERENCE

### By Role
- **Admin (HQ)**: Section 1 (Highest operational authority)
- **District Franchise**: Section 2 (Supervisory + compliance)
- **Unit Franchise**: Section 3 (Field-level operations)
- **Operator**: Section 4 (Commercial participant)
- **Driver**: Section 5 (Journey executor)
- **Shipper**: Section 6 (Demand side)
- **KYC-Admin**: Section 7 (Ultra-sensitive role)

### By Function
- **Role Interactions**: Section 8 (Who interacts with whom)
- **Enforcement Powers**: Section 9 (Who can enforce what)
- **Violation Consequences**: Section 10 (What happens when violated)
- **Data Access Control**: Section 11 (Who can access what data)

---

**🧭 The Rodistaa Authority Matrix v1.0 is now COMPLETE.**

**Status**: ✅ **READY FOR ENFORCEMENT ACROSS ALL PLATFORMS**

---

**Version**: 1.0  
**Last Updated**: December 19, 2024  
**Authority**: Managing Director, Rodistaa

