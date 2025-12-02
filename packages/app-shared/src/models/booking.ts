/**
 * Booking Domain Model
 */

import { generateBookingId } from '../ids';

export enum BookingStatus {
  OPEN = 'OPEN',
  NEGOTIATION = 'NEGOTIATION',
  AUTO_FINALIZED = 'AUTO_FINALIZED',
  FINALIZED = 'FINALIZED',
  CANCELLED = 'CANCELLED',
}

export interface Booking {
  id: string; // RID-YYYYMMDD-xxxx
  shipperId: string; // USR-SH-<ulid>
  pickup: Location;
  drop: Location;
  goods: GoodsInfo;
  tonnage: number;
  expectedPrice: number; // AI-generated, only visible to shipper
  priceRange: {
    min: number;
    max: number;
  }; // Visible to operators
  status: BookingStatus;
  bidsCount: number;
  autoFinalizeAt?: Date; // System-configured timeout
  finalizedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  landmark?: string;
}

export interface GoodsInfo {
  type: string; // Description of goods
  weight?: number; // In tons
  packaging?: string; // e.g., "Bags", "Boxes"
  specialInstructions?: string;
  value?: number; // Declared value for insurance
}

