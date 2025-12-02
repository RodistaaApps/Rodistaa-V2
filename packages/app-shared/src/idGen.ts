/**
 * ID Generators for Rodistaa Platform
 *
 * All IDs use ULID (Universally Unique Lexicographically Sortable Identifier)
 * for time-ordered, globally unique identifiers.
 *
 * Format conventions (as per Decision 014):
 * - Bookings:  RID-YYYYMMDD-xxxx (e.g., RID-20240115-0001)
 * - Shipments: SH-<ulid> (e.g., SH-01ARZ3NDEKTSV4RRFFQ69G5FAV)
 * - Bids:      BK-<ulid> (e.g., BK-01ARZ3NDEKTSV4RRFFQ69G5FAV)
 * - Users:     USR-<role>-<ulid> (e.g., USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV)
 * - Trucks:    TRK-<regno>-<ulid> (e.g., TRK-MH01AB1234-01ARZ3NDEKTSV4RRFFQ69G5FAV)
 * - PODs:      POD-<ulid> (e.g., POD-01ARZ3NDEKTSV4RRFFQ69G5FAV)
 * - KYC:       KYC-<ulid> (backend-only)
 * - Blocks:    BLK-<ulid> (ACS blocks)
 * - Overrides: OVR-<ulid> (admin overrides)
 * - Ledgers:   LDG-<ulid> (ledger entries)
 *
 * @see DECISIONS.md - Decision 014: OpenAPI-First API Development
 */

import { ulid } from 'ulid';

/**
 * User roles in the Rodistaa platform
 */
export enum UserRole {
  SHIPPER = 'SH',
  OPERATOR = 'OP',
  DRIVER = 'DR',
  ADMIN = 'AD',
  FRANCHISE_UNIT = 'FU',
  FRANCHISE_DISTRICT = 'FD',
  KYC_ADMIN = 'KA',
}

/**
 * Entity types for generic ID generation
 */
export enum EntityType {
  BOOKING = 'booking',
  SHIPMENT = 'shipment',
  BID = 'bid',
  USER = 'user',
  TRUCK = 'truck',
  POD = 'pod',
  KYC = 'kyc',
  BLOCK = 'block',
  OVERRIDE = 'override',
  LEDGER = 'ledger',
  INSPECTION = 'inspection',
  AUDIT = 'audit',
}

/**
 * Generate a Booking ID
 * Format: RID-YYYYMMDD-xxxx
 */
export function generateBookingId(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Generate 4-digit sequential number (in production, use DB sequence)
  const seq = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  return `RID-${dateStr}-${seq}`;
}

/**
 * Generate a Shipment ID
 * Format: SH-<ulid>
 */
export function generateShipmentId(): string {
  return `SH-${ulid()}`;
}

/**
 * Generate a Bid ID
 * Format: BK-<ulid>
 */
export function generateBidId(): string {
  return `BK-${ulid()}`;
}

/**
 * Generate a User ID
 * Format: USR-<role>-<ulid>
 */
export function generateUserId(role: UserRole): string {
  return `USR-${role}-${ulid()}`;
}

/**
 * Generate a Truck ID
 * Format: TRK-<regno>-<ulid>
 */
export function generateTruckId(regNo: string): string {
  // Sanitize reg number (remove spaces and dashes, convert to uppercase)
  const sanitized = regNo.replace(/[\s-]+/g, '').toUpperCase();
  return `TRK-${sanitized}-${ulid()}`;
}

/**
 * Generate a POD ID
 * Format: POD-<ulid>
 */
export function generatePodId(): string {
  return `POD-${ulid()}`;
}

/**
 * Generate a KYC ID (backend-only)
 * Format: KYC-<ulid>
 */
export function generateKycId(): string {
  return `KYC-${ulid()}`;
}

/**
 * Generate a Block ID (ACS)
 * Format: BLK-<ulid>
 */
export function generateBlockId(): string {
  return `BLK-${ulid()}`;
}

/**
 * Generate an Override Request ID
 * Format: OVR-<ulid>
 */
export function generateOverrideId(): string {
  return `OVR-${ulid()}`;
}

/**
 * Generate a Ledger Entry ID
 * Format: LDG-<ulid>
 */
export function generateLedgerId(): string {
  return `LDG-${ulid()}`;
}

/**
 * Generate an Inspection ID
 * Format: INS-<ulid>
 */
export function generateInspectionId(): string {
  return `INS-${ulid()}`;
}

/**
 * Generate an Audit Log ID
 * Format: AUD-<ulid>
 */
export function generateAuditId(): string {
  return `AUD-${ulid()}`;
}

/**
 * Generic ID generator based on entity type
 *
 * @param type - Entity type
 * @param params - Additional parameters (role for users, regNo for trucks, date for bookings)
 * @returns Generated ID string
 *
 * @example
 * ```typescript
 * generateId(EntityType.BOOKING, { date: new Date() })
 * // => "RID-20240115-0001"
 *
 * generateId(EntityType.USER, { role: UserRole.SHIPPER })
 * // => "USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV"
 *
 * generateId(EntityType.TRUCK, { regNo: 'MH 01 AB 1234' })
 * // => "TRK-MH01AB1234-01ARZ3NDEKTSV4RRFFQ69G5FAV"
 * ```
 */
export function generateId(
  type: EntityType,
  params?: {
    role?: UserRole;
    regNo?: string;
    date?: Date;
  }
): string {
  switch (type) {
    case EntityType.BOOKING:
      return generateBookingId(params?.date);
    case EntityType.SHIPMENT:
      return generateShipmentId();
    case EntityType.BID:
      return generateBidId();
    case EntityType.USER:
      if (!params?.role) {
        throw new Error('User role is required for user ID generation');
      }
      return generateUserId(params.role);
    case EntityType.TRUCK:
      if (!params?.regNo) {
        throw new Error('Registration number is required for truck ID generation');
      }
      return generateTruckId(params.regNo);
    case EntityType.POD:
      return generatePodId();
    case EntityType.KYC:
      return generateKycId();
    case EntityType.BLOCK:
      return generateBlockId();
    case EntityType.OVERRIDE:
      return generateOverrideId();
    case EntityType.LEDGER:
      return generateLedgerId();
    case EntityType.INSPECTION:
      return generateInspectionId();
    case EntityType.AUDIT:
      return generateAuditId();
    default:
      throw new Error(`Unknown entity type: ${String(type)}`);
  }
}

/**
 * Validate ID format for a given entity type
 *
 * @param id - ID string to validate
 * @param type - Expected entity type
 * @returns true if ID format is valid
 */
export function validateIdFormat(id: string, type: EntityType): boolean {
  const patterns: Record<EntityType, RegExp> = {
    [EntityType.BOOKING]: /^RID-\d{8}-\d{4}$/,
    [EntityType.SHIPMENT]: /^SH-[0-9A-Z]{26}$/,
    [EntityType.BID]: /^BK-[0-9A-Z]{26}$/,
    [EntityType.USER]: /^USR-(SH|OP|DR|AD|FU|FD|KA)-[0-9A-Z]{26}$/,
    [EntityType.TRUCK]: /^TRK-[A-Z0-9]+-[0-9A-Z]{26}$/,
    [EntityType.POD]: /^POD-[0-9A-Z]{26}$/,
    [EntityType.KYC]: /^KYC-[0-9A-Z]{26}$/,
    [EntityType.BLOCK]: /^BLK-[0-9A-Z]{26}$/,
    [EntityType.OVERRIDE]: /^OVR-[0-9A-Z]{26}$/,
    [EntityType.LEDGER]: /^LDG-[0-9A-Z]{26}$/,
    [EntityType.INSPECTION]: /^INS-[0-9A-Z]{26}$/,
    [EntityType.AUDIT]: /^AUD-[0-9A-Z]{26}$/,
  };

  return patterns[type].test(id);
}

/**
 * Extract entity type from ID prefix
 *
 * @param id - ID string
 * @returns Entity type or null if not recognized
 */
export function extractEntityType(id: string): EntityType | null {
  if (id.startsWith('RID-')) return EntityType.BOOKING;
  if (id.startsWith('SH-')) return EntityType.SHIPMENT;
  if (id.startsWith('BK-')) return EntityType.BID;
  if (id.startsWith('USR-')) return EntityType.USER;
  if (id.startsWith('TRK-')) return EntityType.TRUCK;
  if (id.startsWith('POD-')) return EntityType.POD;
  if (id.startsWith('KYC-')) return EntityType.KYC;
  if (id.startsWith('BLK-')) return EntityType.BLOCK;
  if (id.startsWith('OVR-')) return EntityType.OVERRIDE;
  if (id.startsWith('LDG-')) return EntityType.LEDGER;
  if (id.startsWith('INS-')) return EntityType.INSPECTION;
  if (id.startsWith('AUD-')) return EntityType.AUDIT;
  return null;
}
