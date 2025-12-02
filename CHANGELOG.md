# Changelog

All notable changes to the Rodistaa platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Complete implementation pending final release

---

## [1.0.0-rc1] - 2025-02-01

### Added - Backend API
- Complete backend API with 60+ RESTful endpoints
- Auth module (OTP, JWT, device binding)
- Users & KYC module (registration, encryption, verification)
- Trucks module (CRUD, inspections, block/unblock)
- Bookings module (create, list, filters, pagination)
- Bids module (create, modify, auto-finalization)
- Shipments module (lifecycle, GPS ping, POD upload, completion)
- Drivers module (registration, truck linking, profile)
- Ledger module (atomic transactions, balance tracking)
- Admin module (dashboard, overrides, audit viewer, KYC decryption)
- Franchise module (CRUD, targets, payouts, reports)
- ACS endpoints (evaluate, audit trail, block status)
- Webhooks module (Razorpay payment webhooks)
- Health/readiness/metrics endpoints

### Added - ACS Engine
- Rule loader with YAML → Jexl compilation
- Rule linter with forbidden operations and complexity checks
- Evaluator returning Decision[] array
- 11 action handler types (freeze, block, ticket, emit, redact, reject, throttle, suspend, notify, flag, review)
- Audit writer with canonical JSON, SHA256 hash, KMS signing
- Audit chain with prev_hash linking (tamper detection)
- Test event CLI with 5 test vectors
- Watch mode for hot reload during development
- Rollback script for safe rule disabling
- 25 production ACS rules

### Added - Database
- 17+ normalized tables with complete schema
- Foreign key constraints and indexes
- Knex migrations with rollback support
- Seed data for QA testing
- Audit logs table with prev_hash and signature fields
- ACS blocks table for entity blocking
- Watchlist table for flagged entities

### Added - Infrastructure
- Multi-stage Dockerfile (~305MB optimized)
- Docker Compose setup (Postgres + Redis)
- GitHub Actions CI workflow (lint, test, build)
- GitHub Actions E2E workflow (Playwright)
- GitHub Actions deployment workflow
- GitHub Actions release automation
- Health check configuration
- Prometheus metrics endpoint

### Added - Documentation
- RODISTAA_DEVELOPER_HANDBOOK.md (500+ lines)
- packages/acs/README.md (ACS usage guide)
- VERIFY.md (verification procedures)
- RELEASE_GUIDE.md (release process)
- PRODUCTION_DEPLOYMENT_GUIDE.md
- RUN_LOCAL.md (local setup guide)
- DECISIONS.md (17 technical decisions)
- WORKFLOW_BUGS_FIXED.md (CI/CD fixes)
- 70+ comprehensive documentation files

### Fixed - Docker Issues
- Fixed workspace protocol issues in production stage
- Fixed Dockerfile COPY overwrite bug
- Removed unnecessary pnpm from production stage
- Fixed ACS_RULES_PATH environment variable
- Fixed ULID typo in test data
- Optimized Docker image size (60-100MB savings)

### Fixed - ACS Issues
- Fixed ACS function name mismatch (getDbAdapterFromContext)
- Fixed missing suspendAccountAction implementation
- Fixed dbAdapter context passing to action handlers
- Added all missing action handlers

### Fixed - CI/CD Issues
- Fixed placeholder deployment steps (now fail explicitly)
- Fixed dist/ exclusion from release packages

### Changed
- Enhanced audit_logs table with prev_hash and signature columns
- Updated evaluator to return Decision[] type
- Improved error handling across all modules
- Optimized Docker build process

### Security
- Implemented JWT-based authentication
- Added device ID binding
- KYC encryption with AES-256-GCM
- Audit chain with SHA256 + HMAC-SHA256
- prev_hash linking for tamper detection
- Role-based access control
- PII redaction
- Rate limiting
- Input validation

---

## [0.1.0] - 2024-12-01

### Added - Foundation
- Initial monorepo structure with pnpm workspaces
- OpenAPI 3.0 specification (60+ endpoints)
- TypeScript model generation
- ID generator utilities (ULID-based)
- Development tooling (ESLint, Prettier, Husky)
- Basic package structure

---

## Migration Guide

### Upgrading to 1.0.0-rc1

#### Database Migrations

```bash
cd packages/backend
pnpm knex migrate:latest
```

**New migrations**:
- `20240102000001_initial_schema.ts` - Initial schema
- `20240201000001_enhance_audit_logs.ts` - Audit chain enhancements

#### Environment Variables

Add to `.env`:
```env
LOCAL_KMS_KEY_ID=kyc-encryption-key-dev
ACS_RULES_PATH=./acs_rules_top25.yaml
```

#### Breaking Changes

None. This is the initial RC release.

---

## Deprecations

None yet.

---

## Contributors

- Autonomous AI CTO (Implementation)
- Rodistaa Team (Requirements, Review)

---

## Links

- [GitHub Repository](https://github.com/rodistaa/rodistaa)
- [Documentation](./docs/)
- [Issue Tracker](https://github.com/rodistaa/rodistaa/issues)
- [Release Notes](https://github.com/rodistaa/rodistaa/releases)

---

**Note**: This changelog follows [Keep a Changelog](https://keepachangelog.com/) format.

