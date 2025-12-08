# Driver Management Policy

## DL Class Mapping

### Truck Category → Required DL Classes

| Truck Category | Required DL Classes | Priority |
|---------------|---------------------|----------|
| LCV | LMV, LMV-NT, Transport | LMV preferred |
| MCV | HMV, LMV | HMV preferred |
| HCV | HMV, Transport | HMV preferred |
| TRAILER | HMV, Transport | HMV preferred |

### Co-Driver Rules

- Co-driver must have DL class same or higher than primary driver
- Maximum 2 co-drivers per truck (configurable)
- Co-drivers cannot be same as primary driver

## Assignment Constraints

### Driver Eligibility

1. **DL Expiry**: DL must be valid until assignment end date
   - Warning if expires within 30 days
   - Blocking if expired (unless force-assigned)

2. **Driver Status**: Driver must be `is_active = TRUE`

3. **Driver Flags**: Drivers with blocking flags cannot be assigned:
   - `DL_EXPIRED` (CRITICAL)
   - `BACKGROUND_ISSUE` (HIGH/CRITICAL)

4. **Availability**: Driver must not have conflicting availability blocks

5. **Operator Match**: Driver must belong to same operator (unless HQ override)

### Assignment Rules

1. **One Active Assignment Per Truck**: Only one active assignment allowed per truck
   - Enforced via database constraint
   - New assignment must end existing one first (or force-assign)

2. **Multi-Truck Overlap**: By default, drivers cannot have overlapping assignments
   - Configurable via `ALLOW_DRIVER_MULTI_TRUCK_OVERLAP` (default: false)
   - If false, assignment rejected if driver has conflicting assignment

3. **Co-Driver Limit**: Maximum 2 co-drivers (configurable via `MAX_CO_DRIVERS`)

## Force Assignment Policy

### HQ Admin Override

- HQ admins can force-assign drivers even with:
  - Expired DL
  - Blocking flags
  - Overlapping assignments
  - Operator mismatch

- Force assignment requires:
  - `force_assigned = true`
  - `force_assignment_reason` (mandatory)
  - Audit log entry
  - Warnings returned in response

## Background Checks

### DL Verification

- External DL verification via adapter (mockable)
- Failed verification creates `DL_VERIFICATION_FAILED` flag
- Flag blocks assignment until resolved manually

### Document Verification

- Medical certificate: Required for some operators
- Police verification: Optional, flagged if pending
- Documents encrypted at rest with 7-year retention

## Availability Policy

### Blocks

- Drivers can mark themselves unavailable (sick, leave, personal)
- Blocking periods prevent assignment during that window
- Override possible via force-assignment

## Retention Rules

- Driver documents: 7 years
- Assignment history: 7 years
- Audit logs: 7 years
- Flags history: 7 years

## Notification Policy

### Auto-Notifications

- Assignment created → SMS to primary + co-drivers
- Assignment ended → SMS to drivers
- DL expiring soon → SMS warning (30 days before)

### Channels

- Primary: SMS (mockable, can integrate Twilio/AWS SNS)
- Future: Push notifications (if mobile app available)

---

**Last Updated**: 2025-01-XX

