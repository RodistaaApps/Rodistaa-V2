# Production Deployment Runbook

**Owner**: DevOps Team  
**Last Updated**: December 2, 2025  
**Status**: Ready for execution

---

## Pre-Deployment Checklist

### 1. Code & Tests ✅
- [ ] All PRs merged to `master`
- [ ] CI passing (all checks green)
- [ ] E2E tests passing
- [ ] Load tests completed
- [ ] Security scan passed
- [ ] Database migrations tested

### 2. Infrastructure ✅
- [ ] Terraform plan reviewed
- [ ] Infrastructure provisioned
- [ ] DNS records configured
- [ ] SSL certificates installed
- [ ] Secrets configured in AWS Secrets Manager

### 3. Integrations ✅
- [ ] Razorpay production keys configured
- [ ] Google Maps API tested
- [ ] Firebase notifications working
- [ ] IRP integration verified
- [ ] All external services healthy

### 4. Monitoring ✅
- [ ] Prometheus configured
- [ ] Grafana dashboards created
- [ ] Alerts configured
- [ ] PagerDuty integration tested
- [ ] Slack notifications working

---

## Deployment Steps

### Phase 1: Pre-Deployment (30 minutes)

#### 1.1 Backup Current State
```bash
# Backup database
kubectl exec -n rodistaa-staging deploy/postgres -- \
  pg_dump -U rodistaa rodistaa > backup_pre_deployment_$(date +%Y%m%d_%H%M%S).sql

# Tag current images
aws ecr describe-images --repository-name rodistaa-backend \
  --query 'sort_by(imageDetails,& imagePushedAt)[-1].imageTags[0]' \
  | xargs -I {} aws ecr batch-get-image \
    --repository-name rodistaa-backend \
    --image-ids imageTag={} \
    --query 'images[0].imageManifest' \
    --output text \
  | aws ecr put-image \
    --repository-name rodistaa-backend \
    --image-tag pre-prod-$(date +%Y%m%d) \
    --image-manifest -
```

#### 1.2 Notify Team
```bash
# Post to Slack
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{"text":"🚀 Production deployment starting..."}'
```

#### 1.3 Enable Maintenance Mode (Optional)
```bash
# Set maintenance page
kubectl apply -f manifests/maintenance-page.yaml
```

---

### Phase 2: Database Migrations (15 minutes)

#### 2.1 Run Migrations
```bash
# Connect to production database pod
kubectl exec -it -n rodistaa-production deploy/backend -- \
  pnpm run migrate:latest

# Verify migration
kubectl exec -it -n rodistaa-production deploy/backend -- \
  pnpm run migrate:status
```

#### 2.2 Verify Data Integrity
```bash
# Run post-migration checks
kubectl exec -it -n rodistaa-production deploy/postgres -- \
  psql -U rodistaa -d rodistaa -c "SELECT COUNT(*) FROM bookings;"

kubectl exec -it -n rodistaa-production deploy/postgres -- \
  psql -U rodistaa -d rodistaa -c "SELECT COUNT(*) FROM users;"
```

---

### Phase 3: Deploy Application (Canary - 2 hours)

#### 3.1 Deploy 5% Traffic
```bash
# Update backend with canary
helm upgrade rodistaa-backend ./infra/helm/backend \
  --namespace rodistaa-production \
  --set image.tag=$NEW_VERSION \
  --set canary.enabled=true \
  --set canary.weight=5 \
  --wait

# Monitor for 30 minutes
watch -n 10 'kubectl top pods -n rodistaa-production'
```

**Monitor Metrics** (30 minutes):
- Error rate < 0.1%
- p99 latency < 1000ms
- CPU < 70%
- Memory < 80%

#### 3.2 Increase to 25%
```bash
helm upgrade rodistaa-backend ./infra/helm/backend \
  --namespace rodistaa-production \
  --set canary.weight=25 \
  --reuse-values

# Monitor for 30 minutes
```

#### 3.3 Increase to 50%
```bash
helm upgrade rodistaa-backend ./infra/helm/backend \
  --namespace rodistaa-production \
  --set canary.weight=50 \
  --reuse-values

# Monitor for 30 minutes
```

#### 3.4 Full Cutover (100%)
```bash
helm upgrade rodistaa-backend ./infra/helm/backend \
  --namespace rodistaa-production \
  --set canary.enabled=false \
  --set image.tag=$NEW_VERSION \
  --wait

log_success "Full deployment complete"
```

---

### Phase 4: Verification (30 minutes)

#### 4.1 Health Checks
```bash
# Check all services healthy
kubectl get pods -n rodistaa-production

# Test API endpoints
curl -f https://api.rodistaa.com/health
curl -f https://portal.rodistaa.com
```

#### 4.2 Smoke Tests
```bash
# Run automated smoke tests
./scripts/smoke/production_smoke.sh

# Expected: All tests pass
```

#### 4.3 Manual Verification
1. Login to admin portal
2. Create test booking
3. Place test bid
4. Complete test shipment
5. Verify ACS rules firing
6. Check audit logs

---

### Phase 5: Post-Deployment (1 hour)

#### 5.1 Disable Maintenance Mode
```bash
kubectl delete -f manifests/maintenance-page.yaml
```

#### 5.2 Monitor Metrics
```bash
# Watch Grafana dashboard
open https://grafana.rodistaa.com/d/production-overview

# Check error rates
kubectl logs -n rodistaa-production deploy/backend --tail=100 | grep ERROR

# Verify ACS service
kubectl logs -n rodistaa-production deploy/acs --tail=50
```

#### 5.3 Notify Success
```bash
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{"text":"✅ Production deployment successful!"}'
```

---

## Rollback Procedure

### If Issues Detected

#### Quick Rollback (5 minutes)
```bash
# Rollback to previous version
helm rollback rodistaa-backend -n rodistaa-production

# Verify rollback
kubectl get pods -n rodistaa-production
```

#### Database Rollback
```bash
# Rollback migrations
kubectl exec -it -n rodistaa-production deploy/backend -- \
  pnpm run migrate:rollback

# Restore from backup if needed
kubectl exec -i -n rodistaa-production deploy/postgres -- \
  psql -U rodistaa rodistaa < backup_pre_deployment_*.sql
```

#### Full System Rollback
```bash
# Rollback all services
helm rollback rodistaa-backend -n rodistaa-production
helm rollback rodistaa-acs -n rodistaa-production
helm rollback rodistaa-portal -n rodistaa-production

# Verify all services healthy
kubectl get pods -n rodistaa-production
```

---

## Monitoring During Deployment

### Key Metrics to Watch

1. **Error Rate**
   - Target: < 0.1%
   - Alert: > 1%
   - Critical: > 5%

2. **Response Time**
   - p95: < 500ms
   - p99: < 1000ms
   - Alert: p99 > 2000ms

3. **CPU Utilization**
   - Target: 50-70%
   - Alert: > 85%
   - Critical: > 95%

4. **Memory Usage**
   - Target: 60-80%
   - Alert: > 90%
   - Critical: > 95%

5. **Database Connections**
   - Target: < 80% of pool
   - Alert: > 90%
   - Critical: Pool exhausted

### Rollback Triggers

Automatic rollback if:
- Error rate > 5% for 2 minutes
- p99 > 3000ms for 5 minutes
- CPU > 95% for 3 minutes
- Database unreachable
- ACS service down

---

## Post-Deployment Monitoring

### First 4 Hours (Critical Window)
- Check metrics every 15 minutes
- Review error logs continuously
- Monitor user feedback
- Watch ACS audit logs

### Day 1-3 (Elevated Monitoring)
- Check metrics every 2 hours
- Daily ACS rule review
- Daily fraud analysis
- Review performance trends

### Week 1 (Standard Monitoring)
- Daily metric review
- Weekly ACS audit
- Weekly capacity planning
- Bug triage and fixes

---

## Emergency Contacts

| Role | Contact | Escalation |
|------|---------|------------|
| DevOps Lead | On-call | PagerDuty |
| CTO | Email/Slack | Direct |
| Backend Lead | Slack | 15 min SLA |
| Security Lead | Email | 30 min SLA |

---

## Appendix: Commands Reference

### View Logs
```bash
# Backend logs
kubectl logs -f -n rodistaa-production deploy/backend

# ACS logs
kubectl logs -f -n rodistaa-production deploy/acs

# Portal logs
kubectl logs -f -n rodistaa-production deploy/portal
```

### Scale Services
```bash
# Manual scaling
kubectl scale deploy/backend --replicas=10 -n rodistaa-production

# HPA status
kubectl get hpa -n rodistaa-production
```

### Database Access
```bash
# Connect to database
kubectl exec -it -n rodistaa-production deploy/postgres -- \
  psql -U rodistaa -d rodistaa
```

---

**Runbook Version**: 1.0  
**Last Tested**: Pending first production deployment  
**Next Review**: After first deployment

