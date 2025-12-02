# Mobile Apps Verification Guide

## Prerequisites

1. **Backend Running:**
   ```bash
   cd packages/backend
   pnpm dev
   # Backend should be running on http://localhost:4000
   ```

2. **Mock Services Running:**
   ```bash
   cd packages/mocks
   pnpm dev
   # Mocks should be running on various ports
   ```

3. **Android Emulator or iOS Simulator:**
   - Android: Android Studio AVD Manager
   - iOS: Xcode Simulator

## Verification Steps

### 1. Shared Package

```bash
cd packages/mobile/shared
pnpm build
pnpm lint
```

**Expected:** Build succeeds, no lint errors

### 2. Shipper App

```bash
cd packages/mobile/shipper
pnpm install
pnpm start
# Press 'a' for Android or 'i' for iOS
```

**Test Flows:**
1. **Login:**
   - Enter phone number (10 digits)
   - Enter OTP (6 digits)
   - Should navigate to home screen

2. **Create Booking:**
   - Tap "Post New Load"
   - Fill in pickup/drop addresses
   - Enter weight, material type
   - Submit booking
   - Should see success message

3. **View Bids:**
   - Navigate to "My Bookings"
   - Tap on a booking
   - Should see bids list
   - Tap "Accept Bid" on a bid
   - Should finalize booking

4. **Track Shipment:**
   - Navigate to "Shipments"
   - Should see active shipments
   - Tap on a shipment to view details

### 3. Operator App

```bash
cd packages/mobile/operator
pnpm install
pnpm start
```

**Test Flows:**
1. **Login:**
   - Enter phone number and OTP
   - Should navigate to dashboard

2. **Add Truck:**
   - Navigate to "Fleet"
   - Tap "Add Truck"
   - Fill in truck details
   - Upload photos
   - Submit
   - Should see truck in fleet list

3. **Place Bid:**
   - Navigate to "Bookings"
   - View available bookings
   - Tap on a booking
   - Enter bid amount
   - Submit bid
   - Should see bid in list

4. **Inspection:**
   - Navigate to truck details
   - Tap "Daily Inspection"
   - Capture photo with geotag
   - Submit
   - Should see inspection in history

### 4. Driver App

```bash
cd packages/mobile/driver
pnpm install
pnpm start
```

**Test Flows:**
1. **Login:**
   - Enter phone number and OTP
   - Should navigate to dashboard

2. **View Shipment:**
   - Navigate to "Shipments"
   - Should see assigned shipments
   - Tap on a shipment

3. **Start Trip:**
   - Tap "Start Trip"
   - GPS should start pinging (every 60 seconds)
   - Should see location updates

4. **Upload POD:**
   - Navigate to shipment details
   - Tap "Upload POD"
   - Select image or PDF
   - Submit
   - Should see confirmation

5. **Complete Delivery:**
   - Enter OTP
   - Submit
   - Should mark shipment as complete

## API Verification

### Test Backend Endpoints

```bash
# Health check
curl http://localhost:4000/health

# Login (Shipper)
curl -X POST http://localhost:4000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "123456", "deviceId": "test-device"}'

# Create Booking
curl -X POST http://localhost:4000/v1/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "pickupAddress": "Bangalore",
    "dropAddress": "Chennai",
    "weightTons": 10,
    "materialType": "Electronics"
  }'
```

## Expected Results

### Shipper App
- ✅ Login with OTP works
- ✅ Create booking succeeds
- ✅ View bids on bookings
- ✅ Accept bid finalizes booking
- ✅ Shipment tracking shows location

### Operator App
- ✅ Login works
- ✅ Add truck with photos
- ✅ Place bid on booking
- ✅ Daily inspection with geotag
- ✅ View shipments for trucks

### Driver App
- ✅ Login works
- ✅ View assigned shipments
- ✅ Start trip enables GPS ping
- ✅ Upload POD (image/PDF)
- ✅ Complete delivery with OTP

## Troubleshooting

### App won't start
- Check Expo CLI is installed: `npm install -g expo-cli`
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && pnpm install`

### API calls failing
- Verify backend is running on port 4000
- Check API_URL in app config
- Verify authentication token is set

### GPS not working
- Check location permissions in app settings
- Verify location services are enabled on device
- Check Expo location plugin configuration

### Background services not working
- Verify TaskManager is registered
- Check background fetch permissions
- Ensure app is not killed by OS

## Screenshots

Screenshots should be captured for:
1. Login screen (all apps)
2. Home/Dashboard (all apps)
3. Booking creation (Shipper)
4. Bid placement (Operator)
5. Shipment tracking (Driver)
6. POD upload (Driver)

Save screenshots to `packages/mobile/screenshots/` directory.

