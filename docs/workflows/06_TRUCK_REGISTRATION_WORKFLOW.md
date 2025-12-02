# 📋 WORKFLOW 6: Truck Registration & Validation

**Workflow ID**: WF-006  
**Priority**: HIGH  
**Last Updated**: December 19, 2024

---

## 🎯 WORKFLOW OVERVIEW

Complete flow for operator registering trucks with strict validation against Rodistaa criteria (HGV, BS4/BS6, 2018+, National Permit, Max 10 trucks).

---

## 📊 UNIFIED WORKFLOW MAP

### **OPERATOR APP**

#### Step 1: Initiate Truck Registration
- **Action**: Operator selects "Add Truck"
- **Validation**: Check if operator has < 10 trucks
- **If Max Reached**: Error - "Maximum 10 trucks allowed per operator"

#### Step 2: Enter Truck Details
- **Data Required**:
  - Registration number
  - Vehicle type (must be HGV)
  - Emission standard (BS4 or BS6)
  - Year of manufacture (must be 2018+)
  - Permit type (must be National Permit)
  - Body type (open/container)
  - Tyre count
  - Insurance details
  - RC documents
  - Permit documents

#### Step 3: Upload Documents
- **Documents Required**:
  - RC (Registration Certificate)
  - Insurance
  - National Permit
  - Fitness certificate
  - Any other required documents
- **Action**: Upload documents (photos/scans)

#### Step 4: Submit for Validation
- **Action**: Operator submits truck registration
- **System Validation**:
  - ✅ Vehicle type = HGV (Heavy Goods Vehicle)
  - ✅ Emission standard = BS4 or BS6
  - ✅ Year of manufacture >= 2018
  - ✅ Permit type includes "National"
  - ✅ Operator has < 10 trucks

#### Step 5: Validation Result
- **If Valid**:
  - Truck status → `PENDING_VERIFICATION`
  - Message: "Truck details validated. Awaiting verification."
- **If Invalid**:
  - Error messages displayed:
    - "Only HGV trucks allowed"
    - "Only BS4/BS6 emission standard allowed"
    - "Only 2018+ manufacture year allowed"
    - "National Permit required"
    - "Maximum 10 trucks per operator"

#### Step 6: Verification Process
- **Action**: Admin/SurePass verifies truck
- **Process**: Document verification, physical inspection
- **Status**: Truck status → `VERIFIED` or `REJECTED`

#### Step 7: Truck Approved
- **Notification**: "Truck [Registration] verified and approved"
- **Status**: Truck status → `AVAILABLE`
- **Action**: Truck can now be used for bidding

---

### **ADMIN PORTAL**

#### Visibility
- **View**: All pending truck registrations
- **Data Visible**:
  - Full truck details
  - Uploaded documents
  - Validation results
  - Operator information

#### Actions
- **Verify Truck**: Approve/reject truck registration
- **Document Review**: Verify all documents
- **Inspection**: Schedule/manage physical inspection

---

## ✅ RULE COMPLIANCE SCAN

### Truck Validation Rules
- ✅ **HGV only** - Enforced (validates vehicle type)
- ✅ **BS4/BS6 only** - Enforced (validates emission standard)
- ✅ **2018+ only** - Enforced (validates year of manufacture)
- ✅ **National Permit required** - Enforced (validates permit type)
- ✅ **Max 10 trucks per operator** - Enforced (counts existing trucks)

---

## 🔍 INCONSISTENCY DETECTION

### ✅ No Violations Detected

All workflow steps comply with business rules:
- All validation criteria enforced
- Max 10 trucks limit checked
- Document verification required

---

## 📋 CORRECTED WORKFLOW

**Status**: ✅ **NO CORRECTIONS NEEDED**

---

## 🔄 RESTRICTIONS

### What is NOT Allowed
- ❌ Non-HGV vehicles (LCV, etc.)
- ❌ Pre-BS4 emission standard
- ❌ Trucks manufactured before 2018
- ❌ State permit only (National Permit required)
- ❌ More than 10 trucks per operator
- ❌ Bidding with unverified truck

---

**Workflow Mapping Status**: ✅ **COMPLETE & COMPLIANT**

