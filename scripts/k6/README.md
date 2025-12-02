# K6 Load Testing Scripts

Performance and load testing scripts for Rodistaa Platform using K6.

## Prerequisites

```bash
# Install K6
# Windows
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

## Running Tests

### Small Load Test (100 VUs, 5 minutes)
```bash
k6 run -o json=reports/k6_small.json scripts/k6/booking_flow.js \
  --vus 100 \
  --duration 5m
```

### Medium Load Test (500 VUs, 10 minutes)
```bash
k6 run -o json=reports/k6_medium.json scripts/k6/booking_flow.js \
  --vus 500 \
  --duration 10m
```

### Large Load Test (1000 VUs, 15 minutes)
```bash
k6 run -o json=reports/k6_large.json scripts/k6/booking_flow.js \
  --vus 1000 \
  --duration 15m
```

### Stress Test (Find Breaking Point)
```bash
k6 run scripts/k6/booking_flow.js \
  --stage 1m:100 \
  --stage 2m:500 \
  --stage 2m:1000 \
  --stage 2m:2000 \
  --stage 1m:0
```

## Test Scenarios

### booking_flow.js
**Flow**: Complete booking lifecycle
1. Shipper login
2. Create booking
3. Operator login
4. Place bid
5. Retrieve bids
6. Accept bid (optional)

**Metrics**:
- Booking creation duration (p95, p99)
- Bid placement duration (p95, p99)
- Error rate
- Request success rate

**Thresholds**:
- p95 < 500ms
- p99 < 1000ms
- Error rate < 1%

## Results Analysis

### View Results
```bash
# Summary
k6 run --summary-export=reports/summary.json scripts/k6/booking_flow.js

# View JSON results
cat reports/k6_small.json | jq
```

### Key Metrics to Review
- `http_req_duration`: Response times (p50, p95, p99)
- `http_req_failed`: Request failure rate
- `errors`: Application error rate
- `booking_creation_duration`: Booking creation latency
- `bid_placement_duration`: Bid placement latency
- `bookings_created`: Total bookings created
- `bids_placed`: Total bids placed

### Capacity Recommendations

Based on test results, recommend:
- **CPU**: If >70% utilization, add nodes
- **Memory**: If >80% utilization, increase limits
- **Database**: If connection pool exhausted, scale up
- **Redis**: If cache hit rate <80%, increase size

## Environment Variables

```bash
export API_URL=http://localhost:4000/v1
k6 run scripts/k6/booking_flow.js
```

## CI Integration

```yaml
# .github/workflows/load-test.yml
- name: Run K6 Load Test
  run: |
    k6 run -o json=reports/k6.json scripts/k6/booking_flow.js \
      --vus 100 \
      --duration 2m
```

## Targets

### Staging
- VUs: 100
- Duration: 5 minutes
- p99: <1000ms
- Error rate: <1%

### Production
- VUs: 500
- Duration: 10 minutes
- p99: <500ms
- Error rate: <0.1%

## Troubleshooting

### High Latency
- Check database query performance
- Review slow query logs
- Add database indexes
- Optimize API endpoints

### High Error Rate
- Check application logs
- Review error responses
- Verify database connections
- Check rate limiting

### Capacity Issues
- Increase pod replicas
- Scale database instance
- Add Redis caching
- Enable CDN

