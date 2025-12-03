# 📊 Performance & Load Testing

Comprehensive guide for running performance and load tests on Rodistaa platform.

---

## Prerequisites

### Install K6
```bash
# Windows (using Chocolatey)
choco install k6

# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

---

## Running Load Tests

### 1. Basic Load Test (Staging)
```bash
k6 run tests/load/k6-load-test.js
```

### 2. Custom Configuration
```bash
# Run with custom base URL
k6 run -e BASE_URL=https://api-staging.rodistaa.com tests/load/k6-load-test.js

# Run with specific VUs and duration
k6 run --vus 100 --duration 10m tests/load/k6-load-test.js

# Run with custom stages
k6 run --stage 1m:50,3m:100,1m:0 tests/load/k6-load-test.js
```

### 3. Generate HTML Report
```bash
# Run test and save results
k6 run --out json=results.json tests/load/k6-load-test.js

# Convert to HTML (requires k6-reporter)
npm install -g k6-to-junit
k6-to-junit results.json > results.xml
```

---

## Test Scenarios

### Scenario 1: Normal Load (50 users)
**Duration**: 10 minutes  
**Expected**:
- Avg response time: < 300ms
- P95 response time: < 500ms
- Error rate: < 1%

```bash
k6 run --vus 50 --duration 10m tests/load/k6-load-test.js
```

---

### Scenario 2: Peak Load (200 users)
**Duration**: 15 minutes  
**Expected**:
- Avg response time: < 500ms
- P95 response time: < 1000ms
- Error rate: < 2%

```bash
k6 run --vus 200 --duration 15m tests/load/k6-load-test.js
```

---

### Scenario 3: Stress Test (500 users)
**Duration**: 20 minutes  
**Goal**: Find breaking point

```bash
k6 run --vus 500 --duration 20m tests/load/k6-load-test.js
```

---

### Scenario 4: Spike Test
**Pattern**: Sudden spike from 50 to 500 users

```bash
k6 run --stage 2m:50,1m:500,5m:500,2m:0 tests/load/k6-load-test.js
```

---

### Scenario 5: Soak Test (24 hours)
**Goal**: Test for memory leaks and stability

```bash
k6 run --vus 100 --duration 24h tests/load/k6-load-test.js
```

---

## Interpreting Results

### Key Metrics

#### 1. **http_req_duration**
- **avg**: Average request duration
- **p(95)**: 95th percentile (95% of requests faster than this)
- **p(99)**: 99th percentile
- **Target**: avg < 300ms, p(95) < 500ms, p(99) < 1000ms

#### 2. **http_req_failed**
- **rate**: Percentage of failed requests
- **Target**: < 1% for production

#### 3. **http_reqs**
- **count**: Total number of requests
- **rate**: Requests per second

#### 4. **Custom Metrics**
- **successful_logins**: Total successful authentications
- **successful_bookings**: Total bookings created
- **api_latency**: API-specific latency
- **errors**: Custom error rate

---

## Sample Output

```
=============================================================
LOAD TEST SUMMARY
=============================================================

HTTP Metrics:
  Total Requests: 125,430
  Failed Requests: 234 (0.19%)
  Request Duration (avg): 287.45ms
  Request Duration (p95): 458.23ms
  Request Duration (p99): 892.12ms

Custom Metrics:
  Successful Logins: 1,234
  Successful Bookings: 5,678
  Error Rate: 0.45%

Thresholds:
  ✓ PASS: p(95)<500
  ✓ PASS: p(99)<1000
  ✓ PASS: rate<0.01
  ✓ PASS: rate<0.05

=============================================================
```

---

## Monitoring During Tests

### 1. Grafana Dashboard
- Open: https://grafana-staging.rodistaa.com
- View real-time metrics:
  - CPU usage
  - Memory usage
  - Database connections
  - Request rate
  - Error rate

### 2. AWS CloudWatch
```bash
# CPU utilization
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=rodistaa-backend-staging \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T01:00:00Z \
  --period 300 \
  --statistics Average
```

### 3. Database Performance
```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Slow queries
SELECT query, state, wait_event_type, wait_event
FROM pg_stat_activity
WHERE state != 'idle'
AND query_start < NOW() - INTERVAL '5 seconds';

-- Table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Performance Benchmarks

### Backend API

| Endpoint | Method | Avg (ms) | P95 (ms) | P99 (ms) |
|----------|--------|----------|----------|----------|
| /health | GET | 5 | 10 | 15 |
| /v1/auth/login | POST | 150 | 250 | 400 |
| /v1/bookings | GET | 100 | 200 | 350 |
| /v1/bookings | POST | 250 | 450 | 700 |
| /v1/load-board | GET | 200 | 400 | 600 |
| /v1/tracking/gps | POST | 50 | 100 | 150 |

### Database Queries

| Query Type | Avg (ms) | P95 (ms) |
|------------|----------|----------|
| SELECT (simple) | 5 | 15 |
| SELECT (join) | 20 | 50 |
| INSERT | 10 | 30 |
| UPDATE | 15 | 40 |

---

## Optimization Tips

### If Response Times Are Slow:

1. **Database**:
   - Add indexes on frequently queried columns
   - Use connection pooling
   - Optimize slow queries

2. **Backend**:
   - Implement caching (Redis)
   - Use async/await properly
   - Reduce payload sizes

3. **Infrastructure**:
   - Scale horizontally (add more instances)
   - Use CDN for static assets
   - Enable gzip compression

### If Error Rate Is High:

1. **Check Logs**:
   ```bash
   # View backend logs
   aws logs tail /aws/rodistaa/staging/backend --follow
   ```

2. **Check Database**:
   - Connection pool exhaustion?
   - Lock contention?
   - Disk space full?

3. **Check Network**:
   - Timeout issues?
   - Rate limiting triggered?
   - Load balancer healthy?

---

## Troubleshooting

### Issue: "Connection Refused"
**Solution**: Ensure service is running and accessible

```bash
curl -I https://api-staging.rodistaa.com/health
```

### Issue: "Rate Limit Exceeded"
**Solution**: Increase rate limit or reduce VUs

```bash
# Check rate limit in backend config
echo $RATE_LIMIT_MAX
```

### Issue: "Database Connection Error"
**Solution**: Check connection pool settings

```javascript
// Increase pool size in backend config
PGMAXCONNECTIONS=100
```

---

## Next Steps

After load testing:

1. ✅ Analyze results
2. ✅ Identify bottlenecks
3. ✅ Optimize code/infrastructure
4. ✅ Re-run tests to validate improvements
5. ✅ Document findings

---

**Questions?** Contact DevOps or Performance Engineering team.

