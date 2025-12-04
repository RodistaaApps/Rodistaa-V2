# Rodistaa Fleet Matrix & VAHAN Verification Engine

Production-ready fleet classification matrix, VAHAN-based verification engine, and compliance system for Rodistaa.

## Overview

This package provides:
- **Fleet Classification**: SXL, DXL, TXL, QXL, PXL, HX, TRL classification based on axles, tyres, and dimensions
- **VAHAN Verification**: Provider-agnostic client with failover (Parivahan → Surepass → Backup)
- **Compliance Engine**: Rule-based compliance checking with caching
- **Batch Processing**: Nightly verification jobs with concurrency control
- **Trailer Management**: Tractor-trailer linking and pairing enforcement
- **HQ Ticketing**: Discrepancy tracking and resolution workflow

## Installation

```bash
cd packages/fleet-verification
pnpm install
```

## Database Setup

### Run Migrations

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://user:password@localhost:5432/rodistaa"

# Run migrations
pnpm run migrate
```

### Seed OEM Data

```bash
# Seed OEM model mappings
pnpm run migrate:seed
```

## Configuration

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/rodistaa

# VAHAN Provider Credentials
VAHAN_PARIVAHAN_API_KEY=your_parivahan_key
VAHAN_PARIVAHAN_BASE_URL=https://parivahan.gov.in/api

VAHAN_SUREPASS_API_KEY=your_surepass_key
VAHAN_SUREPASS_BASE_URL=https://api.surepass.io

VAHAN_BACKUP_API_KEY=your_backup_key
VAHAN_BACKUP_BASE_URL=https://api.backup-provider.com
```

## Usage

### Basic Compliance Check

```typescript
import { ComplianceEngine, VahanClient } from '@rodistaa/fleet-verification';
import { Pool } from 'pg';

const db = new Pool({ connectionString: process.env.DATABASE_URL });
const vahanClient = new VahanClient({
  parivahan: { apiKey: process.env.VAHAN_PARIVAHAN_API_KEY },
  surepass: { apiKey: process.env.VAHAN_SUREPASS_API_KEY },
  backup: { apiKey: process.env.VAHAN_BACKUP_API_KEY },
});
const complianceEngine = new ComplianceEngine(db);

// Verify RC
const vahanResponse = await vahanClient.verifyRC('KA01AB1234');

// Check compliance
const decision = await complianceEngine.checkCompliance({
  rcNumber: 'KA01AB1234',
  operatorId: 'OP001',
  vahanResponse,
  gpsLastPingAt: new Date(),
});

console.log(decision.status); // 'ALLOWED' | 'BLOCKED' | 'PENDING'
console.log(decision.reasonCodes);
```

### Batch Verification

```typescript
import { BatchWorker } from '@rodistaa/fleet-verification';

const batchWorker = new BatchWorker(db, vahanClient, complianceEngine, {
  concurrency: 10,
  batchSize: 100,
});

// Run nightly batch
const result = await batchWorker.runBatchVerification();
console.log(`Processed: ${result.totalProcessed}, Successful: ${result.successful}`);
```

### Trailer Linking

```typescript
import { TrailerLinker } from '@rodistaa/fleet-verification';

const trailerLinker = new TrailerLinker(db);

// Link trailer to tractor
const result = await trailerLinker.linkTrailerToTractor(
  'TRL001', // trailer RC
  'TRC001', // tractor RC
  'OP001'   // operator ID
);
```

## Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## Test Cases

### Expected Pass Cases

1. **SXL Classification**: RC with body_code=7, maker=TA TA, model=3521, tyres=12, gvw=35000, permit blank, fitness valid → **ALLOW** (Open Body TXL)
2. **BS6 Emission**: Vehicle with BS6 emission code → **ALLOW**
3. **Valid Permit**: Permit valid > 7 days → **ALLOW**

### Expected Fail Cases

1. **COWL Body Type**: RC with body_type containing "COWL" → **BLOCK**, reason: `INVALID_BODY_COWL`
2. **Duplicate Chassis**: Engine hash matching existing truck → **BLOCK**, reason: `DUPLICATE_CHASSIS`
3. **BS3 Emission**: Vehicle with BS3 emission code → **BLOCK**, reason: `BLOCKED_EMISSION_BS3`
4. **Trailer Without Tractor**: Trailer RC onboarding without linked tractor → **BLOCK**, reason: `PENDING_TRACTOR_PAIRING`
5. **GPS Stale**: No GPS ping for 61+ minutes → **BLOCK**, reason: `GPS_STALE_61_MINUTES`
6. **SXL Length Violation**: SXL cannot be > 20 ft (enforced in compliance engine)

## Fleet Matrix

The fleet matrix defines classifications:

- **SXL**: 2 axles, 6 tyres, 17-20 ft
- **DXL**: 3 axles, 10 tyres, 20-24 ft
- **TXL**: 4 axles, 12 tyres, 24-28 ft
- **QXL**: 5 axles, 14 tyres, 28-32 ft
- **PXL**: 5 axles, 16 tyres, 32-40 ft
- **HX**: 6 axles, 18 tyres, 38-42 ft
- **TRL**: Trailers, 18-22 tyres, 28-60 ft

See `data/rodistaa_fleet_matrix.json` for full specification.

## Blocked Types

- **Body Types**: TIPPER, DUMPER, TANKER, COWL, CHASSIS, CAB-CHASSIS
- **Emission Codes**: BS1, BS2, BS3
- **Permit Types**: TEMPORARY, PRIVATE, NON-TRANSPORT

## Retention Rules

- **VAHAN Snapshots**: 7 years retention
- **Compliance Cache**: 7 days TTL
- **Grace Period**: 48 hours for existing active trucks during provider outage

## Logging

All decisions are logged with:
- `reason_code`: Specific reason for allow/block
- `provider`: VAHAN provider used
- `txn_id`: Transaction ID from provider
- `timestamp`: Verification timestamp

## API Contract

See `docs/api_contract.md` for detailed API specifications.

## Troubleshooting

### Migration Errors

If migrations fail, ensure:
1. PostgreSQL is running
2. Database exists
3. User has CREATE TABLE permissions

### VAHAN Provider Failures

If all providers fail:
1. Check API keys in `.env`
2. Verify network connectivity
3. Check provider status pages
4. Review circuit breaker logs

### Compliance Cache Issues

If cache is not updating:
1. Check `cache_expires_at` in `vehicle_compliance_cache`
2. Verify batch worker is running
3. Check database connection

## Development

### Project Structure

```
packages/fleet-verification/
├── migrations/          # Database migrations
├── data/                # Seed data and codebooks
├── src/                 # TypeScript source
│   ├── vahanClient.ts  # Provider client
│   ├── normalizer.ts   # VAHAN response normalizer
│   ├── classifier.ts   # Fleet classification
│   ├── inference.ts    # Body length inference
│   ├── complianceEngine.ts  # Compliance rules
│   ├── batchWorker.ts  # Batch processing
│   ├── trailerLinker.ts  # Trailer management
│   └── ticketing.ts    # HQ tickets
├── tests/              # Jest tests
└── docs/               # Documentation
```

### Adding New Rules

1. Update `data/rodistaa_fleet_matrix.json`
2. Add rule logic in `complianceEngine.ts`
3. Add test cases in `tests/complianceEngine.test.ts`
4. Update documentation

## License

Proprietary - Rodistaa Internal Use Only

