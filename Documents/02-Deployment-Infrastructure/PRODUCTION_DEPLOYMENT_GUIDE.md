# Rodistaa Backend - Production Deployment Guide

**Version**: 1.0.0  
**Status**: Production-Ready ✅  
**Last Updated**: December 2, 2025

---

## Quick Start

```bash
# 1. Build Docker image
docker build -t rodistaa-backend:1.0.0 .

# 2. Run with environment variables
docker run -p 4000:4000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  rodistaa-backend:1.0.0

# 3. Verify health
curl http://localhost:4000/health
curl http://localhost:4000/ready
```

---

## Production Checklist

### Pre-Deployment

- [ ] All environment variables configured (see `env.example`)
- [ ] Database migrations run successfully
- [ ] JWT secrets rotated
- [ ] TLS/SSL certificates configured
- [ ] Load balancer configured
- [ ] Monitoring & alerting set up
- [ ] Backup strategy in place

### Deployment

- [ ] Deploy to staging first
- [ ] Run smoke tests on staging
- [ ] Gradual rollout (10% → 50% → 100%)
- [ ] Monitor error rates
- [ ] Verify ACS rules loading

### Post-Deployment

- [ ] Health checks passing
- [ ] Logs flowing to aggregation system
- [ ] Metrics being collected
- [ ] No critical errors in logs
- [ ] Performance within SLA

---

## Environment Configuration

Copy `env.example` to `.env` and configure:

### Critical Variables

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/rodistaa_prod
JWT_SECRET=<long-random-secret>
JWT_REFRESH_SECRET=<different-long-random-secret>
LOCAL_KMS_KEY_ID=production-kms-key
```

### External Services

```bash
ADAPTER_MODE=LIVE
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=<secret>
MAPS_API_KEY=<api-key>
SMS_PROVIDER=twilio
```

---

## Database Migrations

```bash
# Run migrations
cd packages/backend
pnpm migrate

# Verify migrations
pnpm migrate:status

# Rollback if needed (careful!)
pnpm migrate:rollback
```

---

## Docker Deployment

### Build

```bash
docker build -t rodistaa-backend:latest .
docker tag rodistaa-backend:latest your-registry/rodistaa-backend:1.0.0
docker push your-registry/rodistaa-backend:1.0.0
```

### Run

```bash
docker run -d \
  --name rodistaa-backend \
  -p 4000:4000 \
  --env-file .env.production \
  --restart unless-stopped \
  rodistaa-backend:1.0.0
```

---

## Health Endpoints

### `/health` - Basic Health Check
Always returns 200 if server is running.  
**Use for**: Simple uptime monitoring

```bash
curl http://localhost:4000/health
# {"status":"ok","timestamp":"2025-12-02T...","uptime":123}
```

### `/ready` - Readiness Check
Verifies all dependencies (database, ACS).  
**Use for**: Load balancer health checks

```bash
curl http://localhost:4000/ready
# {"status":"healthy","checks":{"database":{"status":"healthy"}}}
```

### `/metrics` - Prometheus Metrics
Prometheus-compatible metrics endpoint.  
**Use for**: Monitoring dashboards

```bash
curl http://localhost:4000/metrics
```

---

## Monitoring

### Key Metrics to Monitor

- **Request rate**: requests/second
- **Response time**: p50, p95, p99
- **Error rate**: 4xx, 5xx responses
- **Database**: connection pool usage
- **ACS**: rule trigger rate

### Alerting Thresholds

- Error rate > 1%: Warning
- Error rate > 5%: Critical
- Response time p95 > 500ms: Warning
- Response time p95 > 1s: Critical
- Database connection failures: Critical

---

## Scaling

### Horizontal Scaling

Backend is stateless and can scale horizontally:

```bash
# Kubernetes example
kubectl scale deployment rodistaa-backend --replicas=5
```

### Database Scaling

- Use connection pooling (configured in code)
- Add read replicas for read-heavy workloads
- Consider PgBouncer for connection management

---

## Troubleshooting

### Server Won't Start

1. Check logs: `docker logs rodistaa-backend`
2. Verify environment variables
3. Test database connectivity
4. Check ACS rules file exists

### High Error Rate

1. Check `/ready` endpoint
2. Review application logs
3. Check database performance
4. Verify external services (Razorpay, Maps, etc.)

### ACS Rules Not Loading

1. Verify `ACS_RULES_PATH` is correct
2. Check rules file syntax: `pnpm --filter @rodistaa/acs lint-rules`
3. Review ACS logs

---

## Rollback Procedure

### Quick Rollback

```bash
# 1. Deploy previous version
kubectl set image deployment/rodistaa-backend \
  backend=your-registry/rodistaa-backend:previous-version

# 2. Verify health
curl http://your-domain/health

# 3. Monitor for issues
kubectl logs -f deployment/rodistaa-backend
```

### Database Rollback

```bash
# Rollback last migration (use with caution!)
cd packages/backend
pnpm migrate:rollback
```

---

## Performance Optimization

### Database

- Ensure indexes are in place (check migrations)
- Monitor slow queries
- Optimize N+1 query patterns

### Caching

- Implement Redis for session caching
- Cache expensive calculations
- Use CDN for static assets

### ACS

- Rules are compiled once at startup
- Hot-reload available for rule updates
- No performance impact on request path

---

## Security

### Secrets Management

- **Never** commit secrets to git
- Use environment variables or secrets manager (AWS Secrets Manager, GCP Secret Manager)
- Rotate secrets regularly

### Network Security

- Use TLS/SSL for all connections
- Configure WAF for DDoS protection
- Restrict database access to application servers only

### Application Security

- JWT tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- KYC data encrypted with AES-256-GCM
- All sensitive operations audited

---

## Support & Escalation

### On-Call Rotation

- **Primary**: Backend team
- **Secondary**: Platform team
- **Escalation**: CTO

### Critical Issues

- **P0** (Production down): Immediate response
- **P1** (Critical feature down): 30 min response
- **P2** (Performance degraded): 2 hour response
- **P3** (Minor issues): Next business day

---

## Success Metrics

### Technical SLA

- **Uptime**: 99.9% (8.76 hours downtime/year)
- **Response time (p95)**: < 200ms
- **Error rate**: < 0.1%
- **Database queries (p95)**: < 100ms

### Business Metrics

- Bookings per day
- Fraud detection rate (ACS triggers)
- Successful shipments
- Operator ledger accuracy

---

## Additional Resources

- **API Documentation**: `/api/docs` (when deployed)
- **OpenAPI Spec**: `api/openapi.yaml`
- **Database Schema**: `packages/backend/migrations/README.md`
- **ACS Rules**: `acs_rules_top25.yaml`

---

**Questions?** Contact: tech@rodistaa.com


