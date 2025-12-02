# Rodistaa Platform - Deployment Guide

**Version**: 1.0  
**Last Updated**: 2025-01-02

---

## 🚀 Deployment Overview

This guide covers deployment of the Rodistaa platform to production environments.

---

## 📋 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Security audit completed
- [ ] ACS rules validated
- [ ] Backup strategy in place

---

## 🗄️ Database Deployment

### Production Database Setup

```bash
# Create production database
createdb rodistaa_prod

# Run migrations
psql -h <prod-host> -U <prod-user> -d rodistaa_prod \
  -f packages/backend/migrations/001_initial_schema.sql

# Verify
psql -h <prod-host> -U <prod-user> -d rodistaa_prod -c "\dt"
```

### Backup Strategy

```bash
# Daily backups
pg_dump -h <prod-host> -U <prod-user> rodistaa_prod > backup_$(date +%Y%m%d).sql

# Restore
psql -h <prod-host> -U <prod-user> rodistaa_prod < backup_YYYYMMDD.sql
```

---

## 🔧 Backend Deployment

### Build

```bash
cd packages/backend
pnpm build
```

### Environment Variables

```env
NODE_ENV=production
PORT=4000

PGHOST=<prod-db-host>
PGPORT=5432
PGUSER=<prod-db-user>
PGPASSWORD=<prod-db-password>
PGDATABASE=rodistaa_prod

JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=15m

ACS_ENABLED=true
ADAPTER_MODE=production
```

### Run

```bash
cd packages/backend
pnpm start
```

### Process Management

Use PM2 or systemd:

```bash
# PM2
pm2 start dist/index.js --name rodistaa-backend

# Systemd
sudo systemctl start rodistaa-backend
```

---

## 📱 Mobile App Deployment

### Build

```bash
# Shipper
cd packages/mobile/shipper
expo build:android
expo build:ios

# Operator
cd packages/mobile/operator
expo build:android
expo build:ios

# Driver
cd packages/mobile/driver
expo build:android
expo build:ios
```

### Configuration

Update API URLs in app configs:
- Production API endpoint
- Environment-specific settings

---

## 🌐 Portal Deployment

### Build

```bash
cd packages/portal
pnpm build
```

### Deploy

Deploy `packages/portal/.next` directory to hosting service:

- Vercel (recommended)
- AWS Amplify
- Self-hosted with Node.js

### Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.rodistaa.com/v1
```

---

## 🔐 Security Checklist

- [ ] JWT secret is strong and unique
- [ ] Database passwords are secure
- [ ] API endpoints are behind reverse proxy
- [ ] HTTPS enabled everywhere
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] ACS rules are active
- [ ] Audit logging enabled

---

## 📊 Monitoring

### Health Checks

- Backend: `GET /health`
- Portal: `GET /api/health`

### Logs

- Backend: Check application logs
- Database: Check PostgreSQL logs
- Portal: Check Next.js logs

---

## 🔄 Rollback Procedure

1. Stop current deployment
2. Restore previous version
3. Run database rollback (if needed)
4. Verify health checks
5. Monitor for issues

---

**For production-specific configurations, contact DevOps team**

