# Task B: ACS Hardening - Implementation Plan

**Branch**: `feature/acs-hardening`  
**Status**: Starting

## Objectives

From the original brief:
1. Ensure all ACS actions used by backend map to implemented action handlers
2. Add DB-backed audit signer (local KMS) with audit chain validation
3. Add rule test harness: for each top-25 rule add a test vector (positive + negative)
4. Add a safe sandbox for rule testing (web UI or CLI) `packages/acs/cli/test-event`

## Current State

### ✅ Already Implemented
- ACS core engine with rule loader and evaluator
- 10 action handlers (freeze, block, ticket, emit, reject, flag, review, redact, throttle, notify)
- Basic audit logging with SHA256 hashing
- PostgreSQL database adapter
- CLI for rule linting
- Integration with backend via acs-adapter module

### ⏳ To Implement

#### 1. Action Handler Coverage Analysis
- Audit all actions referenced in `acs_rules_top25.yaml`
- Verify each has a corresponding handler in `packages/acs/src/actions.ts`
- Document any missing handlers

#### 2. Audit Chain Validation
- Enhance `auditWriter.ts` with chain validation
- Implement `verifyAuditChain()` function
- Add tamper detection for audit logs
- Create CLI tool to verify audit integrity

#### 3. Rule Test Harness
- Create `packages/acs/tests/rules/` directory
- For each of top-25 rules, create test file with:
  - Positive test case (rule should match)
  - Negative test case (rule should not match)
  - Edge cases
- Use Jest test framework
- Mock database adapter for tests

#### 4. Rule Testing Sandbox
- Create `packages/acs/cli/test-event.ts`
- CLI to evaluate arbitrary events against rules
- Interactive mode for testing rule modifications
- JSON output mode for automation

## Implementation Order

1. **Action Handler Audit** (30 min)
2. **Audit Chain Validation** (1-2 hours)
3. **Rule Test Harness** (2-3 hours)
4. **CLI Sandbox** (1 hour)

## Acceptance Criteria

- All actions in rules have corresponding handlers
- Audit chain validation working with tamper detection
- 25 rule test files with positive/negative cases
- CLI sandbox functional for testing events
- All tests passing

Proceeding with implementation...

