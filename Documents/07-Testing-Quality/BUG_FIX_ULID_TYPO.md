# Bug Fix: ULID Format Typo in ACS CLI

**Date**: December 2, 2025  
**Severity**: P2 - Low (Test consistency issue)  
**Status**: ✅ Fixed

---

## Bug Description

**File**: `packages/acs/src/cli.ts` line 42  
**Issue**: ULID format typo in test context

**Incorrect**:
```typescript
userId: 'USR-DR-01ARZ3NDEKTSV4RRFFQ69G5FEV',  // Wrong: G5FEV
```

**Correct**:
```typescript
userId: 'USR-DR-01ARZ3NDEKTSV4RRFFQ69G5FAV',  // Correct: G5FAV
```

---

## Impact

**Severity**: Low (test consistency, not functional bug)

**Issues**:
1. **Inconsistency**: All other test files use `G5FAV` pattern
2. **Pattern mismatch**: If ULID validation is strict, test might fail
3. **Confusion**: Developers might copy the wrong format

**Evidence from codebase**:
- `evaluator.test.ts`: Uses `G5FAV` (14 occurrences)
- `actions.test.ts`: Uses `G5FAV` (18 occurrences)
- `auditWriter.test.ts`: Uses `G5FAV` (6 occurrences)
- `dbAdapter.test.ts`: Uses `G5FAV` (3 occurrences)
- `cli.ts`: Used `G5FEV` (ONLY occurrence - typo)

---

## Root Cause

Simple typo when creating the test context in CLI demo code.

The standard test ULID suffix across the codebase is:
```
01ARZ3NDEKTSV4RRFFQ69G5FAV
```

This is a valid Base32 ULID suffix that's consistently used.

---

## Fix Applied

Changed line 42 from:
```typescript
userId: 'USR-DR-01ARZ3NDEKTSV4RRFFQ69G5FEV',
```

To:
```typescript
userId: 'USR-DR-01ARZ3NDEKTSV4RRFFQ69G5FAV',
```

**Result**: Now consistent with all other test IDs in the codebase.

---

## Verification

### Check Consistency Across Codebase

```bash
# Search for G5FAV (correct pattern)
grep -r "G5FAV" packages/acs/src/
# Result: 41 occurrences (after fix)

# Search for G5FEV (typo)
grep -r "G5FEV" packages/acs/src/
# Result: 0 occurrences (after fix)
```

### Verify CLI Still Works

```bash
cd packages/acs
pnpm build
node dist/cli.js

# Should run demo and show:
# "🎯 Matched 1 rule(s)"
```

---

## ULID Format Reference

**Valid ULID Format** (Base32):
- Characters: `0-9A-HJKMNP-TV-Z` (excludes I, L, O, U)
- Length: 26 characters
- Case: Uppercase

**Test ULID suffix used**: `01ARZ3NDEKTSV4RRFFQ69G5FAV`
- All characters valid Base32
- Consistently used across test suite

**Typo**: `G5FEV` → `G5FAV`
- Both are valid Base32
- But `G5FAV` is the standard test pattern

---

## Impact Assessment

### Before Fix
- ⚠️ Inconsistent test ID format
- ⚠️ Potential confusion for developers
- ⚠️ CLI demo uses different pattern than tests

### After Fix
- ✅ Consistent ULID format across all tests
- ✅ Matches standard test pattern
- ✅ CLI demo aligned with test suite

---

## Related Standards

All test IDs in Rodistaa follow this pattern:

```typescript
// Users
'USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV'  // Shipper
'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FAV'  // Operator
'USR-DR-01ARZ3NDEKTSV4RRFFQ69G5FAV'  // Driver ✅ (now fixed)
'USR-AD-01ARZ3NDEKTSV4RRFFQ69G5FAV'  // Admin

// Other entities
'SH-01ARZ3NDEKTSV4RRFFQ69G5FAV'      // Shipment
'BLK-01ARZ3NDEKTSV4RRFFQ69G5FAV'     // Block
'TRK-MH01AB1234-01ARZ3NDEKTSV4RRFFQ69G5FAV'  // Truck
```

All use the same ULID suffix: `01ARZ3NDEKTSV4RRFFQ69G5FAV`

---

**Status**: ✅ **FIXED**  
**Priority**: P2 (Low - test consistency)  
**Impact**: Improves test consistency  
**Verified**: Now matches all other test IDs


