# 🛡️ RODISTAA ANTI-CORRUPTION SHIELD (ACS) v1.0 — PART 2

**Enforcement Rules · API Guardrails · Event Hooks · Policy Engine · Blocklists · Override Governance · Collusion Graph · DB Schema**

**Version**: 1.0 — Part 2  
**Effective Date**: December 19, 2024  
**Status**: ✅ **IMPLEMENTATION BLUEPRINT FOR ENGINEERING**

---

## 📘 PURPOSE

This is Part 2 of the Anti-Corruption Shield (ACS) v1.0, providing the **policy + architecture blueprint** that your engineering team (or Cursor agent) will implement and wire into BOS.

**All artifacts are actionable — copy/paste-ready.**

This document provides:

- Production-ready, implementation-neutral, Node.js/TypeScript friendly patterns
- Enforcement rules mapped to BOS rule IDs and stress tests
- API guardrail middleware structure
- Event-driven architecture patterns
- Policy engine implementation blueprint
- Database schema designs
- Testing and deployment guidance

---

## 🎯 SECTION 1 — TOP-LEVEL ENFORCEMENT RULES (QUICK REFERENCE)

Each rule maps to BOS rule IDs and stress tests.

**Severity Classifications**: Critical / High / Medium / Low

---

### ER-01: KYC Integrity

**Rule**: Block transactions until KYC verified

**Severity**: **CRITICAL**

**BOS Rule ID**: `BR-S04`, `BR-O01`, `BR-D01`

**Stress Test References**: ST-001

**Enforcement**:
- Check `user.kyc_status == APPROVED` before any transaction
- Block booking creation without KYC
- Block bidding without KYC
- Block driver assignment without KYC

**Action**: Immediate rejection with error code `KYC_REQUIRED`

---

### ER-02: Truck Eligibility & Doc Expiry

**Rule**: Auto-block trucks on expiry/failed inspection

**Severity**: **CRITICAL**

**BOS Rule ID**: `BR-O06`, `POL-2.1`

**Stress Test References**: ST-003, ST-008, ST-035, ST-079

**Enforcement**:
- Daily scheduled job checks document expiry dates
- Auto-block if any document expired
- Prevent assignment to new shipments
- Flag active shipments for compliance review

**Action**: Immediate truck status change to `BLOCKED`, notification sent

---

### ER-03: OTP Gate

**Rule**: Shipment completion only with valid OTP; retry limits & lockouts

**Severity**: **CRITICAL**

**BOS Rule ID**: `BR-D14`, `POL-2.3`

**Stress Test References**: ST-005, ST-016, ST-057, ST-070

**Enforcement**:
- Generate 6-digit OTP valid for 24 hours
- Require OTP entry for completion
- Lock OTP after 5 failed attempts
- Invalidate previous OTP on re-issue

**Action**: Block completion without valid OTP, lock after retry limit

---

### ER-04: Auto-Finalization Ledger Re-Check

**Rule**: Atomic check at finalize moment

**Severity**: **HIGH**

**BOS Rule ID**: `BR-O10`, `POL-2.4`, `BR-SL07`

**Stress Test References**: ST-009, ST-042, ST-052

**Enforcement**:
- Re-validate ledger balance at finalization time
- Skip to next-lowest bid if insufficient
- Atomic check-and-lock operation
- Log race condition if detected

**Action**: Skip invalid winner, notify admin of race condition

---

### ER-05: Geo-Evidence Requirement

**Rule**: Pickup/drop photos geotagged + timestamp

**Severity**: **HIGH**

**BOS Rule ID**: `BR-D04`, `BR-D11`

**Stress Test References**: ST-019, ST-064, ST-077, ST-093

**Enforcement**:
- Require geotagged photos for pickup/drop
- Validate timestamp within expected window
- Reject photos without geolocation metadata
- Require geo-verification for POD upload

**Action**: Reject upload without geotag, require retry with geotag

---

### ER-06: POD Validity (PDF & Metadata)

**Rule**: Accept only valid PDFs with timestamp within window

**Severity**: **HIGH**

**BOS Rule ID**: `BR-D11`, `BR-D14`

**Stress Test References**: ST-013, ST-038, ST-047, ST-087

**Enforcement**:
- Validate PDF format and integrity
- Check file size limits (25MB max)
- Verify timestamp within shipment timeline
- Detect duplicate POD hashes

**Action**: Reject invalid format/size/timestamp, flag duplicates

---

### ER-07: GPS Anomaly Handling

**Rule**: Freeze + verification on jump/spoof

**Severity**: **HIGH**

**BOS Rule ID**: `BR-D10`, `BR-D12`

**Stress Test References**: ST-006, ST-014, ST-029, ST-054, ST-078

**Enforcement**:
- Detect impossible location jumps (>200km in <5min)
- Identify spoofing signatures and emulator patterns
- Detect GPS ON/OFF pulsing patterns
- Flag low-confidence GPS (high DOP)

**Action**: Freeze shipment, require driver verification, escalate to admin

---

### ER-08: Duplicate Image/Document Detection

**Rule**: Reject duplicates, flag unit

**Severity**: **HIGH**

**BOS Rule ID**: `BR-FU02`, `FRAUD-5`

**Stress Test References**: ST-006, ST-017, ST-037, ST-096

**Enforcement**:
- Hash comparison for all image uploads
- Detect duplicate KYC photos
- Detect duplicate inspection photos
- Detect duplicate POD images

**Action**: Reject duplicate upload, flag for investigation

---

### ER-09: Admin Override Justification & 2FA

**Rule**: Cannot override without documented reason + 2nd approver for critical ops

**Severity**: **CRITICAL**

**BOS Rule ID**: `BR-A03`

**Stress Test References**: ST-015, ST-059

**Enforcement**:
- Require mandatory justification text (min 20 chars)
- Require 2FA for all override requests
- Require second approver for critical rules
- Log all overrides immutably

**Action**: Block override without justification/approval, escalate abuse

---

### ER-10: Collusion Detection (Graph-Based Triads)

**Rule**: Auto-freeze triads + HQ review

**Severity**: **CRITICAL**

**BOS Rule ID**: `BR-FP04`, `FRAUD-3`

**Stress Test References**: ST-025, ST-080, ST-100

**Enforcement**:
- Graph-based correlation of user relationships
- Detect repeated triads (shipper-operator-driver)
- Identify coordinated bidding patterns
- Flag device-account collisions

**Action**: Freeze all involved accounts, create HQ investigation ticket

---

### ER-11: PII Leakage Redaction

**Rule**: Auto-scan free-text and redact contact info

**Severity**: **HIGH**

**BOS Rule ID**: `BR-11`, `POL-2.8`

**Stress Test References**: ST-036, ST-049

**Enforcement**:
- Pattern matching for phone numbers and emails
- Redact PII before display
- Log PII leak attempts
- Flag repeated violations

**Action**: Redact PII in real-time, log attempt, warn user

---

### ER-12: API Rate Limits & Behavioral Throttles

**Rule**: Prevent automation abuse

**Severity**: **MEDIUM**

**BOS Rule ID**: `BR-O08`

**Stress Test References**: ST-032, ST-056, ST-082

**Enforcement**:
- Rate limit bid modifications per operator
- Throttle bulk API requests
- Detect high-frequency patterns
- Require CAPTCHA/2FA for abuse patterns

**Action**: Throttle requests, require additional authentication

---

### ER-13: Device-Account Binding

**Rule**: Detect many-to-one device signals; block overlapping accepts

**Severity**: **HIGH**

**BOS Rule ID**: `BR-D16`, `FRAUD-3`

**Stress Test References**: ST-050, ST-090

**Enforcement**:
- Track device-to-account mappings
- Detect device sharing across multiple accounts
- Block overlapping shipment acceptances
- Flag device-account collisions

**Action**: Freeze accounts, require device binding verification

---

### ER-14: Inspection Geo-Zone Enforcement

**Rule**: Reject out-of-zone inspections

**Severity**: **HIGH**

**BOS Rule ID**: `BR-FU02`

**Stress Test References**: ST-007, ST-099

**Enforcement**:
- Validate inspection photo geotags
- Check against designated inspection zones
- Reject photos from wrong locations
- Flag franchise for zone violations

**Action**: Reject inspection, flag franchise, require re-inspection

---

### ER-15: Evidence Replayability / Immutable Audit

**Rule**: Tamper-evident logs (hash + signature)

**Severity**: **CRITICAL**

**BOS Rule ID**: `BR-AU01` to `BR-AU07`

**Stress Test References**: All audit-related tests

**Enforcement**:
- Hash all audit entries
- Chain audit entries (prevHash linking)
- Cryptographic signatures for critical logs
- Append-only storage (WORM)

**Action**: Create immutable audit entry, publish root hash periodically

---

## 🛡️ SECTION 2 — API-LEVEL GUARDRAIL MIDDLEWARE

### Middleware Stack Order

Use this middleware stack order for maximum security:

1. **AuthN/AuthZ** — Authentication and authorization
2. **Request validation** — Schema validation
3. **ACS Pre-checks** — Fast, deterministic checks
4. **BOS enforcement** — State machine guards
5. **Rate-limiter & abuse detector** — Behavioral throttling
6. **Handler** — Business logic execution

---

### Example Middleware Skeleton (Express / Fastify Style)

```typescript
// acs/middleware.ts (TypeScript-like pseudocode)

import { Request, Response, NextFunction } from "express";
import { ACS } from "./engine";

export async function acsPreCheck(req: Request, res: Response, next: NextFunction) {
  const ctx = {
    userId: req.user?.id,
    role: req.user?.role,
    ip: req.ip,
    deviceId: req.headers["x-device-id"],
    route: req.path,
    payload: req.body
  };

  // Fast rejects
  const quick = ACS.quickReject(ctx);
  if (quick.rejected) {
    return res.status(403).json({ 
      code: quick.code, 
      message: quick.message 
    });
  }

  // Risk scoring (non-blocking but may attach headers)
  const score = await ACS.score(ctx);
  res.setHeader("X-ACS-RiskScore", score.level);

  // Policy enforcement that can block
  const decision = await ACS.enforce(ctx);
  if (!decision.allow) {
    return res.status(decision.status).json({ 
      code: decision.code, 
      message: decision.message 
    });
  }

  // Attach ACS context for handler use (audit id, flags)
  req.acs = decision.context;
  next();
}
```

---

### Key ACS.enforce Responsibilities

The `ACS.enforce()` function performs:

1. **Check KYC verified**
   - Validate user KYC status
   - Block if not approved

2. **Check truck status (blocked/expired)**
   - Validate truck eligibility
   - Check document expiry
   - Verify inspection status

3. **Check OTP lock / retry limits**
   - Verify OTP not locked
   - Check retry count
   - Validate OTP state

4. **Verify no active freeze on shipment/user**
   - Check user block status
   - Check shipment freeze status
   - Verify device block status

5. **Validate image/document hash uniqueness**
   - Check duplicate image hashes
   - Verify document uniqueness
   - Flag duplicates

6. **Check rate limits (per-IP, per-user, per-device)**
   - Enforce API rate limits
   - Check per-user throttling
   - Validate device rate limits

---

### Return Shape

```typescript
interface ACSDecision {
  allow: boolean;
  status: 200 | 403 | 423 | 429;
  code: 'RF01' | 'KYC_REQUIRED' | 'TRUCK_BLOCKED' | 'OTP_LOCKED' | 'RATE_LIMITED' | ...;
  message: string;
  context: {
    auditId: string; // UUID
    riskScore: number; // 0-100
    flags: string[]; // ['GPS_JUMP', 'POD_DUPLICATE', ...]
  };
}
```

---

## 📡 SECTION 3 — EVENT HOOKS & STREAMING MODEL

ACS must be **event-driven**. Every critical action emits events into the ACS pipeline for real-time and async analysis.

---

### Core Topics (Kafka / PubSub Style)

**Event Topics**:

1. **Booking Events**
   - `booking.created`
   - `booking.updated`
   - `booking.cancelled`

2. **Bidding Events**
   - `bid.created`
   - `bid.updated`
   - `bid.finalized`
   - `bid.cancelled`

3. **Shipment Events**
   - `shipment.created`
   - `shipment.state.changed`
   - `shipment.frozen`
   - `shipment.completed`

4. **Tracking Events**
   - `gps.ping`
   - `gps.anomaly.detected`
   - `tracking.gap`

5. **Document Events**
   - `pod.uploaded`
   - `inspection.uploaded`
   - `doc.uploaded`
   - `kyc.uploaded`

6. **User Events**
   - `user.kyc.updated`
   - `user.suspended`
   - `admin.override.requested`

7. **Fraud Events**
   - `fraud.flagged`
   - `fraud.resolved`
   - `collusion.detected`

8. **Audit Events**
   - `audit.log.entry.created`

---

### Example Event Hook on POD Upload

**Service Flow**:

1. Service receives POD file
2. Store object + generate fileHash + metadata (uploader, ts, geo if any)
3. Emit `pod.uploaded` event:
   ```json
   {
     "shipmentId": "uuid",
     "operatorId": "uuid",
     "driverId": "uuid",
     "fileHash": "sha256_hash",
     "timestamp": "2024-12-19T10:30:00Z",
     "metadata": {
       "geo": { "lat": 19.0760, "lon": 72.8777 },
       "fileSize": 1024000,
       "mimeType": "application/pdf"
     }
   }
   ```

**ACS Subscribers**:

1. **Quick dedupe**: If fileHash seen on other shipments → flag `POD_REUSE_SUSPECT`
2. **Metadata validator**: Verify PDF metadata timestamp within allowed window
3. **Cross-signal collusion**: Correlate uploader + driver + shipper for triad patterns

---

### Event Transport Considerations

**Low-Latency Channel**:
- Kafka with partition by region / org for real-time detection
- Sub-100ms processing for critical events
- Synchronous validation for blocking decisions

**Side-Channel for Heavy Processing**:
- Batch ML/graph processing to avoid blocking user flows
- Asynchronous correlation and pattern detection
- < 5s median lag, < 60s P95 for async processing

---

## ⚙️ SECTION 4 — POLICY ENGINE STRUCTURE & PSEUDOCODE

Policy engine = decision API + rule registry + evaluator + audit.

---

### Components

1. **Rule Registry**: Declarative JSON/YAML rules (id, priority, condition, action, severity)
2. **Evaluator**: Compiles rule conditions to AST/DSL and executes against event/context
3. **Actioner**: Maps actions → system APIs (freezeUser, blockTruck, createTicket)
4. **Audit**: Immutable log entry for every decision (hash + signer + sequence)

---

### Example Declarative Rule (YAML)

```yaml
- id: RF_GPS_JUMP
  priority: 100
  severity: critical
  condition: "event.type == 'gps.ping' && deltaDistance > 200km && deltaTime < 300s"
  action:
    - freezeShipment: 
        shipmentId: "{{event.shipmentId}}"
        reason: "GPS_JUMP"
    - emit: 
        topic: "fraud.flagged"
        payload:
          shipmentId: "{{event.shipmentId}}"
          reason: "GPS_JUMP"
          severity: "critical"
  audit: true
  enabled: true
  version: "1.0.0"
```

---

### Evaluator Pseudocode

```typescript
function evaluate(rule: Rule, context: Context): Decision {
  // Safe DSL compilation
  const cond = compile(rule.condition);
  
  if (cond(context)) {
    // Execute all actions
    const results = [];
    for (const act of rule.action) {
      const result = execute(act, context);
      results.push(result);
    }
    
    // Create audit log if required
    if (rule.audit) {
      Audit.logDecision({
        ruleId: rule.id,
        ruleVersion: rule.version,
        context: context,
        actionResults: results,
        timestamp: now()
      });
    }
    
    return { triggered: true, results };
  }
  
  return { triggered: false };
}
```

---

### Policy Update Flow

**Storage**:
- Rules stored in DB + GitOps YAML repo
- CI/CD for rule changes with validation
- Versioned rule-sets with backward compatibility

**Hot-Reload**:
- Hot-reload supported with versioned rule-set
- All decisions include rule version in audit
- Zero-downtime rule updates

**Versioning**:
- Semantic versioning for rules (major.minor.patch)
- Major changes require review and approval
- Audit trail of all rule changes

---

## 🚫 SECTION 5 — ROLE-BASED BLOCKLISTS & WATCHLISTS

### Data Model & Operations

**Entities**:

#### user_blocklist
```sql
CREATE TABLE user_blocklist (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  role varchar NOT NULL,
  reason text NOT NULL,
  severity varchar NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  audit_id uuid REFERENCES audit_logs(id),
  UNIQUE(user_id, role)
);
```

#### device_blocklist
```sql
CREATE TABLE device_blocklist (
  id uuid PRIMARY KEY,
  device_id text NOT NULL UNIQUE,
  reason text NOT NULL,
  severity varchar NOT NULL,
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  audit_id uuid REFERENCES audit_logs(id)
);
```

#### truck_blocklist
```sql
CREATE TABLE truck_blocklist (
  id uuid PRIMARY KEY,
  truck_id uuid NOT NULL UNIQUE,
  reason text NOT NULL,
  severity varchar NOT NULL,
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  audit_id uuid REFERENCES audit_logs(id)
);
```

#### ip_blocklist
```sql
CREATE TABLE ip_blocklist (
  id uuid PRIMARY KEY,
  ip cidr NOT NULL UNIQUE,
  reason text NOT NULL,
  severity varchar NOT NULL,
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  audit_id uuid REFERENCES audit_logs(id)
);
```

#### watchlist
```sql
CREATE TABLE watchlist (
  id uuid PRIMARY KEY,
  entity_id text NOT NULL,
  entity_type varchar NOT NULL, -- user, device, truck, ip
  risk_score int DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(entity_id, entity_type)
);
```

---

### Blocklist Enforcement

**ACS Pre-Check Logic**:

1. **Immediate Check**: ACS.preCheck consults blocklists first — immediate reject or allow read-only
2. **Expiry Handling**: Auto-expiry and manual un-blocking require two-step approval for critical blocks (Admin + HQ)
3. **Read-Only Mode**: Blocked users can view data but cannot perform actions

---

### APIs

#### POST /acs/block — Create Block

**Request**:
```json
{
  "entityType": "user|device|truck|ip",
  "entityId": "uuid or identifier",
  "reason": "text justification",
  "severity": "CRITICAL|HIGH|MEDIUM|LOW",
  "expiresAt": "2024-12-20T00:00:00Z" // optional
}
```

**Response**:
```json
{
  "id": "uuid",
  "entityType": "user",
  "entityId": "uuid",
  "status": "BLOCKED",
  "auditId": "uuid",
  "createdAt": "2024-12-19T10:30:00Z"
}
```

**Requires**: Admin role + justification + audit log creation

---

#### GET /acs/block/:id — Read Block

**Returns**: Block details with audit trail

---

#### POST /acs/unblock — Un-Block

**Request**:
```json
{
  "blockId": "uuid",
  "reason": "text justification",
  "approverId": "uuid" // second approver for critical blocks
}
```

**Requires**: Two-step approval for CRITICAL severity blocks (Admin + HQ)

**Response**:
```json
{
  "id": "uuid",
  "status": "UNBLOCKED",
  "unblockedAt": "2024-12-19T11:00:00Z",
  "auditId": "uuid"
}
```

---

### Audit

Every block/unblock stored immutably and referenced by action in audit_logs table.

---

## 🔓 SECTION 6 — OVERRIDE GOVERNANCE (ADMIN OVERRIDES)

Do not allow unilateral admin bypass for critical rules.

---

### Override Model

**Tier 1 (Low-Risk)**: Admin override allowed with:
- 1 admin justification (min 20 chars)
- 2FA verification
- Audit log entry

**Examples**: Ledger rounding, minor adjustments

---

**Tier 2 (High-Risk)**: Requires:
- Admin justification (min 50 chars)
- Second approver (another admin or district lead)
- 2FA for both approvers
- Evidence attachment (optional)
- Time-limited override (max 24 hours)

**Examples**: Shipment override, driver reassignment

---

**Tier 3 (Critical / Immutable)**: Not allowed except:
- Managing Director (MD) approval only
- Legal sign-off required
- Logged and time-limited (max 4 hours)
- Full audit trail

**Examples**: Compliance override, fraud investigation exceptions

---

### Override API Flow

#### POST /override/request

**Request**:
```json
{
  "targetType": "shipment|truck|driver|user",
  "targetId": "uuid",
  "ruleId": "BR-S09",
  "justification": "text (min 20-50 chars based on tier)",
  "evidenceUrl": "optional_url",
  "expiresAt": "2024-12-19T12:00:00Z", // optional, max 24h
  "tier": "1|2|3" // auto-assigned based on rule
}
```

**Process**:
1. Request enters `override_queue` with auto-assigned reviewers (based on rule severity)
2. System assigns reviewers based on tier requirements
3. Notifications sent to reviewers
4. Status: `PENDING_APPROVAL`

---

#### POST /override/approve

**Request**:
```json
{
  "overrideRequestId": "uuid",
  "approverId": "uuid",
  "approvalCode": "2FA_code",
  "additionalNotes": "optional"
}
```

**Process**:
1. Validates 2FA code
2. Checks tier requirements (second approver for Tier 2+)
3. If approved, ACS applies temporary override (scoped, audited)
4. Override active until expiry or revocation

---

#### POST /override/revoke

**Request**:
```json
{
  "overrideRequestId": "uuid",
  "revokedBy": "uuid",
  "reason": "text"
}
```

**Process**:
1. Immediately revokes active override
2. Restores original business rule enforcement
3. Creates audit log entry

---

### Controls

**Override TTL**:
- Tier 1: Max 7 days
- Tier 2: Max 24 hours (default)
- Tier 3: Max 4 hours

**Auto-Revoke**:
- Automatic revocation at expiry
- Notification before expiry (1 hour before)

**Progressive Penalty Tracking**:
- Track override frequency per admin
- Flag repeated overrides
- Escalate to HQ if abuse pattern detected

---

### Visibility

All override decisions immutable + visible in admin dashboards + exportable for audits.

---

## 🔗 SECTION 7 — COLLUSION DETECTION ENGINE (CDE)

Graph Model & Algorithm

---

### Graph Primitives

**Nodes**:
- User (shipper/operator/driver)
- Truck
- Device
- Account
- Phone
- BankAccount
- Franchise

**Edges**:
- `accepted_bid` (timestamp, amount)
- `assigned_driver` (timestamp, shipmentId)
- `uploaded_pod` (timestamp, fileHash, shipmentId)
- `shared_device` (deviceId, timestamp)
- `shared_bank` (accountNumber, timestamp)
- `inspected_by` (franchiseId, timestamp, result)
- `contacted_via` (phone, timestamp)

**Graph DB Recommendation**: Neo4j or JanusGraph (scales) — store edges with timestamps and metadata.

---

### Collusion Signals (Examples)

1. **Repeated Triads**: Same shipper, operator, driver involved in >N suspicious shipments over window W
2. **Temporal Correlation**: Identical POD images used across triad
3. **Financial Triangulation**: Same bank account receiving payouts from multiple operators
4. **Behavioral Correlation**: Synchronized bid patterns (same amounts, same seconds)
5. **Network Linkage**: Same deviceId used by multiple driver accounts

---

### Algorithm Sketch

**Maintain**:
- Sliding window graphs (time-bounded, e.g., 90 days)

**Compute Metrics per Triad**:
- `frequency`: Number of shipments involving same triad
- `reuseScore`: POD/hash reuse across shipments
- `geoConsistency`: Geographic anomaly score
- `financialLink`: Bank account sharing score
- `gpsAnomaly`: GPS pattern anomaly score

**Score Triads**:
```
score = w1*frequency + w2*reuseScore + w3*financialLink + w4*gpsAnomaly
```

**Threshold Classification**:
- **suspicious**: score > 50
- **likely-fraud**: score > 75
- **critical**: score > 90

**Auto-Actions**:
- **Critical**: Freeze all involved accounts + create HQ ticket
- **Likely-Fraud**: Escalate to watchlist + manual review
- **Suspicious**: Monitor + pattern tracking

---

### Graph Schema Example (Cypher-Like)

```cypher
// Create nodes
CREATE (s:Shipper {id: "uuid", kycStatus: "APPROVED"})
CREATE (o:Operator {id: "uuid", kycStatus: "APPROVED"})
CREATE (d:Driver {id: "uuid", kycStatus: "APPROVED"})

// Create edges with metadata
CREATE (o)-[:ASSIGNED_DRIVER {
  shipmentId: "uuid",
  timestamp: "2024-12-19T10:00:00Z"
}]->(d)

CREATE (d)-[:DELIVERED {
  shipmentId: "uuid",
  podHash: "sha256_hash",
  timestamp: "2024-12-19T15:00:00Z"
}]->(s)

CREATE (o)-[:ACCEPTED_BID {
  bookingId: "uuid",
  amount: 5000,
  timestamp: "2024-12-19T08:00:00Z"
}]->(s)
```

---

### CDE Outputs

**collusion.alert Event**:
```json
{
  "alertId": "uuid",
  "triadIds": {
    "shipperId": "uuid",
    "operatorId": "uuid",
    "driverId": "uuid"
  },
  "score": 85,
  "classification": "likely-fraud",
  "evidencePointers": {
    "podHashes": ["hash1", "hash2"],
    "gpsAnomalies": ["anomaly1"],
    "bankAccounts": ["account1"],
    "devices": ["device1"]
  },
  "timestamp": "2024-12-19T10:30:00Z"
}
```

Links to audit entries and raw evidence (POD hashes, GPS logs).

---

## 💾 SECTION 8 — DB SCHEMA (COMPACT, NORMALIZED)

Postgres + Graph Store Combo

---

### Relational Key Tables (Postgres)

#### users Table
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY,
  role varchar NOT NULL, -- shipper, operator, driver, admin, kyc_admin, franchise
  kyc_status varchar NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  is_active boolean DEFAULT true,
  risk_score int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_risk_score ON users(risk_score);
CREATE INDEX idx_users_role ON users(role);
```

#### trucks Table
```sql
CREATE TABLE trucks (
  id uuid PRIMARY KEY,
  operator_id uuid REFERENCES users(id),
  reg_no varchar NOT NULL,
  model_year int NOT NULL,
  bs_type varchar NOT NULL, -- BS4, BS6
  status varchar NOT NULL DEFAULT 'PENDING', -- ACTIVE, BLOCKED, PENDING_INSPECTION
  last_inspection_at timestamptz,
  next_inspection_due_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_trucks_status ON trucks(status);
CREATE INDEX idx_trucks_operator_id ON trucks(operator_id);
CREATE INDEX idx_trucks_inspection_due ON trucks(next_inspection_due_at);
```

#### audit_logs Table (Immutable)
```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY,
  source varchar NOT NULL, -- ACS, BOS, ADMIN, etc.
  event jsonb NOT NULL,
  rule_version varchar,
  rule_id varchar,
  prev_hash text, -- Previous audit entry hash (chain)
  hash text NOT NULL, -- SHA256 of (event + timestamp + prev_hash)
  signer text, -- Service signature
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_audit_source ON audit_logs(source);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_hash ON audit_logs(hash);
```

#### acs_blocks Table
```sql
CREATE TABLE acs_blocks (
  id uuid PRIMARY KEY,
  entity_type varchar NOT NULL, -- user, device, truck, ip, shipment
  entity_id text NOT NULL,
  reason text NOT NULL,
  severity varchar NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
  expires_at timestamptz,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  audit_id uuid REFERENCES audit_logs(id) NOT NULL,
  UNIQUE(entity_type, entity_id) WHERE expires_at IS NULL OR expires_at > now()
);

CREATE INDEX idx_acs_blocks_entity ON acs_blocks(entity_type, entity_id);
CREATE INDEX idx_acs_blocks_expires_at ON acs_blocks(expires_at);
```

#### pod_files Table
```sql
CREATE TABLE pod_files (
  id uuid PRIMARY KEY,
  shipment_id uuid NOT NULL,
  uploader_id uuid REFERENCES users(id),
  file_hash text NOT NULL,
  file_url text NOT NULL,
  metadata jsonb, -- {geo: {}, timestamp: {}, fileSize: int, mimeType: string}
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_pod_files_hash ON pod_files(file_hash);
CREATE INDEX idx_pod_files_shipment_id ON pod_files(shipment_id);
CREATE UNIQUE INDEX idx_pod_files_unique_hash ON pod_files(file_hash) WHERE shipment_id IS NOT NULL;
```

#### override_requests Table
```sql
CREATE TABLE override_requests (
  id uuid PRIMARY KEY,
  target_type varchar NOT NULL,
  target_id uuid NOT NULL,
  rule_id varchar NOT NULL,
  justification text NOT NULL,
  evidence_url text,
  tier int NOT NULL, -- 1, 2, 3
  status varchar NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, EXPIRED
  requested_by uuid REFERENCES users(id),
  approved_by uuid REFERENCES users(id),
  second_approver uuid REFERENCES users(id), -- For Tier 2+
  expires_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  approved_at timestamptz,
  audit_id uuid REFERENCES audit_logs(id) NOT NULL
);

CREATE INDEX idx_override_status ON override_requests(status);
CREATE INDEX idx_override_expires_at ON override_requests(expires_at);
```

---

### Graph Store

Maintain shipment-event graph in Neo4j / JanusGraph for triad detection — keep pointers to relational rows (uuids).

**Node Properties**:
- `id`: UUID (foreign key to relational DB)
- `type`: node type (Shipper, Operator, Driver, Truck, Device, etc.)
- `metadata`: JSON properties

**Edge Properties**:
- `timestamp`: Event timestamp
- `shipmentId`: Related shipment ID
- `metadata`: JSON properties (amount, location, etc.)

---

### Indexing & Lookups

**Postgres Indices**:
- `users.risk_score` — For risk-based queries
- `trucks.status` — For active truck filtering
- `pod_files.file_hash` — For duplicate detection
- `acs_blocks.entity_type, entity_id` — For blocklist checks

**TTL Indices**:
- `acs_blocks.expires_at` — For auto-expiry jobs
- `override_requests.expires_at` — For override expiry

**Audit Log Retention**:
- WORM/append-only storage (S3 + hash)
- Daily archival of audit logs older than 90 days
- Retention: Critical audits 7 years, Operational logs 90 days

---

## 📜 SECTION 9 — AUDIT DESIGN

Tamper-Evidence & Retention

---

### Audit Chain Design

Each ACS decision writes an `audit_logs` row, computes SHA256 over:

```
hash = SHA256(
  event JSON +
  ruleVersion +
  timestamp +
  previousAuditHash
)
```

This forms a **hash chain** — each entry links to the previous one.

---

### Periodic Root Hash Publishing

**Daily Process**:
1. Compute root hash of all audit entries for the day
2. Publish audit root hash to external immutable store:
   - Blockchain anchoring (Ethereum, Polygon)
   - AWS S3 with object lock (WORM)
   - Notarization service
3. Store root hash in `audit_root_hashes` table:
   ```sql
   CREATE TABLE audit_root_hashes (
     id uuid PRIMARY KEY,
     date date NOT NULL UNIQUE,
     root_hash text NOT NULL,
     entry_count int NOT NULL,
     published_to text, -- blockchain_tx_hash or s3_url
     created_at timestamptz DEFAULT now()
   );
   ```

---

### Retention Policy

**Legal & Compliance**:
- Critical audits: Minimum 7 years retention
- High-severity events: 5 years retention
- Medium-severity events: 3 years retention
- Low-severity events: 90 days retention

**Storage Strategy**:
- Hot storage (Postgres): Last 90 days
- Warm storage (S3): 90 days - 2 years
- Cold storage (S3 Glacier): 2 years - 7 years
- Archive (External): 7+ years

---

### Audit Entry Fields

```typescript
interface AuditEntry {
  decisionId: string; // UUID
  ruleId: string; // RF01, BR-S04, etc.
  ruleVersion: string; // "1.0.0"
  inputSnapshot: object; // Full context snapshot
  actionTaken: string; // freezeShipment, blockUser, etc.
  actor: string; // userId or system
  signer: string; // Service signature
  prevHash: string; // Previous audit entry hash
  hash: string; // Current entry hash
  timestamp: Date;
}
```

---

## 💻 SECTION 10 — SAMPLE NODE.JS POLICY-ACTION IMPLEMENTATIONS

### Freeze Shipment Action (Pseudocode)

```typescript
async function freezeShipment(
  shipmentId: string, 
  reason: string, 
  ctx: ACSContext
): Promise<ACSBlock> {
  // Idempotent: check existing freeze
  const existing = await db.query(
    'SELECT * FROM acs_blocks WHERE entity_type=$1 AND entity_id=$2 AND (expires_at IS NULL OR expires_at > now())',
    ['shipment', shipmentId]
  );
  
  if (existing.length > 0) {
    return existing[0]; // Already frozen
  }
  
  // Create audit entry
  const audit = await Audit.create({
    source: 'ACS',
    event: {
      action: 'freezeShipment',
      shipmentId: shipmentId,
      reason: reason,
      context: ctx
    },
    ruleVersion: ctx.ruleVersion,
    ruleId: ctx.ruleId
  });
  
  // Create block entry
  const block = await db.query(
    `INSERT INTO acs_blocks 
     (entity_type, entity_id, reason, severity, created_by, audit_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    ['shipment', shipmentId, reason, 'CRITICAL', ctx.actorId, audit.id]
  );
  
  // Emit event for other systems
  await eventBus.emit('acs.block.created', {
    id: block[0].id,
    entityType: 'shipment',
    entityId: shipmentId,
    reason: reason,
    auditId: audit.id,
    timestamp: new Date()
  });
  
  return block[0];
}
```

---

### Admin Override Request Flow (Pseudocode)

#### POST /override/request Handler

```typescript
async function requestOverride(
  req: Request,
  res: Response
): Promise<void> {
  const { targetType, targetId, ruleId, justification, evidenceUrl } = req.body;
  const adminId = req.user.id;
  
  // ACL: only admins
  if (req.user.role !== 'admin') {
    return res.status(403).json({ code: 'FORBIDDEN', message: 'Admin role required' });
  }
  
  // Determine tier based on rule
  const rule = await RuleRegistry.get(ruleId);
  const tier = rule.severity === 'CRITICAL' ? 3 : rule.severity === 'HIGH' ? 2 : 1;
  
  // Validate justification length
  const minJustification = tier === 1 ? 20 : tier === 2 ? 50 : 100;
  if (justification.length < minJustification) {
    return res.status(400).json({
      code: 'JUSTIFICATION_TOO_SHORT',
      message: `Justification must be at least ${minJustification} characters for Tier ${tier}`
    });
  }
  
  // Create audit entry
  const audit = await Audit.create({
    source: 'ACS',
    event: {
      action: 'overrideRequest',
      targetType,
      targetId,
      ruleId,
      adminId
    }
  });
  
  // Create override request
  const overrideRequest = await db.query(
    `INSERT INTO override_requests
     (target_type, target_id, rule_id, justification, evidence_url, tier, requested_by, audit_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [targetType, targetId, ruleId, justification, evidenceUrl, tier, adminId, audit.id]
  );
  
  // Auto-assign reviewers based on tier
  const reviewers = await assignReviewers(tier, ruleId);
  
  // Send notifications to reviewers
  await notifyReviewers(reviewers, overrideRequest[0].id);
  
  // Emit event
  await eventBus.emit('override.request.created', {
    id: overrideRequest[0].id,
    tier,
    targetType,
    targetId,
    timestamp: new Date()
  });
  
  res.status(201).json({
    id: overrideRequest[0].id,
    status: 'PENDING_APPROVAL',
    reviewers: reviewers.map(r => r.id),
    expiresAt: overrideRequest[0].expires_at
  });
}
```

---

## 🧪 SECTION 11 — TESTING & ACCEPTANCE CRITERIA

For each ACS rule provide:

---

### Unit Tests

Rule condition true/false permutations

**Example**:
```typescript
describe('RF_GPS_JUMP Rule', () => {
  it('should trigger when deltaDistance > 200km and deltaTime < 300s', () => {
    const context = {
      event: {
        type: 'gps.ping',
        deltaDistance: 250, // km
        deltaTime: 120 // seconds
      }
    };
    const result = evaluateRule('RF_GPS_JUMP', context);
    expect(result.triggered).toBe(true);
  });
  
  it('should not trigger when deltaDistance < 200km', () => {
    const context = {
      event: {
        type: 'gps.ping',
        deltaDistance: 150, // km
        deltaTime: 120 // seconds
      }
    };
    const result = evaluateRule('RF_GPS_JUMP', context);
    expect(result.triggered).toBe(false);
  });
});
```

---

### Integration Tests

Event emitted → ACS action executed → audit created

**Example**:
```typescript
describe('GPS Anomaly Integration', () => {
  it('should freeze shipment on GPS jump event', async () => {
    // Emit GPS ping event
    await eventBus.emit('gps.ping', {
      shipmentId: 'test-shipment',
      deltaDistance: 250,
      deltaTime: 120
    });
    
    // Wait for ACS processing
    await sleep(100);
    
    // Verify shipment frozen
    const block = await db.query(
      'SELECT * FROM acs_blocks WHERE entity_id=$1',
      ['test-shipment']
    );
    expect(block[0].reason).toBe('GPS_JUMP');
    
    // Verify audit created
    const audit = await db.query(
      'SELECT * FROM audit_logs WHERE event->>\'shipmentId\' = $1',
      ['test-shipment']
    );
    expect(audit.length).toBeGreaterThan(0);
  });
});
```

---

### E2E Tests

Full flow (e.g., GPS jump → freeze → HQ ticket generated)

**Example**:
```typescript
describe('GPS Jump E2E Flow', () => {
  it('should complete full flow from detection to HQ notification', async () => {
    // 1. Create shipment
    const shipment = await createShipment();
    
    // 2. Send GPS jump event
    await sendGPSPing(shipment.id, { lat: 19.0760, lon: 72.8777 });
    await sendGPSPing(shipment.id, { lat: 18.5204, lon: 73.8567 }); // 200km+ jump
    
    // 3. Verify shipment frozen
    const frozen = await checkShipmentStatus(shipment.id);
    expect(frozen.status).toBe('FROZEN');
    
    // 4. Verify HQ ticket created
    const ticket = await checkHQTicket(shipment.id);
    expect(ticket.severity).toBe('CRITICAL');
    expect(ticket.reason).toBe('GPS_JUMP');
  });
});
```

---

### Performance Criteria

**Synchronous Decisions**:
- ACS pre-check latency: **< 50ms** for synchronous decisions
- Blocklist lookup: **< 10ms** (cached)
- Rule evaluation: **< 30ms** (compiled conditions)

**Asynchronous Processing**:
- Queue-based async detectors (BAE/CDE): **< 5s median lag**, **< 60s P95**
- Graph correlation: **< 30s** for triad detection
- Batch processing: **< 5min** for daily analysis

---

### Sample Test Matrix Coverage

1. **KYC Block Tests** (positive/negative)
2. **OTP Lockout & Unlock Flows**
3. **POD Duplicate Detection** (hash + image-similarity)
4. **Collusion Triad Detection** (simulated with 10K synthetic events)
5. **Admin Override Gating** & 2-approver path
6. **GPS Anomaly Detection** (various jump patterns)
7. **Rate Limiting** (throttling behavior)
8. **Device-Account Binding** (collision detection)
9. **Inspection Zone Enforcement** (geo-validation)
10. **Audit Chain Integrity** (hash chain verification)

---

## 🚀 SECTION 12 — DEPLOYMENT & INFRA RECOMMENDATIONS

### ACS Real-Time Service

**Architecture**:
- Node.js microservice cluster
- Behind API Gateway (AWS API Gateway / Kong)
- Stateless design for horizontal scaling
- Auto-scale based on event ingress

**Connections**:
- Kafka for events (event ingestion)
- Redis for fast blocklist/cache (sub-10ms lookups)
- Postgres for persistent storage (blocks, audit, overrides)

**Scaling**:
- Horizontal scaling based on CPU/memory metrics
- Queue depth monitoring for async processing
- Circuit breakers for external dependencies

---

### Graph Processing

**Architecture**:
- Neo4j cluster (or managed JanusGraph)
- Behind CDE service (Node.js)
- Batch graph jobs run periodically (hourly/daily)

**Storage**:
- Graph DB for relationship queries
- Postgres for entity metadata
- Sync mechanism between stores

---

### Audit Store

**Hot Storage**:
- Append-only Postgres for recent audits (90 days)
- Partitioned by date for performance

**Cold Storage**:
- S3 with object lock (WORM) for long-term storage
- Daily archival jobs
- Glacier for 7+ year retention

**Notarization**:
- Daily anchor to immutable service (blockchain or notarization)
- Root hash publishing

---

### Secrets & Keys

**Key Management**:
- Use KMS (AWS KMS / HashiCorp Vault)
- Rotate admin keys periodically (every 90 days)
- Separate keys per environment
- Audit all key access

---

### Observability

**Metrics** (Prometheus):
- Rule firing counts per rule
- Decision latency (p50, p95, p99)
- Block creation rate
- Override approval rate
- False positive rate

**Logs** (ELK Stack):
- All ACS decisions
- Rule evaluation logs
- Error logs
- Performance logs

**SLO Alerts**:
- ACS decision latency > 100ms
- Missed detections (false negatives)
- High false positive rate (> 1%)
- Queue depth > threshold

---

## 📋 SECTION 13 — ROLLOUT PLAN (PRACTICAL)

### Phase 1: Monitor-Only Mode (2 Weeks)

**Objective**: Deploy ACS in "monitor-only" mode

**Actions**:
1. Deploy ACS middleware (non-blocking)
2. Log all decisions but do not block
3. Monitor false positive rates
4. Target: **< 1% false positive rate**

**Verification**:
- Review all flagged events manually
- Tune rule thresholds
- Adjust risk scores

---

### Phase 2: Non-Critical Rules (1 Week)

**Objective**: Enable blocking for non-critical rules

**Rules**:
- PII redaction (warning only)
- Rate limits (throttling)
- API validation

**Actions**:
1. Enable blocking for selected rules
2. Monitor impact on user experience
3. Verify false positive rate remains < 1%

---

### Phase 3: Critical Rules Pilot (2 Weeks)

**Objective**: Roll critical rules behind feature flag

**Rules**:
- KYC validation
- OTP lock
- Truck auto-block

**Actions**:
1. Pilot on 10% of traffic (canary deployment)
2. Gradually increase to 50%, then 100%
3. Monitor error rates and user feedback
4. Have rollback plan ready

---

### Phase 4: Full Rollout

**Objective**: Full production deployment

**Actions**:
1. Enable all rules for 100% traffic
2. Monitor dashboards continuously
3. Have support team ready for escalations

---

### Training

**Ops Team**:
- Dashboard navigation
- Alert response procedures
- Override request handling

**Compliance Team**:
- Fraud investigation workflows
- Audit log access
- Report generation

**HQ Fraud Desk**:
- Collusion alert handling
- Investigation procedures
- Escalation workflows

---

## 📦 SECTION 14 — DELIVERABLES TO HAND TO ENGINEERING

### Copy-Paste Ready Artifacts

1. **acs/rules/** — YAML rule-set (declarative files per rule)
   - **Top 25 Rules**: `docs/acs_rules_top25.yaml` ✅ **PRODUCTION-READY** (25 declarative policy rules)
   - **Rules Index**: `docs/ACS_RULES_INDEX.md` (Quick reference guide)
2. **acs-service/** — Service package starter
   - **Package**: `docs/acs-service/package.json` ✅ **STARTER READY** (Node.js/TypeScript service with dependencies)
   - **Service Docs**: `docs/acs-service/README.md` (Service documentation and quick start)
   - **Service Summary**: `docs/ACS_SERVICE_COMPLETE.md` (Package overview)
3. **acs/middleware.ts** — Middleware skeleton (provided above)
4. **acs/engine/** — Evaluator pseudocode + interfaces
5. **migrations/** — DB migration SQL file for acs_blocks, audit_logs, pod_files
   - **Migration File**: `docs/rodistaa_acs_migration_and_seed.sql` ✅ **PRODUCTION-READY** (Complete schema + seed data)
   - **Migration Docs**: `docs/ACS_MIGRATION_COMPLETE.md` (Deployment guide)
6. **events/** — Event contract docs (topic names, payload shapes)
7. **collusion/** — Collusion detection design doc + sample Cypher queries
8. **api/** — Admin override API spec (OpenAPI snippet)
9. **tests/** — Test plan checklist (unit/integration/E2E/perf)

---

### Deliverable File Structure

```
/acs
  /rules
    - acs_rules_top25.yaml ✅ **PRODUCTION-READY** (25 rules bundled)
    - rf01_gps_jump.yaml (example - can be split per rule)
    - rf02_duplicate_kyc.yaml (example - can be split per rule)
    - ...
  /middleware
    - acsPreCheck.ts
    - rateLimiter.ts
    - blocklistChecker.ts
  /engine
    - evaluator.ts
    - actioner.ts
    - ruleRegistry.ts
  /actions
    - freezeShipment.ts
    - blockUser.ts
    - createTicket.ts
  /collusion
    - cde.ts
    - graphQueries.cypher
    - triadDetector.ts
/migrations
  - rodistaa_acs_migration_and_seed.sql ✅ **PRODUCTION-READY** (Complete schema + seed)
  - 001_create_acs_tables.sql (example - can be split if needed)
  - 002_create_audit_tables.sql (example - can be split if needed)
/events
  - eventContracts.md
  - topicDefinitions.yaml
/api
  - overrideAPI.openapi.yaml
/tests
  - testPlan.md
  - testMatrix.md
  - sampleTests.spec.ts
```

---

## ✅ ACS PART 2 COMPLETION STATUS

**Part 2 Status**: ✅ **COMPLETE**

**Sections Documented**:
1. ✅ Top-Level Enforcement Rules (15 rules with severity)
2. ✅ API-Level Guardrail Middleware (Node.js/TypeScript patterns)
3. ✅ Event Hooks & Streaming Model (Kafka/PubSub topics)
4. ✅ Policy Engine Structure & Pseudocode (Rule registry, evaluator, actioner)
5. ✅ Role-Based Blocklists & Watchlists (Data model & operations)
6. ✅ Override Governance (Admin overrides with 3-tier model)
7. ✅ Collusion Detection Engine (Graph model & algorithm)
8. ✅ DB Schema (Postgres + Graph store combo)
9. ✅ Audit Design (Tamper-evidence & retention)
10. ✅ Sample Node.js Policy-Action Implementations
11. ✅ Testing & Acceptance Criteria
12. ✅ Deployment & Infra Recommendations
13. ✅ Rollout Plan (4-phase practical approach)
14. ✅ Deliverables to Hand to Engineering

---

**🛡️ The Rodistaa Anti-Corruption Shield (ACS) v1.0 — Part 2 is now COMPLETE.**

**Status**: ✅ **READY FOR ENGINEERING IMPLEMENTATION**

---

**Version**: 1.0 — Part 2  
**Last Updated**: December 19, 2024  
**Authority**: Managing Director, Rodistaa

