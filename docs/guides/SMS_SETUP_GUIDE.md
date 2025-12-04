# SMS Integration Setup Guide
## Login OTP via AWS SNS

**Status**: ✅ **Fully Implemented**

Rodistaa uses AWS SNS (Simple Notification Service) to send login OTP via SMS. All other notifications (shipment completion, etc.) use in-app notifications.

---

## 📋 Overview

- **Service**: AWS SNS (Simple Notification Service)
- **Use Case**: Login OTP only
- **Region**: `ap-south-1` (Mumbai)
- **Message Type**: Transactional (high delivery priority)

---

## 🔧 Setup Instructions

### 1. AWS SNS Configuration

#### Create IAM User for SMS

1. Go to AWS IAM Console
2. Create a new IAM user: `rodistaa-sms-user`
3. Attach policy: `AmazonSNSFullAccess` (or create custom policy with SNS publish permissions)
4. Generate Access Key and Secret Key
5. Save credentials securely

#### Required IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "*"
    }
  ]
}
```

### 2. Environment Variables

Add to your `.env` file:

```bash
# AWS Credentials
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=<YOUR-AWS-ACCESS-KEY>
AWS_SECRET_ACCESS_KEY=<YOUR-AWS-SECRET-KEY>

# Enable SMS
SMS_ENABLED=true
```

### 3. AWS SNS Setup

#### Enable SMS in AWS SNS

1. Go to AWS SNS Console → Text messaging (SMS)
2. Set default message type: **Transactional**
3. Set spending limit (recommended: $100/month for testing)
4. Request production access if needed (for high volume)

#### SMS Sandbox (Optional)

For testing, you can use SMS Sandbox:
1. Go to SNS → Text messaging → SMS sandbox
2. Add phone numbers for testing
3. Verify phone numbers

---

## 🧪 Testing

### Development Mode

In development, SMS is automatically mocked if `SMS_ENABLED=false` or AWS credentials are missing:

```bash
# Mock mode (development)
SMS_ENABLED=false
# or
# Don't set AWS_ACCESS_KEY_ID

# Real SMS (production)
SMS_ENABLED=true
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

### Test Login OTP

1. Start backend: `cd packages/backend && pnpm dev`
2. Request OTP: `POST /api/auth/otp` with `{ "mobile": "+91XXXXXXXXXX" }`
3. Check logs for SMS status
4. In development, OTP is also returned in response for testing

---

## 📊 Code Structure

### Files

- `packages/backend/src/services/sms.service.ts` - AWS SNS SMS service
- `packages/backend/src/services/otp.service.ts` - OTP generation and SMS sending
- `packages/backend/src/modules/auth/auth.service.ts` - Auth service using OTP

### Key Methods

```typescript
// SMS Service
smsService.sendLoginOTP(phoneNumber: string, otp: string)

// OTP Service
otpService.generateAndSendLoginOTP(phone: string)

// Auth Service
generateOTP(mobile: string) // Sends OTP via SMS
```

---

## 🔒 Security

### Phone Number Format

- **Required**: E.164 format (e.g., `+91XXXXXXXXXX`)
- **Validation**: Automatically validated in SMS service
- **Masking**: Phone numbers are masked in logs

### Rate Limiting

- **Max OTPs**: 3 per hour per phone number
- **OTP Expiry**: 5 minutes
- **Max Attempts**: 5 verification attempts per OTP

---

## 💰 Cost Estimation

### AWS SNS SMS Pricing (India)

- **Transactional SMS**: ~₹0.50 per SMS
- **Monthly Estimate** (1000 logins): ~₹500/month
- **Production Estimate** (10,000 logins): ~₹5,000/month

### Cost Optimization

1. Set spending limits in AWS SNS
2. Monitor usage via CloudWatch
3. Use SMS sandbox for testing
4. Consider SMS pooling for high volume

---

## 🐛 Troubleshooting

### SMS Not Sending

1. **Check Environment Variables**
   ```bash
   echo $SMS_ENABLED
   echo $AWS_ACCESS_KEY_ID
   ```

2. **Check AWS Credentials**
   - Verify IAM user has SNS permissions
   - Check AWS region is correct (`ap-south-1`)

3. **Check AWS SNS Status**
   - Go to AWS SNS Console
   - Check SMS delivery status
   - Review CloudWatch logs

4. **Check Backend Logs**
   ```bash
   # Look for SMS service logs
   grep "SMS" logs/backend.log
   ```

### Common Issues

| Issue | Solution |
|-------|----------|
| `Invalid phone number format` | Use E.164 format: `+91XXXXXXXXXX` |
| `SMS service disabled` | Set `SMS_ENABLED=true` |
| `AWS credentials missing` | Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` |
| `SMS not delivered` | Check AWS SNS console, verify phone number, check spending limits |

---

## 📝 Production Checklist

- [ ] AWS IAM user created with SNS permissions
- [ ] Environment variables configured
- [ ] SMS_ENABLED=true in production
- [ ] AWS SNS spending limits set
- [ ] SMS delivery tested with real phone numbers
- [ ] CloudWatch alarms configured for SMS failures
- [ ] Cost monitoring enabled

---

## 🔗 Related Documentation

- [AWS SNS SMS Documentation](https://docs.aws.amazon.com/sns/latest/dg/sms_publish-to-phone.html)
- [AWS SNS Pricing](https://aws.amazon.com/sns/pricing/)
- [Environment Setup Guide](./PRODUCTION_ENV_SETUP.md)

---

**Last Updated**: 2024-12-19  
**Maintained By**: Rodistaa Engineering Team

