# Mobile Apps Changelog

## [1.0.0] - 2024-01-15

### Added

#### Shared Package
- **API Client:** Typed HTTP client with authentication and device binding
- **React Query Hooks:** Typed hooks for all API endpoints (auth, bookings, bids, shipments, trucks, drivers)
- **KYC Encryption:** AES-256-GCM encryption utility for KYC documents
- **GPS Utilities:** Location permission handling, accuracy checking, distance calculation
- **Media Utilities:** Image/PDF picker, compression, base64 conversion
- **Offline Queue:** Automatic retry of failed requests when connection restored
- **Background Services:** GPS ping service using Expo TaskManager
- **UI Components:** Button, Input, Card, LoadingSpinner with Rodistaa branding

#### Shipper App
- **Authentication:** OTP-based login with device binding
- **Booking Management:** Create bookings, view all bookings, view booking details
- **Bid Management:** View bids on bookings, accept bids to finalize
- **Shipment Tracking:** View active shipments, track shipment location
- **KYC Upload:** Document capture with encryption before upload
- **OTP Completion:** OTP entry screen for delivery completion
- **Navigation:** Tab-based navigation (Home, Bookings, Shipments, Profile)

#### Operator App
- **Authentication:** OTP-based login
- **Truck Management:** Add trucks (max 10), upload photos, view truck status
- **Inspection Flows:** Daily inspection with photo capture, geotag, timestamp
- **Bid Management:** View available bookings, submit/modify bids (unlimited)
- **Driver Assignment:** Assign drivers to trucks, reassign with authentication
- **Shipment Viewing:** View shipments for their trucks, replace driver mid-shipment
- **Document Reminders:** 120-day inspection cycle, 5-day expiry notifications

#### Driver App
- **Registration:** Driver registration with DL upload and KYC
- **Shipment Execution:** View assigned shipments, accept trip, start trip
- **GPS Streaming:** Live GPS updates every 60 seconds via background service
- **Pickup/Drop Actions:** Capture geotagged photos at pickup and drop
- **POD Upload:** Upload POD as PDF or photo converted to PDF
- **Delay & Breakdown Reporting:** Free-form text reporting with optional photo
- **OTP Delivery Completion:** OTP entry UI with backend verification

### Technical Details

- **Framework:** React Native with Expo (~49.0.0)
- **Navigation:** Expo Router (file-based routing)
- **State Management:** Zustand + React Query
- **Storage:** Expo SecureStore (tokens) + AsyncStorage (cache)
- **Background Services:** Expo TaskManager + BackgroundFetch
- **TypeScript:** Full type safety throughout

### Integration

- All apps integrate with backend API at `http://localhost:4000/v1`
- All external services use mocks (ADAPTER_MODE=MOCK)
- No credentials required for local development

### Security

- KYC document encryption (AES-256-GCM)
- Secure token storage (Expo SecureStore)
- Device binding for authentication
- Offline queue for secure request retry

### Testing

- E2E smoke test script for complete flow
- Unit test structure in place
- Verification guide provided

### Documentation

- Implementation guide (MOBILE_APPS_IMPLEMENTATION.md)
- Verification guide (VERIFY.md)
- E2E smoke test script (tests/mobile/smoke-test.sh)

