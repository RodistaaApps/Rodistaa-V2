# ✅ Staging Deployment Checklist

**Target**: Staging Environment  
**Backends**: Fastify (4000) + NestJS (3000)  
**Date**: 2024-01-02

---

## Pre-Deployment

### Infrastructure
- [ ] Staging server provisioned
- [ ] PostgreSQL 15+ installed and configured
- [ ] Redis 7+ installed and running
- [ ] Docker installed
- [ ] Nginx/Load balancer configured
- [ ] SSL certificates obtained (staging-api-v1 and staging-api-v2)
- [ ] Firewall rules configured (ports 3000, 4000, 5432, 6379)

### Database
- [ ] Database created (`rodistaa_staging`)
- [ ] User created with permissions
- [ ] Backup plan in place
- [ ] Connection tested from staging server

### Code
- [ ] Both backends on `develop` branch
- [ ] All commits merged
- [ ] No pending changes
- [ ] Docker builds tested locally

---

## Deployment Steps

### Fastify Backend (Port 4000)

- [ ] Clone repository: `git clone <repo> && cd Rodistaa`
- [ ] Checkout develop: `git checkout develop`
- [ ] Create `.env.staging` file
- [ ] Build Docker image: `docker build -t rodistaa-fastify:staging .`
- [ ] Run migrations: `docker run --rm --env-file .env.staging rodistaa-fastify:staging node packages/backend/dist/scripts/migrate-latest.js`
- [ ] Start container: `docker run -d --name rodistaa-fastify-staging --env-file .env.staging -p 4000:4000 rodistaa-fastify:staging`
- [ ] Check logs: `docker logs rodistaa-fastify-staging`
- [ ] Test health: `curl http://localhost:4000/health`

### NestJS Backend (Port 3000)

- [ ] Clone repository: `git clone <repo> && cd New_UserUI_App/backend`
- [ ] Create `.env.staging` file
- [ ] Build Docker image: `docker build -t rodistaa-nestjs:staging .`
- [ ] Run migrations: `docker run --rm --env-file .env.staging rodistaa-nestjs:staging npx prisma migrate deploy`
- [ ] Start container: `docker run -d --name rodistaa-nestjs-staging --env-file .env.staging -p 3000:3000 rodistaa-nestjs:staging`
- [ ] Check logs: `docker logs rodistaa-nestjs-staging`
- [ ] Test health: `curl http://localhost:3000/health`

### Nginx Configuration

- [ ] Configure upstream servers (ports 3000, 4000)
- [ ] Set up server blocks for both domains
- [ ] Test config: `sudo nginx -t`
- [ ] Reload Nginx: `sudo systemctl reload nginx`
- [ ] Test HTTPS: `curl https://staging-api-v1.rodistaa.com/health`
- [ ] Test HTTPS: `curl https://staging-api-v2.rodistaa.com/health`

---

## Post-Deployment Validation

### Fastify Backend Tests

- [ ] Health check: `/health` returns 200
- [ ] Readiness check: `/ready` returns 200
- [ ] Metrics: `/metrics` returns data
- [ ] Auth login: POST `/v1/auth/login` works
- [ ] Create booking: POST `/v1/bookings` works
- [ ] ACS evaluation: POST `/v1/acs/evaluate` works
- [ ] Audit logs: GET `/v1/acs/audit/:entityType/:entityId` works

### NestJS Backend Tests

- [ ] Health check: `/health` returns 200
- [ ] User endpoints: GET `/api/users` works
- [ ] Booking endpoints: GET `/api/bookings` works
- [ ] Fleet endpoints: GET `/api/fleet` works
- [ ] KYC endpoints: POST `/api/kyc` works

### Database Validation

- [ ] Tables created (both schemas if using separate schemas)
- [ ] Seed data loaded
- [ ] Connections stable
- [ ] Query performance acceptable
- [ ] No connection leaks

### Mobile Apps Configuration

- [ ] React Native apps configured for Fastify backend
- [ ] Flutter apps configured for NestJS backend
- [ ] Authentication works from apps
- [ ] API calls successful

---

## Monitoring

### Set Up Monitoring

- [ ] Docker container health checks
- [ ] Application logs (stdout/stderr)
- [ ] Database connection monitoring
- [ ] API response time tracking
- [ ] Error rate tracking
- [ ] Resource usage (CPU, memory)

### Alert Configuration

- [ ] Health check failures
- [ ] High error rates (>1%)
- [ ] High response times (>500ms)
- [ ] Database connection issues
- [ ] Container restarts

---

## Smoke Tests

### Comprehensive Flow Test

- [ ] **Fastify Backend Flow**:
  1. Shipper login
  2. Create booking
  3. Operator login
  4. Place bid
  5. Shipper accept bid
  6. Shipment created
  7. GPS ping recorded
  8. POD uploaded
  9. OTP completion
  10. Ledger updated

- [ ] **NestJS Backend Flow**:
  1. User authentication
  2. KYC upload
  3. Truck registration
  4. Driver assignment
  5. Booking creation
  6. Bid placement

---

## Rollback Triggers

Deploy rollback if:
- [ ] Health checks failing after 5 minutes
- [ ] Error rate > 5%
- [ ] Database connection failures
- [ ] Critical functionality broken
- [ ] Security issues discovered

---

## Post-Deployment (24 Hours)

### Monitoring
- [ ] Check logs hourly for first 4 hours
- [ ] Review error logs every 6 hours
- [ ] Monitor performance metrics
- [ ] Check database query performance

### QA Testing
- [ ] Manual testing of all critical flows
- [ ] Security testing
- [ ] Performance testing
- [ ] Mobile app integration testing

### Documentation
- [ ] Update deployment docs with any issues
- [ ] Document solutions to problems encountered
- [ ] Update runbooks if needed

---

## Success Criteria

### Must Have ✅
- [ ] Both backends responding to health checks
- [ ] No critical errors in logs
- [ ] Database stable and performant
- [ ] Authentication working
- [ ] Core API endpoints functional

### Should Have
- [ ] All API endpoints responding
- [ ] Mobile apps connecting successfully
- [ ] ACS rules evaluating correctly
- [ ] Audit logs being written

### Nice to Have
- [ ] Response times < 200ms
- [ ] Zero errors for 24 hours
- [ ] 100% uptime for 24 hours

---

## Timeline

| Phase | Duration | Completion |
|-------|----------|------------|
| Database Setup | 15 min | [ ] |
| Fastify Deploy | 20 min | [ ] |
| NestJS Deploy | 20 min | [ ] |
| Nginx Config | 10 min | [ ] |
| Smoke Tests | 30 min | [ ] |
| **Total** | **1.5 hours** | [ ] |

---

## Support

**On-Call**: DevOps engineer  
**Backup**: Backend developers  
**Escalation**: Tech lead → CTO

**Communication**: Slack #deployments channel

---

## Sign-Off

- [ ] **DevOps Engineer**: Deployment complete
- [ ] **Backend Team**: Health checks passing
- [ ] **QA Team**: Smoke tests passed
- [ ] **Tech Lead**: Approved for 24h monitoring

---

**Prepared by**: AI CTO  
**Date**: 2024-01-02  
**Status**: Ready for execution

