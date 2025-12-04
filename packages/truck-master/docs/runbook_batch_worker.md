# Batch Worker Runbook

## Overview

The batch worker runs nightly to verify trucks with expired compliance cache or pending verification status.

## Configuration

### Concurrency Settings

```typescript
const batchWorker = new BatchWorker(vahanClient, {
  concurrency: 10,      // Parallel requests per batch
  batchSize: 100,       // Trucks per batch
  maxRetries: 3,        // Max retries per truck
});
```

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/rodistaa
VAHAN_PARIVAHAN_API_KEY=key (if available)
VAHAN_SUREPASS_API_KEY=key
VAHAN_BACKUP_API_KEY=key
```

## Scheduling

### Cron Schedule

```bash
# Run nightly at 2 AM
0 2 * * * cd /path/to/truck-master && node dist/jobs/batchWorker.js
```

### Manual Execution

```bash
node dist/jobs/batchWorker.js
```

## Monitoring

### Key Metrics

1. **Success Rate**: `successful / totalProcessed`
2. **Provider Errors**: Count of failures per provider
3. **Tickets Created**: Count of HQ tickets generated
4. **Blocked Counts**: Trucks blocked by reason code

### Logs

All decisions logged with:
- `provider`: VAHAN provider used
- `txn_id`: Provider transaction ID
- `rules_applied`: Array of rules applied
- `inference_confidence`: Body length inference confidence

### Database Queries

```sql
-- Check batch status
SELECT 
  COUNT(*) as total_pending,
  COUNT(CASE WHEN cache_expires_at < NOW() THEN 1 END) as expired_cache
FROM operator_trucks ot
LEFT JOIN vehicle_compliance_cache vcc ON ot.rc_number = vcc.rc_number
WHERE ot.status = 'PENDING_VERIFICATION'
   OR vcc.cache_expires_at < NOW();

-- Check provider success rates
SELECT 
  provider,
  COUNT(*) as total,
  COUNT(CASE WHEN verification_status = 'SUCCESS' THEN 1 END) as successful,
  ROUND(100.0 * COUNT(CASE WHEN verification_status = 'SUCCESS' THEN 1 END) / COUNT(*), 2) as success_rate
FROM vahan_vehicle_snapshot
WHERE verified_at > NOW() - INTERVAL '24 hours'
GROUP BY provider;
```

## Failover Behavior

### Provider Failover Order

1. **Parivahan** (if available)
2. **Surepass** (primary fallback)
3. **Backup** (final fallback)

### Circuit Breaker

- **Failure Threshold**: 5 consecutive failures
- **Reset Timeout**: 60 seconds
- **State**: Open → Half-Open → Closed

### Rate Limiting

- **Per Provider**: 60 requests/minute
- **Per Hour**: 1000 requests/hour
- **Backoff**: Exponential (1s → 30s max)

## Alerts

### Critical Alerts

- All providers failing (circuit breakers open)
- Batch success rate < 50%
- Ticket creation rate > 10% of processed trucks

### Warning Alerts

- Single provider failure rate > 30%
- Cache expiry backlog > 1000 trucks
- Average verification time > 5 seconds

## HQ Escalation SLAs

### Ticket Types and SLAs

- **DUPLICATE_CHASSIS**: 4 hours
- **PROVIDER_MISMATCH**: 8 hours
- **COMPLIANCE_BLOCK**: 24 hours
- **INVALID_LENGTH_FOR_CLASS**: 24 hours
- **PERMIT_DISCREPANCY**: 48 hours
- **LOW_TRUST**: 72 hours

### Escalation Process

1. **Auto-ticket creation** on detection
2. **HQ notification** via email/webhook
3. **SLA tracking** in ticket system
4. **Auto-escalation** if unresolved within SLA

## Troubleshooting

### All Providers Failing

1. Check API keys in environment
2. Verify network connectivity
3. Check provider status pages
4. Review circuit breaker states
5. Check rate limit queues

### High Failure Rate

1. Review error messages in `vahan_vehicle_snapshot.error_message`
2. Check provider response formats (may have changed)
3. Verify normalization logic
4. Review audit logs for patterns

### Slow Processing

1. Reduce concurrency if hitting rate limits
2. Check database connection pool size
3. Review query performance (add indices if needed)
4. Consider horizontal scaling

### Cache Not Updating

1. Check `cache_expires_at` values
2. Verify batch worker is running
3. Check database transaction logs
4. Review compliance engine logs

## Recovery Procedures

### Provider Outage Recovery

1. **Grace Period**: Existing active trucks remain for 48 hours
2. **Manual Verification**: HQ can manually verify via UI
3. **Backup Provider**: Automatic failover to backup
4. **Queue Processing**: Retry failed verifications on next run

### Database Issues

1. **Connection Pool Exhausted**: Increase pool size or reduce concurrency
2. **Lock Timeouts**: Review transaction isolation levels
3. **Query Timeouts**: Add indices or optimize queries

## Performance Tuning

### Optimal Settings

- **Concurrency**: 10-20 (depending on provider limits)
- **Batch Size**: 100-500 (depending on memory)
- **Database Pool**: 20-50 connections

### Scaling

- **Horizontal**: Run multiple workers with different operator_id ranges
- **Vertical**: Increase concurrency and batch size
- **Database**: Read replicas for query load

## Maintenance

### Daily

- Review batch results
- Check ticket queue
- Monitor provider health

### Weekly

- Review blocked truck trends
- Analyze provider success rates
- Optimize slow queries

### Monthly

- Archive old snapshots (7 years retention)
- Review and update body regex patterns
- Update OEM model mappings

