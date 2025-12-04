# Rodistaa Truck Master Service

Production-ready truck master information service with VAHAN verification, compliance checking, and frontend components.

## Overview

This service provides:
- **Truck Onboarding**: Operator enters RC number, stores encrypted RC copy, marks as PENDING_VERIFICATION
- **VAHAN Verification**: Nightly batch job with failover (Parivahan → Surepass → Backup)
- **Compliance Engine**: Rule-based compliance checking with 7-day cache TTL
- **Frontend Components**: React components for onboarding, detail view, search, and HQ ticketing
- **HQ Ticketing**: Discrepancy tracking and resolution workflow

## Installation

```bash
cd packages/truck-master
pnpm install
```

## Database Setup

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/rodistaa
ENCRYPTION_KEY=your-32-byte-encryption-key-here
JWT_SECRET=your-jwt-secret-key

# VAHAN Provider Credentials
VAHAN_PARIVAHAN_API_KEY=your_parivahan_key (if available)
VAHAN_SUREPASS_API_KEY=your_surepass_key
VAHAN_BACKUP_API_KEY=your_backup_key
```

### Run Migrations

```bash
# Run database migrations
pnpm run migrate
```

### Seed OEM Data

```bash
# Seed OEM model mappings
pnpm run migrate:seed
```

## Running the Service

```bash
# Development
pnpm run dev

# Production
pnpm run build
pnpm start
```

The service will start on port 3001 (configurable via `PORT` environment variable).

## API Endpoints

### Create Truck
```
POST /api/operator/:operatorId/trucks
Body: {
  rc_number: string;
  nickname?: string;
  rc_copy?: string; // Base64 encoded
  is_tractor?: boolean;
  is_trailer?: boolean;
  legal_authorization_accepted?: boolean;
}
```

### List Operator Trucks
```
GET /api/operator/:operatorId/trucks
```

### Get Truck Master Detail
```
GET /api/trucks/:rc
```

### Raise Ticket
```
POST /api/trucks/:rc/raise-ticket
Body: {
  ticket_type: string;
  payload: any;
}
```

### Get Tickets (HQ)
```
GET /api/tickets?status=OPEN&type=PROVIDER_MISMATCH&limit=100
```

## Batch Worker

The nightly batch worker verifies trucks with expired cache or pending verification:

```typescript
import { BatchWorker, VahanClient } from '@rodistaa/truck-master';

const vahanClient = new VahanClient({
  parivahan: { apiKey: process.env.VAHAN_PARIVAHAN_API_KEY },
  surepass: { apiKey: process.env.VAHAN_SUREPASS_API_KEY },
  backup: { apiKey: process.env.VAHAN_BACKUP_API_KEY },
});

const batchWorker = new BatchWorker(vahanClient, {
  concurrency: 10,
  batchSize: 100,
});

// Run nightly
const result = await batchWorker.runBatchVerification();
```

Schedule this to run nightly via cron or job scheduler.

## Frontend Components

### TruckOnboardForm
Mobile-first onboarding form with RC number input, RC copy upload, and tractor/trailer toggle.

### TruckDetailCard
Displays truck master info with tabs: Overview, VAHAN Snapshot, Inference, Compliance History, Links, Tickets.

### TruckSearchFilter
Client-facing search filters for category (Small/Medium/Heavy/Super Heavy/Trailer) and body type.

### HQTicketList
HQ ticket UI for compliance team to view and resolve discrepancies.

## Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## Key Rules Implementation

### Blocking Rules
- **Body Types**: TIPPER, DUMPER, TANKER, COWL, CHASSIS, CAB-CHASSIS (from `config/body_regex.json`)
- **Emission**: BS3 and below blocked (BS4 and BS6 allowed)
- **Category**: GOODS-only required
- **Duplicate Chassis**: Blocked across operators
- **GPS Heartbeat**: Block if no ping > 60 minutes
- **Trailer Pairing**: Trailer cannot bid without linked tractor

### Length Constraints
- **SXL**: Max 20 ft
- **DXL**: Max 24 ft
- **TXL**: Max 28 ft
- **QXL**: Max 32 ft
- **PXL**: Max 40 ft
- **HX**: Max 42 ft
- **TRL**: Max 60 ft

### Permit Rules
- Blank permit allowed (inconsistent VAHAN fields)
- Block TEMPORARY, PRIVATE, NON-TRANSPORT permits
- Block if expiry < 7 days

## Security

- **RC Copy Encryption**: AES-256-GCM encryption at rest
- **Chassis/Engine Hashing**: SHA256 hashes only stored (no plain text)
- **JWT Authentication**: Protected API endpoints
- **Retention**: 7 years for all snapshots and audit logs

## Observability

- **Metrics**: Batch success rate, provider errors, tickets created, blocked counts
- **Logs**: Provider txn_id, rule reasons, decisions
- **Audit Trail**: All verification events logged with rules_applied

## Scalability

- Batch worker supports horizontal scaling
- Concurrency control (configurable)
- Database job queue ready
- Supports 10k+ truck verification nightly

## Configuration Files

- `config/body_regex.json` - Blocked body type patterns (editable without code deploy)
- `config/tyre_gvw_rules.json` - Tyre count vs GVW sanity ranges
- `data/rodistaa_fleet_matrix.json` - Master fleet classification matrix

## Documentation

- `docs/api_contract.md` - API specifications
- `docs/runbook_batch_worker.md` - Batch worker runbook
- `docs/security.md` - Security policies
- `docs/acceptance_criteria.md` - Test cases and expected outputs

## Troubleshooting

### Migration Errors
1. Ensure PostgreSQL is running
2. Database exists and user has CREATE TABLE permissions
3. Check DATABASE_URL format

### VAHAN Provider Failures
1. Verify API keys in `.env`
2. Check network connectivity
3. Review circuit breaker logs
4. Check provider status pages

### Compliance Cache Issues
1. Check `cache_expires_at` in `vehicle_compliance_cache`
2. Verify batch worker is running
3. Check database connection

## License

Proprietary - Rodistaa Internal Use Only

