# Flagging Policy

## Overview

Flags are non-blocking warnings generated during truck onboarding and VAHAN verification. They alert to unusual configurations or discrepancies without automatically blocking truck operations. Severe or persistent flags escalate to HQ tickets.

## Flag Definitions

### LENGTH_MISMATCH_WARNING
- **Severity**: LOW
- **Trigger**: Body length outside typical range for tyre count
- **Example**: 6-tyre truck with 24ft body length (typical: 12-18ft)
- **Action**: Non-blocking, triggers photo verification task

### TYRE_COUNT_UNUSUAL
- **Severity**: MEDIUM
- **Trigger**: Tyre count rarely seen for maker/model (based on OEM mapping)
- **Action**: Non-blocking, may trigger photo verification

### REQUIRES_PHOTO_VERIFICATION
- **Severity**: MEDIUM
- **Trigger**: Length mismatch or unusual configuration detected
- **Action**: Creates franchise task with 48h SLA

### PAYLOAD_TYRE_MISMATCH
- **Severity**: MEDIUM
- **Trigger**: Declared payload inconsistent with tyre count/GVW ratio
- **Action**: Non-blocking, logged for review

### PERSISTENT_MISMATCH
- **Severity**: HIGH
- **Trigger**: Same flag code occurs 3+ times across verification cycles
- **Action**: Escalates to HQ ticket, may block bidding until resolved

### VAHAN_DISCREPANCY
- **Severity**: HIGH/CRITICAL
- **Trigger**: Critical field mismatch between operator-declared and VAHAN data
- **Action**: 
  - HIGH: Creates HQ ticket
  - CRITICAL: Blocks truck, creates urgent ticket

### DUPLICATE_CHASSIS / DUPLICATE_ENGINE
- **Severity**: CRITICAL
- **Trigger**: Chassis/engine number already registered to another truck
- **Action**: Blocks truck immediately, creates critical HQ ticket

## Triage Rules

### Photo Verification SLA
- **Due Date**: 48 hours from task creation
- **Required Photos**: Front, rear, left side, right side, tyres closeup, deck length with tape
- **Acceptance Criteria**: Photos confirm operator-declared dimensions

### Escalation Rules

1. **Persistent Flags** (3+ occurrences)
   - Creates HIGH severity ticket
   - Blocks bidding for truck until resolved
   - Assigned to Compliance Officer

2. **Critical VAHAN Discrepancies**
   - Creates CRITICAL ticket
   - Blocks truck immediately
   - Requires manual verification

3. **Duplicate Chassis/Engine**
   - Creates CRITICAL ticket
   - Blocks truck
   - Requires operator contact

## Ticket SLA

- **HIGH**: 72 hours response time
- **CRITICAL**: 24 hours response time
- **MEDIUM**: 7 days response time
- **LOW**: Logged for review, no SLA

## Resolution Workflow

1. **Franchise Photo Verification**
   - Franchise uploads photos per checklist
   - If verified: Remove flags, activate truck
   - If failed: Create ticket, update flags

2. **Admin Override**
   - HQ can manually verify, block, or unblock
   - All overrides require reason and are audited
   - Override clears related flags

3. **Ticket Resolution**
   - Compliance Officer reviews ticket
   - May request additional verification
   - Updates truck status and flags
   - Closes ticket with resolution notes

## Monitoring

Track these metrics:
- Flag count by type
- Photo verification task completion rate
- Ticket resolution time
- Persistent flag recurrence rate
- Duplicate detection rate

---

**Last Updated**: 2025-01-XX

