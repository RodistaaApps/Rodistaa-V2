/**
 * ETA (Estimated Time of Arrival) Calculation Service
 * Calculates and updates ETAs based on current location, speed, and route
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { logger } from '../../utils/logger';
import * as gpsService from './gps.service';

const log = logger.child({ module: 'eta-service' });

export interface ETACalculation {
  shipmentId: string;
  calculatedETA: Date;
  originalETA?: Date;
  confidenceScore: number;
  remainingDistanceKm: number;
  currentSpeedKmph?: number;
  averageSpeedKmph: number;
  isDelayed: boolean;
  delayMinutes: number;
  calculationMethod: string;
}

/**
 * Calculate ETA for shipment based on current position
 */
export async function calculateETA(
  shipmentId: string,
  destinationLatitude: number,
  destinationLongitude: number,
  originalETA?: Date
): Promise<ETACalculation> {
  try {
    // Get current location
    const currentLocation = await gpsService.getLatestLocation(shipmentId);
    
    if (!currentLocation) {
      // No GPS data yet, use original ETA
      if (originalETA) {
        return {
          shipmentId,
          calculatedETA: originalETA,
          originalETA,
          confidenceScore: 0.3,
          remainingDistanceKm: 0,
          averageSpeedKmph: 0,
          isDelayed: false,
          delayMinutes: 0,
          calculationMethod: 'ORIGINAL_ETA',
        };
      }
      throw new Error('No GPS data available and no original ETA provided');
    }

    // Calculate remaining distance
    const remainingDistance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      destinationLatitude,
      destinationLongitude
    );

    // Get historical speed data for this shipment
    const speedData = await getAverageSpeed(shipmentId);
    
    // Use current speed if available and recent, otherwise use average
    let estimatedSpeed = speedData.averageSpeed;
    if (currentLocation.speed && currentLocation.speed > 5) {
      // Weight current speed vs average (70% current, 30% average)
      estimatedSpeed = (currentLocation.speed * 0.7) + (speedData.averageSpeed * 0.3);
    }

    // Apply traffic factor (simulated - in production would use real traffic API)
    const trafficFactor = simulateTrafficFactor(new Date());
    estimatedSpeed = estimatedSpeed / trafficFactor;

    // Calculate ETA
    const hoursRemaining = remainingDistance / estimatedSpeed;
    const calculatedETA = new Date(Date.now() + hoursRemaining * 60 * 60 * 1000);

    // Calculate delay if original ETA exists
    let isDelayed = false;
    let delayMinutes = 0;
    if (originalETA) {
      delayMinutes = Math.max(0, Math.floor((calculatedETA.getTime() - originalETA.getTime()) / (1000 * 60)));
      isDelayed = delayMinutes > 30; // Consider delayed if > 30 minutes
    }

    // Calculate confidence score
    const confidenceScore = calculateConfidenceScore(
      speedData.dataPoints,
      currentLocation.accuracy || 100,
      remainingDistance
    );

    // Store ETA calculation
    await storeETACalculation({
      shipmentId,
      calculatedETA,
      originalETA,
      confidenceScore,
      remainingDistanceKm: remainingDistance,
      currentSpeedKmph: currentLocation.speed,
      averageSpeedKmph: speedData.averageSpeed,
      isDelayed,
      delayMinutes,
      calculationMethod: 'DISTANCE_BASED',
      trafficFactor,
    });

    // Create alert if delayed
    if (isDelayed && delayMinutes > 30) {
      await createDelayAlert(shipmentId, delayMinutes, calculatedETA);
    }

    log.info({ 
      shipmentId, 
      remainingDistance: remainingDistance.toFixed(2),
      estimatedSpeed: estimatedSpeed.toFixed(2),
      calculatedETA: calculatedETA.toISOString(),
      isDelayed,
    }, 'ETA calculated');

    return {
      shipmentId,
      calculatedETA,
      originalETA,
      confidenceScore,
      remainingDistanceKm: remainingDistance,
      currentSpeedKmph: currentLocation.speed,
      averageSpeedKmph: speedData.averageSpeed,
      isDelayed,
      delayMinutes,
      calculationMethod: 'DISTANCE_BASED',
    };
  } catch (error: any) {
    log.error({ error, shipmentId }, 'Failed to calculate ETA');
    throw error;
  }
}

/**
 * Calculate distance between two points (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
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
 * Get average speed for shipment from GPS history
 */
async function getAverageSpeed(shipmentId: string): Promise<{
  averageSpeed: number;
  dataPoints: number;
}> {
  try {
    const result = await query(
      `SELECT AVG(speed) AS avg_speed, COUNT(*) AS data_points
       FROM gps_location_points
       WHERE shipment_id = $1 
       AND speed IS NOT NULL 
       AND speed > 5
       AND recorded_at >= NOW() - INTERVAL '2 hours'`,
      [shipmentId]
    );

    const avgSpeed = result.rows[0].avg_speed ? parseFloat(result.rows[0].avg_speed) : 50; // Default 50 km/h
    const dataPoints = parseInt(result.rows[0].data_points || '0');

    return {
      averageSpeed: avgSpeed,
      dataPoints,
    };
  } catch (error) {
    log.error({ error, shipmentId }, 'Failed to get average speed');
    return {
      averageSpeed: 50, // Default
      dataPoints: 0,
    };
  }
}

/**
 * Simulate traffic factor based on time of day
 * In production, this would call actual traffic API
 */
function simulateTrafficFactor(timestamp: Date): number {
  const hour = timestamp.getHours();
  
  // Peak hours (8-10 AM, 6-9 PM): slower traffic
  if ((hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21)) {
    return 1.3; // 30% slower
  }
  
  // Night time (11 PM - 5 AM): faster traffic
  if (hour >= 23 || hour <= 5) {
    return 0.9; // 10% faster
  }
  
  // Normal hours
  return 1.0;
}

/**
 * Calculate confidence score for ETA
 */
function calculateConfidenceScore(
  dataPoints: number,
  gpsAccuracy: number,
  remainingDistance: number
): number {
  let score = 1.0;
  
  // Reduce confidence if few data points
  if (dataPoints < 5) {
    score *= 0.5;
  } else if (dataPoints < 20) {
    score *= 0.7;
  }
  
  // Reduce confidence if poor GPS accuracy
  if (gpsAccuracy > 100) {
    score *= 0.6;
  } else if (gpsAccuracy > 50) {
    score *= 0.8;
  }
  
  // Reduce confidence for very long distances (more uncertainty)
  if (remainingDistance > 500) {
    score *= 0.7;
  }
  
  return Math.max(0.1, Math.min(1.0, score));
}

/**
 * Store ETA calculation in database
 */
async function storeETACalculation(eta: any): Promise<void> {
  try {
    await query(
      `INSERT INTO shipment_etas
       (id, shipment_id, calculated_eta, original_eta, confidence_score, remaining_distance_km,
        current_speed_kmph, average_speed_kmph, traffic_factor, is_delayed, delay_minutes,
        calculation_method, calculation_details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        uuid(),
        eta.shipmentId,
        eta.calculatedETA,
        eta.originalETA,
        eta.confidenceScore,
        eta.remainingDistanceKm,
        eta.currentSpeedKmph,
        eta.averageSpeedKmph,
        eta.trafficFactor,
        eta.isDelayed,
        eta.delayMinutes,
        eta.calculationMethod,
        JSON.stringify({ timestamp: new Date() }),
      ]
    );
  } catch (error) {
    log.error({ error, shipmentId: eta.shipmentId }, 'Failed to store ETA');
  }
}

/**
 * Create delay alert
 */
async function createDelayAlert(
  shipmentId: string,
  delayMinutes: number,
  newETA: Date
): Promise<void> {
  try {
    const alertId = `ALT-DELAY-${Date.now()}`;
    
    await query(
      `INSERT INTO tracking_alerts
       (id, alert_id, shipment_id, driver_id, alert_type, severity, title, message)
       VALUES (
         $1, $2, $3,
         (SELECT driver_id FROM shipments WHERE id = $3),
         'ETA_DELAY', 'WARNING',
         'Shipment Delayed',
         'Shipment is delayed by ' || $4 || ' minutes. New ETA: ' || $5
       )`,
      [uuid(), alertId, shipmentId, delayMinutes, newETA.toISOString()]
    );

    log.warn({ shipmentId, delayMinutes, newETA }, 'Delay alert created');
  } catch (error) {
    log.error({ error, shipmentId }, 'Failed to create delay alert');
  }
}

/**
 * Get latest ETA for shipment
 */
export async function getLatestETA(shipmentId: string): Promise<ETACalculation | null> {
  try {
    const result = await query(
      `SELECT shipment_id, calculated_eta, original_eta, confidence_score, remaining_distance_km,
              current_speed_kmph, average_speed_kmph, is_delayed, delay_minutes, calculation_method
       FROM shipment_etas
       WHERE shipment_id = $1
       ORDER BY calculated_at DESC
       LIMIT 1`,
      [shipmentId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      shipmentId: row.shipment_id,
      calculatedETA: row.calculated_eta,
      originalETA: row.original_eta,
      confidenceScore: parseFloat(row.confidence_score),
      remainingDistanceKm: parseFloat(row.remaining_distance_km),
      currentSpeedKmph: row.current_speed_kmph ? parseFloat(row.current_speed_kmph) : undefined,
      averageSpeedKmph: parseFloat(row.average_speed_kmph),
      isDelayed: row.is_delayed,
      delayMinutes: row.delay_minutes,
      calculationMethod: row.calculation_method,
    };
  } catch (error) {
    log.error({ error, shipmentId }, 'Failed to get latest ETA');
    return null;
  }
}

