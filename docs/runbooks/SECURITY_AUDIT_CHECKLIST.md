# Security Audit Checklist - Rodistaa Platform

**Date**: December 2, 2025  
**Scope**: Pre-Production Security Review  
**Status**: Ready for execution

---

## 1. Authentication & Authorization

### JWT Security
- [ ] JWT secret is strong (>256 bits)
- [ ] JWT secret stored in AWS Secrets Manager
- [ ] Token expiry configured (15 minutes)
- [ ] Refresh token rotation enabled
- [ ] Token blacklist on logout
- [ ] Device binding enforced

### OTP Security
- [ ] OTP expires after 5 minutes
- [ ] Max 5 OTP attempts
- [ ] Rate limiting on OTP requests (max 3/hour per phone)
- [ ] OTP not logged in plain text
- [ ] SMS provider verified

### RBAC
- [ ] All routes protected
- [ ] Role checks on API layer
- [ ] Admin routes require admin role
- [ ] Franchise routes require franchise role
- [ ] No role privilege escalation possible

---

## 2. Data Protection

### KYC Encryption
- [ ] KYC documents encrypted with AES-256-GCM (not CBC)
- [ ] Encryption keys in AWS KMS
- [ ] Key rotation enabled
- [ ] Decryption audit logged
- [ ] No plaintext KYC in logs
- [ ] Access limited to authorized roles

### POD Security
- [ ] POD files encrypted at rest (S3 SSE)
- [ ] Duplicate detection working
- [ ] File hash verification
- [ ] Presigned URL expiry (15 minutes)
- [ ] No public bucket access

### Sensitive Data
- [ ] Passwords hashed with bcrypt (cost 12+)
- [ ] Chassis numbers encrypted
- [ ] Bank account details encrypted
- [ ] PII masked in logs
- [ ] Database encryption at rest enabled

---

## 3. Network Security

### HTTPS/TLS
- [ ] All endpoints use HTTPS
- [ ] TLS 1.2 minimum
- [ ] Strong cipher suites only
- [ ] HSTS headers enabled
- [ ] Certificate from trusted CA

### CORS
- [ ] CORS configured for known origins only
- [ ] No `Access-Control-Allow-Origin: *`
- [ ] Credentials allowed only for trusted origins

### Rate Limiting
- [ ] Global rate limit: 100 req/min per IP
- [ ] Login endpoint: 5 req/min per IP
- [ ] OTP endpoint: 3 req/hour per phone
- [ ] API endpoints: 100 req/min per user

### Firewall (WAF)
- [ ] AWS WAF configured
- [ ] SQL injection rules enabled
- [ ] XSS protection enabled
- [ ] Geographic restriction (India + allowed regions)
- [ ] Bot detection enabled

---

## 4. Input Validation

### Backend API
- [ ] All inputs validated with schemas
- [ ] SQL injection prevention (parameterized queries)
- [ ] NoSQL injection prevention
- [ ] File upload validation (type, size, content)
- [ ] Phone number format validation
- [ ] Email validation
- [ ] String length limits enforced

### Frontend
- [ ] XSS prevention (React auto-escaping verified)
- [ ] CSP headers configured
- [ ] No `dangerouslySetInnerHTML` usage
- [ ] Form validation before submission

---

## 5. Session Management

### Tokens
- [ ] Tokens stored securely (httpOnly cookies or SecureStore)
- [ ] No tokens in URL parameters
- [ ] No tokens in localStorage (use sessionStorage min)
- [ ] Tokens expire appropriately
- [ ] Logout clears all tokens

### Session Timeout
- [ ] Idle timeout: 30 minutes
- [ ] Absolute timeout: 8 hours
- [ ] Warning before timeout
- [ ] Secure session invalidation

---

## 6. API Security

### Endpoint Protection
- [ ] All endpoints require authentication (except login/health)
- [ ] Authorization checks before data access
- [ ] Resource-level permissions (user can only access own data)
- [ ] No enumeration attacks possible (IDs are ULIDs)

### Request Validation
- [ ] Content-Type validation
- [ ] Request size limits (10MB max)
- [ ] JSON depth limits
- [ ] Array size limits

---

## 7. Database Security

### Access Control
- [ ] Database not publicly accessible
- [ ] Application uses limited-privilege user
- [ ] Admin access via bastion only
- [ ] Connection pooling configured
- [ ] Prepared statements only (no dynamic SQL)

### Encryption
- [ ] Encryption at rest enabled
- [ ] Encryption in transit (TLS to RDS)
- [ ] Backup encryption enabled
- [ ] KMS keys rotated annually

### Audit
- [ ] All sensitive table access logged
- [ ] Audit logs immutable (append-only)
- [ ] Audit log retention: 7 years
- [ ] Access to audit logs restricted

---

## 8. Third-Party Dependencies

### NPM Packages
- [ ] `npm audit` shows no critical vulnerabilities
- [ ] All dependencies up to date (security patches)
- [ ] No deprecated packages in production
- [ ] Package lock file committed
- [ ] SCA scan (Snyk/Dependabot) configured

### External Services
- [ ] Razorpay webhooks verified (HMAC signature)
- [ ] Google Maps API key restricted (HTTP referrers)
- [ ] Firebase service account permissions minimal
- [ ] All API keys rotated every 90 days

---

## 9. Mobile App Security

### Code Security
- [ ] No hardcoded secrets
- [ ] SSL pinning enabled
- [ ] Root detection (Android)
- [ ] Jailbreak detection (iOS)
- [ ] Secure storage for tokens (Expo SecureStore)
- [ ] Code obfuscation enabled

### App Store
- [ ] App signed with production certificates
- [ ] ProGuard enabled (Android)
- [ ] Bitcode enabled (iOS)
- [ ] App permissions minimal
- [ ] Privacy policy linked

---

## 10. ACS (Anti-Corruption Shield)

### Rule Security
- [ ] Rule files access restricted
- [ ] Rule changes audited
- [ ] No SQL in rule conditions
- [ ] Rule evaluation sandboxed
- [ ] Infinite loop protection

### Audit Trail
- [ ] All ACS actions logged
- [ ] Logs immutable
- [ ] Log integrity verified (hash chain)
- [ ] Logs monitored for tampering

---

## 11. Compliance

### Data Protection (GDPR/equivalent)
- [ ] Privacy policy published
- [ ] User consent collected
- [ ] Right to deletion implemented
- [ ] Data portability enabled
- [ ] Breach notification process defined

### India-Specific
- [ ] Data residency in India (ap-south region)
- [ ] E-invoicing compliance (IRP integration)
- [ ] GST compliance verified
- [ ] PAN verification for operators
- [ ] Aadhaar KYC (if applicable)

---

## 12. Incident Response

### Preparation
- [ ] Incident response plan documented
- [ ] Team contact list updated
- [ ] Escalation paths defined
- [ ] Runbooks tested
- [ ] Backup restoration tested

### Detection
- [ ] Monitoring alerts configured
- [ ] Log aggregation working
- [ ] Anomaly detection enabled
- [ ] Security event alerts

---

## 13. Penetration Testing

### OWASP Top 10
- [ ] Injection attacks tested
- [ ] Broken authentication tested
- [ ] Sensitive data exposure tested
- [ ] XML external entities tested
- [ ] Broken access control tested
- [ ] Security misconfiguration tested
- [ ] XSS tested
- [ ] Insecure deserialization tested
- [ ] Using components with known vulnerabilities tested
- [ ] Insufficient logging/monitoring tested

### API Security
- [ ] Authentication bypass attempts
- [ ] Authorization bypass attempts
- [ ] Parameter tampering
- [ ] Mass assignment
- [ ] IDOR (Insecure Direct Object References)

---

## 14. Secrets Management

### Storage
- [ ] All secrets in AWS Secrets Manager
- [ ] No secrets in code
- [ ] No secrets in Docker images
- [ ] No secrets in environment variables (use secrets injection)
- [ ] No secrets in logs

### Rotation
- [ ] Secrets rotation policy defined
- [ ] Automated rotation for database passwords
- [ ] Manual rotation procedure documented
- [ ] Emergency rotation procedure tested

---

## 15. Logging & Monitoring

### Logging
- [ ] All API requests logged
- [ ] No sensitive data in logs (PII, passwords, tokens)
- [ ] Log levels configured correctly
- [ ] Log aggregation working (CloudWatch/ELK)
- [ ] Log retention policy enforced

### Monitoring
- [ ] Uptime monitoring (99.9% target)
- [ ] Performance monitoring (p95, p99)
- [ ] Error rate monitoring
- [ ] Security event monitoring
- [ ] Fraud detection alerts

---

## Sign-Off

### Security Team
- [ ] Penetration test report reviewed
- [ ] Vulnerabilities remediated
- [ ] Risk assessment completed
- [ ] Sign-off: _________________ Date: _______

### Compliance Team
- [ ] Regulatory requirements met
- [ ] Data protection verified
- [ ] Audit trail sufficient
- [ ] Sign-off: _________________ Date: _______

### CTO
- [ ] Technical review complete
- [ ] Architecture secure
- [ ] Deployment approved
- [ ] Sign-off: _________________ Date: _______

---

## Post-Audit Actions

### High Priority Findings
Document and track:
1. Issue description
2. Risk level (Critical/High/Medium/Low)
3. Remediation plan
4. Owner
5. Target date

### Continuous Improvement
- Schedule next audit: 6 months
- Quarterly security reviews
- Monthly dependency scans
- Weekly penetration testing (automated)

---

**Checklist Version**: 1.0  
**Next Review**: Before production deployment  
**Status**: Ready for execution

