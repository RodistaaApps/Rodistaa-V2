# Rodistaa Platform - Developer Runbook

**Version**: 1.0  
**Last Updated**: 2025-01-02

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker Desktop (for Postgres + Redis)
- PostgreSQL 15+ (optional, Docker recommended)

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd rodistaa

# Install dependencies
pnpm install

# Start infrastructure
docker-compose up -d

# Run database migrations
cd packages/backend
pnpm migrate:local

# Start all services
cd ../..
pnpm dev:all
```

---

## 📁 Project Structure

```
rodistaa/
├── packages/
│   ├── app-shared/    # Shared domain models
│   ├── backend/       # Fastify API server
│   ├── acs/           # Anti-Corruption Shield
│   ├── mobile/        # React Native apps
│   ├── portal/        # Next.js portals
│   ├── mocks/         # Mock services
│   ├── infra/         # Infrastructure
│   └── tests/         # Test suite
├── api/               # OpenAPI spec
└── docs/              # Documentation
```

---

## 🔧 Development Workflow

### Backend Development

```bash
cd packages/backend

# Start development server
pnpm dev

# Run migrations
pnpm migrate:local

# Run tests
pnpm test
```

### Mobile Development

```bash
cd packages/mobile

# Start Shipper app
pnpm dev:shipper

# Start Operator app
pnpm dev:operator

# Start Driver app
pnpm dev:driver
```

### Portal Development

```bash
cd packages/portal

# Start development server
pnpm dev
```

### Mock Services

```bash
cd packages/mocks

# Start mock server
pnpm dev
```

---

## 🗄️ Database

### Migrations

```bash
cd packages/backend

# Run all migrations
pnpm migrate:local

# Create new migration
# (manual SQL file creation)
```

### Database Connection

Default connection (via Docker):
- Host: `localhost`
- Port: `5432`
- Database: `rodistaa_local`
- User: `rodistaa`
- Password: `rodistaa_dev`

### Seed Data

Seed data is included in `002_seed_data.sql`:
- 10 users (all roles)
- 5 trucks
- Sample bookings

---

## 🧪 Testing

### Unit Tests

```bash
cd packages/tests
pnpm test:unit
```

### E2E Tests

```bash
cd packages/tests
pnpm test:e2e
```

### Coverage

```bash
cd packages/tests
pnpm test:coverage
```

---

## 🔐 Environment Variables

### Backend

```env
PORT=4000
NODE_ENV=development
LOG_LEVEL=info

# Database
PGHOST=localhost
PGPORT=5432
PGUSER=rodistaa
PGPASSWORD=rodistaa_dev
PGDATABASE=rodistaa_local

# JWT
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRES_IN=15m

# ACS
ACS_ENABLED=true

# Adapters
ADAPTER_MODE=mock
```

### Mobile Apps

```env
EXPO_PUBLIC_API_URL=http://localhost:4000/v1
EXPO_PUBLIC_ENABLE_LOGGING=true
```

### Portal

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/v1
```

---

## 🐛 Troubleshooting

### Database Connection Issues

1. Check Docker is running: `docker ps`
2. Verify Postgres container: `docker-compose ps`
3. Check connection string in `.env`

### Port Conflicts

- Backend: Default port 4000
- Mock Services: Default port 3001
- Portal: Default port 3000

Change in respective `.env` files if conflicts occur.

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules packages/*/node_modules
pnpm install
```

---

## 📚 Key Documentation

- **Business Rules**: `docs/RODISTAA_MASTER_BUSINESS_FILE_v1.0.md`
- **API Spec**: `api/openapi.yaml`
- **Decisions**: `DECISIONS.md`
- **Security**: `SECURITY.md`

---

**For more details, see the main README.md**

