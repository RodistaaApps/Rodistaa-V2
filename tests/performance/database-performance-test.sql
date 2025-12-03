-- ============================================
-- DATABASE PERFORMANCE TEST SUITE
-- ============================================
-- Tests database query performance under various conditions
-- Run: psql -h localhost -U rodistaa -d rodistaa -f tests/performance/database-performance-test.sql

\timing on

-- ============================================
-- SETUP: Create test data
-- ============================================
\echo '=== CREATING TEST DATA ==='

-- Create test bookings (1000 records)
DO $$
DECLARE
  i INTEGER;
  shipper_id TEXT;
BEGIN
  FOR i IN 1..1000 LOOP
    INSERT INTO bookings (
      id,
      shipper_id,
      type,
      pickup,
      drop,
      goods,
      tonnage,
      truck_type,
      price_range_min,
      price_range_max,
      status,
      created_at
    ) VALUES (
      'BK-PERF-' || LPAD(i::TEXT, 6, '0'),
      'USR-SH-01KBFWZ2J6Y4VJ27PA09GZ5YQC',
      'FTL',
      '{"address": "Mumbai", "coordinates": {"lat": 19.076, "lng": 72.8777}}',
      '{"address": "Delhi", "coordinates": {"lat": 28.7041, "lng": 77.1025}}',
      'Test Goods ' || i,
      10.5,
      '20ft Container',
      40000,
      50000,
      CASE WHEN i % 5 = 0 THEN 'PUBLISHED' 
           WHEN i % 5 = 1 THEN 'CONFIRMED'
           WHEN i % 5 = 2 THEN 'DRAFT'
           ELSE 'COMPLETED' END,
      NOW() - (i || ' hours')::INTERVAL
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Created 1000 test bookings';
END $$;

-- Create test bids (5000 records)
DO $$
DECLARE
  i INTEGER;
  booking_num INTEGER;
BEGIN
  FOR i IN 1..5000 LOOP
    booking_num := (i % 1000) + 1;
    INSERT INTO bids (
      id,
      booking_id,
      operator_id,
      amount,
      truck_id,
      status,
      created_at
    ) VALUES (
      'BD-PERF-' || LPAD(i::TEXT, 6, '0'),
      'BK-PERF-' || LPAD(booking_num::TEXT, 6, '0'),
      'USR-OP-01KBFWZ2J6Y4VJ27PA09GZ5YQD',
      CASE WHEN i % 3 = 0 THEN 45000
           WHEN i % 3 = 1 THEN 42000
           ELSE 48000 END,
      'TRK-' || LPAD((i % 10)::TEXT, 3, '0'),
      CASE WHEN i % 10 = 0 THEN 'ACCEPTED'
           WHEN i % 10 = 1 THEN 'REJECTED'
           ELSE 'PENDING' END,
      NOW() - (i || ' minutes')::INTERVAL
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Created 5000 test bids';
END $$;

-- Create test shipments (500 records)
DO $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..500 LOOP
    INSERT INTO shipments (
      id,
      booking_id,
      operator_id,
      driver_id,
      truck_id,
      status,
      created_at
    ) VALUES (
      'SH-PERF-' || LPAD(i::TEXT, 6, '0'),
      'BK-PERF-' || LPAD(i::TEXT, 6, '0'),
      'USR-OP-01KBFWZ2J6Y4VJ27PA09GZ5YQD',
      'USR-DR-01KBFWZ2J6Y4VJ27PA09GZ5YQF',
      'TRK-' || LPAD((i % 10)::TEXT, 3, '0'),
      CASE WHEN i % 4 = 0 THEN 'IN_TRANSIT'
           WHEN i % 4 = 1 THEN 'DELIVERED'
           WHEN i % 4 = 2 THEN 'ASSIGNED'
           ELSE 'REACHED' END,
      NOW() - (i || ' hours')::INTERVAL
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Created 500 test shipments';
END $$;

-- Create test GPS logs (50000 records)
DO $$
DECLARE
  i INTEGER;
  shipment_num INTEGER;
BEGIN
  FOR i IN 1..50000 LOOP
    shipment_num := (i % 500) + 1;
    INSERT INTO gps_logs (
      shipment_id,
      coordinates,
      speed,
      heading,
      timestamp
    ) VALUES (
      'SH-PERF-' || LPAD(shipment_num::TEXT, 6, '0'),
      jsonb_build_object(
        'lat', 19.076 + (random() - 0.5) * 10,
        'lng', 72.8777 + (random() - 0.5) * 10
      ),
      50 + random() * 50,
      random() * 360,
      NOW() - (i || ' seconds')::INTERVAL
    );
  END LOOP;
  
  RAISE NOTICE 'Created 50000 test GPS logs';
END $$;

\echo ''
\echo '=== TEST DATA CREATED SUCCESSFULLY ==='
\echo ''

-- ============================================
-- TEST 1: Query Performance Tests
-- ============================================
\echo '=== TEST 1: QUERY PERFORMANCE ==='
\echo ''

-- Test 1.1: Simple SELECT
\echo 'Test 1.1: Simple SELECT on bookings'
SELECT COUNT(*) FROM bookings WHERE status = 'PUBLISHED';

-- Test 1.2: JOIN query (bookings + bids)
\echo 'Test 1.2: JOIN query (bookings with bids)'
SELECT b.id, b.status, COUNT(bd.id) as bid_count
FROM bookings b
LEFT JOIN bids bd ON b.id = bd.booking_id
WHERE b.status = 'PUBLISHED'
GROUP BY b.id, b.status
LIMIT 100;

-- Test 1.3: Complex aggregation
\echo 'Test 1.3: Complex aggregation'
SELECT 
  DATE_TRUNC('day', created_at) as day,
  status,
  COUNT(*) as count,
  AVG(tonnage) as avg_tonnage,
  SUM(price_range_max - price_range_min) as total_price_range
FROM bookings
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY day, status
ORDER BY day DESC;

-- Test 1.4: Subquery performance
\echo 'Test 1.4: Subquery with IN clause'
SELECT * FROM bookings
WHERE id IN (
  SELECT booking_id FROM bids WHERE status = 'ACCEPTED'
)
LIMIT 50;

-- Test 1.5: JSONB query
\echo 'Test 1.5: JSONB query on coordinates'
SELECT id, pickup->>'address' as pickup_address
FROM bookings
WHERE pickup->'coordinates'->>'lat' > '20'
LIMIT 100;

\echo ''

-- ============================================
-- TEST 2: Index Effectiveness
-- ============================================
\echo '=== TEST 2: INDEX EFFECTIVENESS ==='
\echo ''

-- Check index usage
\echo 'Index usage statistics:'
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

\echo ''

-- Check for missing indexes (high sequential scans)
\echo 'Tables with high sequential scans (may need indexes):'
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  CASE 
    WHEN seq_scan + idx_scan > 0 
    THEN ROUND(100.0 * idx_scan / (seq_scan + idx_scan), 2)
    ELSE 0 
  END as index_usage_percent
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 100
ORDER BY seq_scan DESC;

\echo ''

-- ============================================
-- TEST 3: Table Bloat Analysis
-- ============================================
\echo '=== TEST 3: TABLE BLOAT ANALYSIS ==='
\echo ''

SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  n_live_tup,
  n_dead_tup,
  CASE 
    WHEN n_live_tup + n_dead_tup > 0
    THEN ROUND(100.0 * n_dead_tup / (n_live_tup + n_dead_tup), 2)
    ELSE 0
  END as dead_tuple_percent
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

\echo ''

-- ============================================
-- TEST 4: Slow Query Analysis
-- ============================================
\echo '=== TEST 4: SLOW QUERY ANALYSIS ==='
\echo ''

-- Enable pg_stat_statements if not already
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 slowest queries
\echo 'Top 10 slowest queries:'
SELECT
  SUBSTRING(query, 1, 60) AS query_snippet,
  calls,
  ROUND(mean_exec_time::numeric, 2) AS mean_time_ms,
  ROUND(max_exec_time::numeric, 2) AS max_time_ms,
  ROUND(stddev_exec_time::numeric, 2) AS stddev_time_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
  AND query NOT LIKE '%pg_class%'
ORDER BY mean_exec_time DESC
LIMIT 10;

\echo ''

-- ============================================
-- TEST 5: Connection Pool Stress
-- ============================================
\echo '=== TEST 5: CONNECTION POOL STRESS ==='
\echo ''

-- Current connections
SELECT 
  count(*) FILTER (WHERE state = 'active') as active,
  count(*) FILTER (WHERE state = 'idle') as idle,
  count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
  count(*) as total
FROM pg_stat_activity
WHERE datname = current_database();

\echo ''

-- Max connections setting
SHOW max_connections;

\echo ''

-- ============================================
-- TEST 6: Cache Hit Ratio
-- ============================================
\echo '=== TEST 6: CACHE HIT RATIO ==='
\echo ''

SELECT
  'Cache Hit Ratio' as metric,
  ROUND(
    100.0 * sum(blks_hit) / NULLIF(sum(blks_hit + blks_read), 0),
    2
  ) || '%' as value
FROM pg_stat_database
WHERE datname = current_database();

\echo ''

-- ============================================
-- TEST 7: Table Statistics
-- ============================================
\echo '=== TEST 7: TABLE STATISTICS ==='
\echo ''

SELECT
  schemaname || '.' || tablename as table_name,
  n_live_tup as live_tuples,
  n_dead_tup as dead_tuples,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

\echo ''

-- ============================================
-- TEST 8: Lock Analysis
-- ============================================
\echo '=== TEST 8: LOCK ANALYSIS ==='
\echo ''

SELECT
  locktype,
  relation::regclass,
  mode,
  transactionid AS tid,
  pid,
  granted
FROM pg_locks
WHERE NOT granted
ORDER BY relation;

\echo ''

-- ============================================
-- CLEANUP: Remove test data
-- ============================================
\echo '=== CLEANUP: REMOVING TEST DATA ==='
\echo ''

DELETE FROM gps_logs WHERE shipment_id LIKE 'SH-PERF-%';
DELETE FROM shipments WHERE id LIKE 'SH-PERF-%';
DELETE FROM bids WHERE id LIKE 'BD-PERF-%';
DELETE FROM bookings WHERE id LIKE 'BK-PERF-%';

\echo 'Test data cleaned up'
\echo ''

-- ============================================
-- SUMMARY
-- ============================================
\echo '=== DATABASE PERFORMANCE TEST COMPLETE ==='
\echo ''
\echo 'Review the timing information above for each query.'
\echo 'Expected performance:'
\echo '  - Simple SELECT: < 10ms'
\echo '  - JOIN queries: < 50ms'
\echo '  - Aggregations: < 100ms'
\echo '  - JSONB queries: < 100ms'
\echo ''
\echo 'If queries are slower:'
\echo '  1. Check if indexes exist'
\echo '  2. Run ANALYZE to update statistics'
\echo '  3. Consider adding new indexes'
\echo '  4. Review query execution plans with EXPLAIN ANALYZE'
\echo ''

