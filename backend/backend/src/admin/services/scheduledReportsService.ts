/**
 * Scheduled Reports Service
 * 
 * Automated report generation and delivery:
 * - Monthly fraud digest
 * - Payout summaries
 * - Operator performance reports
 * - Configurable recipients
 * - Cron-based scheduling
 * - Email delivery
 * 
 * Usage:
 *   await scheduledReportsService.createReport({
 *     name: 'Monthly Fraud Digest',
 *     type: 'FRAUD_DIGEST',
 *     schedule: '0 0 1 * *', // First day of every month
 *     recipients: ['compliance@rodistaa.com']
 *   });
 */

import { Pool } from 'pg';
import cron from 'node-cron';
import auditService from './auditService';
import asyncExportService from './asyncExportService';
import notificationService from './notificationService';

const pool: Pool | null = null; // TODO: Import actual DB connection

export interface ScheduledReport {
  id: string;
  report_name: string;
  report_type: 'FRAUD_DIGEST' | 'PAYOUTS' | 'OPERATOR_PERFORMANCE' | 'KYC_SUMMARY' | 'CUSTOM';
  schedule_cron: string;
  recipients: string[];
  filters: Record<string, any>;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_by: string;
  created_at: string;
}

export interface CreateReportRequest {
  name: string;
  type: string;
  schedule: string; // Cron expression
  recipients: string[];
  filters?: Record<string, any>;
}

/**
 * Create scheduled report
 */
export const createReport = async (
  reportData: CreateReportRequest,
  adminId: string
): Promise<ScheduledReport> => {
  try {
    const reportId = `REP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Validate cron expression
    if (!cron.validate(reportData.schedule)) {
      throw new Error('Invalid cron expression');
    }

    // Calculate next run time
    const nextRun = calculateNextRun(reportData.schedule);

    if (!pool) {
      const mockReport: ScheduledReport = {
        id: reportId,
        report_name: reportData.name,
        report_type: reportData.type as any,
        schedule_cron: reportData.schedule,
        recipients: reportData.recipients,
        filters: reportData.filters || {},
        is_active: true,
        last_run_at: null,
        next_run_at: nextRun.toISOString(),
        created_by: adminId,
        created_at: new Date().toISOString(),
      };

      console.log('[SCHEDULED REPORTS - STUB] Created:', mockReport);
      return mockReport;
    }

    const query = `
      INSERT INTO scheduled_reports (
        id, report_name, report_type, schedule_cron, recipients,
        filters, is_active, next_run_at, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7, $8, NOW())
      RETURNING *
    `;

    const values = [
      reportId,
      reportData.name,
      reportData.type,
      reportData.schedule,
      reportData.recipients,
      JSON.stringify(reportData.filters || {}),
      nextRun,
      adminId,
    ];

    const result = await pool.query(query, values);

    // Audit log
    await auditService.log({
      adminId,
      actionType: 'CREATE_SCHEDULED_REPORT' as any,
      resourceType: 'report' as any,
      resourceId: reportId,
      payload: { name: reportData.name, type: reportData.type, schedule: reportData.schedule },
    });

    return {
      ...result.rows[0],
      filters: result.rows[0].filters || {},
    };
  } catch (error: any) {
    console.error('[SCHEDULED REPORTS] Create failed:', error);
    throw error;
  }
};

/**
 * Execute report (called by cron job)
 */
export const executeReport = async (reportId: string): Promise<void> => {
  try {
    console.log('[SCHEDULED REPORTS] Executing:', reportId);

    if (!pool) {
      console.log('[SCHEDULED REPORTS - STUB] Execution complete:', reportId);
      return;
    }

    // Get report details
    const reportQuery = 'SELECT * FROM scheduled_reports WHERE id = $1 AND is_active = TRUE';
    const reportResult = await pool.query(reportQuery, [reportId]);

    if (reportResult.rows.length === 0) {
      return;
    }

    const report = reportResult.rows[0];

    // Log execution start
    const execQuery = `
      INSERT INTO report_executions (
        report_id, status, started_at
      ) VALUES ($1, 'running', NOW())
      RETURNING id
    `;

    const execResult = await pool.query(execQuery, [reportId]);
    const executionId = execResult.rows[0].id;

    try {
      // Generate report data
      const data = await generateReportData(report.report_type, report.filters);

      // Create export file
      const filename = `${report.report_type}_${new Date().toISOString().split('T')[0]}.xlsx`;
      const filepath = path.join(process.env.EXPORT_DIR || '/tmp/exports', filename);

      await generateXLSX(data, filepath, report.report_type);

      const stats = fs.statSync(filepath);

      // Update execution as success
      await pool.query(
        `UPDATE report_executions 
         SET status = 'success', file_url = $1, row_count = $2, completed_at = NOW()
         WHERE id = $3`,
        [filepath, data.length, executionId]
      );

      // Update report last_run and next_run
      const nextRun = calculateNextRun(report.schedule_cron);
      await pool.query(
        `UPDATE scheduled_reports 
         SET last_run_at = NOW(), next_run_at = $1
         WHERE id = $2`,
        [nextRun, reportId]
      );

      // Send email to recipients
      for (const recipient of report.recipients) {
        await notificationService.sendEmail(
          recipient,
          `Scheduled Report: ${report.report_name}`,
          `Your scheduled report "${report.report_name}" is ready. Download: ${filepath}`,
          `<p>Your scheduled report "${report.report_name}" has been generated.</p>
           <p>Rows: ${data.length} | Size: ${(stats.size / 1024).toFixed(2)} KB</p>
           <p><a href="${filepath}">Download Report</a></p>`
        );
      }

      console.log('[SCHEDULED REPORTS] Execution complete:', reportId, filename);
    } catch (error: any) {
      // Update execution as failed
      await pool.query(
        `UPDATE report_executions 
         SET status = 'failed', error_message = $1, completed_at = NOW()
         WHERE id = $2`,
        [error.message, executionId]
      );

      throw error;
    }
  } catch (error: any) {
    console.error('[SCHEDULED REPORTS] Execution failed:', error);
  }
};

/**
 * Generate report data based on type
 */
const generateReportData = async (
  type: string,
  filters: Record<string, any>
): Promise<any[]> => {
  // TODO: Implement actual report data generation
  const mockData = {
    FRAUD_DIGEST: [
      { date: '2025-12-05', fraud_alerts: 12, confirmed: 5, false_positive: 7 },
    ],
    PAYOUTS: [
      { operator_id: 'OP-001', operator_name: 'ABC Transport', amount: 125000, shipments: 15 },
    ],
    OPERATOR_PERFORMANCE: [
      { operator_id: 'OP-001', on_time_delivery: 95, avg_rating: 4.5, total_shipments: 156 },
    ],
  };

  return mockData[type as keyof typeof mockData] || [];
};

/**
 * Generate XLSX file
 */
const generateXLSX = async (data: any[], filepath: string, title: string): Promise<void> => {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title);

  if (data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map(key => ({
      header: key.toUpperCase(),
      key,
      width: 20,
    }));

    data.forEach(row => worksheet.addRow(row));

    worksheet.getRow(1).font = { bold: true };
  }

  await workbook.xlsx.writeFile(filepath);
};

/**
 * Generate PDF
 */
const generatePDF = async (data: any[], filepath: string, title: string): Promise<void> => {
  // TODO: Implement PDF generation
  console.log('[SCHEDULED REPORTS] PDF generation for:', title);
};

/**
 * Calculate next run time from cron expression
 */
const calculateNextRun = (cronExpression: string): Date => {
  // TODO: Use cron-parser or similar library
  // For now, add 1 day
  const next = new Date();
  next.setDate(next.getDate() + 1);
  return next;
};

/**
 * List scheduled reports
 */
export const listReports = async (): Promise<ScheduledReport[]> => {
  try {
    if (!pool) {
      return [];
    }

    const query = 'SELECT * FROM scheduled_reports ORDER BY created_at DESC';
    const result = await pool.query(query);
    
    return result.rows.map(row => ({
      ...row,
      filters: row.filters || {},
    }));
  } catch (error: any) {
    console.error('[SCHEDULED REPORTS] List failed:', error);
    return [];
  }
};

/**
 * Run cron scheduler (main process)
 */
export const startScheduler = (): void => {
  // Check every minute for reports due to run
  cron.schedule('* * * * *', async () => {
    if (!pool) return;

    try {
      const query = `
        SELECT id FROM scheduled_reports
        WHERE is_active = TRUE
          AND next_run_at <= NOW()
      `;

      const result = await pool.query(query);

      for (const row of result.rows) {
        executeReport(row.id).catch(err => 
          console.error(`[SCHEDULER] Report ${row.id} failed:`, err)
        );
      }
    } catch (error) {
      console.error('[SCHEDULER] Check failed:', error);
    }
  });

  console.log('[SCHEDULED REPORTS] Scheduler started');
};

export default {
  createReport,
  executeReport,
  listReports,
  startScheduler,
};

