# Rodistaa API Specification

This directory contains the OpenAPI 3.0.3 specification for the Rodistaa Platform API.

## File Structure

- `openapi.yaml` - Complete OpenAPI specification covering all endpoints

## Code Generation

### Generate TypeScript Types for `app-shared` Package

Generate TypeScript interfaces and DTOs for use in the shared package:

```bash
# Using openapi-typescript-codegen
npx openapi-typescript-codegen --input api/openapi.yaml --output packages/app-shared/src/generated --client axios
```

Or using `openapi-generator-cli`:

```bash
# Install openapi-generator-cli globally if needed
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript types
openapi-generator-cli generate \
  -i api/openapi.yaml \
  -g typescript-axios \
  -o packages/app-shared/src/generated \
  --additional-properties=supportsES6=true,withInterfaces=true
```

### Generate TypeScript Fetch Client for Portal

Generate a TypeScript fetch client for the Next.js portal:

```bash
openapi-generator-cli generate \
  -i api/openapi.yaml \
  -g typescript-fetch \
  -o packages/portal/src/api-client \
  --additional-properties=typescriptThreePlus=true,supportsES6=true
```

### Alternative: Use `openapi-typescript`

Generate TypeScript types only (no client code):

```bash
npx openapi-typescript api/openapi.yaml -o packages/app-shared/src/generated/types.ts
```

## Validation

### Validate OpenAPI Specification

Validate the OpenAPI spec using `openapi-cli`:

```bash
# Install openapi-cli globally if needed
npm install -g @apidevtools/swagger-cli

# Validate the spec
swagger-cli validate api/openapi.yaml
```

Or using `redoc-cli`:

```bash
# Install redoc-cli globally if needed
npm install -g redoc-cli

# Validate and preview
redoc-cli lint api/openapi.yaml
```

### Using Spectral (Linting)

Install and use Spectral for OpenAPI linting:

```bash
# Install Spectral globally
npm install -g @stoplight/spectral-cli

# Run linting
spectral lint api/openapi.yaml
```

## Preview Documentation

### Generate Interactive Documentation

```bash
# Using redoc-cli to generate HTML
redoc-cli bundle api/openapi.yaml -o api/docs.html

# Using Swagger UI
npx swagger-ui-watcher api/openapi.yaml
```

## Integration with Monorepo

The generated types are used across the monorepo:

- `packages/app-shared/src/generated/` - Shared TypeScript types
- `packages/backend/src/` - Backend uses types from app-shared
- `packages/mobile/shared/src/` - Mobile apps use types from app-shared
- `packages/portal/src/api-client/` - Portal-specific API client

## Versioning

The API follows semantic versioning:
- Major version changes: Breaking API changes
- Minor version changes: New endpoints or fields (backward compatible)
- Patch version changes: Documentation updates, bug fixes

## Rate Limiting

All endpoints include rate limit headers:
- `X-RateLimit-Limit`: Maximum requests per time window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `Retry-After`: Seconds to wait when rate limit is exceeded (HTTP 429)

Rate limits vary by endpoint:
- Authentication endpoints: 10 requests/hour
- Booking creation: 100 requests/day
- GPS pings: 1000 requests/hour
- Default: 1000 requests/hour

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained via `/auth/login` and refreshed via `/auth/refresh`.

## Pagination

List endpoints support pagination using query parameters:
- `page`: Page number (default: 1, minimum: 1)
- `pageSize`: Items per page (default: 20, minimum: 1, maximum: 100)

Response includes pagination metadata:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Error Responses

All error responses follow a consistent format:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {}
}
```

Common error codes:
- `VALIDATION_ERROR`: Request validation failed
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `KYC_REQUIRED`: KYC verification required
- `INSUFFICIENT_BALANCE`: Insufficient ledger balance

## Webhooks

Webhooks can be registered for various events:
- `booking.created`
- `booking.finalized`
- `shipment.assigned`
- `shipment.completed`
- `payment.succeeded`
- `acs.block`

Register webhooks via `/webhooks/register` endpoint.

## Development

### Local Development Server

The API spec includes a local development server configuration:
- URL: `http://localhost:3000/v1`

### Mocking

For local development, use mock services in `packages/mocks/`:
- Razorpay Mock
- Google Maps Mock
- Vahan Mock
- IRP Mock
- SIP Mock

## References

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [OpenAPI Tools](https://openapi.tools/)
- [TypeScript OpenAPI Generators](https://openapi-generator.tech/docs/generators/typescript)

