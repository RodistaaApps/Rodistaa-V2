# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Security Reporting

Please report security vulnerabilities to: security@rodistaa.com

## Security Practices

### Encryption

- **KYC Data**: AES-256-GCM encryption at rest
- **Secrets**: Stored in KMS (AWS KMS / GCP KMS)
- **TLS**: All API communications over HTTPS

### Authentication

- JWT tokens with short expiration
- Refresh token rotation
- Device binding for mobile apps
- 2FA required for admin accounts

### Data Privacy

- PII masking in support UIs
- KYC data only accessible to KYC-admin role
- Field-level encryption for sensitive fields
- Audit logging for all data access

### Dependency Security

- Regular dependency updates
- Automated security scanning (npm audit, Snyk)
- Pinned dependency versions in production

### Access Control

- Role-based access control (RBAC)
- Principle of least privilege
- Admin override governance (2FA + second approver)

### Infrastructure

- Secrets rotation policies
- WAF and DDoS protection
- Rate limiting on all endpoints
- Device attestation for mobile apps

### Compliance

- Data residency: All storage in India region
- Audit trails for compliance
- Regular security audits

## Security Checklist for Developers

- [ ] Never commit secrets or credentials
- [ ] Use environment variables for configuration
- [ ] Encrypt sensitive data before storage
- [ ] Validate and sanitize all inputs
- [ ] Use parameterized queries (SQL injection prevention)
- [ ] Implement rate limiting on endpoints
- [ ] Log security-relevant events
- [ ] Keep dependencies updated
- [ ] Review code for security vulnerabilities
- [ ] Follow secure coding practices

---

**Last Updated**: 2025-01-02

