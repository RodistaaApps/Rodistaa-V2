# Action Required - External Dependencies

This document lists external credentials, keys, and configurations required for full functionality.

## Required for Production

### Maps & Location Services
- **Google Maps API Key** (for live tracking, route visualization)
  - Location: Android `AndroidManifest.xml`, iOS `Info.plist`
  - Alternative: Mapbox API key
  - Status: ⚠️ Currently using mock/dummy data

### Payment Gateway
- **Razorpay API Keys** (for payment processing)
  - Location: Environment variables
  - Status: ⚠️ Mock implementation in place

### Firebase/Backend
- **Firebase Service Account** (if using Firebase for backend)
  - Status: ⚠️ Not required for current implementation

### Image/File Storage
- **MinIO/AWS S3 Credentials** (for POD uploads, document storage)
  - Status: ⚠️ Mock upload endpoints in mock API server

## Development
All functionality works with mock APIs. Replace mock endpoints with real API URLs when ready:
- Update `packages/mobile/shared/src/api/config.ts` with production API URL
- Replace mock API server with real backend endpoints

## Next Steps
1. Obtain Google Maps API key for live tracking features
2. Configure Razorpay keys for payment processing
3. Set up MinIO/S3 bucket for file uploads
4. Update API base URL in config files
