# 📊 Post-Deployment Monitoring Guide

Comprehensive guide for monitoring Rodistaa platform after production deployment.

---

## Immediate Post-Deployment (First 24 Hours)

### Critical Monitoring Points

#### 1. Application Health
- [ ] Backend API responding (< 500ms avg)
- [ ] Admin Portal accessible
- [ ] Mobile apps connecting successfully
- [ ] Database connections healthy
- [ ] Redis cache working
- [ ] No memory leaks detected

#### 2. Error Rates
- [ ] < 1% API error rate
- [ ] No 5xx errors
- [ ] No database connection errors
- [ ] No authentication failures (except invalid credentials)

#### 3. Performance Metrics
- [ ] Response times within SLA
- [ ] Database query performance normal
- [ ] Cache hit rate > 80%
- [ ] CDN serving static assets

---

## Monitoring Tools & Dashboards

### 1. Grafana Dashboard
**URL**: https://grafana.rodistaa.com

**Key Metrics to Watch**:
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (%)
- Active users
- Database connections
- Memory usage
- CPU usage

**Alerts**:
- Error rate > 1% for 5 minutes
- Response time p95 > 1000ms
- Memory usage > 80%
- Database connections > 90% of pool

---

### 2. AWS CloudWatch

#### Backend Logs
```bash
# Follow backend logs
aws logs tail /aws/rodistaa/production/backend --follow

# Filter errors
aws logs tail /aws/rodistaa/production/backend --follow --filter-pattern "ERROR"

# Search for specific user
aws logs tail /aws/rodistaa/production/backend --follow --filter-pattern "USR-SH-01"
```

#### Portal Logs
```bash
aws logs tail /aws/rodistaa/production/portal --follow
```

#### Database Logs
```bash
aws logs tail /aws/rds/cluster/rodistaa-prod/postgresql --follow
```

---

### 3. Sentry Error Tracking

**URL**: https://sentry.io/organizations/rodistaa/projects/

**Monitor**:
- Unhandled exceptions
- API errors
- JavaScript errors in portal
- Mobile app crashes
- Performance issues

**Response**:
- Critical errors: Fix within 1 hour
- High priority: Fix within 4 hours
- Medium/Low: Fix in next release

---

### 4. AWS CloudWatch Alarms

#### Create Key Alarms

```bash
# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name rodistaa-prod-high-error-rate \
  --alarm-description "Alert when error rate exceeds 1%" \
  --metric-name Errors \
  --namespace Rodistaa/Production \
  --statistic Average \
  --period 300 \
  --threshold 1.0 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:ap-south-1:xxxx:rodistaa-alerts

# High response time alarm
aws cloudwatch put-metric-alarm \
  --alarm-name rodistaa-prod-high-latency \
  --alarm-description "Alert when p95 latency exceeds 1s" \
  --metric-name ResponseTime \
  --namespace Rodistaa/Production \
  --extended-statistic p95 \
  --period 300 \
  --threshold 1000 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:ap-south-1:xxxx:rodistaa-alerts

# Database CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name rodistaa-prod-db-high-cpu \
  --alarm-description "Alert when DB CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --dimensions Name=DBClusterIdentifier,Value=rodistaa-prod \
  --statistic Average \
  --period 300 \
  --threshold 80.0 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 3 \
  --alarm-actions arn:aws:sns:ap-south-1:xxxx:rodistaa-alerts
```

---

## Key Metrics to Monitor

### Application Metrics

| Metric | Target | Warning | Critical | Action |
|--------|--------|---------|----------|--------|
| API Availability | 99.9% | < 99.5% | < 99% | Check ECS tasks |
| Avg Response Time | < 300ms | > 500ms | > 1000ms | Optimize queries |
| p95 Response Time | < 500ms | > 800ms | > 1500ms | Scale up |
| Error Rate | < 0.5% | > 1% | > 5% | Investigate logs |
| Database Connections | < 70% | > 80% | > 90% | Increase pool |
| Memory Usage | < 70% | > 80% | > 90% | Scale up |
| CPU Usage | < 60% | > 75% | > 85% | Scale up |

### Business Metrics

| Metric | Check Frequency | Action |
|--------|----------------|---------|
| New User Signups | Hourly | Compare to baseline |
| Bookings Created | Hourly | Alert if drops > 50% |
| Active Shipments | Real-time | Monitor for anomalies |
| Payment Success Rate | Hourly | Alert if < 95% |
| App Crash Rate | Daily | Alert if > 1% |

---

## Common Issues & Solutions

### Issue 1: High Response Times

**Symptoms**:
- API response time > 1000ms
- Users complaining about slowness

**Investigate**:
```bash
# Check slow queries
psql -h $PGHOST -U $PGUSER -d $PGDATABASE <<EOF
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
EOF

# Check database connections
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c \
  "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"
```

**Solutions**:
1. Add database indexes
2. Optimize slow queries
3. Increase database connections
4. Scale ECS tasks horizontally

---

### Issue 2: High Error Rate

**Symptoms**:
- Error rate > 1%
- 5xx errors in logs

**Investigate**:
```bash
# Check recent errors
aws logs filter-log-events \
  --log-group-name /aws/rodistaa/production/backend \
  --start-time $(date -d '10 minutes ago' +%s)000 \
  --filter-pattern "ERROR"
```

**Solutions**:
1. Check Sentry for stack traces
2. Review recent deployments
3. Check database connectivity
4. Rollback if necessary

---

### Issue 3: Database Connection Exhaustion

**Symptoms**:
- "too many connections" errors
- API requests timing out

**Investigate**:
```sql
-- Check active connections
SELECT count(*), state, wait_event_type
FROM pg_stat_activity
GROUP BY state, wait_event_type;

-- Check long-running queries
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '5 seconds';
```

**Solutions**:
1. Increase connection pool size
2. Kill long-running queries
3. Restart application servers
4. Upgrade database instance

---

### Issue 4: Memory Leaks

**Symptoms**:
- Memory usage steadily increasing
- Tasks being killed by OOM

**Investigate**:
```bash
# Check memory usage
aws ecs describe-tasks \
  --cluster rodistaa-production \
  --tasks $(aws ecs list-tasks --cluster rodistaa-production --service-name rodistaa-backend-prod --query 'taskArns[0]' --output text) \
  --query 'tasks[0].containers[0].memory'
```

**Solutions**:
1. Review recent code changes
2. Check for unreleased resources
3. Restart services
4. Deploy hotfix

---

## Monitoring Schedule

### Every 15 Minutes (Automated)
- [ ] Health check all services
- [ ] Check error rates
- [ ] Check response times
- [ ] Verify database health

### Every Hour
- [ ] Review Grafana dashboards
- [ ] Check Sentry for new errors
- [ ] Review business metrics
- [ ] Check user feedback/support tickets

### Every 4 Hours
- [ ] Review AWS costs
- [ ] Check backup status
- [ ] Review security logs
- [ ] Check certificate expiry

### Daily
- [ ] Review all metrics
- [ ] Analyze trends
- [ ] Check database growth
- [ ] Review capacity planning
- [ ] Update status dashboard

### Weekly
- [ ] Performance optimization review
- [ ] Security audit review
- [ ] Cost optimization review
- [ ] Capacity planning update

---

## Monitoring Commands Cheatsheet

### Application Status
```bash
# Check ECS service status
aws ecs describe-services \
  --cluster rodistaa-production \
  --services rodistaa-backend-prod rodistaa-portal-prod

# Check running tasks
aws ecs list-tasks \
  --cluster rodistaa-production \
  --service-name rodistaa-backend-prod

# Check task health
aws ecs describe-tasks \
  --cluster rodistaa-production \
  --tasks <task-arn>
```

### Database Status
```bash
# Database metrics
aws rds describe-db-clusters \
  --db-cluster-identifier rodistaa-prod

# Recent snapshots
aws rds describe-db-cluster-snapshots \
  --db-cluster-identifier rodistaa-prod \
  --snapshot-type automated \
  --max-records 5
```

### Application Logs
```bash
# Backend errors (last 1 hour)
aws logs filter-log-events \
  --log-group-name /aws/rodistaa/production/backend \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --filter-pattern "ERROR"

# Count errors
aws logs filter-log-events \
  --log-group-name /aws/rodistaa/production/backend \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --filter-pattern "ERROR" \
  | jq '.events | length'
```

### Quick Health Check
```bash
# All-in-one health check
echo "=== Rodistaa Health Check ==="
echo ""
echo "Backend API:"
curl -s https://api.rodistaa.com/health | jq
echo ""
echo "Portal:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://portal.rodistaa.com
echo ""
echo "Database:"
aws rds describe-db-clusters \
  --db-cluster-identifier rodistaa-prod \
  --query 'DBClusters[0].Status' \
  --output text
echo ""
echo "ECS Services:"
aws ecs describe-services \
  --cluster rodistaa-production \
  --services rodistaa-backend-prod \
  --query 'services[0].[serviceName,desiredCount,runningCount,status]' \
  --output table
```

---

## Escalation Path

### Severity Levels

#### P0 - Critical (Complete Outage)
- **Response Time**: Immediate
- **Who**: CTO + DevOps Lead
- **Action**: All hands on deck, rollback if needed

#### P1 - High (Major Feature Down)
- **Response Time**: 30 minutes
- **Who**: DevOps team
- **Action**: Investigate and fix ASAP

#### P2 - Medium (Degraded Performance)
- **Response Time**: 2 hours
- **Who**: On-call engineer
- **Action**: Investigate and plan fix

#### P3 - Low (Minor Issue)
- **Response Time**: Next business day
- **Who**: Regular dev team
- **Action**: Add to backlog

### Contact Information
- **CTO**: [Phone/Email]
- **DevOps Lead**: [Phone/Email]
- **On-Call Engineer**: [Phone/Email]
- **AWS Support**: Premium support line

---

## Status Page

### Update Status Page
After deployment or during incidents:

```bash
# Update status (example using StatusPage.io API)
curl -X POST https://api.statuspage.io/v1/pages/PAGE_ID/incidents \
  -H "Authorization: OAuth API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "incident": {
      "name": "Deployment Complete",
      "status": "resolved",
      "body": "Production deployment v1.0.0 completed successfully. All systems operational.",
      "impact_override": "none"
    }
  }'
```

---

## Post-Deployment Checklist

### Day 1 (First 24 Hours)
- [ ] Monitor continuously
- [ ] Respond to any alerts immediately
- [ ] Check Sentry hourly
- [ ] Review metrics every 4 hours
- [ ] Have rollback plan ready
- [ ] Keep team on standby

### Day 2-7 (First Week)
- [ ] Monitor 3x daily
- [ ] Review all metrics
- [ ] Analyze user feedback
- [ ] Check support tickets
- [ ] Optimize any issues found
- [ ] Document learnings

### Week 2-4 (First Month)
- [ ] Daily monitoring review
- [ ] Weekly performance reports
- [ ] Cost optimization
- [ ] Capacity planning adjustments
- [ ] Security audit
- [ ] Post-mortem if needed

---

## Success Metrics

After 30 days, evaluate:

- [ ] 99.9%+ uptime achieved
- [ ] < 0.5% error rate
- [ ] p95 response time < 500ms
- [ ] No critical incidents
- [ ] Positive user feedback
- [ ] No major rollbacks needed
- [ ] Costs within budget
- [ ] Team satisfied with monitoring

---

**Questions?** Contact DevOps team or refer to runbooks.

