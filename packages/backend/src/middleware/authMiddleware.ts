/**
 * Auth Middleware
 * Validates JWT tokens and attaches user context
 */

import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { validateToken } from '../modules/auth/auth.service';
import { query } from '../db/connection';
import logger from 'pino';

const log = logger({ name: 'auth-middleware' });

/**
 * Register authentication middleware
 */
export async function registerAuthMiddleware(server: FastifyInstance) {
  server.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip auth for OPTIONS (CORS preflight)
    if (request.method === 'OPTIONS') {
      return;
    }

    // Normalize URL (remove /v1 prefix if present)
    const normalizedUrl = request.url.replace(/^\/v\d+/, '');

    // Skip auth for public endpoints
    if (
      normalizedUrl === '/health' ||
      normalizedUrl.startsWith('/auth/') ||
      normalizedUrl.startsWith('/docs') ||
      normalizedUrl.startsWith('/webhooks/')
    ) {
      return;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      // Validate and decode token
      const decoded: any = validateToken(token);
      
      // Get user from database to ensure they still exist and are active
      const result = await query(
        `SELECT id, role, name, mobile, kyc_status, is_active, is_blocked
         FROM users 
         WHERE id = $1 
         LIMIT 1`,
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return reply.code(401).send({
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        });
      }

      const user = result.rows[0];

      if (!user.is_active) {
        return reply.code(403).send({
          code: 'USER_INACTIVE',
          message: 'User account is inactive',
        });
      }

      if (user.is_blocked) {
        return reply.code(403).send({
          code: 'USER_BLOCKED',
          message: 'User account is blocked',
        });
      }

      // Attach user context to request
      (request as any).user = {
        id: user.id,
        role: user.role,
        name: user.name,
        mobile: user.mobile,
        kycStatus: user.kyc_status,
        deviceId: decoded.deviceId,
      };

      // Verify device binding if required
      const deviceId = request.headers['x-device-id'] as string;
      if (deviceId && decoded.deviceId && deviceId !== decoded.deviceId) {
        log.warn({ userId: user.id, expected: decoded.deviceId, received: deviceId }, 'Device ID mismatch');
        // Don't block - just log for now
      }
    } catch (error: any) {
      if (error.message === 'Token expired') {
        return reply.code(401).send({
          code: 'TOKEN_EXPIRED',
          message: 'Token has expired',
        });
      }

      log.error({ error }, 'Token validation failed');
      return reply.code(401).send({
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token',
      });
    }
  });
}

