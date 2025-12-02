# Rodistaa Monorepo Structure

Complete directory structure of the Rodistaa platform monorepo.

```
rodistaa/
├── pnpm-workspace.yaml          # pnpm workspace configuration
├── package.json                 # Root package.json with scripts
├── tsconfig.json                # Root TypeScript config
├── .editorconfig                # Editor configuration
├── .prettierrc                  # Prettier configuration
├── .eslintrc.json               # ESLint configuration
├── .gitignore                   # Git ignore patterns
├── .husky/                      # Husky git hooks
│   └── pre-commit               # Pre-commit hook
├── SECURITY.md                  # Security policy
├── DECISIONS.md                 # Technical decisions log
├── README.md                    # Main README
├── EXECUTION_STATUS.md          # Execution status tracking
├── docker-compose.yml           # Local Postgres & Redis
├── acs_rules_top25.yaml         # ACS rules (root level for CLI access)
│
├── api/                         # API specifications
│   └── openapi.yaml             # OpenAPI v3 specification
│
├── scripts/                     # Root-level scripts
│   ├── dev-up.sh                # Development environment startup
│   └── package-zip.js           # ZIP packaging script
│
├── packages/
│   ├── app-shared/              # Shared domain models & utilities
│   │   └── src/
│   │       ├── index.ts         # Main exports
│   │       ├── idGen.ts         # ID generators (RID-*, SH-*, etc.)
│   │       ├── types.ts         # Common types (ApiResponse, etc.)
│   │       └── models/          # Domain models
│   │           ├── index.ts
│   │           ├── user.ts
│   │           ├── truck.ts
│   │           ├── booking.ts
│   │           ├── bid.ts
│   │           ├── shipment.ts
│   │           ├── pod.ts
│   │           ├── kyc.ts
│   │           ├── ledger.ts
│   │           ├── audit.ts
│   │           ├── block.ts
│   │           ├── override.ts
│   │           └── notification.ts
│   │
│   ├── backend/                 # Fastify backend API
│   │   ├── src/
│   │   │   ├── index.ts         # Entry point
│   │   │   ├── server.ts        # Fastify server setup
│   │   │   ├── routes/          # Route registration
│   │   │   │   └── index.ts
│   │   │   ├── modules/         # Backend modules
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── trucks/
│   │   │   │   ├── bookings/
│   │   │   │   ├── bids/
│   │   │   │   ├── shipments/
│   │   │   │   ├── gps/
│   │   │   │   ├── pod/
│   │   │   │   ├── inspection/
│   │   │   │   ├── ledger/
│   │   │   │   ├── kyc/
│   │   │   │   ├── invoice/
│   │   │   │   ├── admin/
│   │   │   │   ├── franchise/
│   │   │   │   └── acs-adapter/
│   │   │   └── adapters/        # External service adapters
│   │   │       ├── razorpay/
│   │   │       ├── maps/
│   │   │       ├── vahan/
│   │   │       ├── irp/
│   │   │       └── sip/
│   │   └── migrations/          # Knex migrations
│   │       └── init.sql
│   │
│   ├── acs/                     # Anti-Corruption Shield engine
│   │   └── src/
│   │       ├── ruleLoader.ts    # YAML rule loader
│   │       ├── evaluator.ts     # Rule evaluator
│   │       ├── actions.ts       # Action handlers
│   │       └── cli.ts           # ACS CLI tool
│   │
│   ├── mobile/                  # React Native Expo apps
│   │   ├── shipper/             # Shipper mobile app
│   │   ├── operator/            # Operator mobile app
│   │   ├── driver/              # Driver mobile app
│   │   └── shared/              # Shared mobile components
│   │
│   ├── portal/                  # Next.js web portals
│   │   ├── admin/               # Admin portal
│   │   ├── franchise/           # Franchise portal
│   │   └── .storybook/          # Storybook configuration
│   │
│   ├── mocks/                   # Local mock services
│   │   ├── razorpay/            # Razorpay payment mock
│   │   ├── maps/                # Google Maps mock
│   │   ├── vahan/               # Vahan API mock
│   │   ├── irp/                 # IRP eInvoice mock
│   │   └── sip/                 # SIP/calling mock
│   │
│   ├── infra/                   # Infrastructure as Code
│   │   ├── docker-compose.yml   # Local development
│   │   └── terraform/           # Terraform configurations
│   │
│   └── tests/                   # Shared test utilities
│       ├── playwright/          # Playwright E2E tests
│       └── jest/                # Jest test utilities
│
└── docs/                        # Business documentation
    ├── RODISTAA_MASTER_BUSINESS_FILE_v1.0.md
    ├── RODISTAA_ANTI_CORRUPTION_SHIELD_v1.0.md
    └── ... (64+ documentation files)
```

## Package Structure Details

### `packages/app-shared`
Shared domain models, types, DTOs, and utilities used across all packages.

### `packages/backend`
Fastify-based backend API with modular architecture:
- **Modules**: Domain-specific business logic (auth, users, trucks, etc.)
- **Adapters**: External service integrations (Razorpay, Maps, etc.)
- **Migrations**: Database schema and seed data

### `packages/acs`
Anti-Corruption Shield policy engine:
- Rule loader from YAML
- JEXL-based rule evaluator
- Action handlers (freeze, block, ticket, etc.)

### `packages/mobile`
React Native Expo apps for three user roles:
- Shipper app
- Operator app
- Driver app
- Shared components and utilities

### `packages/portal`
Next.js web portals:
- Admin portal (HQ operations)
- Franchise portal (district & unit)
- Storybook for component documentation

### `packages/mocks`
Local mock services for external integrations:
- All adapters have mock implementations
- Toggle via `ADAPTER_MODE` environment variable

### `packages/infra`
Infrastructure definitions:
- Docker Compose for local development
- Terraform for cloud infrastructure

### `packages/tests`
Shared test utilities and configurations:
- Playwright for E2E tests
- Jest for unit tests

---

**Last Updated**: 2025-01-02

