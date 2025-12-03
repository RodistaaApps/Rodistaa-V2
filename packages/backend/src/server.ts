/**
 * Fastify Server Setup
 */

import Fastify, { FastifyInstance } from 'fastify';
import { registerRoutes } from './routes';
import { registerAcsMiddleware } from './middleware/acsMiddleware';
import { registerAuthMiddleware } from './middleware/authMiddleware';

export async function createServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty' }
        : undefined,
    },
  });

  // Enable CORS for portal
  await server.register(require('@fastify/cors'), {
    origin: true, // Allow all origins in development
    credentials: true,
  });

  // Health check
  server.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }));

  // Register middleware
  await registerAuthMiddleware(server);
  await registerAcsMiddleware(server);

  // Register routes with /v1 prefix
  await server.register(
    async function (apiServer) {
      await registerRoutes(apiServer);
    },
    { prefix: '/v1' }
  );

  return server;
}

