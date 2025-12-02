# Rodistaa Technical Decisions Log

This document records all major technical decisions made during the Rodistaa platform development, including rationale, trade-offs, and rollback strategies.

---

## Decision 001: Monorepo Architecture with pnpm Workspaces

**Date**: 2025-01-02  
**Status**: ✅ Approved  
**Decision Maker**: Autonomous AI CTO

### Decision

Use a **monorepo architecture** with **pnpm workspaces** to manage all Rodistaa packages in a single repository.

### Rationale

1. **Single Source of Truth**: Shared domain models, policy rules, UI components, and infrastructure code in one place
2. **Coordinated Releases**: All apps and services can be versioned and released together
3. **Code Sharing**: Easy sharing of TypeScript types, DTOs, business logic, and UI tokens
4. **Centralized CI/CD**: Single CI pipeline ensures consistency across all packages
5. **Atomic Changes**: Cross-package changes can be made atomically with proper testing

### Trade-offs

**Pros:**
- Reduced duplication of shared code
- Easier refactoring across packages
- Simplified dependency management
- Faster local development (shared node_modules)

**Cons:**
- Larger repository size
- Requires disciplined dependency management
- CI/CD can be slower for large changesets

### Package Structure

```
rodistaa/
├── packages/
│   ├── backend/          # Node.js + TypeScript backend API
│   ├── portal/           # Next.js admin + franchise portals
│   ├── app-shared/       # Shared types, DTOs, UI tokens
│   ├── mobile/           # React Native apps (shipper/operator/driver)
│   ├── acs/              # Anti-Corruption Shield engine
│   ├── mocks/            # Local mocks for external services
│   ├── infra/            # Terraform/Helm IaC
│   └── tests/            # Shared test utilities
├── api/
│   └── openapi.yaml      # OpenAPI v3 specification
└── docs/                 # Business documentation
```

### Rollback Strategy

If monorepo proves unmanageable:
1. Extract packages to separate repos using git subtree or filter-branch
2. Maintain shared packages as npm packages
3. Update CI/CD pipelines accordingly

---

## Decision 002: Technology Stack Selection

**Date**: 2025-01-02  
**Status**: ✅ Approved  
**Decision Maker**: Autonomous AI CTO

### Decision

**Backend Stack:**
- Node.js 20+ with TypeScript
- Fastify (over Express) for performance
- PostgreSQL (primary transactional DB)
- Redis (caching, rate-limiting, ephemeral state)
- In-memory queue (local) / Kafka (production)
- Neo4j Aura (preferred) or JanusGraph for collusion detection graphs

**Mobile Stack:**
- React Native with TypeScript
- Expo-managed workflow
- Secure storage for tokens and KYC assets

**Web Portal Stack:**
- Next.js 14+ with TypeScript
- Ant Design for desktop UI
- Rodistaa branding theme

### Rationale

**Fastify over Express:**
- Better performance (benchmarks show 2-3x throughput)
- Built-in schema validation
- Better TypeScript support
- Lower overhead for high-throughput API

**PostgreSQL:**
- ACID compliance for financial transactions
- JSONB support for flexible schemas
- Strong ecosystem and tooling
- Proven at scale

**Neo4j over JanusGraph:**
- Neo4j Aura provides managed service (lower ops overhead)
- Better query performance for graph traversals
- Simpler deployment for India-only scale

### Trade-offs

**Pros:**
- Modern, performant stack
- Strong TypeScript support across stack
- Good ecosystem and community support

**Cons:**
- Team needs to be proficient in TypeScript/Node.js
- Fastify has smaller ecosystem than Express

### Rollback Strategy

- Fastify can be swapped with Express (similar API)
- Neo4j can be replaced with JanusGraph if scale requires

---

## Decision 011: Local-First Development with Mocks

**Date**: 2025-01-02  
**Status**: ✅ Approved  
**Decision Maker**: Autonomous AI CTO

### Decision

Build **all external integrations with mock adapters** that can run locally without external credentials. All adapters toggle between mock and production via environment variables.

### Rationale

1. **Developer Velocity**: Developers can work without waiting for credentials
2. **Offline Development**: Full system runs locally for demos and testing
3. **Deterministic Testing**: Mocks provide predictable responses
4. **Cost Control**: No external API costs during development

### Implementation

- All adapters in `packages/mocks/` with mock implementations
- Environment variable `ADAPTER_MODE=mock|prod` toggles behavior
- Mock services start with `pnpm dev:all`
- Production adapters in `packages/backend/src/adapters/`

### External Services Mocked

- Razorpay (payment gateway)
- Google Maps (directions, geocoding)
- Vahan API (vehicle verification)
- IRP (eInvoice generation)
- Firebase (push notifications, analytics)
- SIP/Calling (telephony)

### Rollback Strategy

- Mocks can be disabled by setting `ADAPTER_MODE=prod`
- Production adapters are separate implementations

---

## Decision 012: Code Quality & Tooling Standards

**Date**: 2025-01-02  
**Status**: ✅ Approved  
**Decision Maker**: Autonomous AI CTO

### Decision

Enforce code quality with:
- **EditorConfig** for consistent formatting
- **Prettier** for code formatting
- **ESLint** with TypeScript rules
- **Husky** pre-commit hooks
- **lint-staged** for staged file checks

### Rationale

- **Consistency**: All code follows same formatting rules
- **Quality**: Catches errors before commit
- **Automation**: Reduces manual code review burden

### Configuration

- `.editorconfig` - Editor settings
- `.prettierrc` - Prettier configuration
- `.eslintrc.json` - ESLint rules
- `.husky/pre-commit` - Pre-commit hook
- `lint-staged` in package.json

### Rollback Strategy

- Can disable pre-commit hooks if needed
- Configs can be adjusted per package if required

---

## Decision 013: Development Scripts & Automation

**Date**: 2025-01-02  
**Status**: ✅ Approved  
**Decision Maker**: Autonomous AI CTO

### Decision

Provide comprehensive development scripts:
- `pnpm dev:all` - Start all services
- `pnpm build:all` - Build all packages
- `pnpm test:all` - Run all tests
- `pnpm package:zip` - Create distributable ZIP
- `scripts/dev-up.sh` - Complete dev environment startup

### Rationale

- **Ease of Use**: Single commands for common tasks
- **Reproducibility**: Consistent development environment
- **Onboarding**: New developers can start quickly

### Implementation

- Root-level scripts in `package.json`
- Docker Compose for infrastructure (Postgres, Redis)
- Concurrent service startup
- Health checks for services

---

## Decision 014: OpenAPI-First API Development

**Date**: 2025-01-02  
**Status**: ✅ Approved  
**Decision Maker**: Autonomous AI CTO

### Decision

Use **OpenAPI 3.0.3 specification** as the single source of truth for all API contracts. Generate TypeScript types, client SDKs, and documentation from the spec.

### Rationale

1. **Contract-First Development**: API contracts defined before implementation ensures consistency
2. **Type Safety**: Generated TypeScript types prevent API mismatches between frontend and backend
3. **Documentation**: Interactive API documentation auto-generated from spec
4. **Client Generation**: SDK generation for portal and mobile apps reduces boilerplate
5. **Validation**: Automated validation catches schema errors early
6. **Versioning**: Clear API versioning and change tracking

### Implementation

**OpenAPI Specification Location:**
- `api/openapi.yaml` - Complete OpenAPI v3.0.3 specification
- Covers all endpoints: auth, users/KYC, trucks, bookings, bids, shipments, tracking, POD, inspections, ledger, admin, franchise, ACS, webhooks

**Code Generation:**
```bash
# Generate TypeScript types for shared package
npx openapi-typescript api/openapi.yaml -o packages/app-shared/src/generated/openapi-types.ts

# Generate fetch client for portal
npx @openapitools/openapi-generator-cli generate \
  -i api/openapi.yaml \
  -g typescript-fetch \
  -o packages/portal/src/api-client
```

**Validation:**
```bash
# Validate OpenAPI spec
npx @redocly/openapi-cli validate api/openapi.yaml

# Lint with Spectral
spectral lint api/openapi.yaml
```

### API Design Standards

**ID Formats (ULID-based):**
- Bookings: `RID-YYYYMMDD-xxxx` (e.g., `RID-20240115-0001`)
- Shipments: `SH-<ulid>` (e.g., `SH-01ARZ3NDEKTSV4RRFFQ69G5FAV`)
- Bids: `BK-<ulid>`
- Users: `USR-<role>-<ulid>` (e.g., `USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV`)
- Trucks: `TRK-<regno>-<ulid>` (e.g., `TRK-MH01AB1234-01ARZ3NDEKTSV4RRFFQ69G5FAV`)
- PODs: `POD-<ulid>`

**Pagination:**
- Query params: `page` (default: 1), `pageSize` (default: 20, max: 100)
- Response meta: `{ page, pageSize, total, totalPages }`

**Error Responses:**
- Standard format: `{ code: string, message: string, details?: object }`
- Common codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `RATE_LIMIT_EXCEEDED`

**Rate Limiting:**
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After` (on 429)
- Authentication endpoints: 10 req/hour
- Booking creation: 100 req/day
- GPS pings: 1000 req/hour
- Default: 1000 req/hour

**Timestamps:**
- ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Always UTC

**Security:**
- Bearer JWT authentication for all protected endpoints
- Role-based access control (RBAC) defined in schemas
- Device binding via `x-device-id` header

### Trade-offs

**Pros:**
- Type safety across entire stack
- Reduced API drift between frontend/backend
- Automated documentation and client generation
- Clear API contracts for external integrations
- Easier API versioning and deprecation

**Cons:**
- Requires maintaining OpenAPI spec alongside code
- Code generation adds build step
- Generated code can be verbose
- Team needs to learn OpenAPI specification

### Integration with Monorepo

- `packages/app-shared/src/generated/` - Generated TypeScript types used by all packages
- `packages/backend/src/` - Backend implements OpenAPI contract
- `packages/mobile/shared/src/` - Mobile apps use generated types
- `packages/portal/src/api-client/` - Portal uses generated fetch client

### Rollback Strategy

If OpenAPI-first proves problematic:
1. Stop generating types, maintain manual type definitions
2. Keep OpenAPI spec for documentation only
3. Use traditional API development approach
4. Gradual migration path available (not all-or-nothing)

---

## Change Log

| Date | Decision | Status | Notes |
|------|----------|--------|-------|
| 2025-01-02 | 001-010 | ✅ Approved | Initial technical decisions |
| 2025-01-02 | 011-013 | ✅ Approved | Local-first development and tooling |
| 2025-01-02 | 014 | ✅ Approved | OpenAPI-first API development |

## Decision 015: ACS Audit Canonicalization Format

**Date**: 2025-02-01  
**Status**: ✅ Approved  
**Decision Maker**: Autonomous AI CTO

### Decision

Use **deterministic JSON serialization with sorted keys** for audit entry canonicalization. Include all fields (entityType, entityId, action, performedBy, metadata, ruleId, prevHash) in canonical form, with keys sorted alphabetically.

### Rationale

1. **Tamper Detection**: Deterministic JSON ensures same content always produces same hash
2. **Audit Chain Integrity**: prevHash linking enables verification of audit chain integrity
3. **Reproducibility**: Sorted keys guarantee consistent hashing across systems
4. **Standards Compliance**: Follows cryptographic best practices for audit logging

### Implementation

- Canonical JSON: All fields sorted alphabetically
- SHA256 hash: Computed from canonical JSON
- prevHash: Links to previous audit entry for same entity
- Signature: HMAC-SHA256 for additional tamper protection

### Trade-offs

**Pros:**
- Immutable audit trail
- Easy tamper detection
- Audit chain verification
- Standard cryptographic practices

**Cons:**
- Slightly larger storage (hash + signature fields)
- Requires careful canonicalization logic

---

## Decision 016: Local KMS Signing Choice

**Date**: 2025-02-01  
**Status**: ✅ Approved  
**Decision Maker**: Autonomous AI CTO

### Decision

Use **local KMS stub with HMAC-SHA256** for development/staging, with pluggable interface for production cloud KMS (AWS KMS, GCP KMS, Azure Key Vault).

### Rationale

1. **Development Speed**: Local stub enables fast iteration without cloud dependencies
2. **Cost Efficiency**: No cloud KMS costs during development
3. **Flexibility**: Pluggable interface allows production upgrade without code changes
4. **Security**: HMAC-SHA256 provides adequate signing for audit entries
5. **Production Ready**: Easy migration path to cloud KMS

### Implementation

- Local KMS: HMAC-SHA256 using `LOCAL_KMS_KEY_ID` environment variable
- Production: Replace with AWS KMS, GCP KMS, or Azure Key Vault
- Interface: `sign(payload, keyId)` function signature remains consistent

### Trade-offs

**Pros:**
- Fast local development
- No cloud dependencies during development
- Easy production migration
- Consistent interface

**Cons:**
- Local keys stored in memory (acceptable for development)
- Requires environment variable management

### Production Migration

Replace local KMS with cloud KMS:
- AWS KMS: Use `aws-sdk` KMS client
- GCP KMS: Use `@google-cloud/kms` client
- Azure Key Vault: Use `@azure/keyvault-keys` client

---

## Decision 017: Action Handler Idempotency Guarantees

**Date**: 2025-02-01  
**Status**: ✅ Approved  
**Decision Maker**: Autonomous AI CTO

### Decision

All ACS action handlers must be **idempotent** - safe to retry without side effects. Actions are identified by ruleId + entityId + action type + timestamp for deduplication.

### Rationale

1. **Reliability**: Safe retries in case of network failures or partial execution
2. **Audit Integrity**: Prevents duplicate actions in audit log
3. **Race Condition Safety**: Handles concurrent rule evaluations gracefully
4. **Production Resilience**: Critical for high-availability systems

### Implementation

- Deduplication: Rule ID + entity ID + action type + timestamp
- Idempotent Operations: Database updates use UPSERT, audit entries use unique IDs
- Retry Safety: All handlers check if action already executed before proceeding
- State Checks: Handlers verify current state before applying changes

### Trade-offs

**Pros:**
- Safe retries
- Race condition resilience
- Production-grade reliability
- Easier debugging

**Cons:**
- Slightly more complex handler logic
- Requires state verification checks

### Examples

- `freezeShipment`: Check if shipment already frozen before freezing
- `blockEntity`: Use UPSERT to avoid duplicate blocks
- `createTicket`: Check if ticket already exists before creating

---

**Note**: This document is living and will be updated as new decisions are made. Each decision should be reviewed periodically for relevance and accuracy.
