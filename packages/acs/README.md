# Rodistaa Anti-Corruption Shield (ACS)

The Anti-Corruption Shield is a declarative policy engine that evaluates events against rules and executes actions in real-time. It provides fraud detection, compliance enforcement, and risk management capabilities.

## Features

- **Declarative Rule Engine**: YAML-based rule definitions with Jexl condition expressions
- **Real-time Evaluation**: Synchronous rule evaluation for critical paths
- **Action Handlers**: Comprehensive set of actions (freeze, block, ticket, audit, etc.)
- **Audit Chain**: Immutable, hash-chained audit logs with tamper detection
- **KMS Signing**: Local KMS stub for signing audit entries (HMAC-SHA256)
- **Rule Linting**: Static analysis to prevent unsafe expressions
- **Hot Reload**: Watch mode for development

## Quick Start

### Installation

```bash
cd packages/acs
pnpm install
pnpm build
```

### Load and Evaluate Rules

```typescript
import { loadRulesFromFile, evaluate } from '@rodistaa/acs';

// Load rules
const rules = loadRulesFromFile('./acs_rules_top25.yaml');

// Evaluate an event
const decisions = await evaluate(
  {
    type: 'gps.ping',
    gps: { deltaDistanceKm: 250, deltaTimeSec: 200 },
    shipment: { id: 'SH-...' }
  },
  { userId: 'USR-...', deviceId: 'dev-123' },
  { config: { /* system config */ } }
);

console.log(`Matched ${decisions.length} rules`);
```

### Rule Linting

```bash
# Lint rules file
pnpm rule-lint acs_rules_top25.yaml

# Or via Node.js
node dist/ruleLint.js acs_rules_top25.yaml
```

### Test Event CLI

```bash
# Test GPS jump anomaly
pnpm test-event gps-jump

# Test POD duplicate
pnpm test-event pod-duplicate

# Test OTP brute force
pnpm test-event otp-brute-force

# Test inspection geo missing
pnpm test-event inspection-geo

# Test KYC mandatory
pnpm test-event kyc-mandatory
```

## Adding Rules

### Rule Structure

Each rule in `acs_rules_top25.yaml` has the following structure:

```yaml
- id: RF01_MY_RULE
  priority: 1000          # Higher = evaluated first
  severity: critical      # low | medium | high | critical
  description: "Rule description"
  condition: "event.type == 'my.event' && ctx.userRole == 'admin'"
  action:
    - rejectRequest: { code: "MY_ERROR", message: "Error message" }
    - emitEvent: { name: "my.event.triggered", payload: {...} }
  audit: true             # Create audit entry on match
```

### Condition DSL

Rules use Jexl expressions with access to:
- `event.*` - Event data (type, payload, etc.)
- `ctx.*` - Request context (userId, userRole, deviceId, etc.)
- `system.*` - System configuration
- `db.*` - Database queries (indexes, counts, etc.)

**Example conditions:**
```javascript
// Simple boolean
"event.type == 'gps.ping'"

// Array membership
"ctx.userRole in ['shipper', 'operator']"

// Comparison operators
"gps.deltaDistanceKm >= 200 && gps.deltaTimeSec <= 300"

// Function calls
"db.count.trucksByOperator(ctx.operatorId) >= system.config.maxTrucksPerOperator"
```

### Available Actions

- `freezeShipment` - Freeze a shipment (prevent actions)
- `blockEntity` - Block an entity (user, truck, device)
- `createTicket` - Create a support/fraud ticket
- `emitEvent` - Emit an internal event
- `rejectRequest` - Reject the current request
- `flagWatchlist` - Add entity to watchlist
- `requireManualReview` - Flag for manual review
- `redactField` - Redact sensitive fields
- `throttle` - Rate limit an entity
- `notifyRole` - Send notification to role
- `suspendAccount` - Suspend user account

## Rule Linting

The rule linter performs static analysis to ensure rules are safe:

**Checks:**
- No forbidden functions (eval, spawn, require, etc.)
- Expression complexity threshold (max 50 nodes)
- Required fields present (id, condition, action)
- Valid action types
- Condition compiles successfully

**Run linting:**
```bash
pnpm rule-lint acs_rules_top25.yaml
```

## Audit Logging

All audit entries are:
- **Immutable**: SHA256 hash prevents tampering
- **Chained**: `prev_hash` links to previous entry for same entity
- **Signed**: KMS signature (HMAC-SHA256) for additional protection
- **Canonical**: Deterministic JSON (sorted keys) for consistent hashing

### Audit Chain

Each audit entry links to the previous entry for the same entity:

```
Entry 1: { hash: "abc123", prev_hash: null }
Entry 2: { hash: "def456", prev_hash: "abc123" }
Entry 3: { hash: "ghi789", prev_hash: "def456" }
```

This creates an immutable chain where any modification breaks the chain.

### Querying Audit Logs

```sql
-- Get latest audit entries
SELECT id, rule_id, created_at, audit_hash, prev_hash 
FROM audit_logs 
ORDER BY timestamp DESC 
LIMIT 5;

-- Get audit chain for an entity
SELECT id, audit_hash, prev_hash, timestamp
FROM audit_logs
WHERE entity_type = 'shipment' AND entity_id = 'SH-...'
ORDER BY timestamp ASC;
```

## Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test evaluator.test.ts
```

### Test Vectors

The test suite includes test vectors for all top-25 rules:

- **RF01**: KYC mandatory check
- **RF05**: GPS jump anomaly (250km in 200s)
- **RF07**: POD duplicate hash detection
- **RF09**: Inspection geo missing
- **RF04**: OTP brute force protection

See `src/cli/test-event.ts` for test event definitions.

## Development

### Watch Mode

Enable hot reload during development:

```typescript
import { watchRulesFile } from '@rodistaa/acs';

watchRulesFile('./acs_rules_top25.yaml', (rules) => {
  console.log(`Reloaded ${rules.length} rules`);
});
```

### Local KMS

The ACS uses a local KMS stub for development. Set `LOCAL_KMS_KEY_ID` environment variable:

```bash
export LOCAL_KMS_KEY_ID=audit-signing-key-dev
```

In production, replace with AWS KMS, GCP KMS, or Azure Key Vault.

## Integration

### Backend Integration

```typescript
import { loadRulesFromFile, evaluate } from '@rodistaa/acs';
import { PostgresDbAdapter } from '@rodistaa/acs';
import { AuditRepository } from '@rodistaa/backend/repo/auditRepo';

// Load rules on startup
loadRulesFromFile('./acs_rules_top25.yaml');

// Setup DB adapter
const auditRepo = new AuditRepository(knex);
const dbAdapter = new PostgresDbAdapter(async (text, params) => {
  return await knex.raw(text, params);
});

dbAdapter.setGetLastAuditHash(async (entityType, entityId) => {
  return await auditRepo.getLastAuditHash(entityType, entityId);
});

// Evaluate in route handler
const decisions = await evaluate(event, ctx, systemConfig, undefined, dbAdapter);
```

### Middleware Example

```typescript
app.post('/shipments/:id/ping', async (req, res) => {
  const event = {
    type: 'gps.ping',
    gps: req.body.gps,
    shipment: { id: req.params.id }
  };
  
  const decisions = await evaluate(event, req.ctx, systemConfig, undefined, dbAdapter);
  
  // Check for rejections
  const rejection = decisions.find(d => 
    d.actionResults?.some(ar => ar.action === 'rejectRequest')
  );
  
  if (rejection) {
    return res.status(400).json(rejection.actionResults[0].payload);
  }
  
  // Proceed with normal flow
  // ...
});
```

## Architecture

```
┌─────────────────┐
│  Event Source   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Rule Loader   │ (YAML → Compiled Jexl)
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Evaluator     │ (Event → Rule Match → Decision[])
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Action Handlers │ (Execute actions: freeze, block, etc.)
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Audit Writer   │ (Immutable hash-chained audit log)
└─────────────────┘
```

## Security Considerations

1. **Expression Sandboxing**: Jexl expressions are sandboxed; no eval() or dynamic code execution
2. **Forbidden Functions**: Linter prevents unsafe operations
3. **Audit Integrity**: Hash chain ensures tamper detection
4. **KMS Signing**: Additional layer of protection via signed hashes
5. **Idempotency**: All actions are idempotent (safe retries)

## Troubleshooting

### Rule not matching

1. Check rule condition syntax with rule linter
2. Verify event structure matches condition expectations
3. Check rule priority (higher priority rules evaluated first)
4. Enable debug logging: `LOG_LEVEL=debug`

### Audit entry not persisted

1. Verify DB adapter is configured
2. Check database connection
3. Verify audit_logs table exists and has required columns
4. Check logs for database errors

### KMS signing fails

1. Verify `LOCAL_KMS_KEY_ID` environment variable is set
2. Check KMS key exists in local KMS store
3. In production, verify cloud KMS credentials

## License

Copyright © 2024 Rodistaa. All rights reserved.

