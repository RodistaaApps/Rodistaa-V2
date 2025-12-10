/**
 * Operators Controller - REST API endpoints
 */

import { Router } from 'express';
import { operatorsService } from '../services/operators/operators.service';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

router.get('/admin/users', authMiddleware, async (req, res) => {
  try {
    if (req.query.role !== 'operator') return res.status(400).json({ error: 'Invalid role' });
    const result = await operatorsService.getOperatorsList(req.query);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/users/:id', authMiddleware, async (req, res) => {
  try {
    const result = await operatorsService.getOperatorDetail(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/admin/users/:id/trucks', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const result = await operatorsService.getOperatorTrucks(req.params.id, limit, offset);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/trucks/:id/block', authMiddleware, requireRole(['super_admin']), async (req, res) => {
  try {
    const adminId = (req as any).user.id;
    const result = await operatorsService.blockTruck(req.params.id, adminId, req.body.reason);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/trucks/:id/transfer', authMiddleware, requireRole(['super_admin']), async (req, res) => {
  try {
    const adminId = (req as any).user.id;
    const result = await operatorsService.transferTruck({
      truckId: req.params.id,
      targetOperatorId: req.body.target_operator_id,
      adminId,
      reason: req.body.reason,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

