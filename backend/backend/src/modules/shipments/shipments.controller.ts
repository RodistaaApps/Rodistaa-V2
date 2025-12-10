/**
 * Shipments Controller
 * Handles shipment lifecycle endpoints
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import * as shipmentsService from './shipments.service';
import logger from 'pino';
import crypto from 'crypto';

const log = logger({ name: 'shipments-controller' });

export class ShipmentsController {
  /**
   * Get shipment by ID
   */
  async getShipment(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { shipmentId } = req.params as { shipmentId: string };

      const shipment = await shipmentsService.getShipmentById(shipmentId);

      if (!shipment) {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'Shipment not found',
        });
      }

      return reply.code(200).send(shipment);
    } catch (error: any) {
      log.error({ error }, 'Failed to get shipment');
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve shipment',
      });
    }
  }

  /**
   * Start shipment
   */
  async startShipment(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }
      const { shipmentId } = req.params as { shipmentId: string };

      const shipment = await shipmentsService.startShipment(shipmentId, user.id);

      return reply.code(200).send(shipment);
    } catch (error: any) {
      log.error({ error }, 'Failed to start shipment');

      if (error.message === 'Shipment not found') {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      if (error.message.includes('Unauthorized')) {
        return reply.code(403).send({
          code: 'FORBIDDEN',
          message: error.message,
        });
      }

      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to start shipment',
      });
    }
  }

  /**
   * Record GPS ping
   */
  async recordGpsPing(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }
      const { shipmentId } = req.params as { shipmentId: string };
      const payload = req.body as any;

      if (!payload.latitude || !payload.longitude) {
        return reply.code(400).send({
          code: 'MISSING_FIELDS',
          message: 'Missing required fields: latitude, longitude',
        });
      }

      await shipmentsService.recordGpsPing(
        shipmentId,
        {
          latitude: parseFloat(payload.latitude),
          longitude: parseFloat(payload.longitude),
          timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
          accuracy: payload.accuracy ? parseFloat(payload.accuracy) : undefined,
          speed: payload.speed ? parseFloat(payload.speed) : undefined,
        },
        {
          userId: user.id,
          userRole: user.role,
          deviceId: req.headers['x-device-id'] as string,
        }
      );

      return reply.code(200).send({
        message: 'GPS ping recorded',
      });
    } catch (error: any) {
      log.error({ error }, 'Failed to record GPS ping');

      if (error.message === 'Shipment not found') {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      if (error.message.includes('rejected')) {
        return reply.code(403).send({
          code: 'ACS_REJECTED',
          message: error.message,
        });
      }

      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to record GPS ping',
      });
    }
  }

  /**
   * Upload POD
   */
  async uploadPOD(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }
      const { shipmentId } = req.params as { shipmentId: string };
      const payload = req.body as any;

      // In production, this would accept file upload via multipart/form-data
      // For now, accept file metadata and hash
      if (!payload.fileHash || !payload.fileName || !payload.fileSize) {
        return reply.code(400).send({
          code: 'MISSING_FIELDS',
          message: 'Missing required fields: fileHash, fileName, fileSize',
        });
      }

      const result = await shipmentsService.uploadPOD(
        shipmentId,
        {
          fileHash: payload.fileHash,
          fileName: payload.fileName,
          fileSize: parseInt(payload.fileSize, 10),
          uploadedBy: user.id,
          fileContent: Buffer.from(payload.fileContent || ''),
        },
        {
          userRole: user.role,
          deviceId: req.headers['x-device-id'] as string,
        }
      );

      return reply.code(201).send(result);
    } catch (error: any) {
      log.error({ error }, 'Failed to upload POD');

      if (error.message === 'Shipment not found') {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      if (error.message.includes('Duplicate') || error.message.includes('rejected')) {
        return reply.code(403).send({
          code: 'ACS_REJECTED',
          message: error.message,
        });
      }

      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to upload POD',
      });
    }
  }

  /**
   * Complete shipment with OTP
   */
  async completeShipment(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }
      const { shipmentId } = req.params as { shipmentId: string };
      const { otp } = req.body as { otp: string };

      if (!otp) {
        return reply.code(400).send({
          code: 'MISSING_FIELDS',
          message: 'OTP is required',
        });
      }

      const shipment = await shipmentsService.completeShipment(shipmentId, otp, user.id);

      return reply.code(200).send(shipment);
    } catch (error: any) {
      log.error({ error }, 'Failed to complete shipment');

      if (error.message === 'Shipment not found') {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      if (error.message.includes('Invalid OTP')) {
        return reply.code(400).send({
          code: 'INVALID_OTP',
          message: error.message,
        });
      }

      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to complete shipment',
      });
    }
  }
}
