# Operational Tools Guide

Quick reference for using the Rodistaa platform operational tools.

---

## 🏥 Health Check Tool

### Purpose
Verify that all critical services are running and accessible.

### Usage

```bash
# Using pnpm script
pnpm health-check

# Direct execution
node scripts/health-check.js
```

### What It Checks

**Critical Services** (deployment blocked if down):
- ✅ PostgreSQL (Port 5432)
- ✅ Redis (Port 6379)
- ✅ Backend API (`/v1/health` endpoint)

**Non-Critical Services** (warning only):
- ⚠️ Admin Portal (Port 3001)
- ⚠️ ACS Service (Port 3002)
- ⚠️ Mock Service (Port 3003)

### Output Example

```
=== Rodistaa Platform Health Check ===

Started at: 2024-12-02T10:30:00.000Z

✓ PostgreSQL [CRITICAL] - 45ms
✓ Redis [CRITICAL] - 32ms
✓ Backend API [CRITICAL] - 125ms
  {"status":"ok","version":"1.0.0","uptime":3600}
✓ Admin Portal - 89ms
✗ ACS Service
  Error: Connection refused

=== Summary ===
Healthy: 4 | Unhealthy: 1

⚠️  1 non-critical service(s) are down

✓ All critical services are healthy
```

### Exit Codes
- `0` - All critical services healthy
- `1` - One or more critical services down

### Configuration

Set environment variables to override defaults:

```bash
# Database
export PGHOST=localhost
export PGPORT=5432

# Redis
export REDIS_HOST=localhost
export REDIS_PORT=6379

# API URLs
export API_URL=http://localhost:4000/v1/health
export PORTAL_URL=http://localhost:3001
export ACS_URL=http://localhost:3002/health
export MOCKS_URL=http://localhost:3003/health
```

### Use Cases

1. **Pre-Deployment Check**
   ```bash
   pnpm health-check && pnpm build:all
   ```

2. **CI/CD Pipeline**
   ```yaml
   - name: Health Check
     run: pnpm health-check
   ```

3. **Docker Startup Validation**
   ```bash
   docker-compose up -d
   sleep 10
   pnpm health-check
   ```

4. **Monitoring Script**
   ```bash
   #!/bin/bash
   while true; do
     pnpm health-check
     sleep 60
   done
   ```

---

## 📋 Deployment Checklist Tool

### Purpose
Validate that all production requirements are met before deployment.

### Usage

```bash
# Using pnpm script
pnpm deployment-check

# Direct execution
node scripts/deployment-checklist.js
```

### What It Validates

**Environment Variables** (50+ variables):
- Database configuration
- Redis configuration
- JWT secrets
- AWS credentials and S3 buckets
- Payment gateway keys (Razorpay)
- SMS provider credentials (Twilio)
- Firebase configuration
- Google Maps API keys
- Monitoring tools (Sentry, New Relic)
- CORS and security settings

**Automated Checks**:
- Linter errors resolved
- TypeScript errors resolved
- Unit tests passing
- Integration tests passing
- Database migrations up to date
- Docker images built
- CORS properly configured
- Health check endpoints working
- Error tracking enabled
- APM configured

**Manual Checks** (reminders):
- Database backup configured
- HTTPS enabled
- Rate limiting configured
- Security headers configured
- Container orchestration configured
- Load balancer configured
- CDN configured
- Auto-scaling configured
- Log aggregation configured
- Alerts configured
- API documentation up to date
- Deployment guide reviewed
- Runbook created
- Rollback procedure documented

### Output Example

```
=== Rodistaa Production Deployment Checklist ===

📋 Environment Variables

Database:
  ✓ PGHOST: prod-db.rodistaa.com
  ✓ PGPORT: 5432
  ✓ PGUSER: rodistaa_prod
  ✓ PGPASSWORD: ********
  ✓ PGDATABASE: rodistaa_production
    PostgreSQL database name

AWS Services:
  ✓ AWS_REGION: ap-south-1
  ✓ AWS_ACCESS_KEY_ID: ********
  ✓ AWS_SECRET_ACCESS_KEY: ********
  ✓ S3_BUCKET_NAME: rodistaa-prod-assets
  ✗ KMS_KEY_ID - MISSING (REQUIRED)
    AWS KMS key for encryption

✅ Deployment Checklist

Code Quality:
  ✓ All linter errors resolved
    Run: pnpm lint
  ✓ All TypeScript errors resolved
    Run: pnpm typecheck
  ✓ Unit tests passing
    Run: pnpm test
  ✓ Integration tests passing
    Run: pnpm test:integration

Security:
  ○ All sensitive data encrypted - MANUAL CHECK
  ○ HTTPS enabled - MANUAL CHECK
  ○ Rate limiting configured - MANUAL CHECK
  ✓ CORS properly configured
    CORS configured: https://admin.rodistaa.com,https://franchise.rodistaa.com
  ○ Security headers configured - MANUAL CHECK

Infrastructure:
  ✓ Docker images built
    All Dockerfiles present
  ○ Container orchestration configured - MANUAL CHECK
  ○ Load balancer configured - MANUAL CHECK
  ○ CDN configured for static assets - MANUAL CHECK
  ○ Auto-scaling configured - MANUAL CHECK

=== Summary ===
Passed: 38
Failed: 5
Manual Checks Required: 12

❌ DEPLOYMENT BLOCKED: 5 critical requirement(s) not met
```

### Exit Codes
- `0` - All automated checks passed, ready to deploy
- `1` - Some checks failed or critical requirements not met

### Environment Setup

Create a `.env.production` file with all required variables:

```bash
# Copy from template
cp .env.example .env.production

# Edit with production values
nano .env.production

# Run checklist
export $(cat .env.production | xargs)
pnpm deployment-check
```

### Use Cases

1. **Pre-Deployment Gate**
   ```bash
   pnpm deployment-check && ./deploy-production.sh
   ```

2. **CI/CD Pipeline Gate**
   ```yaml
   - name: Validate Deployment Readiness
     run: pnpm deployment-check
   ```

3. **Environment Setup Validation**
   ```bash
   # After configuring new environment
   pnpm deployment-check
   ```

4. **Security Audit**
   ```bash
   # Verify all security requirements met
   pnpm deployment-check | grep -i security
   ```

---

## 🔄 Combined Workflow

### Local Development

```bash
# 1. Start all services
docker-compose up -d

# 2. Wait for services to be ready
sleep 10

# 3. Verify health
pnpm health-check

# 4. Start development
pnpm dev:all
```

### Pre-Deployment

```bash
# 1. Ensure all services running
pnpm health-check

# 2. Run tests
pnpm test:all

# 3. Check deployment readiness
pnpm deployment-check

# 4. Build for production
pnpm build:all

# 5. Final health check
NODE_ENV=production pnpm health-check
```

### CI/CD Pipeline

```yaml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run health checks
        run: pnpm health-check
      
      - name: Deployment validation
        run: pnpm deployment-check
      
      - name: Build all packages
        run: pnpm build:all
  
  deploy:
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: ./deploy.sh
```

---

## 📊 Monitoring Integration

### Continuous Health Monitoring

```bash
#!/bin/bash
# health-monitor.sh

LOG_FILE="/var/log/rodistaa-health.log"

while true; do
  echo "[$(date)] Running health check..." >> $LOG_FILE
  
  if pnpm health-check >> $LOG_FILE 2>&1; then
    echo "[$(date)] ✓ All services healthy" >> $LOG_FILE
  else
    echo "[$(date)] ✗ Service health check failed!" >> $LOG_FILE
    
    # Send alert (example with curl to Slack webhook)
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"⚠️ Rodistaa health check failed!"}' \
      $SLACK_WEBHOOK_URL
  fi
  
  sleep 300  # Check every 5 minutes
done
```

### Alerting on Deployment Issues

```bash
#!/bin/bash
# pre-deploy-check.sh

if ! pnpm deployment-check; then
  echo "❌ Deployment validation failed!"
  
  # Send notification
  curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"🚨 Deployment blocked: validation failed"}' \
    $SLACK_WEBHOOK_URL
  
  exit 1
fi

echo "✅ Deployment validation passed"
```

---

## 🛠️ Troubleshooting

### Health Check Shows Services Down

1. **Check if Docker containers are running**
   ```bash
   docker-compose ps
   ```

2. **Check Docker logs**
   ```bash
   docker-compose logs backend
   docker-compose logs postgres
   docker-compose logs redis
   ```

3. **Restart services**
   ```bash
   docker-compose restart
   ```

4. **Full reset**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

### Deployment Check Fails

1. **Missing environment variable**
   - Check `.env.production` file
   - Verify all required variables are set
   - Refer to `docs/guides/PRODUCTION_CREDENTIALS_CHECKLIST.md`

2. **Test failures**
   ```bash
   # Run tests individually
   pnpm test
   pnpm test:integration
   ```

3. **TypeScript errors**
   ```bash
   pnpm typecheck:all
   ```

4. **Linting errors**
   ```bash
   pnpm lint:all --fix
   ```

---

## 📚 Related Documentation

- [Local Setup Guide](./guides/LOCAL_SETUP_GUIDE.md)
- [Production Credentials Checklist](./guides/PRODUCTION_CREDENTIALS_CHECKLIST.md)
- [Production Deployment Guide](./guides/PRODUCTION_RELEASE_GUIDE.md)
- [E2E Test Execution Guide](./guides/E2E_TEST_EXECUTION_GUIDE.md)

---

## 🤝 Support

For issues with operational tools:
1. Check tool output for specific error messages
2. Review this guide for troubleshooting steps
3. Check service logs: `docker-compose logs <service>`
4. Verify environment configuration
5. Contact: ops-support@rodistaa.com

