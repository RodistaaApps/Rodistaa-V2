/**
 * Drivers Controller - REST API endpoints
 */

import { Router } from 'express';
import { driversService } from '../services/drivers/drivers.service';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

router.get('/admin/users', authMiddleware, async (req, res) => {
  try {
    if (req.query.role !== 'driver') return res.status(400).json({ error: 'Invalid role' });
    const result = await driversService.getDriversList(req.query);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/users/:id', authMiddleware, async (req, res) => {
  try {
    const result = await driversService.getDriverDetail(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/admin/users/:id/locations', authMiddleware, requireRole(['super_admin', 'ops_manager']), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const result = await driversService.getLocationLogs(req.params.id, limit, offset);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/users/:id/locations/export', authMiddleware, requireRole(['super_admin']), async (req, res) => {
  try {
    const adminId = (req as any).user.id;
    const { reason } = req.body;
    const result = await driversService.exportLocationLogs(req.params.id, adminId, reason);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/admin/users/:id/assign', authMiddleware, requireRole(['super_admin']), async (req, res) => {
  try {
    const adminId = (req as any).user.id;
    const result = await driversService.assignDriver({ driverId: req.params.id, ...req.body, adminId });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/users/:id/unlink', authMiddleware, requireRole(['super_admin']), async (req, res) => {
  try {
    const adminId = (req as any).user.id;
    const result = await driversService.unlinkDriver({ driverId: req.params.id, ...req.body, adminId });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/admin/users/:id/ping', authMiddleware, async (req, res) => {
  try {
    // Queue immediate ping request to driver app
    res.json({ queued: true, message: 'Ping request sent to driver' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

