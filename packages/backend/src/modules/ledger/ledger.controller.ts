/**
 * Ledger Controller
 * Handles ledger endpoints
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import * as ledgerService from './ledger.service';
import logger from 'pino';

const log = logger({ name: 'ledger-controller' });

export class LedgerController {
  /**
   * Get operator balance
   */
  async getBalance(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }
      const { operatorId } = req.params as { operatorId: string };

      // Verify access (operator can only see their own balance, admin can see any)
      if (user.role !== 'ADMIN' && user.role !== 'AD' && user.id !== operatorId) {
        return reply.code(403).send({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      const balance = await ledgerService.getOperatorBalance(operatorId);

      return reply.code(200).send({
        operatorId,
        balance,
        currency: 'INR',
      });
    } catch (error: any) {
      log.error({ error }, 'Failed to get balance');
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve balance',
      });
    }
  }

  /**
   * Get ledger entries
   */
  async getLedgerEntries(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }
      const { operatorId } = req.params as { operatorId: string };
      const query = req.query as any;

      // Verify access
      if (user.role !== 'ADMIN' && user.role !== 'AD' && user.id !== operatorId) {
        return reply.code(403).send({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      const filters: any = {
        operatorId,
        page: parseInt(query.page || '1', 10),
        limit: parseInt(query.limit || '20', 10),
      };

      if (query.type) {
        filters.type = query.type;
      }

      const result = await ledgerService.getLedgerEntries(filters);

      return reply.code(200).send({
        data: result.data,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error: any) {
      log.error({ error }, 'Failed to get ledger entries');
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve ledger entries',
      });
    }
  }
}

