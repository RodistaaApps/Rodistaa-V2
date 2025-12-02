# Rodistaa Deployment Checklist

Use this checklist to ensure successful deployment to staging and production.

---

## Pre-Deployment Checklist

### Code Quality ✅
- [x] All feature branches merged to develop
- [x] All tests passing (`pnpm -r test`)
- [x] No critical linter errors
- [x] Code reviewed and approved
- [x] CHANGELOG.md updated
- [x] Version numbers bumped

### Documentation ✅
- [x] README.md updated
- [x] RUN_LOCAL.md complete
- [x] API docs current (OpenAPI)
- [x] Deployment guides updated
- [x] Runbooks created

### Database ✅
- [x] Migrations tested locally
- [x] Rollback scripts ready
- [x] Seed data verified
- [x] Backup strategy defined

### Security ✅
- [x] Secrets rotated
- [x] SSL certificates valid
- [x] Rate limiting configured
- [x] CORS settings reviewed
- [x] Security audit completed

### Infrastructure ✅
- [x] Docker images built
- [x] Health checks configured
- [x] Monitoring setup ready
- [x] Logging configured
- [x] Resource limits defined

---

## Staging Deployment Checklist

### Pre-Deployment
- [ ] Staging environment provisioned
- [ ] Database created (rodistaa_staging)
- [ ] Secrets configured in environment
- [ ] Container registry access verified
- [ ] DNS configured (staging-api.rodistaa.com)

### Configuration
- [ ] Update `.github/workflows/deploy.yml`:
  ```yaml
  - name: Deploy to staging
    run: |
      kubectl apply -f k8s/staging/
      helm upgrade --install rodistaa-staging ./helm-chart \
        --namespace staging \
        --values values-staging.yaml
  ```
- [ ] Set GitHub secrets:
  - `CONTAINER_REGISTRY`
  - `REGISTRY_USERNAME`
  - `REGISTRY_PASSWORD`
  - `KUBE_CONFIG_STAGING`

### Deployment
- [ ] Trigger staging deployment:
  ```bash
  gh workflow run deploy.yml -f environment=staging
  ```
- [ ] Monitor deployment logs
- [ ] Wait for rollout to complete

### Post-Deployment Verification
- [ ] Health check passes:
  ```bash
  curl https://staging-api.rodistaa.com/health
  # Expected: {"status":"ok",...}
  ```
- [ ] Readiness check passes:
  ```bash
  curl https://staging-api.rodistaa.com/ready
  # Expected: {"status":"ready","database":"connected",...}
  ```
- [ ] Run smoke tests:
  ```bash
  API_BASE_URL=https://staging-api.rodistaa.com \
    node packages/backend/scripts/smoke_test_comprehensive.js
  ```
- [ ] Check ACS rules loaded:
  ```bash
  curl https://staging-api.rodistaa.com/acs/rules | jq '.count'
  # Expected: 25
  ```
- [ ] Verify audit logs working:
  ```sql
  SELECT COUNT(*) FROM audit_logs WHERE created_at > NOW() - INTERVAL '1 hour';
  ```
- [ ] Test authentication flow
- [ ] Test critical user flows
- [ ] Monitor for errors (24 hours)

---

## Production Deployment Checklist

### Pre-Deployment
- [ ] Staging tests passed (all green)
- [ ] Staging monitored for 24+ hours
- [ ] No critical issues in staging
- [ ] Production environment ready
- [ ] Database backup completed
- [ ] Rollback plan documented
- [ ] Team notified (deploy window)
- [ ] Change request approved

### Configuration
- [ ] Production secrets configured
- [ ] Cloud KMS configured (replace local KMS):
  ```env
  KMS_PROVIDER=aws  # or gcp, azure
  KMS_KEY_ID=arn:aws:kms:...
  KMS_REGION=ap-south-1
  ```
- [ ] Monitoring alerts configured
- [ ] Log aggregation setup (CloudWatch/Stackdriver)
- [ ] Backup automation configured

### Database Migration
- [ ] Backup production database
- [ ] Test migration on backup copy
- [ ] Run migration in maintenance window:
  ```bash
  kubectl exec -it deployment/rodistaa-backend -- \
    node_modules/.bin/knex migrate:latest
  ```
- [ ] Verify migration success
- [ ] Keep backup for 30 days

### Deployment
- [ ] Create release tag:
  ```bash
  git tag -a v1.0.0 -m "Production release v1.0.0"
  git push origin v1.0.0
  ```
- [ ] Trigger production deployment:
  ```bash
  gh workflow run deploy.yml -f environment=production
  ```
- [ ] Monitor deployment progress
- [ ] Wait for rollout (typically 5-10 minutes)
- [ ] Verify pods running:
  ```bash
  kubectl get pods -n production
  ```

### Post-Deployment Verification
- [ ] Health check passes:
  ```bash
  curl https://api.rodistaa.com/health
  ```
- [ ] Metrics endpoint accessible:
  ```bash
  curl https://api.rodistaa.com/metrics
  ```
- [ ] Run production smoke tests:
  ```bash
  API_BASE_URL=https://api.rodistaa.com \
    API_KEY=${PROD_API_KEY} \
    node packages/backend/scripts/smoke_test_comprehensive.js
  ```
- [ ] Verify ACS rules loaded (should be 25)
- [ ] Check audit logs writing correctly
- [ ] Test authentication with real users
- [ ] Monitor error rates (target: <0.1%)
- [ ] Monitor response times (target: <100ms p95)
- [ ] Check database connections
- [ ] Verify external integrations

### Monitoring (First 24 Hours)
- [ ] Error rate monitoring (<1%)
- [ ] Response time monitoring (<100ms avg)
- [ ] Database performance
- [ ] ACS rule evaluation metrics
- [ ] Audit log write success rate
- [ ] Memory usage stable
- [ ] CPU usage acceptable
- [ ] No critical errors in logs

---

## Rollback Procedures

### Quick Rollback (< 5 min)

```bash
# Rollback to previous version
kubectl rollout undo deployment/rodistaa-backend -n production

# Or deploy specific version
kubectl set image deployment/rodistaa-backend \
  backend=<registry>/rodistaa-backend:v0.9.0 \
  -n production

# Verify rollback
kubectl rollout status deployment/rodistaa-backend -n production
```

### Database Rollback

```bash
# Rollback last migration
kubectl exec -it deployment/rodistaa-backend -n production -- \
  node_modules/.bin/knex migrate:rollback

# Or restore from backup
psql rodistaa_prod < backup_YYYYMMDD.sql
```

### ACS Rule Rollback

```bash
# Disable problematic rule
kubectl exec -it deployment/rodistaa-backend -n production -- \
  node packages/acs/dist/scripts/unapply-rule.js <RULE_ID>

# Verify rule disabled
kubectl exec -it deployment/rodistaa-backend -n production -- \
  node -e "require('./packages/acs/dist/ruleLoader').loadRulesFromFile('./acs_rules_top25.yaml')"
```

---

## Monitoring Setup

### Prometheus Metrics
- **Endpoint**: `https://api.rodistaa.com/metrics`
- **Scrape Interval**: 15s
- **Retention**: 15 days

### Grafana Dashboards
1. **API Overview**: Request rate, latency, errors
2. **ACS Performance**: Rule evaluations, audit writes
3. **Database**: Connection pool, query time
4. **System**: CPU, memory, disk

### Alerts
| Alert | Threshold | Action |
|-------|-----------|--------|
| Error Rate | >1% | Page on-call |
| Response Time | >500ms p95 | Investigate |
| Database Connections | >80% | Scale up |
| Audit Write Failures | >5% | Check DB |
| ACS Evaluation Errors | >1% | Review rules |

---

## Post-Deployment Tasks

### Day 1
- [ ] Monitor all metrics
- [ ] Review error logs
- [ ] Verify user flows
- [ ] Check external integrations
- [ ] Team stand-up (issues review)

### Week 1
- [ ] Review performance metrics
- [ ] Optimize slow queries
- [ ] Adjust resource limits
- [ ] Fine-tune monitoring alerts
- [ ] Document any issues

### Week 2
- [ ] Performance optimization
- [ ] Load testing
- [ ] Capacity planning
- [ ] Cost analysis
- [ ] Team retrospective

---

## Success Criteria

### Technical Metrics
- [ ] Uptime: >99.9%
- [ ] Response Time: <100ms (p95)
- [ ] Error Rate: <0.1%
- [ ] ACS Evaluation: <10ms
- [ ] Database Queries: <50ms

### Business Metrics
- [ ] 25k+ loads/day capacity
- [ ] Zero critical incidents
- [ ] Zero data loss
- [ ] Compliance maintained
- [ ] User satisfaction high

---

## Emergency Contacts

### On-Call Rotation
- **Primary**: [TBD]
- **Secondary**: [TBD]
- **Escalation**: [TBD]

### Support Channels
- **Slack**: #rodistaa-ops
- **PagerDuty**: rodistaa-backend
- **Email**: ops@rodistaa.com

---

## Common Issues & Solutions

### High Error Rate
1. Check error logs for patterns
2. Review recent deployments
3. Check database connections
4. Verify external service status
5. Consider rollback if critical

### Slow Response Time
1. Check database query performance
2. Review ACS rule evaluation time
3. Check connection pool usage
4. Consider scaling horizontally
5. Optimize slow queries

### Database Connection Issues
1. Check connection pool settings
2. Verify database health
3. Check network connectivity
4. Review recent migrations
5. Consider connection pool increase

---

## Documentation Reference

- **Deployment**: `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Release**: `RELEASE_GUIDE.md`
- **Verification**: `VERIFY.md`
- **Runbooks**: `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Architecture**: `DECISIONS.md`

---

**Last Updated**: February 1, 2025  
**Version**: 1.0.0-rc1  
**Status**: ✅ Ready for Deployment

