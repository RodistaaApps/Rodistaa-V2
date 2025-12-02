/**
 * ACS Controller
 * Handles ACS (Anti-Corruption Shield) endpoints
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { evaluateAcsRules } from '../acs-adapter';
import { query } from '../../db/connection';

export class AcsController {
  /**
   * Evaluate event against ACS rules
   */
  async evaluate(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { event, context, systemConfig } = req.body as any;

      if (!event || !context) {
        return reply.code(400).send({
          code: 'MISSING_FIELDS',
          message: 'Event and context are required',
        });
      }

      const matches = await evaluateAcsRules(event, context, systemConfig || {});

      return reply.code(200).send({
        matches: matches.map((m: any) => ({
          ruleId: m.ruleId,
          severity: m.rule?.severity,
          matched: true,
          actionResults: m.actionResults,
        })),
        totalMatches: matches.length,
      });
    } catch (error: any) {
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: error.message || 'ACS evaluation failed',
      });
    }
  }

  /**
   * Get audit trail for entity
   */
  async getAudit(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { entityType, entityId } = req.params as { entityType: string; entityId: string };

      const result = await query(
        `SELECT * FROM audit_logs 
         WHERE entity_type = $1 AND entity_id = $2
         ORDER BY created_at DESC
         LIMIT 100`,
        [entityType, entityId]
      );

      return reply.code(200).send({
        entityType,
        entityId,
        auditTrail: result.rows,
        total: result.rows.length,
      });
    } catch (error: any) {
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve audit trail',
      });
    }
  }

  /**
   * Check block status for entity
   */
  async getBlocks(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { entityType, entityId } = req.params as { entityType: string; entityId: string };

      const result = await query(
        `SELECT * FROM acs_blocks 
         WHERE entity_type = $1 AND entity_id = $2 AND status = 'ACTIVE'
         ORDER BY created_at DESC`,
        [entityType, entityId]
      );

      return reply.code(200).send({
        entityType,
        entityId,
        blocks: result.rows,
        isBlocked: result.rows.length > 0,
      });
    } catch (error: any) {
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to check block status',
      });
    }
  }
}

