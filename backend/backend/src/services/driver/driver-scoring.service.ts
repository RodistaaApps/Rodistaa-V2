/**
 * Driver Scoring Engine
 * Calculates driver reliability score (0-100) based on multiple factors
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { ulid } from 'ulid';
import { logger } from '../../utils/logger';

const log = logger.child({ module: 'driver-scoring' });

export interface DriverScore {
  driverId: string;
  totalScore: number;
  acceptanceRate: number;
  onTimeArrivalRate: number;
  onTimeDeliveryRate: number;
  rejectionCount: number;
  issueFreeRate: number;
  safetyFlags: number;
  routeDeviations: number;
  podQualityScore: number;
  badgeLevel: 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  calculatedAt: Date;
}

export interface DriverMetrics {
  totalTripsAssigned: number;
  totalTripsAccepted: number;
  totalTripsRejected: number;
  totalTripsCompleted: number;
  onTimePickups: number;
  onTimeDeliveries: number;
  issuesReported: number;
  safetyFlags: number;
  routeDeviations: number;
  podResubmits: number;
  totalPods: number;
}

/**
 * Calculate comprehensive driver score
 */
export async function calculateDriverScore(driverId: string): Promise<DriverScore> {
  try {
    // Get driver metrics from last 90 days
    const metricsResult = await query(
      `SELECT 
         -- Trip assignments
         COUNT(DISTINCT da.id) AS total_assigned,
         COUNT(DISTINCT CASE WHEN da.status = 'ACCEPTED' THEN da.id END) AS total_accepted,
         COUNT(DISTINCT CASE WHEN da.status = 'REJECTED' THEN da.id END) AS total_rejected,
         COUNT(DISTINCT CASE WHEN s.status = 'COMPLETED' THEN s.id END) AS total_completed,
         
         -- On-time metrics
         COUNT(DISTINCT CASE 
           WHEN s.actual_pickup_at IS NOT NULL 
           AND s.estimated_pickup_at IS NOT NULL
           AND s.actual_pickup_at <= s.estimated_pickup_at + INTERVAL '15 minutes'
           THEN s.id 
         END) AS on_time_pickups,
         
         COUNT(DISTINCT CASE 
           WHEN s.actual_delivery_at IS NOT NULL 
           AND s.estimated_delivery_at IS NOT NULL
           AND s.actual_delivery_at <= s.estimated_delivery_at
           THEN s.id 
         END) AS on_time_deliveries,
         
         -- Issues
         COUNT(DISTINCT t.id) AS issues_reported,
         
         -- Safety flags (from admin or automated)
         COUNT(DISTINCT CASE 
           WHEN t.category IN ('SAFETY', 'OVERLOADING', 'RASH_DRIVING') 
           THEN t.id 
         END) AS safety_flags,
         
         -- Route deviations (major >25%)
         COUNT(DISTINCT CASE 
           WHEN ta.alert_type = 'ROUTE_DEVIATION' 
           AND ta.severity = 'HIGH'
           THEN ta.id 
         END) AS route_deviations,
         
         -- POD quality
         COUNT(DISTINCT pod.id) AS total_pods,
         COUNT(DISTINCT CASE 
           WHEN pod.resubmit_count > 0 
           THEN pod.id 
         END) AS pod_resubmits
         
       FROM users d
       LEFT JOIN driver_assignments da ON da.driver_id = d.id
       LEFT JOIN shipments s ON s.driver_id = d.id
       LEFT JOIN support_tickets t ON t.shipment_id = s.id
       LEFT JOIN tracking_alerts ta ON ta.shipment_id = s.id
       LEFT JOIN (
         SELECT shipment_id, id, 
                COUNT(*) OVER (PARTITION BY shipment_id) - 1 AS resubmit_count
         FROM shipment_documents 
         WHERE document_type = 'POD'
       ) pod ON pod.shipment_id = s.id
       WHERE d.id = $1 
       AND d.role = 'DR'
       AND (da.created_at >= NOW() - INTERVAL '90 days' OR da.created_at IS NULL)
       GROUP BY d.id`,
      [driverId]
    );

    if (metricsResult.rows.length === 0) {
      return getDefaultScore(driverId);
    }

    const metrics: DriverMetrics = {
      totalTripsAssigned: parseInt(metricsResult.rows[0].total_assigned) || 0,
      totalTripsAccepted: parseInt(metricsResult.rows[0].total_accepted) || 0,
      totalTripsRejected: parseInt(metricsResult.rows[0].total_rejected) || 0,
      totalTripsCompleted: parseInt(metricsResult.rows[0].total_completed) || 0,
      onTimePickups: parseInt(metricsResult.rows[0].on_time_pickups) || 0,
      onTimeDeliveries: parseInt(metricsResult.rows[0].on_time_deliveries) || 0,
      issuesReported: parseInt(metricsResult.rows[0].issues_reported) || 0,
      safetyFlags: parseInt(metricsResult.rows[0].safety_flags) || 0,
      routeDeviations: parseInt(metricsResult.rows[0].route_deviations) || 0,
      totalPods: parseInt(metricsResult.rows[0].total_pods) || 0,
      podResubmits: parseInt(metricsResult.rows[0].pod_resubmits) || 0,
    };

    // Calculate score
    let totalScore = 60; // Base score

    // 1. Acceptance Rate (weight: 10)
    const acceptanceRate = metrics.totalTripsAssigned > 0
      ? (metrics.totalTripsAccepted / metrics.totalTripsAssigned) * 100
      : 100;
    
    if (acceptanceRate >= 90) {
      totalScore += 10;
    } else if (acceptanceRate >= 70) {
      totalScore += 5;
    } else {
      totalScore -= 5;
    }

    // 2. On-Time Arrival at Pickup (weight: 10)
    const onTimeArrivalRate = metrics.totalTripsCompleted > 0
      ? (metrics.onTimePickups / metrics.totalTripsCompleted) * 100
      : 100;
    
    if (onTimeArrivalRate >= 95) {
      totalScore += 10;
    } else if (onTimeArrivalRate >= 85) {
      totalScore += 5;
    }

    // 3. On-Time Delivery (weight: 15)
    const onTimeDeliveryRate = metrics.totalTripsCompleted > 0
      ? (metrics.onTimeDeliveries / metrics.totalTripsCompleted) * 100
      : 100;
    
    if (onTimeDeliveryRate >= 95) {
      totalScore += 15;
    } else if (onTimeDeliveryRate >= 85) {
      totalScore += 10;
    }

    // 4. Rejections (weight: 10)
    if (metrics.totalTripsRejected === 0) {
      totalScore += 5;
    } else if (metrics.totalTripsRejected <= 2) {
      // No change
    } else {
      totalScore -= 10;
    }

    // 5. Issue-Free Trips (weight: 5)
    const issueFreeRate = metrics.totalTripsCompleted > 0
      ? ((metrics.totalTripsCompleted - metrics.issuesReported) / metrics.totalTripsCompleted) * 100
      : 100;
    
    if (issueFreeRate === 100) {
      totalScore += 5;
    } else if (issueFreeRate >= 98) {
      totalScore += 3;
    }

    // 6. Safety Flags (weight: 15)
    if (metrics.safetyFlags === 0) {
      totalScore += 5;
    } else {
      totalScore -= 10;
    }

    // 7. Route Deviation (weight: 5)
    if (metrics.routeDeviations === 0) {
      totalScore += 5;
    } else if (metrics.routeDeviations <= 2) {
      // No change
    } else {
      totalScore -= 5;
    }

    // 8. POD Quality (weight: 5)
    const podQualityScore = metrics.totalPods > 0
      ? ((metrics.totalPods - metrics.podResubmits) / metrics.totalPods) * 100
      : 100;
    
    if (podQualityScore === 100) {
      totalScore += 5;
    }

    // Cap at 0-100
    totalScore = Math.max(0, Math.min(100, totalScore));

    // Determine badge level
    let badgeLevel: 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' = 'NONE';
    if (totalScore >= 92) {
      badgeLevel = 'PLATINUM';
    } else if (totalScore >= 80) {
      badgeLevel = 'GOLD';
    } else if (totalScore >= 65) {
      badgeLevel = 'SILVER';
    } else if (totalScore >= 50) {
      badgeLevel = 'BRONZE';
    }

    const score: DriverScore = {
      driverId,
      totalScore,
      acceptanceRate,
      onTimeArrivalRate,
      onTimeDeliveryRate,
      rejectionCount: metrics.totalTripsRejected,
      issueFreeRate,
      safetyFlags: metrics.safetyFlags,
      routeDeviations: metrics.routeDeviations,
      podQualityScore,
      badgeLevel,
      calculatedAt: new Date(),
    };

    // Store score
    await storeDriverScore(score);

    // Award badge if applicable
    await awardDriverBadge(driverId, badgeLevel, totalScore);

    log.info({ driverId, totalScore, badgeLevel }, 'Driver score calculated');

    return score;
  } catch (error) {
    log.error({ error, driverId }, 'Failed to calculate driver score');
    throw error;
  }
}

/**
 * Get default score for new drivers
 */
function getDefaultScore(driverId: string): DriverScore {
  return {
    driverId,
    totalScore: 60,
    acceptanceRate: 100,
    onTimeArrivalRate: 100,
    onTimeDeliveryRate: 100,
    rejectionCount: 0,
    issueFreeRate: 100,
    safetyFlags: 0,
    routeDeviations: 0,
    podQualityScore: 100,
    badgeLevel: 'NONE',
    calculatedAt: new Date(),
  };
}

/**
 * Store driver score in database
 */
async function storeDriverScore(score: DriverScore): Promise<void> {
  await query(
    `INSERT INTO driver_scores
     (id, driver_id, total_score, acceptance_rate, on_time_arrival_rate, 
      on_time_delivery_rate, rejection_count, issue_free_rate, safety_flags,
      route_deviations, pod_quality_score, badge_level, calculated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      uuid(),
      score.driverId,
      score.totalScore,
      score.acceptanceRate,
      score.onTimeArrivalRate,
      score.onTimeDeliveryRate,
      score.rejectionCount,
      score.issueFreeRate,
      score.safetyFlags,
      score.routeDeviations,
      score.podQualityScore,
      score.badgeLevel,
      score.calculatedAt,
    ]
  );
}

/**
 * Award badge to driver
 */
async function awardDriverBadge(
  driverId: string,
  badgeLevel: string,
  score: number
): Promise<void> {
  if (badgeLevel === 'NONE') return;

  // Check if badge already awarded
  const existingResult = await query(
    `SELECT id FROM shipper_badges
     WHERE shipper_id = $1 AND badge_level = $2 AND is_active = TRUE`,
    [driverId, badgeLevel]
  );

  if (existingResult.rows.length > 0) {
    return; // Already has this badge
  }

  // Award new badge
  const badgeId = `BADGE-DR-${badgeLevel}-${ulid()}`;
  
  await query(
    `INSERT INTO shipper_badges
     (id, badge_id, shipper_id, badge_type, badge_level, awarded_at)
     VALUES ($1, $2, $3, 'RELIABILITY', $4, NOW())`,
    [uuid(), badgeId, driverId, badgeLevel]
  );

  // Send notification
  await query(
    `INSERT INTO notifications
     (id, notification_id, user_id, type, title, message, channels, created_at)
     VALUES ($1, $2, $3, 'BADGE_AWARDED', 
             'New Badge Earned!',
             'Congratulations! You achieved the ' || $4 || ' Driver badge (Score: ' || $5 || ')!',
             ARRAY['IN_APP', 'SMS'], NOW())`,
    [uuid(), `NOTIF-${ulid()}`, driverId, badgeLevel, score]
  );

  log.info({ driverId, badgeLevel, badgeId, score }, 'Driver badge awarded');
}

/**
 * Get driver score
 */
export async function getDriverScore(driverId: string): Promise<DriverScore | null> {
  const result = await query(
    `SELECT * FROM driver_scores 
     WHERE driver_id = $1 
     ORDER BY calculated_at DESC 
     LIMIT 1`,
    [driverId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return {
    driverId: result.rows[0].driver_id,
    totalScore: parseFloat(result.rows[0].total_score),
    acceptanceRate: parseFloat(result.rows[0].acceptance_rate),
    onTimeArrivalRate: parseFloat(result.rows[0].on_time_arrival_rate),
    onTimeDeliveryRate: parseFloat(result.rows[0].on_time_delivery_rate),
    rejectionCount: parseInt(result.rows[0].rejection_count),
    issueFreeRate: parseFloat(result.rows[0].issue_free_rate),
    safetyFlags: parseInt(result.rows[0].safety_flags),
    routeDeviations: parseInt(result.rows[0].route_deviations),
    podQualityScore: parseFloat(result.rows[0].pod_quality_score),
    badgeLevel: result.rows[0].badge_level,
    calculatedAt: result.rows[0].calculated_at,
  };
}

/**
 * Calculate scores for all active drivers (cron job)
 */
export async function calculateAllDriverScores(): Promise<{ processed: number }> {
  try {
    const result = await query(
      `SELECT id FROM users WHERE role = 'DR' AND is_active = TRUE`
    );

    let processed = 0;
    for (const row of result.rows) {
      await calculateDriverScore(row.id);
      processed++;
    }

    log.info({ processed }, 'Batch driver scoring completed');
    return { processed };
  } catch (error) {
    log.error({ error }, 'Failed to calculate all driver scores');
    throw error;
  }
}

