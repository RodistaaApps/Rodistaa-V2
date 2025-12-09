# Monitoring & Metrics

## Prometheus Metrics

### Driver Metrics

```prometheus
# DL Expiry
rodistaa.driver.dl_expiry_count{gauge}
  - Count of drivers with DL expiring in 7/30 days

# Driver Creation
rodistaa.driver.created_total{counter}
  - Total drivers created

# Driver Flags
rodistaa.driver.flags.created_total{flag_code,severity}
  - Flags created by type and severity
  - flag_code: DL_EXPIRED, DL_EXPIRING_SOON, MEDICAL_EXPIRED, etc.
```

### Assignment Metrics

```prometheus
# Assignment Creation
rodistaa.assignment.created_total{counter}
  - Total assignments created

# Assignment Conflicts
rodistaa.assignment.conflict_count{counter}
  - Assignment conflicts detected

# Force Assignments
rodistaa.assignment.force_assign_count{counter}
  - HQ/admin force assignments

# Assignment Duration
rodistaa.assignment.duration_seconds{histogram}
  - Assignment duration distribution
```

### Availability Metrics

```prometheus
# Availability Blocks
rodistaa.driver.availability.blocks_created_total{counter}
  - Driver availability blocks created

# Active Blocks
rodistaa.driver.availability.active_blocks{gauge}
  - Currently active availability blocks
```

### Document Metrics

```prometheus
# Document Uploads
rodistaa.driver.documents.uploaded_total{doc_type}
  - Documents uploaded by type
  - doc_type: DL_SCAN, MEDICAL_CERT, etc.

# Expiring Documents
rodistaa.driver.documents.expiring_count{doc_type}
  - Documents expiring in 30 days
```

### Notification Metrics

```prometheus
# Notifications Sent
rodistaa.notification.sent_total{type,status}
  - Notifications sent (SMS/push)
  - type: ASSIGNMENT, UNASSIGNMENT, REMINDER
  - status: success, failure

# Notification Failures
rodistaa.notification.failed_total{type}
  - Failed notification attempts
```

## Grafana Dashboards

### Driver Management Dashboard

**Panels:**
1. Total Drivers (gauge)
2. Active Drivers (gauge)
3. Drivers with Expiring DL (gauge)
4. Driver Creation Rate (graph)
5. Flag Count by Type (pie chart)
6. Document Upload Rate (graph)

### Assignment Dashboard

**Panels:**
1. Active Assignments (gauge)
2. Assignments Created Today (gauge)
3. Conflict Rate (graph)
4. Force Assign Count (graph)
5. Average Assignment Duration (graph)
6. Assignments by Status (pie chart)

### Alerting Dashboard

**Panels:**
1. DL Expiry Warnings (>100 in 7 days)
2. Assignment Conflicts (spike detection)
3. Force Assign Spike
4. Notification Failure Rate
5. Document Expiry Warnings

## Alert Rules

### Critical Alerts

```yaml
# DL Expiry Warning
- alert: HighDLExpiryWarning
  expr: rodistaa.driver.dl_expiry_count > 100
  for: 1h
  annotations:
    summary: "More than 100 drivers have DL expiring in 7 days"
    description: "{{ $value }} drivers need DL renewal attention"

# Assignment Conflict Spike
- alert: AssignmentConflictSpike
  expr: rate(rodistaa.assignment.conflict_count[5m]) > 10
  for: 5m
  annotations:
    summary: "High assignment conflict rate detected"
    description: "Assignment conflicts spiking - investigate scheduling"

# Notification Failures
- alert: NotificationFailures
  expr: rate(rodistaa.notification.failed_total[5m]) > 0.1
  for: 10m
  annotations:
    summary: "High notification failure rate"
    description: "{{ $value }} notification failures per second"
```

### Warning Alerts

```yaml
# Force Assign Spike
- alert: ForceAssignSpike
  expr: rate(rodistaa.assignment.force_assign_count[1h]) > 5
  for: 1h
  annotations:
    summary: "High force assignment rate"
    description: "Review HQ override patterns"

# Document Expiry
- alert: DocumentExpiryWarning
  expr: rodistaa.driver.documents.expiring_count > 50
  for: 1h
  annotations:
    summary: "Multiple documents expiring soon"
    description: "{{ $value }} documents need renewal"
```

## Logging

### Log Levels

- **ERROR**: Assignment failures, verification errors, critical flags
- **WARN**: DL expiring, conflicts, availability blocks
- **INFO**: Assignment created, driver created, notifications sent
- **DEBUG**: Validation details, eligibility checks

### Log Format

```json
{
  "timestamp": "2025-01-XXT00:00:00Z",
  "level": "INFO",
  "service": "driver-assignment",
  "event": "assignment_created",
  "assignment_id": "uuid",
  "truck_id": 123,
  "primary_driver_id": "uuid",
  "warnings": [],
  "metadata": {...}
}
```

## Performance Monitoring

### Key Metrics

- Assignment creation latency (p50, p95, p99)
- Driver lookup latency
- Document upload throughput
- Notification delivery latency

### SLAs

- Assignment creation: < 500ms (p95)
- Driver lookup: < 100ms (p95)
- Notification delivery: < 5s (p95)
- Document upload: < 2s (p95)

---

**Last Updated**: 2025-01-XX

