/**
 * Export Service
 * 
 * Handles CSV/PDF export generation with PII masking based on admin role.
 * SuperAdmin can export with PII (owner name, mobile), others get masked data.
 * 
 * Usage:
 *   const exportId = await exportService.generateExport({
 *     type: 'trucks',
 *     format: 'csv',
 *     filters: { compliance: 'blocked' },
 *     adminId: 'ADM-001',
 *     includePII: true,
 *   });
 */

import { Pool } from 'pg';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// TODO: Import actual DB connection
const pool: Pool | null = null; // Stub for now

export interface ExportRequest {
  type: 'trucks' | 'tickets' | 'audit_logs';
  format: 'csv' | 'pdf';
  filters?: Record<string, any>;
  adminId: string;
  adminRole: string;
  includePII?: boolean; // Only allowed for SuperAdmin
  columns?: string[];
}

export interface ExportResult {
  exportId: string;
  filename: string;
  filepath: string;
  downloadUrl: string;
  size: number;
  rowCount: number;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Mask PII data
 */
const maskPII = (value: string, type: 'name' | 'mobile' | 'email'): string => {
  if (!value) return '';

  switch (type) {
    case 'name':
      // Show only first name, mask last name
      const nameParts = value.split(' ');
      return nameParts.length > 1 
        ? `${nameParts[0]} ${'*'.repeat(nameParts[nameParts.length - 1].length)}`
        : `${value[0]}${'*'.repeat(value.length - 1)}`;
    
    case 'mobile':
      // Show only last 4 digits
      return value.length > 4 
        ? `${'*'.repeat(value.length - 4)}${value.slice(-4)}`
        : '****';
    
    case 'email':
      // Show only domain
      const [local, domain] = value.split('@');
      return local && domain 
        ? `${'*'.repeat(Math.min(local.length, 3))}@${domain}`
        : '***';
    
    default:
      return '***';
  }
};

/**
 * Generate unique export ID
 */
const generateExportId = (): string => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `EXP-${date}-${random}`;
};

/**
 * Get export directory
 */
const getExportDir = (): string => {
  const dir = process.env.EXPORT_DIR || path.join(__dirname, '../../../exports');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

/**
 * Fetch data for export based on type and filters
 */
const fetchExportData = async (
  type: string,
  filters: Record<string, any>,
  includePII: boolean
): Promise<any[]> => {
  // TODO: Implement actual data fetching
  // For now, return mock data

  if (type === 'trucks') {
    return [
      {
        rc_number: 'DL01AB1234',
        operator_name: includePII ? 'John Doe' : maskPII('John Doe', 'name'),
        owner_mobile: includePII ? '+911234567890' : maskPII('+911234567890', 'mobile'),
        compliance_status: 'allowed',
        last_verified: '2025-12-05T10:00:00Z',
        provider: 'VAHAN',
        provider_txn_id: 'VH-20251205-ABC123',
        tyres: 10,
        label: 'DXL',
        body_type: 'Container',
        gvw: 25000,
        fit_score: 95,
      },
      // ... more rows
    ];
  }

  if (type === 'tickets') {
    return [
      {
        ticket_id: 'TKT-001',
        type: 'PROVIDER_MISMATCH',
        priority: 'P1',
        status: 'OPEN',
        resource_id: 'DL01AB1234',
        created_at: '2025-12-05T09:00:00Z',
        assigned_to: 'ADM-002',
        sla_due_at: '2025-12-06T09:00:00Z',
      },
    ];
  }

  if (type === 'audit_logs') {
    return [
      {
        txn_id: 'AUD-20251205-ABC123',
        admin_id: 'ADM-001',
        action_type: 'BLOCK_TRUCK',
        resource_type: 'truck',
        resource_id: 'DL01AB1234',
        created_at: '2025-12-05T10:30:00Z',
        reason: 'Suspicious activity',
      },
    ];
  }

  return [];
};

/**
 * Generate CSV export
 */
export const generateCSV = async (
  data: any[],
  columns: string[]
): Promise<string> => {
  const parser = new Parser({ fields: columns });
  return parser.parse(data);
};

/**
 * Generate PDF export
 */
export const generatePDF = async (
  data: any[],
  columns: string[],
  title: string,
  filepath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 50,
      });

      const writeStream = fs.createWriteStream(filepath);
      doc.pipe(writeStream);

      // Header
      doc.fontSize(16).text(title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generated: ${new Date().toISOString()}`, { align: 'center' });
      doc.moveDown();

      // Table headers
      const colWidth = (doc.page.width - 100) / columns.length;
      let y = doc.y;

      doc.fontSize(8).fillColor('#000');
      columns.forEach((col, i) => {
        doc.text(col.toUpperCase(), 50 + i * colWidth, y, {
          width: colWidth,
          align: 'left',
        });
      });

      doc.moveTo(50, y + 15).lineTo(doc.page.width - 50, y + 15).stroke();
      y += 25;

      // Table rows
      data.forEach((row, rowIndex) => {
        if (y > doc.page.height - 100) {
          doc.addPage();
          y = 50;
        }

        columns.forEach((col, colIndex) => {
          const value = row[col] || '';
          doc.text(String(value), 50 + colIndex * colWidth, y, {
            width: colWidth,
            align: 'left',
          });
        });

        y += 20;
      });

      // Footer
      doc.fontSize(8).fillColor('#666');
      doc.text(
        `Page ${doc.bufferedPageRange().count}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

      doc.end();

      writeStream.on('finish', () => resolve());
      writeStream.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Main export function
 */
export const generateExport = async (
  request: ExportRequest
): Promise<ExportResult> => {
  try {
    const exportId = generateExportId();
    const exportDir = getExportDir();

    // Validate PII permission
    const canIncludePII = request.adminRole === 'SuperAdmin' && request.includePII;

    // Fetch data
    const data = await fetchExportData(
      request.type,
      request.filters || {},
      canIncludePII
    );

    // Determine columns
    const columns = request.columns || (data.length > 0 ? Object.keys(data[0]) : []);

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${request.type}_export_${timestamp}.${request.format}`;
    const filepath = path.join(exportDir, filename);

    // Generate export file
    if (request.format === 'csv') {
      const csv = await generateCSV(data, columns);
      fs.writeFileSync(filepath, csv, 'utf-8');
    } else if (request.format === 'pdf') {
      await generatePDF(
        data,
        columns,
        `${request.type.toUpperCase()} Export`,
        filepath
      );
    } else {
      throw new Error(`Unsupported format: ${request.format}`);
    }

    // Get file size
    const stats = fs.statSync(filepath);

    // Store export metadata in database
    // TODO: Implement database storage
    if (pool) {
      await pool.query(
        `INSERT INTO export_jobs (
          export_id, admin_id, type, format, filename, filepath, 
          size_bytes, row_count, include_pii, filters, created_at, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW() + INTERVAL '24 hours')`,
        [
          exportId,
          request.adminId,
          request.type,
          request.format,
          filename,
          filepath,
          stats.size,
          data.length,
          canIncludePII,
          JSON.stringify(request.filters || {}),
        ]
      );
    }

    const result: ExportResult = {
      exportId,
      filename,
      filepath,
      downloadUrl: `/admin/exports/${exportId}/download`,
      size: stats.size,
      rowCount: data.length,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    // Notify admin that export is ready
    // TODO: Call notification service
    console.log(`[EXPORT] Generated export ${exportId} for admin ${request.adminId}`);

    return result;
  } catch (error: any) {
    console.error('[EXPORT SERVICE] Failed to generate export:', error);
    throw error;
  }
};

/**
 * Get export by ID
 */
export const getExport = async (exportId: string): Promise<ExportResult | null> => {
  try {
    if (!pool) {
      return null;
    }

    const query = `
      SELECT 
        export_id,
        filename,
        filepath,
        size_bytes,
        row_count,
        created_at,
        expires_at
      FROM export_jobs
      WHERE export_id = $1 AND expires_at > NOW()
    `;

    const result = await pool.query(query, [exportId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      exportId: row.export_id,
      filename: row.filename,
      filepath: row.filepath,
      downloadUrl: `/admin/exports/${exportId}/download`,
      size: row.size_bytes,
      rowCount: row.row_count,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
    };
  } catch (error: any) {
    console.error('[EXPORT SERVICE] Failed to get export:', error);
    return null;
  }
};

/**
 * Cleanup expired exports (cron job)
 */
export const cleanupExpired = async (): Promise<number> => {
  try {
    if (!pool) {
      return 0;
    }

    // Get expired exports
    const query = `
      SELECT export_id, filepath
      FROM export_jobs
      WHERE expires_at < NOW()
    `;

    const result = await pool.query(query);
    let deletedCount = 0;

    // Delete files
    for (const row of result.rows) {
      try {
        if (fs.existsSync(row.filepath)) {
          fs.unlinkSync(row.filepath);
        }
        deletedCount++;
      } catch (err) {
        console.error(`[EXPORT] Failed to delete file ${row.filepath}:`, err);
      }
    }

    // Delete database records
    await pool.query('DELETE FROM export_jobs WHERE expires_at < NOW()');

    return deletedCount;
  } catch (error: any) {
    console.error('[EXPORT SERVICE] Failed to cleanup expired exports:', error);
    return 0;
  }
};

/**
 * Get export statistics for admin
 */
export const getAdminExportStats = async (adminId: string): Promise<any> => {
  try {
    if (!pool) {
      return { total: 0, byType: {}, byFormat: {} };
    }

    const query = `
      SELECT 
        COUNT(*) as total_exports,
        SUM(size_bytes) as total_size,
        SUM(row_count) as total_rows,
        json_object_agg(type, count) as by_type,
        json_object_agg(format, count) as by_format
      FROM (
        SELECT type, format, COUNT(*) as count
        FROM export_jobs
        WHERE admin_id = $1
        GROUP BY type, format
      ) subquery
    `;

    const result = await pool.query(query, [adminId]);
    return result.rows[0] || {};
  } catch (error: any) {
    console.error('[EXPORT SERVICE] Failed to get export stats:', error);
    return {};
  }
};

export default {
  generateExport,
  getExport,
  cleanupExpired,
  getAdminExportStats,
  maskPII,
};

