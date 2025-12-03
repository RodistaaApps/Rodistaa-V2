# Rodistaa Platform API Reference

Complete API documentation with examples for all endpoints.

**Base URL**: `https://api.rodistaa.com/v1` (Production) or `http://localhost:4000/v1` (Development)

**Authentication**: All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## Table of Contents

1. [Authentication](#authentication)
2. [Bookings](#bookings)
3. [Bids](#bids)
4. [Shipments](#shipments)
5. [Tracking](#tracking)
6. [KYC Management](#kyc-management)
7. [Trucks](#trucks)
8. [Drivers](#drivers)
9. [Payments](#payments)
10. [Users](#users)
11. [Franchise](#franchise)
12. [Notifications](#notifications)

---

## Authentication

### Send OTP

Request an OTP for phone-based authentication.

**Endpoint**: `POST /auth/otp`

**Request Body**:
```json
{
  "mobile": "9876543210"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300
}
```

**Example (cURL)**:
```bash
curl -X POST http://localhost:4000/v1/auth/otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210"}'
```

---

### Login with OTP

Authenticate user with mobile number and OTP.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "mobile": "9876543210",
  "otp": "123456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123",
      "mobile": "9876543210",
      "name": "John Doe",
      "role": "shipper",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

**Example (JavaScript)**:
```javascript
const response = await fetch('http://localhost:4000/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mobile: '9876543210',
    otp: '123456'
  })
});
const data = await response.json();
```

---

### Get Current User

Get authenticated user information.

**Endpoint**: `GET /auth/me`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "usr_123",
    "mobile": "9876543210",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "shipper",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Bookings

### Create Booking

Create a new shipment booking.

**Endpoint**: `POST /bookings`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "pickupAddress": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "coordinates": {
      "latitude": 19.0760,
      "longitude": 72.8777
    }
  },
  "deliveryAddress": {
    "street": "456 Park Ave",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "coordinates": {
      "latitude": 28.6139,
      "longitude": 77.2090
    }
  },
  "pickupDate": "2024-02-01T09:00:00Z",
  "cargoType": "general",
  "cargoWeight": 5000,
  "cargoDescription": "Electronics - 50 boxes",
  "truckType": "FTL",
  "specialInstructions": "Handle with care"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "bkg_789",
    "shipperId": "usr_123",
    "status": "pending",
    "estimatedDistance": 1400,
    "estimatedPrice": 45000,
    "createdAt": "2024-01-15T10:35:00Z",
    "pickupAddress": { /* ... */ },
    "deliveryAddress": { /* ... */ }
  }
}
```

---

### Get Bookings

Retrieve bookings with filters.

**Endpoint**: `GET /bookings`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `status` (optional): Filter by status (`pending`, `confirmed`, `in_transit`, `delivered`, `cancelled`)
- `truckType` (optional): Filter by truck type (`FTL`, `PTL`)
- `startDate` (optional): Filter bookings from this date
- `endDate` (optional): Filter bookings until this date
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Example**:
```
GET /bookings?status=pending&page=1&limit=10
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "bkg_789",
        "status": "pending",
        "pickupAddress": { /* ... */ },
        "deliveryAddress": { /* ... */ },
        "cargoWeight": 5000,
        "estimatedPrice": 45000
      }
    ],
    "total": 45,
    "page": 1,
    "pageSize": 10,
    "hasMore": true
  }
}
```

---

### Get Booking by ID

Get detailed information about a specific booking.

**Endpoint**: `GET /bookings/:id`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "bkg_789",
    "shipperId": "usr_123",
    "status": "confirmed",
    "pickupAddress": { /* ... */ },
    "deliveryAddress": { /* ... */ },
    "cargoType": "general",
    "cargoWeight": 5000,
    "estimatedDistance": 1400,
    "estimatedPrice": 45000,
    "actualPrice": 44000,
    "bids": [
      {
        "id": "bid_456",
        "operatorId": "usr_789",
        "bidAmount": 44000,
        "status": "accepted"
      }
    ],
    "createdAt": "2024-01-15T10:35:00Z"
  }
}
```

---

### Cancel Booking

Cancel an existing booking.

**Endpoint**: `DELETE /bookings/:id`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

---

## Bids

### Create Bid

Submit a bid for a booking (Operator only).

**Endpoint**: `POST /bids`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "bookingId": "bkg_789",
  "truckId": "trk_123",
  "bidAmount": 44000,
  "estimatedDeliveryTime": "2024-02-03T18:00:00Z",
  "message": "Experienced driver available. Can deliver ahead of schedule."
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "bid_456",
    "bookingId": "bkg_789",
    "operatorId": "usr_789",
    "truckId": "trk_123",
    "bidAmount": 44000,
    "status": "pending",
    "expiresAt": "2024-01-15T22:35:00Z",
    "createdAt": "2024-01-15T10:35:00Z"
  }
}
```

---

### Get Bids

Get all bids (filtered by role).

**Endpoint**: `GET /bids`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `bookingId` (optional): Filter by booking
- `status` (optional): Filter by status
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "bid_456",
        "bookingId": "bkg_789",
        "bidAmount": 44000,
        "status": "pending",
        "expiresAt": "2024-01-15T22:35:00Z"
      }
    ],
    "total": 12,
    "page": 1,
    "hasMore": false
  }
}
```

---

### Accept Bid

Accept a bid for a booking (Shipper only).

**Endpoint**: `POST /bids/:id/accept`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "bid_456",
    "status": "accepted",
    "shipmentId": "shp_001",
    "message": "Bid accepted. Shipment created."
  }
}
```

---

### Reject Bid

Reject a bid (Shipper only).

**Endpoint**: `POST /bids/:id/reject`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Bid rejected successfully"
}
```

---

## Shipments

### Get Shipments

Retrieve shipments.

**Endpoint**: `GET /shipments`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `status` (optional): Filter by status
- `driverId` (optional): Filter by driver
- `page`, `limit`: Pagination

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "shp_001",
        "bookingId": "bkg_789",
        "truckId": "trk_123",
        "driverId": "drv_456",
        "status": "in_transit",
        "currentLocation": {
          "latitude": 23.0225,
          "longitude": 72.5714
        },
        "estimatedDelivery": "2024-02-03T18:00:00Z"
      }
    ],
    "total": 8,
    "hasMore": false
  }
}
```

---

### Get Shipment by ID

Get detailed shipment information with tracking history.

**Endpoint**: `GET /shipments/:id`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "shp_001",
    "bookingId": "bkg_789",
    "truckId": "trk_123",
    "driver": {
      "id": "drv_456",
      "name": "Rajesh Kumar",
      "mobile": "9876543211"
    },
    "status": "in_transit",
    "currentLocation": {
      "latitude": 23.0225,
      "longitude": 72.5714
    },
    "checkpoints": [
      {
        "name": "Ahmedabad Hub",
        "arrivedAt": "2024-02-01T14:30:00Z",
        "departedAt": "2024-02-01T15:00:00Z"
      }
    ],
    "trackingHistory": [
      {
        "timestamp": "2024-02-01T09:00:00Z",
        "status": "picked_up",
        "location": { /* ... */ }
      }
    ]
  }
}
```

---

### Update Shipment Status

Update shipment status and location (Driver only).

**Endpoint**: `PATCH /shipments/:id`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "status": "at_checkpoint",
  "currentLocation": {
    "latitude": 23.0225,
    "longitude": 72.5714
  },
  "notes": "Arrived at Ahmedabad Hub"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "shp_001",
    "status": "at_checkpoint",
    "currentLocation": { /* ... */ },
    "updatedAt": "2024-02-01T14:30:00Z"
  }
}
```

---

### Submit Proof of Delivery

Submit delivery proof (Driver only).

**Endpoint**: `POST /shipments/:id/pod`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "signatureUrl": "https://s3.amazonaws.com/rodistaa/signatures/sig_123.png",
  "photoUrl": "https://s3.amazonaws.com/rodistaa/deliveries/del_123.jpg",
  "recipientName": "Amit Sharma",
  "notes": "Delivered to warehouse manager"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "shipmentId": "shp_001",
    "status": "delivered",
    "deliveredAt": "2024-02-03T17:30:00Z",
    "podUrl": "https://s3.amazonaws.com/rodistaa/pod/pod_123.pdf"
  }
}
```

---

## Tracking

### Get Live Tracking

Get real-time location of a shipment.

**Endpoint**: `GET /tracking/:shipmentId`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "shipmentId": "shp_001",
    "currentLocation": {
      "latitude": 23.0225,
      "longitude": 72.5714
    },
    "lastUpdated": "2024-02-01T14:45:00Z",
    "speed": 65,
    "heading": 45,
    "estimatedArrival": "2024-02-03T17:30:00Z",
    "distanceRemaining": 850
  }
}
```

---

### Get Tracking History

Get complete tracking history for a shipment.

**Endpoint**: `GET /tracking/:shipmentId/history`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "shipmentId": "shp_001",
    "updates": [
      {
        "timestamp": "2024-02-01T09:00:00Z",
        "location": { "latitude": 19.0760, "longitude": 72.8777 },
        "status": "picked_up",
        "notes": "Cargo loaded"
      },
      {
        "timestamp": "2024-02-01T14:30:00Z",
        "location": { "latitude": 23.0225, "longitude": 72.5714 },
        "status": "at_checkpoint",
        "notes": "Ahmedabad Hub"
      }
    ]
  }
}
```

---

## KYC Management

### Submit KYC

Submit KYC documents for verification.

**Endpoint**: `POST /kyc`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "documents": [
    {
      "type": "aadhaar",
      "documentNumber": "1234-5678-9012",
      "documentUrl": "https://s3.amazonaws.com/rodistaa/kyc/aadhaar_123.pdf"
    },
    {
      "type": "pan",
      "documentNumber": "ABCDE1234F",
      "documentUrl": "https://s3.amazonaws.com/rodistaa/kyc/pan_123.pdf"
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "kyc_123",
    "userId": "usr_789",
    "status": "pending",
    "documents": [ /* ... */ ],
    "createdAt": "2024-01-15T10:40:00Z"
  }
}
```

---

### Get KYC Status

Get KYC verification status.

**Endpoint**: `GET /kyc/:userId`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "kyc_123",
    "userId": "usr_789",
    "status": "approved",
    "verifiedAt": "2024-01-16T12:00:00Z",
    "documents": [
      {
        "type": "aadhaar",
        "status": "approved"
      },
      {
        "type": "pan",
        "status": "approved"
      }
    ]
  }
}
```

---

### Approve/Reject KYC (Admin only)

**Endpoint**: `PATCH /kyc/:id/review`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "status": "approved",
  "notes": "All documents verified"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "KYC approved successfully"
}
```

---

## Trucks

### Register Truck

Register a new truck (Operator only).

**Endpoint**: `POST /trucks`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "registrationNumber": "MH-01-AB-1234",
  "type": "FTL",
  "capacity": 10000,
  "documents": [
    {
      "type": "vehicle_rc",
      "documentNumber": "RC-1234567890",
      "documentUrl": "https://s3.amazonaws.com/rodistaa/trucks/rc_123.pdf"
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "trk_123",
    "registrationNumber": "MH-01-AB-1234",
    "type": "FTL",
    "capacity": 10000,
    "status": "active",
    "kycStatus": "pending",
    "operatorId": "usr_789"
  }
}
```

---

### Get Trucks

List all trucks for the operator.

**Endpoint**: `GET /trucks`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "trk_123",
      "registrationNumber": "MH-01-AB-1234",
      "type": "FTL",
      "status": "active",
      "kycStatus": "approved",
      "currentLocation": { /* ... */ }
    }
  ]
}
```

---

## Payments

### Initiate Payment

Initialize payment for a booking.

**Endpoint**: `POST /payments/initiate`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "bookingId": "bkg_789",
  "amount": 44000,
  "method": "upi"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "paymentId": "pay_123",
    "gatewayOrderId": "order_razorpay_123",
    "gatewayKey": "rzp_test_xxxxxxxx",
    "amount": 44000,
    "currency": "INR"
  }
}
```

---

### Verify Payment

Verify payment after gateway callback.

**Endpoint**: `POST /payments/verify`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "paymentId": "pay_123",
  "gatewayPaymentId": "pay_razorpay_456",
  "gatewaySignature": "abcd1234..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "paymentId": "pay_123",
    "status": "completed",
    "paidAt": "2024-01-15T11:00:00Z"
  }
}
```

---

## Error Responses

All API errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "mobile",
      "message": "Invalid mobile number format"
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400): Invalid request data
- `UNAUTHORIZED` (401): Missing or invalid authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

---

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 10 requests per 5 minutes per IP
- **Headers returned**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Timestamp when limit resets

---

## Webhooks

Rodistaa can send webhooks for important events. Contact support to configure webhook URLs.

### Webhook Events

- `booking.created`
- `booking.confirmed`
- `shipment.started`
- `shipment.delivered`
- `payment.completed`
- `kyc.approved`

### Webhook Payload Example

```json
{
  "event": "shipment.delivered",
  "timestamp": "2024-02-03T17:30:00Z",
  "data": {
    "shipmentId": "shp_001",
    "bookingId": "bkg_789",
    "deliveredAt": "2024-02-03T17:30:00Z"
  }
}
```

---

## Support

For API support, contact:
- **Email**: api-support@rodistaa.com
- **Documentation**: https://docs.rodistaa.com
- **Status Page**: https://status.rodistaa.com

