/**
 * Admin Controller
 * Handles admin endpoints
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import * as adminService from './admin.service';
import * as kycService from '../kyc/kyc.service';

export class AdminController {
  /**
   * Get dashboard KPIs
   */
  async getDashboard(req: FastifyRequest, reply: FastifyReply) {
    try {
      const dashboard = await adminService.getDashboard();
      return reply.code(200).send(dashboard);
    } catch (error: any) {
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to load dashboard',
      });
    }
  }

  /**
   * Get override requests
   */
  async getOverrides(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { status, entityType, limit, offset } = req.query as any;
      
      const overrides = await adminService.getOverrideRequests({
        status,
        entityType,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });

      return reply.code(200).send({
        overrides,
        total: overrides.length,
      });
    } catch (error: any) {
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to load override requests',
      });
    }
  }

  /**
   * Approve override
   */
  async approveOverride(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user;
      const { overrideId } = req.params as { overrideId: string };
      const { notes } = req.body as { notes?: string };

      await adminService.approveOverride(overrideId, user.id, notes);

      return reply.code(200).send({
        message: 'Override approved successfully',
      });
    } catch (error: any) {
      return reply.code(400).send({
        code: 'OPERATION_FAILED',
        message: error.message || 'Failed to approve override',
      });
    }
  }

  /**
   * Reject override
   */
  async rejectOverride(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user;
      const { overrideId } = req.params as { overrideId: string };
      const { reason } = req.body as { reason: string };

      if (!reason) {
        return reply.code(400).send({
          code: 'MISSING_FIELDS',
          message: 'Rejection reason is required',
        });
      }

      await adminService.rejectOverride(overrideId, user.id, reason);

      return reply.code(200).send({
        message: 'Override rejected successfully',
      });
    } catch (error: any) {
      return reply.code(400).send({
        code: 'OPERATION_FAILED',
        message: error.message || 'Failed to reject override',
      });
    }
  }

  /**
   * Get audit log
   */
  async getAudit(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { entityType, entityId, limit, offset } = req.query as any;

      const auditLog = await adminService.getAuditLog({
        entityType,
        entityId,
        limit: limit ? parseInt(limit) : 100,
        offset: offset ? parseInt(offset) : 0,
      });

      return reply.code(200).send({
        logs: auditLog,
        total: auditLog.length,
      });
    } catch (error: any) {
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to load audit log',
      });
    }
  }

  /**
   * Decrypt KYC (delegates to KYC service)
   */
  async decryptKyc(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user;
      const { kycId } = req.params as { kycId: string };

      const decrypted = await kycService.decryptKycRecord(kycId, user.id);

      return reply.code(200).send(decrypted);
    } catch (error: any) {
      if (error.message === 'KYC record not found') {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to decrypt KYC',
      });
    }
  }
}

