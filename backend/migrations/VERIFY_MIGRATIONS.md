# Migration Verification Guide

This document provides steps to verify database migrations work correctly.

## Prerequisites

### Option 1: Docker (Recommended)

```bash
# Start Postgres container
docker compose up -d postgres

# Verify container is running
docker ps | findstr postgres
```

### Option 2: Local Postgres Installation

Install PostgreSQL 15+ on Windows:
1. Download from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Create database: `CREATE DATABASE rodistaa_local;`

### Option 3: Cloud Postgres (Temporary Testing)

Use a free cloud Postgres instance:
- Neon.tech
- Supabase
- ElephantSQL

Update `.env` with connection details.

## Verification Steps

### 1. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your database credentials
# For Docker (default):
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rodistaa_local
DB_USER=postgres
DB_PASSWORD=postgres
```

### 2. Run Migrations

```bash
# From packages/backend directory
cd packages/backend

# Run migrations
pnpm migrate:latest

# Expected output:
# 🚀 Running migrations...
# ✅ Batch 1 run: 1 migrations
#    - 20240102000001_initial_schema.ts
# 
# 📊 Database status:
#    Tables created: 18 (17 tables + knex_migrations)
#    - acs_blocks
#    - audit_logs
#    - bids
#    - bookings
#    - franchises
#    - gps_logs
#    - kyc_records
#    - ledgers
#    - notifications
#    - override_requests
#    - pod_files
#    - shipments
#    - truck_documents
#    - truck_inspections
#    - trucks
#    - users
#    - watchlist
# 
# ✅ Migrations complete!
```

### 3. Verify Tables Created

```bash
# Check migration status
npx knex migrate:list --env local

# Expected output:
# Batch 1 - run: 1
#   20240102000001_initial_schema.ts
```

### 4. Run Seeds

```bash
# Run seed data
pnpm seed:local

# Expected output:
# 🌱 Running seeds...
# ✅ Executed 1 seed files:
#    - 001_initial_seed.ts
# 
# 📊 Sample data created:
#    Users: 4
#    Trucks: 3
#    Bookings: 3
#    Bids: 2
# 
# ✅ Seeds complete!
```

### 5. Query Sample Data

```bash
# Connect to database
psql -h localhost -U postgres -d rodistaa_local

# Run sample queries
SELECT id, name, role FROM users;
SELECT id, registration_number, status FROM trucks;
SELECT id, status, tonnage FROM bookings;
SELECT id, booking_id, amount, status FROM bids;

# Check row counts
SELECT 'users' as table_name, COUNT(*) as rows FROM users
UNION ALL SELECT 'trucks', COUNT(*) FROM trucks
UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL SELECT 'bids', COUNT(*) FROM bids;
```

### 6. Test Rollback

```bash
# Rollback last migration
pnpm migrate:rollback

# Expected output:
# Batch 1 rolled back: 1 migrations

# Re-run migration
pnpm migrate:latest
```

### 7. Test Full Reset

```bash
# Reset database (rollback all + migrate + seed)
pnpm db:reset

# Expected output:
# Rolled back all migrations
# Ran 1 migrations
# Seeded database with sample data
```

## Manual Verification (Without Running Migrations)

If you don't have a database available, you can still verify the migration files:

### 1. TypeScript Compilation

```bash
# Compile TypeScript migrations
cd packages/backend
npx tsc --noEmit migrations/*.ts

# Expected: No errors
```

### 2. Knex CLI Validation

```bash
# Check Knex configuration
npx knex --version

# List migrations (doesn't require DB connection)
ls migrations/

# Expected output:
# 20240102000001_initial_schema.ts
```

### 3. Manual SQL Review

Review the generated SQL:

```bash
# View migration file
cat migrations/20240102000001_initial_schema.ts
```

Verify:
- ✅ All 17 tables defined
- ✅ Foreign key relationships correct
- ✅ Indexes on frequently queried columns
- ✅ Enum constraints for status fields
- ✅ NOT NULL constraints on required fields
- ✅ Default values where appropriate

## Expected Schema Structure

After migrations, the database should have:

**17 Core Tables**:
1. users
2. kyc_records
3. trucks
4. truck_documents
5. truck_inspections
6. bookings
7. bids
8. shipments
9. gps_logs
10. pod_files
11. audit_logs
12. acs_blocks
13. watchlist
14. ledgers
15. override_requests
16. franchises
17. notifications

**System Tables**:
- knex_migrations (tracking table)
- knex_migrations_lock (locking table)

## Common Issues

### Issue: "database does not exist"

**Solution**:
```bash
# Create database
docker exec -it <postgres-container-name> createdb -U postgres rodistaa_local

# Or via psql
docker exec -it <postgres-container-name> psql -U postgres -c "CREATE DATABASE rodistaa_local;"
```

### Issue: "relation already exists"

**Solution**:
```bash
# Rollback and re-run
pnpm migrate:rollback
pnpm migrate:latest
```

### Issue: "knex: Required configuration option 'client' is missing"

**Solution**: Ensure `knexfile.js` is in the correct location (`packages/backend/knexfile.js`)

## CI/CD Integration

For automated testing in CI:

```yaml
# .github/workflows/test.yml
- name: Start Postgres
  run: docker compose up -d postgres

- name: Wait for Postgres
  run: sleep 5

- name: Run Migrations
  run: |
    cd packages/backend
    pnpm migrate:latest

- name: Run Seeds
  run: |
    cd packages/backend
    pnpm seed:run

- name: Verify Tables
  run: |
    docker exec postgres psql -U postgres -d rodistaa_local -c "\dt"
```

## Next Steps

After verifying migrations work:

1. Integrate with backend API (use Knex query builder in services)
2. Add migration rollback tests
3. Document data migration procedures
4. Set up automated backups for production

