# Task A: Backend Complete - Comprehensive Implementation Plan

## Goal
Implement every OpenAPI endpoint with full service logic, complete booking lifecycle, ledger accounting, KYC, drivers, admin, franchise, and ACS endpoints.

## Current Status Analysis

### ✅ Already Implemented (30+ endpoints)
- Auth: login, refresh, logout
- Bookings: create, list, get, cancel
- Bids: create, list, get, update, finalize
- Shipments: start, GPS ping, POD upload, complete
- Trucks: create, list, get, block, unblock, inspect
- Ledger: balance, transactions

### ⏳ Missing Implementation

Based on OpenAPI spec, need to implement:

#### 1. Auth Enhancement (1 endpoint)
- `POST /auth/otp` - Request OTP (separate from login)

#### 2. Users/KYC Module (6 endpoints)
- `GET /users/me` - Get current user profile
- `POST /users/register` - Register new user  
- `GET /users/{id}` - Get user by ID (masked)
- `POST /kyc/upload` - Upload KYC (encrypted with local KMS)
- `GET /kyc/status` - Get KYC status
- `GET /kyc/{kycId}` - Get KYC record (masked/admin only)

#### 3. Drivers Module (3 endpoints)
- `POST /drivers` - Register driver
- `POST /drivers/{id}/link-truck` - Link driver to truck
- `GET /drivers/{id}/profile` - Get driver profile

#### 4. Shipments Enhancement (2 endpoints)
- `POST /shipments/{id}/assign` - Assign driver to shipment
- `POST /shipments/{id}/approve-driver` - Driver approval

#### 5. Tracking Module (2 endpoints)
- `POST /tracking/ping` - GPS ping (alternative route)
- `GET /tracking/{shipmentId}` - Get tracking history

#### 6. Truck Enhancement (1 endpoint)
- `GET /trucks/{id}/documents` - Get truck documents

#### 7. Inspections Module (2 endpoints)
- `POST /inspections` - Create inspection
- `POST /inspections/{id}/photos` - Add inspection photos

#### 8. Ledger Enhancement (1 endpoint)
- `GET /ledger` - Get ledger summary

#### 9. Admin Module (6 endpoints)
- `GET /admin/dashboard` - Dashboard KPIs
- `GET /admin/overrides` - List override requests
- `POST /admin/overrides/{id}/approve` - Approve override
- `POST /admin/overrides/{id}/reject` - Reject override
- `GET /admin/audit` - Audit log viewer
- `POST /admin/kyc/decrypt` - Decrypt KYC (with audit)

#### 10. Franchise Module (3 endpoints)
- `GET /franchise/dashboard` - Franchise dashboard
- `GET /franchise/targets` - View/set targets
- `GET /franchise/reports` - Performance reports

#### 11. ACS Module (3 endpoints)
- `POST /acs/evaluate` - Evaluate event against rules
- `GET /acs/audit/{entityType}/{entityId}` - Get audit trail
- `GET /acs/blocks/{entityType}/{entityId}` - Check block status

#### 12. Webhooks Module (1 endpoint)
- `POST /webhooks/razorpay` - Razorpay payment webhook

**Total Missing**: ~31 endpoints

## Implementation Strategy

Working systematically through each module:
1. Users/KYC (foundation)
2. Drivers (needed for shipments)
3. Admin (management)
4. Franchise (business)
5. ACS endpoints (policy engine)
6. Webhooks (integrations)
7. Enhancements to existing modules

## Acceptance Criteria

- All OpenAPI endpoints implemented
- Full booking lifecycle with ledger accounting
- KYC encryption with local KMS
- Admin overrides with audit chain
- All tests passing
- Smoke script validates end-to-end flow

Proceeding with implementation...

