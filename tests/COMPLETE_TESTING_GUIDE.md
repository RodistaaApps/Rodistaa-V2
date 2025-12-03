# 🧪 Complete Testing Guide - Booking Flow & Stress Tests

Comprehensive guide for testing the complete booking flow and conducting aggressive stress tests.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Complete Booking Flow Test](#complete-booking-flow-test)
3. [Aggressive Stress Testing](#aggressive-stress-testing)
4. [Known Issues & Solutions](#known-issues--solutions)
5. [Performance Optimization](#performance-optimization)

---

## ✅ Prerequisites

### Required Services Running
```bash
# 1. Start PostgreSQL
docker run -d -p 5432:5432 \
  -e POSTGRES_USER=rodistaa \
  -e POSTGRES_PASSWORD=rodistaa123 \
  -e POSTGRES_DB=rodistaa \
  postgres:15

# 2. Start Redis
docker run -d -p 6379:6379 redis:7

# 3. Start Backend
cd packages/backend
pnpm install
pnpm dev

# Backend should be running on http://localhost:4000
```

### Install Testing Tools
```bash
# K6 for stress testing
# Windows (Chocolatey)
choco install k6

# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | \
  sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

---

## 🔄 Complete Booking Flow Test

### Test Coverage
The integration test covers the complete lifecycle:
1. **Booking Creation** (Shipper)
2. **Publish to Load Board**
3. **Bidding** (Operator)
4. **Bid Acceptance** (Shipper)
5. **Shipment Creation**
6. **GPS Tracking** (Driver)
7. **POD Upload** (Driver)
8. **POD Verification** (Shipper)
9. **Payment Processing**

### Run Integration Test

```bash
cd C:\Users\devel\Desktop\Rodistaa

# Install dependencies
cd packages/backend
pnpm install

# Ensure test environment
$env:NODE_ENV="test"
$env:API_BASE_URL="http://localhost:4000/v1"

# Run the complete flow test
npx jest tests/integration/complete-booking-flow.test.ts --verbose
```

### Expected Output
```
✓ Step 1: Create Booking (Shipper)
  ✓ should create a new booking
  ✓ should publish booking to load board
  
✓ Step 2: Bidding (Operator)
  ✓ should view published booking on load board
  ✓ should place a bid on the booking
  
✓ Step 3: Accept Bid (Shipper)
  ✓ should list bids for booking
  ✓ should accept the bid
  ✓ should verify booking status changed to CONFIRMED
  ✓ should create shipment after bid acceptance
  
✓ Step 4: Shipment Tracking (Driver)
  ✓ should view assigned shipment
  ✓ should update shipment status to IN_TRANSIT
  ✓ should send GPS location updates
  
✓ Step 5: Proof of Delivery (Driver)
  ✓ should reach destination
  ✓ should upload POD document
  ✓ should mark shipment as DELIVERED
  
✓ Step 6: Verify POD (Shipper)
  ✓ should view POD documents
  ✓ should accept POD
  
✓ Step 7: Payment
  ✓ should process payment
  ✓ should verify booking status changed to COMPLETED
  
Test Summary:
  Booking ID: BK-XXXXX
  Bid ID: BD-XXXXX
  Shipment ID: SH-XXXXX
  All steps completed successfully!
```

---

## 💪 Aggressive Stress Testing

### Test Scenarios

The aggressive stress test simulates:
- **500 concurrent users** (sustained)
- **1000 concurrent users** (spike)
- **1500 concurrent users** (extreme)
- Multiple roles (Shipper, Operator, Driver)
- Real-world user behaviors
- Mixed operations (booking creation, bidding, GPS updates)

### Test Configuration

```javascript
Stages:
1. Ramp Up: 0→500 users (7 minutes)
2. Peak Load: 500 users sustained (10 minutes)
3. Spike Test: 500→1000 users (30 seconds)
4. Spike Hold: 1000 users sustained (5 minutes)
5. Extreme Stress: 1000→1500 users (1 minute)
6. Extreme Hold: 1500 users sustained (3 minutes)
7. Recovery: 1500→0 users (5 minutes)

Total Duration: ~32 minutes
```

### Run Stress Test

```bash
cd C:\Users\devel\Desktop\Rodistaa

# Basic run (against localhost)
k6 run tests/stress/aggressive-stress-test.js

# Custom target URL
k6 run -e BASE_URL=https://api-staging.rodistaa.com \
  tests/stress/aggressive-stress-test.js

# With output to file
k6 run tests/stress/aggressive-stress-test.js \
  --out json=stress-results.json

# With specific duration
k6 run tests/stress/aggressive-stress-test.js \
  --duration 15m --vus 1000
```

### Monitoring During Stress Test

#### Monitor Backend Logs
```bash
# In separate terminal
cd packages/backend
pnpm dev

# Watch for errors
tail -f logs/backend.log | grep ERROR
```

#### Monitor Database
```bash
# Connect to PostgreSQL
psql -h localhost -U rodistaa -d rodistaa

# Check active connections
SELECT count(*), state FROM pg_stat_activity GROUP BY state;

# Check slow queries
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '1 second';

# Check database size
SELECT pg_size_pretty(pg_database_size('rodistaa'));
```

#### Monitor System Resources
```powershell
# CPU and Memory (Windows)
while ($true) {
    $cpu = (Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue
    $mem = (Get-Counter '\Memory\Available MBytes').CounterSamples.CookedValue
    Write-Host "CPU: $($cpu.ToString('0.00'))% | Memory Available: $mem MB"
    Start-Sleep -Seconds 2
}
```

### Expected Performance Metrics

#### Target Metrics
| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Request Duration (avg) | < 500ms | > 1000ms | > 2000ms |
| Request Duration (p95) | < 1000ms | > 2000ms | > 5000ms |
| Error Rate | < 1% | > 5% | > 10% |
| Booking Creation Success | > 95% | < 90% | < 85% |
| Bid Placement Success | > 95% | < 90% | < 85% |
| GPS Update Success | > 98% | < 95% | < 90% |

#### Acceptable Results
```
✓ PASS: All thresholds passed
  - Avg response time: 450ms
  - p95 response time: 850ms
  - Error rate: 0.8%
  - Booking success: 97%
  - System stable under 500 users
```

#### Warning Results
```
⚠ WARNING: Some thresholds failed
  - Avg response time: 1200ms
  - p95 response time: 2500ms
  - Error rate: 3.2%
  - Database connections high (80%)
  - Consider optimization
```

#### Critical Results
```
✗ CRITICAL: Multiple failures
  - Avg response time: 3000ms
  - p95 response time: 8000ms
  - Error rate: 12%
  - Database connection pool exhausted
  - IMMEDIATE ACTION REQUIRED
```

---

## 🐛 Known Issues & Solutions

### Issue 1: High Database Connection Count

**Symptoms:**
- "Too many connections" errors
- Slow query performance
- Connection timeout errors

**Solution:**
```javascript
// packages/backend/src/db/connection.ts
// Increase connection pool
const pool = {
  min: 10,
  max: 100, // Increase from default 20
  acquireTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
};
```

### Issue 2: JWT Token Expiry During Test

**Symptoms:**
- 401 Unauthorized errors
- Authentication failures mid-test

**Solution:**
```javascript
// Extend JWT expiry for testing
JWT_EXPIRES_IN=7200000  // 2 hours instead of 1
```

### Issue 3: GPS Update Rate Limiting

**Symptoms:**
- GPS updates rejected
- 429 Too Many Requests

**Solution:**
```javascript
// Disable/increase rate limiting for testing
RATE_LIMIT_ENABLED=false
// OR
RATE_LIMIT_MAX=1000  // Increase from 100
```

### Issue 4: Slow Booking Creation

**Symptoms:**
- Booking creation > 2 seconds
- Database query timeouts

**Solution:**
```sql
-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_bookings_shipper_status 
ON bookings(shipper_id, status);

CREATE INDEX IF NOT EXISTS idx_bookings_created 
ON bookings(created_at DESC);
```

### Issue 5: Memory Leaks

**Symptoms:**
- Increasing memory usage
- Backend crashes after extended tests

**Solution:**
```javascript
// Check for unclosed connections
// Ensure proper cleanup in error handlers
try {
  // ... operations
} finally {
  // Always close connections
  await connection.release();
}
```

---

## ⚡ Performance Optimization

### Database Optimization

#### Add Indexes
```sql
-- Bookings
CREATE INDEX CONCURRENTLY idx_bookings_status_created 
ON bookings(status, created_at DESC);

CREATE INDEX CONCURRENTLY idx_bookings_shipper_status 
ON bookings(shipper_id, status);

-- Bids
CREATE INDEX CONCURRENTLY idx_bids_booking_status 
ON bids(booking_id, status);

-- Shipments
CREATE INDEX CONCURRENTLY idx_shipments_status 
ON shipments(status);

-- GPS Logs
CREATE INDEX CONCURRENTLY idx_gps_shipment_time 
ON gps_logs(shipment_id, timestamp DESC);
```

#### Connection Pooling
```javascript
// packages/backend/src/db/connection.ts
const config = {
  client: 'pg',
  connection: {
    // ... connection details
  },
  pool: {
    min: 10,
    max: 100,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
  },
};
```

### API Optimization

#### Enable Caching
```javascript
// Add Redis caching for load board
import redis from 'redis';

const cache = redis.createClient({ url: process.env.REDIS_URL });

// Cache load board results
async function getLoadBoard() {
  const cacheKey = 'load-board:latest';
  const cached = await cache.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = await db.query('SELECT * FROM bookings WHERE status = ?', ['PUBLISHED']);
  await cache.setEx(cacheKey, 60, JSON.stringify(data)); // Cache 60s
  
  return data;
}
```

#### Add Rate Limiting Per User
```javascript
// More granular rate limiting
const rateLimit = {
  global: 1000,  // 1000 req/min globally
  perUser: 100,  // 100 req/min per user
  perIP: 200,    // 200 req/min per IP
};
```

### Backend Optimization

#### Use Batch Inserts
```javascript
// Instead of individual inserts
for (const gps of gpsUpdates) {
  await db.insert('gps_logs', gps);
}

// Use batch insert
await db.batchInsert('gps_logs', gpsUpdates, 100);
```

#### Async Processing
```javascript
// Move heavy operations to background jobs
import { Queue } from 'bull';

const podQueue = new Queue('pod-processing', process.env.REDIS_URL);

// Queue POD processing instead of blocking
podQueue.add({ shipmentId, documents }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
});
```

---

## 📊 Test Results Analysis

### Generate Report
```bash
# Run test with JSON output
k6 run tests/stress/aggressive-stress-test.js \
  --out json=results.json

# Analyze results
node scripts/analyze-test-results.js results.json
```

### Key Metrics to Review

1. **HTTP Request Duration**
   - Average should be < 500ms
   - p95 should be < 1000ms
   - p99 should be < 2000ms

2. **Error Rate**
   - Should be < 1%
   - Check error types in logs

3. **Throughput**
   - Requests per second
   - Successful transactions per second

4. **Resource Usage**
   - CPU utilization
   - Memory usage
   - Database connections
   - Disk I/O

---

## ✅ Pre-Production Checklist

Before running stress tests on staging/production:

- [ ] Backup database
- [ ] Notify team of testing schedule
- [ ] Set up monitoring dashboards
- [ ] Prepare rollback plan
- [ ] Have on-call engineer ready
- [ ] Test during off-peak hours
- [ ] Start with lower load and gradually increase
- [ ] Monitor logs in real-time
- [ ] Have database performance monitoring enabled
- [ ] Document all findings

---

## 🚨 Emergency Procedures

### If Test Causes System Issues

1. **Stop the test immediately**
   ```bash
   # Press Ctrl+C or
   killall k6
   ```

2. **Check system status**
   ```bash
   # Backend health
   curl http://localhost:4000/health
   
   # Database connections
   psql -c "SELECT count(*) FROM pg_stat_activity;"
   ```

3. **If needed, restart services**
   ```bash
   # Restart backend
   cd packages/backend
   pnpm dev
   
   # Restart database (if needed)
   docker restart postgres-container
   ```

4. **Clear any stuck processes**
   ```sql
   -- Kill idle connections
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'idle' AND state_change < NOW() - INTERVAL '5 minutes';
   ```

---

## 📝 Reporting Issues

When reporting issues found during testing:

```markdown
## Issue Title
Brief description

### Steps to Reproduce
1. Start services
2. Run stress test with X users
3. Observe Y behavior

### Expected Behavior
What should happen

### Actual Behavior
What actually happened

### Environment
- OS: Windows/Linux/macOS
- Node version: X.X.X
- Database: PostgreSQL X.X
- Test load: XXX concurrent users

### Logs
```
Relevant error logs
```

### Performance Metrics
- Response time: XXXms
- Error rate: X%
- Resource usage: XX%
```

---

**Happy Testing! 🧪**

*For questions, contact the DevOps team or refer to the troubleshooting section.*

