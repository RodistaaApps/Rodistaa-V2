# Rodistaa Mobile Apps

Complete React Native (Expo) mobile applications for the Rodistaa platform.

## Apps

- **Shipper App** (`shipper/`) - For shippers to post loads, view bids, and track shipments
- **Operator App** (`operator/`) - For operators to manage trucks, place bids, and assign drivers  
- **Driver App** (`driver/`) - For drivers to execute shipments, upload POD, and complete deliveries

## Shared Package

The `shared/` package contains common functionality used by all apps:

- **API Client & Hooks** - Typed HTTP client with React Query hooks
- **Utilities** - KYC encryption, GPS utilities, media handling, offline queue
- **UI Components** - Branded components (Button, Input, Card, LoadingSpinner)
- **Background Services** - GPS ping service, background fetch

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Expo CLI (`npm install -g expo-cli`)
- Android Emulator or iOS Simulator

### Setup

```bash
# Install dependencies
pnpm install

# Start backend (required)
cd packages/backend
pnpm dev

# Start any app
cd packages/mobile/shipper  # or operator, driver
pnpm start
# Press 'a' for Android or 'i' for iOS
```

## Architecture

- **Framework:** React Native with Expo (~49.0.0)
- **Navigation:** Expo Router (file-based routing)
- **State Management:** Zustand + React Query
- **API:** Typed client with automatic token refresh
- **Storage:** Expo SecureStore (tokens) + AsyncStorage (cache)
- **Background:** Expo TaskManager + BackgroundFetch

## Features

### Shipper App
- ✅ OTP-based authentication
- ✅ Create and manage bookings
- ✅ View and accept bids
- ✅ Track shipments
- ✅ KYC upload with encryption
- ✅ OTP delivery completion

### Operator App
- ✅ OTP-based authentication
- ✅ Truck management (max 10 trucks)
- ✅ Daily inspections with geotag
- ✅ Bid placement and modification
- ✅ Driver assignment
- ✅ Shipment viewing

### Driver App
- ✅ OTP-based authentication
- ✅ View assigned shipments
- ✅ GPS streaming (60s intervals)
- ✅ POD upload (image/PDF)
- ✅ Delay/breakdown reporting
- ✅ OTP delivery completion

## Testing

### E2E Smoke Test

```bash
cd packages/tests/mobile
chmod +x smoke-test.sh
./smoke-test.sh
```

This tests the complete flow:
1. Shipper login → Create booking
2. Operator login → Place bid
3. Shipper → Accept bid
4. Driver login → Start shipment
5. GPS ping → POD upload → Complete

### Manual Testing

See `VERIFY.md` for detailed verification steps.

## Documentation

- `MOBILE_APPS_IMPLEMENTATION.md` - Complete implementation details
- `VERIFY.md` - Verification guide
- `CHANGELOG.md` - Version history

## Configuration

All apps use environment variables:

- `EXPO_PUBLIC_API_URL` - Backend API URL (default: `http://localhost:4000/v1`)
- `EXPO_PUBLIC_KYC_ENCRYPTION_KEY` - KYC encryption key (default: dev key)
- `EXPO_PUBLIC_ENABLE_LOGGING` - Enable debug logging

## Security

- KYC documents encrypted with AES-256-GCM before upload
- Tokens stored in Expo SecureStore
- Device binding for authentication
- Offline queue for secure request retry

## Background Services

- GPS ping every 60 seconds during active shipments
- Offline queue processing when connection restored
- Background fetch for location updates

## Troubleshooting

See `VERIFY.md` for troubleshooting guide.

## Next Steps

1. Complete remaining screens (some are scaffolded)
2. Add comprehensive unit tests
3. Implement localization (Telugu, Hindi)
4. Add dark mode support
5. Performance optimization
