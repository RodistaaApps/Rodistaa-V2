# API Contract - Truck Master Service

## VahanSnapshot (Canonical JSON)

Standardized shape for VAHAN vehicle data after normalization.

```typescript
interface VahanSnapshot {
  rc_number: string;
  state_code?: string;
  maker?: string;
  model_name?: string;
  model_code?: string;
  gvw_kg?: number;
  ulw_kg?: number;
  wheelbase_mm?: number;
  body_type_code?: string;
  body_type_name?: string;
  vehicle_category?: string; // GOODS, PASSENGER, etc.
  permit_type?: string;
  permit_valid_upto?: string; // ISO date string
  fitness_valid_upto?: string; // ISO date string
  insurance_valid_upto?: string; // ISO date string
  puc_valid_upto?: string; // ISO date string
  registration_status?: string;
  chassis_number?: string;
  engine_number?: string;
  txn_id?: string;
  provider?: string;
  vahan_timestamp?: string; // ISO date string
  raw_json?: any;
}
```

## ComplianceDecision

Output of compliance engine check.

```typescript
interface ComplianceDecision {
  allow: boolean;
  reasons: string[];
  decision_at: Date;
  provider: string;
  last_verified_at: Date | null;
  rules_applied: string[];
  inference_confidence?: number;
}
```

## Reason Codes

### Blocking Reasons

- `INVALID_BODY_COWL` - Body type contains "COWL"
- `INVALID_BODY_TIPPER` - Body type contains "TIPPER"
- `INVALID_BODY_TANKER` - Body type contains "TANKER"
- `INVALID_BODY_CHASSIS` - Body type contains "CHASSIS"
- `BLOCKED_EMISSION_BS3` - Emission code is BS3 or below
- `MISSING_EMISSION_CODE` - Emission code not provided
- `DUPLICATE_CHASSIS_{rc}_{operator}` - Chassis/engine already exists
- `PERMIT_EXPIRED` - Permit has expired
- `PERMIT_EXPIRING_SOON_{days}` - Permit expires in < 7 days
- `BLOCKED_PERMIT_TYPE_{type}` - Permit type is blocked
- `GPS_STALE_{minutes}` - GPS ping older than 60 minutes
- `GPS_NO_PING` - No GPS ping recorded
- `PENDING_TRACTOR_PAIRING` - Trailer not linked to tractor
- `OPERATOR_LIMIT_EXCEEDED_{count}_{max}` - Operator has max trucks
- `INVALID_LENGTH_FOR_CLASS_{class}_{length}ft` - Length exceeds class maximum
- `GVW_OUT_OF_RANGE_{class}_{gvw}` - GVW outside expected range
- `TYRE_COUNT_MISMATCH_{class}_{expected}_{got}` - Tyre count mismatch
- `FITNESS_EXPIRED` - Fitness certificate expired
- `INSURANCE_EXPIRED` - Insurance expired
- `PUC_EXPIRED` - PUC expired
- `INVALID_CATEGORY_{category}` - Vehicle category not GOODS

## API Endpoints

### POST /api/operator/:operatorId/trucks

Create truck record.

**Request:**
```json
{
  "rc_number": "KA01AB1234",
  "nickname": "My Primary Truck",
  "rc_copy": "base64_encoded_string",
  "is_tractor": false,
  "is_trailer": false,
  "legal_authorization_accepted": true
}
```

**Response:**
```json
{
  "success": true,
  "truck": {
    "id": 1,
    "operator_id": "OP001",
    "rc_number": "KA01AB1234",
    "status": "PENDING_VERIFICATION",
    "onboarded_at": "2025-01-04T10:30:00Z"
  },
  "message": "Truck onboarded successfully. Verification will be completed within 24 hours."
}
```

### GET /api/operator/:operatorId/trucks

List operator trucks with compliance status.

**Response:**
```json
{
  "success": true,
  "trucks": [
    {
      "id": 1,
      "rc_number": "KA01AB1234",
      "status": "ACTIVE",
      "compliance_allow": true,
      "compliance_reasons": [],
      "compliance_last_verified_at": "2025-01-04T10:30:00Z",
      "inferred_body_type": "TXL",
      "inference_confidence": 0.9
    }
  ]
}
```

### GET /api/trucks/:rc

Get truck master detail.

**Response:**
```json
{
  "success": true,
  "truck": {
    "truck": { /* OperatorTruck */ },
    "latest_snapshot": { /* VahanSnapshotRow */ },
    "inference": { /* VehicleInferenceRow */ },
    "compliance": { /* ComplianceCacheRow */ },
    "linked_tractor": { /* OperatorTruck */ },
    "linked_trailer": { /* OperatorTruck */ },
    "tickets": [ /* Ticket[] */ ]
  }
}
```

### POST /api/trucks/:rc/raise-ticket

Create HQ ticket.

**Request:**
```json
{
  "ticket_type": "PROVIDER_MISMATCH",
  "payload": {
    "previousProvider": "PARIVAHAN",
    "currentProvider": "SUREPASS",
    "mismatches": ["vehicle_category: GOODS vs PASSENGER"]
  }
}
```

### GET /api/tickets

Get HQ tickets with filters.

**Query Parameters:**
- `status`: OPEN, IN_PROGRESS, RESOLVED, CLOSED
- `type`: PROVIDER_MISMATCH, DUPLICATE_CHASSIS, etc.
- `limit`: Number of results (default: 100)

**Response:**
```json
{
  "success": true,
  "tickets": [
    {
      "id": 1,
      "ticket_type": "PROVIDER_MISMATCH",
      "priority": "HIGH",
      "status": "OPEN",
      "rc_number": "KA01AB1234",
      "payload": { /* ticket payload */ },
      "created_at": "2025-01-04T10:30:00Z"
    }
  ]
}
```

## Error Responses

All API errors follow this format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

Common error codes:
- `OPERATOR_LIMIT_EXCEEDED` - Operator has reached max 10 trucks
- `INVALID_RC_FORMAT` - RC number format invalid
- `TRUCK_NOT_FOUND` - Truck not found
- `DUPLICATE_CHASSIS` - Chassis already exists

