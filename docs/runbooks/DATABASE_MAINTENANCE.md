# 🗄️ Database Maintenance Runbook

Routine database maintenance procedures for Rodistaa platform.

---

## Daily Maintenance Tasks

### 1. Check Database Health

```bash
# Connection status
psql -h $PGHOST -U $PGUSER -d $PGDATABASE <<EOF
SELECT 
  count(*) as total_connections,
  count(*) FILTER (WHERE state = 'active') as active,
  count(*) FILTER (WHERE state = 'idle') as idle,
  count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
FROM pg_stat_activity
WHERE datname = 'rodistaa_production';
EOF

# Database size
psql -h $PGHOST -U $PGUSER -d $PGDATABASE <<EOF
SELECT 
  pg_size_pretty(pg_database_size('rodistaa_production')) as database_size;
EOF

# Replication lag (if using read replicas)
psql -h $PGHOST -U $PGUSER -d $PGDATABASE <<EOF
SELECT
  client_addr,
  state,
  sync_state,
  pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) AS replication_lag_bytes
FROM pg_stat_replication;
EOF
```

---

## Weekly Maintenance Tasks

### 1. Analyze Slow Queries

```sql
-- Top 10 slowest queries
SELECT 
  substring(query, 1, 50) AS query_snippet,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time,
  stddev_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Queries with high I/O
SELECT 
  substring(query, 1, 50) AS query_snippet,
  calls,
  shared_blks_hit,
  shared_blks_read,
  shared_blks_hit::numeric / (shared_blks_hit + shared_blks_read) AS cache_hit_ratio
FROM pg_stat_statements
WHERE shared_blks_hit + shared_blks_read > 0
ORDER BY shared_blks_read DESC
LIMIT 10;
```

### 2. Check Index Usage

```sql
-- Unused indexes (candidates for removal)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Missing indexes (high sequential scans)
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  seq_tup_read / seq_scan AS avg_seq_tuples
FROM pg_stat_user_tables
WHERE seq_scan > 1000
  AND seq_tup_read / seq_scan > 10000
ORDER BY seq_tup_read DESC
LIMIT 10;
```

### 3. Table Bloat Analysis

```sql
-- Tables with significant bloat
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  n_live_tup,
  n_dead_tup,
  round(100 * n_dead_tup / (n_live_tup + n_dead_tup + 1)::numeric, 2) AS dead_tuple_percent
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC
LIMIT 10;
```

---

## Monthly Maintenance Tasks

### 1. VACUUM Analysis

```sql
-- Check last vacuum/analyze times
SELECT
  schemaname,
  tablename,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze,
  n_dead_tup
FROM pg_stat_user_tables
WHERE n_dead_tup > 0
ORDER BY n_dead_tup DESC;

-- Manual VACUUM if needed (off-peak hours only!)
VACUUM ANALYZE bookings;
VACUUM ANALYZE shipments;
VACUUM ANALYZE gps_logs;
```

### 2. Backup Verification

```bash
# List recent backups
aws rds describe-db-cluster-snapshots \
  --db-cluster-identifier rodistaa-prod \
  --snapshot-type automated \
  --max-records 10 \
  --query 'DBClusterSnapshots[*].[DBClusterSnapshotIdentifier,SnapshotCreateTime,Status]' \
  --output table

# Test restore (to test environment)
aws rds restore-db-cluster-from-snapshot \
  --db-cluster-identifier rodistaa-test-restore \
  --snapshot-identifier <snapshot-id> \
  --engine aurora-postgresql \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name rodistaa-subnet-group

# Verify restored data
psql -h <restored-endpoint> -U rodistaa -d rodistaa_production -c "SELECT COUNT(*) FROM bookings;"

# Delete test instance after verification
aws rds delete-db-cluster --db-cluster-identifier rodistaa-test-restore --skip-final-snapshot
```

### 3. Review and Optimize Indexes

```sql
-- Create missing indexes based on analysis

-- Example: Add index for frequently queried columns
CREATE INDEX CONCURRENTLY idx_bookings_shipper_created 
ON bookings(shipper_id, created_at DESC);

-- Example: Add composite index for common query pattern
CREATE INDEX CONCURRENTLY idx_shipments_status_updated
ON shipments(status, updated_at);

-- Drop unused indexes
DROP INDEX CONCURRENTLY idx_old_unused_index;
```

---

## Quarterly Maintenance Tasks

### 1. Full Database Statistics Update

```sql
-- Update statistics for query planner
ANALYZE VERBOSE;

-- Reindex if needed (off-peak hours only!)
REINDEX DATABASE rodistaa_production;
```

### 2. Archive Old Data

```sql
-- Archive completed shipments older than 2 years
BEGIN;

-- Move to archive table
INSERT INTO shipments_archive 
SELECT * FROM shipments 
WHERE status = 'DELIVERED' 
  AND completed_at < NOW() - INTERVAL '2 years';

-- Delete from main table
DELETE FROM shipments 
WHERE status = 'DELIVERED' 
  AND completed_at < NOW() - INTERVAL '2 years';

COMMIT;

-- Verify
SELECT COUNT(*) FROM shipments WHERE completed_at < NOW() - INTERVAL '2 years';
```

### 3. Capacity Planning

```sql
-- Database growth rate
SELECT
  date_trunc('month', created_at) AS month,
  COUNT(*) as new_records,
  pg_size_pretty(SUM(pg_column_size(row(bookings.*)))) AS estimated_size
FROM bookings
WHERE created_at > NOW() - INTERVAL '6 months'
GROUP BY month
ORDER BY month;

-- Project future size
-- If growing 10GB/month, plan for 120GB/year
```

---

## Performance Tuning

### 1. Connection Pool Optimization

```bash
# Check current settings
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SHOW max_connections;"
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SHOW shared_buffers;"

# Recommended settings for production (adjust based on workload)
# max_connections = 200
# shared_buffers = 8GB (25% of RAM)
# effective_cache_size = 24GB (75% of RAM)
# maintenance_work_mem = 2GB
# work_mem = 50MB
```

### 2. Query Optimization Examples

```sql
-- BEFORE: Slow query with N+1 problem
SELECT * FROM bookings WHERE id IN (
  SELECT booking_id FROM bids WHERE status = 'ACCEPTED'
);

-- AFTER: Optimized with JOIN
SELECT b.* 
FROM bookings b
INNER JOIN bids bid ON b.id = bid.booking_id
WHERE bid.status = 'ACCEPTED';

-- BEFORE: Full table scan
SELECT * FROM shipments WHERE driver_id = 'DRV-001' ORDER BY created_at DESC;

-- AFTER: Add index
CREATE INDEX CONCURRENTLY idx_shipments_driver_created 
ON shipments(driver_id, created_at DESC);
```

---

## Emergency Procedures

### 1. High Connection Count

```sql
-- Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND state_change < NOW() - INTERVAL '10 minutes'
  AND pid <> pg_backend_pid();

-- Kill long-running queries (use with caution!)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'active'
  AND query_start < NOW() - INTERVAL '5 minutes'
  AND pid <> pg_backend_pid();
```

### 2. Database Locks

```sql
-- Check for blocking queries
SELECT
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
  ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
  AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
  AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- Kill blocking query
SELECT pg_terminate_backend(<blocking_pid>);
```

### 3. Disk Space Critical

```bash
# Check disk usage
aws rds describe-db-clusters \
  --db-cluster-identifier rodistaa-prod \
  --query 'DBClusters[0].[AllocatedStorage,StorageEncrypted]'

# Increase storage (can be done online)
aws rds modify-db-cluster \
  --db-cluster-identifier rodistaa-prod \
  --allocated-storage 200 \
  --apply-immediately

# Clean up if urgent
# 1. Archive old data
# 2. Drop unused indexes
# 3. Vacuum to reclaim space
```

---

## Monitoring Queries

```sql
-- Dashboard query: Database health
SELECT
  'Connections' as metric,
  count(*)::text as value
FROM pg_stat_activity
UNION ALL
SELECT
  'Database Size',
  pg_size_pretty(pg_database_size(current_database()))
UNION ALL
SELECT
  'Cache Hit Ratio',
  round(100.0 * sum(blks_hit) / nullif(sum(blks_hit + blks_read), 0), 2)::text || '%'
FROM pg_stat_database
WHERE datname = current_database();

-- Dashboard query: Top tables by size
SELECT
  schemaname || '.' || tablename as table_name,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - 
                 pg_relation_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

---

## Backup & Recovery

### Manual Backup

```bash
# Full backup
pg_dump -h $PGHOST -U $PGUSER -Fc rodistaa_production > backup-$(date +%Y%m%d-%H%M%S).dump

# Upload to S3
aws s3 cp backup-$(date +%Y%m%d-%H%M%S).dump s3://rodistaa-prod-backups/manual/

# Verify backup
pg_restore -l backup-$(date +%Y%m%d-%H%M%S).dump | head -20
```

### Point-in-Time Recovery

```bash
# Restore to specific time
aws rds restore-db-cluster-to-point-in-time \
  --source-db-cluster-identifier rodistaa-prod \
  --db-cluster-identifier rodistaa-prod-restored \
  --restore-to-time 2024-01-01T12:00:00Z \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name rodistaa-subnet-group
```

---

## Best Practices

1. **Always test in staging first**
2. **Schedule maintenance during off-peak hours**
3. **Take backup before any major change**
4. **Use CONCURRENTLY for index operations**
5. **Monitor query performance after changes**
6. **Document all manual interventions**
7. **Keep pg_stat_statements enabled**
8. **Review slow query logs weekly**

---

## Checklist Template

```markdown
## Weekly Database Maintenance - [Date]

- [ ] Checked database health metrics
- [ ] Reviewed slow queries
- [ ] Checked index usage
- [ ] Analyzed table bloat
- [ ] Verified backup completion
- [ ] Checked disk space
- [ ] Reviewed connection patterns
- [ ] Documented findings
- [ ] Created optimization tickets if needed

Notes:
_____________________
```

---

**Questions?** Contact DevOps team or DBA on-call.

