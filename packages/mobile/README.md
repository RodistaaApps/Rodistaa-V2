# Rodistaa Mobile Apps

This package contains three React Native Expo applications:
- **Shipper App**: For shippers to create bookings, approve drivers, track shipments
- **Operator App**: For operators to manage trucks, place bids, assign drivers
- **Driver App**: For drivers to execute shipments, upload photos, complete deliveries

## Structure

```
mobile/
├── shipper/      # Shipper mobile app
├── operator/     # Operator mobile app
├── driver/       # Driver mobile app
└── shared/       # Shared code (API client, storage, utilities)
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Development

```bash
# Install dependencies
pnpm install

# Start Shipper app
pnpm dev:shipper

# Start Operator app
pnpm dev:operator

# Start Driver app
pnpm dev:driver
```

## Features

### Shared Components
- API client with authentication
- Secure storage for tokens
- Device ID management
- Common utilities

### App-Specific Features

**Shipper App:**
- Create bookings
- View and accept bids
- Approve drivers
- Track shipments
- Complete deliveries with OTP

**Operator App:**
- Manage trucks
- Place and modify bids
- Assign drivers to shipments
- View ledger balance
- Track assigned shipments

**Driver App:**
- View assigned shipments
- Upload pickup/drop photos
- GPS tracking (background)
- Complete delivery with OTP
- Upload POD

## Configuration

Set environment variables in `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:4000/v1
EXPO_PUBLIC_ENABLE_LOGGING=true
```

## Building

```bash
# Build all apps
pnpm build:all
```

