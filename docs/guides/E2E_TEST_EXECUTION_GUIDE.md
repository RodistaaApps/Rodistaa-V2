# 🧪 **E2E TEST EXECUTION GUIDE**

**Run end-to-end tests for the Rodistaa platform**

**Time**: 15-30 minutes  
**Difficulty**: Intermediate

---

## 📋 **TEST SUITES OVERVIEW**

| Suite               | Location                  | Tool         | Duration  | Coverage                      |
| ------------------- | ------------------------- | ------------ | --------- | ----------------------------- |
| Portal E2E          | `packages/portal/tests/`  | Playwright   | 3-5 min   | Login, navigation, CRUD       |
| Backend Integration | `packages/backend/tests/` | Jest         | 2-3 min   | API endpoints, business logic |
| Mobile E2E          | `packages/tests/mobile/`  | Detox/Manual | 10-15 min | User flows, UI                |
| Load Tests          | `scripts/k6/`             | K6           | 5-10 min  | Performance, scalability      |

---

## 🌐 **PORTAL E2E TESTS (Playwright)**

### **Prerequisites**:

```bash
cd packages/portal
pnpm install
npx playwright install
```

### **Run Tests**:

**All tests**:

```bash
npx playwright test
```

**Specific browser**:

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

**Headed mode** (see browser):

```bash
npx playwright test --headed
```

**Debug mode**:

```bash
npx playwright test --debug
```

**Against staging**:

```bash
BASE_URL=https://staging-portal.rodistaa.com npx playwright test
```

### **View Report**:

```bash
npx playwright show-report
```

### **Test Coverage**:

- ✅ Admin login flow
- ✅ Dashboard rendering
- ✅ KYC management
- ✅ Truck blocking/unblocking
- ✅ Override approval
- ✅ Franchise portal access
- ✅ Role-based access control

---

## 🔧 **BACKEND INTEGRATION TESTS (Jest)**

### **Run Tests**:

**All tests**:

```bash
cd packages/backend
pnpm test
```

**Watch mode**:

```bash
pnpm test --watch
```

**Coverage report**:

```bash
pnpm test --coverage
```

**Specific file**:

```bash
pnpm test bookings.service.test
```

### **Test Coverage**:

- ✅ Auth service (JWT, OTP)
- ✅ Booking service (CRUD, validation)
- ✅ Bid service (auto-finalize logic)
- ✅ Shipment service (status transitions)
- ✅ Truck service (inspection, blocking)
- ✅ File upload service (S3 presigned URLs)

---

## 📱 **MOBILE E2E TESTS**

### **Manual Test Script**:

**Shipper App**:

1. Login with OTP
2. Create booking (pickup + drop)
3. View bid list
4. Accept bid
5. Track shipment
6. View POD

**Operator App**:

1. Login with OTP
2. Browse bookings
3. Submit bid
4. Assign driver
5. View fleet
6. Check earnings

**Driver App**:

1. Login with OTP
2. View assigned shipment
3. Start shipment
4. Update GPS location
5. Upload POD
6. Complete delivery

### **Automated Tests** (Future):

```bash
cd packages/tests/mobile
./e2e_smoke.sh
```

---

## ⚡ **LOAD TESTS (K6)**

### **Prerequisites**:

```bash
# Install K6
choco install k6  # Windows
```

### **Run Load Tests**:

**Booking flow** (100 VUs, 1 minute):

```bash
cd scripts/k6
k6 run booking_flow.js --vus 100 --duration 1m
```

**Auth flow** (50 VUs, 30 seconds):

```bash
k6 run auth_flow.js --vus 50 --duration 30s
```

**Custom parameters**:

```bash
k6 run booking_flow.js \
  --vus 10 \
  --duration 30s \
  --env BASE_URL=https://staging-api.rodistaa.com
```

### **Analyze Results**:

- Response times (p95, p99)
- Request rate (RPS)
- Error rate
- Data transfer

**Targets**:

- p95 response time: < 200ms
- p99 response time: < 500ms
- Error rate: < 0.1%
- Throughput: > 100 RPS

---

## 🔄 **CI/CD AUTOMATED TESTS**

### **GitHub Actions**:

Tests run automatically on:

- Every pull request
- Push to `develop`
- Tag creation

**View results**:

1. Go to: GitHub → Actions
2. Click on workflow run
3. Expand "Run tests" step

---

## ✅ **TEST EXECUTION CHECKLIST**

Before production deployment:

- [ ] All portal E2E tests pass
- [ ] All backend integration tests pass
- [ ] Mobile apps manually tested
- [ ] Load tests meet performance targets
- [ ] No critical errors in logs
- [ ] Database migrations successful
- [ ] All APIs return expected status codes
- [ ] Authentication flows work
- [ ] File uploads work
- [ ] Payment integration works (test mode)

---

**Next Guide**: `PRODUCTION_RELEASE_GUIDE.md`
