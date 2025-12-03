# Task A: Backend Complete - Implementation Plan

## Status: STARTING

**Branch**: `feature/backend-complete`  
**Goal**: Implement every OpenAPI endpoint with full service logic

## Current State Analysis

### ✅ Already Implemented (Step 5):
- Auth: login, refresh, logout
- Bookings: create, list, get, cancel
- Bids: create, list, get, update, finalize
- Shipments: start, GPS ping, POD upload, complete
- Trucks: create, list, get, block, unblock, inspect
- Ledger: balance, transactions

### ⏳ Missing Endpoints to Implement:

#### Users/KYC Module:
- `POST /auth/otp` - Request OTP
- `GET /users/me` - Get current user profile
- `POST /users/register` - Register new user
- `GET /users/{id}` - Get user by ID
- `POST /kyc/upload` - Upload KYC documents (encrypted)
- `GET /kyc/status` - Get KYC status
- `GET /kyc/{kycId}` - Get KYC record (masked/admin)

#### Drivers Module:
- `POST /drivers` - Register driver
- `POST /drivers/{id}/link-truck` - Link driver to truck
- `GET /drivers/{id}/profile` - Get driver profile

#### Admin Module:
- `GET /admin/dashboard` - Admin dashboard KPIs
- `GET /admin/overrides` - List override requests
- `POST /admin/overrides/{id}/approve` - Approve override
- `POST /admin/overrides/{id}/reject` - Reject override
- `GET /admin/audit` - Audit log viewer
- `POST /admin/kyc/decrypt` - Decrypt KYC (with audit)

#### Franchise Module:
- `GET /franchise/dashboard` - Franchise dashboard
- `GET /franchise/targets` - View/set targets
- `GET /franchise/reports` - Performance reports

#### ACS Module:
- `POST /acs/evaluate` - Evaluate event against rules
- `GET /acs/audit/{entityType}/{entityId}` - Get audit trail
- `GET /acs/blocks/{entityType}/{entityId}` - Check block status

#### Webhooks Module:
- `POST /webhooks/razorpay` - Razorpay payment webhook
- `POST /webhooks/register` - Register webhook endpoint

## Implementation Order

1. **Users/KYC Module** (foundation for others)
2. **Drivers Module** (needed for shipments)
3. **Admin Module** (management features)
4. **Franchise Module** (business features)
5. **ACS Endpoints** (policy engine access)
6. **Webhooks** (external integrations)

## Next Steps

Starting with Users/KYC module implementation...

