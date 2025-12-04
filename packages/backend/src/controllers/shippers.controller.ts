/**
 * Shippers Controller
 * REST API endpoints for shipper management
 */

import { Router, Request, Response } from 'express';
import { shippersService } from '../services/shippers/shippers.service';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

/**
 * GET /api/admin/users?role=shipper
 * List all shippers with filters
 */
router.get('/admin/users', authMiddleware, requireRole(['super_admin', 'compliance_officer']), async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    
    if (role !== 'shipper') {
      return res.status(400).json({ error: 'This endpoint only supports role=shipper' });
    }

    const params = {
      limit: req.query.limit ? parseInt(req.query.limit as string) : 25,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      search: req.query.search as string,
      franchise: req.query.franchise as string,
      city: req.query.city as string,
      state: req.query.state as string,
      sort: req.query.sort as any,
      order: req.query.order as any,
      has_acs: req.query.has_acs ? req.query.has_acs === 'true' : undefined,
      min_balance: req.query.min_balance ? parseFloat(req.query.min_balance as string) : undefined,
      last_active_range: req.query.last_active_range ? parseInt(req.query.last_active_range as string) : undefined,
    };

    const result = await shippersService.getShippersList(params);
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching shippers:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/users/:id
 * Get detailed shipper information
 */
router.get('/admin/users/:id', authMiddleware, requireRole(['super_admin', 'compliance_officer']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await shippersService.getShipperDetail(id);
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching shipper detail:', error);
    res.status(error.message === 'Shipper not found' ? 404 : 500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/users/:id/bookings
 * Get shipper bookings (paginated)
 */
router.get('/admin/users/:id/bookings', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const status = req.query.status as string;

    const result = await shippersService.getShipperBookings(id, limit, offset, status);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/users/:id/shipments
 * Get shipper shipments (paginated)
 */
router.get('/admin/users/:id/shipments', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const status = req.query.status as string;

    const result = await shippersService.getShipperShipments(id, limit, offset, status);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/users/:id/ledger
 * Get ledger transactions
 */
router.get('/admin/users/:id/ledger', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    const result = await shippersService.getShipperLedger(id, limit, offset);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/users/:id/ledger/adjust
 * Manual ledger adjustment (admin-only)
 * SECURITY: Requires reason, creates audit log
 */
router.post('/admin/users/:id/ledger/adjust', authMiddleware, requireRole(['super_admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, amount, reason } = req.body;
    const adminId = (req as any).user.id;

    if (!type || !amount || !reason) {
      return res.status(400).json({ error: 'type, amount, and reason are required' });
    }

    const result = await shippersService.adjustLedger({
      shipperId: id,
      adminId,
      type,
      amount: parseFloat(amount),
      reason,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/users/:id/documents
 * Get shipper documents
 */
router.get('/admin/users/:id/documents', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const documents = await shippersService.getShipperDocuments(id);
    res.json({ data: documents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/users/:id/documents/:docId/view
 * View document with permission check
 * SECURITY: Requires reason for sensitive docs, creates audit log
 */
router.get('/admin/users/:id/documents/:docId/view', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id, docId } = req.params;
    const { reason } = req.query;
    const adminId = (req as any).user.id;
    const adminRole = (req as any).user.role;
    const ipAddress = req.ip;

    const result = await shippersService.viewDocument({
      shipperId: id,
      documentId: docId,
      adminId,
      adminRole,
      reason: reason as string || '',
      ipAddress,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/users/:id/audit
 * Get audit trail for shipper
 */
router.get('/admin/users/:id/audit', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    const result = await shippersService.getAuditTrail(id, limit, offset);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/users/:id/audit/actions
 * Create audit log entry for admin action
 */
router.post('/admin/users/:id/audit/actions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, payload } = req.body;
    const adminId = (req as any).user.id;
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const result = await shippersService.createAuditAction({
      shipperId: id,
      adminId,
      action,
      payload,
      ipAddress,
      userAgent,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/users/:id/block
 * Block or unblock shipper
 * SECURITY: Requires reason, creates audit log
 */
router.post('/admin/users/:id/block', authMiddleware, requireRole(['super_admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { block, reason, duration } = req.body;
    const adminId = (req as any).user.id;

    if (block === undefined) {
      return res.status(400).json({ error: 'block parameter is required' });
    }

    const result = await shippersService.toggleBlock({
      shipperId: id,
      adminId,
      block,
      reason,
      duration,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

