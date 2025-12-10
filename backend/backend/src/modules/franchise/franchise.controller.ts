/**
 * Franchise Controller
 * Handles franchise endpoints
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import * as franchiseService from './franchise.service';

export class FranchiseController {
  /**
   * Get franchise dashboard
   */
  async getDashboard(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }
      const franchiseId = user.franchiseId || user.id; // Assuming franchise ID is in user context
      const franchiseType = user.franchiseType || 'UNIT';

      const dashboard = await franchiseService.getDashboard(franchiseId, franchiseType);
      return reply.code(200).send(dashboard);
    } catch (error: any) {
      return reply.code(404).send({
        code: 'NOT_FOUND',
        message: error.message || 'Franchise not found',
      });
    }
  }

  /**
   * Get franchise targets
   */
  async getTargets(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }
      const query = req.query as any;
      const franchiseId = query?.franchiseId || user.franchiseId || user.id;

      const targets = await franchiseService.getTargets(franchiseId);
      return reply.code(200).send(targets);
    } catch (error: any) {
      return reply.code(404).send({
        code: 'NOT_FOUND',
        message: error.message || 'Franchise not found',
      });
    }
  }

  /**
   * Set franchise targets
   */
  async setTargets(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }
      const { franchiseId, targets } = req.body as { franchiseId: string; targets: any };

      await franchiseService.setTargets(
        franchiseId,
        targets,
        user.franchiseId || user.id
      );

      return reply.code(200).send({
        message: 'Targets updated successfully',
      });
    } catch (error: any) {
      return reply.code(403).send({
        code: 'FORBIDDEN',
        message: error.message || 'Failed to set targets',
      });
    }
  }

  /**
   * Get franchise reports
   */
  async getReports(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }
      const query = req.query as any;
      const franchiseId = query?.franchiseId || user.franchiseId || user.id;
      const { startDate, endDate } = query;

      const reports = await franchiseService.getReports(franchiseId, {
        startDate,
        endDate,
      });

      return reply.code(200).send(reports);
    } catch (error: any) {
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to generate reports',
      });
    }
  }
}

