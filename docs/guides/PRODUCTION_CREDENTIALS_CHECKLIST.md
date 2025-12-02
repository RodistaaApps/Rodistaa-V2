# 🔐 **PRODUCTION CREDENTIALS CHECKLIST**

**Before deploying to production, you MUST configure all these credentials.**

**Estimated Time**: 2-3 hours  
**Priority**: 🔴 **CRITICAL** - Production will not work without these

---

## 📋 **CHECKLIST OVERVIEW**

| Service             | Required?    | Estimated Cost   | Setup Time |
| ------------------- | ------------ | ---------------- | ---------- |
| AWS Account         | ✅ Yes       | $50-500/month    | 30 min     |
| PostgreSQL (RDS)    | ✅ Yes       | $50-200/month    | 15 min     |
| Redis (ElastiCache) | ✅ Yes       | $30-100/month    | 15 min     |
| Razorpay            | ✅ Yes       | Transaction fees | 20 min     |
| Firebase            | ✅ Yes       | Free tier OK     | 15 min     |
| Google Maps API     | ✅ Yes       | $200 free credit | 10 min     |
| Vahan API           | ⚠️ Optional  | Pay per query    | 30 min     |
| SendGrid/Twilio     | ✅ Yes (OTP) | $10-50/month     | 15 min     |
| S3 Buckets          | ✅ Yes       | $5-20/month      | 10 min     |
| KMS Keys            | ✅ Yes       | $1/month         | 5 min      |

**Total Estimated Cost**: $150-500/month

---

## 1️⃣ **AWS ACCOUNT & IAM**

### **Create AWS Account**:

1. Visit: https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Enter email, password, account name
4. Add payment method (credit card required)
5. Choose "Basic Support" (free)

### **Create IAM User for CI/CD**:

```bash
# In AWS Console → IAM → Users → Add User
Name: rodistaa-github-actions
Access type: Programmatic access

# Attach policies:
- AmazonEC2ContainerRegistryFullAccess
- AmazonEKSFullAccess
- AmazonRDSFullAccess
- AmazonS3FullAccess
- CloudWatchFullAccess
```

### **Save Credentials**:

- **AWS_ACCESS_KEY_ID**: `AKIA...`
- **AWS_SECRET_ACCESS_KEY**: `wJalr...`
- **AWS_REGION**: `ap-south-1` (Mumbai) or your preferred region

### **Store in GitHub Secrets**:

1. Go to: GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add:
   - Name: `AWS_ACCESS_KEY_ID`, Value: (from above)
   - Name: `AWS_SECRET_ACCESS_KEY`, Value: (from above)

---

## 2️⃣ **RAZORPAY (PAYMENTS)**

### **Create Razorpay Account**:

1. Visit: https://razorpay.com/
2. Click "Sign Up"
3. Complete KYC verification (requires business docs)
4. Wait for account approval (1-2 days)

### **Get API Keys**:

1. Login to dashboard
2. Go to: Settings → API Keys
3. Generate Test Keys (for staging)
4. Generate Live Keys (for production)

### **Credentials**:

- **RAZORPAY_KEY_ID**: `rzp_test_...` or `rzp_live_...`
- **RAZORPAY_KEY_SECRET**: `abcd1234...`
- **RAZORPAY_WEBHOOK_SECRET**: (from Webhooks section)

### **Configure Webhook**:

```
Webhook URL: https://api.rodistaa.com/api/payments/razorpay-webhook
Events to subscribe:
- payment.authorized
- payment.captured
- payment.failed
- refund.created
```

### **Store in `.env.production`**:

```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

---

## 3️⃣ **FIREBASE (AUTH & PUSH NOTIFICATIONS)**

### **Create Firebase Project**:

1. Visit: https://console.firebase.google.com/
2. Click "Add project"
3. Project name: `rodistaa-prod`
4. Enable Google Analytics (optional)
5. Click "Create project"

### **Add Android App**:

1. In project dashboard, click Android icon
2. Package name: `com.rodistaa.shipper`
3. Download `google-services.json`
4. Place in: `packages/mobile/shipper/android/app/`
5. Repeat for operator and driver apps

### **Add iOS App**:

1. In project dashboard, click iOS icon
2. Bundle ID: `com.rodistaa.shipper`
3. Download `GoogleService-Info.plist`
4. Place in: `packages/mobile/shipper/ios/`
5. Repeat for operator and driver apps

### **Enable Authentication**:

1. Go to: Authentication → Sign-in method
2. Enable: Phone

### **Get Service Account Key**:

1. Go to: Project settings → Service accounts
2. Click "Generate new private key"
3. Save as `firebase-service-account.json`

### **Credentials**:

- **FIREBASE_PROJECT_ID**: `rodistaa-prod`
- **FIREBASE_SERVICE_ACCOUNT**: (entire JSON content)

### **Store in GitHub Secrets**:

```bash
# Encode JSON as base64
cat firebase-service-account.json | base64 > firebase-base64.txt

# Add to GitHub Secrets:
# Name: FIREBASE_SERVICE_ACCOUNT_BASE64
# Value: (content of firebase-base64.txt)
```

### **Store in `.env.production`**:

```env
FIREBASE_PROJECT_ID=rodistaa-prod
FIREBASE_SERVICE_ACCOUNT=/path/to/firebase-service-account.json
```

---

## 4️⃣ **GOOGLE MAPS API**

### **Enable APIs**:

1. Visit: https://console.cloud.google.com/
2. Create/select project: `rodistaa-prod`
3. Go to: APIs & Services → Library
4. Enable:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Distance Matrix API
   - Geocoding API

### **Create API Key**:

1. Go to: APIs & Services → Credentials
2. Click "Create credentials" → API key
3. Name: `Rodistaa Maps API`
4. Restrict key:
   - Application restrictions: HTTP referrers
   - Website restrictions:
     - `https://rodistaa.com/*`
     - `https://api.rodistaa.com/*`
     - `https://staging-api.rodistaa.com/*`

### **Credentials**:

- **GOOGLE_MAPS_API_KEY**: `AIzaSyD...`

### **Store in `.env.production`**:

```env
GOOGLE_MAPS_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 5️⃣ **VAHAN API (VEHICLE VERIFICATION)**

### **Register for Vahan API**:

1. Visit: https://vahan.parivahan.gov.in/
2. Register for API access
3. Submit application (requires business docs)
4. Wait for approval (3-5 days)

### **Get API Key**:

- Once approved, you'll receive API key via email

### **Credentials**:

- **VAHAN_API_KEY**: `vahan_...`
- **VAHAN_API_URL**: `https://vahan.parivahan.gov.in/api/v1`

### **Store in `.env.production`**:

```env
VAHAN_API_KEY=vahan_xxxxxxxxxxxxxxxx
VAHAN_API_URL=https://vahan.parivahan.gov.in/api/v1
```

**Note**: If Vahan API is not available, set `VAHAN_MOCK=true` to use mock verification.

---

## 6️⃣ **TWILIO (SMS/OTP)**

### **Create Twilio Account**:

1. Visit: https://www.twilio.com/
2. Sign up for free trial
3. Verify phone number
4. Upgrade to paid account (required for production)

### **Get Credentials**:

1. Go to: Console → Settings → General
2. Note down:
   - Account SID
   - Auth Token

### **Get Phone Number**:

1. Go to: Phone Numbers → Buy a Number
2. Select India (+91) number with SMS capability
3. Purchase number

### **Credentials**:

- **TWILIO_ACCOUNT_SID**: `ACxxxx...`
- **TWILIO_AUTH_TOKEN**: `xxxxx...`
- **TWILIO_PHONE_NUMBER**: `+91XXXXXXXXXX`

### **Store in `.env.production`**:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+91XXXXXXXXXX
```

---

## 7️⃣ **DATABASE (AMAZON RDS)**

### **Create RDS PostgreSQL Instance**:

**Using Terraform** (automated - recommended):

```bash
cd infra/terraform
terraform init
terraform plan -var-file=environments/production/terraform.tfvars
terraform apply -var-file=environments/production/terraform.tfvars
```

**Manual Setup** (via AWS Console):

1. Go to: RDS → Create database
2. Choose:
   - Engine: PostgreSQL 15
   - Template: Production
   - DB instance class: db.t3.medium
   - Storage: 100 GB GP3
   - Multi-AZ: Yes (for production)
   - Master username: `rodistaa_admin`
   - Master password: (generate strong password)
   - VPC: Use default or create new
   - Public access: No
   - Database name: `rodistaa_prod`

3. Wait for creation (~15 minutes)

### **Get Connection String**:

```
Endpoint: rodistaa-prod.xxxxxx.ap-south-1.rds.amazonaws.com
Port: 5432
```

### **Credentials**:

```env
DATABASE_URL=postgresql://rodistaa_admin:PASSWORD@rodistaa-prod.xxxxxx.ap-south-1.rds.amazonaws.com:5432/rodistaa_prod
DATABASE_HOST=rodistaa-prod.xxxxxx.ap-south-1.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_NAME=rodistaa_prod
DATABASE_USER=rodistaa_admin
DATABASE_PASSWORD=<strong-password>
```

### **Store in GitHub Secrets**:

- Name: `PRODUCTION_DATABASE_URL`
- Value: (full connection string)

---

## 8️⃣ **REDIS (AMAZON ELASTICACHE)**

### **Create ElastiCache Redis Cluster**:

**Using Terraform** (automated - recommended):

```bash
# Already included in terraform apply above
```

**Manual Setup**:

1. Go to: ElastiCache → Redis → Create
2. Choose:
   - Cluster mode: Disabled
   - Node type: cache.t3.micro
   - Number of replicas: 1 (production)
   - Subnet group: Same as RDS
   - Security group: Allow 6379 from backend

3. Wait for creation (~10 minutes)

### **Get Connection String**:

```
Primary endpoint: rodistaa-prod.xxxxxx.cache.amazonaws.com:6379
```

### **Credentials**:

```env
REDIS_URL=redis://rodistaa-prod.xxxxxx.cache.amazonaws.com:6379
REDIS_HOST=rodistaa-prod.xxxxxx.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=<if-auth-enabled>
```

---

## 9️⃣ **S3 BUCKETS**

### **Create S3 Buckets**:

**Using Terraform** (automated - recommended):

```bash
# Already included in terraform apply
```

**Manual Setup**:

1. Go to: S3 → Create bucket

**Create 3 buckets**:

1. `rodistaa-prod-uploads` - User uploads (PODs, KYC docs)
2. `rodistaa-prod-backups` - Database backups
3. `rodistaa-prod-logs` - Application logs

**Configure bucket policies**:

- uploads: Private, presigned URLs only
- backups: Private, server-side encryption
- logs: Private, lifecycle policy (delete after 90 days)

### **Credentials**:

```env
S3_BUCKET_UPLOADS=rodistaa-prod-uploads
S3_BUCKET_BACKUPS=rodistaa-prod-backups
S3_BUCKET_LOGS=rodistaa-prod-logs
S3_REGION=ap-south-1
```

---

## 🔟 **KMS ENCRYPTION KEYS**

### **Create KMS Keys**:

**Using Terraform** (automated - recommended):

```bash
# Already included in terraform apply
```

**Manual Setup**:

1. Go to: KMS → Create key
2. Key type: Symmetric
3. Key usage: Encrypt and decrypt
4. Alias: `rodistaa-prod-kms`
5. Define key administrators: (your IAM user)
6. Define key users: (backend IAM role)

### **Credentials**:

```env
KMS_KEY_ID=arn:aws:kms:ap-south-1:xxxxx:key/xxxxx-xxxxx-xxxxx
KMS_KEY_ALIAS=alias/rodistaa-prod-kms
```

---

## 1️⃣1️⃣ **JWT SECRET**

### **Generate Strong JWT Secret**:

```bash
# Generate 64-character random string
openssl rand -base64 48
```

### **Credentials**:

```env
JWT_SECRET=<64-character-random-string>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

**IMPORTANT**: This secret must be:

- Minimum 32 characters
- Randomly generated
- Never committed to Git
- Rotated every 90 days

---

## 1️⃣2️⃣ **ENCRYPTION KEYS (KYC)**

### **Generate AES-256 Encryption Key**:

```bash
# Generate 32-byte key (256 bits)
openssl rand -hex 32
```

### **Credentials**:

```env
ENCRYPTION_KEY=<64-character-hex-string>
ENCRYPTION_ALGORITHM=aes-256-gcm
```

**IMPORTANT**: This key is used for KYC document encryption. Loss of this key means permanent data loss!

**Backup procedure**:

1. Store in AWS Secrets Manager
2. Store in password manager (1Password, LastPass)
3. Print and store in physical safe
4. Never commit to Git

---

## ✅ **COMPLETE `.env.production` FILE**

Once you have all credentials, create `.env.production`:

```env
# Node Environment
NODE_ENV=production

# Server
PORT=4000
HOST=0.0.0.0
PORTAL_PORT=3001

# Database
DATABASE_URL=postgresql://rodistaa_admin:PASSWORD@rodistaa-prod.xxxxxx.rds.amazonaws.com:5432/rodistaa_prod
DATABASE_HOST=rodistaa-prod.xxxxxx.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_NAME=rodistaa_prod
DATABASE_USER=rodistaa_admin
DATABASE_PASSWORD=<RDS-PASSWORD>
DATABASE_SSL=true
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://rodistaa-prod.xxxxxx.cache.amazonaws.com:6379
REDIS_HOST=rodistaa-prod.xxxxxx.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=<REDIS-PASSWORD>

# JWT
JWT_SECRET=<64-char-random-string>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Encryption
ENCRYPTION_KEY=<64-char-hex-string>
ENCRYPTION_ALGORITHM=aes-256-gcm

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# Firebase
FIREBASE_PROJECT_ID=rodistaa-prod
FIREBASE_SERVICE_ACCOUNT=/app/secrets/firebase-service-account.json

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Vahan API
VAHAN_API_KEY=vahan_xxxxxxxxxxxxxxxx
VAHAN_API_URL=https://vahan.parivahan.gov.in/api/v1

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+91XXXXXXXXXX

# AWS S3
S3_BUCKET_UPLOADS=rodistaa-prod-uploads
S3_BUCKET_BACKUPS=rodistaa-prod-backups
S3_BUCKET_LOGS=rodistaa-prod-logs
S3_REGION=ap-south-1

# KMS
KMS_KEY_ID=arn:aws:kms:ap-south-1:xxxxx:key/xxxxx
KMS_KEY_ALIAS=alias/rodistaa-prod-kms

# CORS
CORS_ORIGIN=https://rodistaa.com,https://app.rodistaa.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
LOG_LEVEL=info

# Feature Flags
USE_MOCK_SERVICES=false
RAZORPAY_MOCK=false
FIREBASE_MOCK=false
VAHAN_MOCK=false
```

---

## 🔐 **SECURITY BEST PRACTICES**

### **DO**:

- ✅ Use AWS Secrets Manager or Parameter Store for production secrets
- ✅ Rotate credentials every 90 days
- ✅ Use different credentials for staging and production
- ✅ Enable MFA on all cloud accounts
- ✅ Use IAM roles instead of access keys where possible
- ✅ Encrypt all secrets at rest
- ✅ Use environment-specific encryption keys
- ✅ Backup encryption keys in multiple secure locations

### **DON'T**:

- ❌ Never commit secrets to Git
- ❌ Never share credentials via email/Slack
- ❌ Never use the same credentials for dev and prod
- ❌ Never store secrets in plain text
- ❌ Never use default/weak passwords
- ❌ Never give developers direct production access

---

## 📊 **VERIFICATION CHECKLIST**

Before deploying, verify you have:

- [ ] AWS account with IAM user created
- [ ] RDS PostgreSQL instance running
- [ ] ElastiCache Redis instance running
- [ ] S3 buckets created with proper policies
- [ ] KMS encryption keys created
- [ ] Razorpay account approved and API keys obtained
- [ ] Firebase project created with service account key
- [ ] Google Maps API enabled with valid API key
- [ ] Twilio account upgraded with phone number
- [ ] Vahan API key obtained (or mock enabled)
- [ ] JWT secret generated (64 chars minimum)
- [ ] Encryption key generated (64 chars hex)
- [ ] All secrets stored in GitHub Secrets
- [ ] `.env.production` file created (DO NOT COMMIT)
- [ ] Credentials backed up securely

---

## 🚀 **NEXT STEPS**

Once all credentials are configured:

1. **Test in Staging**:

   ```bash
   # Deploy to staging first
   git push origin develop
   # Verify all services work
   ```

2. **Run Production Deployment**:

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **Verify Production**:
   - Check health endpoint
   - Test OTP sending
   - Test payment flow
   - Test file uploads
   - Monitor logs

---

## 🆘 **GETTING HELP**

If you encounter credential-related issues:

1. Check AWS CloudWatch logs
2. Verify secrets are in correct format
3. Check IAM permissions
4. Verify network connectivity (VPC, security groups)
5. Check service quotas and limits

**Next Guide**: `STAGING_DEPLOYMENT_GUIDE.md`
