/**
 * Export Service - CSV/XLSX Generation
 * Supports sync (small) and async (large) exports
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { ulid } from 'ulid';
import { logger } from '../../utils/logger';
import { Parser } from 'json2csv';

const log = logger.child({ module: 'export-service' });

export interface ExportRequest {
  exportType: string;
  format?: 'CSV' | 'XLSX' | 'JSON';
  filters?: Record<string, any>;
  requestedBy: string;
}

export interface ExportJob {
  jobId: string;
  status: string;
  totalRows?: number;
  fileUrl?: string;
  fileSize?: number;
  createdAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
}

/**
 * Create export job (for large datasets)
 */
export async function createExportJob(request: ExportRequest): Promise<ExportJob> {
  try {
    const jobId = `EXPORT-${ulid()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    await query(
      `INSERT INTO export_jobs
       (id, job_id, export_type, format, requested_by, filters, status, expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7, NOW())`,
      [
        uuid(),
        jobId,
        request.exportType,
        request.format || 'CSV',
        request.requestedBy,
        JSON.stringify(request.filters || {}),
        expiresAt,
      ]
    );

    log.info({ jobId, exportType: request.exportType }, 'Export job created');

    // Start async processing (in production, use queue worker)
    setTimeout(() => processExportJob(jobId), 100);

    return {
      jobId,
      status: 'PENDING',
      createdAt: new Date(),
      expiresAt,
    };
  } catch (error) {
    log.error({ error, request }, 'Failed to create export job');
    throw error;
  }
}

/**
 * Process export job asynchronously
 */
async function processExportJob(jobId: string): Promise<void> {
  try {
    // Update status to PROCESSING
    await query(
      `UPDATE export_jobs SET status = 'PROCESSING', started_at = NOW() WHERE job_id = $1`,
      [jobId]
    );

    // Get job details
    const jobResult = await query(
      `SELECT * FROM export_jobs WHERE job_id = $1`,
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      throw new Error('Export job not found');
    }

    const job = jobResult.rows[0];
    const filters = JSON.parse(job.filters || '{}');

    // Get data based on export type
    const data = await getExportData(job.export_type, filters);

    // Generate CSV
    const csv = await generateCSV(data);
    const fileSize = Buffer.byteLength(csv, 'utf8');

    // In production, upload to S3 and get URL
    // For now, store as base64 (small files only)
    const fileUrl = `/exports/${jobId}.csv`;

    // Update job as completed
    await query(
      `UPDATE export_jobs 
       SET status = 'COMPLETED', total_rows = $1, file_url = $2, 
           file_size_bytes = $3, completed_at = NOW()
       WHERE job_id = $4`,
      [data.length, fileUrl, fileSize, jobId]
    );

    log.info({ jobId, totalRows: data.length }, 'Export job completed');
  } catch (error) {
    log.error({ error, jobId }, 'Export job failed');
    
    await query(
      `UPDATE export_jobs 
       SET status = 'FAILED', error_message = $1, completed_at = NOW()
       WHERE job_id = $2`,
      [error instanceof Error ? error.message : 'Unknown error', jobId]
    );
  }
}

/**
 * Get data for export
 */
async function getExportData(exportType: string, filters: Record<string, any>): Promise<any[]> {
  let queryStr = '';
  let params: any[] = [];

  switch (exportType) {
    case 'TRUCKS':
      queryStr = `
        SELECT t.id, t.registration_number, t.vehicle_type, t.payload_capacity,
               u.name AS operator_name, u.phone AS operator_phone,
               t.status, t.last_inspection_date, t.next_inspection_due
        FROM trucks t
        JOIN users u ON u.id = t.operator_id
        WHERE 1=1
      `;
      if (filters.status) {
        queryStr += ` AND t.status = $${params.length + 1}`;
        params.push(filters.status);
      }
      if (filters.operatorId) {
        queryStr += ` AND t.operator_id = $${params.length + 1}`;
        params.push(filters.operatorId);
      }
      queryStr += ` ORDER BY t.created_at DESC LIMIT 10000`;
      break;

    case 'OPERATORS':
      queryStr = `
        SELECT u.id, u.name, u.phone, u.email, u.kyc_status,
               COUNT(DISTINCT t.id) AS total_trucks,
               COUNT(DISTINCT s.id) AS total_shipments
        FROM users u
        LEFT JOIN trucks t ON t.operator_id = u.id
        LEFT JOIN shipments s ON s.operator_id = u.id
        WHERE u.role = 'OP'
        GROUP BY u.id, u.name, u.phone, u.email, u.kyc_status
        ORDER BY u.created_at DESC
        LIMIT 10000
      `;
      break;

    case 'SHIPMENTS':
      queryStr = `
        SELECT s.id, s.booking_id, s.operator_id, s.driver_id, s.truck_id,
               s.status, s.estimated_delivery_at, s.actual_delivery_at,
               s.final_amount, s.created_at
        FROM shipments s
        WHERE 1=1
      `;
      if (filters.status) {
        queryStr += ` AND s.status = $${params.length + 1}`;
        params.push(filters.status);
      }
      if (filters.startDate) {
        queryStr += ` AND s.created_at >= $${params.length + 1}`;
        params.push(filters.startDate);
      }
      if (filters.endDate) {
        queryStr += ` AND s.created_at <= $${params.length + 1}`;
        params.push(filters.endDate);
      }
      queryStr += ` ORDER BY s.created_at DESC LIMIT 50000`;
      break;

    case 'AUDIT_LOGS':
      queryStr = `
        SELECT al.audit_id, al.actor_id, al.actor_role, al.action,
               al.resource_type, al.resource_id, al.reason,
               al.created_at, u.name AS actor_name
        FROM audit_logs al
        JOIN users u ON u.id = al.actor_id
        WHERE 1=1
      `;
      if (filters.actorId) {
        queryStr += ` AND al.actor_id = $${params.length + 1}`;
        params.push(filters.actorId);
      }
      if (filters.action) {
        queryStr += ` AND al.action = $${params.length + 1}`;
        params.push(filters.action);
      }
      if (filters.startDate) {
        queryStr += ` AND al.created_at >= $${params.length + 1}`;
        params.push(filters.startDate);
      }
      queryStr += ` ORDER BY al.created_at DESC LIMIT 100000`;
      break;

    default:
      throw new Error(`Unsupported export type: ${exportType}`);
  }

  const result = await query(queryStr, params);
  return result.rows;
}

/**
 * Generate CSV from data
 */
async function generateCSV(data: any[]): Promise<string> {
  if (data.length === 0) {
    return 'No data found';
  }

  const parser = new Parser({
    fields: Object.keys(data[0]),
  });

  return parser.parse(data);
}

/**
 * Get export job status
 */
export async function getExportJobStatus(jobId: string): Promise<ExportJob | null> {
  const result = await query(
    `SELECT * FROM export_jobs WHERE job_id = $1`,
    [jobId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const job = result.rows[0];
  return {
    jobId: job.job_id,
    status: job.status,
    totalRows: job.total_rows,
    fileUrl: job.file_url,
    fileSize: job.file_size_bytes,
    createdAt: job.created_at,
    completedAt: job.completed_at,
    expiresAt: job.expires_at,
  };
}

/**
 * Quick sync export for small datasets
 */
export async function quickExportCSV(request: ExportRequest): Promise<string> {
  try {
    const data = await getExportData(request.exportType, request.filters || {});
    
    if (data.length > 5000) {
      throw new Error('Dataset too large. Use async export job instead.');
    }

    const csv = await generateCSV(data);

    // Log export in audit
    await query(
      `INSERT INTO audit_logs
       (id, audit_id, actor_id, actor_role, action, resource_type, metadata, created_at)
       VALUES ($1, $2, $3, 'ADMIN', 'EXPORT_DATA', $4, $5, NOW())`,
      [
        uuid(),
        `AUDIT-${ulid()}`,
        request.requestedBy,
        request.exportType,
        JSON.stringify({ rowCount: data.length, filters: request.filters }),
      ]
    );

    log.info({ 
      exportType: request.exportType, 
      rowCount: data.length,
      requestedBy: request.requestedBy
    }, 'Quick export completed');

    return csv;
  } catch (error) {
    log.error({ error, request }, 'Quick export failed');
    throw error;
  }
}

