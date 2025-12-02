# 📋 WORKFLOW 5: OTP-Based Delivery Completion

**Workflow ID**: WF-005  
**Priority**: HIGH  
**Last Updated**: December 19, 2024

---

## 🎯 WORKFLOW OVERVIEW

Complete flow for OTP generation, sharing, and verification to complete shipment delivery. Enforces 6-digit OTP with 24-hour expiry.

---

## 📊 UNIFIED WORKFLOW MAP

### **SHIPPER APP**

#### Step 1: Generate OTP Request
- **Trigger**: Driver reaches delivery location and requests OTP
- **Notification**: "OTP requested for shipment [ID]"
- **View**: OTP generation screen

#### Step 2: Generate OTP
- **Action**: Shipper generates OTP
- **System Action**:
  - 6-digit OTP generated
  - OTP expiry: 24 hours from generation
  - OTP stored for verification
- **View**: OTP display screen
- **Data Displayed**:
  - 6-digit OTP (prominently displayed)
  - Valid until: [timestamp + 24 hours]
  - Shipment ID

#### Step 3: Share OTP
- **Action**: Shipper shares OTP with driver
- **Methods**:
  - Show OTP to driver/delivery contact in person
  - Share via in-app (if delivery contact has app access)
- **Note**: No SMS/WhatsApp (business rule: in-app only)

#### Step 4: Delivery Completion Confirmation
- **Trigger**: Driver verifies OTP successfully
- **Notification**: "Shipment [ID] delivered successfully"
- **View**: Delivery confirmation screen
- **Data Displayed**:
  - Delivery timestamp
  - Payment confirmation (cash payment)

---

### **DRIVER APP**

#### Step 1: Request OTP
- **Trigger**: Driver reaches delivery location
- **Action**: Driver requests OTP from shipper
- **System Action**: OTP request sent to shipper
- **View**: "Waiting for OTP" screen

#### Step 2: Receive OTP
- **Source**: Shipper provides OTP (in-person or in-app)
- **Action**: Driver enters 6-digit OTP

#### Step 3: Verify OTP
- **Action**: Driver enters OTP in app
- **Validation Checks**:
  - ✅ OTP matches generated OTP
  - ✅ OTP not expired (within 24 hours)
  - ✅ Driver is assigned to shipment
- **System Action**:
  - OTP verified
  - Shipment status → `DELIVERED`
  - Driver status → `AVAILABLE`

#### Step 4: Delivery Completion
- **View**: Delivery completion confirmation
- **Data Displayed**:
  - Delivery successful
  - Shipment completed
  - Payment details (cash)

#### Error Scenarios
- **Invalid OTP**: "Invalid OTP. Please check and try again."
- **Expired OTP**: "OTP expired (24 hours). Please request new OTP from shipper."
- **No OTP Generated**: "No OTP found. Shipper must generate OTP first."

---

### **OPERATOR APP**

#### Visibility
- **View**: Shipment status updates
- **Notification**: "Shipment [ID] delivered - OTP verified"
- **Data Visible**: Delivery completion timestamp

---

### **ADMIN PORTAL**

#### Visibility
- **View**: All OTP generations and verifications
- **Data Visible**:
  - OTP generation timestamps
  - OTP verification timestamps
  - Expired OTPs (if any)
  - Failed verification attempts

---

## ✅ RULE COMPLIANCE SCAN

### OTP Rules
- ✅ **6-digit OTP** - Enforced (generated as 100000-999999)
- ✅ **24-hour expiry** - Enforced (expiresAt = generatedAt + 24h)
- ✅ **Shipper provides to driver** - Workflow enforced
- ✅ **Required for completion** - Delivery cannot complete without verified OTP

---

## 🔍 INCONSISTENCY DETECTION

### ✅ No Violations Detected

All workflow steps comply with business rules:
- 6-digit OTP generation correct
- 24-hour expiry enforced
- Verification required before completion
- No SMS/WhatsApp notifications (in-app only)

---

## 📋 CORRECTED WORKFLOW

**Status**: ✅ **NO CORRECTIONS NEEDED**

---

## 🔄 WORKFLOW VARIATIONS

### Variation A: OTP Expired
- **Scenario**: 24 hours pass before driver uses OTP
- **Action**: Shipper must generate new OTP
- **Old OTP**: Marked as expired, cannot be used

### Variation B: Delivery Contact Receives OTP
- **Scenario**: Shipper not present at delivery location
- **Action**: Delivery contact person receives OTP from shipper
- **Verification**: Driver still enters OTP in app to complete

---

**Workflow Mapping Status**: ✅ **COMPLETE & COMPLIANT**

