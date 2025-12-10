/**
 * Truck Admin Controller
 * 
 * Handles all truck management operations for admin portal:
 * - List trucks with filters and pagination
 * - View truck details with compliance data
 * - Block/Unblock trucks with reason tracking
 * - Reverify trucks (enqueue VAHAN verification)
 * - Bulk actions (block, unblock, reverify, export)
 * - Link/Unlink trailers
 * - Create tickets for manual review
 */

import { Response } from 'express';
import { AdminRequest } from '../middleware/auth';
import auditService, { AuditActionType, AuditResourceType } from '../services/auditService';
import notificationService, { NotificationType, NotificationSeverity } from '../services/notificationService';
import exportService from '../services/exportService';
import { Pool } from 'pg';

// TODO: Import actual DB connection and Truck Master API client
const pool: Pool | null = null;

/**
 * List trucks with filters and pagination
 * GET /admin/trucks?page=1&limit=25&compliance=blocked&operator=OP-123
 */
export const listTrucks = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 25,
      search,
      compliance, // allowed, blocked, pending
      operator,
      provider, // VAHAN, Surepass
      city,
      state,
      bodyType,
      minGVW,
      maxGVW,
      hasTickets,
      sort = 'last_verified',
      order = 'desc',
    } = req.query;

    // TODO: Build SQL query with filters
    // const query = buildTruckListQuery(req.query);
    // const result = await pool.query(query.sql, query.values);

    // Mock response for now
    const mockTrucks = [
      {
        rc_number: 'DL01AB1234',
        operator_id: 'OP-001',
        operator_name: 'ABC Transport',
        compliance_status: 'allowed',
        last_verified: '2025-12-05T10:00:00Z',
        provider: 'VAHAN',
        provider_txn_id: 'VH-20251205-ABC123',
        tyres: 10,
        label: 'DXL',
        body_type: 'Container',
        gvw: 25000,
        inferred_length: 32.5,
        fit_score: 95,
        tickets_count: 0,
        linked_trailer: null,
      },
      // ... more trucks
    ];

    res.json({
      success: true,
      data: mockTrucks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 150,
        totalPages: 6,
      },
      filters: req.query,
    });
  } catch (error: any) {
    console.error('[TRUCK ADMIN] List failed:', error);
    res.status(500).json({ error: 'Failed to list trucks', details: error.message });
  }
};

/**
 * Get truck details with compliance history
 * GET /admin/trucks/:rc
 */
export const getTruckDetail = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { rc } = req.params;

    // TODO: Fetch from Truck Master API: /api/truck/:rc
    // const truckData = await truckMasterAPI.getTruck(rc);
    // const complianceHistory = await getComplianceHistory(rc);
    // const tickets = await getTicketsForResource('truck', rc);
    // const auditLogs = await auditService.getResourceAudit('truck', rc);

    // Mock response
    const mockDetail = {
      // Truck Master data
      truckMaster: {
        rc_number: rc,
        operator_id: 'OP-001',
        operator_name: 'ABC Transport',
        owner_name: 'John Doe',
        owner_mobile: '+911234567890',
        tyres: 10,
        label: 'DXL',
        body_type: 'Container',
        gvw: 25000,
        model: 'Tata LPT 2518',
        manufacture_year: 2020,
        fitness_upto: '2026-12-31',
        status: 'active',
      },
      
      // Compliance decision
      complianceDecision: {
        status: 'allowed',
        reason: null,
        blocked_by: null,
        blocked_at: null,
        last_verified_at: '2025-12-05T10:00:00Z',
        confidence_score: 95,
      },

      // Inference result
      inferenceResult: {
        inferred_length: 32.5,
        inferred_body_type: 'Container',
        candidate_lengths: [32, 32.5, 33],
        confidence: 95,
        rules_applied: ['TYRES_TO_LENGTH', 'GVW_VALIDATION'],
        fit_score: 95,
      },

      // VAHAN snapshots
      snapshots: [
        {
          id: 1,
          provider: 'VAHAN',
          txn_id: 'VH-20251205-ABC123',
          raw_data: {
            rc_number: rc,
            owner_name: 'John Doe',
            vehicle_class: 'LMV',
            // ... full VAHAN response
          },
          fetched_at: '2025-12-05T10:00:00Z',
        },
      ],

      // Compliance history
      complianceHistory: [
        {
          timestamp: '2025-12-05T10:00:00Z',
          action: 'ALLOWED',
          admin_id: 'SYSTEM',
          reason: 'Auto-verification passed',
          confidence: 95,
        },
      ],

      // Associated tickets
      tickets: [],

      // Audit trail
      auditLogs: [],

      // Linked vehicles
      linkedTrailer: null,
    };

    res.json({
      success: true,
      data: mockDetail,
    });
  } catch (error: any) {
    console.error('[TRUCK ADMIN] Get detail failed:', error);
    res.status(500).json({ error: 'Failed to get truck details', details: error.message });
  }
};

/**
 * Block truck with reason
 * POST /admin/trucks/:rc/block
 * Body: { reason: string, evidenceIds?: string[], createTicket?: boolean }
 */
export const blockTruck = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { rc } = req.params;
    const { reason, evidenceIds, createTicket } = req.body;

    if (!reason) {
      res.status(400).json({ error: 'Reason is required for blocking' });
      return;
    }

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // TODO: Update truck status in database
    // await pool.query(
    //   'UPDATE trucks SET compliance_status = $1, blocked_by = $2, blocked_at = NOW(), block_reason = $3 WHERE rc_number = $4',
    //   ['blocked', req.admin.id, reason, rc]
    // );

    // Write audit log
    const txnId = await auditService.log({
      adminId: req.admin.id,
      actionType: AuditActionType.BLOCK_TRUCK,
      resourceType: AuditResourceType.TRUCK,
      resourceId: rc,
      payload: { reason, evidenceIds },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Create ticket if requested
    let ticketId = null;
    if (createTicket) {
      // TODO: Create ticket
      ticketId = 'TKT-' + Date.now();
    }

    // Send notification
    await notificationService.notify({
      type: NotificationType.BLOCKING_EVENT,
      severity: NotificationSeverity.WARNING,
      title: `Truck Blocked: ${rc}`,
      message: `Admin ${req.admin.email} blocked truck ${rc}. Reason: ${reason}`,
      actionUrl: `/admin/fleet/trucks/${rc}`,
      payload: { rc, reason, txnId, ticketId },
    });

    res.json({
      success: true,
      message: 'Truck blocked successfully',
      data: {
        rc,
        status: 'blocked',
        txnId,
        ticketId,
        blockedBy: req.admin.id,
        blockedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[TRUCK ADMIN] Block failed:', error);
    res.status(500).json({ error: 'Failed to block truck', details: error.message });
  }
};

/**
 * Unblock truck with reason
 * POST /admin/trucks/:rc/unblock
 * Body: { reason: string }
 */
export const unblockTruck = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { rc } = req.params;
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({ error: 'Reason is required for unblocking' });
      return;
    }

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // TODO: Update truck status in database
    // await pool.query(
    //   'UPDATE trucks SET compliance_status = $1, unblocked_by = $2, unblocked_at = NOW(), unblock_reason = $3 WHERE rc_number = $4',
    //   ['allowed', req.admin.id, reason, rc]
    // );

    // Write audit log
    const txnId = await auditService.log({
      adminId: req.admin.id,
      actionType: AuditActionType.UNBLOCK_TRUCK,
      resourceType: AuditResourceType.TRUCK,
      resourceId: rc,
      payload: { reason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Send notification
    await notificationService.notify({
      type: NotificationType.BLOCKING_EVENT,
      severity: NotificationSeverity.INFO,
      title: `Truck Unblocked: ${rc}`,
      message: `Admin ${req.admin.email} unblocked truck ${rc}`,
      actionUrl: `/admin/fleet/trucks/${rc}`,
      payload: { rc, reason, txnId },
    });

    res.json({
      success: true,
      message: 'Truck unblocked successfully',
      data: {
        rc,
        status: 'allowed',
        txnId,
        unblockedBy: req.admin.id,
        unblockedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[TRUCK ADMIN] Unblock failed:', error);
    res.status(500).json({ error: 'Failed to unblock truck', details: error.message });
  }
};

/**
 * Reverify truck (enqueue VAHAN verification)
 * POST /admin/trucks/:rc/reverify
 */
export const reverifyTruck = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { rc } = req.params;

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // TODO: Call Truck Master API: /api/truck/:rc/reverify
    // const result = await truckMasterAPI.reverify(rc);

    // Write audit log
    const txnId = await auditService.log({
      adminId: req.admin.id,
      actionType: AuditActionType.REVERIFY_TRUCK,
      resourceType: AuditResourceType.TRUCK,
      resourceId: rc,
      payload: { initiatedBy: req.admin.email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Truck reverification enqueued',
      data: {
        rc,
        txnId,
        enqueuedAt: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 60000).toISOString(), // +1 minute
      },
    });
  } catch (error: any) {
    console.error('[TRUCK ADMIN] Reverify failed:', error);
    res.status(500).json({ error: 'Failed to enqueue reverification', details: error.message });
  }
};

/**
 * Bulk action on multiple trucks
 * POST /admin/trucks/bulk-action
 * Body: { action: 'block' | 'unblock' | 'reverify' | 'export', rcNumbers: string[], reason?: string }
 */
export const bulkAction = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { action, rcNumbers, reason } = req.body;

    if (!action || !rcNumbers || !Array.isArray(rcNumbers) || rcNumbers.length === 0) {
      res.status(400).json({ error: 'Invalid bulk action request' });
      return;
    }

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Validate action requires reason
    if (['block', 'unblock'].includes(action) && !reason) {
      res.status(400).json({ error: `Reason is required for ${action} action` });
      return;
    }

    const results = {
      total: rcNumbers.length,
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    // Log bulk action with correlation ID
    const correlationId = await auditService.logBulkAction(
      req.admin.id,
      `BULK_${action.toUpperCase()}`,
      rcNumbers.map(rc => ({ resourceType: 'truck', resourceId: rc })),
      { action, reason },
      req.ip
    );

    // Process each truck
    for (const rc of rcNumbers) {
      try {
        switch (action) {
          case 'block':
            // TODO: Block truck
            results.success++;
            break;
          case 'unblock':
            // TODO: Unblock truck
            results.success++;
            break;
          case 'reverify':
            // TODO: Enqueue reverify
            results.success++;
            break;
          case 'export':
            // Export will be handled separately
            results.success++;
            break;
          default:
            results.failed++;
            results.errors.push({ rc, error: `Unknown action: ${action}` });
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push({ rc, error: error.message });
      }
    }

    // Notify admin of completion
    await notificationService.notifyBulkActionComplete(
      req.admin.id,
      action,
      results.total,
      results.success,
      results.failed
    );

    res.json({
      success: true,
      message: `Bulk ${action} completed`,
      data: {
        correlationId,
        results,
      },
    });
  } catch (error: any) {
    console.error('[TRUCK ADMIN] Bulk action failed:', error);
    res.status(500).json({ error: 'Bulk action failed', details: error.message });
  }
};

/**
 * Link trailer to tractor
 * POST /admin/trucks/:rc/link-trailer
 * Body: { trailerRc: string }
 */
export const linkTrailer = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { rc: tractorRc } = req.params;
    const { trailerRc } = req.body;

    if (!trailerRc) {
      res.status(400).json({ error: 'Trailer RC is required' });
      return;
    }

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // TODO: Validate both vehicles exist and are of correct types
    // TODO: Check if already linked
    // TODO: Insert into trailer_links table

    // Write audit log
    const txnId = await auditService.log({
      adminId: req.admin.id,
      actionType: AuditActionType.LINK_TRAILER,
      resourceType: AuditResourceType.TRAILER,
      resourceId: trailerRc,
      payload: { tractorRc, trailerRc },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Trailer linked successfully',
      data: {
        tractorRc,
        trailerRc,
        linkedBy: req.admin.id,
        linkedAt: new Date().toISOString(),
        txnId,
      },
    });
  } catch (error: any) {
    console.error('[TRUCK ADMIN] Link trailer failed:', error);
    res.status(500).json({ error: 'Failed to link trailer', details: error.message });
  }
};

/**
 * Unlink trailer from tractor
 * POST /admin/trucks/:rc/unlink-trailer
 * Body: { reason: string }
 */
export const unlinkTrailer = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { rc: tractorRc } = req.params;
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({ error: 'Reason is required for unlinking' });
      return;
    }

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // TODO: Update trailer_links table (set status = 'inactive', unlinked_by, unlinked_at)

    // Write audit log
    const txnId = await auditService.log({
      adminId: req.admin.id,
      actionType: AuditActionType.UNLINK_TRAILER,
      resourceType: AuditResourceType.TRAILER,
      resourceId: tractorRc,
      payload: { tractorRc, reason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Trailer unlinked successfully',
      data: {
        tractorRc,
        unlinkedBy: req.admin.id,
        unlinkedAt: new Date().toISOString(),
        txnId,
      },
    });
  } catch (error: any) {
    console.error('[TRUCK ADMIN] Unlink trailer failed:', error);
    res.status(500).json({ error: 'Failed to unlink trailer', details: error.message });
  }
};

/**
 * Generate export for trucks
 * POST /admin/trucks/export
 * Body: { format: 'csv' | 'pdf', filters: object, columns?: string[] }
 */
export const exportTrucks = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { format = 'csv', filters = {}, columns } = req.body;

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check PII permission
    const canIncludePII = req.admin.role === 'SuperAdmin';

    // Generate export
    const exportResult = await exportService.generateExport({
      type: 'trucks',
      format,
      filters,
      adminId: req.admin.id,
      adminRole: req.admin.role,
      includePII: canIncludePII,
      columns,
    });

    // Notify admin when ready
    await notificationService.notifyExportReady(
      req.admin.id,
      exportResult.exportId,
      exportResult.filename
    );

    res.json({
      success: true,
      message: 'Export generated successfully',
      data: exportResult,
    });
  } catch (error: any) {
    console.error('[TRUCK ADMIN] Export failed:', error);
    res.status(500).json({ error: 'Failed to generate export', details: error.message });
  }
};

export default {
  listTrucks,
  getTruckDetail,
  blockTruck,
  unblockTruck,
  reverifyTruck,
  bulkAction,
  linkTrailer,
  unlinkTrailer,
  exportTrucks,
};

