/**
 * Driver API Endpoints
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  createDriver,
  getDriver,
  listDrivers,
  updateDriver,
  uploadDriverDocument,
  getDriverDocuments,
  getDriverFlags,
  getDriverAssignments,
} from '../services/driverService';
import { createAvailabilityBlock, getDriverAvailability } from '../services/availabilityService';
import { DriverCreateDTO } from '../models/driver';

interface CreateDriverRequest {
  Params: { operatorId: string };
  Body: DriverCreateDTO;
}

interface GetDriverRequest {
  Params: { driverId: string };
}

interface ListDriversRequest {
  Params: { operatorId: string };
  Querystring: {
    is_active?: boolean;
    dl_expiry_days?: number;
    limit?: number;
    offset?: number;
  };
}

interface UpdateDriverRequest {
  Params: { driverId: string };
  Body: Partial<DriverCreateDTO>;
}

interface UploadDocumentRequest {
  Params: { driverId: string };
  Body: {
    doc_type: string;
    doc_data: string; // Base64
    expiry_date?: string;
  };
}

interface AvailabilityRequest {
  Params: { driverId: string };
  Body: {
    start_at: string;
    end_at: string;
    reason: string;
    notes?: string;
  };
}

/**
 * POST /api/operators/:operatorId/drivers
 */
export async function createDriverHandler(
  request: FastifyRequest<CreateDriverRequest>,
  reply: FastifyReply
) {
  const { operatorId } = request.params;
  const body = request.body;
  const userId = (request.user as any)?.id || 'system';

  try {
    const dto: DriverCreateDTO = {
      ...body,
      operator_id: operatorId,
      dl_valid_from: new Date(body.dl_valid_from),
      dl_valid_till: new Date(body.dl_valid_till),
      dob: new Date(body.dob),
    };

    const result = await createDriver(dto, userId);
    
    return reply.status(201).send({
      driver: result.driver,
      warnings: result.warnings,
    });
  } catch (error: any) {
    return reply.status(400).send({
      error: error.message || 'Failed to create driver',
    });
  }
}

/**
 * GET /api/operators/:operatorId/drivers
 */
export async function listDriversHandler(
  request: FastifyRequest<ListDriversRequest>,
  reply: FastifyReply
) {
  const { operatorId } = request.params;
  const { is_active, dl_expiry_days, limit, offset } = request.query;

  try {
    const result = await listDrivers({
      operator_id: operatorId,
      is_active,
      dl_expiry_days,
      limit,
      offset,
    });

    return reply.send(result);
  } catch (error: any) {
    return reply.status(500).send({
      error: error.message || 'Failed to list drivers',
    });
  }
}

/**
 * GET /api/drivers/:driverId
 */
export async function getDriverHandler(
  request: FastifyRequest<GetDriverRequest>,
  reply: FastifyReply
) {
  const { driverId } = request.params;

  try {
    const driver = await getDriver(driverId);
    
    if (!driver) {
      return reply.status(404).send({
        error: 'Driver not found',
      });
    }

    const [documents, flags, assignments] = await Promise.all([
      getDriverDocuments(driverId),
      getDriverFlags(driverId),
      getDriverAssignments(driverId),
    ]);

    return reply.send({
      driver,
      documents,
      flags,
      assignments,
    });
  } catch (error: any) {
    return reply.status(500).send({
      error: error.message || 'Failed to get driver',
    });
  }
}

/**
 * PUT /api/drivers/:driverId
 */
export async function updateDriverHandler(
  request: FastifyRequest<UpdateDriverRequest>,
  reply: FastifyReply
) {
  const { driverId } = request.params;
  const body = request.body;
  const userId = (request.user as any)?.id || 'system';

  try {
    const updates: any = { ...body };
    
    if (body.dl_valid_till) {
      updates.dl_valid_till = new Date(body.dl_valid_till);
    }
    if (body.dob) {
      updates.dob = new Date(body.dob);
    }

    const driver = await updateDriver(driverId, updates, userId);
    
    return reply.send({ driver });
  } catch (error: any) {
    return reply.status(400).send({
      error: error.message || 'Failed to update driver',
    });
  }
}

/**
 * POST /api/drivers/:driverId/documents
 */
export async function uploadDocumentHandler(
  request: FastifyRequest<UploadDocumentRequest>,
  reply: FastifyReply
) {
  const { driverId } = request.params;
  const { doc_type, doc_data, expiry_date } = request.body;
  const userId = (request.user as any)?.id || 'system';

  try {
    const docBuffer = Buffer.from(doc_data, 'base64');
    const expiry = expiry_date ? new Date(expiry_date) : undefined;

    const document = await uploadDriverDocument(
      driverId,
      doc_type,
      docBuffer,
      userId,
      expiry
    );

    return reply.status(201).send({ document });
  } catch (error: any) {
    return reply.status(400).send({
      error: error.message || 'Failed to upload document',
    });
  }
}

/**
 * POST /api/drivers/:driverId/availability
 */
export async function updateAvailabilityHandler(
  request: FastifyRequest<AvailabilityRequest>,
  reply: FastifyReply
) {
  const { driverId } = request.params;
  const { start_at, end_at, reason, notes } = request.body;
  const userId = (request.user as any)?.id || 'system';

  try {
    const block = await createAvailabilityBlock(
      driverId,
      new Date(start_at),
      new Date(end_at),
      reason,
      userId,
      notes
    );

    return reply.status(201).send({ block });
  } catch (error: any) {
    return reply.status(400).send({
      error: error.message || 'Failed to create availability block',
    });
  }
}

/**
 * Register driver routes
 */
export function registerDriverRoutes(fastify: FastifyInstance) {
  fastify.post<CreateDriverRequest>(
    '/api/operators/:operatorId/drivers',
    { preHandler: [fastify.authenticate] },
    createDriverHandler
  );

  fastify.get<ListDriversRequest>(
    '/api/operators/:operatorId/drivers',
    { preHandler: [fastify.authenticate] },
    listDriversHandler
  );

  fastify.get<GetDriverRequest>(
    '/api/drivers/:driverId',
    { preHandler: [fastify.authenticate] },
    getDriverHandler
  );

  fastify.put<UpdateDriverRequest>(
    '/api/drivers/:driverId',
    { preHandler: [fastify.authenticate] },
    updateDriverHandler
  );

  fastify.post<UploadDocumentRequest>(
    '/api/drivers/:driverId/documents',
    { preHandler: [fastify.authenticate] },
    uploadDocumentHandler
  );

  fastify.post<AvailabilityRequest>(
    '/api/drivers/:driverId/availability',
    { preHandler: [fastify.authenticate] },
    updateAvailabilityHandler
  );
}

