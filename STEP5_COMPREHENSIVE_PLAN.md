# Step 5: Backend Core Flow Implementation - Comprehensive Plan

## Overview

Step 5 requires implementing comprehensive backend modules with full business logic, database integration, and ACS policy enforcement. This is a large implementation task.

## Current Status

### ✅ Already Complete:
- Server setup (Fastify)
- Database connection pool
- Configuration management
- Basic route structure
- ACS middleware (uses existing adapter)
- Skeleton controllers

### ⏳ To Be Implemented:

## Implementation Checklist

### 1. Auth Module ✅ In Progress
- [ ] OTP service (generate, validate, store)
- [ ] JWT token generation (access + refresh)
- [ ] JWT validation middleware
- [ ] Device binding
- [ ] User session management
- [ ] Auth service layer
- [ ] Auth repository layer
- [ ] Complete auth controller

### 2. Bookings Module
- [ ] Booking repository (CRUD operations)
- [ ] Booking service (business logic)
- [ ] ACS integration for price estimation (mock ChatGPT)
- [ ] Auto-finalization scheduling
- [ ] Complete bookings controller
- [ ] Validation and error handling

### 3. Bids Module
- [ ] Bid repository
- [ ] Bid service
- [ ] Auto-finalization logic (lowest valid bid wins)
- [ ] Shipment creation on finalization
- [ ] Complete bids controller

### 4. Shipments Module
- [ ] Shipment repository
- [ ] Shipment service
- [ ] GPS ping handling
- [ ] POD upload with OTP validation
- [ ] Status tracking workflow
- [ ] Complete shipments controller

### 5. Trucks Module
- [ ] Truck repository
- [ ] Truck service
- [ ] Inspection flows
- [ ] Document expiry checking
- [ ] Auto-block/unblock logic
- [ ] Complete trucks controller

### 6. Ledger Module
- [ ] Ledger repository
- [ ] Ledger service with atomic transactions
- [ ] Fee calculation logic
- [ ] Balance tracking
- [ ] Complete ledger controller

### 7. Users & KYC Module
- [ ] User repository
- [ ] KYC repository (encrypted storage)
- [ ] User service
- [ ] KYC service with encryption
- [ ] Complete users/KYC controllers

### 8. API Routes (All OpenAPI Endpoints)
- [ ] Auth routes (login, refresh, logout)
- [ ] User/KYC routes
- [ ] Truck routes
- [ ] Booking routes (complete)
- [ ] Bid routes
- [ ] Shipment routes
- [ ] Driver routes
- [ ] Admin routes
- [ ] Franchise routes
- [ ] ACS routes
- [ ] Webhook routes

### 9. Smoke Test Script
- [ ] End-to-end flow: booking → bid → finalize → shipment
- [ ] Database verification
- [ ] ACS rule verification

## Implementation Pattern

Each module follows this structure:

```
modules/{module}/
  - {module}.controller.ts    # Fastify route handlers
  - {module}.service.ts        # Business logic
  - {module}.repository.ts     # Database operations
  - types.ts                   # Module-specific types
```

## Dependencies

- Database: PostgreSQL via `pg` and `knex`
- ACS: `@rodistaa/acs` package
- Types: `@rodistaa/app-shared`
- Auth: JWT via `jsonwebtoken`
- Validation: Manual (can add `zod` later)

## Notes

- All database operations use the connection pool
- All sensitive operations integrate with ACS
- All entities use ID generation from `@rodistaa/app-shared`
- All errors follow OpenAPI error schema
- All responses match OpenAPI response schemas

