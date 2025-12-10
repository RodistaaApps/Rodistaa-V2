# Database Migrations

This directory contains Knex migrations for the Rodistaa platform database schema.

## Overview

Migrations are written in TypeScript and use Knex.js for database schema management. All migrations are version-controlled and can be run/rolled back safely.

## Migration Files

| Migration | Description | Tables Created |
|-----------|-------------|----------------|
| `20240102000001_initial_schema.ts` | Initial database schema | 17 tables |

### Tables Created

1. **users** - User accounts (shippers, operators, drivers, admins, franchise)
2. **kyc_records** - KYC verification records (encrypted)
3. **trucks** - Truck registrations
4. **truck_documents** - Truck document uploads (RC, insurance, permits, fitness)
5. **truck_inspections** - Inspection records with photos
6. **bookings** - Booking requests from shippers
7. **bids** - Operator bids on bookings
8. **shipments** - Active shipments (after bid finalization)
9. **gps_logs** - GPS tracking pings during transit
10. **pod_files** - Proof of delivery uploads
11. **audit_logs** - System audit trail
12. **acs_blocks** - ACS (Anti-Corruption Shield) blocks
13. **watchlist** - Entities under manual review
14. **ledgers** - Operator ledger (credits/debits)
15. **override_requests** - Admin override requests
16. **franchises** - Franchise units and districts
17. **notifications** - Push notifications

## Configuration

Database configuration is managed via `knexfile.js` which supports multiple environments:

- **local** - Local development (Docker Postgres)
- **development** - Development server
- **staging** - Staging environment
- **production** - Production environment

Environment variables are read from `.env` file (see `.env.example`).

## Running Migrations

### Prerequisites

1. **Start Local Database**:
   ```bash
   # From repo root
   docker compose up -d postgres redis
   ```

2. **Set Environment Variables**:
   ```bash
   cp packages/backend/.env.example packages/backend/.env
   # Edit .env with your local database credentials
   ```

### Run Migrations

```bash
# From repo root
cd packages/backend

# Run all pending migrations
npx knex migrate:latest --env local

# Or use the npm script
pnpm migrate:local
```

### Check Migration Status

```bash
# List completed migrations
npx knex migrate:list --env local

# Show current migration version
npx knex migrate:currentVersion --env local
```

### Rollback Migrations

```bash
# Rollback last batch
npx knex migrate:rollback --env local

# Rollback all migrations
npx knex migrate:rollback --all --env local
```

### Create New Migration

```bash
# Create a new migration file
npx knex migrate:make migration_name --env local
```

## Running Seeds

Seed data provides sample records for local development and testing.

```bash
# Run all seeds
npx knex seed:run --env local

# Or use the npm script
pnpm seed:local
```

### Seed Data Includes

- 4 Users (shipper, operator, driver, admin)
- 3 Trucks (various types and capacities)
- 3 Truck documents (RC, insurance, fitness)
- 3 Bookings (open and negotiation status)
- 2 Bids
- 2 Ledger entries
- 3 Franchises (HQ, district, unit)
- 2 Notifications

## Schema Conventions

### ID Formats

All entity IDs follow ULID-based conventions (see `DECISIONS.md` Decision 014):

- Users: `USR-<role>-<ulid>`
- Trucks: `TRK-<regno>-<ulid>`
- Bookings: `RID-YYYYMMDD-xxxx`
- Shipments: `SH-<ulid>`
- Bids: `BK-<ulid>`
- POD: `POD-<ulid>`
- KYC: `KYC-<ulid>`
- Blocks: `BLK-<ulid>`
- Overrides: `OVR-<ulid>`
- Ledgers: `LDG-<ulid>`
- Inspections: `INS-<ulid>`
- Audit: `AUD-<ulid>`

### Timestamps

All tables use `TIMESTAMPTZ` for timestamps (UTC).

### JSON Columns

JSONB is used for:
- Location data (`pickup`, `drop` in bookings)
- Goods info in bookings
- Coverage areas in franchises
- Metadata in audit logs and blocks
- Photo arrays in inspections

### Encrypted Data

Sensitive data is encrypted using AES-256-GCM:
- KYC documents (`encrypted_data` column)
- Mobile numbers in users (stored as masked + encrypted full)

## Database Schema Diagram

```
users (id, mobile, role, kyc_status)
  │
  ├─→ kyc_records (id, user_id, encrypted_data)
  ├─→ trucks (id, operator_id, registration_number)
  │    ├─→ truck_documents (id, truck_id, document_type, expiry_date)
  │    └─→ truck_inspections (id, truck_id, status, photos)
  │
  ├─→ bookings (id, shipper_id, pickup, drop, status)
  │    └─→ bids (id, booking_id, operator_id, amount)
  │         └─→ shipments (id, booking_id, bid_id, driver_id, truck_id)
  │              ├─→ gps_logs (id, shipment_id, coordinates)
  │              └─→ pod_files (id, shipment_id, file_url)
  │
  ├─→ ledgers (id, operator_id, type, amount, balance_after)
  ├─→ audit_logs (id, entity_type, entity_id, action)
  ├─→ acs_blocks (id, entity_type, entity_id, severity)
  └─→ override_requests (id, entity_type, entity_id, status)

franchises (id, type, parent_id)
notifications (id, user_id, title, body)
watchlist (id, entity_type, entity_id)
```

## Indexes

Indexes are created for:
- Foreign keys
- Frequently queried fields (status, created_at)
- Composite indexes for common query patterns
- Unique constraints where applicable

## Constraints

- Foreign key constraints with `ON DELETE CASCADE` where appropriate
- Enum constraints for status fields
- Check constraints for data validation
- Unique constraints for business rules (e.g., registration_number)

## Troubleshooting

### Error: "database does not exist"

```bash
# Create database manually
docker exec -it rodistaa-postgres psql -U postgres -c "CREATE DATABASE rodistaa_local;"
```

### Error: "relation already exists"

```bash
# Drop and recreate database
docker exec -it rodistaa-postgres psql -U postgres -c "DROP DATABASE rodistaa_local;"
docker exec -it rodistaa-postgres psql -U postgres -c "CREATE DATABASE rodistaa_local;"

# Run migrations again
pnpm migrate:local
```

### Error: "password authentication failed"

Check your `.env` file and ensure database credentials match Docker compose configuration.

## Production Migrations

For production deployments:

```bash
# Set environment to production
export NODE_ENV=production

# Run migrations
npx knex migrate:latest --env production

# Verify
npx knex migrate:list --env production
```

**Important**: Always test migrations on staging before running on production.

## References

- [Knex.js Documentation](https://knexjs.org/)
- [Knex Migrations Guide](https://knexjs.org/guide/migrations.html)
- Rodistaa `DECISIONS.md` - Decision 014 (ID Formats)
- OpenAPI Spec: `api/openapi.yaml`

