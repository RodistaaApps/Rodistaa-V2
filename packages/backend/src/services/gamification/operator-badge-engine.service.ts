/**
 * Operator Badge Engine Service
 * Different criteria than shipper badges
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { ulid } from 'ulid';
import { logger } from '../../utils/logger';

const log = logger.child({ module: 'operator-badge-engine' });

export interface OperatorBadgeCriteria {
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  shipmentsRequired: number;
  periodDays: number;
  onTimePercentageMin: number;
  disputeRateMax: number;
}

// Operator badge criteria (different from shipper)
const OPERATOR_BADGE_CRITERIA: OperatorBadgeCriteria[] = [
  { level: 'BRONZE', shipmentsRequired: 10, periodDays: 30, onTimePercentageMin: 0, disputeRateMax: 100 },
  { level: 'SILVER', shipmentsRequired: 30, periodDays: 90, onTimePercentageMin: 85, disputeRateMax: 10 },
  { level: 'GOLD', shipmentsRequired: 75, periodDays: 180, onTimePercentageMin: 90, disputeRateMax: 5 },
  { level: 'PLATINUM', shipmentsRequired: 200, periodDays: 365, onTimePercentageMin: 95, disputeRateMax: 1 },
];

/**
 * Calculate badge progress for operator
 */
export async function calculateOperatorBadgeProgress(operatorId: string): Promise<void> {
  try {
    // Get operator metrics
    const metricsResult = await query(
      `SELECT 
         -- Shipment counts
         COUNT(DISTINCT CASE WHEN s.created_at >= NOW() - INTERVAL '30 days' AND s.status = 'COMPLETED' THEN s.id END) AS shipments_30d,
         COUNT(DISTINCT CASE WHEN s.created_at >= NOW() - INTERVAL '90 days' AND s.status = 'COMPLETED' THEN s.id END) AS shipments_90d,
         COUNT(DISTINCT CASE WHEN s.created_at >= NOW() - INTERVAL '180 days' AND s.status = 'COMPLETED' THEN s.id END) AS shipments_180d,
         COUNT(DISTINCT CASE WHEN s.created_at >= NOW() - INTERVAL '365 days' AND s.status = 'COMPLETED' THEN s.id END) AS shipments_365d,
         
         -- On-time percentage (30 days)
         ROUND(
           COUNT(DISTINCT CASE 
             WHEN s.status = 'COMPLETED' 
             AND s.actual_delivery_at IS NOT NULL 
             AND s.estimated_delivery_at IS NOT NULL
             AND s.actual_delivery_at <= s.estimated_delivery_at 
             AND s.created_at >= NOW() - INTERVAL '30 days'
             THEN s.id 
           END)::DECIMAL / 
           NULLIF(COUNT(DISTINCT CASE 
             WHEN s.status = 'COMPLETED' 
             AND s.created_at >= NOW() - INTERVAL '30 days'
             THEN s.id 
           END), 0) * 100,
           2
         ) AS on_time_30d,
         
         -- On-time percentage (90 days)
         ROUND(
           COUNT(DISTINCT CASE 
             WHEN s.status = 'COMPLETED' 
             AND s.actual_delivery_at <= s.estimated_delivery_at 
             AND s.created_at >= NOW() - INTERVAL '90 days'
             THEN s.id 
           END)::DECIMAL / 
           NULLIF(COUNT(DISTINCT CASE 
             WHEN s.status = 'COMPLETED' 
             AND s.created_at >= NOW() - INTERVAL '90 days'
             THEN s.id 
           END), 0) * 100,
           2
         ) AS on_time_90d,
         
         -- On-time percentage (180 days)
         ROUND(
           COUNT(DISTINCT CASE 
             WHEN s.status = 'COMPLETED' 
             AND s.actual_delivery_at <= s.estimated_delivery_at 
             AND s.created_at >= NOW() - INTERVAL '180 days'
             THEN s.id 
           END)::DECIMAL / 
           NULLIF(COUNT(DISTINCT CASE 
             WHEN s.status = 'COMPLETED' 
             AND s.created_at >= NOW() - INTERVAL '180 days'
             THEN s.id 
           END), 0) * 100,
           2
         ) AS on_time_180d,
         
         -- On-time percentage (365 days)
         ROUND(
           COUNT(DISTINCT CASE 
             WHEN s.status = 'COMPLETED' 
             AND s.actual_delivery_at <= s.estimated_delivery_at 
             AND s.created_at >= NOW() - INTERVAL '365 days'
             THEN s.id 
           END)::DECIMAL / 
           NULLIF(COUNT(DISTINCT CASE 
             WHEN s.status = 'COMPLETED' 
             AND s.created_at >= NOW() - INTERVAL '365 days'
             THEN s.id 
           END), 0) * 100,
           2
         ) AS on_time_365d,
         
         -- Dispute rate (30 days)
         ROUND(
           COUNT(DISTINCT CASE 
             WHEN t.category IN ('QUALITY_ISSUE', 'DELIVERY_ISSUE') 
             AND t.created_at >= NOW() - INTERVAL '30 days' 
             THEN t.id 
           END)::DECIMAL /
           NULLIF(COUNT(DISTINCT CASE 
             WHEN s.created_at >= NOW() - INTERVAL '30 days' 
             THEN s.id 
           END), 0) * 100,
           2
         ) AS dispute_rate_30d,
         
         -- Dispute rate (90 days)
         ROUND(
           COUNT(DISTINCT CASE 
             WHEN t.category IN ('QUALITY_ISSUE', 'DELIVERY_ISSUE') 
             AND t.created_at >= NOW() - INTERVAL '90 days' 
             THEN t.id 
           END)::DECIMAL /
           NULLIF(COUNT(DISTINCT CASE 
             WHEN s.created_at >= NOW() - INTERVAL '90 days' 
             THEN s.id 
           END), 0) * 100,
           2
         ) AS dispute_rate_90d,
         
         -- Dispute rate (365 days)
         ROUND(
           COUNT(DISTINCT CASE 
             WHEN t.category IN ('QUALITY_ISSUE', 'DELIVERY_ISSUE') 
             AND t.created_at >= NOW() - INTERVAL '365 days' 
             THEN t.id 
           END)::DECIMAL /
           NULLIF(COUNT(DISTINCT CASE 
             WHEN s.created_at >= NOW() - INTERVAL '365 days' 
             THEN s.id 
           END), 0) * 100,
           2
         ) AS dispute_rate_365d
       
       FROM users u
       LEFT JOIN bids b ON b.operator_id = u.id
       LEFT JOIN shipments s ON s.operator_id = u.id
       LEFT JOIN support_tickets t ON t.shipment_id = s.id
       WHERE u.id = $1 AND u.role = 'OP'
       GROUP BY u.id`,
      [operatorId]
    );

    if (metricsResult.rows.length === 0) {
      return;
    }

    const metrics = metricsResult.rows[0];

    // Determine eligible badge
    let eligibleBadge: 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' = 'NONE';
    let progressToNext = 0;
    let nextBadge: string | null = null;

    for (let i = OPERATOR_BADGE_CRITERIA.length - 1; i >= 0; i--) {
      const criteria = OPERATOR_BADGE_CRITERIA[i];
      
      const shipmentCount = 
        criteria.periodDays === 30 ? metrics.shipments_30d :
        criteria.periodDays === 90 ? metrics.shipments_90d :
        criteria.periodDays === 180 ? metrics.shipments_180d :
        metrics.shipments_365d;
      
      const onTimePercentage = 
        criteria.periodDays === 30 ? (metrics.on_time_30d || 0) :
        criteria.periodDays === 90 ? (metrics.on_time_90d || 0) :
        criteria.periodDays === 180 ? (metrics.on_time_180d || 0) :
        (metrics.on_time_365d || 0);
      
      const disputeRate = 
        criteria.periodDays === 30 ? (metrics.dispute_rate_30d || 0) :
        criteria.periodDays === 90 ? (metrics.dispute_rate_90d || 0) :
        (metrics.dispute_rate_365d || 0);

      const meetsShipments = shipmentCount >= criteria.shipmentsRequired;
      const meetsOnTime = onTimePercentage >= criteria.onTimePercentageMin;
      const meetsDispute = disputeRate <= criteria.disputeRateMax;

      if (meetsShipments && meetsOnTime && meetsDispute) {
        eligibleBadge = criteria.level;
        break;
      }
    }

    // Calculate progress to next badge
    const currentIndex = OPERATOR_BADGE_CRITERIA.findIndex(c => c.level === eligibleBadge);
    if (currentIndex < OPERATOR_BADGE_CRITERIA.length - 1) {
      const nextCriteria = OPERATOR_BADGE_CRITERIA[currentIndex + 1];
      nextBadge = nextCriteria.level;
      
      const shipmentCount = 
        nextCriteria.periodDays === 30 ? metrics.shipments_30d :
        nextCriteria.periodDays === 90 ? metrics.shipments_90d :
        nextCriteria.periodDays === 180 ? metrics.shipments_180d :
        metrics.shipments_365d;
      
      progressToNext = Math.min(100, (shipmentCount / nextCriteria.shipmentsRequired) * 100);
    }

    // Use shipper_badge_progress table (shared structure)
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
        operatorId, // Note: using operator ID in shipper_id column (generic user_id)
        metrics.shipments_30d || 0,
        metrics.shipments_90d || 0,
        metrics.shipments_180d || 0,
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
    await awardOperatorBadgeIfEligible(operatorId, eligibleBadge);

    log.info({ 
      operatorId, 
      eligibleBadge, 
      progressToNext, 
      nextBadge 
    }, 'Operator badge progress calculated');
  } catch (error) {
    log.error({ error, operatorId }, 'Failed to calculate operator badge progress');
  }
}

/**
 * Award badge if operator reached new level
 */
async function awardOperatorBadgeIfEligible(
  operatorId: string,
  badgeLevel: string
): Promise<void> {
  if (badgeLevel === 'NONE') return;

  // Check if badge already awarded
  const existingResult = await query(
    `SELECT id FROM shipper_badges
     WHERE shipper_id = $1 AND badge_level = $2 AND is_active = TRUE`,
    [operatorId, badgeLevel]
  );

  if (existingResult.rows.length > 0) {
    return; // Already has this badge
  }

  // Award new badge
  const badgeId = `BADGE-OP-${badgeLevel}-${ulid()}`;
  
  await query(
    `INSERT INTO shipper_badges
     (id, badge_id, shipper_id, badge_type, badge_level, awarded_at)
     VALUES ($1, $2, $3, 'RELIABILITY', $4, NOW())`,
    [uuid(), badgeId, operatorId, badgeLevel]
  );

  // Send notification
  await query(
    `INSERT INTO notifications
     (id, notification_id, user_id, type, title, message, channels, created_at)
     VALUES ($1, $2, $3, 'BADGE_AWARDED', 
             'Congratulations! New Badge Earned',
             'You have been awarded the ' || $4 || ' Operator badge for excellent performance!',
             ARRAY['IN_APP', 'EMAIL'], NOW())`,
    [uuid(), `NOTIF-${ulid()}`, operatorId, badgeLevel]
  );

  log.info({ operatorId, badgeLevel, badgeId }, 'Operator badge awarded');
}

/**
 * Run badge calculation for all operators (cron job)
 */
export async function calculateAllOperatorBadges(): Promise<{ processed: number }> {
  try {
    const result = await query(
      `SELECT id FROM users WHERE role = 'OP' AND is_active = TRUE`
    );

    let processed = 0;
    for (const row of result.rows) {
      await calculateOperatorBadgeProgress(row.id);
      processed++;
    }

    log.info({ processed }, 'Batch operator badge calculation completed');
    return { processed };
  } catch (error) {
    log.error({ error }, 'Failed to calculate all operator badges');
    throw error;
  }
}

