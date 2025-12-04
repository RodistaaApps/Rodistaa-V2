# Action Required - External Services & Credentials

This document lists external services and credentials needed for full production deployment of the Rodistaa platform.

---

## 🔐 SHIPPERS FEATURE - DOCUMENT STORAGE

### Service: AWS S3 / MinIO

**Purpose**: Store shipper documents (KYC, business proof, etc.)

**Required Credentials**:
- AWS Access Key ID
- AWS Secret Access Key
- S3 Bucket Name
- AWS Region

**Environment Variables**:
```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=rodistaa-documents
AWS_REGION=ap-south-1
```

**Current Status**: ⚠️ Using mock URLs  
**Impact**: Document viewing will not work until configured  
**Priority**: High

---

## 📧 NOTIFICATIONS - SMS & EMAIL

### Service: Twilio (SMS) / AWS SNS

**Purpose**: Send SMS notifications to shippers

**Required Credentials**:
- Twilio Account SID
- Twilio Auth Token
- Twilio Phone Number

**Environment Variables**:
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Current Status**: ⚠️ Using mock service  
**Impact**: Notifications will not actually send  
**Priority**: Medium

### Service: SendGrid / AWS SES (Email)

**Purpose**: Send email notifications

**Required Credentials**:
- SendGrid API Key or AWS SES credentials

**Environment Variables**:
```bash
SENDGRID_API_KEY=your_api_key
# OR
AWS_SES_REGION=ap-south-1
```

**Current Status**: ⚠️ Using mock service  
**Impact**: Email notifications will not send  
**Priority**: Medium

---

## 🗺️ MAPS & GEOCODING

### Service: Google Maps API / OpenStreetMap

**Purpose**: Display shipper locations, routes, geocoding

**Required Credentials**:
- Google Maps API Key (if using Google Maps)
- OR OpenStreetMap setup (free, no key required)

**Environment Variables**:
```bash
GOOGLE_MAPS_API_KEY=your_api_key
# OR
MAP_PROVIDER=osm  # Use OpenStreetMap (default)
```

**Current Status**: ✅ Using OpenStreetMap (no credentials needed)  
**Impact**: None (OSM works out of the box)  
**Priority**: Low (optional upgrade to Google Maps)

---

## 💳 PAYMENT GATEWAY (FOR FUTURE)

### Service: Razorpay / Stripe

**Purpose**: Process ledger top-ups, payments

**Required Credentials**:
- Razorpay API Key
- Razorpay API Secret

**Environment Variables**:
```bash
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

**Current Status**: ⚠️ Mock payment gateway  
**Impact**: No real payments processed  
**Priority**: High (when going live with payments)

---

## 🔒 DATABASE ENCRYPTION

### Service: AWS KMS / Vault

**Purpose**: Encrypt sensitive PII (mobile numbers, Aadhaar)

**Required**:
- Encryption key
- Key management service

**Environment Variables**:
```bash
ENCRYPTION_KEY=your_32_byte_key
# OR
AWS_KMS_KEY_ID=your_kms_key_id
```

**Current Status**: ⚠️ Not implemented  
**Impact**: PII stored in plaintext (development only)  
**Priority**: Critical (before production)

---

## 📊 MONITORING & LOGGING

### Service: DataDog / CloudWatch

**Purpose**: Monitor API performance, errors, usage

**Required Credentials**:
- DataDog API Key
- OR AWS CloudWatch access

**Environment Variables**:
```bash
DATADOG_API_KEY=your_api_key
# OR use AWS CloudWatch (already configured if on AWS)
```

**Current Status**: ⚠️ Console logging only  
**Impact**: No production monitoring  
**Priority**: High (for production)

---

## 🎬 NEXT STEPS

### Immediate (Before Production):
1. ✅ Configure AWS S3 for document storage
2. ✅ Set up database encryption for PII
3. ✅ Configure email service (SendGrid/SES)

### Important (Within 1 Week):
4. ✅ Set up SMS service (Twilio)
5. ✅ Configure monitoring (DataDog/CloudWatch)
6. ✅ Set up payment gateway (Razorpay)

### Optional (Future Enhancement):
7. Switch to Google Maps API (better routing)
8. Add real-time notifications (Firebase)
9. Set up CDN for document delivery

---

## 📝 NOTES

- All external services are currently mocked for development
- The application will work without these services but with limited functionality
- Before deploying to production, configure at minimum: S3, encryption, and monitoring
- Use `.env.example` as a template for environment variables

---

**Last Updated**: December 4, 2025  
**Status**: Development Environment (Mocked Services)  
**Action Owner**: DevOps / Infrastructure Team
