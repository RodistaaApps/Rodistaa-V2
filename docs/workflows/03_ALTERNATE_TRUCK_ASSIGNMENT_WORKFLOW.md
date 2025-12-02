# 📋 WORKFLOW 3: Alternate Truck Assignment (Breakdown/Accident)

**Workflow ID**: WF-003  
**Priority**: HIGH  
**Last Updated**: December 19, 2024

---

## 🎯 WORKFLOW OVERVIEW

Complete flow for operator assigning alternate truck when breakdown/accident occurs during shipment. Enforces "NO NEW BIDDING FEE" business rule.

---

## 📊 UNIFIED WORKFLOW MAP

### **OPERATOR APP**

#### Step 1: Report Breakdown/Accident
- **Trigger**: Truck breaks down or accident occurs during shipment
- **Action**: Operator reports breakdown
- **Data Entered**:
  - Breakdown type (mechanical, accident, other)
  - Location
  - Description
  - Photos (optional)
- **System Action**: Breakdown record created with status `REPORTED`

#### Step 2: Request Alternate Truck Assignment
- **Action**: Operator requests to assign alternate truck
- **Validation**: System checks breakdown is reported
- **View**: Alternate truck selection screen
- **Available Trucks**: Only shows operator's available trucks

#### Step 3: Select Alternate Truck
- **Action**: Operator selects alternate truck from fleet
- **Validation Checks**:
  - ✅ Truck belongs to operator
  - ✅ Truck status = `AVAILABLE`
  - ✅ Truck meets criteria (HGV, BS4/BS6, etc.)
- **Optional**: Select alternate driver (or keep same driver)

#### Step 4: Confirm Alternate Truck Assignment
- **Action**: Operator confirms assignment
- **System Action**:
  - Old truck status → `AVAILABLE`
  - New truck status → `ON_TRIP`
  - Shipment truck ID updated
  - Breakdown status → `RESOLVED`
  - **NO NEW BIDDING FEE CHARGED** (business rule)

#### Step 5: Alternate Truck Assigned
- **View**: Confirmation screen
- **Data Displayed**:
  - New truck details
  - Breakdown resolved
  - Shipment ID **PERSISTS** (same shipment)
  - Confirmation: No additional fee charged

---

### **SHIPPER APP**

#### Step 1: Receive Breakdown Notification
- **Notification**: "Shipment [ID] - Breakdown reported"
- **View**: Breakdown details screen
- **Data Visible**:
  - Breakdown type
  - Location
  - Status: "Resolving - Alternate truck being arranged"

#### Step 2: Alternate Truck Assigned Notification
- **Notification**: "Alternate truck assigned - Shipment continuing"
- **View**: Updated shipment details
- **Data Visible**:
  - New truck registration number
  - Breakdown resolved
  - Shipment continues with same ID
  - **No impact on pricing** (business rule: no new fee)

---

### **DRIVER APP**

#### Scenario A: Same Driver Continues
- **Impact**: Driver continues with new truck
- **View**: Updated truck details in shipment
- **Status**: No change to driver assignment

#### Scenario B: New Driver Assigned
- **Impact**: Old driver released, new driver assigned
- **Old Driver View**: Assignment ended, status → `AVAILABLE`
- **New Driver View**: New assignment received, status → `ON_TRIP`
- **Validation**: New driver must not have active shipment (enforced)

---

### **ADMIN PORTAL**

#### Visibility
- **View**: All breakdown reports and resolutions
- **Data Visible**:
  - Breakdown details
  - Alternate truck assignment
  - Confirmation: No new bidding fee charged
  - Shipment ID persistence verification

---

### **FRANCHISE PORTALS**

#### Visibility
- **Unit/District**: Local breakdown tracking and resolution monitoring

---

## ✅ RULE COMPLIANCE SCAN

### Alternate Truck Rules
- ✅ **Allowed only for breakdown/accident** - Enforced (breakdown record required)
- ✅ **NO NEW BIDDING FEE** - Strictly enforced (biddingFeeCharged: false)
- ✅ **Shipment ID persists** - Same shipment ID maintained
- ✅ **One active shipment per driver** - Enforced for new driver

---

## 🔍 INCONSISTENCY DETECTION

### ✅ No Violations Detected

All workflow steps comply with business rules:
- Breakdown report required before assignment
- No new bidding fee processing
- Shipment ID maintained
- Driver validation enforced

---

## 📋 CORRECTED WORKFLOW

**Status**: ✅ **NO CORRECTIONS NEEDED**

---

## 🔄 RESTRICTIONS

### What is NOT Allowed
- ❌ Alternate truck assignment without breakdown/accident report
- ❌ Charging new bidding fee for alternate truck
- ❌ Changing shipment ID when alternate truck assigned
- ❌ Assigning driver with active shipment

---

**Workflow Mapping Status**: ✅ **COMPLETE & COMPLIANT**

