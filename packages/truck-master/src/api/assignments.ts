/**
 * Assignment API Endpoints
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  createAssignment,
  getTruckAssignment,
  getDriverAssignments,
  endAssignment,
} from '../services/assignmentService';
import { AssignmentCreateDTO } from '../models/driver';

interface CreateAssignmentRequest {
  Params: { truckId: string };
  Body: AssignmentCreateDTO;
}

interface GetAssignmentRequest {
  Params: { truckId: string };
}

interface EndAssignmentRequest {
  Params: { truckId: string };
  Body: {
    reason?: string;
  };
}

interface GetDriverAssignmentsRequest {
  Params: { driverId: string };
  Querystring: {
    active_only?: boolean;
  };
}

/**
 * POST /api/trucks/:truckId/assign
 */
export async function createAssignmentHandler(
  request: FastifyRequest<CreateAssignmentRequest>,
  reply: FastifyReply
) {
  const { truckId } = request.params;
  const body = request.body;
  const user = request.user as any;
  const userId = user?.id || 'system';
  const userRole = user?.role || 'OPERATOR';

  try {
    const dto: AssignmentCreateDTO = {
      ...body,
      truck_id: parseInt(truckId),
      start_at: new Date(body.start_at),
      end_at: body.end_at ? new Date(body.end_at) : undefined,
    };

    const result = await createAssignment(dto, userId, userRole as any);
    
    return reply.status(201).send(result);
  } catch (error: any) {
    return reply.status(400).send({
      error: error.message || 'Failed to create assignment',
    });
  }
}

/**
 * GET /api/trucks/:truckId/assignment
 */
export async function getAssignmentHandler(
  request: FastifyRequest<GetAssignmentRequest>,
  reply: FastifyReply
) {
  const { truckId } = request.params;

  try {
    const assignment = await getTruckAssignment(parseInt(truckId));
    
    if (!assignment) {
      return reply.status(404).send({
        error: 'No active assignment found',
      });
    }

    return reply.send({ assignment });
  } catch (error: any) {
    return reply.status(500).send({
      error: error.message || 'Failed to get assignment',
    });
  }
}

/**
 * POST /api/trucks/:truckId/unassign
 */
export async function endAssignmentHandler(
  request: FastifyRequest<EndAssignmentRequest>,
  reply: FastifyReply
) {
  const { truckId } = request.params;
  const { reason } = request.body;
  const userId = (request.user as any)?.id || 'system';

  try {
    await endAssignment(parseInt(truckId), userId, reason);
    
    return reply.send({ success: true });
  } catch (error: any) {
    return reply.status(400).send({
      error: error.message || 'Failed to end assignment',
    });
  }
}

/**
 * GET /api/drivers/:driverId/assignments
 */
export async function getDriverAssignmentsHandler(
  request: FastifyRequest<GetDriverAssignmentsRequest>,
  reply: FastifyReply
) {
  const { driverId } = request.params;
  const { active_only } = request.query;

  try {
    const assignments = await getDriverAssignments(driverId, active_only === true);
    
    return reply.send({ assignments });
  } catch (error: any) {
    return reply.status(500).send({
      error: error.message || 'Failed to get assignments',
    });
  }
}

/**
 * Register assignment routes
 */
export function registerAssignmentRoutes(fastify: FastifyInstance) {
  fastify.post<CreateAssignmentRequest>(
    '/api/trucks/:truckId/assign',
    { preHandler: [fastify.authenticate] },
    createAssignmentHandler
  );

  fastify.get<GetAssignmentRequest>(
    '/api/trucks/:truckId/assignment',
    { preHandler: [fastify.authenticate] },
    getAssignmentHandler
  );

  fastify.post<EndAssignmentRequest>(
    '/api/trucks/:truckId/unassign',
    { preHandler: [fastify.authenticate] },
    endAssignmentHandler
  );

  fastify.get<GetDriverAssignmentsRequest>(
    '/api/drivers/:driverId/assignments',
    { preHandler: [fastify.authenticate] },
    getDriverAssignmentsHandler
  );
}

