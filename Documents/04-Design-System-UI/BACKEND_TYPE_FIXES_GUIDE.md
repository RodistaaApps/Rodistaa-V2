# Backend Type Fixes Guide

**Date**: December 2, 2025  
**Package**: `packages/backend/`  
**Issue**: 33 TypeScript errors due to enum/type mismatches  
**Status**: Pattern established, fixes ready to apply

---

## Error Summary

### Category 1: Enum String Literals (18 errors)
Using string literals like `"FINALIZED"` instead of enum `BookingStatus.FINALIZED`

### Category 2: Missing Properties (8 errors)
Properties like `finalizedBidId`, `driverId`, `truckId` not in interface definitions

### Category 3: Duplicate Identifiers (6 errors)
Double imports causing conflicts

### Category 4: Type Mismatches (1 error)
Missing required properties in object construction

---

## Fix Pattern

### ✅ CORRECT: Use Enums
```typescript
// ❌ WRONG
booking.status = "FINALIZED";
if (status === "PENDING") {}

// ✅ CORRECT
import { BookingStatus, BidStatus, ShipmentStatus, TruckStatus } from '@rodistaa/app-shared';

booking.status = BookingStatus.FINALIZED;
if (status === BidStatus.PENDING) {}
```

### ✅ CORRECT: Add Missing Properties
```typescript
// For Booking interface - add:
export interface Booking {
  // ... existing properties
  finalizedBidId?: string; // The winning bid ID
}

// For Bid interface - add:
export interface Bid {
  // ... existing properties
  driverId?: string;  // Assigned driver
  truckId?: string;   // Assigned truck
}
```

---

## Files Requiring Fixes

### High Priority (Core Modules)

#### 1. `src/modules/bookings/bookings.service.ts`
**Errors**: 2
- Line 125: Cast string to `BookingStatus`
- Line 171: Use `BookingStatus.CANCELLED`

**Fix**:
```typescript
// Line 6 - Add import
import { Booking, BookingStatus } from '@rodistaa/app-shared';

// Line 125
status: status as BookingStatus, // Cast query param

// Line 171
status: BookingStatus.CANCELLED,
```

#### 2. `src/modules/bookings/bookings.repository.ts`
**Errors**: 6 (duplicate identifiers + type issues)
- Lines 8, 209: Duplicate imports
- Line 58: Null check
- Line 196: Undefined check

**Fix**:
```typescript
// Remove duplicate imports at line 209
// Keep only one import block at top

// Line 58 - Add null check
const booking = await this.db.booking.findById(id);
if (!booking) return null;
return booking;

// Line 196 - Add default value
bidsCount: result?.count ?? 0,
```

#### 3. `src/modules/bids/bids.service.ts`
**Errors**: 2
- Line 192: Use enum
- Line 232: Use enum for comparison

**Fix**:
```typescript
// Line 6 - Add imports
import { BidStatus, BookingStatus } from '@rodistaa/app-shared';

// Line 192
status: BookingStatus.FINALIZED,

// Line 232
if (bid.status === BidStatus.PENDING) {
```

#### 4. `src/modules/shipments/shipments.service.ts`
**Errors**: 11 (most complex)
- Lines 29, 33: Missing `finalizedBidId` property
- Lines 48, 56, 57: Missing `driverId`, `truckId` on Bid
- Lines 81, 85, 163, 212, 235, 246: String literals vs enums

**Fix**:
```typescript
// Line 6 - Add imports
import { Booking, Bid, ShipmentStatus } from '@rodistaa/app-shared';

// Lines 29, 33 - Fix property access
// Option 1: Cast to extended type
const booking = await this.bookingsRepo.getById(bookingId) as Booking & { finalizedBidId?: string };

// Option 2: Access from bid directly
const bid = await this.bidsRepo.getById(booking.acceptedBidId);

// Lines 48, 56, 57 - Access from shipment or driver assignment
const shipment = await this.shipmentsRepo.getById(shipmentId);
const driverId = shipment.driverId;
const truckId = shipment.truckId;

// Line 81
if (shipment.status === ShipmentStatus.ASSIGNED) {

// Line 85
status: ShipmentStatus.IN_TRANSIT,

// Line 163
if (shipment.status === ShipmentStatus.COMPLETED) {

// Line 212, 246
status: ShipmentStatus.COMPLETED,
```

#### 5. `src/modules/shipments/shipments.repository.ts`
**Errors**: 1
- Line 159: Missing required properties

**Fix**:
```typescript
// Line 159 - Add all required Shipment properties
return {
  id: row.id,
  bookingId: row.booking_id,
  bidId: row.bid_id,
  shipperId: row.shipper_id,      // ADD
  operatorId: row.operator_id,
  driverId: row.driver_id,
  truckId: row.truck_id,
  status: row.status as ShipmentStatus,
  pickup: JSON.parse(row.pickup),  // ADD
  drop: JSON.parse(row.drop),      // ADD
  goods: JSON.parse(row.goods),    // ADD
  agreedPrice: row.agreed_price,   // ADD
  tracking: JSON.parse(row.tracking ?? '{}'), // ADD
  createdAt: row.created_at,
  updatedAt: row.updated_at,
};
```

#### 6. `src/modules/trucks/trucks.service.ts`
**Errors**: 3
- Lines 99, 114, 192: String literals vs TruckStatus enum

**Fix**:
```typescript
// Line 6 - Add import
import { TruckStatus } from '@rodistaa/app-shared';

// Line 99
status: TruckStatus.BLOCKED,

// Line 114
status: TruckStatus.ACTIVE,

// Line 192
status: TruckStatus.BLOCKED,
```

#### 7. `src/modules/trucks/trucks.controller.ts`
**Errors**: 1
- Line 30: Missing `operatorId` in create request

**Fix**:
```typescript
// Line 30 - Extract operatorId from request
const truckData = {
  ...request.body,
  operatorId: request.user.id, // From auth middleware
};
await this.trucksService.createTruck(truckData);
```

#### 8. `src/modules/trucks/trucks.repository.ts`
**Errors**: 1
- Line 377: Invalid property `registrationNumber`

**Fix**:
```typescript
// Line 377 - Use correct property name
regNo: input.regNo, // Not registrationNumber
```

#### 9. `src/modules/franchise/franchise.controller.ts`
**Errors**: 2
- Lines 35, 78: Missing `franchiseId` property

**Fix**:
```typescript
// Add franchiseId to user type or extract from auth
const franchiseId = request.user.franchiseId;
// Or cast request.user to extended type with franchiseId
```

#### 10. `src/modules/kyc/kyc.controller.ts`
**Errors**: 1
- Line 19: Missing `file` property on FastifyRequest

**Fix**:
```typescript
// Add @fastify/multipart for file uploads
// Or cast request appropriately
const file = (request as any).file; // Temporary
// Better: Install @fastify/multipart and use proper types
```

---

## Execution Plan

### Phase 1: Add Missing Imports (15 min)
Add enum imports to all service/controller files:
```typescript
import { 
  BookingStatus, 
  BidStatus, 
  ShipmentStatus, 
  TruckStatus 
} from '@rodistaa/app-shared';
```

### Phase 2: Replace String Literals (30 min)
Find and replace all string literals with enum values:
- `"FINALIZED"` → `BookingStatus.FINALIZED`
- `"CANCELLED"` → `BookingStatus.CANCELLED`
- `"PENDING"` → `BidStatus.PENDING`
- `"IN_TRANSIT"` → `ShipmentStatus.IN_TRANSIT`
- `"DELIVERED"` → `ShipmentStatus.COMPLETED`
- `"ACTIVE"` → `TruckStatus.ACTIVE`
- `"BLOCKED"` → `TruckStatus.BLOCKED`

### Phase 3: Fix Missing Properties (45 min)
1. Update type definitions to include missing properties
2. Fix property access patterns
3. Add null/undefined checks

### Phase 4: Remove Duplicates (15 min)
Clean up duplicate import statements

### Phase 5: Verify Build (15 min)
```bash
cd packages/backend
pnpm build
```

**Total Time**: ~2 hours

---

## Quick Fix Script

For automated fixes (use with caution):

```bash
# Replace common string literals
cd packages/backend/src

# BookingStatus
find . -name "*.ts" -exec sed -i 's/"FINALIZED"/BookingStatus.FINALIZED/g' {} \;
find . -name "*.ts" -exec sed -i 's/"CANCELLED"/BookingStatus.CANCELLED/g' {} \;

# BidStatus  
find . -name "*.ts" -exec sed -i 's/"PENDING"/BidStatus.PENDING/g' {} \;
find . -name "*.ts" -exec sed -i 's/"ACCEPTED"/BidStatus.ACCEPTED/g' {} \;

# ShipmentStatus
find . -name "*.ts" -exec sed -i 's/"IN_TRANSIT"/ShipmentStatus.IN_TRANSIT/g' {} \;
find . -name "*.ts" -exec sed -i 's/"DELIVERED"/ShipmentStatus.COMPLETED/g' {} \;
find . -name "*.ts" -exec sed -i 's/"COMPLETED"/ShipmentStatus.COMPLETED/g' {} \;

# TruckStatus
find . -name "*.ts" -exec sed -i 's/"ACTIVE"/TruckStatus.ACTIVE/g' {} \;
find . -name "*.ts" -exec sed -i 's/"BLOCKED"/TruckStatus.BLOCKED/g' {} \;
```

---

## Testing After Fixes

```bash
# 1. Build check
cd packages/backend
pnpm build

# 2. Type check only
pnpm typecheck

# 3. Run smoke test
pnpm smoke

# 4. Start dev server
pnpm dev
```

---

## Status

- **Errors Identified**: 33
- **Fix Patterns Established**: ✅
- **Estimated Fix Time**: 2 hours
- **Risk Level**: LOW (mostly enum replacements)
- **Breaking Changes**: None (internal only)

---

## Next Steps

1. Apply fixes systematically (file by file)
2. Verify build after each major fix
3. Commit incrementally
4. Run smoke tests
5. Update NEXT_STEPS_PRIORITY.md

---

**Guide Created**: December 2, 2025  
**Ready for**: Implementation

