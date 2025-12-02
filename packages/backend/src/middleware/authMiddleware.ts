/**
 * Auth Middleware
 * Validates JWT tokens and attaches user context
 */

import { FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Skip auth for public endpoints
  if (
    request.url === '/health' ||
    request.url.startsWith('/auth/') ||
    request.url.startsWith('/docs')
  ) {
    return;
  }

  const token = request.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return reply.code(401).send({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }

  // TODO: Validate JWT token
  // For now, mock user context
  (request as any).user = {
    id: 'USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
    role: 'SH',
    kycStatus: 'VERIFIED',
  };
}

