# 📊 MONITORING & OBSERVABILITY SETUP GUIDE

**Complete monitoring infrastructure for Rodistaa platform**

---

## 🎯 Overview

**This guide sets up comprehensive monitoring for:**
- Backend API (Express + Node.js)
- PostgreSQL Database
- Redis Cache
- Admin Portal (Next.js)
- Franchise Portal (Next.js)
- Mobile Apps (React Native)
- Design System Automation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              APPLICATION LAYER                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Backend  │  │ Portal   │  │  Mobile  │      │
│  │   API    │  │  Admin   │  │   Apps   │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│         │             │             │            │
│         └─────────────┴─────────────┘            │
│                     │                             │
├─────────────────────┼─────────────────────────────┤
│              METRICS COLLECTION                  │
│  ┌──────────────────▼──────────────────┐        │
│  │   Prometheus (Metrics Storage)       │        │
│  └──────────────────┬──────────────────┘        │
├─────────────────────┼─────────────────────────────┤
│              VISUALIZATION                       │
│  ┌──────────────────▼──────────────────┐        │
│  │   Grafana (Dashboards + Alerts)     │        │
│  └──────────────────────────────────────┘        │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Quick Setup

### **Option 1: Docker Compose (Recommended)**

```bash
# From repo root
cd C:\Users\devel\Desktop\Rodistaa

# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Verify
docker ps | grep -E "prometheus|grafana"

# Access dashboards
# Grafana: http://localhost:3000 (admin/rodistaa123)
# Prometheus: http://localhost:9090
```

### **Option 2: Manual Setup**

See detailed instructions below.

---

## 📦 Components

### **1. Prometheus** (Metrics Collection)
- **Purpose**: Time-series metrics database
- **Port**: 9090
- **Config**: `monitoring/prometheus/prometheus.yml`
- **Data**: Stored in `monitoring/prometheus/data/`

### **2. Grafana** (Visualization)
- **Purpose**: Dashboards and alerting
- **Port**: 3000
- **Login**: admin / rodistaa123
- **Dashboards**: `monitoring/grafana/dashboards/`

### **3. Application Exporters**
- **Node.js**: `prom-client` library
- **PostgreSQL**: `postgres_exporter`
- **Redis**: `redis_exporter`

---

## 🔧 Installation Steps

### **Step 1: Install Dependencies**

```bash
# Backend metrics
cd packages/backend
pnpm add prom-client express-prom-bundle

# Database exporter
# (Docker image: quay.io/prometheuscommunity/postgres-exporter)

# Redis exporter  
# (Docker image: oliver006/redis_exporter)
```

### **Step 2: Configure Prometheus**

Create `monitoring/prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'rodistaa-production'
    region: 'ap-south-1'

scrape_configs:
  # Backend API
  - job_name: 'rodistaa-backend'
    static_configs:
      - targets: ['host.docker.internal:4000']
        labels:
          service: 'backend-api'
          environment: 'production'
    metrics_path: '/metrics'
    scrape_interval: 10s

  # PostgreSQL
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
        labels:
          service: 'database'
          environment: 'production'

  # Redis
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
        labels:
          service: 'cache'
          environment: 'production'

  # Admin Portal (if metrics enabled)
  - job_name: 'admin-portal'
    static_configs:
      - targets: ['host.docker.internal:3001']
        labels:
          service: 'admin-portal'
          environment: 'production'
    metrics_path: '/api/metrics'

  # Franchise Portal
  - job_name: 'franchise-portal'
    static_configs:
      - targets: ['host.docker.internal:3002']
        labels:
          service: 'franchise-portal'
          environment: 'production'
    metrics_path: '/api/metrics'

alerting:
  alertmanagers:
    - static_configs:
        - targets: []

rule_files:
  - '/etc/prometheus/rules/*.yml'
```

### **Step 3: Configure Grafana**

Create `monitoring/grafana/provisioning/datasources/prometheus.yml`:

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
```

### **Step 4: Backend Metrics Integration**

Update `packages/backend/src/server.ts`:

```typescript
import promClient from 'prom-client';
import promBundle from 'express-prom-bundle';

// Create registry
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5]
});

const bookingCounter = new promClient.Counter({
  name: 'rodistaa_bookings_total',
  help: 'Total number of bookings created',
  labelNames: ['status']
});

const activeUsersGauge = new promClient.Gauge({
  name: 'rodistaa_active_users',
  help: 'Number of currently active users',
  labelNames: ['role']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(bookingCounter);
register.registerMetric(activeUsersGauge);

// Middleware
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: { service: 'rodistaa-backend' },
  promClient: { collectDefaultMetrics: {} }
});

app.use(metricsMiddleware);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Use metrics in business logic
app.post('/api/bookings', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Create booking logic
    const booking = await createBooking(req.body);
    
    // Increment counter
    bookingCounter.inc({ status: 'success' });
    
    // Record duration
    httpRequestDuration.observe(
      { method: 'POST', route: '/api/bookings', status_code: '201' },
      (Date.now() - startTime) / 1000
    );
    
    res.status(201).json(booking);
  } catch (error) {
    bookingCounter.inc({ status: 'error' });
    httpRequestDuration.observe(
      { method: 'POST', route: '/api/bookings', status_code: '500' },
      (Date.now() - startTime) / 1000
    );
    res.status(500).json({ error: error.message });
  }
});
```

### **Step 5: Docker Compose Configuration**

Update `docker-compose.monitoring.yml`:

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: rodistaa-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./monitoring/prometheus/rules:/etc/prometheus/rules
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    restart: unless-stopped
    networks:
      - rodistaa-network

  grafana:
    image: grafana/grafana:latest
    container_name: rodistaa-grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=rodistaa123
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
      - grafana-data:/var/lib/grafana
    restart: unless-stopped
    networks:
      - rodistaa-network
    depends_on:
      - prometheus

  postgres-exporter:
    image: quay.io/prometheuscommunity/postgres-exporter:latest
    container_name: rodistaa-postgres-exporter
    ports:
      - "9187:9187"
    environment:
      DATA_SOURCE_NAME: "postgresql://rodistaa:rodistaa123@host.docker.internal:5432/rodistaa?sslmode=disable"
    restart: unless-stopped
    networks:
      - rodistaa-network

  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: rodistaa-redis-exporter
    ports:
      - "9121:9121"
    environment:
      REDIS_ADDR: "host.docker.internal:6379"
    restart: unless-stopped
    networks:
      - rodistaa-network

volumes:
  prometheus-data:
  grafana-data:

networks:
  rodistaa-network:
    name: rodistaa-network
    driver: bridge
```

---

## 📈 Grafana Dashboards

### **Dashboard 1: System Overview**

Create `monitoring/grafana/dashboards/system-overview.json`:

```json
{
  "dashboard": {
    "title": "Rodistaa - System Overview",
    "panels": [
      {
        "title": "API Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "API Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      },
      {
        "title": "Active Users",
        "targets": [
          {
            "expr": "rodistaa_active_users",
            "legendFormat": "{{role}}"
          }
        ]
      }
    ]
  }
}
```

### **Dashboard 2: Business Metrics**

```json
{
  "dashboard": {
    "title": "Rodistaa - Business Metrics",
    "panels": [
      {
        "title": "Bookings Created (Hourly)",
        "targets": [
          {
            "expr": "increase(rodistaa_bookings_total{status=\"success\"}[1h])",
            "legendFormat": "Successful bookings"
          }
        ]
      },
      {
        "title": "KYC Queue Length",
        "targets": [
          {
            "expr": "rodistaa_kyc_pending_count",
            "legendFormat": "Pending verifications"
          }
        ]
      },
      {
        "title": "ACS Alerts (Daily)",
        "targets": [
          {
            "expr": "increase(rodistaa_acs_alerts_total[24h])",
            "legendFormat": "Fraud alerts"
          }
        ]
      }
    ]
  }
}
```

---

## 🚨 Alert Rules

Create `monitoring/prometheus/rules/alerts.yml`:

```yaml
groups:
  - name: rodistaa_critical
    interval: 30s
    rules:
      # API Down
      - alert: APIDown
        expr: up{job="rodistaa-backend"} == 0
        for: 30s
        labels:
          severity: critical
        annotations:
          summary: "Backend API is down"
          description: "The Rodistaa backend API has been down for more than 30 seconds."

      # High Error Rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} over the last 5 minutes."

      # Slow Response Time
      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API response time is slow"
          description: "95th percentile response time is {{ $value }}s."

      # Database Connection Issues
      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 30s
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is down"
          description: "Cannot connect to PostgreSQL database."

      # High Memory Usage
      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes / 1024 / 1024 / 1024 > 4
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Backend is using {{ $value }}GB of memory."

      # Redis Down
      - alert: RedisDown
        expr: up{job="redis"} == 0
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Redis is down"
          description: "Cannot connect to Redis cache."
```

---

## 📊 Key Metrics to Track

### **Application Metrics**
```
http_requests_total                 # Total HTTP requests
http_request_duration_seconds       # Request latency
rodistaa_bookings_total             # Bookings created
rodistaa_active_users               # Active user count
rodistaa_kyc_pending_count          # KYC queue length
rodistaa_acs_alerts_total           # Fraud alerts
```

### **System Metrics**
```
process_cpu_seconds_total           # CPU usage
process_resident_memory_bytes       # Memory usage
nodejs_eventloop_lag_seconds        # Event loop lag
nodejs_active_handles               # Active handles
```

### **Database Metrics**
```
pg_up                               # PostgreSQL up/down
pg_stat_database_tup_fetched        # Rows fetched
pg_stat_database_tup_inserted       # Rows inserted
pg_stat_database_conflicts          # Conflicts
pg_stat_database_deadlocks          # Deadlocks
```

### **Redis Metrics**
```
redis_up                            # Redis up/down
redis_connected_clients             # Connected clients
redis_used_memory_bytes             # Memory usage
redis_commands_processed_total      # Commands executed
```

---

## 🔍 Testing Monitoring Setup

```bash
# 1. Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# 2. Verify Prometheus
curl http://localhost:9090/-/healthy
# Expected: "Prometheus is Healthy."

# 3. Verify Grafana
curl http://localhost:3000/api/health
# Expected: {"database": "ok"}

# 4. Check backend metrics
curl http://localhost:4000/metrics
# Expected: Prometheus format metrics

# 5. Generate test traffic
for i in {1..100}; do
  curl http://localhost:4000/health
done

# 6. View metrics in Grafana
# Open: http://localhost:3000
# Login: admin / rodistaa123
# Import dashboards from monitoring/grafana/dashboards/
```

---

## 🎯 Production Deployment

### **AWS CloudWatch Integration** (Production)

```bash
# Install CloudWatch agent
# Configure with monitoring/cloudwatch/config.json

# Push metrics to CloudWatch
# CloudWatch Logs for application logs
# CloudWatch Metrics for system metrics
# CloudWatch Alarms for alerting
```

### **Alerting Channels**

```yaml
# Slack
webhook_url: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Email
smtp_server: smtp.gmail.com
smtp_from: alerts@rodistaa.com

# PagerDuty (for critical alerts)
integration_key: YOUR_PAGERDUTY_KEY
```

---

## ✅ Verification Checklist

- [ ] Prometheus running on port 9090
- [ ] Grafana running on port 3000
- [ ] Backend metrics endpoint `/metrics` working
- [ ] PostgreSQL exporter collecting metrics
- [ ] Redis exporter collecting metrics
- [ ] Grafana dashboards imported
- [ ] Alert rules configured
- [ ] Test alerts firing correctly
- [ ] Team trained on dashboard usage
- [ ] On-call rotation configured

---

## 📚 Resources

- **Prometheus Docs**: https://prometheus.io/docs/
- **Grafana Docs**: https://grafana.com/docs/
- **Express Metrics**: https://github.com/joao-fontenele/express-prometheus-middleware
- **Prom Client**: https://github.com/siimon/prom-client

---

**Status**: ✅ **READY TO DEPLOY**  
**Next**: Execute monitoring setup during Week 2 launch!

---

*Monitoring Setup Guide v1.0*  
*December 3, 2025*

