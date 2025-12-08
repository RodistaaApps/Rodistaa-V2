# Mock API Server for Rodistaa Mobile Apps

Mock API server for local development and testing of mobile apps.

## Usage

```bash
npm install
npm start
```

Server runs on `http://localhost:4000`

## Endpoints

- `POST /v1/auth/request-otp` - Request OTP
- `POST /v1/auth/verify-otp` - Verify OTP and login
- `GET /v1/bookings` - List bookings
- `GET /v1/operator/dashboard` - Operator dashboard data
- `GET /v1/shipper/dashboard` - Shipper dashboard data
- `GET /v1/driver/dashboard` - Driver dashboard data

## Test Credentials

- Shipper: `9876543210` / OTP: `123456`
- Operator: `9876543211` / OTP: `123456`
- Driver: `9876543212` / OTP: `123456`

