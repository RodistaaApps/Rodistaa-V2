/**
 * ID Generators for Rodistaa Platform
 * 
 * Format conventions:
 * - RID-YYYYMMDD-xxxxxxxx for Bookings
 * - SH-<ulid> for Shipments
 * - BK-<ulid> for Bids
 * - USR-<role>-<ulid> for Users
 * - TRK-<regno>-<ulid> for Trucks
 * - POD-<ulid> for PODs
 */

import { ulid } from 'ulid';

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
 * Generate a Booking ID
 * Format: RID-YYYYMMDD-xxxx
 */
export function generateBookingId(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Generate 4-digit sequential number (in production, use DB sequence)
  const seq = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
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
  // Sanitize reg number (remove spaces, convert to uppercase)
  const sanitized = regNo.replace(/\s+/g, '').toUpperCase();
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
 * Generate a KYC ID (backend-only UUID)
 * Format: KYC-<ulid>
 */
export function generateKycId(): string {
  return `KYC-${ulid()}`;
}

/**
 * Parse ID to extract type and components
 */
export interface ParsedId {
  type: 'booking' | 'shipment' | 'bid' | 'user' | 'truck' | 'pod' | 'kyc' | 'unknown';
  components: Record<string, string>;
}

export function parseId(id: string): ParsedId {
  if (id.startsWith('RID-')) {
    const parts = id.split('-');
    return {
      type: 'booking',
      components: {
        date: parts[1],
        sequence: parts[2],
      },
    };
  }
  
  if (id.startsWith('SH-')) {
    return {
      type: 'shipment',
      components: {
        ulid: id.substring(3),
      },
    };
  }
  
  if (id.startsWith('BK-')) {
    return {
      type: 'bid',
      components: {
        ulid: id.substring(3),
      },
    };
  }
  
  if (id.startsWith('USR-')) {
    const parts = id.split('-');
    return {
      type: 'user',
      components: {
        role: parts[1],
        ulid: parts.slice(2).join('-'),
      },
    };
  }
  
  if (id.startsWith('TRK-')) {
    const parts = id.split('-');
    // Extract registration number (everything between TRK- and last -)
    const regNo = parts.slice(1, -1).join('-');
    return {
      type: 'truck',
      components: {
        regNo,
        ulid: parts[parts.length - 1],
      },
    };
  }
  
  if (id.startsWith('POD-')) {
    return {
      type: 'pod',
      components: {
        ulid: id.substring(4),
      },
    };
  }
  
  if (id.startsWith('KYC-')) {
    return {
      type: 'kyc',
      components: {
        ulid: id.substring(4),
      },
    };
  }
  
  return {
    type: 'unknown',
    components: {},
  };
}

