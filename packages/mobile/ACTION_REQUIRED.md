# Action Required - Environment Variables & Configuration

This document lists any environment variables, API keys, or configuration needed for the Home, Header, Footer, and Profile screens to function properly in production.

## Current Status

### ✅ No Keys Required for Current Implementation

The current implementation uses **mock data** and does not require any external service keys or API credentials. All functionality is demonstrated using local mock API endpoints.

## Future Production Requirements

When integrating with real backend services, the following may be required:

### 1. API Base URL

**Environment Variable**: `REACT_NATIVE_API_BASE_URL`

**Example**: 
```
REACT_NATIVE_API_BASE_URL=https://api.rodistaa.com
```

**Required For**: 
- Dashboard data fetching
- Profile data loading
- Document viewing
- Notification fetching

**Scope**: Read-only for mobile apps

### 2. Document Storage (if using signed URLs)

**Service**: AWS S3 / Google Cloud Storage / Azure Blob Storage

**Environment Variables**:
- `DOCUMENT_STORAGE_BUCKET` (bucket name)
- `DOCUMENT_STORAGE_REGION` (region)

**Required For**: 
- Document viewing (`/mobile/v1/documents/:docId/view` endpoint)
- Profile photo uploads

**Scope**: Read access for documents, Write access for profile photos only

### 3. Maps API (if adding map features to Home screens)

**Service**: Google Maps / Mapbox

**Environment Variable**: `MAPS_API_KEY`

**Required For**: 
- Location display on Home screens
- Route visualization
- Distance calculations

**Scope**: Mobile SDK key with restricted API permissions (Maps SDK, Geocoding API)

### 4. Push Notifications (if adding real-time notifications)

**Service**: Firebase Cloud Messaging (FCM) / Apple Push Notification Service (APNs)

**Environment Variables**:
- `FCM_SENDER_ID` (Firebase)
- `FCM_SERVER_KEY` (Backend only, not mobile)

**Required For**: 
- Real-time notification delivery
- Notification badge counts

**Scope**: Mobile app registration tokens only

### 5. Analytics (Optional)

**Service**: Firebase Analytics / Mixpanel / Amplitude

**Environment Variable**: `ANALYTICS_API_KEY`

**Required For**: 
- User behavior tracking
- Screen view analytics

**Scope**: Mobile SDK key with write-only permissions

## Implementation Notes

### Mock API Server

Currently, all mobile apps use a mock API server running at `http://localhost:4000`. This is configured in:

- `packages/mocks/mobile-api/src/index.js`

To switch to production APIs:

1. Update API client configuration in `packages/mobile/shared/src/api/config.ts`
2. Set `REACT_NATIVE_API_BASE_URL` environment variable
3. Remove mock API server dependency

### Document Viewing Security

The document viewing flow requires:
1. **Reason capture** - User must provide reason before viewing
2. **Audit logging** - All document views are logged
3. **Signed URLs** - Documents accessed via time-limited signed URLs

Backend endpoint: `POST /mobile/v1/documents/:docId/view`

**Request Body**:
```json
{
  "reason": "Customer service inquiry"
}
```

**Response**:
```json
{
  "signedUrl": "https://storage.example.com/doc.pdf?token=..."
}
```

## Testing Without Keys

All current functionality can be tested using:
- ✅ Mock API server (no keys needed)
- ✅ Local mock data
- ✅ Storybook stories (no backend required)
- ✅ Unit tests (no external services)

## Next Steps When Going to Production

1. **Set up environment configuration**
   - Create `.env` files for each environment (dev, staging, prod)
   - Add environment variable loading in app initialization

2. **Update API client**
   - Point to production API base URL
   - Add authentication headers
   - Implement token refresh logic

3. **Configure document storage**
   - Set up S3/GCS bucket with proper IAM roles
   - Configure signed URL generation on backend
   - Test document viewing flow end-to-end

4. **Add monitoring**
   - Set up error tracking (Sentry, Bugsnag)
   - Add analytics for screen views and actions
   - Monitor API response times

5. **Security review**
   - Verify all sensitive data is masked (mobile numbers, etc.)
   - Ensure document access is properly audited
   - Review API endpoint permissions

## Support

For questions about configuration or keys, contact:
- Backend team for API endpoints
- DevOps team for infrastructure setup
- Security team for access permissions

---

**Last Updated**: 2025-01-XX
**Status**: ✅ No immediate action required (using mocks)

