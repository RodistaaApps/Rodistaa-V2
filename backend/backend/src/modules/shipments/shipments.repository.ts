/**
 * Shipments Repository
 * Database operations for shipments
 */

import { query } from '../../db/connection';
import logger from 'pino';
import { generateShipmentId, Shipment, ShipmentStatus } from '@rodistaa/app-shared';

const log = logger({ name: 'shipments-repository' });

export interface ShipmentCreateInput {
  bookingId: string;
  bidId: string;
  operatorId: string;
  driverId: string;
  truckId: string;
}

/**
 * Create shipment from finalized booking
 */
export async function createShipment(input: ShipmentCreateInput): Promise<Shipment> {
  const shipmentId = generateShipmentId();

  try {
    await query(
      `INSERT INTO shipments (
        id, booking_id, bid_id, operator_id, driver_id, truck_id,
        status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [
        shipmentId,
        input.bookingId,
        input.bidId,
        input.operatorId,
        input.driverId,
        input.truckId,
        'PENDING',
      ]
    );

    return getShipmentById(shipmentId) as Promise<Shipment>;
  } catch (error: any) {
    log.error({ error, shipmentId }, 'Failed to create shipment');
    throw new Error('Failed to create shipment');
  }
}

/**
 * Get shipment by ID
 */
export async function getShipmentById(shipmentId: string): Promise<Shipment | null> {
  try {
    const result = await query(
      `SELECT * FROM shipments WHERE id = $1 LIMIT 1`,
      [shipmentId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapRowToShipment(result.rows[0]);
  } catch (error: any) {
    log.error({ error, shipmentId }, 'Failed to get shipment');
    throw error;
  }
}

/**
 * Update shipment status
 */
export async function updateShipmentStatus(
  shipmentId: string,
  status: ShipmentStatus
): Promise<Shipment> {
  try {
    await query(
      `UPDATE shipments SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, shipmentId]
    );

    return getShipmentById(shipmentId) as Promise<Shipment>;
  } catch (error: any) {
    log.error({ error, shipmentId }, 'Failed to update shipment status');
    throw error;
  }
}

/**
 * Store GPS ping
 */
export async function storeGpsPing(
  shipmentId: string,
  ping: {
    latitude: number;
    longitude: number;
    timestamp: Date;
    accuracy?: number;
    speed?: number;
  }
): Promise<void> {
  try {
    await query(
      `INSERT INTO gps_pings (shipment_id, latitude, longitude, timestamp, accuracy, speed, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        shipmentId,
        ping.latitude,
        ping.longitude,
        ping.timestamp,
        ping.accuracy || null,
        ping.speed || null,
      ]
    );
  } catch (error: any) {
    log.error({ error, shipmentId }, 'Failed to store GPS ping');
    throw error;
  }
}

/**
 * Store POD metadata
 */
export async function storePOD(
  shipmentId: string,
  pod: {
    fileHash: string;
    fileName: string;
    fileSize: number;
    uploadedBy: string;
    otp?: string;
  }
): Promise<void> {
  try {
    await query(
      `INSERT INTO pod_files (shipment_id, file_hash, file_name, file_size, uploaded_by, otp, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        shipmentId,
        pod.fileHash,
        pod.fileName,
        pod.fileSize,
        pod.uploadedBy,
        pod.otp || null,
      ]
    );
  } catch (error: any) {
    log.error({ error, shipmentId }, 'Failed to store POD');
    throw error;
  }
}

/**
 * Map database row to Shipment object
 */
function mapRowToShipment(row: any): Shipment {
  return {
    id: row.id,
    bookingId: row.booking_id,
    bidId: row.bid_id,
    shipperId: row.shipper_id,
    operatorId: row.operator_id,
    driverId: row.driver_id,
    truckId: row.truck_id,
    status: row.status as ShipmentStatus,
    pickup: typeof row.pickup === 'string' ? JSON.parse(row.pickup) : row.pickup,
    drop: typeof row.drop === 'string' ? JSON.parse(row.drop) : row.drop,
    goods: typeof row.goods === 'string' ? JSON.parse(row.goods) : row.goods,
    agreedPrice: parseFloat(row.agreed_price),
    tracking: typeof row.tracking === 'string' ? JSON.parse(row.tracking) : (row.tracking || { pings: [], lastUpdate: null }),
    photos: {
      pickup: row.pickup_photo ? JSON.parse(row.pickup_photo) : undefined,
      drop: row.drop_photo ? JSON.parse(row.drop_photo) : undefined,
    },
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

