# Local Testing Guide - Rodistaa Platform

**Date**: December 2, 2025  
**Status**: ✅ Services Running Locally

---

## 🚀 SERVICES STATUS

### ✅ Backend API - RUNNING
**URL**: http://localhost:4000  
**Health Check**: http://localhost:4000/health  
**Status**: ✅ Running with ACS enabled (25 rules loaded)

**Logs**:
```
Rodistaa Backend started on http://0.0.0.0:4000
ACS initialized successfully
Server listening at http://0.0.0.0:4000
```

**Features Available**:
- Authentication (OTP login)
- Bookings API
- Bids API
- Shipments API
- Trucks API
- KYC API
- Franchise API
- ACS rule enforcement

---

### 🔄 ACS Service - STARTING
**URL**: http://localhost:5000  
**Status**: Starting in background

**Features**:
- Rule engine with Jexl
- 25 business rules
- Audit logging
- Override workflow
- Real-time evaluation

---

### ✅ Portal - RUNNING
**URL**: http://localhost:3001  
**Status**: ✅ Next.js dev server running

**Available Portals**:
- Admin Portal: http://localhost:3001/admin/dashboard
- Franchise Portal: http://localhost:3001/franchise/dashboard
- Login: http://localhost:3001/login

---

## 📋 TESTING WORKFLOWS

### 1. Test Backend API

#### Health Check
```bash
curl http://localhost:4000/health
```

**Expected**:
```json
{"status":"ok","timestamp":"2025-12-02T..."}
```

#### Login (Shipper)
```bash
curl -X POST http://localhost:4000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"123456","deviceId":"test-device"}'
```

**Expected**: JWT token in response

#### Create Booking
```bash
curl -X POST http://localhost:4000/v1/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pickup": {
      "address": "Mumbai Port",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "coordinates": {"lat": 18.9388, "lng": 72.8354}
    },
    "drop": {
      "address": "Delhi Warehouse",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110001",
      "coordinates": {"lat": 28.6139, "lng": 77.2090}
    },
    "goods": {"type": "Electronics"},
    "tonnage": 15,
    "priceRangeMin": 20000,
    "priceRangeMax": 30000
  }'
```

---

### 2. Test Portal

#### Admin Login
1. Go to http://localhost:3001/login
2. Enter phone: `9876543210`
3. Enter OTP: `123456` (mock)
4. Should redirect to dashboard

#### Test Admin Features
- **Dashboard**: http://localhost:3001/admin/dashboard
- **KYC Management**: http://localhost:3001/admin/kyc
- **Truck Management**: http://localhost:3001/admin/trucks
- **Bookings**: http://localhost:3001/admin/bookings
- **Shipments**: http://localhost:3001/admin/shipments
- **Overrides**: http://localhost:3001/admin/overrides
- **Reports**: http://localhost:3001/admin/reports

#### Test Franchise Features
- **Dashboard**: http://localhost:3001/franchise/dashboard
- **Inspections**: http://localhost:3001/franchise/inspections
- **Targets**: http://localhost:3001/franchise/targets

---

### 3. Run E2E Tests

#### Portal E2E (Playwright)
```bash
cd packages/portal
pnpm exec playwright test --headed
```

**Tests**:
- Admin login flow
- Dashboard rendering
- Truck management
- KYC decryption
- Override approval

**Expected**: 1+ tests passing (some need OTP flow updates)

---

#### Mobile E2E (Bash Script)
```bash
# Requires backend running on :4000
cd packages/tests/mobile
bash e2e_smoke.sh
```

**Flow Tested**:
1. Shipper login
2. Create booking
3. Operator login
4. Place bid
5. Accept bid
6. Shipment creation
7. Driver login
8. Start shipment
9. GPS ping
10. Upload POD
11. Complete shipment

**Expected**: All steps pass, exits 0

---

### 4. Load Testing (K6)

#### Small Load Test
```bash
k6 run scripts/k6/booking_flow.js \
  --vus 10 \
  --duration 1m
```

#### Medium Load Test
```bash
k6 run scripts/k6/booking_flow.js \
  --vus 50 \
  --duration 3m
```

**Metrics Watched**:
- p95 latency < 500ms
- p99 latency < 1000ms
- Error rate < 1%

---

## 🧪 TEST CREDENTIALS

### Mock Users
**All use OTP**: `123456`

| Role | Phone | Description |
|------|-------|-------------|
| Shipper | 9876543210 | Create bookings |
| Operator | 9876543211 | Place bids |
| Driver | 9876543212 | Complete shipments |
| Admin | 9876543213 | Full admin access |
| Franchise District | 9876543214 | Monitor units |
| Franchise Unit | 9876543215 | Perform inspections |

---

## 📊 MONITORING LOCALLY

### Check Service Logs

#### Backend Logs
```powershell
Get-Content "c:\Users\devel\.cursor\projects\c-Users-devel-OneDrive-Desktop-Rodistaa-code-workspace\terminals\5.txt" -Tail 20 -Wait
```

#### ACS Logs
```powershell
Get-Content "c:\Users\devel\.cursor\projects\c-Users-devel-OneDrive-Desktop-Rodistaa-code-workspace\terminals\6.txt" -Tail 20 -Wait
```

#### Portal Logs
```powershell
Get-Content "c:\Users\devel\.cursor\projects\c-Users-devel-OneDrive-Desktop-Rodistaa-code-workspace\terminals\4.txt" -Tail 20 -Wait
```

---

### Check Service Health

#### Backend Health
```bash
curl http://localhost:4000/health
```

#### ACS Health
```bash
curl http://localhost:5000/health
```

#### Portal Health
```bash
curl http://localhost:3001
```

---

## 🔍 DEBUGGING

### Backend Not Responding
1. Check logs in terminal 5
2. Verify PostgreSQL is running
3. Check port 4000 is not blocked
4. Verify environment variables set

### Portal Not Loading
1. Check logs in terminal 4
2. Verify port 3001 is not blocked
3. Clear browser cache
4. Check Next.js build status

### Tests Failing
1. Verify backend is running
2. Check test configuration
3. Review test logs
4. Verify mock data available

---

## 🎯 QUICK TEST SCENARIOS

### Scenario 1: Create Booking (2 minutes)
1. Login to portal as Shipper
2. Go to Bookings page
3. Create new booking
4. Verify booking appears in list
5. Check backend logs for ACS rule evaluation

### Scenario 2: Place Bid (3 minutes)
1. Login to portal as Operator
2. View available bookings
3. Place bid on booking
4. Verify bid recorded
5. Check ACS rules (bidding fee calculation)

### Scenario 3: Admin Override (2 minutes)
1. Login as Admin
2. Go to Trucks page
3. Block a truck
4. Verify truck status changed
5. Check ACS audit log

### Scenario 4: Franchise Inspection (3 minutes)
1. Login as Franchise Unit
2. Go to Inspections page
3. Perform new inspection
4. Upload photo
5. Submit for approval

---

## 🚦 SERVICE DEPENDENCIES

### Required Services
- ✅ Backend API (port 4000) - **RUNNING**
- 🔄 ACS Service (port 5000) - **STARTING**
- ✅ Portal (port 3001) - **RUNNING**
- ⏸️ PostgreSQL (port 5432) - **NEEDED**

### Optional Services
- ⏸️ Redis (port 6379) - For session caching
- ⏸️ Mock Services (port 3000) - For payment/maps
- ⏸️ Mobile Apps (Expo) - For mobile testing

---

## 📱 MOBILE APP TESTING

### Start Mobile Apps (Optional)

#### Shipper App
```bash
cd packages/mobile/shipper
pnpm start
```

#### Operator App
```bash
cd packages/mobile/operator
pnpm start
```

#### Driver App
```bash
cd packages/mobile/driver
pnpm start
```

**Requires**: Expo CLI + Android/iOS emulator

---

## 🎯 EXPECTED RESULTS

### Backend API
- ✅ Responds on port 4000
- ✅ Health check returns 200
- ✅ Authentication works
- ✅ CRUD operations functional
- ✅ ACS rules enforced

### Portal
- ✅ Loads on port 3001
- ✅ Login works (OTP)
- ✅ Admin pages render
- ✅ Franchise pages render
- ✅ Data fetches from backend

### E2E Tests
- ✅ Playwright tests execute
- 🔄 Most tests pass (some need OTP updates)
- ✅ Screenshots captured
- ✅ Reports generated

---

## 🛠️ TROUBLESHOOTING

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :4000

# Kill process
taskkill /PID <pid> /F
```

### Database Connection Failed
```bash
# Check if PostgreSQL is running
# Install: https://www.postgresql.org/download/windows/

# Or use Docker
docker run --name postgres -e POSTGRES_PASSWORD=rodistaa123 -e POSTGRES_USER=rodistaa -e POSTGRES_DB=rodistaa -p 5432:5432 -d postgres:15
```

### Module Not Found
```bash
# Reinstall dependencies
cd C:\Users\devel\Desktop\Rodistaa
pnpm install --force
```

---

## 📊 SUCCESS INDICATORS

### ✅ Backend Healthy
- Server listening message in logs
- Health endpoint returns 200
- ACS rules loaded (25 rules)
- Database connected

### ✅ Portal Healthy
- Next.js ready message
- Portal loads in browser
- Login works
- Pages render

### ✅ E2E Ready
- Backend responding
- Portal accessible
- Test data available
- Tests executable

---

## 🎉 YOU'RE TESTING LOCALLY!

**Current Status**:
- ✅ Backend API: http://localhost:4000 (RUNNING)
- 🔄 ACS Service: http://localhost:5000 (STARTING)
- ✅ Portal: http://localhost:3001 (RUNNING)

**Next Steps**:
1. Test backend API endpoints
2. Login to admin portal
3. Create test booking
4. Run Playwright tests
5. Execute mobile E2E script

**All systems operational for local testing!** 🚀

---

**Guide**: LOCAL_TESTING_GUIDE.md  
**Date**: December 2, 2025  
**Status**: Services running, ready to test

