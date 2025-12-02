# Running Rodistaa Locally - Complete Guide

This guide provides step-by-step instructions for running the complete Rodistaa platform on your local development machine.

---

## Prerequisites

### Required Software
- **Node.js**: >= 18.0.0 (LTS recommended)
- **pnpm**: >= 8.0.0 (`npm install -g pnpm@8`)
- **Docker**: >= 20.10.0 (for Postgres and Redis)
- **Docker Compose**: >= 2.0.0
- **PostgreSQL**: 15+ (or use Docker Compose)
- **Git**: >= 2.30.0

### Optional Software
- **Postman** or **curl**: For API testing
- **pgAdmin** or **psql**: For database inspection
- **VS Code**: Recommended IDE with extensions:
  - ESLint
  - Prettier
  - REST Client
  - Docker

---

## Quick Start (5 Minutes)

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/rodistaa/rodistaa.git
cd rodistaa

# Install all dependencies
pnpm install
```

### 2. Start Infrastructure

```bash
# Start Postgres and Redis
docker-compose up -d

# Wait for services to be ready (30 seconds)
docker-compose ps
```

### 3. Configure Environment

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your settings (or use defaults for local dev)
# Required variables:
# - DATABASE_URL (default: postgresql://rodistaa_user:password@localhost:5432/rodistaa_dev)
# - JWT_SECRET (generate: openssl rand -base64 32)
# - LOCAL_KMS_KEY_ID (default: kyc-encryption-key-dev)
```

### 4. Setup Database

```bash
# Run migrations
cd packages/backend
pnpm knex migrate:latest

# Run seeds (optional, for test data)
pnpm knex seed:run

cd ../..
```

### 5. Build and Start

```bash
# Build all packages
pnpm -r build

# Start backend server
cd packages/backend
pnpm dev

# Server starts on http://localhost:4000
```

### 6. Verify Installation

```bash
# Test health endpoint
curl http://localhost:4000/health

# Expected response:
# {"status":"ok","timestamp":"2025-02-01T..."}
```

---

## Detailed Setup Guide

### Step 1: Environment Setup

#### Option A: Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# Expected output:
# postgres    running    5432/tcp
# redis       running    6379/tcp
```

#### Option B: Local PostgreSQL

```bash
# Install PostgreSQL 15+
# Create database and user
psql -U postgres
CREATE DATABASE rodistaa_dev;
CREATE USER rodistaa_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE rodistaa_dev TO rodistaa_user;
\q

# Update .env with your connection string
DATABASE_URL=postgresql://rodistaa_user:password@localhost:5432/rodistaa_dev
```

### Step 2: Environment Variables

Create `.env` file in project root:

```env
# Server Configuration
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL=postgresql://rodistaa_user:password@localhost:5432/rodistaa_dev

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-too

# Local KMS (for development)
LOCAL_KMS_KEY_ID=kyc-encryption-key-dev

# ACS Configuration
ACS_RULES_PATH=./acs_rules_top25.yaml

# Adapter Mode (MOCK for local development)
ADAPTER_MODE=MOCK

# Logging
LOG_LEVEL=debug
```

### Step 3: Database Setup

```bash
cd packages/backend

# Run migrations (creates all tables)
pnpm knex migrate:latest

# Verify tables created
psql $DATABASE_URL -c "\dt"

# Expected tables:
# users, kyc_records, trucks, bookings, bids, shipments,
# drivers, ledgers, audit_logs, acs_blocks, etc.

# Load seed data (optional - creates test users)
pnpm knex seed:run

# Verify seed data
psql $DATABASE_URL -c "SELECT id, phone, role FROM users LIMIT 5;"
```

### Step 4: Build Packages

```bash
# Return to project root
cd ../..

# Build all packages in dependency order
pnpm --filter @rodistaa/app-shared build
pnpm --filter @rodistaa/acs build
pnpm --filter @rodistaa/backend build

# Or build all at once
pnpm -r build
```

### Step 5: Start Development Server

```bash
# Start backend with hot reload
cd packages/backend
pnpm dev

# Server logs should show:
# [backend] Server listening on port 4000
# [acs-rule-loader] Loaded 25 ACS rules
# [backend] Database connected
# [backend] Server ready
```

---

## Testing the Installation

### 1. Health Check

```bash
curl http://localhost:4000/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-02-01T10:30:00.000Z",
  "uptime": 123.456
}
```

### 2. Readiness Check

```bash
curl http://localhost:4000/ready
```

**Expected Response**:
```json
{
  "status": "ready",
  "database": "connected",
  "acs": "loaded"
}
```

### 3. API Test - Login Flow

```bash
# 1. Request OTP
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "deviceId": "test-device-123"
  }'

# Expected: {"success": true, "message": "OTP sent"}

# 2. Verify OTP (use test OTP: 123456 in development)
curl -X POST http://localhost:4000/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "otp": "123456",
    "deviceId": "test-device-123"
  }'

# Expected: {"accessToken": "...", "refreshToken": "..."}
```

### 4. ACS Rule Testing

```bash
cd packages/acs

# Test GPS jump anomaly
pnpm test-event gps-jump

# Expected: Matched rule RF05_GPS_JUMP_ANOMALY
```

---

## Development Workflow

### Running Individual Packages

```bash
# Backend API
cd packages/backend
pnpm dev              # Start with hot reload
pnpm build            # Build for production
pnpm test             # Run unit tests

# ACS Engine
cd packages/acs
pnpm dev              # Build with watch mode
pnpm cli              # Run CLI tool
pnpm test-event gps-jump  # Test specific event
pnpm rule-lint        # Lint rules file

# App Shared (Types)
cd packages/app-shared
pnpm build            # Build types
pnpm test             # Run unit tests
```

### Database Operations

```bash
cd packages/backend

# Run new migration
pnpm knex migrate:latest

# Rollback last migration
pnpm knex migrate:rollback

# Check migration status
pnpm knex migrate:status

# Run seeds
pnpm knex seed:run

# Create new migration
pnpm knex migrate:make migration_name
```

### Debugging

```bash
# Enable debug logging
export LOG_LEVEL=debug

# Start backend with debugger
cd packages/backend
node --inspect dist/index.js

# Or use VS Code debugger (launch.json configured)
```

---

## Common Tasks

### Create a Booking (Full Flow)

```bash
# 1. Login as shipper
TOKEN=$(curl -X POST http://localhost:4000/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210","otp":"123456","deviceId":"dev-1"}' \
  | jq -r '.accessToken')

# 2. Create booking
curl -X POST http://localhost:4000/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fromCity": "Bengaluru",
    "toCity": "Chennai",
    "pickupDate": "2025-02-05",
    "weightTons": 10,
    "bodyType": "Open",
    "tyres": 10
  }'

# 3. View bookings
curl http://localhost:4000/bookings \
  -H "Authorization: Bearer $TOKEN"
```

### Test ACS Rules

```bash
cd packages/acs

# Test different event types
pnpm test-event gps-jump          # GPS anomaly
pnpm test-event pod-duplicate     # POD reuse detection
pnpm test-event otp-brute-force   # OTP security
pnpm test-event inspection-geo    # Inspection validation
pnpm test-event kyc-mandatory     # KYC enforcement
```

### View Audit Logs

```bash
# Connect to database
psql $DATABASE_URL

# Query latest audit entries
SELECT id, rule_id, entity_type, entity_id, action, timestamp, audit_hash, prev_hash
FROM audit_logs
ORDER BY timestamp DESC
LIMIT 10;

# Verify audit chain for specific entity
SELECT id, audit_hash, prev_hash, timestamp
FROM audit_logs
WHERE entity_type = 'shipment' AND entity_id = 'SH-...'
ORDER BY timestamp ASC;
```

---

## Troubleshooting

### Database Connection Fails

**Symptom**: `Error: connect ECONNREFUSED localhost:5432`

**Solution**:
```bash
# Check if Postgres is running
docker-compose ps

# Restart Postgres
docker-compose restart postgres

# Check logs
docker-compose logs postgres

# Verify connection manually
psql postgresql://rodistaa_user:password@localhost:5432/rodistaa_dev
```

### Build Errors

**Symptom**: `Cannot find module '@rodistaa/app-shared'`

**Solution**:
```bash
# Rebuild all packages in dependency order
pnpm install
pnpm --filter @rodistaa/app-shared build
pnpm --filter @rodistaa/acs build
pnpm --filter @rodistaa/backend build
```

### ACS Rules Not Loading

**Symptom**: `Error: Rule file not found`

**Solution**:
```bash
# Check ACS_RULES_PATH in .env
cat .env | grep ACS_RULES_PATH

# Verify file exists
ls -la acs_rules_top25.yaml

# Update path if needed
export ACS_RULES_PATH=./acs_rules_top25.yaml
```

### Port Already in Use

**Symptom**: `Error: listen EADDRINUSE :::4000`

**Solution**:
```bash
# Find process using port 4000
lsof -i :4000  # macOS/Linux
netstat -ano | findstr :4000  # Windows

# Kill process or use different port
export PORT=4001
```

---

## Development Tips

### Hot Reload

All packages support hot reload:
```bash
# Backend hot reload
cd packages/backend
pnpm dev

# ACS hot reload (watch rules file)
cd packages/acs
pnpm dev
```

### Testing

```bash
# Run all tests
pnpm -r test

# Run specific package tests
pnpm --filter @rodistaa/acs test
pnpm --filter @rodistaa/backend test

# Run tests in watch mode
pnpm --filter @rodistaa/acs test --watch
```

### Linting

```bash
# Lint all packages
pnpm -r lint

# Fix auto-fixable issues
pnpm -r lint --fix

# Type checking
pnpm -r typecheck
```

---

## Advanced Configuration

### Custom Database

```env
# Use external Postgres
DATABASE_URL=postgresql://user:pass@db.example.com:5432/rodistaa

# Connection pool settings
DB_POOL_MIN=2
DB_POOL_MAX=10
```

### ACS Configuration

```env
# Custom rules file
ACS_RULES_PATH=/path/to/custom_rules.yaml

# ACS logging
ACS_LOG_LEVEL=debug

# System config
OTP_RETRY_LIMIT=5
SPOOF_THRESHOLD=0.8
MAX_GEO_ACCURACY_METERS=100
```

### Adapter Mode

```env
# Use MOCK adapters (no external dependencies)
ADAPTER_MODE=MOCK

# Or use REAL adapters (requires external services)
ADAPTER_MODE=REAL
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
GOOGLE_MAPS_API_KEY=...
```

---

## Production Deployment

For production deployment, see:
- `PRODUCTION_DEPLOYMENT_GUIDE.md`
- `RELEASE_GUIDE.md`
- `.github/workflows/deploy.yml`

---

## Support

### Documentation
- `README.md` - Project overview
- `RODISTAA_DEVELOPER_HANDBOOK.md` - Developer guide
- `packages/acs/README.md` - ACS usage guide
- `VERIFY.md` - Verification procedures
- `DECISIONS.md` - Technical decisions

### Getting Help
- Check `TROUBLESHOOTING.md`
- Review logs: `tail -f logs/*.log`
- Enable debug logging: `LOG_LEVEL=debug`

---

## Quick Reference

### Start Everything
```bash
docker-compose up -d && pnpm -r build && cd packages/backend && pnpm dev
```

### Stop Everything
```bash
cd packages/backend
# Press Ctrl+C to stop backend
cd ../..
docker-compose down
```

### Reset Database
```bash
cd packages/backend
pnpm knex migrate:rollback --all
pnpm knex migrate:latest
pnpm knex seed:run
```

### View Logs
```bash
# Backend logs
tail -f packages/backend/logs/*.log

# Docker logs
docker-compose logs -f postgres
docker-compose logs -f redis
```

---

**Ready to develop!** 🚀

For questions, see documentation or contact the development team.

