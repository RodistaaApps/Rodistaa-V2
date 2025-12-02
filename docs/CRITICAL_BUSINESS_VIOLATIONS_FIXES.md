# Critical Business Rule Violations - Fixes Required

**Date**: December 19, 2024  
**Role**: Rodistaa Domain Intelligence Engine  
**Status**: 🔴 **CRITICAL VIOLATIONS IDENTIFIED - IMMEDIATE FIX REQUIRED**

---

## 🚨 CRITICAL BUSINESS RULE VIOLATIONS

### Violation 1: One Active Bid Per Operator Per Booking - NOT ENFORCED

**Business Rule**: 
> Operator can have ONLY ONE active bid per booking. Unlimited modifications allowed, but no second bid until first is rejected/withdrawn.

**Current State**:
- ❌ NO database constraint in schema
- ❌ NO application-level check in `backend/src/modules/bids/bids.service.ts`
- ❌ Operator can place multiple bids on same booking

**Location**: `backend/src/modules/bids/bids.service.ts` line 33-113

**Required Fix**:
```typescript
// BEFORE placing bid, check for existing PENDING bid
const existingBid = await this.bidRepository.findOne({
  where: {
    bookingId: dto.bookingId,
    operatorId: operatorId,
    status: BidStatus.PENDING,
  },
});

if (existingBid) {
  throw new BadRequestException(
    'You already have an active bid on this booking. Please modify your existing bid instead of creating a new one.'
  );
}
```

**Schema Fix** (Recommended):
```prisma
// In Bid model - Add composite unique index
@@unique([bookingId, operatorId])
// BUT this needs status filter, so application-level is better
```

**Priority**: 🔴 **CRITICAL - BLOCKS PRODUCTION**

---

### Violation 2: Booking Cancellation - Bids Not Rejected, Refunds Not Prevented

**Business Rule**:
> If shipper cancels booking after bids exist: ALL bids rejected, NO refunds to operators.

**Current State**:
- ❌ NO booking cancellation service implementation
- ❌ NO automatic bid rejection on cancellation
- ❌ NO explicit no-refund policy enforcement

**Required Fix**:
Create booking cancellation service that:
1. Rejects all PENDING bids
2. Marks booking as CANCELLED
3. Explicitly documents NO REFUND policy
4. Does NOT credit bidding fees back to operator ledgers

**Priority**: 🔴 **CRITICAL - FINANCIAL COMPLIANCE**

---

### Violation 3: One Active Shipment Per Driver - NOT ENFORCED

**Business Rule**:
> Driver can have ONLY ONE active shipment at a time. Must complete current before accepting new.

**Current State**:
- ✅ Business rule function exists: `canAcceptShipment()`
- ❌ NOT checked in `driver-assignment.ts` before assignment
- ❌ Driver could be assigned to multiple active shipments

**Location**: `packages/utils/src/driver-assignment.ts` line 40-119

**Required Fix**:
```typescript
// Before assigning driver, check for active shipments
const activeShipment = await this.prisma.shipment.findFirst({
  where: {
    driverId,
    status: {
      in: ['ASSIGNED', 'IN_TRANSIT', 'PICKUP_COMPLETED', 'DELIVERY_COMPLETED'],
    },
  },
});

if (activeShipment) {
  throw new Error(
    `Driver ${driverId} already has an active shipment (${activeShipment.shipmentId}). Must complete current shipment before accepting new assignment.`
  );
}
```

**Priority**: 🟡 **HIGH - OPERATIONAL INTEGRITY**

---

### Violation 4: Alternate Truck Assignment - NOT IMPLEMENTED

**Business Rule**:
> If breakdown/accident: operator assigns alternate truck. Same shipment ID, NO new bidding fee.

**Current State**:
- ✅ Schema supports it: `ShipmentBreakdown` model exists
- ✅ Business rule function exists: `canAssignAlternateTruck()`
- ❌ NO service implementation to assign alternate truck
- ❌ NO enforcement that no new bidding fee is charged

**Required Fix**:
Implement alternate truck assignment service that:
1. Verifies breakdown/accident reported
2. Allows truck change on same shipment
3. Ensures NO new bidding fee deduction
4. Maintains shipment ID

**Priority**: 🟡 **HIGH - BUSINESS CONTINUITY**

---

## 🔧 IMMEDIATE ACTION REQUIRED

### Fix Priority Order:

1. 🔴 **Fix One Active Bid Enforcement** (Blocks bidding integrity)
2. 🔴 **Fix Booking Cancellation** (Financial compliance)
3. 🟡 **Fix One Active Shipment Per Driver** (Operational integrity)
4. 🟡 **Implement Alternate Truck** (Business continuity)

---

## 📋 Implementation Checklist

### Fix 1: One Active Bid Enforcement
- [ ] Add check in `bids.service.ts` before bid creation
- [ ] Test with multiple bids attempt
- [ ] Verify error message is clear

### Fix 2: Booking Cancellation
- [ ] Create booking cancellation service
- [ ] Implement bid rejection logic
- [ ] Document NO REFUND policy
- [ ] Add audit logging

### Fix 3: One Active Shipment Per Driver
- [ ] Add check in `driver-assignment.ts`
- [ ] Test with driver who has active shipment
- [ ] Verify error handling

### Fix 4: Alternate Truck Assignment
- [ ] Create alternate truck assignment service
- [ ] Ensure no new bidding fee
- [ ] Test breakdown scenario

---

**These violations must be fixed before production deployment.**

**Validated By**: Rodistaa Domain Intelligence Engine  
**Action Required**: Immediate fixes required

