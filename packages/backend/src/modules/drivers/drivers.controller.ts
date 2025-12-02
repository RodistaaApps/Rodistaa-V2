/**
 * Drivers Controller
 * Handles driver-specific endpoints
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import * as driversService from './drivers.service';

export class DriversController {
  /**
   * Register driver
   */
  async register(req: FastifyRequest, reply: FastifyReply) {
    try {
      const payload = req.body as { mobile: string; name: string; licenseNumber?: string; licenseFileUrl?: string };

      const driver = await driversService.registerDriver({
        mobile: payload.mobile,
        name: payload.name,
        licenseNumber: payload.licenseNumber || '',
        licenseFileUrl: payload.licenseFileUrl,
      });

      return reply.code(201).send(driver);
    } catch (error: any) {
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Driver registration failed',
      });
    }
  }

  /**
   * Link driver to truck
   */
  async linkTruck(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user;
      const { driverId } = req.params as { driverId: string };
      const { truckId } = req.body as { truckId: string };

      await driversService.linkDriverToTruck(driverId, truckId, user.id);

      return reply.code(200).send({
        message: 'Driver linked to truck successfully',
      });
    } catch (error: any) {
      return reply.code(400).send({
        code: 'OPERATION_FAILED',
        message: error.message || 'Failed to link driver to truck',
      });
    }
  }

  /**
   * Get driver profile
   */
  async getProfile(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user;
      const { driverId } = req.params as { driverId: string };

      const profile = await driversService.getDriverProfile(
        driverId,
        user.id,
        user.role
      );

      return reply.code(200).send(profile);
    } catch (error: any) {
      return reply.code(404).send({
        code: 'NOT_FOUND',
        message: error.message || 'Driver not found',
      });
    }
  }
}

