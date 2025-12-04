# Action Required - External Credentials

This document lists external API credentials and services that require manual setup for production use. **Local development uses mocks and does not require these credentials.**

## Required for Production Only

### 1. AWS SNS (SMS Service)
**Purpose**: Login OTP SMS delivery  
**Required For**: Production SMS notifications  
**Local Dev**: Mock service at `http://localhost:5000/sms`  
**Setup**:
- Create AWS account
- Create SNS topic
- Generate IAM access keys with SNS publish permissions
- Add to environment:
  ```
  AWS_ACCESS_KEY_ID=your_key
  AWS_SECRET_ACCESS_KEY=your_secret
  AWS_REGION=us-east-1
  AWS_SNS_TOPIC_ARN=arn:aws:sns:...
  SMS_ENABLED=true
  ```

### 2. Google Maps API
**Purpose**: Route calculation, distance matrix, geocoding  
**Required For**: Production route calculations  
**Local Dev**: Mock service at `http://localhost:5000/maps`  
**Setup**:
- Create Google Cloud project
- Enable Maps JavaScript API, Distance Matrix API, Geocoding API
- Generate API key
- Add to environment:
  ```
  GOOGLE_MAPS_API_KEY=your_api_key
  GOOGLE_MAPS_ENABLED=true
  ```
**Note**: Billing must be enabled. Use API key restrictions in production.

### 3. Firebase Service Account
**Purpose**: Push notifications to mobile apps  
**Required For**: Production push notifications  
**Local Dev**: Firebase emulator or disabled  
**Setup**:
- Create Firebase project
- Generate service account JSON
- Download and store securely
- Add to environment:
  ```
  FIREBASE_SERVICE_ACCOUNT_JSON_PATH=/path/to/firebase-svc.json
  FIREBASE_PROJECT_ID=your-project-id
  FIREBASE_USE_EMULATOR=false
  ```

### 4. IRP eInvoice (Indian Government)
**Purpose**: eInvoice generation and submission  
**Required For**: Production invoice compliance  
**Local Dev**: Mock service at `http://localhost:5000/irp`  
**Setup**:
- Register on IRP portal (https://einvoice.gst.gov.in)
- Generate client ID and secret
- Add to environment:
  ```
  IRP_PROD_CLIENT_ID=your_client_id
  IRP_PROD_CLIENT_SECRET=your_client_secret
  IRP_USE_SANDBOX=false
  ```
**Note**: Requires GST registration and IRP portal access.

### 5. VAHAN Verification APIs
**Purpose**: Vehicle registration verification  
**Required For**: Production truck verification  
**Local Dev**: Mock service at `http://localhost:5000/vahan`  
**Setup**:
- Register with VAHAN provider (Parivahan/Surepass)
- Generate API keys
- Add to environment:
  ```
  VAHAN_PARIVAHAN_API_KEY=your_key (if available)
  VAHAN_SUREPASS_API_KEY=your_key
  VAHAN_BACKUP_API_KEY=your_key
  ```
**Note**: Parivahan requires government API access. Surepass/Backup are commercial providers.

### 6. OpenAI API (Optional)
**Purpose**: Freight cost calculation fallback  
**Required For**: AI-powered cost estimation (optional feature)  
**Local Dev**: Mock or disabled  
**Setup**:
- Create OpenAI account
- Generate API key
- Add to environment:
  ```
  OPENAI_API_KEY=your_key
  OPENAI_ENABLED=true
  ```
**Note**: This is optional. System works without it using rule-based calculations.

### 7. Figma API (Optional)
**Purpose**: Design token synchronization  
**Required For**: Automated design system updates  
**Local Dev**: Not required  
**Setup**:
- Generate Figma personal access token
- Get Figma file key
- Add to environment:
  ```
  FIGMA_FILE_KEY=your_file_key
  FIGMA_TOKEN=your_token
  ```
**Note**: Only needed if using automated token sync from Figma.

### 8. Play Store Keystore (Mobile Apps)
**Purpose**: Android app signing for release builds  
**Required For**: Production Android app releases  
**Local Dev**: Not required  
**Setup**:
- Generate keystore using `keytool`
- Store securely (use CI/CD secrets)
- Add to environment:
  ```
  PLAYSTORE_KEYSTORE_PATH=/path/to/keystore.jks
  PLAYSTORE_KEYSTORE_PASSWORD=your_password
  PLAYSTORE_KEY_ALIAS=your_alias
  PLAYSTORE_KEY_PASSWORD=your_key_password
  ```
**Note**: Only needed for release builds, not local development.

## Security Best Practices

1. **Never commit credentials to git**
   - Use `.env` files (gitignored)
   - Use CI/CD secrets (GitHub Secrets, GitLab CI variables)
   - Use secret management services (AWS Secrets Manager, HashiCorp Vault)

2. **Use least privilege**
   - Grant only required permissions
   - Use API key restrictions (IP, referrer)
   - Rotate keys regularly

3. **Separate environments**
   - Use different keys for dev/staging/production
   - Use sandbox/test keys where available
   - Never use production keys in development

4. **Monitor usage**
   - Set up billing alerts
   - Monitor API usage logs
   - Review access logs regularly

## Local Development

**All services work locally without these credentials** using mock services:
- SMS: Mock at `http://localhost:5000/sms`
- Maps: Mock at `http://localhost:5000/maps`
- VAHAN: Mock at `http://localhost:5000/vahan`
- IRP: Mock at `http://localhost:5000/irp`
- Firebase: Use emulator or disable notifications

To start mocks:
```bash
cd packages/mocks
pnpm run dev
```

## CI/CD Setup

For GitHub Actions, add secrets in repository settings:
1. Go to Settings → Secrets and variables → Actions
2. Add each credential as a secret
3. Reference in workflows using `${{ secrets.SECRET_NAME }}`

Example:
```yaml
env:
  GOOGLE_MAPS_API_KEY: ${{ secrets.GOOGLE_MAPS_API_KEY }}
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
```

## Questions?

If you need help setting up any of these services, contact the DevOps team or refer to:
- `docs/dev-setup.md` - Development setup guide
- `VERIFY_LOCAL.md` - Local verification guide
- Service-specific documentation in `packages/*/README.md`

