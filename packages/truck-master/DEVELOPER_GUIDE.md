# Truck Master Service - Developer Guide

## Quick Start

```bash
# Install dependencies
pnpm install

# Run migrations
pnpm run migrate

# Seed OEM data
pnpm run migrate:seed

# Run tests
pnpm test

# Start service
pnpm run dev
```

## Key Files for Rules Implementation

### 1. Classifier Rules (`src/services/classifier.ts`)

**Purpose**: Body type blocking and fleet classification

**Key Functions**:
- `isBlockedBodyType()` - Checks blocked patterns (COWL, TIPPER, TANKER, etc.)
- `classifyFleetType()` - Maps to SXL/DXL/TXL/QXL/PXL/HX/TRL
- `checkGVWTyreSanity()` - Validates GVW vs tyre count ranges

**Configuration**: `config/body_regex.json` (editable without code deploy)

**Length Constraints**:
- SXL: Max 20 ft (line ~150)
- DXL: Max 24 ft
- TXL: Max 28 ft
- QXL: Max 32 ft
- PXL: Max 40 ft
- HX: Max 42 ft
- TRL: Max 60 ft

### 2. Compliance Engine (`src/services/complianceEngine.ts`)

**Purpose**: Applies all compliance rules and writes decisions

**Key Functions**:
- `checkCompliance()` - Main compliance check function
- `checkDuplicates()` - Duplicate chassis/engine detection
- `checkPermit()` - Permit validity (allows blank, blocks expired/blocked types)
- `checkGPSHeartbeat()` - GPS stale check (60 min threshold)
- `checkOperatorLimit()` - Max 10 trucks per operator

**Rules Applied**:
- Body type blocking
- Emission compliance (BS4/BS6 only)
- Permit, fitness, insurance, PUC validation
- Vehicle category (GOODS only)
- Duplicate detection
- GPS heartbeat
- Trailer pairing
- Operator limits
- Length constraints

### 3. Batch Worker (`src/jobs/batchWorker.ts`)

**Purpose**: Nightly orchestrator for VAHAN verification

**Key Functions**:
- `runBatchVerification()` - Main batch processing
- `processTruck()` - Process single truck with failover
- `checkProviderMismatch()` - Detect provider conflicts
- `storeVahanSnapshot()` - Store raw and normalized data
- `logAuditEvent()` - Audit trail logging

**Failover Logic**:
1. Try Parivahan (if available)
2. Fallback to Surepass
3. Final fallback to Backup provider

**Ticket Creation**:
- Provider mismatches → `PROVIDER_MISMATCH`
- Duplicate chassis → `DUPLICATE_CHASSIS`
- Invalid length → `INVALID_LENGTH_FOR_CLASS`
- Compliance blocks → `COMPLIANCE_BLOCK`

### 4. Normalizer (`src/services/normalizer.ts`)

**Purpose**: Normalize provider responses to canonical VahanSnapshot

**Key Functions**:
- `normalizeVahanResponse()` - Main normalization function
- `parseBodyCode()` - Robust body code parsing
- `parseBodyTypeName()` - Body type string parsing
- `parseNumber()` - Number parsing from various formats
- `parseDate()` - Date string normalization

**Provider Adapters**:
- `normalizeParivahan()` - Parivahan response format
- `normalizeSurepass()` - Surepass response format
- `normalizeBackup()` - Backup provider format

### 5. Inference Engine (`src/services/inference.ts`)

**Purpose**: Body length inference with confidence scoring

**Key Functions**:
- `inferBodyLength()` - Main inference function
- `inferFromOEM()` - OEM model mapping (highest confidence)
- `inferFromWheelbase()` - Wheelbase-based estimation
- `inferFromULW()` - ULW fallback (lowest confidence)

**Confidence Levels**:
- OEM Mapping: 0.9
- Wheelbase: 0.7
- ULW Fallback: 0.5
- Unknown: 0.3

### 6. Hash Utilities (`src/services/hashUtil.ts`)

**Purpose**: Security hashing and encryption

**Key Functions**:
- `hashChassis()` - SHA256 hash of chassis number
- `hashEngine()` - SHA256 hash of engine number
- `encryptRCCopy()` - AES-256-GCM encryption
- `decryptRCCopy()` - AES-256-GCM decryption

**Security**:
- Chassis/engine: SHA256 hash only (no plain text)
- RC copy: AES-256-GCM encrypted at rest
- Key: From `ENCRYPTION_KEY` environment variable

## Configuration Files

### `config/body_regex.json`
- Blocked body type patterns
- Editable without code deploy
- Used by classifier

### `config/tyre_gvw_rules.json`
- Tyre count vs GVW sanity ranges
- Length constraints per classification
- Used by classifier and compliance engine

### `data/rodistaa_fleet_matrix.json`
- Master fleet classification matrix
- Sample models per classification
- Validation rules

## Database Schema

### Key Tables

1. **operator_trucks** - Truck master records
2. **vahan_vehicle_snapshot** - Raw and normalized VAHAN data
3. **vehicle_inference** - Body length inference results
4. **vehicle_compliance_cache** - Compliance decisions (7-day TTL)
5. **tickets** - HQ ticket queue
6. **verification_audit_log** - Audit trail (7-year retention)

## API Endpoints

### Create Truck
```
POST /api/operator/:operatorId/trucks
```
- Validates RC format
- Checks operator limit (max 10)
- Encrypts RC copy
- Marks as PENDING_VERIFICATION

### List Trucks
```
GET /api/operator/:operatorId/trucks
```
- Returns trucks with compliance status
- Includes inference confidence

### Get Truck Detail
```
GET /api/trucks/:rc
```
- Returns complete truck master info
- Includes snapshot, inference, compliance, links, tickets

### Raise Ticket
```
POST /api/trucks/:rc/raise-ticket
```
- Creates HQ ticket
- Stores full payload

### Get Tickets
```
GET /api/tickets?status=OPEN&type=PROVIDER_MISMATCH
```
- HQ ticket list with filters

## Testing

### Run Tests
```bash
pnpm test
pnpm test:coverage
```

### Test Coverage
- Classifier: Body type blocking, fleet classification
- Compliance Engine: All rule checks
- Normalizer: Provider response parsing
- Inference: OEM mapping, fallbacks

### Mock Strategy
- VAHAN Client: Mocked provider responses
- Database: Mocked query functions
- No external network calls in tests

## Common Tasks

### Add New Blocking Pattern

1. Edit `config/body_regex.json`
2. Add pattern to `blocked_patterns` array
3. No code change needed (loaded at runtime)

### Update Tyre/GVW Rules

1. Edit `config/tyre_gvw_rules.json`
2. Update sanity ranges
3. No code change needed

### Add New Compliance Rule

1. Edit `src/services/complianceEngine.ts`
2. Add rule check function
3. Call in `checkCompliance()`
4. Add to `rules_applied` array
5. Add test case

### Debug Compliance Decision

1. Check `vehicle_compliance_cache.reasons`
2. Review `verification_audit_log.rules_applied`
3. Check `vahan_vehicle_snapshot.raw_json` for provider data
4. Review `vehicle_inference` for length inference

## Troubleshooting

### Truck Not Verifying

1. Check `operator_trucks.status` = PENDING_VERIFICATION
2. Verify batch worker is running
3. Check `vahan_vehicle_snapshot` for errors
4. Review `verification_audit_log` for events

### Compliance Always Blocked

1. Check `vehicle_compliance_cache.reasons`
2. Verify all required fields in VAHAN snapshot
3. Check GPS heartbeat status
4. Review permit/fitness/insurance/PUC dates

### Provider Failures

1. Check API keys in environment
2. Review circuit breaker states
3. Check rate limit queues
4. Verify network connectivity

## Next Steps

1. **Integration**: Connect to Rodistaa backend
2. **Scheduling**: Set up nightly batch job (cron/scheduler)
3. **Monitoring**: Add metrics collection
4. **Frontend**: Integrate React components
5. **HQ UI**: Connect ticket list to TrustHub

---

**For questions or issues, refer to:**
- `README.md` - Setup and usage
- `docs/api_contract.md` - API specifications
- `docs/runbook_batch_worker.md` - Batch worker operations
- `docs/security.md` - Security policies
- `docs/acceptance_criteria.md` - Test cases

