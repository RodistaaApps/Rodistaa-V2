# Rodistaa Truck Master - Body Length & Tyre Count Onboarding

Production-ready module for truck onboarding with mandatory body length and tyre count collection, VAHAN verification, flagging, and franchise photo verification workflows.

## Features

- **Mandatory Dimensions**: Body length (ft) and tyre count collection during onboarding
- **VAHAN Verification**: Nightly batch verification with Parivahan (primary) → Surepass (fallback)
- **Flagging System**: Non-blocking flags for unusual configurations with escalation rules
- **Franchise Photo Verification**: Task assignment and photo verification workflows
- **Admin Dashboard**: Flag management, override actions, and ticket creation
- **Audit Trail**: Complete audit logging with 7-year retention
- **Security**: Encrypted RC copies, hashed chassis/engine numbers

## Tech Stack

- **Backend**: Node.js 18+, TypeScript, Fastify, PostgreSQL
- **Frontend**: React (TypeScript), React Native compatible
- **Testing**: Jest, React Testing Library
- **Security**: AES-256-GCM encryption, SHA256 hashing

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/rodistaa

# Encryption (REQUIRED)
ENCRYPTION_KEY=your-32-byte-encryption-key-here-!!

# JWT
JWT_SECRET=your-jwt-secret-key

# VAHAN Providers (Optional - will use mocks if not provided)
PARIVAHAN_API_KEY=your-parivahan-key
PARIVAHAN_BASE_URL=https://api.parivahan.gov.in
SUREPASS_API_KEY=your-surepass-key
SUREPASS_BASE_URL=https://api.surepass.io

# Franchise
DEFAULT_FRANCHISE_ID=FRANCHISE_001

# Server
PORT=3001
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Migrations

```bash
npm run migrate
```

This runs `migrations/001_create_truck_master_schema.sql` and `migrations/002_add_truck_dimensions.sql`.

### 3. Seed OEM Data

```bash
npm run migrate:seed
```

This loads `data/oem_model_bodylength_seed.sql` with typical tyre/length mappings.

### 4. Start Backend

```bash
npm start
```

Or for development:

```bash
npm run dev
```

### 5. Run Tests

```bash
npm test
```

With coverage:

```bash
npm run test:coverage
```

## API Documentation

See [docs/api_truck_master.md](./docs/api_truck_master.md) for complete API documentation.

### Key Endpoints

- `POST /api/operator/:operatorId/trucks` - Create truck with dimensions
- `GET /api/operator/:operatorId/trucks` - List trucks with filters
- `GET /api/trucks/:truckId` - Get truck details with flags and snapshots
- `POST /api/franchise/verify/:truckId` - Franchise photo verification
- `GET /api/admin/flags/dashboard` - Admin flag dashboard
- `POST /api/admin/trucks/:truckId/override` - Admin override actions

## Database Schema

### operator_trucks
- `tyre_count` (SMALLINT) - Allowed: 6,10,12,14,16,18,20,22
- `body_length_ft` (SMALLINT) - Allowed: 12-45 ft (see ALLOWED_BODY_LENGTHS)
- `body_type` (TEXT) - OPEN/CONTAINER/FLATBED/LOWBED/TRAILER/OTHER
- `flags` (JSONB) - Active flags array
- `flags_history` (JSONB) - Append-only history
- `vahan_snapshot` (JSONB) - Latest VAHAN verification data
- `rc_copy_bytea` (BYTEA) - Encrypted RC copy

### franchise_tasks
- Photo verification tasks with due dates (48h SLA)

### admin_tickets
- HQ tickets for escalations and discrepancies

### operator_truck_flags
- Flag history with resolution tracking

## Flag Codes

- `LENGTH_MISMATCH_WARNING` - Body length outside typical range (non-blocking)
- `TYRE_COUNT_UNUSUAL` - Tyre count unusual for maker/model
- `REQUIRES_PHOTO_VERIFICATION` - Requires franchise photo verification
- `PAYLOAD_TYRE_MISMATCH` - Payload inconsistent with tyre count/GVW
- `PERSISTENT_MISMATCH` - Same flag 3+ times (escalates to HQ)
- `VAHAN_DISCREPANCY` - Provider vs operator-declared mismatch
- `DUPLICATE_CHASSIS` - Chassis number already registered
- `DUPLICATE_ENGINE` - Engine number already registered

## Batch Worker

Nightly batch worker processes pending trucks:

```bash
# Run manually
node -r dotenv/config dist/jobs/batchWorker.js
```

Or schedule via cron:

```bash
0 2 * * * cd /path/to/truck-master && npm run batch-worker
```

See [docs/batch_worker_runbook.md](./docs/batch_worker_runbook.md) for configuration and monitoring.

## Frontend Components

- `TruckAddForm` - Single-screen onboarding form
- `TruckDetail` - Truck details with flags and snapshots
- `FranchiseTasks` - Photo verification task management
- `FlagToast` - Non-blocking flag notifications
- `FlagDashboard` - Admin flag management

## Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Integration tests
npm run test:integration
```

## Documentation

- [API Contract](./docs/api_truck_master.md)
- [Flagging Policy](./docs/flagging_policy.md)
- [Batch Worker Runbook](./docs/batch_worker_runbook.md)
- [Franchise SOP](./docs/franchise_sop_for_photo_verification.md)

## Security Notes

- **RC Copies**: Encrypted at rest using AES-256-GCM
- **Chassis/Engine**: Hashed with SHA256 for duplicate detection
- **Retention**: All sensitive data retained for 7 years
- **Audit Logging**: All admin actions and escalations logged

## Production Checklist

- [ ] Set `ENCRYPTION_KEY` environment variable (32+ bytes)
- [ ] Configure VAHAN provider API keys
- [ ] Set up database backups
- [ ] Configure batch worker cron schedule
- [ ] Set up monitoring dashboards (Prometheus metrics)
- [ ] Review and adjust flag severity thresholds
- [ ] Configure franchise assignment logic
- [ ] Test photo verification workflow end-to-end
- [ ] Verify retention policies

## Support

For issues or questions:
- Check documentation in `docs/`
- Review test files for usage examples
- See API docs for endpoint specifications

---

**Version**: 1.0.0
**Last Updated**: 2025-01-XX
