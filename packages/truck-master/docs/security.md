# Security Documentation - Truck Master Service

## RC Copy Encryption

### Method: AES-256-GCM

RC copies are encrypted at rest using AES-256-GCM (Galois/Counter Mode) with:
- **Key**: 32-byte key from `ENCRYPTION_KEY` environment variable
- **IV**: 16-byte random initialization vector (per encryption)
- **Auth Tag**: 16-byte authentication tag for integrity

### Implementation

```typescript
// Encryption
const encrypted = encryptRCCopy(rcCopyBuffer);

// Decryption
const decrypted = decryptRCCopy(encrypted);
```

### Key Management

- **Storage**: Environment variable only (never in code)
- **Rotation**: Rotate keys periodically (requires re-encryption of existing RC copies)
- **Backup**: Store encryption key securely (key management service recommended)

## Chassis/Engine Hashing

### Method: SHA256

Chassis and engine numbers are hashed using SHA256 before storage:
- **Input**: Uppercase, trimmed chassis/engine number
- **Output**: 64-character hexadecimal hash
- **Storage**: Only hash stored (plain text never stored)

### Implementation

```typescript
const chassisHash = hashChassis(chassisNumber);
const engineHash = hashEngine(engineNumber);
```

### Duplicate Detection

Duplicate detection uses hash comparison:
- Compare `chassis_hash` and `engine_hash` across operators
- Block if hash matches existing truck (different operator)

## API Security

### JWT Authentication

All API endpoints protected with JWT:
- **Secret**: `JWT_SECRET` environment variable
- **Algorithm**: HS256
- **Expiry**: Configurable (default: 24 hours)

### Role-Based Access

- **Operator**: Can create/list own trucks
- **HQ/Admin**: Can view all trucks, resolve tickets
- **Driver**: Read-only access to assigned trucks

### Endpoint Protection

```typescript
// Protected route
fastify.register(async (fastify) => {
  fastify.addHook('onRequest', async (request, reply) => {
    await request.jwtVerify();
  });
  
  // Protected routes here
});
```

## Data Retention

### Retention Policy: 7 Years

All data retained for 7 years:
- **VAHAN Snapshots**: `retention_until` = `created_at + 7 years`
- **Audit Logs**: `retention_until` = `created_at + 7 years`
- **Tickets**: `retention_until` = `created_at + 7 years`

### Automatic Cleanup

```sql
-- Archive old data (run monthly)
DELETE FROM vahan_vehicle_snapshot
WHERE retention_until < NOW() - INTERVAL '1 month';

DELETE FROM verification_audit_log
WHERE retention_until < NOW() - INTERVAL '1 month';

DELETE FROM tickets
WHERE retention_until < NOW() - INTERVAL '1 month'
AND status = 'CLOSED';
```

## GDPR & India Privacy Compliance

### Data Minimization

- Only collect necessary VAHAN fields
- Hash sensitive identifiers (chassis, engine)
- Encrypt RC copies (personal documents)

### Right to Erasure

- Operators can request truck deletion
- Soft delete: Mark as deleted, retain for audit
- Hard delete: After retention period (7 years)

### Data Portability

- Export truck data in JSON format
- Include all snapshots, compliance history
- Exclude encrypted RC copies (require decryption key)

### Access Control

- Operators can only access own trucks
- HQ can access all trucks for compliance
- Audit trail of all access

## Security Best Practices

### Environment Variables

- Never commit secrets to git
- Use `.env` files (gitignored)
- Rotate keys periodically
- Use key management services in production

### Database Security

- Use connection pooling
- Parameterized queries (prevent SQL injection)
- Encrypted connections (SSL/TLS)
- Regular backups

### API Security

- Rate limiting per IP/operator
- CORS configuration
- Input validation (Zod schemas)
- Error message sanitization

### Logging

- Never log sensitive data (chassis, engine numbers)
- Log hashes only
- Sanitize error messages
- Audit trail for all operations

## Incident Response

### Data Breach

1. **Immediate**: Rotate encryption keys
2. **Assessment**: Identify scope of breach
3. **Notification**: Notify affected operators
4. **Remediation**: Re-encrypt affected data
5. **Review**: Update security measures

### Key Compromise

1. **Rotate**: Generate new encryption key
2. **Re-encrypt**: Re-encrypt all RC copies
3. **Audit**: Review access logs
4. **Update**: Update key management process

## Compliance Checklist

- ✅ RC copies encrypted at rest (AES-256-GCM)
- ✅ Chassis/engine hashed (SHA256)
- ✅ API endpoints protected (JWT)
- ✅ Role-based access control
- ✅ 7-year retention policy
- ✅ Audit logging
- ✅ Data minimization
- ✅ Right to erasure support
- ✅ Secure key management
- ✅ Regular security reviews

