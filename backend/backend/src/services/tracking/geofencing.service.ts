/**
 * Geofencing Service  
 * Detects entry/exit events for yards, pickup, and delivery locations
 * Triggers automated alerts and workflow actions
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { ulid } from 'ulid';
import { logger } from '../../utils/logger';

const log = logger.child({ module: 'geofencing-service' });

export interface Geofence {
  id: string;
  geofenceId: string;
  name: string;
  type: string;
  centerLatitude?: number;
  centerLongitude?: number;
  radiusMeters?: number;
  polygonCoordinates?: Array<[number, number]>;
  isActive: boolean;
}

export interface GeofenceEvent {
  eventId: string;
  geofenceId: string;
  shipmentId: string;
  driverId: string;
  eventType: 'ENTRY' | 'EXIT';
  latitude: number;
  longitude: number;
  occurredAt: Date;
}

/**
 * Create geofence
 */
export async function createGeofence(
  name: string,
  type: 'YARD' | 'PICKUP' | 'DELIVERY' | 'TOLL_PLAZA' | 'REST_STOP' | 'CHECKPOINT' | 'CUSTOM',
  centerLatitude: number,
  centerLongitude: number,
  radiusMeters: number,
  options?: {
    yardId?: string;
    bookingId?: string;
    districtId?: string;
    regionId?: string;
    address?: string;
    polygonCoordinates?: Array<[number, number]>;
  }
): Promise<Geofence> {
  try {
    const id = uuid();
    const geofenceId = `GEO-${ulid()}`;

    await query(
      `INSERT INTO geofences
       (id, geofence_id, name, type, center_latitude, center_longitude, radius_meters,
        polygon_coordinates, yard_id, booking_id, district_id, region_id, address, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, TRUE)`,
      [
        id,
        geofenceId,
        name,
        type,
        centerLatitude,
        centerLongitude,
        radiusMeters,
        options?.polygonCoordinates ? JSON.stringify(options.polygonCoordinates) : null,
        options?.yardId,
        options?.bookingId,
        options?.districtId,
        options?.regionId,
        options?.address,
      ]
    );

    log.info({ geofenceId, name, type, radius: radiusMeters }, 'Geofence created');

    return {
      id,
      geofenceId,
      name,
      type,
      centerLatitude,
      centerLongitude,
      radiusMeters,
      polygonCoordinates: options?.polygonCoordinates,
      isActive: true,
    };
  } catch (error: any) {
    log.error({ error, name, type }, 'Failed to create geofence');
    throw error;
  }
}

/**
 * Check if point is inside geofence
 */
export function isPointInsideGeofence(
  latitude: number,
  longitude: number,
  geofence: Geofence
): boolean {
  if (geofence.polygonCoordinates && geofence.polygonCoordinates.length > 0) {
    // Polygon geofence - use ray casting algorithm
    return isPointInPolygon(latitude, longitude, geofence.polygonCoordinates);
  } else if (geofence.centerLatitude && geofence.centerLongitude && geofence.radiusMeters) {
    // Circle geofence - calculate distance from center
    const distance = calculateDistance(
      latitude,
      longitude,
      geofence.centerLatitude,
      geofence.centerLongitude
    );
    return distance * 1000 <= geofence.radiusMeters; // Convert km to meters
  }
  
  return false;
}

/**
 * Point in polygon check (ray casting algorithm)
 */
function isPointInPolygon(lat: number, lng: number, polygon: Array<[number, number]>): boolean {
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}

/**
 * Helper function to calculate distance
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Process geofence events for new GPS point
 * Detects entry/exit and triggers appropriate actions
 */
export async function processGeofenceEvents(
  shipmentId: string,
  driverId: string,
  latitude: number,
  longitude: number,
  gpsPointId: string
): Promise<GeofenceEvent[]> {
  try {
    // Get relevant geofences for this shipment
    const geofencesResult = await query(
      `SELECT g.id, g.geofence_id, g.name, g.type, g.center_latitude, g.center_longitude,
              g.radius_meters, g.polygon_coordinates
       FROM geofences g
       LEFT JOIN bookings b ON b.id = g.booking_id
       LEFT JOIN shipments s ON s.booking_id = b.id
       WHERE g.is_active = TRUE
       AND (g.booking_id IS NULL OR s.id = $1)`,
      [shipmentId]
    );

    const geofences: Geofence[] = geofencesResult.rows.map(row => ({
      id: row.id,
      geofenceId: row.geofence_id,
      name: row.name,
      type: row.type,
      centerLatitude: row.center_latitude ? parseFloat(row.center_latitude) : undefined,
      centerLongitude: row.center_longitude ? parseFloat(row.center_longitude) : undefined,
      radiusMeters: row.radius_meters ? parseFloat(row.radius_meters) : undefined,
      polygonCoordinates: row.polygon_coordinates ? JSON.parse(row.polygon_coordinates) : undefined,
      isActive: true,
    }));

    const events: GeofenceEvent[] = [];

    for (const geofence of geofences) {
      const isInside = isPointInsideGeofence(latitude, longitude, geofence);
      
      // Check if there was a previous event for this geofence
      const lastEventResult = await query(
        `SELECT event_type, occurred_at
         FROM geofence_events
         WHERE geofence_id = $1 AND shipment_id = $2 AND driver_id = $3
         ORDER BY occurred_at DESC
         LIMIT 1`,
        [geofence.id, shipmentId, driverId]
      );

      const wasInside = lastEventResult.rows.length > 0 && lastEventResult.rows[0].event_type === 'ENTRY';

      // Detect state change
      if (isInside && !wasInside) {
        // ENTRY event
        const event = await recordGeofenceEvent(
          geofence.id,
          shipmentId,
          driverId,
          'ENTRY',
          latitude,
          longitude,
          gpsPointId
        );
        events.push(event);
        
        // Trigger entry actions
        await onGeofenceEntry(geofence, shipmentId, driverId);
      } else if (!isInside && wasInside) {
        // EXIT event
        const dwellTime = lastEventResult.rows.length > 0
          ? Math.floor((Date.now() - new Date(lastEventResult.rows[0].occurred_at).getTime()) / 1000)
          : 0;
          
        const event = await recordGeofenceEvent(
          geofence.id,
          shipmentId,
          driverId,
          'EXIT',
          latitude,
          longitude,
          gpsPointId,
          dwellTime
        );
        events.push(event);
        
        // Trigger exit actions
        await onGeofenceExit(geofence, shipmentId, driverId, dwellTime);
      }
    }

    return events;
  } catch (error) {
    log.error({ error, shipmentId }, 'Failed to process geofence events');
    return [];
  }
}

/**
 * Record geofence event
 */
async function recordGeofenceEvent(
  geofenceId: string,
  shipmentId: string,
  driverId: string,
  eventType: 'ENTRY' | 'EXIT',
  latitude: number,
  longitude: number,
  gpsPointId: string,
  dwellTimeSeconds?: number
): Promise<GeofenceEvent> {
  const id = uuid();
  const eventId = `EVT-${ulid()}`;

  await query(
    `INSERT INTO geofence_events
     (id, event_id, geofence_id, shipment_id, driver_id, event_type, latitude, longitude,
      gps_point_id, occurred_at, dwell_time_seconds)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)`,
    [id, eventId, geofenceId, shipmentId, driverId, eventType, latitude, longitude, gpsPointId, dwellTimeSeconds]
  );

  log.info({ eventId, geofenceId, shipmentId, eventType }, 'Geofence event recorded');

  return {
    eventId,
    geofenceId,
    shipmentId,
    driverId,
    eventType,
    latitude,
    longitude,
    occurredAt: new Date(),
  };
}

/**
 * Handle geofence entry (trigger actions)
 */
async function onGeofenceEntry(
  geofence: Geofence,
  shipmentId: string,
  driverId: string
): Promise<void> {
  log.info({ geofence: geofence.name, shipmentId, type: geofence.type }, 'Geofence entry detected');

  // Create alert based on geofence type
  let alertTitle = '';
  let alertMessage = '';

  switch (geofence.type) {
    case 'YARD':
      alertTitle = 'Entered Rodistaa Certified Yard';
      alertMessage = `Driver entered ${geofence.name}`;
      break;
    case 'PICKUP':
      alertTitle = 'Arrived at Pickup Location';
      alertMessage = `Driver arrived at ${geofence.name}`;
      break;
    case 'DELIVERY':
      alertTitle = 'Arrived at Delivery Location';
      alertMessage = `Driver arrived at ${geofence.name}`;
      break;
    default:
      alertTitle = `Entered ${geofence.type}`;
      alertMessage = `Driver entered ${geofence.name}`;
  }

  // Create tracking alert
  await query(
    `INSERT INTO tracking_alerts
     (id, alert_id, shipment_id, driver_id, alert_type, severity, title, message)
     VALUES ($1, $2, $3, $4, 'GEOFENCE_ENTRY', 'INFO', $5, $6)`,
    [uuid(), `ALT-${ulid()}`, shipmentId, driverId, alertTitle, alertMessage]
  );

  // TODO: Send notification to shipper/operator
}

/**
 * Handle geofence exit (trigger actions)
 */
async function onGeofenceExit(
  geofence: Geofence,
  shipmentId: string,
  driverId: string,
  dwellTimeSeconds: number
): Promise<void> {
  log.info({ 
    geofence: geofence.name, 
    shipmentId, 
    type: geofence.type,
    dwellTime: dwellTimeSeconds,
  }, 'Geofence exit detected');

  const dwellMinutes = Math.round(dwellTimeSeconds / 60);

  // Create alert
  await query(
    `INSERT INTO tracking_alerts
     (id, alert_id, shipment_id, driver_id, alert_type, severity, title, message)
     VALUES ($1, $2, $3, $4, 'GEOFENCE_EXIT', 'INFO', $5, $6)`,
    [
      uuid(),
      `ALT-${ulid()}`,
      shipmentId,
      driverId,
      `Exited ${geofence.type}`,
      `Driver exited ${geofence.name} after ${dwellMinutes} minutes`,
    ]
  );

  // TODO: Send notification
}

/**
 * Get geofences for shipment
 */
export async function getShipmentGeofences(shipmentId: string): Promise<Geofence[]> {
  try {
    const result = await query(
      `SELECT g.id, g.geofence_id, g.name, g.type, g.center_latitude, g.center_longitude,
              g.radius_meters, g.polygon_coordinates, g.is_active
       FROM geofences g
       LEFT JOIN bookings b ON b.id = g.booking_id
       LEFT JOIN shipments s ON s.booking_id = b.id
       WHERE g.is_active = TRUE
       AND (g.booking_id IS NULL OR s.id = $1)`,
      [shipmentId]
    );

    return result.rows.map(row => ({
      id: row.id,
      geofenceId: row.geofence_id,
      name: row.name,
      type: row.type,
      centerLatitude: row.center_latitude ? parseFloat(row.center_latitude) : undefined,
      centerLongitude: row.center_longitude ? parseFloat(row.center_longitude) : undefined,
      radiusMeters: row.radius_meters ? parseFloat(row.radius_meters) : undefined,
      polygonCoordinates: row.polygon_coordinates ? JSON.parse(row.polygon_coordinates) : undefined,
      isActive: row.is_active,
    }));
  } catch (error) {
    log.error({ error, shipmentId }, 'Failed to get geofences');
    throw new Error('Failed to retrieve geofences');
  }
}

/**
 * Get geofence events for shipment
 */
export async function getGeofenceEvents(shipmentId: string): Promise<GeofenceEvent[]> {
  try {
    const result = await query(
      `SELECT e.event_id, e.geofence_id, e.shipment_id, e.driver_id, e.event_type,
              e.latitude, e.longitude, e.occurred_at
       FROM geofence_events e
       WHERE e.shipment_id = $1
       ORDER BY e.occurred_at DESC`,
      [shipmentId]
    );

    return result.rows.map(row => ({
      eventId: row.event_id,
      geofenceId: row.geofence_id,
      shipmentId: row.shipment_id,
      driverId: row.driver_id,
      eventType: row.event_type,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      occurredAt: row.occurred_at,
    }));
  } catch (error) {
    log.error({ error, shipmentId }, 'Failed to get geofence events');
    throw new Error('Failed to retrieve geofence events');
  }
}

