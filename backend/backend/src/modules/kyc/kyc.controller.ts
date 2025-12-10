/**
 * KYC Controller
 * Handles KYC document endpoints
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import * as kycService from './kyc.service';
import logger from 'pino';

const log = logger({ name: 'kyc-controller' });

export class KycController {
  /**
   * Upload KYC document
   */
  async upload(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }
      const data = await (req as any).file();

      if (!data) {
        return reply.code(400).send({
          code: 'MISSING_FILE',
          message: 'File is required',
        });
      }

      const documentType = (req.body as any).documentType;
      if (!documentType) {
        return reply.code(400).send({
          code: 'MISSING_FIELDS',
          message: 'Missing required field: documentType',
        });
      }

      // Read file content
      const chunks: Buffer[] = [];
      for await (const chunk of data) {
        chunks.push(chunk);
      }
      const fileContent = Buffer.concat(chunks);

      // Store file (in production, upload to S3/storage)
      const fileUrl = `/uploads/kyc/${user.id}/${Date.now()}-${data.filename}`;

      const kycRecord = await kycService.uploadKyc(
        user.id,
        documentType,
        fileContent,
        fileUrl,
        {
          userRole: user.role,
          kycStatus: user.kycStatus,
        }
      );

      return reply.code(201).send(kycRecord);
    } catch (error: any) {
      log.error({ error }, 'Failed to upload KYC');

      if (error.message && error.message.includes('rejected')) {
        return reply.code(403).send({
          code: 'ACS_REJECTED',
          message: error.message,
        });
      }

      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to upload KYC document',
      });
    }
  }

  /**
   * Get KYC status
   */
  async getStatus(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const status = await kycService.getKycStatus(user.id);

      return reply.code(200).send(status);
    } catch (error: any) {
      log.error({ error }, 'Failed to get KYC status');
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve KYC status',
      });
    }
  }

  /**
   * Get KYC record
   */
  async getKyc(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }
      const { kycId } = req.params as { kycId: string };

      const record = await kycService.getKycRecord(kycId, user.id, user.role);

      if (!record) {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'KYC record not found',
        });
      }

      return reply.code(200).send(record);
    } catch (error: any) {
      log.error({ error }, 'Failed to get KYC record');
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve KYC record',
      });
    }
  }

  /**
   * Decrypt KYC record (admin only)
   */
  async decrypt(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }
      const { kycId } = req.params as { kycId: string };

      if (user.role !== 'ADMIN' && user.role !== 'AD') {
        return reply.code(403).send({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      const decrypted = await kycService.decryptKycRecord(kycId, user.id);

      return reply.code(200).send(decrypted);
    } catch (error: any) {
      log.error({ error }, 'Failed to decrypt KYC');

      if (error.message === 'KYC record not found') {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to decrypt KYC record',
      });
    }
  }
}

