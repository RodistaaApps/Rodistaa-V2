/**
 * ACS Middleware
 * Integrates Anti-Corruption Shield checks into Fastify routes
 */

import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { evaluateAcsRules, shouldRejectRequest, initializeAcs } from '../modules/acs-adapter';

/**
 * Register ACS middleware on Fastify server
 */
export async function registerAcsMiddleware(server: FastifyInstance) {
  // Initialize ACS on server startup
  await server.addHook('onReady', async () => {
    try {
      await initializeAcs();
      server.log.info('ACS initialized successfully');
    } catch (error: any) {
      server.log.error({ error }, 'Failed to initialize ACS');
    }
  });

  // Evaluate ACS rules on each request
  server.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip ACS for health checks and public endpoints
    if (request.url === '/health' || request.url.startsWith('/auth/')) {
      return;
    }

    // Skip if user is not authenticated (will be handled by auth middleware)
    if (!(request as any).user) {
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
    const eventType = mapRouteToEventType(request.method, request.routerPath || request.url);
    const event = {
      type: eventType,
      payload: request.body || {},
      params: request.params || {},
      query: request.query || {},
    };

    try {
      // Evaluate ACS rules
      const matches = await evaluateAcsRules(event, ctx);

      // Check if request should be rejected
      const rejection = shouldRejectRequest(matches);
      if (rejection.reject) {
        return reply.code(403).send({
          code: rejection.reason?.code || 'ACS_BLOCKED',
          message: rejection.reason?.message || 'Request blocked by Anti-Corruption Shield',
          ruleId: rejection.reason?.ruleId,
        });
      }

      // Attach ACS context to request for downstream use
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

/**
 * Map HTTP method and route to ACS event type
 */
function mapRouteToEventType(method: string, route: string): string {
  const normalizedRoute = route
    .replace(/^\/v\d+\//, '/') // Remove version prefix
    .replace(/\/$/, '') // Remove trailing slash
    .replace(/\//g, '.') // Convert slashes to dots
    .replace(/^\./, ''); // Remove leading dot

  const methodLower = method.toLowerCase();
  
  // Map common routes to event types
  if (normalizedRoute === 'bookings' && methodLower === 'post') {
    return 'booking.create';
  }
  if (normalizedRoute.startsWith('bookings.') && normalizedRoute.includes('.bids') && methodLower === 'post') {
    return 'bid.create';
  }
  if (normalizedRoute.startsWith('shipments.') && normalizedRoute.includes('.ping') && methodLower === 'post') {
    return 'gps.ping';
  }
  if (normalizedRoute.startsWith('shipments.') && normalizedRoute.includes('.pod') && methodLower === 'post') {
    return 'pod.uploaded';
  }
  if (normalizedRoute.startsWith('shipments.') && normalizedRoute.includes('.complete') && methodLower === 'post') {
    return 'shipment.complete';
  }

  // Generic mapping
  return `${methodLower}.${normalizedRoute}`;
}

