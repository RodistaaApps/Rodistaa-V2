# Next Steps: Service Integration

**Date**: December 19, 2024  
**Workspace**: `C:\Users\devel\Desktop\Rodistaa`  
**Status**: ✅ All business logic services implemented

---

## 🎯 CURRENT STATUS

✅ **13 business logic services implemented**  
✅ **100% domain compliance validated**  
✅ **All services exported in `packages/utils/src/index.ts`**

---

## 📋 INTEGRATION ROADMAP

### Phase 1: Core Service Integration (Priority: CRITICAL)

#### 1.1 Bidding Fee & Ledger Integration

**Service**: `BiddingFeeCalculationService` + `LedgerService`

**Tasks**:
- [ ] Create NestJS module: `backend/src/modules/bidding/bidding.module.ts`
- [ ] Create NestJS service wrapper for `BiddingFeeCalculationService`
- [ ] Create NestJS service wrapper for `LedgerService`
- [ ] Integrate into bid placement flow
- [ ] Auto-deduct bidding fee when bid placed
- [ ] Add endpoint: `POST /api/bids/:id/calculate-fee`

**Files to Create**:
```
backend/src/modules/bidding/
├── bidding.module.ts
├── bidding-fee.service.ts
└── ledger.service.ts
```

---

#### 1.2 Auto-Finalization Integration

**Service**: `AutoFinalizationService`

**Tasks**:
- [ ] Create NestJS module: `backend/src/modules/scheduling/scheduling.module.ts`
- [ ] Create scheduler service
- [ ] Set up cron job (run every hour)
- [ ] Integrate `AutoFinalizationService`
- [ ] Add monitoring/logging

**Files to Create**:
```
backend/src/modules/scheduling/
├── scheduling.module.ts
└── auto-finalization.scheduler.ts
```

---

#### 1.3 OTP Generation Integration

**Service**: `TripOTPService`

**Tasks**:
- [ ] Create NestJS module: `backend/src/modules/shipments/trip-otp/`
- [ ] Create service wrapper
- [ ] Add endpoint: `POST /api/shipments/:id/generate-otp`
- [ ] Add endpoint: `POST /api/shipments/:id/verify-otp`
- [ ] Add authorization (shipper for generation, driver for verification)

**Files to Create**:
```
backend/src/modules/shipments/trip-otp/
├── trip-otp.module.ts
├── trip-otp.service.ts
└── trip-otp.controller.ts
```

---

### Phase 2: Compliance Services Integration (Priority: HIGH)

#### 2.1 Truck Validation Integration

**Service**: `TruckValidationService`

**Tasks**:
- [ ] Integrate into truck registration flow
- [ ] Add validation endpoint
- [ ] Enforce before bid placement

**Integration Point**: Truck registration API

---

#### 2.2 Inspection & Document Expiry Monitoring

**Services**: `TruckInspectionService` + `DocumentExpiryService`

**Tasks**:
- [ ] Create NestJS scheduler module
- [ ] Set up daily cron job
- [ ] Integrate both services
- [ ] Add alerting/notifications

**Files to Create**:
```
backend/src/modules/compliance/
├── compliance.module.ts
├── inspection.scheduler.ts
└── document-expiry.scheduler.ts
```

---

### Phase 3: Tracking Integration (Priority: MEDIUM)

#### 3.1 GPS Tracking Alerts

**Service**: `GPSTrackingAlertsService`

**Tasks**:
- [ ] Create tracking module
- [ ] Integrate location update processing
- [ ] Set up real-time alert generation
- [ ] Add WebSocket notifications

**Files to Create**:
```
backend/src/modules/tracking/
├── tracking.module.ts
├── gps-alerts.service.ts (already exists, enhance)
└── tracking.controller.ts (already exists, enhance)
```

---

#### 3.2 Distance Calculation

**Service**: `DistanceCalculationService`

**Tasks**:
- [ ] Integrate into booking creation flow
- [ ] Calculate distance when booking created
- [ ] Cache distances
- [ ] Add routing API integration (Google Maps/OSRM)

**Integration Point**: Booking creation API

---

## 🔧 TECHNICAL TASKS

### 1. Update Backend Dependencies

```bash
cd backend
pnpm add @rodistaa/utils@workspace:*
```

### 2. Update App Module

Add new modules to `backend/src/app.module.ts`:

```typescript
import { BiddingModule } from './modules/bidding/bidding.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
// ... etc
```

### 3. Create Service Wrappers

Each utility service needs a NestJS wrapper:

```typescript
@Injectable()
export class BiddingFeeService {
  constructor(
    private prisma: PrismaService,
  ) {}

  private getService() {
    return new BiddingFeeCalculationService(this.prisma);
  }
  
  // Wrap methods...
}
```

### 4. Set Up Schedulers

Use `@nestjs/schedule` for cron jobs:

```typescript
@Injectable()
export class AutoFinalizationScheduler {
  constructor(
    private autoFinalizationService: AutoFinalizationService,
  ) {}

  @Cron('0 * * * *') // Every hour
  async processAutoFinalizations() {
    await this.autoFinalizationService.processAutoFinalizations();
  }
}
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Critical Path
- [ ] Bidding fee calculation integrated
- [ ] Ledger balance management integrated
- [ ] Auto-finalization scheduler running
- [ ] OTP generation/verification endpoints

### High Priority
- [ ] Truck validation integrated
- [ ] Inspection scheduler running
- [ ] Document expiry scheduler running

### Medium Priority
- [ ] GPS tracking alerts integrated
- [ ] Distance calculation integrated
- [ ] Real-time notifications

---

## 🎯 SUCCESS CRITERIA

### Phase 1 Complete When:
- ✅ Operators can place bids (fee auto-deducted)
- ✅ Ledger balance enforced (cannot go negative)
- ✅ Bookings auto-finalize (lowest bid wins)
- ✅ Drivers can complete shipments (OTP verified)

### Phase 2 Complete When:
- ✅ Trucks validated on registration
- ✅ Inspection reminders sent
- ✅ Trucks auto-blocked on document expiry

### Phase 3 Complete When:
- ✅ GPS alerts generated in real-time
- ✅ Distance calculated for all bookings
- ✅ Real-time notifications working

---

## 📝 NOTES

1. **All services use Prisma** - Ensure PrismaService is properly injected
2. **All services are transaction-safe** - Use `prisma.$transaction()` where needed
3. **All services follow domain rules** - No modifications to business logic
4. **All services are exported** - Ready for import from `@rodistaa/utils`

---

**Status**: ✅ **READY FOR INTEGRATION**  
**Next Action**: Start with Phase 1.1 (Bidding Fee & Ledger Integration)

