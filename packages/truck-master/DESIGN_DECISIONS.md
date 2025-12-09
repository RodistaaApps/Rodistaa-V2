# Design Decisions - Fleet & Driver Management

## Answers to Design Questions

1. **DL Class Mapping**: Using default mapping
   - LCV → LMV / Transport (LMV-NT)
   - MCV → LMV / HMV (prefer HMV)
   - HCV / Trailers → HMV / Transport (HMV)

2. **Max Co-drivers per truck**: Default = 2 ✅

3. **Allow driver multi-truck overlapping assignments**: Default = NO ✅
   - Configurable via `ALLOW_DRIVER_MULTI_TRUCK_OVERLAP` (default: false)

4. **Require Aadhaar for drivers**: Optional (but hash if provided) ✅

5. **Auto-notify drivers**: SMS only (mock provider) ✅
   - Can be extended to push notifications later

6. **Operator vs Franchise ownership**: Drivers belong to operator, NOT shared ✅

7. **Force-assign policy**: Yes, bypass DL expiry checks with audit ✅

8. **Background check integration**: Adapter/mock (no vendor specified) ✅

9. **Driver document retention**: 7 years ✅

10. **Local/state specific rules**: None specified, using defaults ✅

---

**Implementation Date**: 2025-01-XX

