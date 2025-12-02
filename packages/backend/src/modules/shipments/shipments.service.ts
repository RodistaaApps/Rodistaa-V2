/**
 * Shipments Service
 * Business logic for shipments with GPS and POD handling
 */

import * as shipmentsRepo from './shipments.repository';
import * as bookingsRepo from '../bookings/bookings.repository';
import * as bidsRepo from '../bids/bids.repository';
import { evaluateAcsRules } from '../acs-adapter';
import logger from 'pino';
import { Shipment, ShipmentStatus } from '@rodistaa/app-shared';
import crypto from 'crypto';

const log = logger({ name: 'shipments-service' });

/**
 * Create shipment from finalized booking
 */
export async function createShipmentFromBooking(bookingId: string): Promise<Shipment> {
  const booking = await bookingsRepo.getBookingById(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.status !== 'FINALIZED') {
    throw new Error('Booking must be finalized before creating shipment');
  }

  if (!booking.finalizedBidId) {
    throw new Error('Booking has no finalized bid');
  }

  const bid = await bidsRepo.getBidById(booking.finalizedBidId);
  if (!bid) {
    throw new Error('Finalized bid not found');
  }

  if (bid.status !== 'ACCEPTED') {
    throw new Error('Bid is not accepted');
  }

  // Check if shipment already exists
  const existingShipment = await shipmentsRepo.getShipmentById(bookingId);
  if (existingShipment) {
    throw new Error('Shipment already exists for this booking');
  }

  if (!bid.driverId || !bid.truckId) {
    throw new Error('Bid must have driver and truck assigned');
  }

  const shipment = await shipmentsRepo.createShipment({
    bookingId,
    bidId: bid.id,
    operatorId: bid.operatorId,
    driverId: bid.driverId,
    truckId: bid.truckId,
  });

  log.info({ shipmentId: shipment.id, bookingId }, 'Shipment created from booking');

  return shipment;
}

/**
 * Start shipment
 */
export async function startShipment(
  shipmentId: string,
  driverId: string
): Promise<Shipment> {
  const shipment = await shipmentsRepo.getShipmentById(shipmentId);
  if (!shipment) {
    throw new Error('Shipment not found');
  }

  if (shipment.driverId !== driverId) {
    throw new Error('Unauthorized: Only assigned driver can start shipment');
  }

  if (shipment.status !== 'PENDING') {
    throw new Error('Shipment cannot be started in current status');
  }

  return shipmentsRepo.updateShipmentStatus(shipmentId, 'IN_TRANSIT');
}

/**
 * Record GPS ping with ACS evaluation
 */
export async function recordGpsPing(
  shipmentId: string,
  ping: {
    latitude: number;
    longitude: number;
    timestamp: Date;
    accuracy?: number;
    speed?: number;
  },
  context: any
): Promise<void> {
  const shipment = await shipmentsRepo.getShipmentById(shipmentId);
  if (!shipment) {
    throw new Error('Shipment not found');
  }

  if (shipment.status !== 'IN_TRANSIT') {
    throw new Error('GPS ping can only be recorded for shipments in transit');
  }

  // Evaluate ACS rules for GPS ping
  const event = {
    type: 'gps.ping',
    payload: {
      shipmentId,
      latitude: ping.latitude,
      longitude: ping.longitude,
      timestamp: ping.timestamp.toISOString(),
      speed: ping.speed,
    },
  };

  const acsContext = {
    userId: context.userId || shipment.driverId,
    userRole: context.userRole || 'driver',
    deviceId: context.deviceId,
  };

  try {
    await evaluateAcsRules(event, acsContext);
  } catch (error: any) {
    if (error.message && error.message.includes('rejected')) {
      throw new Error(error.message);
    }
    log.warn({ error }, 'ACS evaluation warning (continuing)');
  }

  // Store GPS ping
  await shipmentsRepo.storeGpsPing(shipmentId, ping);

  log.debug({ shipmentId, latitude: ping.latitude, longitude: ping.longitude }, 'GPS ping recorded');
}

/**
 * Upload POD with duplicate detection
 */
export async function uploadPOD(
  shipmentId: string,
  pod: {
    fileHash: string;
    fileName: string;
    fileSize: number;
    uploadedBy: string;
    fileContent: Buffer;
  },
  context: any
): Promise<{ podId: string; requiresOTP: boolean }> {
  const shipment = await shipmentsRepo.getShipmentById(shipmentId);
  if (!shipment) {
    throw new Error('Shipment not found');
  }

  if (shipment.status !== 'IN_TRANSIT' && shipment.status !== 'DELIVERED') {
    throw new Error('POD can only be uploaded for shipments in transit or delivered');
  }

  // Evaluate ACS rules for POD upload (duplicate detection)
  const event = {
    type: 'pod.uploaded',
    payload: {
      shipmentId,
      fileHash: pod.fileHash,
      fileName: pod.fileName,
      fileSize: pod.fileSize,
    },
  };

  const acsContext = {
    userId: pod.uploadedBy,
    userRole: context.userRole || 'driver',
    deviceId: context.deviceId,
  };

  try {
    const matches = await evaluateAcsRules(event, acsContext);
    
    // Check for duplicate POD hash
    const duplicateMatch = matches.find((m: any) => 
      m.rule?.description?.toLowerCase().includes('duplicate')
    );

    if (duplicateMatch) {
      throw new Error('Duplicate POD detected - this file has been uploaded before');
    }
  } catch (error: any) {
    if (error.message && error.message.includes('rejected') || error.message.includes('Duplicate')) {
      throw error;
    }
    log.warn({ error }, 'ACS evaluation warning (continuing)');
  }

  // Generate OTP for completion
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store POD metadata
  await shipmentsRepo.storePOD(shipmentId, {
    ...pod,
    otp,
  });

  // Update shipment status to DELIVERED
  await shipmentsRepo.updateShipmentStatus(shipmentId, 'DELIVERED');

  log.info({ shipmentId, fileHash: pod.fileHash }, 'POD uploaded');

  return {
    podId: pod.fileHash,
    requiresOTP: true,
  };
}

/**
 * Complete shipment with OTP verification
 */
export async function completeShipment(
  shipmentId: string,
  otp: string,
  userId: string
): Promise<Shipment> {
  const shipment = await shipmentsRepo.getShipmentById(shipmentId);
  if (!shipment) {
    throw new Error('Shipment not found');
  }

  if (shipment.status !== 'DELIVERED') {
    throw new Error('Shipment must be delivered before completion');
  }

  // Verify OTP (would check against stored POD OTP in production)
  // For now, accept any 6-digit OTP
  if (!otp.match(/^\d{6}$/)) {
    throw new Error('Invalid OTP format');
  }

  // Update shipment status
  const completed = await shipmentsRepo.updateShipmentStatus(shipmentId, 'COMPLETED');

  log.info({ shipmentId }, 'Shipment completed');

  return completed;
}

/**
 * Get shipment by ID
 */
export async function getShipmentById(shipmentId: string): Promise<Shipment | null> {
  return shipmentsRepo.getShipmentById(shipmentId);
}

