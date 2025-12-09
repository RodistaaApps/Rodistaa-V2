/**
 * Tickets Controller
 * 
 * Admin ticket management endpoints:
 * - List tickets with comprehensive filters
 * - Create, update, assign tickets
 * - Add messages/comments
 * - Escalate, resolve, close tickets
 * - Bulk operations
 * - Export jobs
 */

import { Response } from 'express';
import { AdminRequest } from '../middleware/auth';
import { Pool } from 'pg';
import auditService from '../services/auditService';
import notificationService from '../services/notificationService';

const pool: Pool | null = null; // TODO: Import actual DB connection

/**
 * List tickets with filters
 * GET /admin/tickets
 */
export const listTickets = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 25,
      status,
      priority,
      owner_id,
      owner_role,
      franchise_id,
      linked_type,
      linked_id,
      search,
      tags,
      from_date,
      to_date,
      sort = 'created_at',
      order = 'desc',
    } = req.query;

    // TODO: Build query with filters
    const mockTickets = [
      {
        id: 'TKT-001',
        title: 'Payment not received for shipment SHP-001',
        description: 'Driver completed delivery but payment not credited',
        created_by_id: 'USR-20241',
        created_by_role: 'driver',
        owner_id: 'ADM-001',
        owner_role: 'finance',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        linked_type: 'shipment',
        linked_id: 'SHP-001',
        sla_due_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        sla_status: 'on_track',
        tags: ['payment', 'urgent'],
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'TKT-002',
        title: 'Truck KYC documents expired',
        description: 'RC and insurance expired for truck DL01AB1234',
        created_by_id: 'SYSTEM',
        created_by_role: 'system',
        owner_id: 'ADM-002',
        owner_role: 'compliance_officer',
        priority: 'MEDIUM',
        status: 'OPEN',
        linked_type: 'truck',
        linked_id: 'DL01AB1234',
        sla_due_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        sla_status: 'on_track',
        tags: ['kyc', 'compliance'],
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
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
    });
  } catch (error: any) {
    console.error('[TICKETS] List failed:', error);
    res.status(500).json({ error: 'Failed to list tickets', details: error.message });
  }
};

/**
 * Get ticket detail
 * GET /admin/tickets/:ticketId
 */
export const getTicketDetail = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.params;

    const mockTicket = {
      id: ticketId,
      title: 'Payment not received for shipment SHP-001',
      description: 'Driver completed delivery 3 days ago but payment still not credited to wallet. Driver is requesting immediate resolution.',
      created_by_id: 'USR-20241',
      created_by_role: 'driver',
      created_by_name: 'Ramesh Kumar',
      owner_id: 'ADM-001',
      owner_role: 'finance',
      owner_name: 'Finance Team',
      assigned_franchise_id: null,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      severity: null,
      linked_type: 'shipment',
      linked_id: 'SHP-001',
      sla_due_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      sla_escalation_level: 0,
      sla_breached: false,
      tags: ['payment', 'urgent'],
      is_sensitive: false,
      archived: false,
      resolution_summary: null,
      metadata: {},
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      resolved_at: null,
      closed_at: null,
    };

    res.json({
      success: true,
      data: mockTicket,
    });
  } catch (error: any) {
    console.error('[TICKETS] Get detail failed:', error);
    res.status(500).json({ error: 'Failed to get ticket details', details: error.message });
  }
};

/**
 * Create ticket
 * POST /tickets or POST /admin/tickets
 */
export const createTicket = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      priority = 'MEDIUM',
      linked_type,
      linked_id,
      tags = [],
      assigned_franchise_id,
      is_sensitive = false,
      owner_id,
      owner_role,
    } = req.body;

    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // TODO: Validate linked entity exists
    // TODO: Calculate SLA due date
    // TODO: Insert ticket
    // TODO: Create audit entry
    // TODO: Notify watchers

    const ticketId = `TKT-${Date.now()}`;

    // Mock SLA calculation
    const sla_due_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Audit log
    const txnId = await auditService.log({
      adminId: req.admin.id,
      actionType: 'CREATE_TICKET' as any,
      resourceType: 'ticket' as any,
      resourceId: ticketId,
      payload: { title, priority, linked_type, linked_id },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Ticket created successfully',
      data: {
        id: ticketId,
        title,
        priority,
        status: 'NEW',
        sla_due_at,
        txnId,
      },
    });
  } catch (error: any) {
    console.error('[TICKETS] Create failed:', error);
    res.status(500).json({ error: 'Failed to create ticket', details: error.message });
  }
};

/**
 * Update ticket
 * PATCH /admin/tickets/:ticketId
 */
export const updateTicket = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.params;
    const {
      status,
      owner_id,
      owner_role,
      priority,
      tags,
      resolution_summary,
    } = req.body;

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // TODO: Validate FSM transitions
    // TODO: Validate RBAC permissions
    // TODO: Update ticket
    // TODO: Create audit entry
    // TODO: Notify watchers

    // Audit log
    const txnId = await auditService.log({
      adminId: req.admin.id,
      actionType: 'UPDATE_TICKET' as any,
      resourceType: 'ticket' as any,
      resourceId: ticketId,
      payload: { status, owner_id, owner_role, priority },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: {
        ticketId,
        txnId,
      },
    });
  } catch (error: any) {
    console.error('[TICKETS] Update failed:', error);
    res.status(500).json({ error: 'Failed to update ticket', details: error.message });
  }
};

/**
 * Add message to ticket
 * POST /admin/tickets/:ticketId/messages
 */
export const addMessage = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.params;
    const { message, is_internal_note = false, attachments = [] } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // TODO: Insert message
    // TODO: Notify watchers (if not internal)

    res.json({
      success: true,
      message: 'Message added successfully',
      data: {
        ticketId,
        messageId: Date.now(),
      },
    });
  } catch (error: any) {
    console.error('[TICKETS] Add message failed:', error);
    res.status(500).json({ error: 'Failed to add message', details: error.message });
  }
};

/**
 * Get ticket messages
 * GET /admin/tickets/:ticketId/messages
 */
export const getMessages = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.params;

    const mockMessages = [
      {
        id: 1,
        ticket_id: ticketId,
        actor_id: 'USR-20241',
        actor_role: 'driver',
        actor_name: 'Ramesh Kumar',
        message: 'I completed the delivery 3 days ago but still no payment received.',
        attachments: [],
        is_internal_note: false,
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        ticket_id: ticketId,
        actor_id: 'ADM-001',
        actor_role: 'finance',
        actor_name: 'Finance Team',
        message: 'Checking with accounts team. Will update soon.',
        attachments: [],
        is_internal_note: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];

    res.json({
      success: true,
      data: mockMessages,
    });
  } catch (error: any) {
    console.error('[TICKETS] Get messages failed:', error);
    res.status(500).json({ error: 'Failed to get messages', details: error.message });
  }
};

/**
 * Assign ticket
 * POST /admin/tickets/:ticketId/assign
 */
export const assignTicket = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.params;
    const { owner_id, owner_role, reason } = req.body;

    if (!owner_role) {
      res.status(400).json({ error: 'Owner role is required' });
      return;
    }

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // TODO: Update ticket owner
    // TODO: Create audit entry
    // TODO: Notify new owner

    // Audit log
    const txnId = await auditService.log({
      adminId: req.admin.id,
      actionType: 'ASSIGN_TICKET' as any,
      resourceType: 'ticket' as any,
      resourceId: ticketId,
      payload: { owner_id, owner_role, reason },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Ticket assigned successfully',
      data: {
        ticketId,
        owner_id,
        owner_role,
        txnId,
      },
    });
  } catch (error: any) {
    console.error('[TICKETS] Assign failed:', error);
    res.status(500).json({ error: 'Failed to assign ticket', details: error.message });
  }
};

/**
 * Escalate ticket
 * POST /admin/tickets/:ticketId/escalate
 */
export const escalateTicket = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.length < 20) {
      res.status(400).json({ error: 'Reason must be at least 20 characters' });
      return;
    }

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // TODO: Get escalation chain from SLA config
    // TODO: Move to next role in chain
    // TODO: Update ticket
    // TODO: Create audit entry
    // TODO: Send notifications

    // Audit log
    const txnId = await auditService.log({
      adminId: req.admin.id,
      actionType: 'ESCALATE_TICKET' as any,
      resourceType: 'ticket' as any,
      resourceId: ticketId,
      payload: { reason },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Ticket escalated successfully',
      data: {
        ticketId,
        txnId,
      },
    });
  } catch (error: any) {
    console.error('[TICKETS] Escalate failed:', error);
    res.status(500).json({ error: 'Failed to escalate ticket', details: error.message });
  }
};

/**
 * Watch/unwatch ticket
 * POST /admin/tickets/:ticketId/watch
 * DELETE /admin/tickets/:ticketId/watch
 */
export const toggleWatch = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.params;
    const isWatch = req.method === 'POST';

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // TODO: Add/remove watcher

    res.json({
      success: true,
      message: isWatch ? 'Now watching ticket' : 'Stopped watching ticket',
      data: {
        ticketId,
        watching: isWatch,
      },
    });
  } catch (error: any) {
    console.error('[TICKETS] Toggle watch failed:', error);
    res.status(500).json({ error: 'Failed to toggle watch', details: error.message });
  }
};

/**
 * Get ticket audit log
 * GET /admin/tickets/:ticketId/audit
 */
export const getAuditLog = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const mockAuditEntries = [
      {
        id: 1,
        ticket_id: ticketId,
        actor_id: 'USR-20241',
        actor_role: 'driver',
        action: 'CREATED',
        payload: { title: 'Payment not received', priority: 'HIGH' },
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        ticket_id: ticketId,
        actor_id: 'ADM-001',
        actor_role: 'finance',
        action: 'ASSIGNED',
        payload: { owner_id: 'ADM-001', owner_role: 'finance' },
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];

    res.json({
      success: true,
      data: mockAuditEntries,
    });
  } catch (error: any) {
    console.error('[TICKETS] Get audit failed:', error);
    res.status(500).json({ error: 'Failed to get audit log', details: error.message });
  }
};

/**
 * Bulk operations
 * POST /admin/tickets/bulk
 */
export const bulkOperations = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { ticket_ids, action, payload, reason } = req.body;

    if (!ticket_ids || !Array.isArray(ticket_ids) || ticket_ids.length === 0) {
      res.status(400).json({ error: 'Ticket IDs array is required' });
      return;
    }

    if (!action) {
      res.status(400).json({ error: 'Action is required' });
      return;
    }

    if (!reason || reason.length < 20) {
      res.status(400).json({ error: 'Reason must be at least 20 characters' });
      return;
    }

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // TODO: Validate action
    // TODO: Perform bulk update
    // TODO: Create audit entries
    // TODO: Send notifications

    // Audit log
    const txnId = await auditService.log({
      adminId: req.admin.id,
      actionType: `BULK_${action.toUpperCase()}` as any,
      resourceType: 'ticket' as any,
      resourceId: ticket_ids.join(','),
      payload: { ticket_ids, action, payload, reason },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      data: {
        processed: ticket_ids.length,
        txnId,
      },
    });
  } catch (error: any) {
    console.error('[TICKETS] Bulk operation failed:', error);
    res.status(500).json({ error: 'Failed to perform bulk operation', details: error.message });
  }
};

/**
 * Export tickets
 * POST /admin/tickets/export
 */
export const exportTickets = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const filters = req.body;

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // TODO: Create export job
    // TODO: Queue worker to process

    const jobId = `EXPORT-${Date.now()}`;

    res.json({
      success: true,
      message: 'Export job created',
      data: {
        jobId,
        status: 'pending',
        message: 'Your export is being processed. You will receive a notification when ready.',
      },
    });
  } catch (error: any) {
    console.error('[TICKETS] Export failed:', error);
    res.status(500).json({ error: 'Failed to create export job', details: error.message });
  }
};

export default {
  listTickets,
  getTicketDetail,
  createTicket,
  updateTicket,
  addMessage,
  getMessages,
  assignTicket,
  escalateTicket,
  toggleWatch,
  getAuditLog,
  bulkOperations,
  exportTickets,
};

