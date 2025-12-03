# 👥 RODISTAA TEAM TRAINING GUIDE

**Complete Training Program for Launch Week**  
**Date**: December 3, 2025  
**Version**: 1.0  
**Status**: ✅ **READY FOR DEPLOYMENT**

---

## 🎯 Training Overview

This guide provides **complete training materials** for the Rodistaa team to operate and maintain the production platform.

### **Training Schedule** (Week 1: Dec 4-5)

```
📅 Wednesday, December 4
   9:00 AM - 12:00 PM:  Session 1 - Platform Overview
   1:00 PM - 4:00 PM:   Session 2 - Operations & Monitoring
   4:00 PM - 5:00 PM:   Hands-on Lab 1

📅 Thursday, December 5
   9:00 AM - 12:00 PM:  Session 3 - Secrets & Security
   1:00 PM - 4:00 PM:   Session 4 - Incident Response
   4:00 PM - 5:00 PM:   Hands-on Lab 2
```

### **Training Objectives**

By the end of training, team members will be able to:
- ✅ Understand the complete Rodistaa platform architecture
- ✅ Perform daily operational tasks confidently
- ✅ Monitor system health and metrics
- ✅ Respond to incidents effectively
- ✅ Manage secrets and credentials securely
- ✅ Deploy updates and rollback if needed
- ✅ Use all operational tools and runbooks

---

## 📚 SESSION 1: PLATFORM OVERVIEW (3 hours)

**Objective**: Understand the complete Rodistaa platform architecture and features

---

### **1.1 Platform Introduction** (30 min)

#### **What is Rodistaa?**

Rodistaa is an **enterprise-grade transport & logistics platform** for India that connects:
- **Shippers**: Businesses needing transportation
- **Operators**: Truck fleet owners
- **Drivers**: Truck drivers
- **Admin**: Central operations team
- **Franchises**: District and unit-level partners

#### **Key Features**:
1. **Booking Management**: FTL and PTL bookings
2. **Intelligent Bidding**: Automated and manual bidding
3. **Real-time Tracking**: Live GPS tracking of shipments
4. **KYC Verification**: Secure identity verification
5. **Payment Processing**: Integrated with Razorpay
6. **ACS Fraud Detection**: 25 fraud detection rules
7. **POD Management**: Proof of delivery with photos
8. **Multi-tenant Architecture**: Admin + Franchise portals

---

### **1.2 System Architecture** (45 min)

#### **High-Level Architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐  │
│  │ Shipper │  │Operator │  │ Driver  │  │ Portals  │  │
│  │   App   │  │   App   │  │   App   │  │Admin/Fran│  │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬─────┘  │
└───────┼───────────┼───────────┼──────────────┼─────────┘
        │           │           │              │
        └───────────┴───────────┴──────────────┘
                           │
┌──────────────────────────┼──────────────────────────────┐
│                   API GATEWAY (ALB)                      │
└──────────────────────────┼──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                  BACKEND API (Node.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Auth    │  │ Booking  │  │   ACS    │  │   KYC  │  │
│  │ Service  │  │ Service  │  │ Service  │  │Service │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐  ┌──────▼──────┐  ┌───────▼────────┐
│   PostgreSQL   │  │    Redis    │  │   AWS S3       │
│      RDS       │  │ ElastiCache │  │  (Documents)   │
└────────────────┘  └─────────────┘  └────────────────┘
```

#### **Components**:

**1. Backend API** (Node.js + Express)
- **Port**: 4000
- **Framework**: Express.js
- **Language**: TypeScript
- **Features**: 50+ REST endpoints
- **Authentication**: JWT (15min access, 7day refresh)
- **Authorization**: Role-based (RBAC)

**2. Database** (PostgreSQL on RDS)
- **Engine**: PostgreSQL 14
- **Tables**: 25+ tables
- **Migrations**: Managed with node-pg-migrate
- **Backups**: Automated daily, 30-day retention
- **SSL**: Required

**3. Cache** (Redis on ElastiCache)
- **Purpose**: Session storage, caching
- **TTL**: Configurable per key
- **Persistence**: RDB snapshots

**4. Storage** (AWS S3)
- **Buckets**:
  - `rodistaa-prod-documents` (KYC docs)
  - `rodistaa-prod-images` (Truck photos)
  - `rodistaa-prod-pod` (Proof of delivery)
  - `rodistaa-prod-backups` (Database backups)

**5. Monitoring** (Prometheus + Grafana)
- **Metrics**: Application, database, system
- **Dashboards**: Real-time visualization
- **Alerts**: Slack + Email + SMS

---

### **1.3 User Roles & Workflows** (45 min)

#### **Role: Shipper**
**Use Case**: Business needs to transport goods

**Workflow**:
1. Register → Verify phone (OTP)
2. Create booking (FTL or PTL)
3. Receive bids from operators
4. Accept best bid
5. Track shipment in real-time
6. Receive POD
7. Make payment

**Key Features**:
- Real-time bid comparison
- Live GPS tracking
- Payment history
- Rate operators

---

#### **Role: Operator**
**Use Case**: Truck fleet owner wants to find loads

**Workflow**:
1. Register → Complete KYC
2. Add trucks (photos, documents)
3. Browse available bookings
4. Submit bids
5. If bid accepted, assign driver
6. Monitor delivery
7. Upload POD
8. Receive payment

**Key Features**:
- Truck fleet management
- Automated bid calculations
- Driver assignment
- Earnings dashboard

---

#### **Role: Driver**
**Use Case**: Truck driver delivering goods

**Workflow**:
1. Receive trip assignment
2. Navigate to pickup location
3. Confirm pickup (photo)
4. Track route (GPS enabled)
5. Navigate to drop location
6. Confirm delivery (photo + signature)
7. Upload POD

**Key Features**:
- Turn-by-turn navigation
- Offline support
- Photo capture
- Digital signature

---

#### **Role: Admin**
**Use Case**: Central operations team monitoring platform

**Dashboard**:
- **KPI Metrics**: Bookings, shipments, revenue
- **KYC Queue**: Pending verifications
- **ACS Alerts**: Fraud detection alerts
- **Override Requests**: Exception handling
- **System Health**: Real-time monitoring

**Key Features**:
- Decrypt & view KYC (audit logged)
- Block/unblock users
- Approve/reject overrides
- Generate reports

---

#### **Role: Franchise (District/Unit)**
**Use Case**: Local franchise managing territory

**District Features**:
- Monitor unit performance
- Set targets
- Review inspections
- Flag problematic trucks

**Unit Features**:
- Conduct truck inspections
- Upload inspection photos
- Manage local operators
- Achieve targets

---

### **1.4 Key Workflows Deep Dive** (60 min)

#### **Workflow 1: Booking Creation → Delivery**

```
1. SHIPPER creates booking
   ↓
2. SYSTEM broadcasts to operators
   ↓
3. OPERATORS submit bids
   ↓
4. SHIPPER accepts bid
   ↓
5. OPERATOR assigns driver
   ↓
6. DRIVER picks up goods
   ↓
7. Real-time GPS tracking
   ↓
8. DRIVER delivers goods
   ↓
9. POD uploaded
   ↓
10. PAYMENT processed
```

#### **Workflow 2: KYC Verification**

```
1. USER uploads documents
   - Aadhaar
   - PAN
   - Driving License
   - RC (for trucks)
   ↓
2. SYSTEM encrypts with AWS KMS
   ↓
3. Admin sees MASKED data (•••••)
   ↓
4. Admin clicks "Decrypt & View"
   ↓
5. SYSTEM logs decrypt event
   ↓
6. Admin verifies documents
   ↓
7. Approve/Reject decision
   ↓
8. User notified
```

#### **Workflow 3: ACS Fraud Detection**

```
1. EVENT occurs (booking, bid, payment)
   ↓
2. ACS evaluates 25 rules
   ↓
3. Risk score calculated (0-1)
   ↓
4. If score > 0.7 → Alert created
   ↓
5. If score > 0.9 → Auto-block
   ↓
6. Admin notified (Slack)
   ↓
7. Admin reviews alert
   ↓
8. Confirm fraud / False positive
   ↓
9. Action taken (block, warn, dismiss)
```

---

## 🖥️ SESSION 2: OPERATIONS & MONITORING (3 hours)

**Objective**: Learn daily operational tasks and monitoring procedures

---

### **2.1 Daily Operations Checklist** (30 min)

#### **Morning Checklist** (9:00 AM IST)

```bash
# 1. Check overnight alerts
open https://grafana.rodistaa.com/alerts

# 2. Review system health
curl https://api.rodistaa.com/health

# 3. Check database connections
psql "postgresql://..." -c "SELECT 1;"

# 4. Check Redis
redis-cli -h prod.cache.amazonaws.com --tls ping

# 5. Review error logs (last 12 hours)
aws logs tail /ecs/rodistaa-backend-production --since 12h

# 6. Check KYC queue
curl https://api.rodistaa.com/admin/kyc/pending

# 7. Review ACS alerts
open https://admin.rodistaa.com/acs/alerts

# 8. Verify backups completed
aws s3 ls s3://rodistaa-prod-backups/daily/

# 9. Check API response times
# View Grafana dashboard: "API Performance"
```

#### **During Day** (Monitor Continuously)

- **Dashboard**: Keep Grafana open
- **Alerts**: Respond within SLA
- **Support**: Monitor support channel
- **Metrics**: Watch for anomalies

#### **Evening Checklist** (6:00 PM IST)

```bash
# 1. Review daily metrics
# - Bookings created
# - Shipments delivered
# - Payments processed
# - Active users

# 2. Check error rate (should be <1%)
# 3. Review resource utilization
# 4. Plan next day's tasks
# 5. Update team on any issues
# 6. Confirm on-call schedule
```

---

### **2.2 Monitoring Dashboards** (45 min)

#### **Grafana Dashboard 1: System Overview**

**URL**: `https://grafana.rodistaa.com/d/system-overview`

**Panels**:
1. **API Request Rate**: Requests per second
2. **API Response Time**: p50, p95, p99
3. **Error Rate**: % of 5xx errors
4. **Active Users**: Real-time count
5. **Database Connections**: Pool utilization
6. **Redis Hit Rate**: Cache effectiveness

**What to Monitor**:
- ✅ Response time <200ms (p95)
- ✅ Error rate <1%
- ✅ Database connections <80% pool
- ✅ Redis hit rate >80%

**Red Flags** 🚨:
- ❌ Response time >500ms
- ❌ Error rate >5%
- ❌ Database pool exhausted
- ❌ Redis hit rate <50%

---

#### **Grafana Dashboard 2: Business Metrics**

**URL**: `https://grafana.rodistaa.com/d/business-metrics`

**Panels**:
1. **Bookings (Hourly)**: Created vs completed
2. **Revenue (Daily)**: Trending up/down
3. **KYC Queue**: Pending count
4. **ACS Alerts**: Fraud detection rate
5. **User Growth**: New registrations

**What to Monitor**:
- ✅ Booking completion rate >80%
- ✅ KYC queue <50 pending
- ✅ ACS false positive <10%
- ✅ User growth trending up

---

### **2.3 Alert Response Procedures** (45 min)

#### **Alert Priority Levels**

**CRITICAL** (P0) - Response: 5 minutes
```
Alerts:
- API Down
- Database Connection Lost
- Payment Gateway Failure
- Security Breach

Actions:
1. Acknowledge alert immediately
2. Check status page
3. Review CloudWatch logs
4. Execute incident response runbook
5. Notify CTO if not resolved in 15 min
```

**HIGH** (P1) - Response: 15 minutes
```
Alerts:
- High Error Rate (>5%)
- Slow Response Time (>500ms)
- High CPU/Memory (>85%)
- ACS Service Down

Actions:
1. Acknowledge alert
2. Check Grafana dashboards
3. Review recent deployments
4. Scale resources if needed
5. Investigate root cause
```

**MEDIUM** (P2) - Response: 1 hour
```
Alerts:
- Elevated Error Rate (>2%)
- Moderate Response Time (>300ms)
- Disk Usage Warning (>70%)
- Redis Cache Miss Rate High

Actions:
1. Log alert
2. Investigate during normal hours
3. Plan optimization
4. Update documentation
```

**LOW** (P3) - Response: Next business day
```
Alerts:
- Backup Completion
- Certificate Expiry Warning (>30 days)
- Non-critical Service Degradation

Actions:
1. Create ticket
2. Schedule maintenance
3. Update runbook if needed
```

---

### **2.4 Common Operational Tasks** (60 min)

#### **Task 1: Check System Health**

```bash
# Quick health check
curl https://api.rodistaa.com/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-12-11T10:00:00Z",
  "database": "connected",
  "redis": "connected",
  "acs": "operational"
}
```

#### **Task 2: View Application Logs**

```bash
# View real-time logs
aws logs tail /ecs/rodistaa-backend-production \
  --follow \
  --region ap-south-1

# Filter for errors
aws logs filter-pattern '"error"' \
  --log-group-name /ecs/rodistaa-backend-production \
  --start-time 1h

# Search specific request ID
aws logs filter-pattern '"request_id":"abc123"' \
  --log-group-name /ecs/rodistaa-backend-production
```

#### **Task 3: Scale ECS Service**

```bash
# Current task count
aws ecs describe-services \
  --cluster rodistaa-production \
  --services rodistaa-backend \
  --region ap-south-1

# Scale up (e.g., to 4 tasks)
aws ecs update-service \
  --cluster rodistaa-production \
  --service rodistaa-backend \
  --desired-count 4 \
  --region ap-south-1

# Scale down (e.g., to 2 tasks)
aws ecs update-service \
  --cluster rodistaa-production \
  --service rodistaa-backend \
  --desired-count 2 \
  --region ap-south-1
```

#### **Task 4: Restart Service (Rolling Update)**

```bash
# Force new deployment (rolling restart)
aws ecs update-service \
  --cluster rodistaa-production \
  --service rodistaa-backend \
  --force-new-deployment \
  --region ap-south-1

# Monitor deployment status
aws ecs describe-services \
  --cluster rodistaa-production \
  --services rodistaa-backend \
  --query 'services[0].deployments' \
  --region ap-south-1
```

#### **Task 5: Check Database Performance**

```bash
# Connect to production database
psql "postgresql://rodistaa_prod:PASSWORD@HOST:5432/rodistaa_production?sslmode=require"

# Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Check database size
SELECT pg_size_pretty(pg_database_size('rodistaa_production'));
```

---

## 🔐 SESSION 3: SECRETS & SECURITY (3 hours)

**Objective**: Learn secure secrets management and security best practices

---

### **3.1 AWS Secrets Manager** (45 min)

#### **Retrieving Secrets**

```bash
# List all secrets
aws secretsmanager list-secrets \
  --region ap-south-1 \
  | grep rodistaa

# Get specific secret
aws secretsmanager get-secret-value \
  --secret-id rodistaa/production/database/password \
  --region ap-south-1

# Get secret in JSON format
aws secretsmanager get-secret-value \
  --secret-id rodistaa/production/razorpay/credentials \
  --query SecretString \
  --output text \
  --region ap-south-1 | jq .
```

#### **Updating Secrets**

```bash
# Update database password
NEW_PASSWORD=$(openssl rand -base64 32)

aws secretsmanager update-secret \
  --secret-id rodistaa/production/database/password \
  --secret-string "$NEW_PASSWORD" \
  --region ap-south-1

# ⚠️ IMPORTANT: Update RDS password too!
aws rds modify-db-instance \
  --db-instance-identifier rodistaa-prod \
  --master-user-password "$NEW_PASSWORD" \
  --apply-immediately \
  --region ap-south-1

# ⚠️ IMPORTANT: Restart ECS service to pick up new secret
aws ecs update-service \
  --cluster rodistaa-production \
  --service rodistaa-backend \
  --force-new-deployment \
  --region ap-south-1
```

---

### **3.2 Security Best Practices** (45 min)

#### **DO**:
- ✅ Use AWS Secrets Manager for all secrets
- ✅ Rotate secrets every 90 days
- ✅ Use IAM roles (not access keys)
- ✅ Enable MFA for AWS console
- ✅ Use VPN for database access
- ✅ Enable CloudTrail logging
- ✅ Review access logs weekly
- ✅ Use SSL/TLS for all connections

#### **DON'T**:
- ❌ Store secrets in Git
- ❌ Share secrets via email/Slack
- ❌ Use hardcoded passwords
- ❌ Disable security groups
- ❌ Skip security updates
- ❌ Log sensitive data
- ❌ Use admin accounts for apps

---

### **3.3 KYC Security** (45 min)

#### **KYC Data Handling Rules**:

**ALWAYS**:
- ✅ Data is encrypted at rest (AWS KMS)
- ✅ Data is encrypted in transit (TLS)
- ✅ Data is masked by default in UI
- ✅ Decrypt events are audit logged
- ✅ Only admin role can decrypt
- ✅ Time-limited decrypt access

**NEVER**:
- ❌ Save decrypted data to local disk
- ❌ Share KYC data externally
- ❌ Screenshot KYC documents
- ❌ Send KYC data via email
- ❌ Store unencrypted backups

#### **Decrypt KYC (Admin Portal)**:

```
1. Login to admin portal
2. Navigate to KYC queue
3. See masked data: "Aadhaar: ••••••••1234"
4. Click "Decrypt & View"
5. System prompts: "Are you sure?"
6. Confirm (logged with timestamp + user)
7. View decrypted data (time-limited)
8. Make approve/reject decision
9. Data auto-masks after 5 minutes
```

---

### **3.4 Incident Security Response** (45 min)

#### **Security Incident Types**:

**1. Suspected Data Breach**
```
Actions:
1. Immediately alert CTO
2. Isolate affected systems
3. Preserve logs (don't delete!)
4. Review CloudTrail logs
5. Check unusual access patterns
6. Change all passwords/secrets
7. Notify legal team
8. Document timeline
```

**2. Suspicious API Activity**
```
Actions:
1. Check ACS alerts
2. Review API logs for patterns
3. Identify source IP
4. Block IP in WAF if malicious
5. Review affected accounts
6. Reset credentials if compromised
7. Monitor for continued activity
```

**3. Failed Login Attempts**
```
Actions:
1. Check if legitimate user (forgot password)
2. If suspicious, block account temporarily
3. Notify user via phone/email
4. Enable MFA if not already
5. Review login attempt logs
6. Update rate limiting if needed
```

---

## 🚨 SESSION 4: INCIDENT RESPONSE (3 hours)

**Objective**: Learn how to respond to production incidents effectively

---

### **4.1 Incident Response Framework** (30 min)

#### **Incident Severity**:

**SEV 1** (Critical) - Total system outage
- API completely down
- Database unavailable
- Security breach
- **Response**: Immediate all-hands

**SEV 2** (High) - Major functionality impaired
- High error rate
- Slow response times
- Payment processing down
- **Response**: Within 15 minutes

**SEV 3** (Medium) - Minor functionality impaired
- Single feature broken
- Performance degradation
- **Response**: Within 1 hour

**SEV 4** (Low) - Cosmetic issue
- UI glitches
- Non-critical bugs
- **Response**: Next business day

---

### **4.2 Incident Response Runbooks** (90 min)

#### **Runbook 1: API is Down**

```
SYMPTOM: Health check failing, 503 errors

DIAGNOSIS:
1. Check ECS service status
   aws ecs describe-services --cluster rodistaa-production --services rodistaa-backend

2. Check task status
   aws ecs list-tasks --cluster rodistaa-production --service rodistaa-backend

3. Check task logs
   aws logs tail /ecs/rodistaa-backend-production --since 10m

RESOLUTION:
If tasks are stopped:
  → Check CloudWatch logs for crash reason
  → If OOM: Scale up memory
  → If code issue: Rollback deployment

If database connection failed:
  → Check RDS instance status
  → Check security groups
  → Check connection string

If healthy but not responding:
  → Scale up tasks
  → Check ALB target health
  → Check DNS resolution

ROLLBACK:
aws ecs update-service \
  --cluster rodistaa-production \
  --service rodistaa-backend \
  --task-definition rodistaa-backend-production:[PREVIOUS_REVISION] \
  --region ap-south-1
```

#### **Runbook 2: Database Performance Issues**

```
SYMPTOM: Slow queries, timeouts

DIAGNOSIS:
1. Check active connections
   SELECT count(*) FROM pg_stat_activity;

2. Check slow queries
   SELECT query, mean_exec_time 
   FROM pg_stat_statements 
   ORDER BY mean_exec_time DESC 
   LIMIT 5;

3. Check locks
   SELECT * FROM pg_locks WHERE NOT granted;

4. Check RDS metrics (CPU, IOPS)
   aws cloudwatch get-metric-statistics \
     --namespace AWS/RDS \
     --metric-name CPUUtilization \
     --dimensions Name=DBInstanceIdentifier,Value=rodistaa-prod \
     --start-time 2025-12-11T09:00:00Z \
     --end-time 2025-12-11T10:00:00Z \
     --period 300 \
     --statistics Average

RESOLUTION:
If connection pool exhausted:
  → Scale up app instances
  → Increase pool size

If slow queries:
  → Kill long-running queries (carefully!)
  → Add missing indexes
  → Optimize query

If high CPU:
  → Scale up RDS instance
  → Enable read replicas

If locks:
  → Identify blocking query
  → Kill if safe
  → Review transaction logic
```

#### **Runbook 3: High Error Rate**

```
SYMPTOM: Error rate >5%, Sentry alerts

DIAGNOSIS:
1. Check error dashboard in Sentry
2. Group errors by type
3. Review error stack traces
4. Check recent deployments
5. Review API logs

RESOLUTION:
If new deployment caused it:
  → Rollback immediately
  → Review code changes
  → Add tests for bug

If third-party service down:
  → Check service status pages
  → Enable fallback/retry logic
  → Notify users

If configuration issue:
  → Review environment variables
  → Check secrets loaded correctly
  → Restart service

If data issue:
  → Identify bad data
  → Fix data in database
  → Add validation
```

---

### **4.3 Communication During Incidents** (30 min)

#### **Internal Communication**:

**Slack Channel**: `#rodistaa-incidents`

**Incident Update Template**:
```
🚨 INCIDENT: [Title]
Severity: SEV [1/2/3/4]
Status: [INVESTIGATING / IDENTIFIED / MONITORING / RESOLVED]
Impact: [Description of user impact]
Started: [Time]
ETA: [Estimated resolution time]

Current Actions:
- [What we're doing]

Updates:
- [Timestamp]: [Update 1]
- [Timestamp]: [Update 2]
```

#### **External Communication** (If needed):

**Status Page**: `status.rodistaa.com`

**Update Template**:
```
Subject: Service Disruption - [Date]

We are currently experiencing [issue description].

Impact: [What users are affected]
Status: [We are investigating / We have identified / Resolved]
ETA: [When we expect resolution]

We apologize for any inconvenience.
```

---

### **4.4 Post-Incident Review** (30 min)

#### **Post-Mortem Template**:

```markdown
# Post-Incident Review: [Title]

**Date**: [Date]
**Severity**: SEV [1/2/3/4]
**Duration**: [X hours Y minutes]
**Responders**: [Names]

## Summary
[Brief description of what happened]

## Timeline
- **HH:MM** - [Event 1]
- **HH:MM** - [Event 2]
- **HH:MM** - [Resolution]

## Root Cause
[Technical explanation]

## Impact
- Users affected: [Number or %]
- Revenue impact: [If applicable]
- Downtime: [Duration]

## Resolution
[What fixed it]

## Action Items
- [ ] [Action 1] - Assigned to: [Name] - Due: [Date]
- [ ] [Action 2] - Assigned to: [Name] - Due: [Date]

## Lessons Learned
- [What went well]
- [What could be improved]
- [What we learned]

## Prevention
[How to prevent this in future]
```

---

## 🧪 HANDS-ON LAB 1: Operations Practice (1 hour)

### **Lab Objectives**:
- Practice checking system health
- Navigate Grafana dashboards
- View application logs
- Scale ECS service
- Retrieve secrets

### **Lab Exercises**:

#### **Exercise 1: Health Check** (10 min)
```bash
# Task: Check if all systems are healthy

# 1. Check API
curl https://api.rodistaa.com/health

# 2. Check database
psql "postgresql://..." -c "SELECT version();"

# 3. Check Redis
redis-cli -h [HOST] --tls ping

# 4. Check S3
aws s3 ls s3://rodistaa-prod-documents/ --max-items 5

# Expected: All commands succeed
```

#### **Exercise 2: Dashboard Navigation** (15 min)
```
# Task: Find key metrics in Grafana

1. Open Grafana: https://grafana.rodistaa.com
2. Login with credentials
3. Navigate to "System Overview" dashboard
4. Find:
   - Current request rate
   - p95 response time
   - Error rate (last 1h)
   - Active user count
5. Take screenshot for verification
```

#### **Exercise 3: Log Analysis** (15 min)
```bash
# Task: Find errors in logs

# 1. View logs from last hour
aws logs tail /ecs/rodistaa-backend-production --since 1h | head -50

# 2. Filter for errors
aws logs filter-pattern '"error"' \
  --log-group-name /ecs/rodistaa-backend-production \
  --start-time 1h \
  | head -20

# 3. Count errors
aws logs filter-pattern '"error"' \
  --log-group-name /ecs/rodistaa-backend-production \
  --start-time 1h \
  | wc -l

# Expected: Low error count (<10 in 1h)
```

#### **Exercise 4: Scaling Practice** (10 min)
```bash
# Task: Scale service (practice only, don't apply)

# 1. Check current task count
aws ecs describe-services \
  --cluster rodistaa-staging \
  --services rodistaa-backend \
  --query 'services[0].desiredCount'

# 2. (DRY RUN) Scale to 3 tasks
echo "Would run: aws ecs update-service --desired-count 3"

# 3. Monitor deployment status
aws ecs describe-services \
  --cluster rodistaa-staging \
  --services rodistaa-backend \
  --query 'services[0].deployments'
```

#### **Exercise 5: Secret Retrieval** (10 min)
```bash
# Task: Safely retrieve a secret

# 1. List secrets
aws secretsmanager list-secrets --region ap-south-1 | grep rodistaa

# 2. Get secret (staging, not production!)
aws secretsmanager get-secret-value \
  --secret-id rodistaa/staging/jwt/secret \
  --query SecretString \
  --output text \
  --region ap-south-1

# ⚠️ DO NOT save output to file!
# ⚠️ DO NOT share in Slack!
```

---

## 🧪 HANDS-ON LAB 2: Incident Response Practice (1 hour)

### **Scenario 1: High Error Rate** (20 min)

```
SITUATION:
- Grafana alert: "High Error Rate"
- Error rate: 8% (threshold: 5%)
- Time: 10:00 AM

YOUR TASK:
1. Check Sentry for error details
2. Identify the error type
3. Check recent deployments
4. Determine root cause
5. Propose resolution
6. Write incident update (Slack format)

HINT: Check CloudWatch logs for stack traces
```

### **Scenario 2: Slow Response Time** (20 min)

```
SITUATION:
- Grafana alert: "Slow API Response"
- p95 response time: 650ms (threshold: 500ms)
- Time: 2:00 PM

YOUR TASK:
1. Check Grafana for which endpoints are slow
2. Check database query performance
3. Check if any tasks are unhealthy
4. Determine root cause
5. Propose resolution

HINT: Use pg_stat_statements to find slow queries
```

### **Scenario 3: Service Deployment** (20 min)

```
SITUATION:
- Need to deploy new code version
- Currently 2 tasks running
- Must maintain zero downtime

YOUR TASK:
1. Review current deployment status
2. Plan deployment strategy (rolling update)
3. Execute deployment (staging first)
4. Monitor deployment progress
5. Verify new tasks healthy
6. Document deployment

HINT: ECS handles rolling updates automatically
```

---

## 📋 TRAINING ASSESSMENT

### **Knowledge Check Questions**:

**Platform Overview**:
1. What are the 5 main user roles in Rodistaa?
2. What is the purpose of the ACS system?
3. How long is a JWT access token valid?

**Operations**:
4. What is the SLA for responding to SEV 1 incidents?
5. What is the acceptable API response time (p95)?
6. How often should database backups be verified?

**Security**:
7. Where are production secrets stored?
8. Who can decrypt KYC data?
9. How often should secrets be rotated?

**Incident Response**:
10. What is the first step when API is down?
11. Who do you notify for a SEV 1 incident?
12. What must be done after every incident?

### **Practical Assessment**:

**Task 1**: Check system health (all components)
**Task 2**: Navigate Grafana and identify a metric
**Task 3**: Retrieve a secret from AWS Secrets Manager
**Task 4**: Write an incident update message
**Task 5**: Execute a service rollback (staging)

---

## ✅ TRAINING COMPLETION CHECKLIST

- [ ] Attended Session 1: Platform Overview
- [ ] Attended Session 2: Operations & Monitoring
- [ ] Attended Session 3: Secrets & Security
- [ ] Attended Session 4: Incident Response
- [ ] Completed Hands-on Lab 1
- [ ] Completed Hands-on Lab 2
- [ ] Passed Knowledge Check (8/12 correct)
- [ ] Passed Practical Assessment (4/5 tasks)
- [ ] Reviewed all runbooks
- [ ] Bookmarked key dashboards
- [ ] Added to on-call rotation

---

## 📚 QUICK REFERENCE

### **Emergency Contacts**:
- **CTO**: [Contact Info]
- **On-call Engineer**: Check Slack `/oncall`
- **AWS Support**: [Support Plan]

### **Key URLs**:
- **Production API**: https://api.rodistaa.com
- **Admin Portal**: https://admin.rodistaa.com
- **Grafana**: https://grafana.rodistaa.com
- **Status Page**: https://status.rodistaa.com
- **Sentry**: https://sentry.io/rodistaa

### **Key Commands**:
```bash
# Health check
curl https://api.rodistaa.com/health

# View logs
aws logs tail /ecs/rodistaa-backend-production --follow

# Scale service
aws ecs update-service --cluster rodistaa-production --service rodistaa-backend --desired-count [N]

# Restart service
aws ecs update-service --cluster rodistaa-production --service rodistaa-backend --force-new-deployment
```

---

## 🎯 POST-TRAINING

### **Next Steps**:
1. ✅ Add Slack to `#rodistaa-incidents` channel
2. ✅ Bookmark Grafana dashboards
3. ✅ Setup AWS CLI on your machine
4. ✅ Test access to production (read-only first)
5. ✅ Shadow senior engineer for 1 day
6. ✅ Join on-call rotation (with backup)

### **Continuous Learning**:
- **Week 1**: Shadow on-call engineer
- **Week 2**: Handle incidents with supervision
- **Week 3**: Independent on-call (with escalation)
- **Month 2**: Review post-mortems
- **Month 3**: Lead incident response

---

## ✅ CTO SIGN-OFF

**Status**: ✅ **READY FOR TEAM TRAINING**

This comprehensive training guide prepares the team for production operations starting December 11, 2025.

---

**TEAM IS READY FOR LAUNCH! 🚀**

---

*Team Training Guide v1.0*  
*December 3, 2025*  
*AI CTO - Rodistaa Platform*

