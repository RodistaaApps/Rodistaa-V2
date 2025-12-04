/**
 * Truck Master API Routes
 * REST endpoints for truck management
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query, transaction } from '../db';
import { hashRCCopy, encryptRCCopy } from '../services/hashUtil';
import { checkCompliance } from '../services/complianceEngine';
import { VahanClient } from '../services/vahanClient';
import { createTicket } from '../services/ticketing';
import type { CreateTruckRequest } from '../models/truck';

interface CreateTruckParams {
  operatorId: string;
}

interface GetTruckParams {
  rc: string;
}

interface RaiseTicketParams {
  rc: string;
}

/**
 * Register truck master routes
 */
export async function registerTruckMasterRoutes(fastify: FastifyInstance) {
  // Create truck record
  fastify.post<{ Params: CreateTruckParams; Body: CreateTruckRequest }>(
    '/api/operator/:operatorId/trucks',
    async (request: FastifyRequest<{ Params: CreateTruckParams; Body: CreateTruckRequest }>, reply: FastifyReply) => {
      const { operatorId } = request.params;
      const { rc_number, nickname, rc_copy, is_tractor, is_trailer, legal_authorization_accepted, authorization_declaration } = request.body;

      // Check operator truck limit
      const limitCheck = await query(
        `SELECT COUNT(*) as count FROM operator_trucks WHERE operator_id = $1 AND status = 'ACTIVE'`,
        [operatorId]
      );

      const currentCount = parseInt(limitCheck.rows[0].count, 10);
      if (currentCount >= 10) {
        return reply.status(400).send({
          error: 'OPERATOR_LIMIT_EXCEEDED',
          message: `Operator has reached maximum truck limit (10)`,
        });
      }

      // Validate RC format (basic)
      if (!rc_number || rc_number.length < 10) {
        return reply.status(400).send({
          error: 'INVALID_RC_FORMAT',
          message: 'RC number must be at least 10 characters',
        });
      }

      // Encrypt RC copy if provided
      let rc_copy_encrypted: string | null = null;
      let rc_copy_hash: string | null = null;
      if (rc_copy) {
        const buffer = Buffer.from(rc_copy, 'base64');
        rc_copy_encrypted = encryptRCCopy(buffer);
        rc_copy_hash = hashRCCopy(buffer);
      }

      // Create truck record
      const result = await query(
        `INSERT INTO operator_trucks (
          operator_id, rc_number, nickname, rc_copy_encrypted, rc_copy_hash,
          status, is_tractor, is_trailer, legal_authorization_accepted,
          authorization_declaration, onboarded_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          operatorId,
          rc_number,
          nickname || null,
          rc_copy_encrypted,
          rc_copy_hash,
          'PENDING_VERIFICATION',
          is_tractor || false,
          is_trailer || false,
          legal_authorization_accepted || false,
          authorization_declaration || null,
          (request as any).user?.id || null,
        ]
      );

      return reply.status(201).send({
        success: true,
        truck: result.rows[0],
        message: 'Truck onboarded successfully. Verification will be completed within 24 hours.',
      });
    }
  );

  // List operator trucks
  fastify.get<{ Params: CreateTruckParams }>(
    '/api/operator/:operatorId/trucks',
    async (request: FastifyRequest<{ Params: CreateTruckParams }>, reply: FastifyReply) => {
      const { operatorId } = request.params;

      const result = await query(
        `SELECT 
          ot.*,
          vcc.allow as compliance_allow,
          vcc.reasons as compliance_reasons,
          vcc.last_verified_at as compliance_last_verified_at,
          vi.inferred_body_type,
          vi.confidence_score as inference_confidence
        FROM operator_trucks ot
        LEFT JOIN vehicle_compliance_cache vcc ON ot.rc_number = vcc.rc_number AND ot.operator_id = vcc.operator_id
        LEFT JOIN vehicle_inference vi ON ot.rc_number = vi.rc_number
        WHERE ot.operator_id = $1
        ORDER BY ot.onboarded_at DESC`,
        [operatorId]
      );

      return reply.send({
        success: true,
        trucks: result.rows,
      });
    }
  );

  // Get truck master detail
  fastify.get<{ Params: GetTruckParams }>(
    '/api/trucks/:rc',
    async (request: FastifyRequest<{ Params: GetTruckParams }>, reply: FastifyReply) => {
      const { rc } = request.params;

      // Get truck record
      const truckResult = await query(
        `SELECT * FROM operator_trucks WHERE rc_number = $1 LIMIT 1`,
        [rc]
      );

      if (truckResult.rows.length === 0) {
        return reply.status(404).send({
          error: 'TRUCK_NOT_FOUND',
          message: 'Truck not found',
        });
      }

      const truck = truckResult.rows[0];

      // Get latest snapshot
      const snapshotResult = await query(
        `SELECT * FROM vahan_vehicle_snapshot 
         WHERE rc_number = $1 
         ORDER BY verified_at DESC NULLS LAST, created_at DESC 
         LIMIT 1`,
        [rc]
      );

      // Get inference
      const inferenceResult = await query(
        `SELECT * FROM vehicle_inference WHERE rc_number = $1 LIMIT 1`,
        [rc]
      );

      // Get compliance
      const complianceResult = await query(
        `SELECT * FROM vehicle_compliance_cache 
         WHERE rc_number = $1 AND operator_id = $2 
         LIMIT 1`,
        [rc, truck.operator_id]
      );

      // Get linked tractor/trailer
      let linkedTractor = null;
      let linkedTrailer = null;
      if (truck.linked_tractor_rc) {
        const tractorResult = await query(
          `SELECT * FROM operator_trucks WHERE rc_number = $1 LIMIT 1`,
          [truck.linked_tractor_rc]
        );
        linkedTractor = tractorResult.rows[0] || null;
      }
      if (truck.linked_trailer_rc) {
        const trailerResult = await query(
          `SELECT * FROM operator_trucks WHERE rc_number = $1 LIMIT 1`,
          [truck.linked_trailer_rc]
        );
        linkedTrailer = trailerResult.rows[0] || null;
      }

      // Get tickets
      const ticketsResult = await query(
        `SELECT * FROM tickets WHERE rc_number = $1 ORDER BY created_at DESC LIMIT 10`,
        [rc]
      );

      return reply.send({
        success: true,
        truck: {
          truck,
          latest_snapshot: snapshotResult.rows[0] || null,
          inference: inferenceResult.rows[0] || null,
          compliance: complianceResult.rows[0] || null,
          linked_tractor: linkedTractor,
          linked_trailer: linkedTrailer,
          tickets: ticketsResult.rows,
        },
      });
    }
  );

  // Raise ticket
  fastify.post<{ Params: RaiseTicketParams; Body: any }>(
    '/api/trucks/:rc/raise-ticket',
    async (request: FastifyRequest<{ Params: RaiseTicketParams; Body: any }>, reply: FastifyReply) => {
      const { rc } = request.params;
      const { ticket_type, payload } = request.body;

      // Get truck
      const truckResult = await query(
        `SELECT operator_id FROM operator_trucks WHERE rc_number = $1 LIMIT 1`,
        [rc]
      );

      if (truckResult.rows.length === 0) {
        return reply.status(404).send({
          error: 'TRUCK_NOT_FOUND',
          message: 'Truck not found',
        });
      }

      const ticket = await createTicket(query, {
        ticketType: ticket_type,
        rcNumber: rc,
        operatorId: truckResult.rows[0].operator_id,
        payload,
      });

      return reply.status(201).send({
        success: true,
        ticket,
      });
    }
  );

  // Get tickets (HQ)
  fastify.get<{ Querystring: { status?: string; type?: string; limit?: number } }>(
    '/api/tickets',
    async (request: FastifyRequest<{ Querystring: { status?: string; type?: string; limit?: number } }>, reply: FastifyReply) => {
      const { status, type, limit = 100 } = request.query;

      let queryStr = `SELECT * FROM tickets WHERE 1=1`;
      const params: any[] = [];
      let paramIndex = 1;

      if (status) {
        queryStr += ` AND status = $${paramIndex++}`;
        params.push(status);
      }

      if (type) {
        queryStr += ` AND ticket_type = $${paramIndex++}`;
        params.push(type);
      }

      queryStr += ` ORDER BY created_at DESC LIMIT $${paramIndex++}`;
      params.push(limit);

      const result = await query(queryStr, params);

      return reply.send({
        success: true,
        tickets: result.rows,
      });
    }
  );
}

