# Truck Master API Documentation

## Base URL

```
https://api.rodistaa.com/truck-master
```

## Authentication

All endpoints require JWT authentication:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### POST /api/operator/:operatorId/trucks

Create truck with mandatory dimensions.

**Request**:
```json
{
  "rc_number": "MH12AB1234",
  "tyre_count": 6,
  "body_length_ft": 16,
  "body_type": "OPEN",
  "payload_kg": 5000,
  "axle_count": 2,
  "nickname": "Truck 1",
  "rc_copy": "base64_encoded_file"
}
```

**Response** (201 Created):
```json
{
  "id": 123,
  "rc_number": "MH12AB1234",
  "status": "PENDING_VERIFICATION",
  "flags": [
    {
      "code": "LENGTH_MISMATCH_WARNING",
      "severity": "LOW",
      "reason": "Body length 24ft is outside typical range 12-18ft for 6-tyre vehicles"
    }
  ],
  "message": "Truck created successfully. Pending VAHAN verification."
}
```

**Errors**:
- `400` - Validation failed
- `409` - Duplicate RC number
- `500` - Server error

---

### GET /api/operator/:operatorId/trucks

List trucks with filters.

**Query Parameters**:
- `status` - Filter by status
- `compliance_status` - Filter by compliance status
- `limit` - Page size (default: 50)
- `offset` - Pagination offset (default: 0)

**Response** (200 OK):
```json
{
  "trucks": [
    {
      "id": 123,
      "rc_number": "MH12AB1234",
      "tyre_count": 6,
      "body_length_ft": 16,
      "body_type": "OPEN",
      "flags": [...],
      "compliance_status": "ACTIVE",
      "last_verified_at": "2025-01-XXT00:00:00Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

---

### GET /api/trucks/:truckId

Get truck details with flags history and snapshots.

**Response** (200 OK):
```json
{
  "truck": {
    "id": 123,
    "rc_number": "MH12AB1234",
    "tyre_count": 6,
    "body_length_ft": 16,
    "body_type": "OPEN",
    "flags": [...],
    "flags_history": [...],
    "vahan_snapshot": {
      "provider": "PARIVAHAN",
      "txn_id": "TXN123",
      "maker": "TATA",
      "model_name": "407",
      "fetched_at": "2025-01-XXT00:00:00Z"
    },
    "compliance_status": "ACTIVE"
  },
  "flags_history": [...],
  "tasks": [...],
  "tickets": [...]
}
```

**Errors**:
- `404` - Truck not found

---

### POST /api/franchise/verify/:truckId

Franchise photo verification.

**Request**:
```json
{
  "verified": true,
  "photos_urls": [
    "https://storage.example.com/photo1.jpg",
    "https://storage.example.com/photo2.jpg"
  ],
  "notes": "All photos verified, dimensions match"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Truck verified successfully"
}
```

---

### GET /api/franchise/:franchiseId/tasks

List franchise tasks.

**Query Parameters**:
- `status` - Filter by status
- `limit` - Page size
- `offset` - Pagination offset

**Response** (200 OK):
```json
{
  "tasks": [
    {
      "id": 456,
      "truck_id": 123,
      "task_type": "PHOTO_VERIFY",
      "status": "PENDING",
      "due_at": "2025-01-XXT00:00:00Z",
      "payload": {
        "required_photos": ["front", "rear", ...]
      }
    }
  ],
  "total": 10
}
```

---

### GET /api/admin/flags/dashboard

Admin flag dashboard.

**Query Parameters**:
- `flag_code` - Filter by flag code
- `compliance_status` - Filter by compliance status
- `region` - Filter by region
- `state` - Filter by state
- `limit` - Page size
- `offset` - Pagination offset

**Response** (200 OK):
```json
{
  "trucks": [...],
  "total": 50,
  "limit": 50,
  "offset": 0
}
```

---

### POST /api/admin/trucks/:truckId/override

Admin override action.

**Request**:
```json
{
  "action": "VERIFY_MANUALLY",
  "reason": "Manual verification completed",
  "franchise_id": "FRANCHISE_001"
}
```

**Actions**: `VERIFY_MANUALLY`, `BLOCK`, `UNBLOCK`, `REASSIGN_FRANCHISE`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Truck VERIFY_MANUALLY completed"
}
```

---

## Data Models

### TruckCreateDTO

```typescript
{
  operator_id: string;
  rc_number: string;
  tyre_count: 6 | 10 | 12 | 14 | 16 | 18 | 20 | 22;
  body_length_ft: number; // 12-45
  body_type: 'OPEN' | 'CONTAINER' | 'FLATBED' | 'LOWBED' | 'TRAILER' | 'OTHER';
  rc_copy: Buffer; // Base64 encoded
  payload_kg?: number;
  axle_count?: number;
  nickname?: string;
}
```

### VahanSnapshot

```typescript
{
  provider: 'PARIVAHAN' | 'SUREPASS' | 'BACKUP';
  txn_id: string;
  raw_json: any;
  fetched_at: Date;
  maker?: string;
  model_name?: string;
  body_type_name?: string;
  chassis_number?: string;
  engine_number?: string;
  gvw_kg?: number;
  // ... other fields
}
```

### FlagRecord

```typescript
{
  flag_code: string;
  meta: {
    reason?: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    operator_declared?: any;
    vahan_value?: any;
  };
  created_at: string;
  resolved_by?: string;
  resolved_at?: string;
}
```

---

**Last Updated**: 2025-01-XX

