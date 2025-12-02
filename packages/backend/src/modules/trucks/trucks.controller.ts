/**
 * Trucks Controller
 * Handles truck management endpoints
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import * as trucksService from './trucks.service';
import logger from 'pino';

const log = logger({ name: 'trucks-controller' });

export class TrucksController {
  /**
   * Create a new truck
   */
  async createTruck(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user;
      const payload = req.body as any;

      if (!payload.registrationNumber) {
        return reply.code(400).send({
          code: 'MISSING_FIELDS',
          message: 'Missing required field: registrationNumber',
        });
      }

      const truck = await trucksService.createTruck(
        user.id,
        {
          operatorId: user.id,
          registrationNumber: payload.registrationNumber,
          vehicleType: payload.vehicleType,
          capacityTons: payload.capacityTons,
          bodyType: payload.bodyType,
          tyres: payload.tyres,
        },
        {
          userRole: user.role,
          kycStatus: user.kycStatus,
        }
      );

      return reply.code(201).send(truck);
    } catch (error: any) {
      log.error({ error }, 'Failed to create truck');
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to create truck',
      });
    }
  }

  /**
   * Get truck by ID
   */
  async getTruck(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { truckId } = req.params as { truckId: string };
      const truck = await trucksService.getTruckById(truckId);

      if (!truck) {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'Truck not found',
        });
      }

      return reply.code(200).send(truck);
    } catch (error: any) {
      log.error({ error }, 'Failed to get truck');
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve truck',
      });
    }
  }

  /**
   * List trucks
   */
  async listTrucks(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user;
      const query = req.query as any;

      const filters: any = {
        page: parseInt(query.page || '1', 10),
        limit: parseInt(query.limit || '20', 10),
      };

      if (user.role === 'OPERATOR' || user.role === 'OP') {
        filters.operatorId = user.id;
      }

      if (query.status) {
        filters.status = query.status;
      }

      const result = await trucksService.listTrucks(filters);

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
      log.error({ error }, 'Failed to list trucks');
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve trucks',
      });
    }
  }

  /**
   * Block truck (admin only)
   */
  async blockTruck(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user;
      const { truckId } = req.params as { truckId: string };
      const { reason } = req.body as { reason?: string };

      if (user.role !== 'ADMIN' && user.role !== 'AD') {
        return reply.code(403).send({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      const truck = await trucksService.blockTruck(truckId, reason || 'Blocked by admin', user.id);

      return reply.code(200).send(truck);
    } catch (error: any) {
      log.error({ error }, 'Failed to block truck');

      if (error.message === 'Truck not found') {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to block truck',
      });
    }
  }

  /**
   * Unblock truck (admin only)
   */
  async unblockTruck(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user;
      const { truckId } = req.params as { truckId: string };

      if (user.role !== 'ADMIN' && user.role !== 'AD') {
        return reply.code(403).send({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      const truck = await trucksService.unblockTruck(truckId);

      return reply.code(200).send(truck);
    } catch (error: any) {
      log.error({ error }, 'Failed to unblock truck');

      if (error.message === 'Truck not found') {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to unblock truck',
      });
    }
  }

  /**
   * Create inspection
   */
  async createInspection(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user;
      const { truckId } = req.params as { truckId: string };
      const payload = req.body as any;

      if (!payload.photos || !Array.isArray(payload.photos)) {
        return reply.code(400).send({
          code: 'MISSING_FIELDS',
          message: 'Missing required field: photos (array)',
        });
      }

      const inspection = await trucksService.createInspection(truckId, user.id, {
        photos: payload.photos,
        latitude: payload.latitude,
        longitude: payload.longitude,
        notes: payload.notes,
      });

      return reply.code(201).send(inspection);
    } catch (error: any) {
      log.error({ error }, 'Failed to create inspection');

      if (error.message === 'Truck not found') {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to create inspection',
      });
    }
  }
}

