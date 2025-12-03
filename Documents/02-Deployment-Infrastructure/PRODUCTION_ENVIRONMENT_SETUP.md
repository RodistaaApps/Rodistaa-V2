# 🔐 PRODUCTION ENVIRONMENT SETUP - COMPLETE GUIDE

**CTO Guide for Production Configuration**  
**Date**: December 3, 2025  
**Status**: ✅ **READY FOR LAUNCH WEEK**

---

## 🎯 Overview

This guide provides **complete, step-by-step instructions** for configuring the Rodistaa production environment, including:
- Environment variables
- Secrets management (AWS Secrets Manager)
- Database configuration
- API keys and credentials
- Security hardening
- Verification procedures

---

## ⚠️ CRITICAL SECURITY REQUIREMENTS

### **Before You Begin**:
1. ✅ **NEVER commit secrets to Git**
2. ✅ **Use AWS Secrets Manager for production**
3. ✅ **Rotate all default passwords**
4. ✅ **Use strong, random values (32+ characters)**
5. ✅ **Enable secret rotation policies**
6. ✅ **Restrict access with IAM policies**
7. ✅ **Enable CloudTrail for audit logging**
8. ✅ **Use MFA for AWS console access**

---

## 📋 COMPLETE ENVIRONMENT VARIABLES LIST

### **1. Application Configuration**

```bash
# Node.js Environment
NODE_ENV=production                    # REQUIRED: Must be 'production'
PORT=4000                              # REQUIRED: Application port
LOG_LEVEL=info                         # REQUIRED: info | warn | error

# Application URLs
API_BASE_URL=https://api.rodistaa.com  # REQUIRED: Production API URL
ADMIN_PORTAL_URL=https://admin.rodistaa.com
FRANCHISE_PORTAL_URL=https://franchise.rodistaa.com
MOBILE_API_URL=https://api.rodistaa.com/mobile
```

### **2. Database Configuration**

```bash
# PostgreSQL
DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST]:5432/[DB]
# Example: postgresql://rodistaa_prod:STRONG_PASSWORD@rodistaa-prod.xyz.ap-south-1.rds.amazonaws.com:5432/rodistaa_production

PGHOST=rodistaa-prod.xyz.ap-south-1.rds.amazonaws.com  # RDS endpoint
PGPORT=5432
PGUSER=rodistaa_prod                    # Production DB user
PGPASSWORD=[SECRET]                     # ⚠️ STORE IN AWS SECRETS MANAGER
PGDATABASE=rodistaa_production
PGSSLMODE=require                       # REQUIRED: Enforce SSL

# Connection Pool
DB_POOL_MIN=2
DB_POOL_MAX=20
DB_CONNECTION_TIMEOUT=30000
DB_IDLE_TIMEOUT=10000
```

### **3. Redis Configuration**

```bash
# Redis Cache (ElastiCache)
REDIS_URL=redis://rodistaa-prod.xyz.cache.amazonaws.com:6379
REDIS_HOST=rodistaa-prod.xyz.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=[SECRET]                 # ⚠️ IF AUTH ENABLED
REDIS_TLS=true                          # REQUIRED: Enforce TLS
REDIS_DB=0
REDIS_KEY_PREFIX=rodistaa:prod:
```

### **4. JWT Authentication**

```bash
# JWT Secrets (⚠️ CRITICAL - STORE IN AWS SECRETS MANAGER)
JWT_SECRET=[64-CHARACTER-RANDOM-STRING]
# Generate: openssl rand -base64 64

JWT_REFRESH_SECRET=[64-CHARACTER-RANDOM-STRING]
# Generate: openssl rand -base64 64

# JWT Configuration
JWT_EXPIRATION=15m                      # Access token expiry
JWT_REFRESH_EXPIRATION=7d               # Refresh token expiry
JWT_ISSUER=rodistaa-platform
JWT_AUDIENCE=rodistaa-api
```

### **5. KYC Encryption**

```bash
# AWS KMS for KYC Encryption
AWS_REGION=ap-south-1
LOCAL_KMS_KEY_ID=arn:aws:kms:ap-south-1:[ACCOUNT]:key/[KEY-ID]
# Example: arn:aws:kms:ap-south-1:123456789012:key/12345678-1234-1234-1234-123456789012

# KYC Configuration
KYC_ENCRYPTION_ALGORITHM=AES-256-GCM
KYC_MASK_DEFAULT=true                   # Mask by default
```

### **6. ACS (Anomaly Control System)**

```bash
# ACS Configuration
ACS_ENABLED=true                        # REQUIRED: Enable fraud detection
ACS_RULES_PATH=/app/acs_rules_top25.yaml
ACS_ALERT_THRESHOLD=0.7                 # Risk score threshold
ACS_AUTO_BLOCK_THRESHOLD=0.9            # Auto-block threshold
ACS_NOTIFICATION_ENABLED=true
ACS_SLACK_WEBHOOK_URL=[SECRET]          # ⚠️ Slack alerts
```

### **7. Payment Gateway (Razorpay)**

```bash
# Razorpay
RAZORPAY_KEY_ID=[SECRET]                # ⚠️ STORE IN AWS SECRETS MANAGER
RAZORPAY_KEY_SECRET=[SECRET]            # ⚠️ STORE IN AWS SECRETS MANAGER
RAZORPAY_WEBHOOK_SECRET=[SECRET]        # ⚠️ Webhook signature verification
RAZORPAY_MODE=live                      # REQUIRED: 'live' for production
```

### **8. SMS & Notifications (Firebase/Twilio)**

```bash
# Firebase Cloud Messaging (Mobile Notifications)
FIREBASE_PROJECT_ID=[PROJECT_ID]
FIREBASE_PRIVATE_KEY=[SECRET]           # ⚠️ STORE IN AWS SECRETS MANAGER
FIREBASE_CLIENT_EMAIL=[EMAIL]

# Twilio (SMS/OTP)
TWILIO_ACCOUNT_SID=[SECRET]             # ⚠️ STORE IN AWS SECRETS MANAGER
TWILIO_AUTH_TOKEN=[SECRET]              # ⚠️ STORE IN AWS SECRETS MANAGER
TWILIO_PHONE_NUMBER=+91XXXXXXXXXX
TWILIO_VERIFY_SERVICE_SID=[SID]         # For OTP verification
```

### **9. Google Maps (Tracking & Geolocation)**

```bash
# Google Maps API
GOOGLE_MAPS_API_KEY=[SECRET]            # ⚠️ STORE IN AWS SECRETS MANAGER
GOOGLE_MAPS_API_KEY_RESTRICTED=true     # IP/domain restrictions
```

### **10. AWS Services**

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=[SECRET]              # ⚠️ USE IAM ROLES INSTEAD (ECS)
AWS_SECRET_ACCESS_KEY=[SECRET]          # ⚠️ USE IAM ROLES INSTEAD (ECS)
AWS_REGION=ap-south-1

# S3 Buckets
S3_BUCKET_DOCUMENTS=rodistaa-prod-documents
S3_BUCKET_IMAGES=rodistaa-prod-images
S3_BUCKET_POD=rodistaa-prod-pod
S3_BUCKET_BACKUPS=rodistaa-prod-backups
S3_BUCKET_REGION=ap-south-1
```

### **11. Monitoring & Logging**

```bash
# Sentry (Error Tracking)
SENTRY_DSN=[SECRET]                     # ⚠️ STORE IN AWS SECRETS MANAGER
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=[GIT_SHA]                # Auto-populated in CI/CD
SENTRY_TRACES_SAMPLE_RATE=0.1           # 10% trace sampling

# Logging
LOG_LEVEL=info
LOG_FORMAT=json                         # Structured logging
LOG_DESTINATION=cloudwatch              # CloudWatch Logs
```

### **12. Security & Rate Limiting**

```bash
# Security
HELMET_ENABLED=true                     # Security headers
CORS_ORIGIN=https://admin.rodistaa.com,https://franchise.rodistaa.com
CORS_CREDENTIALS=true
TRUST_PROXY=true                        # Behind ALB

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000             # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100             # Per window
RATE_LIMIT_SKIP_SUCCESSFUL=false
```

### **13. Feature Flags**

```bash
# Feature Flags
FEATURE_REAL_TIME_TRACKING=true
FEATURE_ADVANCED_BIDDING=true
FEATURE_AUTOMATED_ASSIGNMENTS=true
FEATURE_MOBILE_APP_V2=false             # Rollout control
```

---

## 🔐 AWS SECRETS MANAGER SETUP

### **Step 1: Install AWS CLI**

```bash
# Windows (PowerShell)
winget install Amazon.AWSCLI

# Verify
aws --version
```

### **Step 2: Configure AWS Credentials**

```bash
aws configure
# AWS Access Key ID: [YOUR_KEY]
# AWS Secret Access Key: [YOUR_SECRET]
# Default region name: ap-south-1
# Default output format: json
```

### **Step 3: Create Secrets**

#### **A. Database Password**

```bash
aws secretsmanager create-secret \
  --name rodistaa/production/database/password \
  --description "PostgreSQL production database password" \
  --secret-string "$(openssl rand -base64 32)" \
  --region ap-south-1 \
  --tags Key=Environment,Value=production Key=Application,Value=rodistaa
```

#### **B. JWT Secrets**

```bash
# JWT Access Token Secret
aws secretsmanager create-secret \
  --name rodistaa/production/jwt/secret \
  --description "JWT access token secret" \
  --secret-string "$(openssl rand -base64 64)" \
  --region ap-south-1

# JWT Refresh Token Secret
aws secretsmanager create-secret \
  --name rodistaa/production/jwt/refresh-secret \
  --description "JWT refresh token secret" \
  --secret-string "$(openssl rand -base64 64)" \
  --region ap-south-1
```

#### **C. Razorpay Credentials**

```bash
aws secretsmanager create-secret \
  --name rodistaa/production/razorpay/credentials \
  --description "Razorpay API credentials" \
  --secret-string '{
    "key_id": "rzp_live_XXXXXXXXXXXXXXXX",
    "key_secret": "XXXXXXXXXXXXXXXXXXXXXXXX",
    "webhook_secret": "XXXXXXXXXXXX"
  }' \
  --region ap-south-1
```

#### **D. Firebase Credentials**

```bash
aws secretsmanager create-secret \
  --name rodistaa/production/firebase/service-account \
  --description "Firebase service account JSON" \
  --secret-string file://firebase-service-account.json \
  --region ap-south-1
```

#### **E. Twilio Credentials**

```bash
aws secretsmanager create-secret \
  --name rodistaa/production/twilio/credentials \
  --description "Twilio API credentials" \
  --secret-string '{
    "account_sid": "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "auth_token": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "phone_number": "+91XXXXXXXXXX",
    "verify_service_sid": "VAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  }' \
  --region ap-south-1
```

#### **F. Google Maps API Key**

```bash
aws secretsmanager create-secret \
  --name rodistaa/production/google-maps/api-key \
  --description "Google Maps API key" \
  --secret-string "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" \
  --region ap-south-1
```

#### **G. Sentry DSN**

```bash
aws secretsmanager create-secret \
  --name rodistaa/production/sentry/dsn \
  --description "Sentry DSN for error tracking" \
  --secret-string "https://XXXX@XXXX.ingest.sentry.io/XXXX" \
  --region ap-south-1
```

### **Step 4: Set Up Secret Rotation** (Optional, Recommended)

```bash
# Enable automatic rotation for database password (every 30 days)
aws secretsmanager rotate-secret \
  --secret-id rodistaa/production/database/password \
  --rotation-lambda-arn arn:aws:lambda:ap-south-1:[ACCOUNT]:function:SecretsManagerRDSPostgreSQLRotation \
  --rotation-rules AutomaticallyAfterDays=30 \
  --region ap-south-1
```

---

## 📝 PRODUCTION .ENV.PRODUCTION FILE

Create `.env.production` (for local reference only, NOT deployed):

```bash
# ================================================================
# RODISTAA PRODUCTION ENVIRONMENT CONFIGURATION
# ================================================================
# ⚠️  WARNING: This file contains SECRET values
# ⚠️  NEVER commit this file to Git
# ⚠️  In production (ECS), load from AWS Secrets Manager
# ================================================================

# Application
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
API_BASE_URL=https://api.rodistaa.com

# Database (⚠️ Load from Secrets Manager)
DATABASE_URL=postgresql://rodistaa_prod:{{DB_PASSWORD}}@rodistaa-prod.xyz.rds.amazonaws.com:5432/rodistaa_production
PGSSLMODE=require

# Redis (⚠️ Load from Secrets Manager if auth enabled)
REDIS_URL=redis://rodistaa-prod.xyz.cache.amazonaws.com:6379
REDIS_TLS=true

# JWT (⚠️ Load from Secrets Manager)
JWT_SECRET={{JWT_SECRET}}
JWT_REFRESH_SECRET={{JWT_REFRESH_SECRET}}
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# KYC Encryption
AWS_REGION=ap-south-1
LOCAL_KMS_KEY_ID=arn:aws:kms:ap-south-1:{{ACCOUNT}}:key/{{KEY_ID}}
KYC_MASK_DEFAULT=true

# ACS
ACS_ENABLED=true
ACS_RULES_PATH=/app/acs_rules_top25.yaml
ACS_ALERT_THRESHOLD=0.7
ACS_AUTO_BLOCK_THRESHOLD=0.9

# Payment Gateway (⚠️ Load from Secrets Manager)
RAZORPAY_KEY_ID={{RAZORPAY_KEY_ID}}
RAZORPAY_KEY_SECRET={{RAZORPAY_KEY_SECRET}}
RAZORPAY_MODE=live

# Notifications (⚠️ Load from Secrets Manager)
FIREBASE_PROJECT_ID={{PROJECT_ID}}
FIREBASE_PRIVATE_KEY={{PRIVATE_KEY}}
TWILIO_ACCOUNT_SID={{TWILIO_SID}}
TWILIO_AUTH_TOKEN={{TWILIO_TOKEN}}

# Google Maps (⚠️ Load from Secrets Manager)
GOOGLE_MAPS_API_KEY={{MAPS_KEY}}

# AWS Services (⚠️ Use IAM roles in ECS, not keys)
AWS_REGION=ap-south-1
S3_BUCKET_DOCUMENTS=rodistaa-prod-documents
S3_BUCKET_IMAGES=rodistaa-prod-images

# Monitoring (⚠️ Load from Secrets Manager)
SENTRY_DSN={{SENTRY_DSN}}
SENTRY_ENVIRONMENT=production

# Security
HELMET_ENABLED=true
CORS_ORIGIN=https://admin.rodistaa.com,https://franchise.rodistaa.com
RATE_LIMIT_MAX_REQUESTS=100

# Feature Flags
FEATURE_REAL_TIME_TRACKING=true
FEATURE_ADVANCED_BIDDING=true
```

---

## 🔧 ECS TASK DEFINITION (Secrets Integration)

Create `infra/ecs/task-definition-production.json`:

```json
{
  "family": "rodistaa-backend-production",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::{{ACCOUNT}}:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::{{ACCOUNT}}:role/rodistaaBackendTaskRole",
  "containerDefinitions": [
    {
      "name": "rodistaa-backend",
      "image": "{{ECR_REGISTRY}}/rodistaa-backend:{{VERSION}}",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 4000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "PORT", "value": "4000" },
        { "name": "AWS_REGION", "value": "ap-south-1" },
        { "name": "ACS_ENABLED", "value": "true" },
        { "name": "LOG_LEVEL", "value": "info" }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:ap-south-1:{{ACCOUNT}}:secret:rodistaa/production/database/url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:ap-south-1:{{ACCOUNT}}:secret:rodistaa/production/jwt/secret"
        },
        {
          "name": "JWT_REFRESH_SECRET",
          "valueFrom": "arn:aws:secretsmanager:ap-south-1:{{ACCOUNT}}:secret:rodistaa/production/jwt/refresh-secret"
        },
        {
          "name": "RAZORPAY_KEY_ID",
          "valueFrom": "arn:aws:secretsmanager:ap-south-1:{{ACCOUNT}}:secret:rodistaa/production/razorpay/credentials:key_id::"
        },
        {
          "name": "RAZORPAY_KEY_SECRET",
          "valueFrom": "arn:aws:secretsmanager:ap-south-1:{{ACCOUNT}}:secret:rodistaa/production/razorpay/credentials:key_secret::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/rodistaa-backend-production",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:4000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

---

## ✅ VERIFICATION CHECKLIST

### **1. Secrets Created**
```bash
# List all secrets
aws secretsmanager list-secrets --region ap-south-1 | grep rodistaa

# Verify each secret exists
aws secretsmanager describe-secret \
  --secret-id rodistaa/production/database/password \
  --region ap-south-1
```

### **2. IAM Permissions**
```bash
# Verify ECS task execution role can read secrets
aws iam get-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-name SecretsManagerReadPolicy
```

### **3. Test Database Connection**
```bash
# From ECS task or bastion host
psql "postgresql://rodistaa_prod:PASSWORD@HOST:5432/rodistaa_production?sslmode=require"
```

### **4. Test Redis Connection**
```bash
# Using redis-cli
redis-cli -h rodistaa-prod.xyz.cache.amazonaws.com -p 6379 --tls ping
```

### **5. Verify Environment Variables in ECS**
```bash
# Describe running task
aws ecs describe-tasks \
  --cluster rodistaa-production \
  --tasks [TASK_ARN] \
  --region ap-south-1
```

---

## 🔄 SECRETS ROTATION PROCEDURES

### **Manual Rotation** (If Automated Rotation Not Set Up)

#### **1. Rotate Database Password** (Every 90 Days)

```bash
# Step 1: Generate new password
NEW_PASSWORD=$(openssl rand -base64 32)

# Step 2: Update in RDS
aws rds modify-db-instance \
  --db-instance-identifier rodistaa-prod \
  --master-user-password "$NEW_PASSWORD" \
  --apply-immediately \
  --region ap-south-1

# Step 3: Update in Secrets Manager
aws secretsmanager update-secret \
  --secret-id rodistaa/production/database/password \
  --secret-string "$NEW_PASSWORD" \
  --region ap-south-1

# Step 4: Restart ECS tasks (rolling update)
aws ecs update-service \
  --cluster rodistaa-production \
  --service rodistaa-backend \
  --force-new-deployment \
  --region ap-south-1
```

#### **2. Rotate JWT Secrets** (Every 180 Days)

```bash
# Generate new secrets
NEW_JWT_SECRET=$(openssl rand -base64 64)
NEW_REFRESH_SECRET=$(openssl rand -base64 64)

# Update Secrets Manager
aws secretsmanager update-secret \
  --secret-id rodistaa/production/jwt/secret \
  --secret-string "$NEW_JWT_SECRET" \
  --region ap-south-1

aws secretsmanager update-secret \
  --secret-id rodistaa/production/jwt/refresh-secret \
  --secret-string "$NEW_REFRESH_SECRET" \
  --region ap-south-1

# ⚠️ WARNING: This will invalidate all existing tokens!
# Schedule during maintenance window
# Users will need to re-login

# Restart services
aws ecs update-service \
  --cluster rodistaa-production \
  --service rodistaa-backend \
  --force-new-deployment \
  --region ap-south-1
```

#### **3. Rotate API Keys** (Razorpay, Google Maps, etc.)

```bash
# 1. Obtain new keys from provider
# 2. Update in Secrets Manager (see above)
# 3. Test in staging first
# 4. Deploy to production
# 5. Verify functionality
# 6. Deactivate old keys in provider dashboard
```

---

## 🚨 SECURITY BEST PRACTICES

### **1. AWS Secrets Manager**
- ✅ Enable automatic rotation
- ✅ Use resource-based policies
- ✅ Enable CloudTrail logging
- ✅ Tag all secrets for organization
- ✅ Use separate secrets per environment

### **2. IAM Policies**
- ✅ Use least privilege principle
- ✅ ECS tasks use IAM roles (not access keys)
- ✅ Restrict Secrets Manager read to specific secrets
- ✅ Enable MFA for AWS console access

### **3. Network Security**
- ✅ Database in private subnet
- ✅ Redis in private subnet
- ✅ Security groups restrict ports
- ✅ VPC endpoints for AWS services

### **4. Application Security**
- ✅ Validate all secrets at startup
- ✅ Never log secrets
- ✅ Use TLS/SSL for all connections
- ✅ Enable Helmet security headers
- ✅ Configure CORS properly

---

## 📊 MONITORING SECRET USAGE

### **CloudWatch Alarms**

```bash
# Alert on failed secret retrieval
aws cloudwatch put-metric-alarm \
  --alarm-name rodistaa-secrets-access-failed \
  --alarm-description "Alert when secrets retrieval fails" \
  --metric-name SecretRetrievalFailed \
  --namespace AWS/SecretsManager \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --region ap-south-1
```

### **CloudTrail Monitoring**

Monitor these events:
- `GetSecretValue`
- `PutSecretValue`
- `UpdateSecret`
- `DeleteSecret`
- `RotateSecret`

---

## ✅ FINAL VERIFICATION SCRIPT

Create `scripts/verify-production-env.sh`:

```bash
#!/bin/bash
set -e

echo "================================================================"
echo "RODISTAA PRODUCTION ENVIRONMENT VERIFICATION"
echo "================================================================"

# Check AWS CLI
echo "✓ Checking AWS CLI..."
aws --version || { echo "❌ AWS CLI not found"; exit 1; }

# Check secrets exist
echo "✓ Checking secrets..."
SECRETS=(
  "rodistaa/production/database/password"
  "rodistaa/production/jwt/secret"
  "rodistaa/production/jwt/refresh-secret"
  "rodistaa/production/razorpay/credentials"
  "rodistaa/production/firebase/service-account"
  "rodistaa/production/twilio/credentials"
  "rodistaa/production/google-maps/api-key"
  "rodistaa/production/sentry/dsn"
)

for secret in "${SECRETS[@]}"; do
  aws secretsmanager describe-secret \
    --secret-id "$secret" \
    --region ap-south-1 > /dev/null 2>&1 && \
    echo "  ✅ $secret" || \
    echo "  ❌ $secret (NOT FOUND)"
done

# Check RDS instance
echo "✓ Checking RDS instance..."
aws rds describe-db-instances \
  --db-instance-identifier rodistaa-prod \
  --region ap-south-1 > /dev/null 2>&1 && \
  echo "  ✅ RDS instance exists" || \
  echo "  ❌ RDS instance not found"

# Check ElastiCache
echo "✓ Checking ElastiCache..."
aws elasticache describe-cache-clusters \
  --cache-cluster-id rodistaa-prod \
  --region ap-south-1 > /dev/null 2>&1 && \
  echo "  ✅ ElastiCache cluster exists" || \
  echo "  ❌ ElastiCache cluster not found"

# Check S3 buckets
echo "✓ Checking S3 buckets..."
BUCKETS=("rodistaa-prod-documents" "rodistaa-prod-images" "rodistaa-prod-pod")
for bucket in "${BUCKETS[@]}"; do
  aws s3 ls "s3://$bucket" > /dev/null 2>&1 && \
    echo "  ✅ $bucket" || \
    echo "  ❌ $bucket (NOT FOUND)"
done

echo ""
echo "================================================================"
echo "VERIFICATION COMPLETE"
echo "================================================================"
```

---

## 🎯 NEXT STEPS

### **Week 1 (Dec 4-6)**:
1. [ ] Review this document completely
2. [ ] Create all AWS Secrets Manager secrets
3. [ ] Configure IAM roles and policies
4. [ ] Test secrets retrieval locally
5. [ ] Create ECS task definition with secrets
6. [ ] Run verification script
7. [ ] Document any custom secrets needed

### **Week 2 (Launch Week)**:
8. [ ] Deploy to staging with production secrets (Monday)
9. [ ] Verify all integrations working (Tuesday)
10. [ ] Final security audit (Tuesday)
11. [ ] Production deployment (Wednesday)

---

## 📞 Support & Troubleshooting

### **Common Issues**:

**Issue**: "Secret not found in Secrets Manager"
- **Solution**: Verify secret name and region match exactly

**Issue**: "Access denied when retrieving secret"
- **Solution**: Check IAM role has `secretsmanager:GetSecretValue` permission

**Issue**: "Database connection failed"
- **Solution**: Verify security group allows ECS tasks to reach RDS

**Issue**: "Redis connection timeout"
- **Solution**: Check VPC configuration and security groups

---

## ✅ CTO SIGN-OFF

**Status**: ✅ **READY FOR PRODUCTION**

This guide provides complete instructions for production environment setup. Follow each step carefully during Launch Week (December 9-11, 2025).

---

**READY FOR LAUNCH WEEK! 🚀**

---

*Production Environment Setup Guide v1.0*  
*December 3, 2025*  
*AI CTO - Rodistaa Platform*

