/**
 * Commission Service
 * Manages franchise commission splits: HQ / Regional / Unit
 * Automated daily settlement generation
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { ulid } from 'ulid';
import { logger } from '../../utils/logger';

const log = logger.child({ module: 'commission-service' });

export interface CommissionConfig {
  hqSplit: number; // Percentage for HQ
  regionalSplit: number; // Percentage for Regional franchise
  unitSplit: number; // Percentage for Unit franchise
}

export interface CommissionBreakdown {
  totalFeeAmount: number;
  hqAmount: number;
  regionalAmount: number;
  unitAmount: number;
}

export interface Settlement {
  settlementId: string;
  franchiseId: string;
  franchiseType: 'HQ' | 'REGIONAL' | 'UNIT';
  periodStart: Date;
  periodEnd: Date;
  totalFeesCollected: number;
  commissionAmount: number;
  commissionPercentage: number;
  transactionCount: number;
  status: string;
}

/**
 * Get commission configuration
 * Checks hierarchy: District > Region > Global
 */
async function getCommissionConfig(
  districtId?: string,
  regionId?: string
): Promise<CommissionConfig> {
  try {
    let result;

    // Try district-specific config
    if (districtId) {
      result = await query(
        `SELECT hq_split_percentage, regional_split_percentage, unit_split_percentage
         FROM franchise_commission_config
         WHERE district_id = $1 AND is_active = TRUE
         AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
         ORDER BY created_at DESC
         LIMIT 1`,
        [districtId]
      );
    }

    // Try region-specific config
    if (!result || result.rows.length === 0 && regionId) {
      result = await query(
        `SELECT hq_split_percentage, regional_split_percentage, unit_split_percentage
         FROM franchise_commission_config
         WHERE region_id = $1 AND district_id IS NULL AND is_active = TRUE
         AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
         ORDER BY created_at DESC
         LIMIT 1`,
        [regionId]
      );
    }

    // Fall back to global config
    if (!result || result.rows.length === 0) {
      result = await query(
        `SELECT hq_split_percentage, regional_split_percentage, unit_split_percentage
         FROM franchise_commission_config
         WHERE region_id IS NULL AND district_id IS NULL AND is_active = TRUE
         AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
         ORDER BY created_at DESC
         LIMIT 1`
      );
    }

    if (result && result.rows.length > 0) {
      const config = result.rows[0];
      return {
        hqSplit: parseFloat(config.hq_split_percentage),
        regionalSplit: parseFloat(config.regional_split_percentage),
        unitSplit: parseFloat(config.unit_split_percentage),
      };
    }

    // Default configuration
    log.warn({ districtId, regionId }, 'No commission config found, using default');
    return {
      hqSplit: 40.0, // 40% to HQ
      regionalSplit: 30.0, // 30% to Regional
      unitSplit: 30.0, // 30% to Unit
    };
  } catch (error) {
    log.error({ error }, 'Failed to get commission config');
    return {
      hqSplit: 40.0,
      regionalSplit: 30.0,
      unitSplit: 30.0,
    };
  }
}

/**
 * Calculate commission breakdown for a fee
 */
export function calculateCommissionBreakdown(
  feeAmount: number,
  config: CommissionConfig
): CommissionBreakdown {
  const hqAmount = Math.round((feeAmount * config.hqSplit) / 100 * 100) / 100;
  const regionalAmount = Math.round((feeAmount * config.regionalSplit) / 100 * 100) / 100;
  const unitAmount = Math.round((feeAmount * config.unitSplit) / 100 * 100) / 100;

  return {
    totalFeeAmount: feeAmount,
    hqAmount,
    regionalAmount,
    unitAmount,
  };
}

/**
 * Record commission transactions when fee is collected
 */
export async function recordCommissions(
  winFeeChargeId: string,
  hqFranchiseId: string,
  regionalFranchiseId: string,
  unitFranchiseId: string,
  districtId?: string,
  regionId?: string
): Promise<void> {
  try {
    // Get fee amount
    const feeResult = await query(
      `SELECT fee_amount FROM win_fee_charges WHERE id = $1`,
      [winFeeChargeId]
    );

    if (feeResult.rows.length === 0) {
      throw new Error('Fee charge not found');
    }

    const feeAmount = parseFloat(feeResult.rows[0].fee_amount);
    const config = await getCommissionConfig(districtId, regionId);
    const breakdown = calculateCommissionBreakdown(feeAmount, config);

    // Record HQ commission
    await query(
      `INSERT INTO commission_transactions 
       (id, win_fee_charge_id, franchise_id, franchise_type, commission_amount, commission_percentage, status)
       VALUES ($1, $2, $3, 'HQ', $4, $5, 'PENDING')`,
      [uuid(), winFeeChargeId, hqFranchiseId, breakdown.hqAmount, config.hqSplit]
    );

    // Record Regional commission
    await query(
      `INSERT INTO commission_transactions 
       (id, win_fee_charge_id, franchise_id, franchise_type, commission_amount, commission_percentage, status)
       VALUES ($1, $2, $3, 'REGIONAL', $4, $5, 'PENDING')`,
      [uuid(), winFeeChargeId, regionalFranchiseId, breakdown.regionalAmount, config.regionalSplit]
    );

    // Record Unit commission
    await query(
      `INSERT INTO commission_transactions 
       (id, win_fee_charge_id, franchise_id, franchise_type, commission_amount, commission_percentage, status)
       VALUES ($1, $2, $3, 'UNIT', $4, $5, 'PENDING')`,
      [uuid(), winFeeChargeId, unitFranchiseId, breakdown.unitAmount, config.unitSplit]
    );

    log.info({ 
      winFeeChargeId, 
      feeAmount, 
      hqAmount: breakdown.hqAmount,
      regionalAmount: breakdown.regionalAmount,
      unitAmount: breakdown.unitAmount,
    }, 'Commission transactions recorded');
  } catch (error) {
    log.error({ error, winFeeChargeId }, 'Failed to record commissions');
    throw new Error('Failed to record commission transactions');
  }
}

/**
 * Generate daily settlement for a franchise
 */
export async function generateSettlement(
  franchiseId: string,
  franchiseType: 'HQ' | 'REGIONAL' | 'UNIT',
  periodStart: Date,
  periodEnd: Date
): Promise<Settlement> {
  try {
    const settlementId = `SET-${ulid()}`;
    const id = uuid();

    // Calculate total commission for period
    const result = await query(
      `SELECT 
         COUNT(*) AS transaction_count,
         COALESCE(SUM(commission_amount), 0) AS total_commission,
         AVG(commission_percentage) AS avg_percentage
       FROM commission_transactions
       WHERE franchise_id = $1 
       AND franchise_type = $2
       AND status = 'PENDING'
       AND created_at >= $3 
       AND created_at < $4`,
      [franchiseId, franchiseType, periodStart, periodEnd]
    );

    const stats = result.rows[0];
    const transactionCount = parseInt(stats.transaction_count);
    const totalCommission = parseFloat(stats.total_commission);
    const avgPercentage = parseFloat(stats.avg_percentage || 0);

    // Create settlement record
    await query(
      `INSERT INTO commission_settlements
       (id, settlement_id, franchise_id, franchise_type, period_start, period_end,
        total_fees_collected, commission_amount, commission_percentage, transaction_count, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING')`,
      [
        id,
        settlementId,
        franchiseId,
        franchiseType,
        periodStart,
        periodEnd,
        totalCommission, // For simplicity, same as commission_amount in this context
        totalCommission,
        avgPercentage,
        transactionCount,
      ]
    );

    // Link commission transactions to settlement
    await query(
      `UPDATE commission_transactions
       SET settlement_id = $1, status = 'APPROVED'
       WHERE franchise_id = $2 
       AND franchise_type = $3
       AND status = 'PENDING'
       AND created_at >= $4 
       AND created_at < $5`,
      [id, franchiseId, franchiseType, periodStart, periodEnd]
    );

    log.info({ 
      settlementId, 
      franchiseId, 
      franchiseType, 
      totalCommission, 
      transactionCount 
    }, 'Settlement generated');

    return {
      settlementId,
      franchiseId,
      franchiseType,
      periodStart,
      periodEnd,
      totalFeesCollected: totalCommission,
      commissionAmount: totalCommission,
      commissionPercentage: avgPercentage,
      transactionCount,
      status: 'PENDING',
    };
  } catch (error) {
    log.error({ error, franchiseId, franchiseType }, 'Failed to generate settlement');
    throw new Error('Failed to generate settlement');
  }
}

/**
 * Generate CSV for settlement payout
 */
export async function generatePayoutCSV(settlementId: string): Promise<string> {
  try {
    const result = await query(
      `SELECT s.settlement_id, u.name AS franchise_name, u.mobile_masked,
              s.franchise_type, s.commission_amount, s.period_start, s.period_end,
              s.transaction_count
       FROM commission_settlements s
       JOIN users u ON u.id = s.franchise_id
       WHERE s.settlement_id = $1`,
      [settlementId]
    );

    if (result.rows.length === 0) {
      throw new Error('Settlement not found');
    }

    const settlement = result.rows[0];

    // Generate CSV content
    const csv = [
      'Settlement ID,Franchise Name,Type,Amount,Period Start,Period End,Transactions,Mobile',
      [
        settlement.settlement_id,
        settlement.franchise_name,
        settlement.franchise_type,
        settlement.commission_amount,
        settlement.period_start.toISOString().split('T')[0],
        settlement.period_end.toISOString().split('T')[0],
        settlement.transaction_count,
        settlement.mobile_masked,
      ].join(','),
    ].join('\n');

    // In production, save to S3 and return URL
    // For MVP, return CSV content
    log.info({ settlementId }, 'Payout CSV generated');

    return csv;
  } catch (error) {
    log.error({ error, settlementId }, 'Failed to generate payout CSV');
    throw new Error('Failed to generate payout CSV');
  }
}

/**
 * Mark settlement as paid
 */
export async function markSettlementPaid(
  settlementId: string,
  paymentUTR: string,
  paymentMethod: string
): Promise<void> {
  try {
    await query(
      `UPDATE commission_settlements
       SET 
         status = 'PAID',
         paid_at = NOW(),
         payment_utr = $1,
         payment_method = $2,
         updated_at = NOW()
       WHERE settlement_id = $3`,
      [paymentUTR, paymentMethod, settlementId]
    );

    // Mark all related commission transactions as paid
    await query(
      `UPDATE commission_transactions ct
       SET status = 'PAID', paid_at = NOW()
       FROM commission_settlements cs
       WHERE ct.settlement_id = cs.id
       AND cs.settlement_id = $1`,
      [settlementId]
    );

    log.info({ settlementId, paymentUTR }, 'Settlement marked as paid');
  } catch (error) {
    log.error({ error, settlementId }, 'Failed to mark settlement paid');
    throw new Error('Failed to mark settlement as paid');
  }
}

