# Bug Fix: dbAdapter Not Passed to Action Handlers

## Issue Description

The `evalCtx` object passed to action handlers at line 73-77 of `evaluator.ts` did not include the `db` field from the parent context, even though the parent context contains it (set at line 101). This means the `dbAdapter` parameter passed to `evaluateRules` was never accessible to individual action handlers, forcing them to rely solely on the global `dbAdapter` set via `setDbAdapter()`. If `evaluateRules` is called with a specific dbAdapter instance that differs from the global one, action handlers would not use the correct adapter instance.

## Root Cause

1. At line 101, `evalCtx` is created with `db: dbAdapter` included
2. At lines 119-122, `actionEvalCtx` is created using spread operator `...evalCtx`, which correctly includes the `db` field
3. However, inside `defaultActionHandler` (lines 73-77), a new `evalCtx` object was created that explicitly only included `event`, `ctx`, and `ruleId` - **missing the `db` field**

## Fix Applied

### 1. Updated `defaultActionHandler` in `evaluator.ts`

**Before:**
```typescript
const evalCtx = {
  event: context.event,
  ctx: context.ctx,
  ruleId: context.ruleId,
};
```

**After:**
```typescript
const evalCtx = {
  event: context.event,
  ctx: context.ctx,
  ruleId: context.ruleId,
  db: context.db, // Include db adapter from context
  system: context.system, // Include system config for completeness
};
```

### 2. Updated Action Handlers in `actions.ts`

Changed all action handlers to prefer context-specific dbAdapter:

**Before:**
```typescript
await writeAuditEntry(auditEntry, dbAdapter);
```

**After:**
```typescript
await writeAuditEntry(auditEntry, evalCtx?.db || dbAdapter);
```

Also updated `insertBlock` call:
```typescript
const adapter = evalCtx?.db || dbAdapter;
if (adapter && 'insertBlock' in adapter) {
  await (adapter as any).insertBlock({...});
}
```

## Impact

- ✅ Action handlers can now use the context-specific `dbAdapter` when provided
- ✅ Falls back to global `dbAdapter` if context doesn't provide one (backward compatible)
- ✅ Multiple `evaluateRules` calls can now use different dbAdapter instances correctly
- ✅ Better isolation for testing and multi-tenant scenarios

## Files Changed

1. `packages/acs/src/evaluator.ts` - Added `db` and `system` fields to evalCtx
2. `packages/acs/src/actions.ts` - Updated all action handlers to use context dbAdapter

## Testing Recommendations

- Test with different dbAdapter instances in the same process
- Verify backward compatibility with global dbAdapter
- Test action handlers with context-specific adapters

## Status

✅ **FIXED** - All action handlers now correctly use context-specific dbAdapter when available.

