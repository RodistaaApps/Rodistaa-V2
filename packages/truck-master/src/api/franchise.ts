/**
 * Franchise API Endpoints
 * Photo verification and task management
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getFranchiseTasks, completeFranchiseTask } from '../services/franchiseService';
import { logAudit } from '../services/auditService';

interface VerifyTruckRequest {
  Params: { truckId: string };
  Body: {
    verified: boolean;
    photos_urls: string[];
    notes: string;
  };
}

interface GetTasksRequest {
  Params: { franchiseId: string };
  Querystring: {
    status?: string;
    limit?: number;
    offset?: number;
  };
}

/**
 * POST /api/franchise/verify/:truckId
 * Franchise uploads photos and marks verification result
 */
export async function verifyTruck(
  request: FastifyRequest<VerifyTruckRequest>,
  reply: FastifyReply
) {
  const { truckId } = request.params;
  const { verified, photos_urls, notes } = request.body;
  const franchiseId = (request.user as any)?.franchise_id || (request.user as any)?.id;

  if (!franchiseId) {
    return reply.status(401).send({
      error: 'Franchise ID required',
    });
  }

  try {
    // Find task for this truck and franchise
    const tasksResult = await getFranchiseTasks(franchiseId, {
      status: 'PENDING',
      limit: 100,
    });

    const task = tasksResult.tasks.find(t => t.truck_id === parseInt(truckId));

    if (!task) {
      return reply.status(404).send({
        error: 'Photo verification task not found',
      });
    }

    // Complete task
    await completeFranchiseTask(task.id, franchiseId, {
      verified,
      photos_urls,
      notes,
    });

    // Log audit
    await logAudit({
      rc_number: '', // Will be fetched from truck
      event_type: 'FRANCHISE_PHOTO_VERIFICATION',
      decision: {
        truck_id: parseInt(truckId),
        verified,
        franchise_id: franchiseId,
      },
    });

    return reply.send({
      success: true,
      message: verified ? 'Truck verified successfully' : 'Verification failed - ticket created',
    });
  } catch (error: any) {
    console.error('Error verifying truck:', error);
    return reply.status(500).send({
      error: 'Failed to verify truck',
      message: error.message,
    });
  }
}

/**
 * GET /api/franchise/:franchiseId/tasks
 * List franchise tasks
 */
export async function getTasks(
  request: FastifyRequest<GetTasksRequest>,
  reply: FastifyReply
) {
  const { franchiseId } = request.params;
  const { status, limit = 50, offset = 0 } = request.query;

  try {
    const result = await getFranchiseTasks(franchiseId, {
      status,
      limit,
      offset,
    });

    return reply.send(result);
  } catch (error: any) {
    console.error('Error getting franchise tasks:', error);
    return reply.status(500).send({
      error: 'Failed to get tasks',
      message: error.message,
    });
  }
}

/**
 * Register franchise routes
 */
export function registerFranchiseRoutes(fastify: FastifyInstance) {
  fastify.post<VerifyTruckRequest>(
    '/api/franchise/verify/:truckId',
    { preHandler: [fastify.authenticate] },
    verifyTruck
  );

  fastify.get<GetTasksRequest>(
    '/api/franchise/:franchiseId/tasks',
    { preHandler: [fastify.authenticate] },
    getTasks
  );
}

