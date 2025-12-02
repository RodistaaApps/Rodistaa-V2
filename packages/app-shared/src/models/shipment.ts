/**
 * Shipment Domain Model
 */

import { generateShipmentId } from '../ids';

export enum ShipmentStatus {
  ASSIGNED = 'ASSIGNED',
  DRIVER_PENDING_APPROVAL = 'DRIVER_PENDING_APPROVAL',
  IN_TRANSIT = 'IN_TRANSIT',
  AT_PICKUP = 'AT_PICKUP',
  AT_DESTINATION = 'AT_DESTINATION',
  OTP_PENDING = 'OTP_PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  FROZEN = 'FROZEN', // ACS frozen
}

export interface Shipment {
  id: string; // SH-<ulid>
  bookingId: string; // RID-YYYYMMDD-xxxx
  bidId: string; // BK-<ulid>
  shipperId: string; // USR-SH-<ulid>
  operatorId: string; // USR-OP-<ulid>
  driverId?: string; // USR-DR-<ulid>
  truckId?: string; // TRK-<regno>-<ulid>
  alternateTruckId?: string; // For breakdown/accident scenarios
  status: ShipmentStatus;
  pickup: ShipmentLocation;
  drop: ShipmentLocation;
  goods: ShipmentGoodsInfo;
  agreedPrice: number;
  tracking: TrackingInfo;
  otp?: {
    code: string; // OTP sent to shipper
    generatedAt: Date;
    expiresAt: Date;
    attempts: number; // Max 5 attempts
    verifiedAt?: Date;
  };
  pod?: {
    id: string; // POD-<ulid>
    url: string; // Encrypted
    uploadedAt: Date;
    fileHash: string; // For duplicate detection
  };
  photos: {
    pickup?: Photo;
    drop?: Photo;
  };
  breakdown?: BreakdownInfo;
  delay?: DelayInfo;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ShipmentLocation {
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface ShipmentGoodsInfo {
  type: string;
  weight: number; // In tons
}

export interface TrackingInfo {
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  route: TrackingPoint[];
  lastPingAt?: Date;
  pingIntervalSeconds: number; // Default 60
  alertThresholdMinutes: number; // Default 30
  isAlertActive: boolean;
}

export interface TrackingPoint {
  lat: number;
  lng: number;
  timestamp: Date;
  speed?: number; // km/h
  heading?: number; // degrees
}

export interface Photo {
  url: string; // Encrypted
  geoTag: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
}

export interface BreakdownInfo {
  reportedAt: Date;
  reason: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  photos: string[]; // Encrypted URLs
  alternateTruckAssigned: boolean;
  alternateTruckId?: string;
}

export interface DelayInfo {
  reportedAt: Date;
  reason: string;
  estimatedDelayMinutes: number;
  status: 'RESOLVED' | 'ONGOING';
}

