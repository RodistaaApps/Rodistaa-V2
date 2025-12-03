# 🧪 UAT Execution Guide

Comprehensive User Acceptance Testing guide for Rodistaa platform.

---

## Overview

**Duration**: 2 weeks  
**Environment**: Staging  
**Participants**: Business stakeholders, end users, QA team  
**Goal**: Validate platform functionality before production

---

## Test Environment Access

### Staging URLs
- **Backend API**: https://api-staging.rodistaa.com
- **Admin Portal**: https://portal-staging.rodistaa.com
- **Grafana Dashboard**: https://grafana-staging.rodistaa.com

### Test Accounts

#### Admin Accounts
```
Email: admin@rodistaa.com
Phone: +919876543210
OTP: 123456 (dev mode)
Role: SUPER_ADMIN
```

#### Shipper Accounts
```
Phone: +919876543211
OTP: 123456
Role: SHIPPER
```

#### Operator Accounts
```
Phone: +919876543212
OTP: 123456
Role: OPERATOR
```

#### Driver Accounts
```
Phone: +919876543213
OTP: 123456
Role: DRIVER
```

---

## UAT Test Scenarios

### Module 1: Authentication & Authorization (Priority: CRITICAL)

#### Test 1.1: Login Flow
**Steps**:
1. Open Admin Portal
2. Enter phone number: +919876543210
3. Request OTP
4. Enter OTP: 123456
5. Click Login

**Expected**:
- ✓ OTP sent successfully
- ✓ Login successful
- ✓ Redirected to dashboard
- ✓ User name displayed in header

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

#### Test 1.2: Role-Based Access
**Steps**:
1. Login as SHIPPER
2. Try to access Admin Portal features

**Expected**:
- ✓ Restricted to shipper-only features
- ✓ Cannot access admin functions

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

### Module 2: Booking Management (Priority: CRITICAL)

#### Test 2.1: Create Full Truck Load (FTL) Booking
**Steps**:
1. Login as SHIPPER
2. Navigate to "Create Booking"
3. Fill booking details:
   - Type: FTL
   - From: Mumbai
   - To: Delhi
   - Pickup: Tomorrow 10 AM
   - Truck Type: 20ft Container
   - Weight: 10,000 kg
   - Material: Electronics
4. Submit booking

**Expected**:
- ✓ Booking created successfully
- ✓ Booking ID generated (BK-*)
- ✓ Status: DRAFT
- ✓ Can view in "My Bookings"

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

#### Test 2.2: Create Part Truck Load (PTL) Booking
**Steps**:
1. Create PTL booking with:
   - Weight: 2,000 kg
   - Dimensions: 4x4x4 ft
2. Submit

**Expected**:
- ✓ PTL booking created
- ✓ Can be consolidated with other PTLs

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

#### Test 2.3: Publish Booking to Load Board
**Steps**:
1. Select a DRAFT booking
2. Click "Publish to Load Board"
3. Set bid deadline: 2 hours

**Expected**:
- ✓ Status changed to PUBLISHED
- ✓ Visible on load board
- ✓ Operators can view and bid

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

### Module 3: Bidding System (Priority: CRITICAL)

#### Test 3.1: Submit Bid as Operator
**Steps**:
1. Login as OPERATOR
2. View load board
3. Select a published booking
4. Submit bid:
   - Amount: ₹45,000
   - Truck: MH-12-AB-1234
   - Driver: Assign available driver
   - Estimated pickup: 2 hours

**Expected**:
- ✓ Bid submitted successfully
- ✓ Bid ID generated (BD-*)
- ✓ Status: PENDING
- ✓ Shipper can see bid

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

#### Test 3.2: Accept Bid as Shipper
**Steps**:
1. Login as SHIPPER
2. View bids for booking
3. Compare bids
4. Accept best bid

**Expected**:
- ✓ Bid accepted
- ✓ Booking status: CONFIRMED
- ✓ Other bids auto-rejected
- ✓ Assignment created

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

#### Test 3.3: ACS Anomaly Detection - Suspicious Bid
**Steps**:
1. Submit bid 50% below average market rate
2. Check Admin Portal

**Expected**:
- ✓ ACS flags bid as suspicious
- ✓ Alert visible in admin dashboard
- ✓ Bid requires manual review

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

### Module 4: Shipment Tracking (Priority: HIGH)

#### Test 4.1: Track Shipment in Real-Time
**Steps**:
1. Open shipment detail page
2. View live GPS location
3. Check status updates

**Expected**:
- ✓ Map shows truck location
- ✓ Route displayed
- ✓ ETA calculated
- ✓ Updates every 30 seconds

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

#### Test 4.2: ACS GPS Anomaly Detection
**Steps**:
1. Simulate GPS jump (admin feature)
2. Check alerts

**Expected**:
- ✓ ACS detects GPS jump
- ✓ Alert sent to admin
- ✓ Shipment flagged for review

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

### Module 5: Proof of Delivery (POD) (Priority: CRITICAL)

#### Test 5.1: Upload POD Documents
**Steps**:
1. Login as DRIVER
2. Navigate to active shipment
3. Click "Complete Delivery"
4. Upload:
   - POD photo
   - Signature
   - Invoice copy
5. Add notes
6. Submit

**Expected**:
- ✓ Documents uploaded to S3
- ✓ Shipment status: DELIVERED
- ✓ Shipper receives notification
- ✓ POD visible to shipper

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

#### Test 5.2: Verify POD as Shipper
**Steps**:
1. Login as SHIPPER
2. View delivered shipment
3. Download POD documents
4. Verify and accept/dispute

**Expected**:
- ✓ Can view all POD documents
- ✓ Can accept delivery
- ✓ Can raise dispute if needed

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

### Module 6: Payment Processing (Priority: CRITICAL)

#### Test 6.1: Process Payment
**Steps**:
1. Login as SHIPPER
2. Navigate to delivered shipment
3. Click "Pay Now"
4. Enter amount
5. Select payment method: Razorpay
6. Complete payment (test mode)

**Expected**:
- ✓ Razorpay checkout opens
- ✓ Payment successful
- ✓ Shipment status: PAID
- ✓ Operator receives payment notification

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

### Module 7: KYC & Verification (Priority: HIGH)

#### Test 7.1: Submit KYC Documents
**Steps**:
1. Login as OPERATOR (new account)
2. Navigate to "Complete KYC"
3. Upload:
   - PAN card
   - Aadhaar card (encrypted)
   - GST certificate
   - Bank details
4. Submit for verification

**Expected**:
- ✓ Documents uploaded and encrypted
- ✓ KYC status: PENDING
- ✓ Admin can review documents
- ✓ Sensitive data encrypted in DB

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

#### Test 7.2: Approve KYC as Admin
**Steps**:
1. Login as ADMIN
2. View pending KYC requests
3. Review documents
4. Approve KYC

**Expected**:
- ✓ KYC status: VERIFIED
- ✓ Operator can now receive bookings
- ✓ Audit log created

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

### Module 8: Franchise Management (Priority: MEDIUM)

#### Test 8.1: Create Franchise
**Steps**:
1. Login as SUPER_ADMIN
2. Navigate to "Franchises"
3. Click "Add Franchise"
4. Fill details:
   - Name: Mumbai Central
   - Code: MUM-C
   - Coverage: Mumbai suburbs
   - Commission: 5%
5. Submit

**Expected**:
- ✓ Franchise created
- ✓ Franchise ID generated
- ✓ Can assign operators to franchise

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

### Module 9: Admin Portal Analytics (Priority: MEDIUM)

#### Test 9.1: View Dashboard Metrics
**Steps**:
1. Login as ADMIN
2. View dashboard

**Expected**:
- ✓ DAU displayed
- ✓ Total bookings count
- ✓ Active trucks count
- ✓ Revenue chart
- ✓ Fraud alerts count

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

#### Test 9.2: Export Reports
**Steps**:
1. Navigate to "Reports"
2. Select date range: Last 30 days
3. Select report type: Booking Summary
4. Click "Export CSV"

**Expected**:
- ✓ CSV file downloaded
- ✓ Contains correct data
- ✓ All columns present

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

### Module 10: Mobile Apps (Priority: CRITICAL)

#### Test 10.1: Shipper App - Create Booking
**Steps**:
1. Open Shipper mobile app
2. Login
3. Create FTL booking
4. Track shipment

**Expected**:
- ✓ Smooth user experience
- ✓ All features work
- ✓ Real-time updates

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

#### Test 10.2: Driver App - Update Status
**Steps**:
1. Open Driver mobile app
2. Login
3. View assigned shipment
4. Update status: "Reached Pickup"
5. Upload live GPS

**Expected**:
- ✓ Status updated in real-time
- ✓ GPS location visible to shipper
- ✓ Push notification sent

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

## Performance Tests

### Test P1: Load Testing
**Tool**: Apache JMeter or k6  
**Scenario**: 100 concurrent users  
**Duration**: 10 minutes

**Expected**:
- ✓ Avg response time < 500ms
- ✓ Error rate < 1%
- ✓ No memory leaks

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

### Test P2: Stress Testing
**Scenario**: Gradually increase to 500 users

**Expected**:
- ✓ System handles load gracefully
- ✓ No crashes
- ✓ Auto-scaling works

**Actual**: _____________

**Status**: [ ] Pass [ ] Fail

---

## Security Tests

### Test S1: SQL Injection
**Scenario**: Attempt SQL injection in search fields

**Expected**:
- ✓ Blocked by parameterized queries
- ✓ No data leakage

**Status**: [ ] Pass [ ] Fail

---

### Test S2: XSS Attack
**Scenario**: Inject script tags in input fields

**Expected**:
- ✓ Input sanitized
- ✓ Scripts not executed

**Status**: [ ] Pass [ ] Fail

---

### Test S3: Authentication Bypass
**Scenario**: Try accessing protected routes without token

**Expected**:
- ✓ Returns 401 Unauthorized
- ✓ No data exposed

**Status**: [ ] Pass [ ] Fail

---

## UAT Sign-Off

### Test Summary

| Module | Total Tests | Passed | Failed | Blocked |
|--------|-------------|--------|--------|---------|
| Authentication | 2 | | | |
| Booking | 3 | | | |
| Bidding | 3 | | | |
| Tracking | 2 | | | |
| POD | 2 | | | |
| Payment | 1 | | | |
| KYC | 2 | | | |
| Franchise | 1 | | | |
| Admin Portal | 2 | | | |
| Mobile Apps | 2 | | | |
| Performance | 2 | | | |
| Security | 3 | | | |
| **TOTAL** | **25** | | | |

### Sign-Off

**Product Owner**: ______________________  Date: __________

**QA Lead**: ______________________  Date: __________

**CTO**: ______________________  Date: __________

### Go/No-Go Decision

[ ] **GO** - Approve for production deployment  
[ ] **NO-GO** - Requires fixes before production

**Comments**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## Post-UAT Actions

### If GO:
1. ✅ Fix minor issues (if any)
2. ✅ Schedule production deployment
3. ✅ Prepare rollback plan
4. ✅ Notify stakeholders

### If NO-GO:
1. ⚠️ Document all critical issues
2. ⚠️ Create fix tasks with priorities
3. ⚠️ Re-run UAT after fixes
4. ⚠️ Reschedule deployment

---

**Questions?** Contact QA team or CTO.

