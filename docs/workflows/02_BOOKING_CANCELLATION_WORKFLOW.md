# 📋 WORKFLOW 2: Booking Cancellation

**Workflow ID**: WF-002  
**Priority**: HIGH  
**Last Updated**: December 19, 2024

---

## 🎯 WORKFLOW OVERVIEW

Complete flow for shipper cancelling a booking, with strict enforcement of "NO REFUNDS" business rule when bids exist.

---

## 📊 UNIFIED WORKFLOW MAP

### **SHIPPER APP**

#### Step 1: Request Cancellation
- **Action**: Shipper selects booking to cancel
- **View**: Cancellation confirmation screen
- **Data Displayed**:
  - Booking details
  - Current bid count (if any)
  - Pending bids list (operator names, amounts)
  - **WARNING**: "All pending bids will be rejected. NO REFUNDS will be issued to operators."
- **Action Options**:
  - Confirm cancellation
  - Cancel (go back)

#### Step 2: Confirm Cancellation
- **Action**: Shipper confirms cancellation
- **Optional**: Enter cancellation reason
- **System Action**:
  - All pending bids → `REJECTED`
  - Booking status → `CANCELLED`
  - **NO REFUNDS ISSUED** (business rule)

#### Step 3: Cancellation Confirmation
- **View**: Cancellation success screen
- **Data Displayed**:
  - Booking cancelled
  - Number of bids rejected
  - Cancellation timestamp

---

### **OPERATOR APP**

#### Step 1: Receive Cancellation Notification
- **Notification**: "Booking [ID] has been cancelled"
- **Impact**: Bid status → `REJECTED`
- **View**: Bid details show "Rejected - Booking Cancelled"

#### Step 2: View Bid Status
- **View**: Bid appears in "Rejected" bids list
- **Data Displayed**:
  - Reason: "Booking cancelled by shipper"
  - Bidding fee: **NOT REFUNDED** (business rule)
  - Rejection timestamp

#### Step 3: Financial Impact
- **Ledger**: Bidding fee remains deducted (no refund)
- **Visible**: Transaction shows fee deduction with status "Non-refundable"

---

### **DRIVER APP**

#### Impact
- **None**: Driver not yet assigned at cancellation stage
- **Note**: If driver was assigned, driver approval step would be at shipment level

---

### **ADMIN PORTAL**

#### Visibility
- **View**: Cancellation logged in booking history
- **Data Visible**:
  - Booking cancellation reason
  - Number of bids rejected
  - Affected operators (with bid amounts)
  - Confirmation: No refunds issued

#### Reporting
- **Analytics**: Cancellation rates, reasons
- **Financial**: Bidding fee retention tracking

---

### **FRANCHISE UNIT PORTAL**

#### Visibility
- **Local Impact**: See local bookings cancelled
- **Data**: Cancellation metrics for local operators

---

### **FRANCHISE DISTRICT PORTAL**

#### Visibility
- **District-Wide**: Aggregate cancellation metrics
- **Data**: District-level cancellation patterns

---

## ✅ RULE COMPLIANCE SCAN

### Booking Cancellation Rules
- ✅ **NO REFUNDS when booking cancelled after bids** - Strictly enforced
- ✅ **All pending bids rejected** - Automatic rejection
- ✅ **Bidding fees retained** - No refund processing

---

## 🔍 INCONSISTENCY DETECTION

### ✅ No Violations Detected

All workflow steps comply with business rules:
- Warning displayed to shipper about no refunds
- Automatic bid rejection enforced
- No refund processing initiated

---

## 📋 CORRECTED WORKFLOW

**Status**: ✅ **NO CORRECTIONS NEEDED**

---

## 🔄 WORKFLOW VARIATIONS

### Variation A: Cancellation Before Bids
- **Scenario**: Shipper cancels before any bids placed
- **System Action**: Booking status → `CANCELLED`
- **Impact**: No bids to reject, no fees involved

### Variation B: Cancellation After Bid Acceptance
- **Scenario**: Shipper cancels after bid accepted (shipment created)
- **Note**: This is a shipment cancellation workflow (different from booking cancellation)
- **Business Rule**: Shipment-level cancellation has different rules

---

**Workflow Mapping Status**: ✅ **COMPLETE & COMPLIANT**

