# Batch Worker Runbook

## Overview

Nightly batch worker processes pending trucks for VAHAN verification, computes flags, assigns franchise tasks, and creates tickets for escalations.

## Configuration

### Environment Variables

```bash
DATABASE_URL=postgresql://...
PARIVAHAN_API_KEY=...
SUREPASS_API_KEY=...
DEFAULT_FRANCHISE_ID=...
```

### Runtime Configuration

```typescript
{
  batchSize: 50,        // Trucks processed per run
  concurrency: 10,      // Parallel VAHAN fetches
  staleDays: 7,         // Days before re-verification
  maxRetries: 3,        // Retry attempts per provider
  retryDelay: 1000,     // Base retry delay (ms)
}
```

## Scheduling

### Recommended Schedule

```bash
# Run nightly at 2 AM
0 2 * * * cd /path/to/truck-master && npm run batch-worker
```

### Manual Execution

```bash
node -r dotenv/config dist/jobs/batchWorker.js
```

## Monitoring Metrics

### Prometheus Metrics

```prometheus
# Batch worker execution
truck_master_batch_worker_runs_total{counter}
truck_master_batch_worker_duration_seconds{histogram}
truck_master_batch_worker_trucks_processed_total{counter}
truck_master_batch_worker_trucks_succeeded_total{counter}
truck_master_batch_worker_trucks_failed_total{counter}

# VAHAN provider metrics
truck_master_vahan_requests_total{provider, status}
truck_master_vahan_request_duration_seconds{provider, histogram}
truck_master_vahan_circuit_breaker_state{provider, state}

# Flag generation
truck_master_flags_created_total{flag_code}
truck_master_persistent_flags_total{counter}

# Ticket creation
truck_master_tickets_created_total{reason_code, severity}
truck_master_franchise_tasks_created_total{counter}
```

### Key Metrics to Monitor

1. **Batch Worker Success Rate**
   - Target: >95% trucks processed successfully
   - Alert if: <90% success rate

2. **VAHAN Provider Availability**
   - Target: Parivahan >98% success rate
   - Alert if: Circuit breaker opens for >30 minutes

3. **Processing Time**
   - Target: Complete batch in <30 minutes
   - Alert if: >60 minutes

4. **Flag Generation Rate**
   - Monitor for sudden spikes
   - Review if >20% trucks flagged

5. **Ticket Creation Rate**
   - Monitor for escalations
   - Alert if >10% trucks create tickets

## Provider Failover

### Primary: Parivahan
- First attempt for all RCs
- Circuit breaker opens after 5 consecutive failures
- Timeout: 60 seconds

### Fallback: Surepass
- Used when Parivahan circuit open or fails
- Same circuit breaker logic
- Timeout: 60 seconds

### Circuit Breaker States

- **CLOSED**: Normal operation
- **OPEN**: Blocked after 5 failures
- **HALF_OPEN**: Testing after 1 minute timeout

### Recovery

Circuit breaker automatically transitions:
- OPEN → HALF_OPEN after 1 minute
- HALF_OPEN → CLOSED after first success
- HALF_OPEN → OPEN after first failure

## Error Handling

### Retry Logic

- Exponential backoff: `delay = baseDelay * 2^(attempt - 1)`
- Max 3 retries per provider
- Retries only on transient errors (timeout, network)

### Failure Handling

1. **VAHAN Fetch Fails**: Log error, skip truck (will retry next cycle)
2. **Flag Computation Fails**: Log error, continue with basic flags
3. **Database Error**: Rollback transaction, log error, skip truck

### Alert Thresholds

- **Critical**: Batch worker fails completely (0 trucks processed)
- **High**: >20% trucks fail processing
- **Medium**: VAHAN provider circuit breaker open
- **Low**: Individual truck processing failures

## Performance Tuning

### Concurrency

Adjust based on:
- VAHAN provider rate limits
- Database connection pool size
- Server CPU/memory

**Recommended**: Start with 10, increase gradually if providers support.

### Batch Size

- Larger batches = more efficient but longer processing time
- Smaller batches = faster per batch but more frequent runs

**Recommended**: 50 trucks per batch.

### Stale Verification Days

- Shorter = more frequent verification (higher accuracy)
- Longer = less load on providers (cost savings)

**Recommended**: 7 days (weekly verification).

## Troubleshooting

### Issue: Batch Worker Stalls

**Symptoms**: No progress for >10 minutes

**Diagnosis**:
```sql
-- Check pending trucks
SELECT COUNT(*) FROM operator_trucks 
WHERE compliance_status = 'PENDING' 
   OR last_verified_at < NOW() - INTERVAL '7 days';
```

**Resolution**:
1. Check database connections
2. Verify VAHAN provider availability
3. Review logs for errors
4. Restart batch worker

### Issue: High Failure Rate

**Symptoms**: >20% trucks fail

**Diagnosis**:
- Check VAHAN provider status
- Review error logs
- Verify API keys valid

**Resolution**:
1. Check provider status page
2. Rotate API keys if expired
3. Adjust retry configuration
4. Contact provider support if persistent

### Issue: Circuit Breaker Stuck Open

**Symptoms**: All requests failing, circuit open for >30 minutes

**Resolution**:
1. Verify provider API is functional
2. Test API keys manually
3. Check network connectivity
4. Reset circuit breaker state (restart service)

## Logging

### Log Levels

- **ERROR**: Failed processing, circuit breaker opens, critical errors
- **WARN**: Provider fallback, retries, unusual flags
- **INFO**: Batch start/end, processing stats, ticket creation
- **DEBUG**: Individual truck processing, flag computation details

### Log Format

```json
{
  "timestamp": "2025-01-XXT02:00:00Z",
  "level": "INFO",
  "service": "batch-worker",
  "message": "Batch processing completed",
  "metrics": {
    "processed": 50,
    "succeeded": 48,
    "failed": 2,
    "duration_ms": 1200000
  }
}
```

## Maintenance

### Weekly

- Review failure rates and error patterns
- Check circuit breaker states
- Review ticket creation trends

### Monthly

- Analyze flag generation patterns
- Review provider performance
- Optimize configuration if needed

### Quarterly

- Review retention policies
- Archive old snapshots/flags if needed
- Update OEM mappings based on trends

---

**Last Updated**: 2025-01-XX

