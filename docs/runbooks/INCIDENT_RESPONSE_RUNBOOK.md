# 🚨 Incident Response Runbook

Quick reference guide for handling production incidents.

---

## Incident Severity Levels

### P0 - CRITICAL (Complete Outage)
- **Response Time**: Immediate (< 5 minutes)
- **Examples**: API down, database unreachable, total system failure
- **Action**: All hands on deck, page CTO

### P1 - HIGH (Major Feature Down)
- **Response Time**: < 15 minutes
- **Examples**: Payment failing, login broken, mobile app crashes
- **Action**: Senior engineers + DevOps

### P2 - MEDIUM (Degraded Performance)
- **Response Time**: < 1 hour
- **Examples**: Slow responses, partial feature issues
- **Action**: On-call engineer

### P3 - LOW (Minor Issue)
- **Response Time**: Next business day
- **Examples**: UI glitches, non-critical bugs
- **Action**: Regular development process

---

## P0 INCIDENT: API COMPLETELY DOWN

### Symptoms
- Health check returning 503/504
- All API requests failing
- Zero traffic in monitoring

### Immediate Actions (First 5 Minutes)

```bash
# 1. Check ECS service status
aws ecs describe-services \
  --cluster rodistaa-production \
  --services rodistaa-backend-prod \
  --query 'services[0].[serviceName,runningCount,desiredCount,status]'

# 2. Check recent deployments
aws ecs describe-services \
  --cluster rodistaa-production \
  --services rodistaa-backend-prod \
  --query 'services[0].deployments'

# 3. Check CloudWatch logs for errors
aws logs tail /aws/rodistaa/production/backend --since 10m --filter-pattern "ERROR"

# 4. If recent deployment - ROLLBACK IMMEDIATELY
./scripts/rollback-production.sh
```

### Root Cause Investigation

**Database Issue?**
```sql
-- Check connections
SELECT count(*), state FROM pg_stat_activity GROUP BY state;

-- Check for locks
SELECT * FROM pg_stat_activity WHERE wait_event IS NOT NULL;
```

**Memory/CPU Issue?**
```bash
# Check ECS task metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name MemoryUtilization \
  --dimensions Name=ServiceName,Value=rodistaa-backend-prod \
  --start-time $(date -u -d '30 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

### Resolution Steps
1. Rollback deployment if recent
2. Scale up tasks if resource issue
3. Restart database connections if DB issue
4. Update status page
5. Post-mortem within 24 hours

---

## P0 INCIDENT: DATABASE UNAVAILABLE

### Symptoms
- "Connection refused" errors
- "Too many connections" errors
- API timeouts

### Immediate Actions

```bash
# 1. Check RDS cluster status
aws rds describe-db-clusters \
  --db-cluster-identifier rodistaa-prod \
  --query 'DBClusters[0].[Status,Endpoint]'

# 2. Check database CPU/Memory
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBClusterIdentifier,Value=rodistaa-prod \
  --start-time $(date -u -d '30 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average

# 3. Check active connections
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c \
  "SELECT count(*), state FROM pg_stat_activity GROUP BY state;"

# 4. If too many connections - kill idle ones
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
   WHERE state = 'idle' AND state_change < NOW() - INTERVAL '5 minutes';"
```

### Escalation
- If database is down: Contact AWS Support (Premium)
- Check for failover events
- Consider manual failover to standby

---

## P1 INCIDENT: PAYMENT GATEWAY FAILING

### Symptoms
- Payment success rate < 50%
- Razorpay webhook errors
- Users reporting payment issues

### Immediate Actions

```bash
# 1. Check Razorpay status
curl https://status.razorpay.com/api/v2/status.json

# 2. Check recent payment logs
aws logs tail /aws/rodistaa/production/backend --since 30m --filter-pattern "razorpay"

# 3. Verify webhook endpoint
curl -X POST https://api.rodistaa.com/v1/webhooks/razorpay/health

# 4. Check Razorpay dashboard
# Login to https://dashboard.razorpay.com and check transactions
```

### Common Fixes
1. **Webhook signature mismatch**: Verify `RAZORPAY_WEBHOOK_SECRET`
2. **Rate limiting**: Contact Razorpay support
3. **Network issue**: Check security groups
4. **API key expired**: Rotate keys in dashboard

---

## P1 INCIDENT: HIGH ERROR RATE (> 5%)

### Symptoms
- Error rate spiking in Grafana
- Multiple 5xx errors in logs
- User complaints

### Investigation

```bash
# 1. Identify error patterns
aws logs tail /aws/rodistaa/production/backend --since 30m --filter-pattern "ERROR" \
  | grep -oP 'Error: \K[^"]+' | sort | uniq -c | sort -rn | head -10

# 2. Check Sentry for stack traces
# Visit: https://sentry.io/organizations/rodistaa/issues/

# 3. Check recent code changes
git log --since="2 hours ago" --oneline

# 4. Check external service status
curl https://status.aws.amazon.com/
```

### Resolution
1. If code-related: Rollback
2. If external service: Enable fallback/circuit breaker
3. If rate limiting: Scale up or optimize
4. Document in post-mortem

---

## P1 INCIDENT: MOBILE APP CRASHES

### Symptoms
- Crash rate > 2% in Firebase
- User reports of app crashes
- Sentry showing mobile errors

### Investigation

```bash
# 1. Check Firebase Crashlytics
# Visit: https://console.firebase.google.com/project/rodistaa-prod/crashlytics

# 2. Check Sentry for mobile errors
# Visit: https://sentry.io/organizations/rodistaa/projects/rodistaa-mobile-prod/

# 3. Identify crash pattern
# - Which app version?
# - Which devices/OS versions?
# - Which screens/features?

# 4. Check recent app releases
cd packages/mobile/shipper
git log --since="1 week ago" --oneline
```

### Resolution
1. Hotfix if critical crash (>10% users affected)
2. Submit emergency update to app stores
3. Rollback server API if API change caused crash
4. Communicate via in-app banner if needed

---

## P2 INCIDENT: SLOW API RESPONSES

### Symptoms
- p95 latency > 1000ms
- User complaints about slowness
- Grafana showing high response times

### Investigation

```bash
# 1. Identify slow endpoints
aws logs insights query \
  --log-group-name /aws/rodistaa/production/backend \
  --start-time $(date -u -d '1 hour ago' +%s) \
  --end-time $(date -u +%s) \
  --query-string 'fields @timestamp, endpoint, duration | filter duration > 1000 | sort duration desc | limit 20'

# 2. Check database slow queries
psql -h $PGHOST -U $PGUSER -d $PGDATABASE <<EOF
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;
EOF

# 3. Check Redis performance
redis-cli --tls -h $REDIS_HOST -a $REDIS_PASSWORD INFO stats

# 4. Check resource utilization
# CPU, Memory, Network in CloudWatch
```

### Common Fixes
1. **Missing index**: Add database index
2. **N+1 queries**: Optimize ORM queries
3. **Large payloads**: Add pagination
4. **Cold cache**: Warm up cache
5. **Insufficient resources**: Scale horizontally

---

## COMMUNICATION TEMPLATES

### Initial Incident Notification (Slack)
```
🚨 INCIDENT ALERT - P0

Status: INVESTIGATING
Impact: [API Down / Payment Failing / etc]
Started: [Time]
Affected Users: [Estimate]

Current Actions:
- [Action 1]
- [Action 2]

Next Update: In 15 minutes

War Room: #incident-response
Incident Commander: @engineer-name
```

### Status Page Update
```
🔴 We are currently experiencing issues with [Feature]

Impact: [Description of user impact]
Status: Investigating
Started: [Time]

We are actively working on a resolution and will provide updates every 15 minutes.

For urgent issues, contact support@rodistaa.com
```

### Resolution Notification
```
✅ INCIDENT RESOLVED

Issue: [Brief description]
Duration: [Start time - End time]
Root Cause: [Brief explanation]

Resolution:
- [What was done]

Follow-up Actions:
- Post-mortem scheduled for [Date]
- Preventive measures being implemented

Thank you for your patience.
```

---

## POST-INCIDENT CHECKLIST

Within 1 hour:
- [ ] Verify full system recovery
- [ ] Update status page to "Resolved"
- [ ] Send resolution notification
- [ ] Document timeline in incident log

Within 24 hours:
- [ ] Conduct post-mortem meeting
- [ ] Document root cause
- [ ] Create action items
- [ ] Update runbooks if needed

Within 1 week:
- [ ] Implement preventive measures
- [ ] Update monitoring/alerts
- [ ] Share learnings with team
- [ ] Review incident response process

---

## CONTACTS & RESOURCES

### Emergency Contacts
- **CTO**: [Phone]
- **DevOps Lead**: [Phone]
- **On-Call Engineer**: [Rotation schedule]
- **AWS Support**: 1-800-XXX-XXXX (Premium)

### Key URLs
- **Grafana**: https://grafana.rodistaa.com
- **Sentry**: https://sentry.io/organizations/rodistaa
- **AWS Console**: https://console.aws.amazon.com
- **Razorpay Dashboard**: https://dashboard.razorpay.com
- **Firebase Console**: https://console.firebase.google.com

### Runbooks
- [Database Issues](./DATABASE_INCIDENTS.md)
- [Network Issues](./NETWORK_INCIDENTS.md)
- [Security Incidents](./SECURITY_INCIDENTS.md)

---

**Remember**: Stay calm, communicate clearly, and follow the process. You've got this! 💪

