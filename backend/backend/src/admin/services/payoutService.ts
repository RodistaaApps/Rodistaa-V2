/**
 * Payout Service
 * 
 * Manages operator/driver payouts with approval workflow:
 * - Generate payout preview (CSV)
 * - Manual adjustments
 * - Approval & finalization
 * - Bank CSV generation
 * - Odoo sync
 * - Daily payout jobs
 */

import { Pool } from 'pg';
import { Parser } from 'json2csv';
import fs from 'fs';
import path from 'path';
import auditService from './auditService';
import odooConnector from './odooConnector';

const pool: Pool | null = null;

export interface PayoutItem {
  user_id: string;
  user_name: string;
  user_type: 'operator' | 'driver';
  amount: number;
  bank_account: string;
  ifsc: string;
  shipment_count: number;
  adjustments: number;
}

export interface PayoutBatch {
  id: string;
  batch_date: string;
  status: 'preview' | 'approved' | 'processing' | 'completed' | 'failed';
  total_amount: number;
  total_count: number;
  preview_csv_url: string | null;
  final_csv_url: string | null;
  approved_by: string | null;
  approved_at: string | null;
  items: PayoutItem[];
}

/**
 * Generate payout preview for a date
 */
export const generatePayoutPreview = async (
  batchDate: string
): Promise<PayoutBatch> => {
  try {
    const batchId = `PAY-${batchDate.replace(/-/g, '')}-${Date.now()}`;

    // TODO: Calculate payouts from shipments
    // const query = `
    //   SELECT 
    //     operator_id,
    //     SUM(operator_amount) as total_amount,
    //     COUNT(*) as shipment_count
    //   FROM shipments
    //   WHERE status = 'delivered' 
    //     AND payout_status = 'pending'
    //     AND delivered_date::date = $1
    //   GROUP BY operator_id
    // `;

    // Mock payout data
    const mockItems: PayoutItem[] = [
      {
        user_id: 'OP-001',
        user_name: 'ABC Transport',
        user_type: 'operator',
        amount: 125000,
        bank_account: '1234567890',
        ifsc: 'HDFC0001234',
        shipment_count: 15,
        adjustments: 0,
      },
      {
        user_id: 'DR-001',
        user_name: 'Ramesh Kumar',
        user_type: 'driver',
        amount: 45000,
        bank_account: '9876543210',
        ifsc: 'ICIC0002345',
        shipment_count: 8,
        adjustments: -5000, // Penalty
      },
    ];

    const totalAmount = mockItems.reduce((sum, item) => sum + item.amount, 0);

    // Generate preview CSV
    const csvContent = await generatePayoutCSV(mockItems);
    const previewPath = path.join('/tmp', `${batchId}_preview.csv`);
    fs.writeFileSync(previewPath, csvContent);

    const batch: PayoutBatch = {
      id: batchId,
      batch_date: batchDate,
      status: 'preview',
      total_amount: totalAmount,
      total_count: mockItems.length,
      preview_csv_url: previewPath,
      final_csv_url: null,
      approved_by: null,
      approved_at: null,
      items: mockItems,
    };

    // Store in database
    if (pool) {
      await pool.query(
        `INSERT INTO payout_batches (
          id, batch_date, status, total_amount, total_count, preview_csv_url, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [batchId, batchDate, 'preview', totalAmount, mockItems.length, previewPath]
      );

      // Insert items
      for (const item of mockItems) {
        await pool.query(
          `INSERT INTO payout_items (
            batch_id, user_id, user_type, amount, bank_account, ifsc, status
          ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
          [batchId, item.user_id, item.user_type, item.amount, item.bank_account, item.ifsc]
        );
      }
    }

    return batch;
  } catch (error: any) {
    console.error('[PAYOUT SERVICE] Generate preview failed:', error);
    throw error;
  }
};

/**
 * Approve payout batch
 */
export const approvePayout = async (
  batchId: string,
  adminId: string
): Promise<void> => {
  try {
    // TODO: Update status and generate final CSV
    if (pool) {
      await pool.query(
        `UPDATE payout_batches 
         SET status = 'approved', approved_by = $1, approved_at = NOW()
         WHERE id = $2`,
        [adminId, batchId]
      );
    }

    // Push to Odoo
    // TODO: Get batch items and push each to Odoo

    // Audit log
    await auditService.log({
      adminId,
      actionType: 'APPROVE_PAYOUT' as any,
      resourceType: 'payout_batch' as any,
      resourceId: batchId,
      payload: { batchId },
    });

    console.log('[PAYOUT SERVICE] Batch approved:', batchId);
  } catch (error: any) {
    console.error('[PAYOUT SERVICE] Approve payout failed:', error);
    throw error;
  }
};

/**
 * Generate bank CSV for payout
 */
const generatePayoutCSV = async (items: PayoutItem[]): Promise<string> => {
  const parser = new Parser({
    fields: ['user_id', 'user_name', 'bank_account', 'ifsc', 'amount'],
  });

  return parser.parse(items);
};

export default {
  generatePayoutPreview,
  approvePayout,
  generatePayoutCSV,
};

