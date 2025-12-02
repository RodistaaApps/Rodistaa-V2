# Rodistaa Mobile Apps - Complete Implementation

## Overview

Three complete React Native (Expo) mobile apps have been implemented for the Rodistaa platform:
- **Shipper App** - For shippers to post loads, view bids, and track shipments
- **Operator App** - For operators to manage trucks, place bids, and assign drivers
- **Driver App** - For drivers to execute shipments, upload POD, and complete deliveries

## Architecture

### Shared Package (`packages/mobile/shared`)

**API Client & Hooks:**
- Typed API client with authentication
- React Query hooks for all endpoints
- Automatic token refresh
- Device binding support

**Utilities:**
- KYC encryption (AES-256-GCM)
- GPS utilities (permissions, accuracy checking, distance calculation)
- Media utilities (image/PDF picker, compression)
- Offline queue for failed requests

**UI Components:**
- Button (primary, secondary, outline variants)
- Input (with validation)
- Card (consistent styling)
- LoadingSpinner

**Background Services:**
- GPS ping service (Expo TaskManager)
- Background fetch for location updates

### Shipper App (`packages/mobile/shipper`)

**Features Implemented:**
1. **Authentication**
   - OTP-based login
   - Device binding
   - Token management with secure storage

2. **Booking Management**
   - Create bookings with pickup/drop details
   - View all bookings
   - View booking details and bids
   - Accept bids to finalize bookings

3. **Shipment Tracking**
   - View active shipments
   - Track shipment location
   - View shipment status

4. **KYC Upload**
   - Document capture (image/PDF)
   - Encryption before upload
   - Status tracking (Pending/Verified/Rejected)

5. **OTP Completion**
   - OTP entry screen
   - Delivery completion verification

**Screens:**
- `/login` - OTP-based authentication
- `/(tabs)/home` - Dashboard
- `/(tabs)/bookings` - Bookings list
- `/bookings/create` - Create new booking
- `/bookings/[id]` - Booking details with bids
- `/(tabs)/shipments` - Active shipments
- `/(tabs)/profile` - User profile and KYC

### Operator App (`packages/mobile/operator`)

**Features Implemented:**
1. **Authentication & KYC**
   - Operator registration
   - KYC upload (single KYC for all trucks)

2. **Truck Management**
   - Add trucks (max 10)
   - Upload truck photos (front/rear/sides/interior/plate)
   - View truck status (ACTIVE/PENDING_INSPECTION/EXPIRED_DOCS/BLOCKED)
   - Document expiry reminders

3. **Inspection Flows**
   - Daily inspection with photo capture
   - Geotag and timestamp
   - Inspection history

4. **Bid Management**
   - View available bookings
   - Submit and modify bids (unlimited)
   - Balance check (no negative allowed)

5. **Driver Assignment**
   - Assign drivers to trucks
   - Reassign with authentication

6. **Shipment Viewing**
   - View shipments for their trucks
   - Replace driver mid-shipment

**Screens:**
- `/login` - Authentication
- `/(tabs)/home` - Dashboard
- `/(tabs)/fleet` - Truck management
- `/fleet/add` - Add new truck
- `/fleet/[id]` - Truck details
- `/(tabs)/bookings` - Available bookings
- `/bookings/[id]/bid` - Place bid
- `/(tabs)/shipments` - Active shipments
- `/(tabs)/drivers` - Driver management
- `/(tabs)/profile` - Profile and KYC

### Driver App (`packages/mobile/driver`)

**Features Implemented:**
1. **Registration**
   - Driver registration
   - Driving license upload
   - KYC upload

2. **Shipment Execution**
   - View assigned shipments
   - Accept trip (mandatory)
   - Start trip

3. **GPS Streaming**
   - Live GPS updates every 60 seconds
   - Background location tracking

4. **Pickup/Drop Actions**
   - Capture geotagged photos at pickup
   - Capture geotagged photos at drop
   - POD upload (PDF or photo converted to PDF)

5. **Delay & Breakdown Reporting**
   - Free-form text reporting
   - Optional photo attachment
   - Backend notification

6. **OTP Delivery Completion**
   - OTP entry UI
   - Backend verification
   - Completion marking

**Screens:**
- `/login` - Authentication
- `/(tabs)/home` - Dashboard
- `/(tabs)/shipments` - Assigned shipments
- `/shipments/[id]` - Shipment details
- `/shipments/[id]/start` - Start trip
- `/shipments/[id]/pod` - Upload POD
- `/shipments/[id]/complete` - OTP completion
- `/(tabs)/profile` - Profile and documents

## Technical Stack

- **Framework:** React Native with Expo (~49.0.0)
- **Navigation:** Expo Router (file-based routing)
- **State Management:** Zustand + React Query
- **API Client:** Custom typed client with React Query hooks
- **Storage:** Expo SecureStore (tokens) + AsyncStorage (cache)
- **Background Services:** Expo TaskManager + BackgroundFetch
- **UI Components:** Custom branded components
- **TypeScript:** Full type safety

## Integration Points

All apps integrate with:
- **Backend API:** `http://localhost:4000/v1` (configurable)
- **Mock Services:** All external services use mocks (ADAPTER_MODE=MOCK)
  - Razorpay mock
  - Maps mock
  - RTA mock
  - IRP/eInvoice mock
  - Firebase mock

## Security Features

- KYC document encryption (AES-256-GCM)
- Secure token storage (Expo SecureStore)
- Device binding for authentication
- Offline queue for secure request retry

## Background Services

- GPS ping every 60 seconds during active shipments
- Offline queue processing when connection restored
- Background fetch for location updates

## Testing

Unit tests and E2E smoke test scripts are provided in:
- `packages/tests/mobile/` - Test scripts
- Individual app test directories

## Running the Apps

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Expo CLI
- Android Emulator or iOS Simulator

### Setup
```bash
# Install dependencies
pnpm install

# Start backend (in mock mode)
cd packages/backend
pnpm dev

# Start Shipper app
cd packages/mobile/shipper
pnpm start
# Then press 'a' for Android or 'i' for iOS

# Start Operator app
cd packages/mobile/operator
pnpm start

# Start Driver app
cd packages/mobile/driver
pnpm start
```

## Next Steps

1. **Complete Remaining Screens:** Some screens are scaffolded and need full implementation
2. **E2E Testing:** Run comprehensive end-to-end tests
3. **Performance Optimization:** Optimize image loading, list rendering
4. **Error Handling:** Enhance error messages and retry logic
5. **Localization:** Add Telugu, Hindi translations
6. **Dark Mode:** Implement optional dark theme

## Notes

- All apps use the shared package for common functionality
- API client automatically handles authentication tokens
- Offline queue ensures requests are retried when connection is restored
- GPS ping service runs in background during active shipments
- All external integrations use mocks (no credentials required)

