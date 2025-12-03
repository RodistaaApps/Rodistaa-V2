# 🎴 Quick Reference Cards

Fast reference guides for common operations. Print or bookmark these!

---

## 🚀 DEPLOYMENT CARD

### Staging Deployment
```bash
# Pre-checks
git status                    # Ensure clean
pnpm typecheck:all           # Verify types
pnpm test:all                # Run tests

# Deploy
./scripts/deploy-staging.sh

# Verify
./scripts/run-smoke-tests.sh staging
```

### Production Deployment
```bash
# CRITICAL: Complete checklist first!
# See: FINAL_LAUNCH_CHECKLIST.md

# Deploy
./scripts/deploy-production.sh

# Monitor (first 24h)
# See: POST_DEPLOYMENT_MONITORING.md
```

### Emergency Rollback
```bash
./scripts/rollback-production.sh
```

---

## 🔍 MONITORING CARD

### Quick Health Check
```bash
# Automated check
pnpm health-check

# Manual checks
curl https://api.rodistaa.com/health
curl https://portal.rodistaa.com

# AWS services
aws ecs describe-services --cluster rodistaa-production \
  --services rodistaa-backend-prod --query 'services[0].runningCount'
```

### Key Dashboards
- **Grafana**: https://grafana.rodistaa.com
- **Sentry**: https://sentry.io/organizations/rodistaa
- **AWS CloudWatch**: Console → CloudWatch → Logs

### Critical Metrics
| Metric | Target | Warning |
|--------|--------|---------|
| Uptime | 99.9% | < 99.5% |
| Response (p95) | < 500ms | > 800ms |
| Error Rate | < 0.5% | > 1% |
| CPU Usage | < 60% | > 75% |
| Memory Usage | < 70% | > 80% |

---

## 🚨 INCIDENT CARD

### Severity Assessment
- **P0**: Complete outage → Page CTO immediately
- **P1**: Major feature down → Senior engineers
- **P2**: Degraded performance → On-call engineer
- **P3**: Minor issue → Regular process

### First 5 Minutes (P0/P1)
```bash
# 1. Check service status
aws ecs describe-services --cluster rodistaa-production \
  --services rodistaa-backend-prod

# 2. Check recent logs
aws logs tail /aws/rodistaa/production/backend \
  --since 10m --filter-pattern "ERROR"

# 3. If recent deployment - ROLLBACK
./scripts/rollback-production.sh

# 4. Notify team
# Post in #incident-response
```

### Runbooks
- **All Incidents**: `docs/runbooks/INCIDENT_RESPONSE_RUNBOOK.md`
- **Database Issues**: `docs/runbooks/DATABASE_MAINTENANCE.md`

---

## 🗄️ DATABASE CARD

### Connection
```bash
psql -h $PGHOST -U $PGUSER -d $PGDATABASE
```

### Health Checks
```sql
-- Active connections
SELECT count(*), state FROM pg_stat_activity GROUP BY state;

-- Database size
SELECT pg_size_pretty(pg_database_size('rodistaa_production'));

-- Slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 10;
```

### Emergency Actions
```sql
-- Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle' AND state_change < NOW() - INTERVAL '10 minutes';

-- Check locks
SELECT * FROM pg_stat_activity WHERE wait_event IS NOT NULL;
```

---

## 🧪 TESTING CARD

### Local Testing
```bash
# Backend
cd packages/backend
pnpm test

# Portal
cd packages/portal
pnpm test:e2e

# Mobile (all apps)
cd packages/mobile/shipper && pnpm test
```

### Load Testing
```bash
# Normal load (50 users, 10 min)
k6 run --vus 50 --duration 10m tests/load/k6-load-test.js

# Peak load (200 users, 15 min)
k6 run --vus 200 --duration 15m tests/load/k6-load-test.js

# Custom
k6 run --vus 100 --duration 30m \
  -e BASE_URL=https://api-staging.rodistaa.com \
  tests/load/k6-load-test.js
```

### UAT Testing
- Follow: `UAT_EXECUTION_GUIDE.md`
- 25 scenarios covering all modules
- Get stakeholder sign-off

---

## 📱 MOBILE APP CARD

### Build iOS
```bash
cd packages/mobile/shipper
eas build --platform ios --profile production
eas submit --platform ios
```

### Build Android
```bash
cd packages/mobile/shipper
eas build --platform android --profile production
eas submit --platform android
```

### Check Status
- **iOS**: App Store Connect
- **Android**: Google Play Console
- **Crashes**: Firebase Crashlytics

---

## 🔐 SECURITY CARD

### Secrets Management
```bash
# Generate JWT secrets
openssl rand -base64 64

# Generate encryption key
openssl rand -hex 32

# Store in AWS Secrets Manager
aws secretsmanager create-secret \
  --name rodistaa/production/backend \
  --secret-string file://secrets.json
```

### Security Checks
```bash
# Audit dependencies
pnpm audit --prod

# Check SSL
curl -I https://api.rodistaa.com

# Verify CORS
curl -H "Origin: https://evil.com" https://api.rodistaa.com
```

---

## 📊 LOGS CARD

### View Logs
```bash
# Backend (last 10 minutes)
aws logs tail /aws/rodistaa/production/backend --since 10m --follow

# Portal
aws logs tail /aws/rodistaa/production/portal --since 10m --follow

# Filter errors only
aws logs tail /aws/rodistaa/production/backend \
  --since 30m --filter-pattern "ERROR"

# Search specific user
aws logs tail /aws/rodistaa/production/backend \
  --since 1h --filter-pattern "USR-SH-001"
```

### Log Insights Queries
```sql
-- Top 10 slowest endpoints
fields @timestamp, endpoint, duration
| filter duration > 1000
| sort duration desc
| limit 10

-- Error frequency
fields @timestamp, @message
| filter @message like /ERROR/
| stats count() by bin(5m)
```

---

## 💾 BACKUP CARD

### Manual Backup
```bash
# Database backup
pg_dump -h $PGHOST -U $PGUSER -Fc rodistaa_production \
  > backup-$(date +%Y%m%d-%H%M%S).dump

# Upload to S3
aws s3 cp backup-*.dump s3://rodistaa-prod-backups/manual/

# Verify
pg_restore -l backup-*.dump | head -20
```

### Restore from Backup
```bash
# List available snapshots
aws rds describe-db-cluster-snapshots \
  --db-cluster-identifier rodistaa-prod \
  --query 'DBClusterSnapshots[*].[DBClusterSnapshotIdentifier,SnapshotCreateTime]'

# Restore to new cluster
aws rds restore-db-cluster-from-snapshot \
  --db-cluster-identifier rodistaa-prod-restored \
  --snapshot-identifier <snapshot-id>
```

---

## 🌐 DNS & NETWORKING CARD

### Check DNS
```bash
# Verify DNS resolution
nslookup api.rodistaa.com
nslookup portal.rodistaa.com

# Check SSL certificate
openssl s_client -connect api.rodistaa.com:443 -servername api.rodistaa.com
```

### Test Endpoints
```bash
# Health check
curl https://api.rodistaa.com/health

# Full request test
curl -X POST https://api.rodistaa.com/v1/auth/otp \
  -H "Content-Type: application/json" \
  -d '{"mobile":"+919876543210"}'
```

---

## 📈 SCALING CARD

### Manual Scaling
```bash
# Scale up ECS service
aws ecs update-service \
  --cluster rodistaa-production \
  --service rodistaa-backend-prod \
  --desired-count 5

# Scale database
aws rds modify-db-cluster \
  --db-cluster-identifier rodistaa-prod \
  --apply-immediately
```

### Check Current Scale
```bash
# ECS tasks
aws ecs describe-services \
  --cluster rodistaa-production \
  --services rodistaa-backend-prod \
  --query 'services[0].[desiredCount,runningCount]'

# Database instances
aws rds describe-db-clusters \
  --db-cluster-identifier rodistaa-prod \
  --query 'DBClusters[0].DBClusterMembers'
```

---

## 🔄 GIT WORKFLOW CARD

### Release Process
```bash
# 1. Create release branch
git checkout -b release/v1.0.0

# 2. Update version
# Edit package.json files

# 3. Create tag
git tag -a v1.0.0 -m "Production release v1.0.0"

# 4. Push
git push origin release/v1.0.0
git push origin v1.0.0

# 5. Deploy triggers automatically via GitHub Actions
```

### Hotfix Process
```bash
# 1. Create hotfix branch from main
git checkout -b hotfix/critical-bug main

# 2. Fix and test
# ... make changes ...
pnpm test:all

# 3. Tag and deploy
git tag -a v1.0.1 -m "Hotfix: Critical bug"
git push origin hotfix/critical-bug
git push origin v1.0.1
```

---

## 📞 CONTACTS CARD

### Emergency Contacts
- **CTO**: [Phone] [Email]
- **DevOps Lead**: [Phone] [Email]
- **On-Call**: [Rotation Schedule]

### External Support
- **AWS Support**: 1-800-XXX-XXXX (Premium)
- **Razorpay**: support@razorpay.com
- **Firebase**: Console Support

### Internal Channels
- **Dev**: #rodistaa-dev
- **Production**: #rodistaa-production
- **Incidents**: #incident-response
- **Support**: support@rodistaa.com

---

## 🎯 PERFORMANCE TARGETS CARD

### Response Times
| Endpoint | Target (avg) | Target (p95) |
|----------|--------------|--------------|
| /health | < 10ms | < 20ms |
| /auth/login | < 150ms | < 250ms |
| /bookings (GET) | < 100ms | < 200ms |
| /bookings (POST) | < 250ms | < 450ms |
| /load-board | < 200ms | < 400ms |

### Database Queries
| Query Type | Target |
|------------|--------|
| Simple SELECT | < 5ms |
| JOIN queries | < 20ms |
| INSERT/UPDATE | < 10ms |

### Business Metrics
- **Booking Success Rate**: > 95%
- **Payment Success Rate**: > 98%
- **User Satisfaction**: NPS > 50
- **App Crash Rate**: < 1%

---

## 🛠️ TROUBLESHOOTING CARD

### Common Issues

**High Response Times**
```bash
# Check slow queries
psql -c "SELECT query, mean_exec_time FROM pg_stat_statements 
         ORDER BY mean_exec_time DESC LIMIT 5;"

# Check ECS CPU/Memory
aws cloudwatch get-metric-statistics --metric-name CPUUtilization ...
```

**Database Connection Issues**
```bash
# Check connections
psql -c "SELECT count(*) FROM pg_stat_activity;"

# Kill idle connections
psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
         WHERE state = 'idle' AND state_change < NOW() - INTERVAL '10 minutes';"
```

**High Error Rate**
```bash
# Check recent errors
aws logs tail /aws/rodistaa/production/backend \
  --since 30m --filter-pattern "ERROR"

# Check Sentry
# Visit: https://sentry.io/organizations/rodistaa/issues/
```

---

## 💡 TIPS & TRICKS

### Productivity
- Use **START_HERE.md** for everything
- Keep **FINAL_LAUNCH_CHECKLIST.md** handy
- Bookmark Grafana & Sentry
- Join #rodistaa-production Slack

### Best Practices
- Always test in staging first
- Take backups before major changes
- Document all manual interventions
- Use CONCURRENTLY for DB indexes
- Monitor for 24h after deployment

### Time Savers
```bash
# Alias commands (add to ~/.bashrc)
alias rod-health="pnpm health-check"
alias rod-logs="aws logs tail /aws/rodistaa/production/backend --follow"
alias rod-deploy-staging="./scripts/deploy-staging.sh"
alias rod-deploy-prod="./scripts/deploy-production.sh"
```

---

## 📋 CHECKLIST SHORTCUTS

**Before Every Deployment:**
- [ ] Tests passing
- [ ] Staging verified
- [ ] Team notified
- [ ] Rollback ready

**After Every Deployment:**
- [ ] Health checks passing
- [ ] Error rate normal
- [ ] Monitoring active
- [ ] Team updated

**Daily Operations:**
- [ ] Check Grafana
- [ ] Review Sentry errors
- [ ] Check support tickets
- [ ] Monitor business metrics

---

**💡 TIP: Print this page or save as PDF for quick reference!**

---

*Quick Reference Cards v1.0 | Last Updated: Dec 2, 2025*

