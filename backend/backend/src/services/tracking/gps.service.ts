/**
 * GPS Tracking Service
 * Handles 60-second interval location tracking for active shipments
 * Privacy-first: Tracking only during active trips
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { ulid } from 'ulid';
import { logger } from '../../utils/logger';

const log = logger.child({ module: 'gps-service' });

export interface GPSPoint {
  id: string;
  shipmentId: string;
  driverId: string;
  truckId?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  bearing?: number;
  recordedAt: Date;
  source: string;
}

export interface TrackingSession {
  sessionId: string;
  shipmentId: string;
  driverId: string;
  status: string;
  startedAt: Date;
  lastPointAt?: Date;
  totalPoints: number;
}

/**
 * Start tracking session (when trip starts)
 */
export async function startTrackingSession(
  shipmentId: string,
  driverId: string,
  truckId?: string
): Promise<TrackingSession> {
  try {
    // Check privacy consent
    const consentResult = await query(
      `SELECT tracking_enabled, consent_given_at
       FROM tracking_privacy_settings
       WHERE user_id = $1`,
      [driverId]
    );

    const hasConsent = consentResult.rows.length === 0 || consentResult.rows[0].tracking_enabled;

    if (!hasConsent) {
      throw new Error('Driver has not consented to location tracking');
    }

    const sessionId = `TRK-${ulid()}`;
    const id = uuid();

    await query(
      `INSERT INTO tracking_sessions
       (id, session_id, shipment_id, driver_id, truck_id, status, started_at, expected_interval_seconds, user_consent)
       VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW(), 60, TRUE)`,
      [id, sessionId, shipmentId, driverId, truckId]
    );

    log.info({ sessionId, shipmentId, driverId }, 'Tracking session started');

    return {
      sessionId,
      shipmentId,
      driverId,
      status: 'ACTIVE',
      startedAt: new Date(),
      totalPoints: 0,
    };
  } catch (error: any) {
    log.error({ error, shipmentId, driverId }, 'Failed to start tracking session');
    throw error;
  }
}

/**
 * Record GPS location point (called every 60 seconds from Driver app)
 */
export async function recordLocationPoint(
  shipmentId: string,
  driverId: string,
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    speed?: number;
    bearing?: number;
    recordedAt: Date;
  },
  metadata?: {
    networkType?: string;
    batteryLevel?: number;
    sequenceNumber?: number;
  }
): Promise<GPSPoint> {
  try {
    // Validate coordinates
    if (location.latitude < -90 || location.latitude > 90) {
      throw new Error('Invalid latitude');
    }
    if (location.longitude < -180 || location.longitude > 180) {
      throw new Error('Invalid longitude');
    }

    const pointId = uuid();

    // Insert GPS point
    await query(
      `INSERT INTO gps_location_points
       (id, shipment_id, driver_id, latitude, longitude, accuracy, altitude, speed, bearing,
        recorded_at, source, sequence_number, network_type, battery_level, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'DRIVER_APP', $11, $12, $13, $14)`,
      [
        pointId,
        shipmentId,
        driverId,
        location.latitude,
        location.longitude,
        location.accuracy,
        location.altitude,
        location.speed,
        location.bearing,
        location.recordedAt,
        metadata?.sequenceNumber,
        metadata?.networkType,
        metadata?.batteryLevel,
        JSON.stringify(metadata || {}),
      ]
    );

    // Update tracking session
    await query(
      `UPDATE tracking_sessions
       SET 
         total_points_received = total_points_received + 1,
         last_point_at = $1,
         updated_at = NOW()
       WHERE shipment_id = $2 AND status = 'ACTIVE'`,
      [location.recordedAt, shipmentId]
    );

    log.info({ 
      shipmentId, 
      driverId,
      lat: location.latitude.toFixed(6),
      lng: location.longitude.toFixed(6),
      speed: location.speed,
    }, 'GPS point recorded');

    return {
      id: pointId,
      shipmentId,
      driverId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      altitude: location.altitude,
      speed: location.speed,
      bearing: location.bearing,
      recordedAt: location.recordedAt,
      source: 'DRIVER_APP',
    };
  } catch (error: any) {
    log.error({ error, shipmentId, driverId }, 'Failed to record GPS point');
    throw error;
  }
}

/**
 * Pause tracking (driver takes break)
 */
export async function pauseTracking(sessionId: string): Promise<void> {
  try {
    await query(
      `UPDATE tracking_sessions
       SET status = 'PAUSED', paused_at = NOW(), updated_at = NOW()
       WHERE session_id = $1 AND status = 'ACTIVE'`,
      [sessionId]
    );

    log.info({ sessionId }, 'Tracking paused');
  } catch (error) {
    log.error({ error, sessionId }, 'Failed to pause tracking');
    throw new Error('Failed to pause tracking');
  }
}

/**
 * Resume tracking
 */
export async function resumeTracking(sessionId: string): Promise<void> {
  try {
    await query(
      `UPDATE tracking_sessions
       SET status = 'ACTIVE', resumed_at = NOW(), updated_at = NOW()
       WHERE session_id = $1 AND status = 'PAUSED'`,
      [sessionId]
    );

    log.info({ sessionId }, 'Tracking resumed');
  } catch (error) {
    log.error({ error, sessionId }, 'Failed to resume tracking');
    throw new Error('Failed to resume tracking');
  }
}

/**
 * Stop tracking (trip completed or cancelled)
 */
export async function stopTrackingSession(
  sessionId: string
): Promise<void> {
  try {
    await query(
      `UPDATE tracking_sessions
       SET status = 'STOPPED', stopped_at = NOW(), updated_at = NOW()
       WHERE session_id = $1 AND status IN ('ACTIVE', 'PAUSED')`,
      [sessionId]
    );

    // Generate route history
    await generateRouteHistory(sessionId);

    log.info({ sessionId }, 'Tracking session stopped');
  } catch (error) {
    log.error({ error, sessionId }, 'Failed to stop tracking');
    throw new Error('Failed to stop tracking');
  }
}

/**
 * Get latest location for shipment
 */
export async function getLatestLocation(shipmentId: string): Promise<GPSPoint | null> {
  try {
    const result = await query(
      `SELECT id, shipment_id, driver_id, truck_id, latitude, longitude,
              accuracy, altitude, speed, bearing, recorded_at, source
       FROM gps_location_points
       WHERE shipment_id = $1
       ORDER BY recorded_at DESC
       LIMIT 1`,
      [shipmentId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const point = result.rows[0];
    return {
      id: point.id,
      shipmentId: point.shipment_id,
      driverId: point.driver_id,
      truckId: point.truck_id,
      latitude: parseFloat(point.latitude),
      longitude: parseFloat(point.longitude),
      accuracy: point.accuracy ? parseFloat(point.accuracy) : undefined,
      altitude: point.altitude ? parseFloat(point.altitude) : undefined,
      speed: point.speed ? parseFloat(point.speed) : undefined,
      bearing: point.bearing ? parseFloat(point.bearing) : undefined,
      recordedAt: point.recorded_at,
      source: point.source,
    };
  } catch (error) {
    log.error({ error, shipmentId }, 'Failed to get latest location');
    throw new Error('Failed to retrieve latest location');
  }
}

/**
 * Get route points for shipment (for route replay)
 */
export async function getRoutePoints(
  shipmentId: string,
  startTime?: Date,
  endTime?: Date,
  limit: number = 1000
): Promise<GPSPoint[]> {
  try {
    let queryText = `
      SELECT id, shipment_id, driver_id, truck_id, latitude, longitude,
             accuracy, altitude, speed, bearing, recorded_at, source
      FROM gps_location_points
      WHERE shipment_id = $1
    `;

    const params: any[] = [shipmentId];
    let paramIndex = 2;

    if (startTime) {
      queryText += ` AND recorded_at >= $${paramIndex}`;
      params.push(startTime);
      paramIndex++;
    }

    if (endTime) {
      queryText += ` AND recorded_at <= $${paramIndex}`;
      params.push(endTime);
      paramIndex++;
    }

    queryText += ` ORDER BY recorded_at ASC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await query(queryText, params);

    return result.rows.map(point => ({
      id: point.id,
      shipmentId: point.shipment_id,
      driverId: point.driver_id,
      truckId: point.truck_id,
      latitude: parseFloat(point.latitude),
      longitude: parseFloat(point.longitude),
      accuracy: point.accuracy ? parseFloat(point.accuracy) : undefined,
      altitude: point.altitude ? parseFloat(point.altitude) : undefined,
      speed: point.speed ? parseFloat(point.speed) : undefined,
      bearing: point.bearing ? parseFloat(point.bearing) : undefined,
      recordedAt: point.recorded_at,
      source: point.source,
    }));
  } catch (error) {
    log.error({ error, shipmentId }, 'Failed to get route points');
    throw new Error('Failed to retrieve route points');
  }
}

/**
 * Generate compressed route history (called when tracking stops)
 */
async function generateRouteHistory(sessionId: string): Promise<void> {
  try {
    // Get session details
    const sessionResult = await query(
      `SELECT shipment_id, driver_id, truck_id, started_at, stopped_at
       FROM tracking_sessions
       WHERE session_id = $1`,
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return;
    }

    const session = sessionResult.rows[0];

    // Get all GPS points for this shipment
    const pointsResult = await query(
      `SELECT latitude, longitude, speed, recorded_at
       FROM gps_location_points
       WHERE shipment_id = $1
       ORDER BY recorded_at ASC`,
      [session.shipment_id]
    );

    if (pointsResult.rows.length === 0) {
      return;
    }

    const points = pointsResult.rows;

    // Calculate statistics
    let totalDistance = 0;
    let maxSpeed = 0;
    let totalSpeed = 0;
    let speedCount = 0;

    // Compress points (store every 5th point to save space, or use Douglas-Peucker algorithm)
    const compressedPoints = [];
    for (let i = 0; i < points.length; i += 5) {
      const point = points[i];
      compressedPoints.push({
        t: point.recorded_at.toISOString(),
        lat: parseFloat(point.latitude),
        lng: parseFloat(point.longitude),
        spd: point.speed ? parseFloat(point.speed) : null,
      });

      // Calculate distance from previous point
      if (i > 0) {
        const prev = points[i - 1];
        const dist = calculateDistance(
          parseFloat(prev.latitude),
          parseFloat(prev.longitude),
          parseFloat(point.latitude),
          parseFloat(point.longitude)
        );
        totalDistance += dist;
      }

      // Track speeds
      if (point.speed) {
        const speed = parseFloat(point.speed);
        if (speed > maxSpeed) maxSpeed = speed;
        totalSpeed += speed;
        speedCount++;
      }
    }

    const averageSpeed = speedCount > 0 ? totalSpeed / speedCount : 0;
    const durationMinutes = session.stopped_at 
      ? (session.stopped_at.getTime() - session.started_at.getTime()) / (1000 * 60)
      : 0;

    // Store route history
    await query(
      `INSERT INTO route_history
       (id, shipment_id, driver_id, truck_id, total_distance_km, total_duration_minutes,
        average_speed_kmph, max_speed_kmph, route_start_at, route_end_at, route_points_compressed,
        total_points, data_quality_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (shipment_id) DO UPDATE
       SET 
         route_points_compressed = EXCLUDED.route_points_compressed,
         total_points = EXCLUDED.total_points,
         updated_at = NOW()`,
      [
        uuid(),
        session.shipment_id,
        session.driver_id,
        session.truck_id,
        totalDistance,
        durationMinutes,
        averageSpeed,
        maxSpeed,
        session.started_at,
        session.stopped_at,
        JSON.stringify(compressedPoints),
        points.length,
        calculateDataQualityScore(points.length, durationMinutes),
      ]
    );

    log.info({ 
      sessionId, 
      shipmentId: session.shipment_id, 
      totalPoints: points.length,
      compressedPoints: compressedPoints.length,
      totalDistance: totalDistance.toFixed(2),
    }, 'Route history generated');
  } catch (error) {
    log.error({ error, sessionId }, 'Failed to generate route history');
  }
}

/**
 * Calculate distance between two GPS points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate data quality score based on point frequency
 */
function calculateDataQualityScore(totalPoints: number, durationMinutes: number): number {
  if (durationMinutes === 0) return 1.0;
  
  const expectedPoints = durationMinutes; // 1 point per minute
  const actualRate = totalPoints / durationMinutes;
  
  // Score: 1.0 if we got expected points, lower if missing data
  const score = Math.min(actualRate / 1.0, 1.0);
  return Math.round(score * 100) / 100;
}

/**
 * Get active tracking sessions
 */
export async function getActiveTrackingSessions(): Promise<TrackingSession[]> {
  try {
    const result = await query(
      `SELECT session_id, shipment_id, driver_id, status, started_at, last_point_at, total_points_received
       FROM tracking_sessions
       WHERE status = 'ACTIVE'
       ORDER BY started_at DESC`
    );

    return result.rows.map(row => ({
      sessionId: row.session_id,
      shipmentId: row.shipment_id,
      driverId: row.driver_id,
      status: row.status,
      startedAt: row.started_at,
      lastPointAt: row.last_point_at,
      totalPoints: row.total_points_received,
    }));
  } catch (error) {
    log.error({ error }, 'Failed to get active sessions');
    throw new Error('Failed to retrieve active tracking sessions');
  }
}

/**
 * Detect stale tracking (no data received in expected interval)
 */
export async function detectStaleTracking(): Promise<{
  staleCount: number;
  staleSessions: string[];
}> {
  try {
    // Find sessions with no data in last 5 minutes (should get data every 60 seconds)
    const result = await query(
      `SELECT session_id, shipment_id, last_point_at
       FROM tracking_sessions
       WHERE status = 'ACTIVE'
       AND (last_point_at IS NULL OR last_point_at < NOW() - INTERVAL '5 minutes')
       AND started_at < NOW() - INTERVAL '5 minutes'`
    );

    const staleSessions = result.rows.map(row => row.session_id);

    if (staleSessions.length > 0) {
      // Update missed intervals count
      await query(
        `UPDATE tracking_sessions
         SET 
           missed_intervals = missed_intervals + 1,
           network_dropouts = network_dropouts + 1,
           updated_at = NOW()
         WHERE session_id = ANY($1)`,
        [staleSessions]
      );

      log.warn({ count: staleSessions.length, sessions: staleSessions }, 'Stale tracking detected');
    }

    return {
      staleCount: staleSessions.length,
      staleSessions,
    };
  } catch (error) {
    log.error({ error }, 'Failed to detect stale tracking');
    throw new Error('Failed to detect stale tracking');
  }
}

/**
 * Privacy: Delete location data for driver (GDPR right to be forgotten)
 */
export async function deleteDriverLocationData(
  driverId: string,
  beforeDate?: Date
): Promise<{ deletedPoints: number }> {
  try {
    let queryText = 'DELETE FROM gps_location_points WHERE driver_id = $1';
    const params: any[] = [driverId];

    if (beforeDate) {
      queryText += ' AND recorded_at < $2';
      params.push(beforeDate);
    }

    const result = await query(queryText, params);

    log.info({ driverId, deletedPoints: result.rowCount }, 'Driver location data deleted (GDPR)');

    return {
      deletedPoints: result.rowCount || 0,
    };
  } catch (error) {
    log.error({ error, driverId }, 'Failed to delete location data');
    throw new Error('Failed to delete location data');
  }
}

