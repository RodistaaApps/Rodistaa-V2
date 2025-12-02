# Rodistaa ACS Service

**Anti-Corruption Shield (ACS) Service - Zero-Trust Business Firewall**

**Version**: 0.1.0  
**Status**: 🚧 **IN DEVELOPMENT**

---

## 🎯 Purpose

This service implements the Rodistaa Anti-Corruption Shield (ACS) system as defined in:
- `docs/RODISTAA_ANTI_CORRUPTION_SHIELD_v1.0.md` (Part 1)
- `docs/RODISTAA_ANTI_CORRUPTION_SHIELD_v1.0_PART2.md` (Part 2)
- `docs/acs_rules_top25.yaml` (Declarative Rules)

---

## 🚀 Quick Start

### Install

```bash
npm install
```

### Run Dev

```bash
cp .env.example .env
# update Postgres creds in .env
npm run dev
```

### Build

```bash
npm run build
npm start
```

---

## 📦 What This Provides

- **Express app** with ACS middleware for route-level pre-check enforcement
- **Basic Postgres model helpers** for `acs_blocks`, `audit_logs`, `pod_files`
- **Audit writer** that inserts records (placeholder hash function)
- **ACS service skeleton** (`quickReject`, `score`, `enforce`) — extend with rule engine

---

## 🏗️ Architecture

### Core Components

1. **API Gateway** (Express.js)
   - RESTful endpoints for ACS operations
   - Middleware stack for pre-checks
   - Rate limiting and throttling

2. **Policy Engine**
   - Rule registry (loads YAML rules)
   - Rule evaluator (DSL condition evaluation)
   - Action executor (enforcement actions)

3. **Database Layer** (PostgreSQL)
   - Audit logs (immutable, hash-chained)
   - ACS blocks (entity blocking)
   - POD files (duplicate detection)
   - Watchlist (risk tracking)
   - Override requests (admin overrides)

4. **Event System**
   - Event emission for real-time processing
   - Kafka/PubSub integration (future)
   - Audit event streaming

---

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 12+
- npm or pnpm

---

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# PostgreSQL Database Configuration
PGHOST=localhost
PGPORT=5432
PGUSER=rodistaa
PGPASSWORD=changeme
PGDATABASE=rodistaa_acs

# Service Configuration
PORT=4000
SERVICE_NAME=rodistaa-acs

# ACS Configuration
RISK_SCORE_THRESHOLD=60
OTP_RETRY_LIMIT=5

# Logging (Optional)
LOG_LEVEL=info

# Node Environment
NODE_ENV=development
```

### Database Setup

Run the migration:

```bash
# Using environment variables
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -f ../rodistaa_acs_migration_and_seed.sql

# Or manually
psql -h localhost -p 5432 -U rodistaa -d rodistaa_acs -f ../rodistaa_acs_migration_and_seed.sql
```

---

## 📁 Project Structure

```
acs-service/
├── src/
│   ├── index.ts              # Entry point
│   ├── server.ts             # Express server setup
│   ├── config/               # Configuration
│   ├── middleware/           # Express middleware
│   │   └── acsMiddleware.ts  # ACS pre-check middleware
│   ├── services/             # Business logic
│   │   ├── acsService.ts     # Core ACS orchestration
│   │   └── auditService.ts   # Audit logging wrapper
│   ├── routes/               # API routes
│   │   └── sampleRoutes.ts   # Sample route handlers
│   ├── models/               # Database models
│   │   └── acs.ts            # ACS models (audit, blocks, POD)
│   ├── db/                   # Database layer
│   │   ├── connection.ts     # DB connection & query helper
│   │   └── index.ts          # DB module exports
│   └── types/                # TypeScript types
│       └── index.ts          # Common type definitions
├── dist/                     # Compiled output
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🔌 API Endpoints

### Sample Protected Routes

- `POST /booking/create` - Create booking (ACS protected)
- `POST /pod/upload` - Upload POD (ACS protected)

### Admin Endpoints

- `GET /acs/blocks/:entityType/:entityId` - Get blocks for entity

### Health

- `GET /health` - Health check

---

## 🔧 Next Work (Recommended)

1. **Replace computeHash()** with SHA256 canonical JSON + KMS signer
2. **Wire real authentication** to enrich `ctx.user` in middleware
3. **Implement a real rule-evaluator** (load YAML rules, compile conditions)
4. **Implement event emission to Kafka** (pod.uploaded, gps.ping, etc.)
5. **Add metrics and tracing** for ACS rule latency (Prometheus / OpenTelemetry)
6. **Harden error handling** and fail-safe posture for rule engine failures

---

## 🔐 Security

- **Use managed Postgres with TLS**
- **Keep audit logs write-only** for the ACS service; restrict DB users
- **Store secrets in KMS/Secrets Manager**, do not store in `.env` in prod

---

## 📚 Related Documentation

- **ACS Part 1**: `../RODISTAA_ANTI_CORRUPTION_SHIELD_v1.0.md`
- **ACS Part 2**: `../RODISTAA_ANTI_CORRUPTION_SHIELD_v1.0_PART2.md`
- **Rules**: `../acs_rules_top25.yaml`
- **Migration**: `../rodistaa_acs_migration_and_seed.sql`

---

## 🧪 Testing

```bash
npm test
```

---

## 📝 License

Proprietary - Rodistaa Platform
