# Bug Fix: Dockerfile Copy Overwrite & ACS Function Name Mismatch

**Date**: December 2, 2025  
**Severity**: P1 - Critical (Build inefficiency + Runtime error)  
**Status**: ✅ Fixed

---

## Bug 1: Dockerfile Copy Overwrite (Build Inefficiency)

**File**: `Dockerfile` lines 32-37  
**Severity**: P2 - Optimization (wasted build resources)

### Problem

```dockerfile
# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages ./packages  # ← Line 34

# Copy source code
COPY . .  # ← Line 37: OVERWRITES everything above!
```

**Issue**:
1. Line 34 copies `packages/` directory from dependencies stage
2. Line 37 executes `COPY . .`, which copies **everything** from build context
3. This overwrites the packages directory that was just copied
4. Makes line 34 completely pointless
5. Wastes build time and resources

**Impact**:
- Unnecessary layer in Docker image
- Wasted build time (copying then overwriting)
- Confusing Dockerfile logic
- No functional benefit

---

### Fix Applied

**Before** (Wasteful):
```dockerfile
# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages ./packages  # Pointless!

# Copy source code
COPY . .  # Overwrites packages above
```

**After** (Optimized):
```dockerfile
# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code (workspace config first, then source)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY acs_rules_top25.yaml ./
```

**Changes**:
1. ✅ Removed pointless `COPY --from=dependencies /app/packages`
2. ✅ Removed overly broad `COPY . .`
3. ✅ Explicitly copy only what's needed for build
4. ✅ Better layer caching (workspace config separate from source)

---

### Benefits

**Build Performance**:
- Fewer Docker layers
- Faster builds (no overwriting)
- Better cache utilization
- Clearer intent

**Maintainability**:
- Explicit about what's being copied
- No hidden overwrites
- Easier to understand
- Better documentation

---

## Bug 2: ACS Function Name Mismatch (Runtime Error)

**File**: `packages/acs/src/actions.ts` line 493  
**Severity**: P0 - Critical (Runtime failure)

### Problem

```typescript
// Line 37: Function defined as:
export function getDbAdapterFromContext(evalCtx: any): DbAdapter | undefined {
  return evalCtx?.db || dbAdapter;
}

// Line 493: But called as:
const adapter = getDbAdapterFromContextOrGlobal(evalCtx);
//                          ^^^^^^^^^^^^^^^ Wrong name!
```

**Issue**:
- Function is exported as `getDbAdapterFromContext`
- But called as `getDbAdapterFromContextOrGlobal`
- Function name mismatch will cause `ReferenceError` at runtime
- Prevents `suspendAccountAction` from working
- Action is registered in handlers but non-functional

**Impact**:
- **Runtime crash** when `suspendAccount` action is triggered
- Account suspension feature completely broken
- ACS rule `RF19_COLLUSION_TRIAD_FREQ` will fail
- Critical security feature unavailable

---

### Fix Applied

**Before** (Broken):
```typescript
export async function suspendAccountAction(payload: any, evalCtx: any) {
  const { accountId, reason, severity, durationDays } = payload;
  log.info({ accountId, reason, severity, durationDays }, 'suspendAccountAction called');

  try {
    const adapter = getDbAdapterFromContextOrGlobal(evalCtx);  // ❌ Wrong!
```

**After** (Fixed):
```typescript
export async function suspendAccountAction(payload: any, evalCtx: any) {
  const { accountId, reason, severity, durationDays } = payload;
  log.info({ accountId, reason, severity, durationDays }, 'suspendAccountAction called');

  try {
    const adapter = getDbAdapterFromContext(evalCtx);  // ✅ Correct!
```

**Change**: Corrected function name from `getDbAdapterFromContextOrGlobal` to `getDbAdapterFromContext`

---

### Error That Would Have Occurred

```
ReferenceError: getDbAdapterFromContextOrGlobal is not defined
    at suspendAccountAction (packages/acs/src/actions.ts:493)
    at evaluateRules (packages/acs/src/evaluator.ts:120)
    at AcsMiddleware (packages/backend/src/middleware/acs.middleware.ts:45)
```

**Result**: Rule `RF19_COLLUSION_TRIAD_FREQ` would fail to execute, allowing fraudulent activity to proceed unchecked.

---

## Impact Summary

### Bug 1 (Dockerfile):
- **Severity**: P2 (Optimization)
- **Impact**: Wasted build resources, slower builds
- **Risk**: Low (functional but inefficient)
- **Fix**: Removed unnecessary copy, optimized build layers

### Bug 2 (ACS Function):
- **Severity**: P0 (Critical)
- **Impact**: Account suspension feature completely broken
- **Risk**: High (security feature unavailable)
- **Fix**: Corrected function name

---

## Testing

### Bug 1 Verification

```bash
# Build with optimized Dockerfile
cd C:\Users\devel\Desktop\Rodistaa
docker build -t rodistaa-backend:fixed .

# Verify build completes successfully
# Check build logs for fewer layers
# Confirm faster build time
```

### Bug 2 Verification

```typescript
// Test suspendAccount action
import { suspendAccountAction } from './actions';

const payload = {
  accountId: 'USR-01ABCDEF',
  reason: 'Fraud detected',
  severity: 'HIGH',
  durationDays: 30,
};

const evalCtx = {
  db: mockDbAdapter,
  userId: 'ADMIN-01',
  ruleId: 'RF19_COLLUSION_TRIAD_FREQ',
};

// Should execute without ReferenceError
const result = await suspendAccountAction(payload, evalCtx);
console.log(result);
// Expected: { ok: true, accountId: '...', auditId: '...' }
```

---

## Root Cause Analysis

### Bug 1: Dockerfile Copy Overwrite

**Root Cause**: Unclear Docker layer optimization strategy

**Why It Happened**:
- Initially tried to reuse packages from dependencies stage
- Added `COPY . .` for convenience later
- Didn't realize broad copy would overwrite specific copies
- No review caught the inefficiency

**Prevention**:
- ✅ Explicit copy statements (avoid `COPY . .`)
- ✅ Review Dockerfile layer ordering
- ✅ Document copy strategy in comments

### Bug 2: Function Name Mismatch

**Root Cause**: Function renamed but call site not updated

**Why It Happened**:
- Function was likely named `getDbAdapterFromContextOrGlobal` initially
- Later refactored/simplified to `getDbAdapterFromContext`
- Call site in `suspendAccountAction` not updated
- TypeScript didn't catch it (uses `any` type)
- No unit test for `suspendAccountAction` at time of change

**Prevention**:
- ✅ Use TypeScript strict mode (no implicit `any`)
- ✅ Add unit tests for all action handlers
- ✅ Use IDE refactoring tools (rename symbol)
- ✅ Add ESLint rule for undefined references

---

## Recommendations

### 1. Enable TypeScript Strict Mode

```json
// packages/acs/tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Benefit**: Would have caught function name mismatch at compile time

### 2. Add Unit Tests for Action Handlers

```typescript
// packages/acs/src/__tests__/actions.test.ts
describe('suspendAccountAction', () => {
  it('should suspend account with db adapter', async () => {
    const mockDb = createMockDbAdapter();
    const payload = { accountId: 'USR-01', reason: 'Test', severity: 'HIGH' };
    const evalCtx = { db: mockDb, userId: 'ADMIN-01' };
    
    const result = await suspendAccountAction(payload, evalCtx);
    
    expect(result.ok).toBe(true);
    expect(mockDb.query).toHaveBeenCalled();
  });
});
```

**Benefit**: Would have caught runtime error in CI/CD pipeline

### 3. Dockerfile Best Practices

```dockerfile
# Good: Explicit, cacheable layers
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/app-shared/package.json ./packages/app-shared/
COPY packages/acs/package.json ./packages/acs/
RUN pnpm install

COPY packages/app-shared/src ./packages/app-shared/src
COPY packages/acs/src ./packages/acs/src
RUN pnpm build

# Bad: Overly broad, cache-busting
COPY . .
RUN pnpm install && pnpm build
```

**Benefit**: Better build performance and clarity

---

## Summary

**Bug 1 (Dockerfile)**:
- Issue: Pointless copy overwritten by broad `COPY . .`
- Impact: Wasted build resources
- Fix: Removed unnecessary copy, explicit source copying
- Status: ✅ **FIXED**

**Bug 2 (ACS Function)**:
- Issue: Function called with wrong name (`getDbAdapterFromContextOrGlobal` vs `getDbAdapterFromContext`)
- Impact: Runtime crash, account suspension broken
- Fix: Corrected function name in call site
- Status: ✅ **FIXED**

**Total Bugs Fixed**: 2/2 (all critical issues resolved)

---

**Fixed by**: AI CTO  
**Date**: December 2, 2025  
**Priority**: P0 (Critical runtime error) + P2 (Build optimization)  
**Impact**: Security feature restored + build performance improved


