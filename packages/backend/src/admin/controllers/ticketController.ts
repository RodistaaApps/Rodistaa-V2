/**
 * Ticket Controller
 * 
 * Manages HQ ticket queue for manual reviews, disputes, and escalations:
 * - List tickets with filters (priority, status, assigned_to)
 * - Get ticket details with provider diffs
 * - Create tickets (manual or system-generated)
 * - Assign tickets to admins
 * - Resolve tickets with resolution notes
 * - Escalate tickets when SLA breached
 * - Add comments to tickets
 */

import { Response } from 'express';
import { AdminRequest } from '../middleware/auth';
import auditService, { AuditActionType, AuditResourceType } from '../services/auditService';
import notificationService, { NotificationType, NotificationSeverity } from '../services/notificationService';
import { Pool } from 'pg';

// TODO: Import actual DB connection
const pool: Pool | null = null;

/**
 * List tickets with filters
 * GET /admin/tickets?status=OPEN&priority=P0&assigned_to=ADM-001
 */
export const listTickets = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 25,
      status, // OPEN, IN_PROGRESS, RESOLVED, ESCALATED, CLOSED
      priority, // P0, P1, P2, P3
      assignedTo,
      ticketType, // PROVIDER_MISMATCH, DUPLICATE_CHASSIS, MANUAL_REVIEW, DISPUTE
      resourceType,
      resourceId,
      slaBreached,
      sort = 'created_at',
      order = 'desc',
    } = req.query;

    // TODO: Build query with filters
    // const query = buildTicketListQuery(req.query);
    // const result = await pool.query(query.sql, query.values);

    // Mock response
    const mockTickets = [
      {
        id: 'TKT-001',
        ticket_type: 'PROVIDER_MISMATCH',
        priority: 'P1',
        status: 'OPEN',
        title: 'Provider mismatch for DL01AB1234',
        description: 'VAHAN and Surepass disagree on vehicle_category',
        resource_type: 'truck',
        resource_id: 'DL01AB1234',
        created_by: 'SYSTEM',
        assigned_to: 'ADM-002',
        sla_due_at: '2025-12-06T10:00:00Z',
        created_at: '2025-12-05T10:00:00Z',
        updated_at: '2025-12-05T10:00:00Z',
        is_sla_breached: false,
        time_until_sla: '24h',
      },
      // ... more tickets
    ];

    res.json({
      success: true,
      data: mockTickets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 45,
        totalPages: 2,
      },
      filters: req.query,
    });
  } catch (error: any) {
    console.error('[TICKET CONTROLLER] List failed:', error);
    res.status(500).json({ error: 'Failed to list tickets', details: error.message });
  }
};

/**
 * Get ticket details
 * GET /admin/tickets/:id
 */
export const getTicketDetail = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // TODO: Fetch from database with comments
    // const ticket = await pool.query('SELECT * FROM hq_tickets WHERE id = $1', [id]);
    // const comments = await pool.query('SELECT * FROM ticket_comments WHERE ticket_id = $1 ORDER BY created_at ASC', [id]);

    // Mock response
    const mockTicket = {
      id,
      ticket_type: 'PROVIDER_MISMATCH',
      priority: 'P1',
      status: 'OPEN',
      title: 'Provider mismatch for DL01AB1234',
      description: 'VAHAN and Surepass disagree on vehicle_category',
      resource_type: 'truck',
      resource_id: 'DL01AB1234',
      created_by: 'SYSTEM',
      assigned_to: 'ADM-002',
      resolved_by: null,
      sla_due_at: '2025-12-06T10:00:00Z',
      resolved_at: null,
      escalated_at: null,
      resolution: null,
      resolution_type: null,
      metadata: {
        provider_diffs: {
          VAHAN: { vehicle_category: 'LMV' },
          Surepass: { vehicle_category: 'HMV' },
        },
        confidence_scores: {
          VAHAN: 95,
          Surepass: 88,
        },
      },
      tags: ['provider-mismatch', 'requires-review'],
      created_at: '2025-12-05T10:00:00Z',
      updated_at: '2025-12-05T10:00:00Z',
      comments: [
        {
          id: 1,
          admin_id: 'ADM-002',
          admin_name: 'Jane Doe',
          comment: 'Investigating the mismatch',
          is_internal: true,
          created_at: '2025-12-05T11:00:00Z',
        },
      ],
    };

    res.json({
      success: true,
      data: mockTicket,
    });
  } catch (error: any) {
    console.error('[TICKET CONTROLLER] Get detail failed:', error);
    res.status(500).json({ error: 'Failed to get ticket details', details: error.message });
  }
};

/**
 * Create ticket
 * POST /admin/tickets
 * Body: { ticketType, priority, title, description, resourceType, resourceId, metadata, tags }
 */
export const createTicket = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const {
      ticketType,
      priority = 'P2',
      title,
      description,
      resourceType,
      resourceId,
      metadata = {},
      tags = [],
    } = req.body;

    if (!ticketType || !title || !resourceType || !resourceId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Calculate SLA due date based on priority
    const slaHours = { P0: 4, P1: 24, P2: 72, P3: 168 }[priority] || 72;
    const slaDueAt = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const ticketId = `TKT-${Date.now()}`;

    // TODO: Insert into hq_tickets table
    // await pool.query(
    //   `INSERT INTO hq_tickets (id, ticket_type, priority, title, description, resource_type, resource_id, 
    //    created_by, sla_due_at, metadata, tags, created_at, updated_at)
    //    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
    //   [ticketId, ticketType, priority, title, description, resourceType, resourceId, 
    //    req.admin.id, slaDueAt, JSON.stringify(metadata), tags]
    // );

    // Write audit log
    const txnId = await auditService.log({
      adminId: req.admin.id,
      actionType: AuditActionType.CREATE_TICKET,
      resourceType: AuditResourceType.TICKET,
      resourceId: ticketId,
      payload: { ticketType, priority, resourceType, resourceId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Send notification
    await notificationService.notify({
      type: NotificationType.TICKET_ASSIGNED,
      severity: priority === 'P0' || priority === 'P1' ? NotificationSeverity.CRITICAL : NotificationSeverity.WARNING,
      title: `New Ticket: ${title}`,
      message: `Priority ${priority} ticket created by ${req.admin.email}`,
      actionUrl: `/admin/fleet/tickets?id=${ticketId}`,
      payload: { ticketId, priority, resourceType, resourceId },
    });

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: {
        id: ticketId,
        ticketType,
        priority,
        status: 'OPEN',
        slaDueAt: slaDueAt.toISOString(),
        txnId,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[TICKET CONTROLLER] Create failed:', error);
    res.status(500).json({ error: 'Failed to create ticket', details: error.message });
  }
};

/**
 * Assign ticket to admin
 * PUT /admin/tickets/:id/assign
 * Body: { assignedTo: string }
 */
export const assignTicket = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!assignedTo) {
      res.status(400).json({ error: 'assignedTo is required' });
      return;
    }

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // TODO: Update ticket
    // await pool.query(
    //   'UPDATE hq_tickets SET assigned_to = $1, status = $2, updated_at = NOW() WHERE id = $3',
    //   [assignedTo, 'IN_PROGRESS', id]
    // );

    // Write audit log
    const txnId = await auditService.log({
      adminId: req.admin.id,
      actionType: AuditActionType.ASSIGN_TICKET,
      resourceType: AuditResourceType.TICKET,
      resourceId: id,
      payload: { assignedTo },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Notify assigned admin
    await notificationService.notify({
      type: NotificationType.TICKET_ASSIGNED,
      severity: NotificationSeverity.INFO,
      title: `Ticket Assigned to You: ${id}`,
      message: `${req.admin.email} assigned ticket ${id} to you`,
      targetAdminId: assignedTo,
      actionUrl: `/admin/fleet/tickets?id=${id}`,
      payload: { ticketId: id, assignedBy: req.admin.id },
    });

    res.json({
      success: true,
      message: 'Ticket assigned successfully',
      data: {
        id,
        assignedTo,
        status: 'IN_PROGRESS',
        txnId,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[TICKET CONTROLLER] Assign failed:', error);
    res.status(500).json({ error: 'Failed to assign ticket', details: error.message });
  }
};

/**
 * Resolve ticket
 * POST /admin/tickets/:id/resolve
 * Body: { resolution: string, resolutionType: 'APPROVED' | 'REJECTED' | 'FIXED' | 'NO_ACTION_NEEDED' }
 */
export const resolveTicket = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { resolution, resolutionType } = req.body;

    if (!resolution || !resolutionType) {
      res.status(400).json({ error: 'resolution and resolutionType are required' });
      return;
    }

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // TODO: Update ticket
    // await pool.query(
    //   `UPDATE hq_tickets SET status = $1, resolved_by = $2, resolved_at = NOW(), 
    //    resolution = $3, resolution_type = $4, updated_at = NOW() WHERE id = $5`,
    //   ['RESOLVED', req.admin.id, resolution, resolutionType, id]
    // );

    // Write audit log
    const txnId = await auditService.log({
      adminId: req.admin.id,
      actionType: AuditActionType.RESOLVE_TICKET,
      resourceType: AuditResourceType.TICKET,
      resourceId: id,
      payload: { resolution, resolutionType },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Send notification
    await notificationService.notify({
      type: NotificationType.TICKET_RESOLVED,
      severity: NotificationSeverity.INFO,
      title: `Ticket Resolved: ${id}`,
      message: `${req.admin.email} resolved ticket ${id} - ${resolutionType}`,
      actionUrl: `/admin/fleet/tickets?id=${id}`,
      payload: { ticketId: id, resolutionType, resolvedBy: req.admin.id },
    });

    res.json({
      success: true,
      message: 'Ticket resolved successfully',
      data: {
        id,
        status: 'RESOLVED',
        resolvedBy: req.admin.id,
        resolvedAt: new Date().toISOString(),
        resolutionType,
        txnId,
      },
    });
  } catch (error: any) {
    console.error('[TICKET CONTROLLER] Resolve failed:', error);
    res.status(500).json({ error: 'Failed to resolve ticket', details: error.message });
  }
};

/**
 * Escalate ticket
 * POST /admin/tickets/:id/escalate
 * Body: { reason: string }
 */
export const escalateTicket = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({ error: 'reason is required' });
      return;
    }

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // TODO: Update ticket
    // await pool.query(
    //   'UPDATE hq_tickets SET status = $1, escalated_at = NOW(), updated_at = NOW() WHERE id = $2',
    //   ['ESCALATED', id]
    // );

    // Write audit log
    const txnId = await auditService.log({
      adminId: req.admin.id,
      actionType: AuditActionType.ESCALATE_TICKET,
      resourceType: AuditResourceType.TICKET,
      resourceId: id,
      payload: { reason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Send critical notification to SuperAdmins
    await notificationService.notify({
      type: NotificationType.SYSTEM_ALERT,
      severity: NotificationSeverity.CRITICAL,
      title: `Ticket Escalated: ${id}`,
      message: `${req.admin.email} escalated ticket ${id}. Reason: ${reason}`,
      actionUrl: `/admin/fleet/tickets?id=${id}`,
      payload: { ticketId: id, reason, escalatedBy: req.admin.id },
    });

    res.json({
      success: true,
      message: 'Ticket escalated successfully',
      data: {
        id,
        status: 'ESCALATED',
        escalatedAt: new Date().toISOString(),
        txnId,
      },
    });
  } catch (error: any) {
    console.error('[TICKET CONTROLLER] Escalate failed:', error);
    res.status(500).json({ error: 'Failed to escalate ticket', details: error.message });
  }
};

/**
 * Add comment to ticket
 * POST /admin/tickets/:id/comments
 * Body: { comment: string, isInternal: boolean }
 */
export const addComment = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { comment, isInternal = true } = req.body;

    if (!comment) {
      res.status(400).json({ error: 'comment is required' });
      return;
    }

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // TODO: Insert comment
    // const result = await pool.query(
    //   `INSERT INTO ticket_comments (ticket_id, admin_id, comment, is_internal, created_at)
    //    VALUES ($1, $2, $3, $4, NOW()) RETURNING id`,
    //   [id, req.admin.id, comment, isInternal]
    // );

    const commentId = Date.now();

    // Update ticket timestamp
    // await pool.query('UPDATE hq_tickets SET updated_at = NOW() WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: {
        id: commentId,
        ticketId: id,
        adminId: req.admin.id,
        comment,
        isInternal,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[TICKET CONTROLLER] Add comment failed:', error);
    res.status(500).json({ error: 'Failed to add comment', details: error.message });
  }
};

/**
 * Get tickets statistics
 * GET /admin/tickets/stats
 */
export const getTicketStats = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    // TODO: Query statistics from database
    // const stats = await pool.query(`
    //   SELECT 
    //     COUNT(*) FILTER (WHERE status = 'OPEN') as open_count,
    //     COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress_count,
    //     COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved_count,
    //     COUNT(*) FILTER (WHERE status = 'ESCALATED') as escalated_count,
    //     COUNT(*) FILTER (WHERE sla_due_at < NOW() AND status NOT IN ('RESOLVED', 'CLOSED')) as sla_breached_count,
    //     AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_time_hours
    //   FROM hq_tickets
    // `);

    // Mock stats
    const mockStats = {
      open: 12,
      inProgress: 8,
      resolved: 156,
      escalated: 3,
      slaBreached: 2,
      avgResolutionTimeHours: 18.5,
      byPriority: {
        P0: 1,
        P1: 5,
        P2: 10,
        P3: 4,
      },
      byType: {
        PROVIDER_MISMATCH: 8,
        DUPLICATE_CHASSIS: 3,
        MANUAL_REVIEW: 6,
        DISPUTE: 3,
      },
    };

    res.json({
      success: true,
      data: mockStats,
    });
  } catch (error: any) {
    console.error('[TICKET CONTROLLER] Get stats failed:', error);
    res.status(500).json({ error: 'Failed to get ticket stats', details: error.message });
  }
};

/**
 * Check for SLA breaches and escalate automatically
 * Called by cron job every 15 minutes
 */
export const checkSLABreaches = async (): Promise<void> => {
  try {
    // TODO: Query tickets with breached SLA
    // const breachedTickets = await pool.query(`
    //   SELECT id, priority, sla_due_at, assigned_to
    //   FROM hq_tickets
    //   WHERE sla_due_at < NOW() 
    //     AND status IN ('OPEN', 'IN_PROGRESS')
    //     AND escalated_at IS NULL
    // `);

    // for (const ticket of breachedTickets.rows) {
    //   // Auto-escalate
    //   await pool.query(
    //     'UPDATE hq_tickets SET status = $1, escalated_at = NOW() WHERE id = $2',
    //     ['ESCALATED', ticket.id]
    //   );

    //   // Notify SLA breach
    //   await notificationService.notifySLABreach(ticket.id, ticket.sla_due_at);
    // }

    console.log('[TICKET SLA CHECK] Completed');
  } catch (error: any) {
    console.error('[TICKET SLA CHECK] Failed:', error);
  }
};

export default {
  listTickets,
  getTicketDetail,
  createTicket,
  assignTicket,
  resolveTicket,
  escalateTicket,
  addComment,
  getTicketStats,
  checkSLABreaches,
};

