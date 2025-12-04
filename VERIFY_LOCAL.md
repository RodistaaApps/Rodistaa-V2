# Local Verification Guide

This guide provides step-by-step instructions to verify the Rodistaa platform runs correctly in your local development environment.

## Prerequisites

- Node.js 20+ (LTS recommended)
- pnpm 8+
- Docker & Docker Compose
- Git

## Quick Start

```bash
# 1. Clone repository
git clone <repo-url>
cd Rodistaa

# 2. Bootstrap (installs deps, migrates DB, seeds data)
./dev bootstrap

# 3. Start all services
./dev start

# 4. Verify everything works
./verify-local.sh
```

## Step-by-Step Verification

### Step 1: Bootstrap

```bash
./dev bootstrap
```

**Expected Output:**
```
ℹ Starting bootstrap process...
ℹ Installing dependencies...
✓ Dependencies installed
ℹ Generating design tokens...
✓ Tokens generated
ℹ Building shared packages...
✓ Packages built
ℹ Starting Docker services...
✓ Postgres is ready
ℹ Running database migrations...
✓ Migrations complete
ℹ Seeding database...
✓ Seeds complete
✓ Bootstrap complete!
```

**What it does:**
- Installs all pnpm dependencies
- Generates design system tokens
- Builds shared packages
- Starts Docker services (Postgres, Redis, MinIO, Redpanda)
- Runs database migrations
- Seeds database with demo data

**Troubleshooting:**
- If Docker fails: Ensure Docker Desktop is running
- If migrations fail: Check `DATABASE_URL` in `.env`
- If seeds fail: Check database connection

### Step 2: Start Services

```bash
./dev start
```

**Expected Output:**
```
ℹ Starting all services...
ℹ Starting Docker services...
ℹ Starting backend API...
ℹ Starting mocks service...
ℹ Starting admin portal...
ℹ Starting franchise portal...
ℹ Starting Storybook...
ℹ Waiting for services to start...
ℹ Checking service health...
✓ Backend API is healthy
✓ Admin Portal is healthy
✓ Franchise Portal is healthy
✓ Mocks Service is healthy
✓ Storybook is healthy
✓ All services started!
```

**What it does:**
- Starts Docker infrastructure
- Starts backend API (port 4000)
- Starts mocks service (port 5000)
- Starts admin portal (port 3001)
- Starts franchise portal (port 3002)
- Starts Storybook (port 6006)

**Service URLs:**
- Backend API: http://localhost:4000
- Admin Portal: http://localhost:3001
- Franchise Portal: http://localhost:3002
- Storybook: http://localhost:6006
- Mocks: http://localhost:5000

### Step 3: Health Checks

```bash
# Check all services
./dev health

# Or manually
curl http://localhost:4000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "rodistaa-backend"
}
```

### Step 4: Database Verification

```bash
# Check seeded users
psql -h localhost -U postgres -d rodistaa_local -c "SELECT COUNT(*) FROM users;"

# Check seeded trucks
psql -h localhost -U postgres -d rodistaa_local -c "SELECT COUNT(*) FROM trucks;"

# Check seeded bookings
psql -h localhost -U postgres -d rodistaa_local -c "SELECT COUNT(*) FROM bookings;"
```

**Expected:**
- Users: > 10 (admin, shippers, operators, drivers)
- Trucks: > 5 (linked to operators)
- Bookings: > 5 (with bids)

### Step 5: API Verification

```bash
# Get bookings (should return array)
curl http://localhost:4000/api/bookings | jq '. | length'

# Get trucks
curl http://localhost:4000/api/trucks | jq '. | length'

# Health check
curl http://localhost:4000/health
```

**Expected:**
- Bookings API returns array with bookings
- Trucks API returns array with trucks
- Health check returns `{"status": "ok"}`

### Step 6: Portal Verification

**Admin Portal:**
1. Open http://localhost:3001
2. Should see login page
3. Login with: `admin@rodistaa.com` / `Admin@123`
4. Should see dashboard

**Franchise Portal:**
1. Open http://localhost:3002
2. Should see login page
3. Login with seeded franchise credentials
4. Should see dashboard

**Storybook:**
1. Open http://localhost:6006
2. Should see component library
3. Navigate through components

### Step 7: Automated Verification

```bash
./verify-local.sh
```

**What it does:**
- Builds all packages
- Runs linting
- Runs unit tests
- Checks service health
- Verifies database
- Tests API endpoints
- Runs Playwright tests (if available)
- Validates design tokens
- Security scan
- Collects logs and reports

**Expected Output:**
```
ℹ Starting Rodistaa Local Verification
ℹ Report directory: reports/local_run_20250104_120000

=== Step 1: Build & Lint ===
✓ Build successful
✓ Lint passed

=== Step 2: Unit Tests ===
✓ Unit tests passed

=== Step 3: Service Health Checks ===
✓ Backend API is healthy
✓ Admin Portal is healthy
✓ Franchise Portal is healthy
✓ Mocks Service is healthy
✓ Storybook is healthy

=== Step 4: Database Verification ===
✓ Database accessible
✓ Users seeded (15 users)
✓ Trucks seeded (8 trucks)

=== Step 5: API Smoke Tests ===
✓ Bookings API working (10 bookings)

=== Step 6: Playwright Portal Tests ===
✓ Playwright tests passed

=== Step 7: Design System Token Validation ===
✓ Token validation passed

=== Step 8: Security Check ===
✓ No secrets found in code

=== Verification Summary ===
Tests Passed: 15
Tests Failed: 0

✓ All verifications passed!
✓ Report archive created: reports/local_run_20250104_120000.zip
```

**Report Location:**
- Full report: `reports/local_run_<timestamp>/`
- ZIP archive: `reports/local_run_<timestamp>.zip`

## Common Issues

### Issue: Docker services not starting

**Solution:**
```bash
# Check Docker is running
docker ps

# Restart Docker services
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d

# Check logs
docker-compose -f docker-compose.dev.yml logs
```

### Issue: Database connection failed

**Solution:**
```bash
# Check Postgres is running
docker ps | grep postgres

# Check connection
psql -h localhost -U postgres -d rodistaa_local

# Reset database
./dev clean
./dev bootstrap
```

### Issue: Port already in use

**Solution:**
```bash
# Find process using port
lsof -i :4000  # or netstat -ano | findstr :4000 (Windows)

# Kill process or change port in .env
PORT=4001 pnpm run dev
```

### Issue: Services not responding

**Solution:**
```bash
# Check service logs
./dev logs backend
./dev logs admin-portal

# Restart services
./dev stop
./dev start
```

### Issue: Tests failing

**Solution:**
```bash
# Run tests individually
cd packages/backend
pnpm test

# Check test logs
cat reports/local_run_*/unit-tests.log
```

## Verification Checklist

- [ ] Bootstrap completes without errors
- [ ] All Docker services are healthy
- [ ] Backend API responds at http://localhost:4000/health
- [ ] Admin portal loads at http://localhost:3001
- [ ] Franchise portal loads at http://localhost:3002
- [ ] Storybook loads at http://localhost:6006
- [ ] Database has seeded data (users, trucks, bookings)
- [ ] API endpoints return data
- [ ] Unit tests pass
- [ ] Linting passes
- [ ] Playwright tests pass (if available)
- [ ] Token validation passes
- [ ] No secrets in code
- [ ] Verification script completes successfully

## Next Steps

After verification:
1. Review `reports/local_run_<timestamp>.zip` for detailed results
2. Check `ACTION_REQUIRED.md` for any external credentials needed
3. Read `docs/dev-setup.md` for development workflow
4. Start developing! 🚀

## Support

If you encounter issues:
1. Check logs: `./dev logs [service]`
2. Review verification report: `reports/local_run_<timestamp>/`
3. Check documentation: `docs/`
4. Create GitHub issue with:
   - Error messages
   - Verification report
   - Environment details (OS, Node version, etc.)

