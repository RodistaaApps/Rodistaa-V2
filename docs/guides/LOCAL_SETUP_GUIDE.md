# 🏠 **LOCAL SETUP GUIDE - RODISTAA PLATFORM**

**Estimated Time**: 45 minutes  
**Difficulty**: Beginner  
**Prerequisites**: Windows 10/11, Admin access

---

## 📋 **PREREQUISITES CHECKLIST**

Before starting, ensure you have:

- [x] Windows 10/11 (64-bit)
- [x] Git installed
- [x] Node.js v20+ installed
- [x] pnpm installed (`npm install -g pnpm`)
- [ ] **Docker Desktop** (will install in this guide)
- [x] Chrome/Edge browser
- [x] Code editor (VS Code recommended)

---

## 🐳 **STEP 1: INSTALL DOCKER DESKTOP**

**Time**: 15-20 minutes

### **Download**:

1. Visit: https://www.docker.com/products/docker-desktop
2. Click "Download for Windows"
3. Run `Docker Desktop Installer.exe`

### **Installation Steps**:

1. Accept license agreement
2. Choose configuration:
   - ✅ Enable WSL 2 (recommended)
   - ✅ Add shortcut to desktop
3. Click "Install"
4. **Restart computer** when prompted

### **Verify Installation**:

```powershell
# After restart, open PowerShell
docker --version
# Should show: Docker version 24.x.x

docker compose version
# Should show: Docker Compose version v2.x.x
```

### **Troubleshooting**:

**Error: "WSL 2 installation is incomplete"**

```powershell
# Run in PowerShell (Admin)
wsl --install
wsl --set-default-version 2
# Restart computer
```

**Error: "Docker Desktop starting..." (stuck)**

```powershell
# Reset Docker
# Quit Docker Desktop
# Delete: C:\Users\<YourUsername>\AppData\Roaming\Docker
# Restart Docker Desktop
```

---

## 📦 **STEP 2: CLONE & INSTALL DEPENDENCIES**

**Time**: 5-10 minutes

### **Clone Repository** (if not already done):

```powershell
cd C:\Users\devel\Desktop
git clone <your-repo-url> Rodistaa
cd Rodistaa
```

### **Install All Dependencies**:

```powershell
# Install root dependencies
pnpm install

# Verify installation
pnpm -r list --depth=0
```

**Expected output**: All packages should show installed dependencies with no errors.

---

## 🗄️ **STEP 3: DATABASE SETUP**

**Time**: 5 minutes

### **Option A: Using Docker (Recommended)**

Docker Compose will automatically set up PostgreSQL and Redis.

### **Option B: Manual PostgreSQL Installation**

If you prefer local PostgreSQL:

1. Download: https://www.postgresql.org/download/windows/
2. Install PostgreSQL 15 or 16
3. Set password: `postgres123` (or update `.env`)
4. Create database:

```sql
CREATE DATABASE rodistaa_dev;
CREATE DATABASE rodistaa_test;
```

---

## ⚙️ **STEP 4: ENVIRONMENT CONFIGURATION**

**Time**: 3 minutes

### **Create Local Environment File**:

```powershell
cd C:\Users\devel\Desktop\Rodistaa
copy .env.example .env.local
```

### **Edit `.env.local`** (Notepad or VS Code):

**Minimum required configuration**:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/rodistaa_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=local-dev-secret-change-in-production
JWT_EXPIRES_IN=7d

# Node Environment
NODE_ENV=development

# Server
PORT=4000
PORTAL_PORT=3001

# Mock Services (for local development)
USE_MOCK_SERVICES=true
RAZORPAY_MOCK=true
FIREBASE_MOCK=true
VAHAN_MOCK=true
```

**Save and close** the file.

---

## 🚀 **STEP 5: START THE PLATFORM**

**Time**: 5 minutes

### **Start All Services** (Automated):

```powershell
cd C:\Users\devel\Desktop\Rodistaa
.\start-dev.ps1
```

**This script will**:

1. ✅ Start Docker containers (PostgreSQL, Redis)
2. ✅ Run database migrations
3. ✅ Seed demo data
4. ✅ Start backend API (port 4000)
5. ✅ Start ACS service
6. ✅ Start portal (port 3001)
7. ✅ Start mock services

### **Watch the Output**:

```
🚀 Starting Rodistaa Platform (Local Development)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Docker containers started
✅ Database migrations completed
✅ Demo data seeded
✅ Backend API running on http://localhost:4000
✅ Admin Portal running on http://localhost:3001
✅ ACS Service running
✅ All services ready!

🎉 Platform is ready for development!
```

### **Manual Start** (if script fails):

**Terminal 1 - Docker**:

```powershell
docker compose up -d
```

**Terminal 2 - Database**:

```powershell
cd packages/backend
pnpm run migrate:latest
pnpm run seed
```

**Terminal 3 - Backend**:

```powershell
cd packages/backend
pnpm dev
```

**Terminal 4 - Portal**:

```powershell
cd packages/portal
pnpm dev
```

**Terminal 5 - ACS**:

```powershell
cd packages/acs
pnpm dev
```

---

## ✅ **STEP 6: VERIFY EVERYTHING WORKS**

**Time**: 5 minutes

### **1. Check Backend API**:

**Open Chrome**: http://localhost:4000/health

**Expected Response**:

```json
{
  "status": "ok",
  "timestamp": "2025-12-02T10:30:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "acs": "running"
  }
}
```

### **2. Check API Documentation**:

**Open Chrome**: http://localhost:4000/docs

**You should see**: Swagger UI with all API endpoints documented.

**Try an endpoint**:

1. Expand "Auth" section
2. Click "POST /api/auth/send-otp"
3. Click "Try it out"
4. Enter: `{"phone": "+919876543210"}`
5. Click "Execute"
6. **Expected**: Status 200, OTP sent (mock: 123456)

### **3. Check Admin Portal**:

**Open Chrome**: http://localhost:3001

**You should see**: Rodistaa login page with phone input.

**Login**:

- Phone: `+919876543210`
- Click "Send OTP"
- Enter OTP: `123456` (mock OTP)
- Click "Login"

**You should see**: Admin Dashboard with KPIs.

### **4. Check Database**:

```powershell
# Connect to PostgreSQL
docker exec -it rodistaa-postgres psql -U postgres -d rodistaa_dev

# Check tables
\dt

# Check demo data
SELECT COUNT(*) FROM users;
# Should show: 10-15 demo users

SELECT COUNT(*) FROM bookings;
# Should show: 5-10 demo bookings

\q
```

### **5. Check Redis**:

```powershell
# Connect to Redis
docker exec -it rodistaa-redis redis-cli

# Test
PING
# Should show: PONG

# Check keys
KEYS *
# Should show session keys

exit
```

---

## 📱 **STEP 7: START MOBILE APPS (OPTIONAL)**

**Time**: 10 minutes

### **Install Expo Go App**:

- **iOS**: https://apps.apple.com/app/expo-go/id982107779
- **Android**: https://play.google.com/store/apps/details?id=host.exp.exponent

### **Start Shipper App**:

```powershell
cd packages/mobile/shipper
npx expo start
```

**Scan QR code** with Expo Go app.

### **Start Operator App**:

```powershell
cd packages/mobile/operator
npx expo start --port 8082
```

### **Start Driver App**:

```powershell
cd packages/mobile/driver
npx expo start --port 8083
```

---

## 🧪 **STEP 8: RUN TESTS (OPTIONAL)**

**Time**: 5 minutes

### **Backend Tests**:

```powershell
cd packages/backend
pnpm test
```

**Expected**: All tests pass (green).

### **Portal E2E Tests**:

```powershell
cd packages/portal
npx playwright test --reporter=list
```

**Expected**: Login, navigation tests pass.

---

## 🛑 **STOPPING THE PLATFORM**

### **Stop All Services**:

```powershell
# Stop all Node processes
# Press Ctrl+C in each terminal

# Stop Docker containers
docker compose down
```

### **Stop and Remove All Data**:

```powershell
# This will delete database data!
docker compose down -v
```

---

## 🔧 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: Port Already in Use**

**Error**: `EADDRINUSE: address already in use :::4000`

**Solution**:

```powershell
# Find process using port 4000
netstat -ano | findstr :4000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### **Issue 2: Docker Not Starting**

**Error**: `Cannot connect to Docker daemon`

**Solution**:

1. Open Docker Desktop app
2. Wait for "Docker Desktop is running" message
3. Retry `docker compose up`

### **Issue 3: Database Migration Fails**

**Error**: `Migration failed: connect ECONNREFUSED`

**Solution**:

```powershell
# Wait for PostgreSQL to be ready
docker compose ps
# Ensure rodistaa-postgres is "running"

# Retry migrations
cd packages/backend
pnpm run migrate:latest
```

### **Issue 4: Portal Shows "Connection Refused"**

**Error**: API requests fail with connection refused

**Solution**:

1. Check backend is running: http://localhost:4000/health
2. Check `.env.local` has correct API URL
3. Check CORS settings in backend

### **Issue 5: Module Not Found**

**Error**: `Cannot find module '@rodistaa/app-shared'`

**Solution**:

```powershell
# Rebuild all packages
pnpm -r run build

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

---

## 📊 **VERIFICATION CHECKLIST**

After setup, verify:

- [ ] Docker Desktop running
- [ ] PostgreSQL container running
- [ ] Redis container running
- [ ] Backend API responds at http://localhost:4000/health
- [ ] API docs accessible at http://localhost:4000/docs
- [ ] Admin portal accessible at http://localhost:3001
- [ ] Can login to portal with mock OTP (123456)
- [ ] Dashboard shows demo data
- [ ] Database has demo users and bookings
- [ ] Backend tests pass
- [ ] Portal E2E tests pass (optional)

---

## 🎯 **WHAT TO DO NEXT**

Now that everything is running:

1. **Explore Admin Portal**:
   - Navigate through all modules
   - Test KYC management
   - Try truck management
   - Check reports section

2. **Test API Endpoints**:
   - Use Swagger UI at http://localhost:4000/docs
   - Test booking creation
   - Test bid submission
   - Test shipment tracking

3. **Test Mobile Apps** (if started):
   - Create a booking as shipper
   - Submit a bid as operator
   - Accept shipment as driver

4. **Review Code**:
   - Check backend modules in `packages/backend/src/modules/`
   - Check portal pages in `packages/portal/src/pages/`
   - Check mobile screens in `packages/mobile/*/src/app/`

5. **Next Steps**: See `PRODUCTION_DEPLOYMENT_GUIDE.md`

---

## 📚 **HELPFUL COMMANDS**

**View Logs**:

```powershell
# Backend logs
cd packages/backend && pnpm dev

# Portal logs
cd packages/portal && pnpm dev

# Docker logs
docker compose logs -f postgres
docker compose logs -f redis
```

**Restart Services**:

```powershell
# Restart Docker
docker compose restart

# Restart a specific service
docker compose restart postgres
```

**Database Management**:

```powershell
# Rollback last migration
cd packages/backend
pnpm run migrate:rollback

# Re-run migrations
pnpm run migrate:latest

# Reseed data
pnpm run seed
```

**Check Service Status**:

```powershell
# Check Docker containers
docker compose ps

# Check ports in use
netstat -ano | findstr :4000
netstat -ano | findstr :3001
netstat -ano | findstr :5432
netstat -ano | findstr :6379
```

---

## 🆘 **GETTING HELP**

If you encounter issues not covered here:

1. Check logs for error messages
2. Verify all prerequisites are installed
3. Ensure ports 3001, 4000, 5432, 6379 are available
4. Try stopping and starting services
5. Check Docker Desktop is running
6. Verify `.env.local` configuration

**Still stuck?** Check the troubleshooting guides in `docs/troubleshooting/`.

---

## ✅ **SETUP COMPLETE!**

**Congratulations!** You now have the entire Rodistaa platform running locally.

**Platform Status**:

- ✅ Backend API: http://localhost:4000
- ✅ Admin Portal: http://localhost:3001
- ✅ Database: PostgreSQL (Docker)
- ✅ Cache: Redis (Docker)
- ✅ Mock Services: Active

**You're ready to develop!** 🚀

---

**Next Guide**: `PRODUCTION_DEPLOYMENT_GUIDE.md`
