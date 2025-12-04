/**
 * OEM Telematics Integration Service
 * Integrates with truck manufacturer telematics systems (TATA, Ashok Leyland, etc.)
 * Supports multiple protocols: HTTP, MQTT, NMEA
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { logger } from '../../utils/logger';
import * as gpsService from './gps.service';

const log = logger.child({ module: 'oem-telematics-service' });

export interface OEMDevice {
  id: string;
  deviceId: string;
  manufacturer: string;
  model?: string;
  imei: string;
  truckId?: string;
  status: string;
  apiEndpoint?: string;
  protocol: string;
}

export interface OEMLocationData {
  deviceId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  odometer?: number;
  fuelLevel?: number;
  engineStatus?: string;
  timestamp: Date;
  rawPayload: any;
}

/**
 * Register OEM device
 */
export async function registerOEMDevice(
  deviceId: string,
  manufacturer: string,
  imei: string,
  truckId: string,
  options?: {
    model?: string;
    simNumber?: string;
    apiEndpoint?: string;
    apiKey?: string;
    protocol?: string;
    dataFormat?: string;
    pollingInterval?: number;
  }
): Promise<OEMDevice> {
  try {
    const id = uuid();

    await query(
      `INSERT INTO oem_telematic_devices
       (id, device_id, manufacturer, model, imei, sim_number, truck_id, 
        api_endpoint, protocol, data_format, polling_interval_seconds, status, installed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'ACTIVE', NOW())`,
      [
        id,
        deviceId,
        manufacturer,
        options?.model,
        imei,
        options?.simNumber,
        truckId,
        options?.apiEndpoint,
        options?.protocol || 'HTTP',
        options?.dataFormat || 'JSON',
        options?.pollingInterval || 60,
      ]
    );

    log.info({ deviceId, manufacturer, truckId }, 'OEM device registered');

    return {
      id,
      deviceId,
      manufacturer,
      model: options?.model,
      imei,
      truckId,
      status: 'ACTIVE',
      apiEndpoint: options?.apiEndpoint,
      protocol: options?.protocol || 'HTTP',
    };
  } catch (error: any) {
    log.error({ error, deviceId }, 'Failed to register OEM device');
    throw error;
  }
}

/**
 * Ingest location data from OEM device
 */
export async function ingestOEMData(data: OEMLocationData): Promise<void> {
  try {
    // Store raw OEM data
    await query(
      `INSERT INTO oem_telematic_data
       (id, device_id, latitude, longitude, speed, odometer, fuel_level, engine_status,
        device_timestamp, raw_payload, processed)
       VALUES ($1, (SELECT id FROM oem_telematic_devices WHERE device_id = $2), $3, $4, $5, $6, $7, $8, $9, $10, FALSE)`,
      [
        uuid(),
        data.deviceId,
        data.latitude,
        data.longitude,
        data.speed,
        data.odometer,
        data.fuelLevel,
        data.engineStatus || 'UNKNOWN',
        data.timestamp,
        JSON.stringify(data.rawPayload),
      ]
    );

    // Update device heartbeat
    await query(
      `UPDATE oem_telematic_devices
       SET last_heartbeat_at = NOW(), updated_at = NOW()
       WHERE device_id = $1`,
      [data.deviceId]
    );

    log.info({ deviceId: data.deviceId, lat: data.latitude, lng: data.longitude }, 'OEM data ingested');
  } catch (error) {
    log.error({ error, deviceId: data.deviceId }, 'Failed to ingest OEM data');
    throw new Error('Failed to ingest OEM telematic data');
  }
}

/**
 * Process unprocessed OEM data (convert to GPS points)
 * This runs as a scheduled job to process raw OEM data into standardized GPS points
 */
export async function processOEMData(): Promise<{ processed: number }> {
  try {
    // Get unprocessed OEM data with shipment context
    const result = await query(
      `SELECT 
         d.id AS oem_data_id,
         d.device_id,
         dev.truck_id,
         d.latitude,
         d.longitude,
         d.speed,
         d.device_timestamp,
         s.id AS shipment_id,
         s.driver_id
       FROM oem_telematic_data d
       JOIN oem_telematic_devices dev ON dev.id = d.device_id
       LEFT JOIN shipments s ON s.truck_id = dev.truck_id AND s.status IN ('IN_TRANSIT', 'PICKUP_PENDING')
       WHERE d.processed = FALSE
       AND d.device_timestamp >= NOW() - INTERVAL '1 hour'
       ORDER BY d.device_timestamp ASC
       LIMIT 1000`
    );

    let processed = 0;

    for (const row of result.rows) {
      if (row.shipment_id && row.driver_id) {
        // Convert OEM data to GPS point
        await gpsService.recordLocationPoint(
          row.shipment_id,
          row.driver_id,
          {
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            speed: row.speed ? parseFloat(row.speed) : undefined,
            recordedAt: row.device_timestamp,
          }
        );
      }

      // Mark as processed
      await query(
        `UPDATE oem_telematic_data
         SET processed = TRUE, processed_at = NOW()
         WHERE id = $1`,
        [row.oem_data_id]
      );

      processed++;
    }

    if (processed > 0) {
      log.info({ processed }, 'OEM data processed');
    }

    return { processed };
  } catch (error) {
    log.error({ error }, 'Failed to process OEM data');
    throw new Error('Failed to process OEM telematic data');
  }
}

/**
 * Mock OEM data ingestion (for testing without real OEM devices)
 */
export async function simulateOEMData(
  deviceId: string,
  shipmentId: string
): Promise<void> {
  // Generate mock location data along a route
  // This would be replaced with actual OEM API integration
  const mockLocations = [
    { lat: 17.3850, lng: 78.4867 }, // Hyderabad
    { lat: 17.4, lng: 78.5 },
    { lat: 17.42, lng: 78.52 },
  ];

  for (const loc of mockLocations) {
    await ingestOEMData({
      deviceId,
      latitude: loc.lat,
      longitude: loc.lng,
      speed: 60 + Math.random() * 20,
      engineStatus: 'ON',
      timestamp: new Date(),
      rawPayload: { mock: true },
    });

    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
  }
}

