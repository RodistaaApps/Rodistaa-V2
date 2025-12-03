# 🔐 Production Environment Setup Guide

Complete guide for configuring production environment variables and secrets.

---

## Prerequisites

1. **AWS Account** with:
   - RDS PostgreSQL instance
   - ElastiCache Redis instance
   - S3 buckets for storage
   - IAM user with appropriate permissions
   - SES configured for emails
   - SNS configured for SMS

2. **Third-Party Services**:
   - Razorpay production account
   - Firebase project
   - Google Maps API keys
   - Sentry account
   - SMS gateway (Twilio/MSG91)

3. **Domain & SSL**:
   - `api.rodistaa.com` → Backend API
   - `portal.rodistaa.com` → Admin Portal
   - `app.rodistaa.com` → Mobile app redirects
   - SSL certificates configured

---

## Step-by-Step Configuration

### 1. Generate Secure Secrets

```bash
# JWT Secrets (64-character random strings)
openssl rand -base64 64

# Run twice for JWT_SECRET and JWT_REFRESH_SECRET
# Example outputs:
# JWT_SECRET: vJ8/Xm2Kp9... (64 chars)
# JWT_REFRESH_SECRET: aB3/Nm7Qr4... (64 chars)

# Encryption Key (32-byte hex for AES-256)
openssl rand -hex 32
# Example: 4f8a2b9c3d7e1f6... (64 hex chars)
```

### 2. AWS RDS Setup

```bash
# Create PostgreSQL instance
aws rds create-db-cluster \
  --db-cluster-identifier rodistaa-prod \
  --engine aurora-postgresql \
  --engine-version 14.6 \
  --master-username rodistaa_prod \
  --master-user-password <STRONG-PASSWORD> \
  --database-name rodistaa_production \
  --vpc-security-group-ids sg-xxxxxxxx \
  --db-subnet-group-name rodistaa-subnet-group \
  --backup-retention-period 30 \
  --preferred-backup-window 03:00-04:00 \
  --preferred-maintenance-window sun:04:00-sun:05:00 \
  --enable-cloudwatch-logs-exports '["postgresql"]' \
  --storage-encrypted \
  --kms-key-id arn:aws:kms:ap-south-1:xxxx:key/xxxx

# Get connection endpoint
aws rds describe-db-clusters \
  --db-cluster-identifier rodistaa-prod \
  --query 'DBClusters[0].Endpoint' \
  --output text
```

### 3. AWS ElastiCache (Redis)

```bash
# Create Redis cluster
aws elasticache create-replication-group \
  --replication-group-id rodistaa-prod \
  --replication-group-description "Rodistaa Production Redis" \
  --engine redis \
  --cache-node-type cache.t3.medium \
  --num-cache-clusters 2 \
  --automatic-failover-enabled \
  --at-rest-encryption-enabled \
  --transit-encryption-enabled \
  --auth-token <GENERATE-STRONG-TOKEN> \
  --cache-subnet-group-name rodistaa-subnet-group \
  --security-group-ids sg-xxxxxxxx

# Get connection endpoint
aws elasticache describe-replication-groups \
  --replication-group-id rodistaa-prod \
  --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Address' \
  --output text
```

### 4. AWS S3 Buckets

```bash
# Create S3 buckets
aws s3 mb s3://rodistaa-prod-uploads --region ap-south-1
aws s3 mb s3://rodistaa-prod-kyc-encrypted --region ap-south-1
aws s3 mb s3://rodistaa-prod-pod-documents --region ap-south-1
aws s3 mb s3://rodistaa-prod-backups --region ap-south-1

# Enable versioning and encryption
for bucket in uploads kyc-encrypted pod-documents backups; do
  aws s3api put-bucket-versioning \
    --bucket rodistaa-prod-$bucket \
    --versioning-configuration Status=Enabled
  
  aws s3api put-bucket-encryption \
    --bucket rodistaa-prod-$bucket \
    --server-side-encryption-configuration '{
      "Rules": [{
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }]
    }'
done

# Set lifecycle policies
aws s3api put-bucket-lifecycle-configuration \
  --bucket rodistaa-prod-backups \
  --lifecycle-configuration file://backup-lifecycle.json
```

### 5. IAM User for Application

```bash
# Create IAM user
aws iam create-user --user-name rodistaa-prod-app

# Attach policies
aws iam attach-user-policy \
  --user-name rodistaa-prod-app \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-user-policy \
  --user-name rodistaa-prod-app \
  --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess

aws iam attach-user-policy \
  --user-name rodistaa-prod-app \
  --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess

# Create access key
aws iam create-access-key --user-name rodistaa-prod-app
# Save the AccessKeyId and SecretAccessKey
```

### 6. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: `rodistaa-prod`
3. Enable Firebase Cloud Messaging (FCM)
4. Generate service account:
   - Project Settings → Service Accounts
   - Generate new private key
   - Download JSON file
5. Base64 encode the private key:

```bash
cat firebase-service-account.json | base64 -w 0
# Or on macOS:
cat firebase-service-account.json | base64
```

### 7. Razorpay Production Keys

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Switch to "Live Mode"
3. Settings → API Keys → Generate Live API Keys
4. Copy `Key Id` and `Key Secret`
5. Configure webhook:
   - Settings → Webhooks
   - Add URL: `https://api.rodistaa.com/v1/webhooks/razorpay`
   - Select events: payment.captured, payment.failed, refund.created
   - Copy webhook secret

### 8. Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project: `rodistaa-prod`
3. Enable APIs:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
   - Distance Matrix API
4. Create API keys with restrictions:
   - Server key (for backend): IP restriction
   - Mobile keys: Android/iOS app restriction

### 9. Sentry Error Tracking

1. Go to [Sentry](https://sentry.io/)
2. Create organization: `Rodistaa`
3. Create projects:
   - `rodistaa-backend-prod`
   - `rodistaa-portal-prod`
   - `rodistaa-mobile-prod`
4. Copy DSN from each project

### 10. SMS Gateway (Twilio)

1. Go to [Twilio Console](https://console.twilio.com/)
2. Get production credentials:
   - Account SID
   - Auth Token
3. Buy phone number with SMS capability in India
4. Configure sender ID

---

## Environment Variable Configuration

### Backend (`packages/backend/.env.production`)

Copy from `config/production.env.template` and fill in:

```bash
cp config/production.env.template packages/backend/.env.production
nano packages/backend/.env.production
```

**Critical variables to set**:
- `JWT_SECRET` and `JWT_REFRESH_SECRET` (generated above)
- `PGHOST`, `PGPASSWORD` (from AWS RDS)
- `REDIS_URL`, `REDIS_PASSWORD` (from ElastiCache)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (from IAM user)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (from Razorpay)
- `ENCRYPTION_KEY` (generated above)
- `SENTRY_DSN` (from Sentry)

### Admin Portal (`packages/portal/.env.production`)

```bash
NEXT_PUBLIC_API_URL=https://api.rodistaa.com/v1
NEXT_PUBLIC_SENTRY_DSN=<SENTRY-DSN>
NEXT_PUBLIC_ENV=production
```

### Mobile Apps

Update `packages/mobile/shared/src/config/environment.ts`:

```typescript
export const PRODUCTION_CONFIG = {
  apiUrl: 'https://api.rodistaa.com/v1',
  sentryDsn: '<SENTRY-DSN>',
  googleMapsKey: '<GOOGLE-MAPS-API-KEY>',
  razorpayKey: 'rzp_live_xxxxxxxxxxxxx',
  environment: 'production',
};
```

---

## AWS Secrets Manager (Recommended)

Instead of environment files, use AWS Secrets Manager:

```bash
# Store secrets
aws secretsmanager create-secret \
  --name rodistaa/production/backend \
  --description "Rodistaa Production Backend Secrets" \
  --secret-string file://production-secrets.json

# Retrieve in application
const secrets = await secretsManager.getSecretValue({
  SecretId: 'rodistaa/production/backend'
}).promise();

const config = JSON.parse(secrets.SecretString);
```

**Benefits**:
- Automatic rotation
- Audit logging
- Version control
- No secrets in code/containers

---

## Verification Checklist

After configuration, verify:

```bash
# 1. Database connection
psql "postgresql://rodistaa_prod:PASSWORD@HOST:5432/rodistaa_production?sslmode=require"

# 2. Redis connection
redis-cli -h HOST -p 6379 --tls -a AUTH_TOKEN ping

# 3. S3 access
aws s3 ls s3://rodistaa-prod-uploads

# 4. Environment variables loaded
node -e "require('dotenv').config({path: '.env.production'}); console.log(process.env.JWT_SECRET)"

# 5. Run health check script
pnpm health-check
```

---

## Security Best Practices

1. **Never commit secrets**:
   ```bash
   # Add to .gitignore
   .env.production
   .env.local
   **/production.env
   config/production.env
   ```

2. **Rotate secrets regularly**:
   - JWT secrets: Every 90 days
   - Database passwords: Every 60 days
   - API keys: Every 180 days

3. **Use AWS Secrets Manager** for production

4. **Enable MFA** on all service accounts

5. **Restrict IAM permissions** to minimum required

6. **Monitor access logs** for unusual activity

7. **Set up alerting** for failed authentication attempts

---

## Troubleshooting

### Database Connection Issues
```bash
# Test from backend container
nc -zv $PGHOST $PGPORT

# Check security group rules
aws ec2 describe-security-groups --group-ids sg-xxxxxxxx
```

### Redis Connection Issues
```bash
# Test TLS connection
openssl s_client -connect $REDIS_HOST:6379 -tls1_2
```

### Environment Not Loading
```bash
# Debug dotenv
node -e "console.log(require('dotenv').config({path: '.env.production', debug: true}))"
```

---

## Next Steps

After configuration:

1. ✅ Run deployment checklist: `pnpm deployment-check`
2. ✅ Test in staging environment first
3. ✅ Run database migrations
4. ✅ Deploy to production
5. ✅ Monitor logs and metrics

---

**Questions?** Contact DevOps team or refer to AWS documentation.

