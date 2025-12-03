# ACS Hardening Verification Guide

This document provides exact commands and expected outputs for verifying the ACS hardening implementation.

## Prerequisites

```bash
# Install dependencies
cd packages/acs
pnpm install
pnpm build
```

## 1. Unit Tests

Run all ACS unit tests:

```bash
cd packages/acs
pnpm test
```

**Expected Output:**
```
PASS  src/evaluator.test.ts
PASS  src/ruleLoader.test.ts
PASS  src/ruleLint.test.ts
PASS  src/auditWriter.test.ts
PASS  src/actions.test.ts
PASS  src/dbAdapter.test.ts

Test Suites: 6 passed, 6 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        3.234 s
```

## 2. Rule Linting

Lint the rules file:

```bash
cd packages/acs
pnpm rule-lint ../../acs_rules_top25.yaml
```

**Expected Output:**
```
🔍 ACS Rule Linter

File: ../../acs_rules_top25.yaml

✅ All checks passed!
```

**If errors found:**
```
🔍 ACS Rule Linter

File: ../../acs_rules_top25.yaml

❌ Errors:
   [RF01_KYC_MANDATORY] Rule 'RF01_KYC_MANDATORY' condition uses forbidden functions: eval
   
❌ Linting failed
```

## 3. Test Event CLI

### GPS Jump Anomaly (RF05)

```bash
cd packages/acs
pnpm test-event gps-jump
```

**Expected Output:**
```
🔍 ACS Test Event Evaluator

Testing event type: gps-jump

📋 Loading rules from: C:\...\acs_rules_top25.yaml
✅ Loaded 25 rules

📤 Test Event:
{
  "event": {
    "type": "gps.ping",
    "gps": {
      "deltaDistanceKm": 250,
      "deltaTimeSec": 200
    },
    "shipment": {
      "id": "SH-01ARZ3NDEKTSV4RRFFQ69G5FAV"
    }
  },
  ...
}

⚠️  Results:

Matched 1 rule(s):

  Rule ID: RF05_GPS_JUMP_ANOMALY
  Description: Detect improbable GPS jump (very large distance in short time).
  Severity: high
  Priority: 980
  Matched: true
  Evaluation Result: true
  Action Results:
    [1] {
      "ok": true,
      "shipmentId": "SH-01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "reason": "GPS_JUMP",
      "auditId": "AUD-...",
      "timestamp": "2024-02-01T..."
    }
  Audit ID: AUD-...

✅ Test complete!
```

### POD Duplicate (RF07)

```bash
pnpm test-event pod-duplicate
```

**Expected Output:**
```
🔍 ACS Test Event Evaluator

Testing event type: pod-duplicate

📋 Loading rules from: C:\...\acs_rules_top25.yaml
✅ Loaded 25 rules

⚠️  Results:

Matched 1 rule(s):

  Rule ID: RF07_POD_DUPLICATE_HASH
  Description: Reject POD reuse based on exact file-hash matches across shipments.
  Severity: high
  Priority: 970
  ...
```

### OTP Brute Force (RF04)

```bash
pnpm test-event otp-brute-force
```

**Expected Output:**
```
Matched 1 rule(s):

  Rule ID: RF04_OTP_BRUTE_FORCE_PROTECTION
  Description: Lock shipment and escalate when OTP retry threshold exceeded (brute-force).
  ...
```

### Inspection Geo Missing (RF09)

```bash
pnpm test-event inspection-geo
```

**Expected Output:**
```
Matched 1 rule(s):

  Rule ID: RF09_INSPECTION_GEO_MISSING
  Description: Reject inspection uploads missing geotag or with invalid geolocation.
  ...
```

## 4. Database Migration

Run migration to add prev_hash and signature fields:

```bash
cd packages/backend
pnpm knex migrate:latest
```

**Expected Output:**
```
Batch 1 run: 1 migrations
20240201000001_enhance_audit_logs
```

## 5. Audit Log Verification

### Query Latest Audit Entries

```sql
SELECT id, rule_id, entity_type, entity_id, action, created_at, audit_hash, prev_hash, signature
FROM audit_logs
ORDER BY timestamp DESC
LIMIT 5;
```

**Expected Output:**
```
id                  | rule_id              | entity_type | entity_id        | action        | created_at          | audit_hash | prev_hash | signature
--------------------|----------------------|-------------|------------------|---------------|---------------------|------------|-----------|----------
AUD-01ARZ3ND...     | RF05_GPS_JUMP_ANOMALY| shipment    | SH-01ARZ3ND...   | FREEZE        | 2024-02-01 10:30:00 | abc123...  | def456... | xyz789...
AUD-01ARZ3ND...     | RF07_POD_DUPLICATE   | shipment    | SH-01ARZ3ND...   | FREEZE        | 2024-02-01 10:29:00 | def456...  | ghi789... | mno123...
...
```

### Verify Audit Chain

```sql
-- Get audit chain for a specific entity
SELECT id, audit_hash, prev_hash, timestamp
FROM audit_logs
WHERE entity_type = 'shipment' AND entity_id = 'SH-01ARZ3NDEKTSV4RRFFQ69G5FAV'
ORDER BY timestamp ASC;
```

**Expected Output:**
```
id                  | audit_hash | prev_hash | timestamp
--------------------|------------|-----------|------------------
AUD-001             | hash1      | NULL      | 2024-02-01 10:00:00
AUD-002             | hash2      | hash1     | 2024-02-01 10:01:00
AUD-003             | hash3      | hash2     | 2024-02-01 10:02:00
```

### Verify Audit Hash Integrity

```typescript
import { verifyAuditHash } from '@rodistaa/acs';

const entry = await auditRepo.getAuditEntriesByEntity('shipment', 'SH-...');
const isValid = verifyAuditHash(entry[0]);
console.log(`Audit hash valid: ${isValid}`); // true
```

## 6. End-to-End Test

### Run Comprehensive Test

```bash
cd packages/acs
node dist/cli/test-event.js gps-jump
```

Then verify audit entry was created:

```sql
SELECT id, rule_id, audit_hash, prev_hash, signature
FROM audit_logs
WHERE rule_id = 'RF05_GPS_JUMP_ANOMALY'
ORDER BY timestamp DESC
LIMIT 1;
```

**Expected:**
- `audit_hash` is non-empty (64 hex chars)
- `signature` is non-empty (128 hex chars for HMAC-SHA256)
- `prev_hash` is either NULL (first entry) or links to previous entry

## 7. Rule Coverage Verification

Verify all 25 rules are present:

```bash
cd packages/acs
node -e "
const { loadRulesFromFile } = require('./dist/ruleLoader');
const rules = loadRulesFromFile('../../acs_rules_top25.yaml');
console.log('Total rules:', rules.length);
console.log('Rule IDs:', rules.map(r => r.id).join(', '));
"
```

**Expected Output:**
```
Total rules: 25
Rule IDs: RF01_KYC_MANDATORY, RF02_TRUCK_DOCS_EXPIRED, RF03_OTP_MANDATORY_COMPLETION, ...
```

## 8. CI Integration

### Local CI Check

```bash
# Run all checks
cd packages/acs
pnpm build
pnpm test
pnpm rule-lint ../../acs_rules_top25.yaml

# Verify test-event works
pnpm test-event gps-jump
```

All should exit with code 0.

## 9. Rollback Script Test

```bash
cd packages/acs
node dist/scripts/unapply-rule.js RF05_GPS_JUMP_ANOMALY
```

**Expected Output:**
```
⚠️  Disabling rule: RF05_GPS_JUMP_ANOMALY
✅ Rule moved to .disabled/rules/
✅ Audit entry created: AUD-...
```

## 10. Watch Mode Test

```bash
cd packages/acs
pnpm dev
```

In another terminal, modify `acs_rules_top25.yaml`. The watcher should reload rules automatically.

**Expected Output:**
```
[acs-rule-loader] Loading ACS rule file
[acs-rule-loader] Loaded ACS rules
[acs-rule-loader] Rules reloaded via watch
```

## Troubleshooting

### Tests Fail

1. Ensure all dependencies are installed: `pnpm install`
2. Build packages: `pnpm build`
3. Check database connection if using Postgres adapter

### Rule Linting Errors

1. Check YAML syntax
2. Verify no forbidden functions in conditions
3. Ensure all required fields are present

### Audit Logs Not Persisted

1. Verify database connection
2. Check audit_logs table exists with required columns
3. Verify DB adapter is configured correctly

### KMS Signing Issues

1. Check `LOCAL_KMS_KEY_ID` environment variable
2. Verify local KMS key exists
3. In production, verify cloud KMS credentials

## Success Criteria

✅ All unit tests pass (45+ tests)
✅ Rule linting returns zero errors
✅ Test event CLI shows matched rules for all test vectors
✅ Audit entries have non-empty hash and signature
✅ Database migration adds prev_hash and signature columns
✅ Audit chain links prev_hash correctly
✅ All 25 rules are present and valid

## Next Steps

After verification:
1. Merge PR to `develop`
2. Run integration tests
3. Deploy to staging
4. Monitor audit logs in production
