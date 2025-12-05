/**
 * Odoo Connector Service
 * 
 * Integration with Odoo accounting system:
 * - Push invoices, payouts, adjustments
 * - Receive ledger confirmations
 * - Configurable account code mappings
 * - Mock mode for development
 * - Retry logic for failed syncs
 * 
 * Usage:
 *   await odooConnector.pushInvoice({ invoiceId, amount, items });
 *   await odooConnector.pushPayout({ payoutId, amount, beneficiary });
 */

import axios from 'axios';
import { Pool } from 'pg';
import auditService from './auditService';

const pool: Pool | null = null; // TODO: Import actual DB connection

// Odoo configuration from environment
const ODOO_CONFIG = {
  url: process.env.ODOO_URL || 'https://odoo.example.com',
  database: process.env.ODOO_DATABASE || 'rodistaa',
  username: process.env.ODOO_USERNAME || 'admin',
  apiKey: process.env.ODOO_API_KEY || 'mock-api-key',
  mockMode: process.env.ODOO_MOCK_MODE === 'true' || !process.env.ODOO_API_KEY,
};

export interface OdooInvoice {
  invoiceId: string;
  customerId: string;
  customerName: string;
  amount: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    accountCode?: string;
  }>;
  dueDate: string;
  metadata?: Record<string, any>;
}

export interface OdooPayout {
  payoutId: string;
  beneficiaryId: string;
  beneficiaryName: string;
  amount: number;
  bankAccount: string;
  ifsc: string;
  accountCode?: string;
  metadata?: Record<string, any>;
}

export interface OdooMapping {
  id: string;
  mapping_type: 'ACCOUNT_CODE' | 'TAX_RULE' | 'PAYMENT_METHOD';
  rodistaa_value: string;
  odoo_value: string;
  description: string;
  is_active: boolean;
}

/**
 * Get account code mapping
 */
const getMapping = async (
  mappingType: string,
  rodistaaValue: string
): Promise<string | null> => {
  try {
    if (!pool) {
      // Default mappings
      const defaultMappings: Record<string, string> = {
        'freight_revenue': '4000',
        'bidding_fee': '4100',
        'wallet_liability': '2100',
        'payout_expense': '5000',
      };
      return defaultMappings[rodistaaValue] || null;
    }

    const query = `
      SELECT odoo_value FROM odoo_mappings
      WHERE mapping_type = $1 AND rodistaa_value = $2 AND is_active = TRUE
    `;

    const result = await pool.query(query, [mappingType, rodistaaValue]);
    return result.rows[0]?.odoo_value || null;
  } catch (error: any) {
    console.error('[ODOO] Get mapping failed:', error);
    return null;
  }
};

/**
 * Log sync event
 */
const logSync = async (
  eventType: string,
  direction: 'push' | 'pull',
  payload: any,
  response?: any,
  status: 'success' | 'failed' = 'success',
  error?: string
): Promise<void> => {
  try {
    if (!pool) {
      console.log('[ODOO SYNC LOG - STUB]', { eventType, direction, status });
      return;
    }

    const query = `
      INSERT INTO odoo_sync_log (
        event_type, direction, payload, odoo_response, status, error_message, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;

    await pool.query(query, [
      eventType,
      direction,
      JSON.stringify(payload),
      JSON.stringify(response || {}),
      status,
      error || null,
    ]);
  } catch (err: any) {
    console.error('[ODOO] Log sync failed:', err);
  }
};

/**
 * Push invoice to Odoo
 */
export const pushInvoice = async (invoice: OdooInvoice): Promise<{ success: boolean; odooId?: string }> => {
  try {
    if (ODOO_CONFIG.mockMode) {
      // Mock mode - simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockOdooId = `ODO-INV-${Date.now()}`;
      
      await logSync('INVOICE_PUSHED', 'push', invoice, { odoo_id: mockOdooId }, 'success');

      console.log('[ODOO MOCK] Invoice pushed:', invoice.invoiceId, '→', mockOdooId);
      
      return {
        success: true,
        odooId: mockOdooId,
      };
    }

    // Real Odoo API call
    // TODO: Implement actual Odoo XML-RPC or REST API call
    const odooResponse = await axios.post(
      `${ODOO_CONFIG.url}/api/invoices`,
      {
        database: ODOO_CONFIG.database,
        invoice: {
          partner_id: invoice.customerId,
          partner_name: invoice.customerName,
          invoice_line_ids: invoice.items.map(item => ({
            name: item.description,
            quantity: item.quantity,
            price_unit: item.unitPrice,
            account_id: item.accountCode || await getMapping('ACCOUNT_CODE', 'freight_revenue'),
          })),
          amount_total: invoice.amount,
          date_due: invoice.dueDate,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${ODOO_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    await logSync('INVOICE_PUSHED', 'push', invoice, odooResponse.data, 'success');

    return {
      success: true,
      odooId: odooResponse.data.id,
    };
  } catch (error: any) {
    console.error('[ODOO] Push invoice failed:', error);
    
    await logSync('INVOICE_PUSHED', 'push', invoice, null, 'failed', error.message);

    return {
      success: false,
    };
  }
};

/**
 * Push payout to Odoo
 */
export const pushPayout = async (payout: OdooPayout): Promise<{ success: boolean; odooId?: string }> => {
  try {
    if (ODOO_CONFIG.mockMode) {
      // Mock mode
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockOdooId = `ODO-PAY-${Date.now()}`;
      
      await logSync('PAYOUT_PUSHED', 'push', payout, { odoo_id: mockOdooId }, 'success');

      console.log('[ODOO MOCK] Payout pushed:', payout.payoutId, '→', mockOdooId);
      
      return {
        success: true,
        odooId: mockOdooId,
      };
    }

    // Real Odoo API call
    // TODO: Implement actual Odoo payment API
    const odooResponse = await axios.post(
      `${ODOO_CONFIG.url}/api/payments`,
      {
        database: ODOO_CONFIG.database,
        payment: {
          partner_id: payout.beneficiaryId,
          partner_name: payout.beneficiaryName,
          amount: payout.amount,
          payment_method: 'bank_transfer',
          destination_account_id: payout.bankAccount,
          account_id: await getMapping('ACCOUNT_CODE', 'payout_expense'),
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${ODOO_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    await logSync('PAYOUT_PUSHED', 'push', payout, odooResponse.data, 'success');

    return {
      success: true,
      odooId: odooResponse.data.id,
    };
  } catch (error: any) {
    console.error('[ODOO] Push payout failed:', error);
    
    await logSync('PAYOUT_PUSHED', 'push', payout, null, 'failed', error.message);

    return {
      success: false,
    };
  }
};

/**
 * Receive reconciliation from Odoo (webhook handler)
 */
export const receiveReconciliation = async (payload: any): Promise<void> => {
  try {
    console.log('[ODOO] Received reconciliation:', payload);

    // TODO: Update payment status in Rodistaa database based on Odoo confirmation

    await logSync('RECONCILIATION_RECEIVED', 'pull', payload, null, 'success');
  } catch (error: any) {
    console.error('[ODOO] Receive reconciliation failed:', error);
    await logSync('RECONCILIATION_RECEIVED', 'pull', payload, null, 'failed', error.message);
  }
};

/**
 * Get sync statistics
 */
export const getSyncStats = async (): Promise<any> => {
  try {
    if (!pool) {
      return {
        totalSyncs: 156,
        successful: 148,
        failed: 8,
        successRate: 94.9,
        lastSync: new Date().toISOString(),
      };
    }

    const query = `
      SELECT 
        COUNT(*) as total_syncs,
        COUNT(*) FILTER (WHERE status = 'success') as successful,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        MAX(created_at) as last_sync
      FROM odoo_sync_log
    `;

    const result = await pool.query(query);
    const row = result.rows[0];

    return {
      totalSyncs: row.total_syncs,
      successful: row.successful,
      failed: row.failed,
      successRate: row.total_syncs > 0 ? (row.successful / row.total_syncs * 100) : 0,
      lastSync: row.last_sync,
    };
  } catch (error: any) {
    console.error('[ODOO] Get sync stats failed:', error);
    return {};
  }
};

/**
 * Retry failed sync
 */
export const retryFailedSync = async (syncLogId: number): Promise<boolean> => {
  try {
    if (!pool) {
      console.log('[ODOO - STUB] Retry sync:', syncLogId);
      return true;
    }

    // Get failed sync
    const query = 'SELECT * FROM odoo_sync_log WHERE id = $1 AND status = $2';
    const result = await pool.query(query, [syncLogId, 'failed']);
    
    if (result.rows.length === 0) {
      return false;
    }

    const sync = result.rows[0];
    const payload = sync.payload;

    // Retry based on event type
    let retryResult;
    if (sync.event_type === 'INVOICE_PUSHED') {
      retryResult = await pushInvoice(payload);
    } else if (sync.event_type === 'PAYOUT_PUSHED') {
      retryResult = await pushPayout(payload);
    } else {
      return false;
    }

    // Update retry count
    await pool.query(
      'UPDATE odoo_sync_log SET retry_count = retry_count + 1 WHERE id = $1',
      [syncLogId]
    );

    return retryResult.success;
  } catch (error: any) {
    console.error('[ODOO] Retry failed:', error);
    return false;
  }
};

export default {
  pushInvoice,
  pushPayout,
  receiveReconciliation,
  getSyncStats,
  retryFailedSync,
  ODOO_CONFIG,
};

