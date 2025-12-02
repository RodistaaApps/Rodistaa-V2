# 📋 WORKFLOW 4: Auto-Finalization (Lowest Bid)

**Workflow ID**: WF-004  
**Priority**: HIGH  
**Last Updated**: December 19, 2024

---

## 🎯 WORKFLOW OVERVIEW

Automatic finalization of booking when shipper is inactive for 24 hours. Lowest bid is auto-accepted, all others rejected.

---

## 📊 UNIFIED WORKFLOW MAP

### **SYSTEM (Scheduled Job)**

#### Step 1: Check Eligible Bookings
- **Trigger**: Scheduled job runs (e.g., every hour)
- **Criteria Check**:
  - Booking status = `POSTED` or `OPEN`
  - Has pending bids
  - Shipper inactive for 24+ hours (no booking updates)

#### Step 2: Find Lowest Bid
- **System Action**: Sort bids by amount (ASC)
- **Lowest Bid**: First bid in sorted list (lowest amount)
- **Other Bids**: All remaining bids

#### Step 3: Auto-Finalize
- **System Action** (Atomic Transaction):
  1. Accept lowest bid → `ACCEPTED`
  2. Reject all other bids → `REJECTED`
  3. Update booking → `CONFIRMED`
  4. Create shipment automatically
  5. Mark booking as `autoFinalized: true`

---

### **SHIPPER APP**

#### Step 1: Receive Auto-Finalization Notification
- **Notification**: "Booking [ID] auto-confirmed - Lowest bid accepted"
- **View**: Booking details screen
- **Data Displayed**:
  - Booking status: "Confirmed - Auto-Finalized"
  - Accepted bid details (operator, amount, truck)
  - Message: "Auto-confirmed due to inactivity. Lowest bid selected."

#### Step 2: Review Accepted Bid
- **View**: Accepted bid details
- **Data Visible**:
  - Operator name
  - Bid amount (lowest)
  - Truck details
  - Shipment created automatically

#### Step 3: Continue to Driver Assignment
- **Status**: Booking proceeds to driver assignment workflow
- **Next Step**: Operator assigns driver (pending shipper approval)

---

### **OPERATOR APP**

#### Step 1: Receive Bid Status Update
- **Notification**: Bid status changed
- **If Lowest Bid**:
  - Bid status → `ACCEPTED`
  - Notification: "Your bid accepted - Auto-finalized"
  - Shipment created automatically
- **If Other Bid**:
  - Bid status → `REJECTED`
  - Notification: "Bid rejected - Lower bid auto-accepted"
  - **NO REFUND** (business rule)

#### Step 2: View Accepted Bid (Lowest Bid Operator)
- **View**: Bid shows as "Accepted - Auto-Finalized"
- **Action**: Proceed to assign driver to shipment

#### Step 3: View Rejected Bid (Other Operators)
- **View**: Bid shows as "Rejected - Lower bid auto-accepted"
- **Impact**: Bidding fee NOT refunded

---

### **ADMIN PORTAL**

#### Visibility
- **View**: All auto-finalizations in booking history
- **Data Visible**:
  - Booking ID
  - Shipper inactivity duration
  - Auto-accepted bid (lowest)
  - Auto-rejected bids count
  - Timestamp of auto-finalization

#### Monitoring
- **Analytics**: Auto-finalization rates
- **Metrics**: Average bid amounts, inactivity patterns

---

## ✅ RULE COMPLIANCE SCAN

### Auto-Finalization Rules
- ✅ **Lowest bid wins** - Enforced (sorted ASC by amount)
- ✅ **Shipper inactive 24h** - Checked before auto-finalization
- ✅ **All other bids rejected** - Automatic rejection
- ✅ **Shipment created automatically** - From accepted bid
- ✅ **No refunds for rejected bids** - Business rule enforced

---

## 🔍 INCONSISTENCY DETECTION

### ✅ No Violations Detected

All workflow steps comply with business rules:
- Lowest bid selection logic correct
- 24-hour inactivity threshold enforced
- Automatic bid rejection implemented
- Shipment creation automatic

---

## 📋 CORRECTED WORKFLOW

**Status**: ✅ **NO CORRECTIONS NEEDED**

---

## ⚙️ SYSTEM CONFIGURATION

### Scheduled Job Requirements
- **Frequency**: Run every hour (configurable)
- **Logic**: Check all open bookings with pending bids
- **Threshold**: 24 hours shipper inactivity (configurable)

### Auto-Finalization Logic
```
IF booking.status IN ['POSTED', 'OPEN']
AND booking.hasPendingBids = true
AND booking.lastActivity < (NOW - 24 hours)
THEN
  lowestBid = MIN(booking.pendingBids.amount)
  ACCEPT lowestBid
  REJECT all other bids
  CREATE shipment from lowestBid
  UPDATE booking.status = 'CONFIRMED'
  SET booking.autoFinalized = true
END IF
```

---

**Workflow Mapping Status**: ✅ **COMPLETE & COMPLIANT**

