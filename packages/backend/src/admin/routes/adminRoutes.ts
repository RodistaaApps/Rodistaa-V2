/**
 * Admin Routes
 * 
 * Mounts all admin endpoints with authentication and RBAC middleware.
 * All routes require authentication and specific permissions.
 */

import express from 'express';
import { authenticateAdmin, requirePermission, adminRateLimit } from '../middleware/auth';
import truckController from '../controllers/truckAdminController';
import ticketController from '../controllers/ticketController';
import truckValidator, { validate } from '../validators/truckValidator';
import ticketValidator from '../validators/ticketValidator';

const router = express.Router();

// Apply authentication and rate limiting to all admin routes
router.use(authenticateAdmin);
router.use(adminRateLimit(100, 60000)); // 100 requests per minute

// ============================================================================
// TRUCK MANAGEMENT ROUTES
// ============================================================================

/**
 * List trucks (paginated with filters)
 * GET /admin/trucks
 * Required: trucks:read
 */
router.get(
  '/trucks',
  requirePermission('trucks:read'),
  validate(truckValidator.listTrucksSchema),
  truckController.listTrucks
);

/**
 * Get truck details
 * GET /admin/trucks/:rc
 * Required: trucks:read
 */
router.get(
  '/trucks/:rc',
  requirePermission('trucks:read'),
  truckController.getTruckDetail
);

/**
 * Block truck
 * POST /admin/trucks/:rc/block
 * Required: trucks:block
 */
router.post(
  '/trucks/:rc/block',
  requirePermission('trucks:block'),
  validate(truckValidator.blockTruckSchema),
  truckController.blockTruck
);

/**
 * Unblock truck
 * POST /admin/trucks/:rc/unblock
 * Required: trucks:unblock
 */
router.post(
  '/trucks/:rc/unblock',
  requirePermission('trucks:unblock'),
  validate(truckValidator.unblockTruckSchema),
  truckController.unblockTruck
);

/**
 * Reverify truck (enqueue VAHAN verification)
 * POST /admin/trucks/:rc/reverify
 * Required: trucks:reverify
 */
router.post(
  '/trucks/:rc/reverify',
  requirePermission('trucks:reverify'),
  truckController.reverifyTruck
);

/**
 * Bulk action on trucks
 * POST /admin/trucks/bulk-action
 * Required: trucks:bulk_action
 */
router.post(
  '/trucks/bulk-action',
  requirePermission('trucks:bulk_action'),
  validate(truckValidator.bulkActionSchema),
  truckController.bulkAction
);

/**
 * Link trailer to tractor
 * POST /admin/trucks/:rc/link-trailer
 * Required: trailers:link
 */
router.post(
  '/trucks/:rc/link-trailer',
  requirePermission('trailers:link'),
  validate(truckValidator.linkTrailerSchema),
  truckController.linkTrailer
);

/**
 * Unlink trailer from tractor
 * POST /admin/trucks/:rc/unlink-trailer
 * Required: trailers:unlink
 */
router.post(
  '/trucks/:rc/unlink-trailer',
  requirePermission('trailers:unlink'),
  validate(truckValidator.unlinkTrailerSchema),
  truckController.unlinkTrailer
);

/**
 * Export trucks
 * POST /admin/trucks/export
 * Required: trucks:export (PII requires trucks:export_pii)
 */
router.post(
  '/trucks/export',
  requirePermission('trucks:export'),
  validate(truckValidator.exportTrucksSchema),
  truckController.exportTrucks
);

// ============================================================================
// TICKET MANAGEMENT ROUTES
// ============================================================================

/**
 * List tickets
 * GET /admin/tickets
 * Required: tickets:read
 */
router.get(
  '/tickets',
  requirePermission('tickets:read'),
  validate(ticketValidator.listTicketsSchema),
  ticketController.listTickets
);

/**
 * Get ticket details
 * GET /admin/tickets/:id
 * Required: tickets:read
 */
router.get(
  '/tickets/:id',
  requirePermission('tickets:read'),
  ticketController.getTicketDetail
);

/**
 * Create ticket
 * POST /admin/tickets
 * Required: tickets:create
 */
router.post(
  '/tickets',
  requirePermission('tickets:create'),
  validate(ticketValidator.createTicketSchema),
  ticketController.createTicket
);

/**
 * Assign ticket
 * PUT /admin/tickets/:id/assign
 * Required: tickets:assign
 */
router.put(
  '/tickets/:id/assign',
  requirePermission('tickets:assign'),
  validate(ticketValidator.assignTicketSchema),
  ticketController.assignTicket
);

/**
 * Resolve ticket
 * POST /admin/tickets/:id/resolve
 * Required: tickets:resolve
 */
router.post(
  '/tickets/:id/resolve',
  requirePermission('tickets:resolve'),
  validate(ticketValidator.resolveTicketSchema),
  ticketController.resolveTicket
);

/**
 * Escalate ticket
 * POST /admin/tickets/:id/escalate
 * Required: tickets:escalate
 */
router.post(
  '/tickets/:id/escalate',
  requirePermission('tickets:escalate'),
  validate(ticketValidator.escalateTicketSchema),
  ticketController.escalateTicket
);

/**
 * Add comment to ticket
 * POST /admin/tickets/:id/comments
 * Required: tickets:read
 */
router.post(
  '/tickets/:id/comments',
  requirePermission('tickets:read'),
  validate(ticketValidator.addCommentSchema),
  ticketController.addComment
);

/**
 * Get ticket statistics
 * GET /admin/tickets/stats
 * Required: tickets:read
 */
router.get(
  '/tickets/stats',
  requirePermission('tickets:read'),
  ticketController.getTicketStats
);

// ============================================================================
// HEALTH CHECK
// ============================================================================

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'admin-api',
  });
});

export default router;

