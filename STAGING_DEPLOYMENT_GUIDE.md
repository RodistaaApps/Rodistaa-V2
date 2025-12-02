# 🚀 Staging Deployment Guide - Dual Backend Strategy

**Date**: 2024-01-02  
**Strategy**: Deploy both Fastify and NestJS backends  
**Status**: **READY TO DEPLOY**

---

## Overview

Deploy both production-ready backends to staging environment:
- **Fastify Backend** (port 4000) → React Native mobile apps
- **NestJS Backend** (port 3000) → Flutter apps, Web portals

---

## Prerequisites

### Infrastructure
- ✅ Staging server (Ubuntu 20.04+ or container platform)
- ✅ PostgreSQL 15+ database
- ✅ Redis 7+ (for caching)
- ✅ Docker runtime
- ✅ SSL certificates (Let's Encrypt)

### Access
- SSH access to staging server
- Database credentials
- GitHub repository access (for CI/CD)

---

## Deployment Steps

### Step 1: Prepare Database (15 minutes)

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE rodistaa_staging;
CREATE USER rodistaa_user WITH PASSWORD 'staging_password';
GRANT ALL PRIVILEGES ON DATABASE rodistaa_staging TO rodistaa_user;
\q

# Create separate schemas for each backend (optional)
psql -U rodistaa_user -d rodistaa_staging
CREATE SCHEMA fastify;
CREATE SCHEMA nestjs;
GRANT ALL ON SCHEMA fastify TO rodistaa_user;
GRANT ALL ON SCHEMA nestjs TO rodistaa_user;
\q
```

---

### Step 2: Deploy Fastify Backend (20 minutes)

**Location**: `C:\Users\devel\Desktop\Rodistaa`

#### 2.1 Build Docker Image

```bash
cd C:\Users\devel\Desktop\Rodistaa

# Build production image
docker build -t rodistaa-fastify:staging -f Dockerfile .

# Tag for registry
docker tag rodistaa-fastify:staging ghcr.io/rodistaa/fastify-backend:staging

# Push to registry (if using GitHub Container Registry)
docker push ghcr.io/rodistaa/fastify-backend:staging
```

#### 2.2 Configure Environment

Create `.env.staging`:
```env
NODE_ENV=staging
PORT=4000
DATABASE_URL=postgresql://rodistaa_user:staging_password@db-host:5432/rodistaa_staging
JWT_SECRET=staging-jwt-secret-change-this
JWT_REFRESH_SECRET=staging-jwt-refresh-secret-change-this
LOCAL_KMS_KEY_ID=kyc-encryption-key-staging
ACS_RULES_PATH=./acs_rules_top25.yaml
ADAPTER_MODE=MOCK
LOG_LEVEL=info
```

#### 2.3 Deploy Container

```bash
# Run migrations first
docker run --rm \
  --env-file .env.staging \
  rodistaa-fastify:staging \
  node packages/backend/dist/scripts/migrate-latest.js

# Start backend
docker run -d \
  --name rodistaa-fastify-staging \
  --env-file .env.staging \
  -p 4000:4000 \
  --restart unless-stopped \
  rodistaa-fastify:staging

# Check logs
docker logs -f rodistaa-fastify-staging

# Verify health
curl https://staging-api-v1.rodistaa.com/health
```

---

### Step 3: Deploy NestJS Backend (20 minutes)

**Location**: `C:\Users\devel\Documents\Rodistaa\New_UserUI_App\backend`

#### 3.1 Build Docker Image

```bash
cd C:\Users\devel\Documents\Rodistaa\New_UserUI_App\backend

# Build production image
docker build -t rodistaa-nestjs:staging -f Dockerfile .

# Tag for registry
docker tag rodistaa-nestjs:staging ghcr.io/rodistaa/nestjs-backend:staging

# Push to registry
docker push ghcr.io/rodistaa/nestjs-backend:staging
```

#### 3.2 Configure Environment

Create `.env.staging`:
```env
NODE_ENV=staging
PORT=3000
DATABASE_URL=postgresql://rodistaa_user:staging_password@db-host:5432/rodistaa_staging
JWT_SECRET=staging-jwt-secret-change-this
JWT_REFRESH_SECRET=staging-jwt-refresh-secret-change-this
REDIS_URL=redis://redis-host:6379
LOG_LEVEL=info
```

#### 3.3 Deploy Container

```bash
# Run Prisma migrations
docker run --rm \
  --env-file .env.staging \
  rodistaa-nestjs:staging \
  npx prisma migrate deploy

# Start backend
docker run -d \
  --name rodistaa-nestjs-staging \
  --env-file .env.staging \
  -p 3000:3000 \
  --restart unless-stopped \
  rodistaa-nestjs:staging

# Check logs
docker logs -f rodistaa-nestjs-staging

# Verify health
curl https://staging-api-v2.rodistaa.com/health
```

---

### Step 4: Configure Nginx/Load Balancer (10 minutes)

```nginx
# /etc/nginx/sites-available/rodistaa-staging

# Fastify Backend (v1)
server {
    listen 443 ssl http2;
    server_name staging-api-v1.rodistaa.com;
    
    ssl_certificate /etc/letsencrypt/live/staging-api-v1.rodistaa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging-api-v1.rodistaa.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /health {
        proxy_pass http://localhost:4000/health;
        access_log off;
    }
}

# NestJS Backend (v2)
server {
    listen 443 ssl http2;
    server_name staging-api-v2.rodistaa.com;
    
    ssl_certificate /etc/letsencrypt/live/staging-api-v2.rodistaa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging-api-v2.rodistaa.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
```

```bash
# Enable and restart
sudo ln -s /etc/nginx/sites-available/rodistaa-staging /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Step 5: Deploy Mobile Apps (15 minutes each)

#### React Native Apps (Fastify Backend)

```bash
cd C:\Users\devel\Desktop\Rodistaa\packages\mobile\shipper

# Update API URL
echo "EXPO_PUBLIC_API_URL=https://staging-api-v1.rodistaa.com/v1" > .env

# Build for internal testing
eas build --platform android --profile staging
# or
expo build:android

# Get build URL and share with QA team
```

#### Flutter Apps (NestJS Backend)

```bash
cd C:\Users\devel\Documents\Rodistaa\New_UserUI_App\rodistaa_apps

# Update API config (if not using environment variables)
# Edit config files to point to staging-api-v2.rodistaa.com

# Build APKs
cd New_UserUI_App
flutter build apk --release

cd ../rodistaa_operator_app
flutter build apk --release

cd ../DriverUI_App
flutter build apk --release
```

---

### Step 6: Run Smoke Tests (30 minutes)

#### Fastify Backend Tests

```bash
# Health check
curl https://staging-api-v1.rodistaa.com/health

# Authentication
curl -X POST https://staging-api-v1.rodistaa.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "123456", "deviceId": "test-device"}'

# Create booking (with token)
curl -X POST https://staging-api-v1.rodistaa.com/v1/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "pickupAddress": "Bangalore",
    "dropAddress": "Chennai",
    "weightTons": 10,
    "materialType": "Electronics"
  }'
```

#### NestJS Backend Tests

```bash
# Health check
curl https://staging-api-v2.rodistaa.com/health

# Test endpoints
curl https://staging-api-v2.rodistaa.com/api/users
curl https://staging-api-v2.rodistaa.com/api/bookings
```

#### Run Comprehensive Smoke Test

```bash
# Fastify backend
cd C:\Users\devel\Desktop\Rodistaa\packages\backend
node scripts/smoke_booking_flow.js

# Test ACS rules
node packages/acs/dist/cli/test-event.js
```

---

### Step 7: Monitor & Validate (Ongoing)

```bash
# Check logs
docker logs -f rodistaa-fastify-staging
docker logs -f rodistaa-nestjs-staging

# Monitor health
watch -n 10 curl -s https://staging-api-v1.rodistaa.com/health
watch -n 10 curl -s https://staging-api-v2.rodistaa.com/health

# Check database connections
psql -U rodistaa_user -d rodistaa_staging -c "SELECT COUNT(*) FROM users;"

# Monitor resources
docker stats rodistaa-fastify-staging rodistaa-nestjs-staging
```

---

## Rollback Plan

If deployment fails:

```bash
# Stop containers
docker stop rodistaa-fastify-staging rodistaa-nestjs-staging

# Remove containers
docker rm rodistaa-fastify-staging rodistaa-nestjs-staging

# Revert database (if needed)
psql -U rodistaa_user -d rodistaa_staging < backup.sql

# Redeploy from previous version
docker run -d --name rodistaa-fastify-staging <previous-image>
```

---

## Success Criteria

### Fastify Backend ✅
- [ ] Health check returns 200
- [ ] Authentication works
- [ ] Bookings can be created
- [ ] ACS rules evaluate correctly
- [ ] Audit logs persisted
- [ ] No errors in logs

### NestJS Backend ✅
- [ ] Health check returns 200
- [ ] All modules accessible
- [ ] Database connections stable
- [ ] No errors in logs

### Mobile Apps
- [ ] React Native apps connect to Fastify
- [ ] Flutter apps connect to NestJS
- [ ] Authentication works in all apps
- [ ] Core flows functional

---

## Post-Deployment Tasks

1. **Monitor for 24 hours**
   - Check error logs
   - Monitor performance
   - Validate database queries

2. **QA Testing**
   - Manual testing of critical flows
   - Performance testing
   - Security testing

3. **Documentation**
   - Update deployment docs
   - Note any issues encountered
   - Document solutions

---

## Timeline

| Task | Duration | When |
|------|----------|------|
| Database setup | 15 min | Today |
| Deploy Fastify | 20 min | Today |
| Deploy NestJS | 20 min | Today |
| Configure Nginx | 10 min | Today |
| Smoke tests | 30 min | Today |
| **Total** | **1.5 hours** | **Today** |

---

## Next Steps After Staging

1. **Validation** (24 hours)
   - Monitor stability
   - Test all flows
   - Performance check

2. **Mobile Completion** (8-12 hours)
   - Complete Operator app
   - Complete Driver app
   - Test with staging backends

3. **Production Deployment** (Next week)
   - After staging validation
   - Follow same process
   - Monitor closely

---

## Contact Points

**DevOps**: Deploy and monitor backends  
**Backend Developers**: Support deployment, fix issues  
**Mobile Developers**: Test app integrations  
**QA Team**: Execute smoke tests, validate flows

---

## Conclusion

Dual backend deployment strategy enables:
- ✅ Immediate staging deployment
- ✅ Zero migration risk
- ✅ Both complete systems validated
- ✅ Flexible architecture for future

**Status**: **READY TO DEPLOY**

**Estimated Time**: 1.5 hours for staging deployment

**Recommendation**: **EXECUTE DEPLOYMENT TODAY**

---

**Prepared by**: AI CTO  
**Date**: 2024-01-02  
**Next**: Execute staging deployment

