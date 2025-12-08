# Driver & Assignment API Documentation

## Base URL

```
https://api.rodistaa.com/truck-master
```

## Authentication

All endpoints require JWT authentication.

## Driver Endpoints

### POST /api/operators/:operatorId/drivers

Create driver with KYC and documents.

**Request**:
```json
{
  "name": "Rajesh Kumar",
  "mobile": "9876543210",
  "alt_mobile": "9876543211",
  "aadhaar_number": "123456789012",
  "dl_number": "DL-04-2015-1234567",
  "dl_class": "LMV",
  "dl_valid_from": "2015-03-15",
  "dl_valid_till": "2035-03-14",
  "dob": "1985-06-20",
  "gender": "M",
  "address": {
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001"
  },
  "preferred_shift": "DAY"
}
```

**Response** (201 Created):
```json
{
  "driver": {
    "id": "uuid",
    "operator_id": "OPR001",
    "name": "Rajesh Kumar",
    "mobile": "9876543210",
    ...
  },
  "warnings": ["DL expires in 15 days"]
}
```

---

### GET /api/operators/:operatorId/drivers

List drivers with filters.

**Query Parameters**:
- `is_active` - Filter by active status
- `dl_expiry_days` - Drivers with DL expiring in X days
- `limit` - Page size (default: 50)
- `offset` - Pagination offset

**Response** (200 OK):
```json
{
  "drivers": [...],
  "total": 100
}
```

---

### GET /api/drivers/:driverId

Get driver details with documents, flags, and assignments.

**Response** (200 OK):
```json
{
  "driver": {...},
  "documents": [...],
  "flags": [...],
  "assignments": [...]
}
```

---

## Assignment Endpoints

### POST /api/trucks/:truckId/assign

Assign drivers to truck.

**Request**:
```json
{
  "primary_driver_id": "uuid",
  "co_driver_ids": ["uuid1", "uuid2"],
  "start_at": "2025-02-01T00:00:00Z",
  "end_at": "2025-02-28T23:59:59Z",
  "assignment_reason": "shift coverage"
}
```

**Response** (201 Created):
```json
{
  "assignment_id": "uuid",
  "warnings": [
    {
      "type": "DL_EXPIRING",
      "driver_id": "uuid",
      "driver_name": "Rajesh Kumar",
      "message": "DL expires in 15 days",
      "severity": "MEDIUM"
    }
  ],
  "assignment": {...}
}
```

---

### GET /api/trucks/:truckId/assignment

Get current active assignment for truck.

**Response** (200 OK):
```json
{
  "assignment": {
    "id": "uuid",
    "truck_id": 123,
    "primary_driver_id": "uuid",
    "co_driver_ids": ["uuid1"],
    "start_at": "2025-02-01T00:00:00Z",
    "is_active": true,
    ...
  }
}
```

---

### POST /api/trucks/:truckId/unassign

End assignment.

**Request**:
```json
{
  "reason": "Assignment completed"
}
```

**Response** (200 OK):
```json
{
  "success": true
}
```

---

## Error Codes

- `400` - Validation failed
- `404` - Resource not found
- `409` - Conflict (duplicate, overlapping assignment)
- `500` - Server error

---

**Last Updated**: 2025-01-XX

