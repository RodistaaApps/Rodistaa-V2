# ACS Action Coverage Audit

## Actions Used in `acs_rules_top25.yaml`

Based on analysis of all 25 rules:

### ✅ Implemented Actions (10)

1. **freezeShipment** - ✅ `freezeShipmentAction`
   - Used in: RF05, RF06, RF07, RF18
   
2. **blockEntity** - ✅ `blockEntityAction`
   - Used in: RF02, RF04, RF06, RF11, RF25
   
3. **createTicket** - ✅ `createTicketAction`
   - Used in: RF02, RF04, RF06, RF08, RF10, RF11, RF14, RF17, RF18, RF21, RF24, RF25
   
4. **emitEvent** - ✅ `emitEventAction`
   - Used in: RF01, RF03, RF04, RF05, RF07, RF09, RF13, RF14, RF19, RF20, RF22, RF23, RF25
   
5. **rejectRequest** - ✅ `rejectRequestAction`
   - Used in: RF01, RF02, RF03, RF08, RF09, RF10, RF12, RF13, RF16, RF17, RF19, RF21, RF22, RF24
   
6. **flagWatchlist** - ✅ `flagWatchlistAction`
   - Used in: RF07, RF10, RF16, RF17, RF21, RF24
   
7. **requireManualReview** - ✅ `requireManualReviewAction`
   - Used in: RF25
   
8. **redactField** - ✅ `redactFieldAction`
   - Used in: RF16
   
9. **throttle** - ✅ `throttleAction`
   - Used in: RF20
   
10. **notifyRole** - ✅ `notifyRoleAction`
    - Used in: RF05, RF12

### ⚠️ Actions in Rules but NOT Implemented (2)

1. **suspendAccount** - ❌ NOT IMPLEMENTED
   - Used in: RF18 (triad collusion)
   - Severity: HIGH - Critical action for fraud prevention
   
2. **proceed** - ⚠️ SPECIAL CASE
   - Used in: RF15, RF23
   - This is a control-flow action (not a side-effect)
   - May be handled by evaluator logic rather than action handler

## Recommendations

### Priority 1: Implement Missing Actions

1. **suspendAccount**
   - Action: Suspend user account temporarily or permanently
   - Database: Update `users` table, set `is_active = false`, `suspended_until` timestamp
   - Audit: Log suspension with reason and severity
   - Recovery: Admin override capability

2. **proceed** (if needed)
   - May already be handled by evaluator logic
   - If explicit handler needed, implement as pass-through with logging

### Priority 2: Verify Action Handler Signatures

All implemented actions should match expected interface:
```typescript
async function actionName(payload: any, evalCtx: any): Promise<ActionResult>
```

### Priority 3: Add Missing Exports

Verify all action handlers are exported in `actionHandlers` map in `evaluator.ts`.

## Summary

- **10/12 actions** implemented (83% coverage)
- **2 actions** missing: `suspendAccount` (critical), `proceed` (special case)
- **Recommendation**: Implement `suspendAccount` before production deployment

All critical fraud-prevention actions are covered except account suspension.

