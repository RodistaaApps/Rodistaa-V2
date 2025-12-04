# API Contract - Fleet Verification Engine

## VahanSnapshot (Canonical JSON)

Standardized shape for VAHAN vehicle data after normalization.

```typescript
interface VahanSnapshot {
  rcNumber: string;              // Registration number (e.g., "KA01AB1234")
  stateCode: string;             // State code (e.g., "KA")
  chassisNumber: string;         // Chassis number
  engineNumber: string;          // Engine number
  bodyCode?: string;             // Body code (numeric string)
  bodyTypeString?: string;       // Body type description
  maker?: string;                // OEM name (e.g., "TA TA", "ASHOK LEYLAND")
  model?: string;                // Model name/code
  gvwKg?: number;                // Gross Vehicle Weight in kg
  tyreCount?: number;            // Number of tyres
  axleCount?: number;            // Number of axles
  emissionCode?: string;         // Emission norm (e.g., "BS4", "BS6")
  permitType?: string;           // Permit type (e.g., "GOODS", "TEMPORARY")
  permitValidUntil?: string;     // Permit expiry date (ISO format)
  fitnessValidUntil?: string;    // Fitness expiry date (ISO format)
  ownerName?: string;            // Owner name
  registrationDate?: string;      // Registration date (ISO format)
  vehicleCategory?: string;      // Vehicle category (e.g., "GOODS", "PASSENGER")
  fuelType?: string;             // Fuel type
  color?: string;                // Vehicle color
  norm?: string;                 // Emission norm (alternative field)
  vehicleClass?: string;         // Vehicle class
}
```

## ComplianceDecision

Output of compliance engine check.

```typescript
interface ComplianceDecision {
  status: 'ALLOWED' | 'BLOCKED' | 'PENDING';
  reasonCodes: string[];         // Array of reason codes
  classification?: string;       // Fleet classification (SXL, DXL, TXL, etc.)
  bodyCategory?: string;         // Body category (OPEN_BODY, CONTAINER, etc.)
  cacheExpiresAt: Date;          // Cache expiry timestamp
  lastVerificationAt: Date;      // Last verification timestamp
  lastVerificationProvider: string;  // Provider used (PARIVAHAN, SUREPASS, BACKUP)
  lastVerificationTxnId?: string;    // Provider transaction ID
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
- `BLOCKED_PERMIT_TYPE_{type}` - Permit type is blocked (TEMPORARY, PRIVATE, etc.)
- `GPS_STALE_{minutes}` - GPS ping older than 60 minutes
- `GPS_NO_PING` - No GPS ping recorded
- `PENDING_TRACTOR_PAIRING` - Trailer not linked to tractor
- `OPERATOR_LIMIT_EXCEEDED_{count}_{max}` - Operator has max trucks
- `GVW_OUT_OF_RANGE_{class}_{gvw}` - GVW outside expected range
- `TYRE_COUNT_MISMATCH_{class}_{expected}_{got}` - Tyre count mismatch
- `UNKNOWN_FLEET_TYPE` - Cannot classify fleet type

### Warning Reasons (Non-blocking)

- `LOW_CONFIDENCE_CLASSIFICATION` - Classification confidence < 0.7
- `PERMIT_BLANK` - Permit field is blank (allowed but logged)

## VahanResponse

Response from VAHAN client.

```typescript
interface VahanResponse {
  success: boolean;
  data?: any;                    // Raw provider response
  error?: string;                // Error message if failed
  provider: 'PARIVAHAN' | 'SUREPASS' | 'BACKUP';
  txnId?: string;                // Provider transaction ID
  timestamp: Date;               // Response timestamp
}
```

## Ticket Schema

HQ ticket for discrepancies.

```typescript
interface Ticket {
  id: number;
  ticketType: 'PROVIDER_MISMATCH' | 'DUPLICATE_CHASSIS' | 'PERMIT_DISCREPANCY' | 'LOW_TRUST' | 'COMPLIANCE_BLOCK';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  rcNumber?: string;
  operatorId?: string;
  payload: {
    // Ticket-specific payload
    previousProvider?: string;
    currentProvider?: string;
    mismatches?: string[];
    complianceStatus?: string;
    reasonCodes?: string[];
    [key: string]: any;
  };
  assignedTo?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## TrustHub UI JSON

Lightweight JSON for HQ ticket list UI.

```typescript
interface TrustHubTicket {
  id: number;
  type: string;
  priority: string;
  status: string;
  rcNumber?: string;
  operatorName?: string;
  summary: string;              // Human-readable summary
  createdAt: string;            // ISO date string
  assignedTo?: string;
}
```

## Error Responses

All API errors follow this format:

```typescript
interface ApiError {
  code: string;                 // Error code
  message: string;              // Human-readable message
  details?: any;                // Additional error details
}
```

## Example Requests/Responses

### Compliance Check Request

```json
{
  "rcNumber": "KA01AB1234",
  "operatorId": "OP001",
  "vahanResponse": {
    "success": true,
    "provider": "PARIVAHAN",
    "txnId": "TXN123456",
    "data": {
      "rc_number": "KA01AB1234",
      "body_code": "7",
      "body_type": "OPEN BODY",
      "maker": "TA TA",
      "model": "3521",
      "gvw_kg": 35000,
      "tyre_count": 12,
      "axle_count": 4,
      "emission_code": "BS6",
      "permit_type": "GOODS"
    }
  },
  "gpsLastPingAt": "2025-01-04T10:30:00Z"
}
```

### Compliance Check Response

```json
{
  "status": "ALLOWED",
  "reasonCodes": [],
  "classification": "TXL",
  "bodyCategory": "OPEN_BODY",
  "cacheExpiresAt": "2025-01-11T10:30:00Z",
  "lastVerificationAt": "2025-01-04T10:30:00Z",
  "lastVerificationProvider": "PARIVAHAN",
  "lastVerificationTxnId": "TXN123456"
}
```

### Blocked Response Example

```json
{
  "status": "BLOCKED",
  "reasonCodes": [
    "INVALID_BODY_COWL",
    "BLOCKED_EMISSION_BS3"
  ],
  "cacheExpiresAt": "2025-01-11T10:30:00Z",
  "lastVerificationAt": "2025-01-04T10:30:00Z",
  "lastVerificationProvider": "SUREPASS",
  "lastVerificationTxnId": "TXN789012"
}
```

