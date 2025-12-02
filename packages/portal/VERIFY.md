# 🔍 Portal Verification Guide

## Prerequisites

1. **Backend Running**:
   ```bash
   cd packages/backend
   pnpm dev
   # Backend should be on http://localhost:4000
   ```

2. **Install Dependencies**:
   ```bash
   cd packages/portal
   pnpm install
   ```

## Verification Steps

### 1. Start Portal

```bash
cd packages/portal
pnpm dev
# Portal runs on http://localhost:3001
```

### 2. Test Login Page

- Navigate to `http://localhost:3001/login`
- **Expected**: Login form with Rodistaa branding
- **Verify**: #C90D0D red color, Times New Roman font

### 3. Test Authentication

```bash
# Login credentials (mock)
Email: admin@rodistaa.com
Password: admin123
```

- **Expected**: Redirect to `/admin/dashboard`
- **Verify**: Dashboard loads with metrics

### 4. Test Admin Modules

**Dashboard** (`/admin/dashboard`):
- ✅ Metrics cards (DAU, Bookings, Trucks, Revenue)
- ✅ Fraud alerts table
- ✅ Quick actions

**KYC Management** (`/admin/kyc`):
- ✅ KYC records table
- ✅ Decrypt & View button
- ✅ Verify/Reject actions
- ✅ Modal with KYC details

**Truck Management** (`/admin/trucks`):
- ✅ Trucks table with filters
- ✅ Block/Unblock buttons
- ✅ Truck details modal
- ✅ Inspection photos tabs

**Overrides** (`/admin/overrides`):
- ✅ Override requests table
- ✅ Approve/Deny buttons
- ✅ Audit confirmation modals

### 5. Test Franchise Portal

**District Dashboard** (`/franchise/dashboard`):
- ✅ District-specific metrics
- ✅ Linked units table
- ✅ Set targets button

**Unit Dashboard** (`/franchise/dashboard`):
- ✅ Unit-specific metrics
- ✅ Inspection schedule
- ✅ Target progress

### 6. Test Protected Routes

- Logout from admin
- Try to access `/admin/dashboard` directly
- **Expected**: Redirect to `/login`

### 7. Run Playwright Tests

```bash
cd packages/portal
pnpm test:e2e
```

**Expected**: All tests pass

---

## Expected Results

### Admin Portal ✅
- Dashboard loads with metrics
- KYC management functional
- Truck management with block/unblock
- Override requests approval flow
- RBAC enforced

### Franchise Portal ✅
- Dashboard shows role-specific view
- District sees unit management
- Unit sees inspection schedule
- RBAC enforced

### Security ✅
- Protected routes redirect unauthorized users
- JWT authentication working
- Role-based access enforced
- Audit logging for sensitive actions

---

## Known Limitations

### Implemented (Foundation + Key Modules)
- ✅ Infrastructure complete
- ✅ 4 Admin modules (dashboard, KYC, trucks, overrides)
- ✅ 1 Franchise module (dashboard with district/unit views)
- ✅ RBAC and protected routes
- ✅ Authentication flow

### Team Can Complete (Following Patterns)
- 📋 Additional admin modules (bookings, shipments, reports)
- 📋 Additional franchise modules (targets, analytics)
- 📋 Advanced features (charts, exports)
- 📋 Comprehensive E2E tests

**All patterns established. Remaining work is straightforward module addition.**

---

## Troubleshooting

### Portal won't start
- Check Node.js version (>= 20)
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies

### API calls failing
- Verify backend is running on port 4000
- Check NEXT_PUBLIC_API_URL in .env.local
- Verify CORS configuration

### Login not working
- Check backend auth endpoint
- Verify JWT secret matches
- Check browser console for errors

---

## Screenshots

Key screens implemented:
1. Login page (Rodistaa branding)
2. Admin dashboard (metrics, alerts)
3. KYC management (table, decrypt modal)
4. Truck management (list, details)
5. Override requests (approve/deny)
6. Franchise dashboard (district/unit views)

---

**Status**: Foundation Complete + Key Modules Implemented  
**Team Extension**: 12-15 hours for remaining modules

