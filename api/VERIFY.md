# OpenAPI Specification Verification Guide

This document provides commands to validate the OpenAPI specification and test endpoints with sample curl commands.

## Prerequisites

Install validation tools:

```bash
# Install openapi-cli (Swagger CLI)
npm install -g @apidevtools/swagger-cli

# Or install redoc-cli
npm install -g redoc-cli

# Or install Spectral for linting
npm install -g @stoplight/spectral-cli
```

## Validation Commands

### 1. Validate OpenAPI Specification

```bash
# Using swagger-cli
swagger-cli validate api/openapi.yaml

# Expected output:
# api/openapi.yaml is valid
```

```bash
# Using redoc-cli
redoc-cli lint api/openapi.yaml

# Expected output:
# No errors found
```

### 2. Lint with Spectral

```bash
spectral lint api/openapi.yaml

# Expected output:
# No errors or warnings
```

### 3. Generate TypeScript Types

```bash
# Generate types for app-shared package
cd packages/app-shared
npx openapi-typescript-codegen \
  --input ../../api/openapi.yaml \
  --output src/generated \
  --client axios

# Or using openapi-typescript (types only)
npx openapi-typescript ../../api/openapi.yaml -o src/generated/types.ts
```

### 4. Build and Type Check

```bash
# From monorepo root
pnpm -w -r build

# Expected: All packages compile successfully

# Type check
pnpm -w -r typecheck

# Expected: No TypeScript errors
```

## Sample curl Commands

### Health Check

```bash
curl -X GET http://localhost:3000/v1/health \
  -H "Content-Type: application/json"

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2024-01-15T10:30:00Z"
# }
```

### Authentication

#### Request OTP

```bash
curl -X POST http://localhost:3000/v1/auth/otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "+919876543210"
  }'

# Expected response:
# {
#   "message": "OTP sent to +919876543210",
#   "expiresIn": 300
# }
```

#### Login

```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "+919876543210",
    "otp": "123456",
    "deviceId": "device-uuid-12345"
  }'

# Expected response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "refreshToken": "refresh-token-xyz",
#   "user": {
#     "id": "USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV",
#     "role": "SHIPPER",
#     "name": "John Doe",
#     "mobileMasked": "+91****543210"
#   }
# }
```

#### Refresh Token

```bash
curl -X POST http://localhost:3000/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "refresh-token-xyz"
  }'
```

### Bookings

#### Create Booking

```bash
TOKEN="your-auth-token-here"

curl -X POST http://localhost:3000/v1/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "pickup": {
      "address": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "coordinates": {
        "lat": 19.0760,
        "lng": 72.8777
      }
    },
    "drop": {
      "address": "456 Park Avenue",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110001",
      "coordinates": {
        "lat": 28.6139,
        "lng": 77.2090
      }
    },
    "goods": {
      "type": "Cement",
      "weight": 5000,
      "packaging": "Bags"
    },
    "tonnage": 5.0,
    "priceRange": {
      "min": 15000,
      "max": 20000
    }
  }'

# Expected response:
# {
#   "id": "RID-20240115-0001",
#   "shipperId": "USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV",
#   "pickup": {...},
#   "drop": {...},
#   "goods": {...},
#   "tonnage": 5.0,
#   "expectedPrice": 17500,
#   "status": "OPEN",
#   "createdAt": "2024-01-15T10:30:00Z"
# }
```

#### List Bookings

```bash
curl -X GET "http://localhost:3000/v1/bookings?status=OPEN&page=1&pageSize=20" \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# {
#   "data": [...],
#   "meta": {
#     "page": 1,
#     "pageSize": 20,
#     "total": 1,
#     "totalPages": 1
#   }
# }
```

#### Get Booking Details

```bash
curl -X GET http://localhost:3000/v1/bookings/RID-20240115-0001 \
  -H "Authorization: Bearer $TOKEN"
```

### Bids

#### Create Bid

```bash
curl -X POST http://localhost:3000/v1/bids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "bookingId": "RID-20240115-0001",
    "amount": 16500
  }'
```

#### Modify Bid

```bash
curl -X PATCH http://localhost:3000/v1/bids/BK-01ARZ3NDEKTSV4RRFFQ69G5FAV \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 16000
  }'
```

### Shipments

#### List Shipments

```bash
curl -X GET "http://localhost:3000/v1/shipments?status=IN_TRANSIT&page=1&pageSize=20" \
  -H "Authorization: Bearer $TOKEN"
```

#### Assign Driver

```bash
curl -X POST http://localhost:3000/v1/shipments/SH-01ARZ3NDEKTSV4RRFFQ69G5FAV/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "driverId": "USR-DR-01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "truckId": "TRK-MH01AB1234-01ARZ3NDEKTSV4RRFFQ69G5FAV"
  }'
```

### GPS Tracking

#### Send GPS Ping

```bash
curl -X POST http://localhost:3000/v1/tracking/ping \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "shipmentId": "SH-01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "coordinates": {
      "lat": 19.0760,
      "lng": 72.8777
    },
    "speed": 60,
    "heading": 90
  }'
```

#### Get Tracking History

```bash
curl -X GET http://localhost:3000/v1/tracking/SH-01ARZ3NDEKTSV4RRFFQ69G5FAV \
  -H "Authorization: Bearer $TOKEN"
```

### POD Upload

```bash
curl -X POST http://localhost:3000/v1/pod/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "shipmentId=SH-01ARZ3NDEKTSV4RRFFQ69G5FAV" \
  -F "file=@/path/to/pod.jpg" \
  -F "otp=123456"
```

### Ledger

#### Get Ledger Balance

```bash
curl -X GET http://localhost:3000/v1/ledger \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# {
#   "operatorId": "USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FAV",
#   "balance": 50000,
#   "currency": "INR",
#   "updatedAt": "2024-01-15T10:30:00Z"
# }
```

#### List Transactions

```bash
curl -X GET "http://localhost:3000/v1/ledger/transactions?page=1&pageSize=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Admin Endpoints

#### Get Dashboard

```bash
curl -X GET http://localhost:3000/v1/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# {
#   "dau": 1250,
#   "bookings": 150,
#   "bids": 300,
#   "flaggedIncidents": 5,
#   "totalRevenue": 2500000
# }
```

#### List Override Requests

```bash
curl -X GET "http://localhost:3000/v1/admin/overrides?status=PENDING&page=1&pageSize=20" \
  -H "Authorization: Bearer $TOKEN"
```

#### Approve Override

```bash
curl -X POST http://localhost:3000/v1/admin/overrides/OVR-123/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "reason": "Approved by second approver after review"
  }'
```

### ACS Endpoints

#### Get ACS Blocks

```bash
curl -X GET http://localhost:3000/v1/acs/blocks/user/USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# [
#   {
#     "id": "BLK-01ARZ3NDEKTSV4RRFFQ69G5FAV",
#     "entityType": "user",
#     "entityId": "USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV",
#     "reason": "Multiple failed KYC attempts",
#     "severity": "HIGH",
#     "createdAt": "2024-01-15T09:00:00Z"
#   }
# ]
```

### Webhooks

#### Register Webhook

```bash
curl -X POST http://localhost:3000/v1/webhooks/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "url": "https://example.com/webhook",
    "events": [
      "booking.created",
      "shipment.completed"
    ]
  }'
```

## Testing Rate Limits

Test rate limiting by making multiple requests rapidly:

```bash
# Make 10 requests quickly to test rate limiting
for i in {1..10}; do
  curl -X GET http://localhost:3000/v1/health
  echo "Request $i completed"
done

# Check rate limit headers in response:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 90
```

## Error Response Examples

### 400 Bad Request

```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "invalid"
  }'

# Expected response (400):
# {
#   "code": "VALIDATION_ERROR",
#   "message": "Invalid request data",
#   "details": {
#     "field": "mobile",
#     "error": "Invalid format"
#   }
# }
```

### 401 Unauthorized

```bash
curl -X GET http://localhost:3000/v1/bookings \
  -H "Authorization: Bearer invalid-token"

# Expected response (401):
# {
#   "code": "UNAUTHORIZED",
#   "message": "Invalid or missing authentication token"
# }
```

### 404 Not Found

```bash
curl -X GET http://localhost:3000/v1/bookings/RID-99999999-9999 \
  -H "Authorization: Bearer $TOKEN"

# Expected response (404):
# {
#   "code": "NOT_FOUND",
#   "message": "Resource not found"
# }
```

### 429 Rate Limit Exceeded

```bash
# Make excessive requests to trigger rate limit
for i in {1..200}; do
  curl -X GET http://localhost:3000/v1/health
done

# Expected response (429):
# {
#   "code": "RATE_LIMIT_EXCEEDED",
#   "message": "Too many requests. Please try again later."
# }
# Headers:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 0
# Retry-After: 60
```

## Verification Checklist

- [ ] OpenAPI spec validates without errors
- [ ] TypeScript types generate successfully
- [ ] All packages compile with generated types
- [ ] Health check endpoint responds correctly
- [ ] Authentication flow works (OTP → Login)
- [ ] Booking creation works with valid data
- [ ] Bid creation works
- [ ] Pagination works on list endpoints
- [ ] Rate limit headers are present
- [ ] Error responses follow consistent format
- [ ] All examples in spec are valid JSON

## Next Steps

After verification:

1. Generate TypeScript types: `pnpm --filter @rodistaa/app-shared build`
2. Run type check: `pnpm -w -r typecheck`
3. Commit generated types to repository
4. Update backend to use generated types
5. Update mobile apps to use generated types
6. Update portal to use generated API client

