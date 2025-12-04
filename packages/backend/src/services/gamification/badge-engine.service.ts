/**
 * Badge Engine Service - Gamification for Shippers
 * Calculates and awards badges based on performance criteria
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { ulid } from 'ulid';
import { logger } from '../../utils/logger';

const log = logger.child({ module: 'badge-engine' });

export interface BadgeCriteria {
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  shipmentsRequired: number;
  periodDays: number;
  onTimePercentageMin: number;
  disputeRateMax: number;
}

const BADGE_CRITERIA: BadgeCriteria[] = [
  { level: 'BRONZE', shipmentsRequired: 3, periodDays: 30, onTimePercentageMin: 0, disputeRateMax: 100 },
  { level: 'SILVER', shipmentsRequired: 10, periodDays: 90, onTimePercentageMin: 85, disputeRateMax: 10 },
  { level: 'GOLD', shipmentsRequired: 25, periodDays: 90, onTimePercentageMin: 92, disputeRateMax: 5 },
  { level: 'PLATINUM', shipmentsRequired: 50, periodDays: 180, onTimePercentageMin: 95, disputeRateMax: 1 },
];

/**
 * Calculate badge progress for shipper
 */
export async function calculateBadgeProgress(shipperId: string): Promise<void> {
  try {
    // Get shipper metrics
    const metricsResult = await query(
      `SELECT 
         COUNT(CASE WHEN s.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) AS shipments_30d,
         COUNT(CASE WHEN s.created_at >= NOW() - INTERVAL '90 days' THEN 1 END) AS shipments_90d,
         COUNT(CASE WHEN s.created_at >= NOW() - INTERVAL '180 days' THEN 1 END) AS shipments_180d,
         
         -- On-time percentage
         ROUND(
           COUNT(CASE WHEN s.status = 'COMPLETED' AND s.actual_delivery_at <= s.estimated_delivery_at 
                      AND s.created_at >= NOW() - INTERVAL '30 days' THEN 1 END)::DECIMAL /
           NULLIF(COUNT(CASE WHEN s.status = 'COMPLETED' AND s.created_at >= NOW() - INTERVAL '30 days' THEN 1 END), 0) * 100,
           2
         ) AS on_time_30d,
         
         ROUND(
           COUNT(CASE WHEN s.status = 'COMPLETED' AND s.actual_delivery_at <= s.estimated_delivery_at 
                      AND s.created_at >= NOW() - INTERVAL '90 days' THEN 1 END)::DECIMAL /
           NULLIF(COUNT(CASE WHEN s.status = 'COMPLETED' AND s.created_at >= NOW() - INTERVAL '90 days' THEN 1 END), 0) * 100,
           2
         ) AS on_time_90d,
         
         -- Dispute rate
         ROUND(
           COUNT(CASE WHEN t.category IN ('QUALITY_ISSUE', 'DELIVERY_ISSUE') 
                      AND t.created_at >= NOW() - INTERVAL '30 days' THEN 1 END)::DECIMAL /
           NULLIF(COUNT(CASE WHEN s.created_at >= NOW() - INTERVAL '30 days' THEN 1 END), 0) * 100,
           2
         ) AS dispute_rate_30d,
         
         ROUND(
           COUNT(CASE WHEN t.category IN ('QUALITY_ISSUE', 'DELIVERY_ISSUE') 
                      AND t.created_at >= NOW() - INTERVAL '90 days' THEN 1 END)::DECIMAL /
           NULLIF(COUNT(CASE WHEN s.created_at >= NOW() - INTERVAL '90 days' THEN 1 END), 0) * 100,
           2
         ) AS dispute_rate_90d
       
       FROM users u
       LEFT JOIN bookings b ON b.shipper_id = u.id
       LEFT JOIN shipments s ON s.booking_id = b.id
       LEFT JOIN support_tickets t ON t.shipper_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [shipperId]
    );

    if (metricsResult.rows.length === 0) {
      return;
    }

    const metrics = metricsResult.rows[0];

    // Determine eligible badge
    let eligibleBadge: 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' = 'NONE';
    let progressToNext = 0;
    let nextBadge: string | null = null;

    for (let i = BADGE_CRITERIA.length - 1; i >= 0; i--) {
      const criteria = BADGE_CRITERIA[i];
      const shipmentCount = criteria.periodDays === 30 ? metrics.shipments_30d :
                           criteria.periodDays === 90 ? metrics.shipments_90d :
                           metrics.shipments_180d;
      
      const onTimePercentage = criteria.periodDays === 30 ? (metrics.on_time_30d || 0) :
                              (metrics.on_time_90d || 0);
      
      const disputeRate = criteria.periodDays === 30 ? (metrics.dispute_rate_30d || 0) :
                         (metrics.dispute_rate_90d || 0);

      const meetsShipments = shipmentCount >= criteria.shipmentsRequired;
      const meetsOnTime = onTimePercentage >= criteria.onTimePercentageMin;
      const meetsDispute = disputeRate <= criteria.disputeRateMax;

      if (meetsShipments && meetsOnTime && meetsDispute) {
        eligibleBadge = criteria.level;
        break;
      }
    }

    // Calculate progress to next badge
    const currentIndex = BADGE_CRITERIA.findIndex(c => c.level === eligibleBadge);
    if (currentIndex < BADGE_CRITERIA.length - 1) {
      const nextCriteria = BADGE_CRITERIA[currentIndex + 1];
      nextBadge = nextCriteria.level;
      
      const shipmentCount = nextCriteria.periodDays === 30 ? metrics.shipments_30d :
                           nextCriteria.periodDays === 90 ? metrics.shipments_90d :
                           metrics.shipments_180d;
      
      progressToNext = Math.min(100, (shipmentCount / nextCriteria.shipmentsRequired) * 100);
    }

    // Update or insert progress
    await query(
      `INSERT INTO shipper_badge_progress 
       (id, shipper_id, shipments_last_30_days, shipments_last_90_days, shipments_last_180_days,
        on_time_percentage_30d, on_time_percentage_90d, dispute_rate_30d, dispute_rate_90d,
        current_badge_level, progress_to_next_badge, next_badge_level, last_calculated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
       ON CONFLICT (shipper_id) DO UPDATE
       SET 
         shipments_last_30_days = EXCLUDED.shipments_last_30_days,
         shipments_last_90_days = EXCLUDED.shipments_last_90_days,
         shipments_last_180_days = EXCLUDED.shipments_last_180_days,
         on_time_percentage_30d = EXCLUDED.on_time_percentage_30d,
         on_time_percentage_90d = EXCLUDED.on_time_percentage_90d,
         dispute_rate_30d = EXCLUDED.dispute_rate_30d,
         dispute_rate_90d = EXCLUDED.dispute_rate_90d,
         current_badge_level = EXCLUDED.current_badge_level,
         progress_to_next_badge = EXCLUDED.progress_to_next_badge,
         next_badge_level = EXCLUDED.next_badge_level,
         last_calculated_at = NOW(),
         updated_at = NOW()`,
      [
        uuid(),
        shipperId,
        metrics.shipments_30d,
        metrics.shipments_90d,
        metrics.shipments_180d,
        metrics.on_time_30d || 0,
        metrics.on_time_90d || 0,
        metrics.dispute_rate_30d || 0,
        metrics.dispute_rate_90d || 0,
        eligibleBadge,
        progressToNext,
        nextBadge,
      ]
    );

    // Award badge if achieved new level
    await awardBadgeIfEligible(shipperId, eligibleBadge);

    log.info({ 
      shipperId, 
      eligibleBadge, 
      progressToNext, 
      nextBadge 
    }, 'Badge progress calculated');
  } catch (error) {
    log.error({ error, shipperId }, 'Failed to calculate badge progress');
  }
}

/**
 * Award badge if shipper reached new level
 */
async function awardBadgeIfEligible(
  shipperId: string,
  badgeLevel: string
): Promise<void> {
  if (badgeLevel === 'NONE') return;

  // Check if badge already awarded
  const existingResult = await query(
    `SELECT id FROM shipper_badges
     WHERE shipper_id = $1 AND badge_level = $2 AND is_active = TRUE`,
    [shipperId, badgeLevel]
  );

  if (existingResult.rows.length > 0) {
    return; // Already has this badge
  }

  // Award new badge
  const badgeId = `BADGE-${badgeLevel}-${ulid()}`;
  
  await query(
    `INSERT INTO shipper_badges
     (id, badge_id, shipper_id, badge_type, badge_level, awarded_at)
     VALUES ($1, $2, $3, 'RELIABILITY', $4, NOW())`,
    [uuid(), badgeId, shipperId, badgeLevel]
  );

  // Send notification
  await query(
    `INSERT INTO notifications
     (id, notification_id, user_id, type, title, message, channels, created_at)
     VALUES ($1, $2, $3, 'BADGE_AWARDED', 
             'Congratulations! New Badge Earned',
             'You have been awarded the ' || $4 || ' Shipper badge for excellent performance!',
             ARRAY['IN_APP', 'EMAIL'], NOW())`,
    [uuid(), `NOTIF-${ulid()}`, shipperId, badgeLevel]
  );

  log.info({ shipperId, badgeLevel, badgeId }, 'Badge awarded');
}

/**
 * Run badge calculation for all shippers (cron job)
 */
export async function calculateAllBadges(): Promise<{ processed: number }> {
  try {
    const result = await query(
      `SELECT id FROM users WHERE role = 'SH' AND is_active = TRUE`
    );

    let processed = 0;
    for (const row of result.rows) {
      await calculateBadgeProgress(row.id);
      processed++;
    }

    log.info({ processed }, 'Batch badge calculation completed');
    return { processed };
  } catch (error) {
    log.error({ error }, 'Failed to calculate all badges');
    throw error;
  }
}

