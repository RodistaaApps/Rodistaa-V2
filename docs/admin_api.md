# Admin Fleet Management API Documentation

**Version**: 1.0.0  
**Base URL**: `/api/admin`  
**Authentication**: Bearer JWT Token  
**Last Updated**: December 5, 2025

---

## Table of Contents

1. [Authentication](#authentication)
2. [Truck Management](#truck-management)
3. [Ticket Management](#ticket-management)
4. [Analytics](#analytics)
5. [Export & Audit](#export--audit)
6. [Error Handling](#error-handling)

---

## Authentication

All admin API endpoints require a valid JWT token in the Authorization header.

### Headers Required

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### RBAC Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| `SuperAdmin` | Full access | All operations + PII exports |
| `ComplianceOfficer` | Block/unblock trucks | Compliance actions + tickets |
| `OpsManager` | Operational control | Reverify + bulk actions |
| `ReadOnlyAnalyst` | View-only | Dashboards + exports (no PII) |

### Rate Limiting

- **100 requests per minute** per admin user
- Exceeding limit returns `429 Too Many Requests`

---

## Truck Management

### List Trucks

Get paginated list of trucks with filters and sorting.

```http
GET /admin/trucks?page=1&limit=25&compliance=blocked&operator=OP-123
```

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Page size (default: 25, max: 100) |
| `search` | string | No | Search RC, operator, model |
| `compliance` | string | No | Filter: `allowed`, `blocked`, `pending` |
| `operator` | string | No | Filter by operator ID |
| `provider` | string | No | Filter: `VAHAN`, `Surepass` |
| `city` | string | No | Filter by city |
| `state` | string | No | Filter by state |
| `bodyType` | string | No | Filter by body type |
| `minGVW` | number | No | Minimum GVW (kg) |
| `maxGVW` | number | No | Maximum GVW (kg) |
| `hasTickets` | boolean | No | Filter trucks with/without tickets |
| `sort` | string | No | Sort field (default: `last_verified`) |
| `order` | string | No | Sort order: `asc`, `desc` |

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "rc_number": "DL01AB1234",
      "operator_id": "OP-001",
      "operator_name": "ABC Transport",
      "compliance_status": "allowed",
      "last_verified": "2025-12-05T10:00:00Z",
      "provider": "VAHAN",
      "provider_txn_id": "VH-20251205-ABC123",
      "tyres": 10,
      "label": "DXL",
      "body_type": "Container",
      "gvw": 25000,
      "inferred_length": 32.5,
      "fit_score": 95,
      "tickets_count": 0,
      "linked_trailer": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 150,
    "totalPages": 6
  }
}
```

**Required Permission**: `trucks:read`

---

### Get Truck Details

Get comprehensive truck details including compliance, inference, snapshots, and audit trail.

```http
GET /admin/trucks/:rc
```

**Path Parameters**:
- `rc` (string, required) - RC number (e.g., `DL01AB1234`)

**Response**:

```json
{
  "success": true,
  "data": {
    "truckMaster": {
      "rc_number": "DL01AB1234",
      "operator_id": "OP-001",
      "operator_name": "ABC Transport",
      "owner_name": "John Doe",
      "owner_mobile": "+911234567890",
      "tyres": 10,
      "label": "DXL",
      "body_type": "Container",
      "gvw": 25000,
      "model": "Tata LPT 2518",
      "manufacture_year": 2020,
      "fitness_upto": "2026-12-31",
      "status": "active"
    },
    "complianceDecision": {
      "status": "allowed",
      "reason": null,
      "blocked_by": null,
      "blocked_at": null,
      "last_verified_at": "2025-12-05T10:00:00Z",
      "confidence_score": 95
    },
    "inferenceResult": {
      "inferred_length": 32.5,
      "inferred_body_type": "Container",
      "candidate_lengths": [32, 32.5, 33],
      "confidence": 95,
      "rules_applied": ["TYRES_TO_LENGTH", "GVW_VALIDATION"],
      "fit_score": 95
    },
    "snapshots": [
      {
        "id": 1,
        "provider": "VAHAN",
        "txn_id": "VH-20251205-ABC123",
        "raw_data": { /* Full VAHAN response */ },
        "fetched_at": "2025-12-05T10:00:00Z"
      }
    ],
    "complianceHistory": [],
    "tickets": [],
    "auditLogs": [],
    "linkedTrailer": null
  }
}
```

**Required Permission**: `trucks:read`

---

### Block Truck

Block a truck from operations with reason tracking.

```http
POST /admin/trucks/:rc/block
```

**Request Body**:

```json
{
  "reason": "Suspicious activity detected during verification",
  "evidenceIds": ["EVD-001", "EVD-002"],
  "createTicket": true
}
```

**Response**:

```json
{
  "success": true,
  "message": "Truck blocked successfully",
  "data": {
    "rc": "DL01AB1234",
    "status": "blocked",
    "txnId": "AUD-20251205-ABC123",
    "ticketId": "TKT-1733395200000",
    "blockedBy": "ADM-001",
    "blockedAt": "2025-12-05T12:00:00Z"
  }
}
```

**Required Permission**: `trucks:block`  
**Audit Log**: ✅ Created automatically  
**Notification**: ✅ Sent to relevant admins

---

### Unblock Truck

Unblock a previously blocked truck.

```http
POST /admin/trucks/:rc/unblock
```

**Request Body**:

```json
{
  "reason": "Investigation complete, no issues found"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Truck unblocked successfully",
  "data": {
    "rc": "DL01AB1234",
    "status": "allowed",
    "txnId": "AUD-20251205-XYZ789",
    "unblockedBy": "ADM-001",
    "unblockedAt": "2025-12-05T14:00:00Z"
  }
}
```

**Required Permission**: `trucks:unblock`  
**Audit Log**: ✅ Created  
**Notification**: ✅ Sent

---

### Reverify Truck

Enqueue truck for reverification with VAHAN.

```http
POST /admin/trucks/:rc/reverify
```

**Request Body**: None

**Response**:

```json
{
  "success": true,
  "message": "Truck reverification enqueued",
  "data": {
    "rc": "DL01AB1234",
    "txnId": "AUD-20251205-REV456",
    "enqueuedAt": "2025-12-05T15:00:00Z",
    "estimatedCompletion": "2025-12-05T15:01:00Z"
  }
}
```

**Required Permission**: `trucks:reverify`  
**Audit Log**: ✅ Created

---

### Bulk Action

Perform bulk operations on multiple trucks.

```http
POST /admin/trucks/bulk-action
```

**Request Body**:

```json
{
  "action": "block",
  "rcNumbers": ["DL01AB1234", "HR26BX5678", "UP80CD9012"],
  "reason": "Mass compliance review - suspicious operator"
}
```

**Parameters**:
- `action` - One of: `block`, `unblock`, `reverify`, `export`
- `rcNumbers` - Array of RC numbers (min: 1, max: 1000)
- `reason` - Required for `block` and `unblock` actions

**Response**:

```json
{
  "success": true,
  "message": "Bulk block completed",
  "data": {
    "correlationId": "BULK-1733395200000-abc123",
    "results": {
      "total": 3,
      "success": 3,
      "failed": 0,
      "errors": []
    }
  }
}
```

**Required Permission**: `trucks:bulk_action`  
**Audit Log**: ✅ Created with correlation ID  
**Notification**: ✅ Sent when complete

---

### Link Trailer

Link a trailer to a tractor.

```http
POST /admin/trucks/:rc/link-trailer
```

**Request Body**:

```json
{
  "trailerRc": "UP80TR1234"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Trailer linked successfully",
  "data": {
    "tractorRc": "UP80CD9012",
    "trailerRc": "UP80TR1234",
    "linkedBy": "ADM-001",
    "linkedAt": "2025-12-05T16:00:00Z",
    "txnId": "AUD-20251205-LNK789"
  }
}
```

**Required Permission**: `trailers:link`  
**Audit Log**: ✅ Created

---

### Unlink Trailer

Unlink a trailer from a tractor.

```http
POST /admin/trucks/:rc/unlink-trailer
```

**Request Body**:

```json
{
  "reason": "Trailer reassigned to different tractor"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Trailer unlinked successfully",
  "data": {
    "tractorRc": "UP80CD9012",
    "unlinkedBy": "ADM-001",
    "unlinkedAt": "2025-12-05T17:00:00Z",
    "txnId": "AUD-20251205-UNL456"
  }
}
```

**Required Permission**: `trailers:unlink`  
**Audit Log**: ✅ Created

---

## Ticket Management

### List Tickets

Get paginated list of tickets with filters.

```http
GET /admin/tickets?status=OPEN&priority=P0&assignedTo=ADM-001
```

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Page size (default: 25) |
| `status` | string | No | Filter: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `ESCALATED`, `CLOSED` |
| `priority` | string | No | Filter: `P0`, `P1`, `P2`, `P3` |
| `assignedTo` | string | No | Filter by admin ID or `unassigned` |
| `ticketType` | string | No | Filter by ticket type |
| `resourceType` | string | No | Filter by resource type |
| `resourceId` | string | No | Filter by resource ID |
| `slaBreached` | boolean | No | Filter by SLA status |

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "TKT-001",
      "ticket_type": "PROVIDER_MISMATCH",
      "priority": "P1",
      "status": "OPEN",
      "title": "Provider mismatch for DL01AB1234",
      "description": "VAHAN and Surepass disagree on vehicle_category",
      "resource_type": "truck",
      "resource_id": "DL01AB1234",
      "created_by": "SYSTEM",
      "assigned_to": "ADM-002",
      "sla_due_at": "2025-12-06T10:00:00Z",
      "created_at": "2025-12-05T10:00:00Z",
      "is_sla_breached": false,
      "time_until_sla": "24h"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 45,
    "totalPages": 2
  }
}
```

**Required Permission**: `tickets:read`

---

### Create Ticket

Create a new ticket for manual review.

```http
POST /admin/tickets
```

**Request Body**:

```json
{
  "ticketType": "MANUAL_REVIEW",
  "priority": "P2",
  "title": "Review unusual inference result",
  "description": "Truck shows 10T but inferred as 6T",
  "resourceType": "truck",
  "resourceId": "DL01AB1234",
  "metadata": {
    "confidence_score": 65,
    "expected_tyres": 10,
    "inferred_tyres": 6
  },
  "tags": ["inference-mismatch", "review-needed"]
}
```

**Response**:

```json
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "id": "TKT-1733395200000",
    "ticketType": "MANUAL_REVIEW",
    "priority": "P2",
    "status": "OPEN",
    "slaDueAt": "2025-12-08T10:00:00Z",
    "txnId": "AUD-20251205-TKT123",
    "createdAt": "2025-12-05T10:00:00Z"
  }
}
```

**Required Permission**: `tickets:create`  
**Audit Log**: ✅ Created  
**Notification**: ✅ Sent

---

### Assign Ticket

Assign ticket to an admin user.

```http
PUT /admin/tickets/:id/assign
```

**Request Body**:

```json
{
  "assignedTo": "ADM-002"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Ticket assigned successfully",
  "data": {
    "id": "TKT-001",
    "assignedTo": "ADM-002",
    "status": "IN_PROGRESS",
    "txnId": "AUD-20251205-ASN456",
    "updatedAt": "2025-12-05T11:00:00Z"
  }
}
```

**Required Permission**: `tickets:assign`  
**Audit Log**: ✅ Created  
**Notification**: ✅ Sent to assigned admin

---

### Resolve Ticket

Resolve and close a ticket.

```http
POST /admin/tickets/:id/resolve
```

**Request Body**:

```json
{
  "resolution": "Investigated the mismatch. VAHAN data is correct. Surepass data was outdated. Truck verified as LMV.",
  "resolutionType": "FIXED"
}
```

**Parameters**:
- `resolution` (string, required, min: 20 chars) - Detailed resolution notes
- `resolutionType` (string, required) - One of: `APPROVED`, `REJECTED`, `FIXED`, `NO_ACTION_NEEDED`

**Response**:

```json
{
  "success": true,
  "message": "Ticket resolved successfully",
  "data": {
    "id": "TKT-001",
    "status": "RESOLVED",
    "resolvedBy": "ADM-001",
    "resolvedAt": "2025-12-05T12:00:00Z",
    "resolutionType": "FIXED",
    "txnId": "AUD-20251205-RES789"
  }
}
```

**Required Permission**: `tickets:resolve`  
**Audit Log**: ✅ Created  
**Notification**: ✅ Sent

---

### Add Comment

Add a comment to a ticket.

```http
POST /admin/tickets/:id/comments
```

**Request Body**:

```json
{
  "comment": "Contacted operator for clarification. Awaiting response.",
  "isInternal": true,
  "attachments": []
}
```

**Response**:

```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "id": 123,
    "ticketId": "TKT-001",
    "adminId": "ADM-001",
    "comment": "Contacted operator...",
    "isInternal": true,
    "createdAt": "2025-12-05T13:00:00Z"
  }
}
```

**Required Permission**: `tickets:read`

---

## Error Handling

### Error Response Format

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "reason",
      "message": "Reason must be at least 10 characters"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created |
| `400` | Bad Request | Validation error |
| `401` | Unauthorized | Missing or invalid token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |

---

## Request Examples

### cURL Examples

**List Trucks (with filters)**:
```bash
curl -X GET \
  'http://localhost:4000/api/admin/trucks?compliance=blocked&limit=50' \
  -H 'Authorization: Bearer eyJhbGc...'
```

**Block Truck**:
```bash
curl -X POST \
  'http://localhost:4000/api/admin/trucks/DL01AB1234/block' \
  -H 'Authorization: Bearer eyJhbGc...' \
  -H 'Content-Type: application/json' \
  -d '{
    "reason": "Failed compliance verification",
    "createTicket": true
  }'
```

**Bulk Reverify**:
```bash
curl -X POST \
  'http://localhost:4000/api/admin/trucks/bulk-action' \
  -H 'Authorization: Bearer eyJhbGc...' \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "reverify",
    "rcNumbers": ["DL01AB1234", "HR26BX5678"]
  }'
```

---

## Webhooks

Admin portal can dispatch webhooks for real-time integrations.

### Event Types

- `truck.verified` - Truck verification completed
- `truck.blocked` - Truck blocked by admin
- `truck.unblocked` - Truck unblocked
- `ticket.created` - New ticket created
- `ticket.assigned` - Ticket assigned
- `ticket.resolved` - Ticket resolved
- `sla.breached` - Ticket SLA breached

### Webhook Payload

```json
{
  "event": "truck.blocked",
  "timestamp": "2025-12-05T12:00:00Z",
  "data": {
    "rc_number": "DL01AB1234",
    "blocked_by": "ADM-001",
    "reason": "Compliance violation",
    "txn_id": "AUD-20251205-ABC123"
  }
}
```

**Headers**:
- `X-Rodistaa-Signature` - HMAC-SHA256 signature for verification

---

## Rate Limits & Quotas

| Endpoint | Rate Limit | Notes |
|----------|------------|-------|
| All admin routes | 100 req/min | Per admin user |
| Bulk actions | 10 req/min | Max 1000 trucks per request |
| Export | 5 req/min | Large exports may take time |

---

## Support & Issues

For API support or issues, contact:
- **Technical Lead**: TBD
- **Backend Team**: backend@rodistaa.com
- **Documentation**: https://docs.rodistaa.com/admin-api

---

**Last Updated**: December 5, 2025  
**Version**: 1.0.0

