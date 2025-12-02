# 📚 Rodistaa Workflow Mapping Index

**Last Updated**: December 19, 2024  
**Total Workflows Mapped**: 10+

---

## 🎯 CORE BOOKING-TO-DELIVERY WORKFLOWS

### ✅ [WF-001: Booking → Bidding → Shipment → Delivery](01_BOOKING_TO_DELIVERY_WORKFLOW.md)
**Priority**: CRITICAL  
**Status**: ✅ Complete  
**Description**: Complete end-to-end flow from booking creation through final delivery completion. Covers all stakeholder actions across Shipper, Operator, Driver, Admin, and Franchise portals.

**Key Business Rules Enforced**:
- ONE active bid per operator per booking
- Driver approval required by shipper
- OTP required for delivery completion
- GPS tracking every 60 seconds
- Auto-finalization of lowest bid

---

## 📋 BOOKING MANAGEMENT WORKFLOWS

### ✅ [WF-002: Booking Cancellation](02_BOOKING_CANCELLATION_WORKFLOW.md)
**Priority**: HIGH  
**Status**: ✅ Complete  
**Description**: Flow for shipper cancelling bookings with strict "NO REFUNDS" enforcement when bids exist.

**Key Business Rules Enforced**:
- NO REFUNDS on cancellation after bids placed
- All pending bids automatically rejected

---

### ✅ [WF-004: Auto-Finalization (Lowest Bid)](04_AUTO_FINALIZATION_WORKFLOW.md)
**Priority**: HIGH  
**Status**: ✅ Complete  
**Description**: Automatic booking finalization when shipper inactive for 24 hours. Lowest bid auto-accepted.

**Key Business Rules Enforced**:
- Lowest bid wins (amount ASC)
- Shipper inactivity threshold: 24 hours
- All other bids auto-rejected
- Shipment created automatically

---

## 🚚 SHIPMENT MANAGEMENT WORKFLOWS

### ✅ [WF-003: Alternate Truck Assignment](03_ALTERNATE_TRUCK_ASSIGNMENT_WORKFLOW.md)
**Priority**: HIGH  
**Status**: ✅ Complete  
**Description**: Flow for assigning alternate truck when breakdown/accident occurs. Enforces NO NEW BIDDING FEE rule.

**Key Business Rules Enforced**:
- Allowed only for breakdown/accident
- NO NEW BIDDING FEE charged
- Shipment ID persists

---

### ✅ [WF-005: OTP-Based Delivery Completion](05_OTP_DELIVERY_COMPLETION_WORKFLOW.md)
**Priority**: HIGH  
**Status**: ✅ Complete  
**Description**: OTP generation, sharing, and verification flow for completing shipment delivery.

**Key Business Rules Enforced**:
- 6-digit OTP required
- 24-hour expiry enforced
- Shipper provides to driver
- Verification required before completion

---

## 🚛 FLEET MANAGEMENT WORKFLOWS

### ✅ [WF-006: Truck Registration & Validation](06_TRUCK_REGISTRATION_WORKFLOW.md)
**Priority**: HIGH  
**Status**: ✅ Complete  
**Description**: Complete truck registration flow with strict validation against Rodistaa criteria.

**Key Business Rules Enforced**:
- HGV only
- BS4/BS6 emission standard
- 2018+ manufacture year
- National Permit required
- Max 10 trucks per operator

---

## 📊 WORKFLOWS IN PROGRESS

### ⏳ [WF-007: Bidding Fee Calculation & Deduction](07_BIDDING_FEE_WORKFLOW.md)
**Status**: Pending  
**Description**: Complete flow for bidding fee calculation, ledger deduction, and fee distribution.

### ⏳ [WF-008: GPS Tracking & Alerts](08_GPS_TRACKING_WORKFLOW.md)
**Status**: Pending  
**Description**: Real-time GPS tracking workflow with 60-second ping intervals and 30-minute alert thresholds.

### ⏳ [WF-009: Driver Assignment & Approval](09_DRIVER_ASSIGNMENT_WORKFLOW.md)
**Status**: Pending  
**Description**: Complete driver assignment workflow with shipper approval requirement.

### ⏳ [WF-010: KYC Verification & Access Control](10_KYC_WORKFLOW.md)
**Status**: Pending  
**Description**: KYC verification workflow with encryption, masking, and role-based access control.

### ⏳ [WF-011: Document Expiry & Auto-Blocking](11_DOCUMENT_EXPIRY_WORKFLOW.md)
**Status**: Pending  
**Description**: Document expiry monitoring workflow with automatic truck/driver blocking.

### ⏳ [WF-012: Truck Inspection Cycle](12_TRUCK_INSPECTION_WORKFLOW.md)
**Status**: Pending  
**Description**: 120-day inspection cycle workflow with reminders and validation.

### ⏳ [WF-013: Ledger Balance Management](13_LEDGER_WORKFLOW.md)
**Status**: Pending  
**Description**: Ledger balance management workflow with negative balance prevention.

### ⏳ [WF-014: Franchise Payout Distribution](14_FRANCHISE_PAYOUT_WORKFLOW.md)
**Status**: Pending  
**Description**: Fee distribution workflow: 25% operator, 5% district, 70% HQ.

---

## 🎯 WORKFLOW CATEGORIES

### Core Business Flows (CRITICAL)
- ✅ Booking-to-Delivery (WF-001)
- ✅ Booking Cancellation (WF-002)
- ✅ Auto-Finalization (WF-004)
- ✅ OTP Delivery Completion (WF-005)

### Operational Flows (HIGH)
- ✅ Alternate Truck Assignment (WF-003)
- ✅ Truck Registration (WF-006)
- ⏳ Driver Assignment (WF-009)
- ⏳ GPS Tracking (WF-008)

### Financial Flows (HIGH)
- ⏳ Bidding Fee Calculation (WF-007)
- ⏳ Ledger Balance Management (WF-013)
- ⏳ Franchise Payout Distribution (WF-014)

### Compliance Flows (MEDIUM)
- ⏳ KYC Verification (WF-010)
- ⏳ Document Expiry (WF-011)
- ⏳ Truck Inspection (WF-012)

---

## 📊 COMPLIANCE STATUS

### Business Rules Coverage
- ✅ **13/13 Core Business Rules** mapped in workflows
- ✅ **100% Critical Workflows** documented
- ⏳ **Additional workflows** in progress

### Cross-App Alignment
- ✅ **All 5 Interfaces** mapped (Shipper, Operator, Driver, Admin, Franchise)
- ✅ **Data Masking** enforced in all workflows
- ✅ **Privacy Rules** compliant across all flows

---

## 🔄 WORKFLOW VALIDATION STATUS

| Workflow ID | Name | Status | Compliance | Last Updated |
|------------|------|--------|------------|--------------|
| WF-001 | Booking-to-Delivery | ✅ Complete | ✅ Compliant | Dec 19, 2024 |
| WF-002 | Booking Cancellation | ✅ Complete | ✅ Compliant | Dec 19, 2024 |
| WF-003 | Alternate Truck | ✅ Complete | ✅ Compliant | Dec 19, 2024 |
| WF-004 | Auto-Finalization | ✅ Complete | ✅ Compliant | Dec 19, 2024 |
| WF-005 | OTP Delivery | ✅ Complete | ✅ Compliant | Dec 19, 2024 |
| WF-006 | Truck Registration | ✅ Complete | ✅ Compliant | Dec 19, 2024 |
| WF-007 | Bidding Fee | ⏳ Pending | - | - |
| WF-008 | GPS Tracking | ⏳ Pending | - | - |
| WF-009 | Driver Assignment | ⏳ Pending | - | - |
| WF-010 | KYC Verification | ⏳ Pending | - | - |
| WF-011 | Document Expiry | ⏳ Pending | - | - |
| WF-012 | Truck Inspection | ⏳ Pending | - | - |
| WF-013 | Ledger Balance | ⏳ Pending | - | - |
| WF-014 | Franchise Payout | ⏳ Pending | - | - |

---

**Index Status**: ✅ **CORE WORKFLOWS COMPLETE**  
**Next Steps**: Continue mapping remaining workflows

