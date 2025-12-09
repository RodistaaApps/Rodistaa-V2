/**
 * Truck Onboarding API Endpoints
 * Handles truck creation with dimensions, flagging, and verification workflows
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query, transaction } from '../db';
import { validateTruckInput, computeFlags } from '../services/truckValidator';
import { encrypt, hashChassisOrEngine } from '../utils/hashUtil';
import { TruckCreateDTO, TruckRecord, FlagRecord } from '../models/truckDimensions';
import { logAudit } from '../services/auditService';
import { assignPhotoVerificationTask } from '../services/franchiseService';
import { createTicket } from '../services/ticketing';

interface CreateTruckRequest {
  Params: { operatorId: string };
  Body: {
    rc_number: string;
    tyre_count: number;
    body_length_ft: number;
    body_type: string;
    payload_kg?: number;
    axle_count?: number;
    nickname?: string;
    rc_copy: string; // Base64 encoded file
  };
}

interface GetTruckRequest {
  Params: { truckId: string };
}

interface ListTrucksRequest {
  Params: { operatorId: string };
  Querystring: {
    status?: string;
    compliance_status?: string;
    limit?: number;
    offset?: number;
  };
}

interface AssignPhotoCheckRequest {
  Params: { truckId: string };
  Body: {
    franchise_id: string;
  };
}

/**
 * POST /api/operator/:operatorId/trucks
 * Create truck with mandatory dimensions
 */
export async function createTruck(
  request: FastifyRequest<CreateTruckRequest>,
  reply: FastifyReply
) {
  const { operatorId } = request.params;
  const body = request.body;

  try {
    // Validate input
    const dto: TruckCreateDTO = {
      operator_id: operatorId,
      rc_number: body.rc_number.toUpperCase().trim(),
      tyre_count: body.tyre_count as any,
      body_length_ft: body.body_length_ft,
      body_type: body.body_type.toUpperCase() as any,
      payload_kg: body.payload_kg,
      axle_count: body.axle_count,
      rc_copy: Buffer.from(body.rc_copy, 'base64'),
    };

    const validation = validateTruckInput(dto);
    if (!validation.valid) {
      return reply.status(400).send({
        error: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Compute flags (without VAHAN data initially)
    const flags = await computeFlags(dto);

    // Check for duplicate RC number
    const existingTruck = await query(
      `SELECT id FROM operator_trucks WHERE operator_id = $1 AND rc_number = $2`,
      [operatorId, dto.rc_number]
    );

    if (existingTruck.rows.length > 0) {
      return reply.status(409).send({
        error: 'Truck with this RC number already exists',
      });
    }

    // Create truck in transaction
    const truckId = await transaction(async (client) => {
      // Encrypt RC copy
      const encryptedRcCopy = encrypt(dto.rc_copy);

      // Hash chassis and engine (will be updated after VAHAN fetch)
      // For now, use placeholder - will be updated in batch worker
      const chassisHash = 'pending'; // Will be updated from VAHAN
      const engineHash = 'pending'; // Will be updated from VAHAN

      // Check for duplicate chassis/engine (if provided separately in future)
      // For now, this is handled in batch worker after VAHAN fetch

      // Insert truck
      const result = await client.query<{ id: number }>(
        `INSERT INTO operator_trucks
         (operator_id, rc_number, nickname, tyre_count, body_length_ft, body_type,
          payload_kg, axle_count, rc_copy_bytea, chassis_hash, engine_hash,
          flags, flags_history, compliance_status, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING id`,
        [
          dto.operator_id,
          dto.rc_number,
          body.nickname || null,
          dto.tyre_count,
          dto.body_length_ft,
          dto.body_type,
          dto.payload_kg || null,
          dto.axle_count || null,
          encryptedRcCopy,
          chassisHash,
          engineHash,
          JSON.stringify(flags),
          JSON.stringify(flags),
          'PENDING',
          'PENDING_VERIFICATION',
        ]
      );

      const newTruckId = result.rows[0].id;

      // Log audit entry
      await logAudit({
        rc_number: dto.rc_number,
        operator_id: operatorId,
        event_type: 'TRUCK_CREATED',
        decision: {
          truck_id: newTruckId,
          flags: flags.map(f => f.flag_code),
        },
      }, client);

      // Create franchise task if photo verification required
      if (flags.some(f => f.flag_code === 'REQUIRES_PHOTO_VERIFICATION')) {
        try {
          await assignPhotoVerificationTask(newTruckId, operatorId, client);
        } catch (error) {
          console.warn('Failed to assign photo verification task:', error);
          // Don't fail truck creation if task assignment fails
        }
      }

      return newTruckId;
    });

    // Return created truck with flags
    return reply.status(201).send({
      id: truckId,
      rc_number: dto.rc_number,
      status: 'PENDING_VERIFICATION',
      flags: flags.map(f => ({
        code: f.flag_code,
        severity: f.meta.severity || 'LOW',
        reason: f.meta.reason,
      })),
      message: 'Truck created successfully. Pending VAHAN verification.',
    });
  } catch (error: any) {
    console.error('Error creating truck:', error);
    return reply.status(500).send({
      error: 'Failed to create truck',
      message: error.message,
    });
  }
}

/**
 * GET /api/operator/:operatorId/trucks
 * List trucks with filters
 */
export async function listTrucks(
  request: FastifyRequest<ListTrucksRequest>,
  reply: FastifyReply
) {
  const { operatorId } = request.params;
  const { status, compliance_status, limit = 50, offset = 0 } = request.query;

  try {
    const conditions: string[] = ['operator_id = $1'];
    const params: any[] = [operatorId];
    let paramIndex = 2;

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (compliance_status) {
      conditions.push(`compliance_status = $${paramIndex++}`);
      params.push(compliance_status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM operator_trucks ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Get trucks
    params.push(limit, offset);
    const result = await query<TruckRecord>(
      `SELECT id, operator_id, rc_number, nickname, tyre_count, body_length_ft,
              body_type, payload_kg, axle_count, flags, compliance_status,
              last_verified_at, created_at, updated_at
       FROM operator_trucks
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      params
    );

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
    console.error('Error listing trucks:', error);
    return reply.status(500).send({
      error: 'Failed to list trucks',
      message: error.message,
    });
  }
}

/**
 * GET /api/trucks/:truckId
 * Get truck details with flags history and snapshots
 */
export async function getTruck(
  request: FastifyRequest<GetTruckRequest>,
  reply: FastifyReply
) {
  const { truckId } = request.params;

  try {
    const result = await query<{
      id: number;
      operator_id: string;
      rc_number: string;
      nickname?: string;
      tyre_count: number;
      body_length_ft: number;
      body_type: string;
      payload_kg?: number;
      axle_count?: number;
      vahan_snapshot: any;
      flags: FlagRecord[];
      flags_history: FlagRecord[];
      compliance_status: string;
      last_verified_at?: Date;
      created_at: Date;
      updated_at: Date;
    }>(
      `SELECT id, operator_id, rc_number, nickname, tyre_count, body_length_ft,
              body_type, payload_kg, axle_count, vahan_snapshot, flags,
              flags_history, compliance_status, last_verified_at,
              created_at, updated_at
       FROM operator_trucks
       WHERE id = $1`,
      [truckId]
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({
        error: 'Truck not found',
      });
    }

    const truck = result.rows[0];

    // Get flags history from separate table
    const flagsHistoryResult = await query(
      `SELECT flag_code, meta, created_at, resolved_by, resolved_at
       FROM operator_truck_flags
       WHERE truck_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [truckId]
    );

    // Get franchise tasks
    const tasksResult = await query(
      `SELECT id, task_type, status, payload, created_at, due_at, completed_at, result
       FROM franchise_tasks
       WHERE truck_id = $1
       ORDER BY created_at DESC`,
      [truckId]
    );

    // Get admin tickets
    const ticketsResult = await query(
      `SELECT id, reason_code, severity, status, created_at, resolved_at
       FROM admin_tickets
       WHERE truck_id = $1
       ORDER BY created_at DESC`,
      [truckId]
    );

    return reply.send({
      truck: {
        ...truck,
        flags: typeof truck.flags === 'string' ? JSON.parse(truck.flags) : truck.flags,
        flags_history: typeof truck.flags_history === 'string' 
          ? JSON.parse(truck.flags_history) 
          : truck.flags_history,
        vahan_snapshot: typeof truck.vahan_snapshot === 'string'
          ? JSON.parse(truck.vahan_snapshot)
          : truck.vahan_snapshot,
      },
      flags_history: flagsHistoryResult.rows,
      tasks: tasksResult.rows.map(t => ({
        ...t,
        payload: typeof t.payload === 'string' ? JSON.parse(t.payload) : t.payload,
        result: t.result ? (typeof t.result === 'string' ? JSON.parse(t.result) : t.result) : undefined,
      })),
      tickets: ticketsResult.rows.map(t => ({
        ...t,
        notes: typeof t.notes === 'string' ? JSON.parse(t.notes) : t.notes,
      })),
    });
  } catch (error: any) {
    console.error('Error getting truck:', error);
    return reply.status(500).send({
      error: 'Failed to get truck',
      message: error.message,
    });
  }
}

/**
 * POST /api/trucks/:truckId/assign-photo-check
 * Admin/franchise assign photo verification task
 */
export async function assignPhotoCheck(
  request: FastifyRequest<AssignPhotoCheckRequest>,
  reply: FastifyReply
) {
  const { truckId } = request.params;
  const { franchise_id } = request.body;

  try {
    // Verify truck exists
    const truckResult = await query(
      `SELECT operator_id FROM operator_trucks WHERE id = $1`,
      [truckId]
    );

    if (truckResult.rows.length === 0) {
      return reply.status(404).send({
        error: 'Truck not found',
      });
    }

    const operatorId = truckResult.rows[0].operator_id;

    // Assign task
    const taskId = await assignPhotoVerificationTask(parseInt(truckId), operatorId);

    return reply.status(201).send({
      task_id: taskId,
      message: 'Photo verification task assigned',
    });
  } catch (error: any) {
    console.error('Error assigning photo check:', error);
    return reply.status(500).send({
      error: 'Failed to assign photo check',
      message: error.message,
    });
  }
}

/**
 * Register truck routes
 */
export function registerTruckRoutes(fastify: FastifyInstance) {
  fastify.post<CreateTruckRequest>(
    '/api/operator/:operatorId/trucks',
    { preHandler: [fastify.authenticate] },
    createTruck
  );

  fastify.get<ListTrucksRequest>(
    '/api/operator/:operatorId/trucks',
    { preHandler: [fastify.authenticate] },
    listTrucks
  );

  fastify.get<GetTruckRequest>(
    '/api/trucks/:truckId',
    { preHandler: [fastify.authenticate] },
    getTruck
  );

  fastify.post<AssignPhotoCheckRequest>(
    '/api/trucks/:truckId/assign-photo-check',
    { preHandler: [fastify.authenticate] },
    assignPhotoCheck
  );
}

