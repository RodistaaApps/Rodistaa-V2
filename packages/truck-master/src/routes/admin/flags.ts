/**
 * Admin Flag Management Endpoints
 * View flags, reassign, override, and manually verify trucks
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query, transaction } from '../../db';
import { listTickets, updateTicketStatus } from '../../services/ticketing';
import { logAdminAction } from '../../services/auditService';
import { assignPhotoVerificationTask } from '../../services/franchiseService';

interface FlagDashboardRequest {
  Querystring: {
    flag_code?: string;
    compliance_status?: string;
    region?: string;
    state?: string;
    limit?: number;
    offset?: number;
  };
}

interface OverrideFlagRequest {
  Params: { truckId: string };
  Body: {
    action: 'VERIFY_MANUALLY' | 'BLOCK' | 'UNBLOCK' | 'REASSIGN_FRANCHISE';
    reason: string;
    franchise_id?: string;
  };
}

/**
 * GET /api/admin/flags/dashboard
 * List trucks by flag type with filters
 */
export async function getFlagDashboard(
  request: FastifyRequest<FlagDashboardRequest>,
  reply: FastifyReply
) {
  const { flag_code, compliance_status, region, state, limit = 50, offset = 0 } = request.query;
  const adminId = (request.user as any)?.id;

  try {
    let sql = `
      SELECT DISTINCT ot.id, ot.operator_id, ot.rc_number, ot.tyre_count, 
             ot.body_length_ft, ot.body_type, ot.flags, ot.compliance_status,
             ot.last_verified_at, ot.created_at
      FROM operator_trucks ot
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Filter by flag code
    if (flag_code) {
      sql += ` AND ot.flags::jsonb @> '[{"flag_code": $' + paramIndex + '}]'::jsonb`;
      params.push(flag_code);
      paramIndex++;
    }

    // Filter by compliance status
    if (compliance_status) {
      sql += ` AND ot.compliance_status = $${paramIndex++}`;
      params.push(compliance_status);
    }

    // Filter by region/state (if operators table has location info)
    if (state) {
      sql += ` AND EXISTS (
        SELECT 1 FROM operators o 
        WHERE o.id = ot.operator_id AND o.state = $${paramIndex}
      )`;
      params.push(state);
      paramIndex++;
    }

    sql += ` ORDER BY ot.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Get total count
    const countSql = sql.replace(/SELECT DISTINCT ot\.id.*?FROM/, 'SELECT COUNT(DISTINCT ot.id) as count FROM')
      .replace(/ORDER BY.*$/, '');
    const countResult = await query<{ count: string }>(countSql, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count, 10);

    const trucks = result.rows.map(truck => ({
      ...truck,
      flags: typeof truck.flags === 'string' ? JSON.parse(truck.flags) : truck.flags,
    }));

    return reply.send({
      trucks,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Error getting flag dashboard:', error);
    return reply.status(500).send({
      error: 'Failed to get flag dashboard',
      message: error.message,
    });
  }
}

/**
 * POST /api/admin/trucks/:truckId/override
 * Admin override action (verify manually, block, unblock, reassign)
 */
export async function overrideTruck(
  request: FastifyRequest<OverrideFlagRequest>,
  reply: FastifyReply
) {
  const { truckId } = request.params;
  const { action, reason, franchise_id } = request.body;
  const adminId = (request.user as any)?.id;

  if (!adminId) {
    return reply.status(401).send({
      error: 'Admin authentication required',
    });
  }

  if (!reason || reason.trim().length === 0) {
    return reply.status(400).send({
      error: 'Reason is required for override actions',
    });
  }

  try {
    await transaction(async (client) => {
      // Get truck details
      const truckResult = await client.query(
        `SELECT id, operator_id, rc_number, compliance_status FROM operator_trucks WHERE id = $1`,
        [truckId]
      );

      if (truckResult.rows.length === 0) {
        throw new Error('Truck not found');
      }

      const truck = truckResult.rows[0];

      // Perform action
      switch (action) {
        case 'VERIFY_MANUALLY':
          await client.query(
            `UPDATE operator_trucks
             SET compliance_status = 'ACTIVE',
                 flags = '[]'::jsonb,
                 last_verified_at = NOW()
             WHERE id = $1`,
            [truckId]
          );
          break;

        case 'BLOCK':
          await client.query(
            `UPDATE operator_trucks
             SET compliance_status = 'BLOCKED'
             WHERE id = $1`,
            [truckId]
          );
          break;

        case 'UNBLOCK':
          await client.query(
            `UPDATE operator_trucks
             SET compliance_status = 'ACTIVE'
             WHERE id = $1`,
            [truckId]
          );
          break;

        case 'REASSIGN_FRANCHISE':
          if (!franchise_id) {
            throw new Error('franchise_id required for reassignment');
          }
          await assignPhotoVerificationTask(parseInt(truckId), truck.operator_id, client);
          break;
      }

      // Log admin action
      await logAdminAction(
        adminId,
        `TRUCK_${action}`,
        'truck',
        truck.rc_number,
        {
          truck_id: parseInt(truckId),
          action,
          reason,
          franchise_id: franchise_id || null,
        }
      );
    });

    return reply.send({
      success: true,
      message: `Truck ${action} completed`,
    });
  } catch (error: any) {
    console.error('Error overriding truck:', error);
    return reply.status(500).send({
      error: 'Failed to override truck',
      message: error.message,
    });
  }
}

/**
 * Register admin routes
 */
export function registerAdminRoutes(fastify: FastifyInstance) {
  fastify.get<FlagDashboardRequest>(
    '/api/admin/flags/dashboard',
    { preHandler: [fastify.authenticate] },
    getFlagDashboard
  );

  fastify.post<OverrideFlagRequest>(
    '/api/admin/trucks/:truckId/override',
    { preHandler: [fastify.authenticate] },
    overrideTruck
  );

  // Ticket routes
  fastify.get(
    '/api/admin/tickets',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<any>, reply: FastifyReply) => {
      const filters = request.query as any;
      const result = await listTickets(filters);
      return reply.send(result);
    }
  );

  fastify.patch(
    '/api/admin/tickets/:ticketId',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<any>, reply: FastifyReply) => {
      const { ticketId } = request.params;
      const { status } = request.body as any;
      const adminId = (request.user as any)?.id;

      await updateTicketStatus(parseInt(ticketId), status, adminId);
      return reply.send({ success: true });
    }
  );
}

