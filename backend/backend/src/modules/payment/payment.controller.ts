/**
 * Payment Controller
 * REST API endpoints for payment operations
 */

import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../auth/auth.middleware';
import * as walletService from '../../services/payment/wallet.service';
import * as upiAutopayService from '../../services/payment/upi-autopay.service';
import * as winFeeService from '../../services/payment/win-fee.service';
import * as commissionService from '../../services/payment/commission.service';
import * as gatewayMock from '../../services/payment/gateway-mock.service';
import { logger } from '../../utils/logger';

const log = logger.child({ module: 'payment-controller' });
const router = Router();

// ============================================================================
// WALLET ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/payment/wallet
 * Get operator wallet balance
 */
router.get('/wallet', authMiddleware, requireRole(['OPERATOR']), async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    const wallet = await walletService.getOrCreateWallet(operatorId);
    
    res.json({
      success: true,
      data: wallet,
    });
  } catch (error: any) {
    log.error({ error, userId: req.user?.id }, 'Failed to get wallet');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve wallet',
    });
  }
});

/**
 * POST /api/v1/payment/wallet/recharge
 * Recharge wallet (initiate payment)
 */
router.post('/wallet/recharge', authMiddleware, requireRole(['OPERATOR']), async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    // In production, this would initiate payment gateway
    // For MVP, we simulate instant credit
    const transaction = await walletService.creditWallet(
      operatorId,
      amount,
      'Wallet recharge',
      `RECHARGE-${Date.now()}`
    );

    res.json({
      success: true,
      message: 'Wallet recharged successfully',
      data: transaction,
    });
  } catch (error: any) {
    log.error({ error, userId: req.user?.id }, 'Failed to recharge wallet');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to recharge wallet',
    });
  }
});

/**
 * GET /api/v1/payment/wallet/transactions
 * Get wallet transaction history
 */
router.get('/wallet/transactions', authMiddleware, requireRole(['OPERATOR']), async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const transactions = await walletService.getWalletTransactions(operatorId, limit, offset);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        limit,
        offset,
        total: transactions.length,
      },
    });
  } catch (error: any) {
    log.error({ error, userId: req.user?.id }, 'Failed to get wallet transactions');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve transactions',
    });
  }
});

// ============================================================================
// UPI AUTOPAY ENDPOINTS
// ============================================================================

/**
 * POST /api/v1/payment/mandate/create
 * Create UPI Autopay mandate
 */
router.post('/mandate/create', authMiddleware, requireRole(['OPERATOR']), async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    const { upiId, maxAmount, startDate, endDate } = req.body;

    if (!upiId || !maxAmount) {
      return res.status(400).json({
        success: false,
        message: 'UPI ID and max amount are required',
      });
    }

    const mandate = await upiAutopayService.createMandate(
      operatorId,
      upiId,
      maxAmount,
      new Date(startDate || Date.now()),
      endDate ? new Date(endDate) : undefined
    );

    res.json({
      success: true,
      message: 'Mandate created. Please approve in your UPI app.',
      data: mandate,
    });
  } catch (error: any) {
    log.error({ error, userId: req.user?.id }, 'Failed to create mandate');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create mandate',
    });
  }
});

/**
 * POST /api/v1/payment/mandate/:mandateId/approve
 * Approve mandate (simulates UPI app approval)
 */
router.post('/mandate/:mandateId/approve', authMiddleware, requireRole(['OPERATOR']), async (req: Request, res: Response) => {
  try {
    const { mandateId } = req.params;
    await upiAutopayService.approveMandate(mandateId);

    res.json({
      success: true,
      message: 'Mandate approved successfully',
    });
  } catch (error: any) {
    log.error({ error, mandateId: req.params.mandateId }, 'Failed to approve mandate');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve mandate',
    });
  }
});

/**
 * GET /api/v1/payment/mandates
 * Get operator's mandates
 */
router.get('/mandates', authMiddleware, requireRole(['OPERATOR']), async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    const mandates = await upiAutopayService.getOperatorMandates(operatorId);

    res.json({
      success: true,
      data: mandates,
    });
  } catch (error: any) {
    log.error({ error, userId: req.user?.id }, 'Failed to get mandates');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve mandates',
    });
  }
});

/**
 * DELETE /api/v1/payment/mandate/:mandateId
 * Revoke mandate
 */
router.delete('/mandate/:mandateId', authMiddleware, requireRole(['OPERATOR']), async (req: Request, res: Response) => {
  try {
    const { mandateId } = req.params;
    await upiAutopayService.revokeMandate(mandateId);

    res.json({
      success: true,
      message: 'Mandate revoked successfully',
    });
  } catch (error: any) {
    log.error({ error, mandateId: req.params.mandateId }, 'Failed to revoke mandate');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to revoke mandate',
    });
  }
});

// ============================================================================
// FEE ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/payment/fees/outstanding
 * Get operator's outstanding fees
 */
router.get('/fees/outstanding', authMiddleware, requireRole(['OPERATOR']), async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    const fees = await winFeeService.getOutstandingFees(operatorId);

    res.json({
      success: true,
      data: fees,
    });
  } catch (error: any) {
    log.error({ error, userId: req.user?.id }, 'Failed to get outstanding fees');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve outstanding fees',
    });
  }
});

/**
 * GET /api/v1/payment/fees/stats
 * Get operator fee statistics
 */
router.get('/fees/stats', authMiddleware, requireRole(['OPERATOR']), async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    const stats = await winFeeService.getOperatorFeeStats(operatorId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    log.error({ error, userId: req.user?.id }, 'Failed to get fee stats');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve fee statistics',
    });
  }
});

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * POST /api/v1/payment/admin/retry-queue/process
 * Manually trigger retry queue processing (admin)
 */
router.post('/admin/retry-queue/process', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const result = await winFeeService.processRetryQueue();

    res.json({
      success: true,
      message: 'Retry queue processed',
      data: result,
    });
  } catch (error: any) {
    log.error({ error }, 'Failed to process retry queue');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process retry queue',
    });
  }
});

/**
 * POST /api/v1/payment/admin/fee/:chargeId/waive
 * Waive fee (admin action)
 */
router.post('/admin/fee/:chargeId/waive', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { chargeId } = req.params;
    const { reason } = req.body;
    const adminUserId = req.user!.id;

    await winFeeService.waiveFee(chargeId, adminUserId, reason || 'Waived by admin');

    res.json({
      success: true,
      message: 'Fee waived successfully',
    });
  } catch (error: any) {
    log.error({ error, chargeId: req.params.chargeId }, 'Failed to waive fee');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to waive fee',
    });
  }
});

/**
 * POST /api/v1/payment/admin/settlement/generate
 * Generate commission settlement (admin)
 */
router.post('/admin/settlement/generate', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { franchiseId, franchiseType, periodStart, periodEnd } = req.body;

    if (!franchiseId || !franchiseType || !periodStart || !periodEnd) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const settlement = await commissionService.generateSettlement(
      franchiseId,
      franchiseType,
      new Date(periodStart),
      new Date(periodEnd)
    );

    res.json({
      success: true,
      message: 'Settlement generated successfully',
      data: settlement,
    });
  } catch (error: any) {
    log.error({ error }, 'Failed to generate settlement');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate settlement',
    });
  }
});

/**
 * GET /api/v1/payment/admin/settlement/:settlementId/csv
 * Download settlement payout CSV (admin)
 */
router.get('/admin/settlement/:settlementId/csv', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { settlementId } = req.params;
    const csv = await commissionService.generatePayoutCSV(settlementId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=settlement-${settlementId}.csv`);
    res.send(csv);
  } catch (error: any) {
    log.error({ error, settlementId: req.params.settlementId }, 'Failed to generate CSV');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate payout CSV',
    });
  }
});

/**
 * GET /api/v1/payment/admin/gateway/stats
 * Get payment gateway statistics (admin)
 */
router.get('/admin/gateway/stats', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const stats = await gatewayMock.getGatewayStats(hours);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    log.error({ error }, 'Failed to get gateway stats');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve gateway statistics',
    });
  }
});

export default router;

