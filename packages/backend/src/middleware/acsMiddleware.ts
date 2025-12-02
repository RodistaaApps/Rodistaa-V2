/**
 * ACS Middleware
 * Integrates Anti-Corruption Shield checks into Fastify routes
 */

import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { onEvent } from '@rodistaa/acs';

export async function registerAcsMiddleware(server: FastifyInstance) {
  server.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip ACS for health checks and public endpoints
    if (request.url === '/health' || request.url.startsWith('/auth/')) {
      return;
    }

    // Build context from request
    const ctx = {
      userId: (request as any).user?.id,
      userRole: (request as any).user?.role,
      userKycStatus: (request as any).user?.kycStatus,
      deviceId: request.headers['x-device-id'] as string,
      ip: request.ip,
      route: request.routerPath,
      method: request.method,
    };

    // Build event from request
    const event = {
      type: `${request.method.toLowerCase()}.${request.routerPath.replace(/\//g, '.').replace(/^\./, '')}`,
      body: request.body,
      params: request.params,
      query: request.query,
    };

    try {
      // Evaluate ACS rules
      const matches = await onEvent(event, ctx);

      // If critical rules matched, reject request
      const criticalMatch = matches.find(m => m.rule.severity === 'critical');
      if (criticalMatch) {
        return reply.code(403).send({
          code: 'ACS_BLOCKED',
          message: 'Request blocked by Anti-Corruption Shield',
          ruleId: criticalMatch.ruleId,
        });
      }

      // Attach ACS context to request
      (request as any).acs = {
        matches,
        ctx,
      };
    } catch (error: any) {
      // Log error but don't block request (fail open for now)
      request.log.error({ error }, 'ACS evaluation error');
    }
  });
}

