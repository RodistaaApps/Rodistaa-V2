/**
 * @rodistaa/app-shared
 *
 * Shared domain models, types, DTOs, and utilities for Rodistaa platform
 *
 * This package provides:
 * - Domain models (User, Truck, Booking, Shipment, etc.)
 * - ID generators (ULID-based with semantic prefixes)
 * - Generated OpenAPI types (from api/openapi.yaml)
 * - Common utility types
 *
 * @packageDocumentation
 */

// ===== Domain Models =====
// Manual domain models with business logic
export * from './models';

// ===== ID Generators =====
// ULID-based ID generators for all Rodistaa entities
export * from './idGen';

// ===== Common Types =====
// Utility types and shared interfaces
export * from './types';

// ===== Generated OpenAPI Types =====
// Auto-generated from api/openapi.yaml
// Regenerate with: npx openapi-typescript api/openapi.yaml -o packages/app-shared/src/generated/openapi-types.ts
export * from './generated';

// ===== Type Aliases for Convenience =====
// Re-export commonly used generated types for easier access
export type { components, paths, operations } from './generated/openapi-types';
