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

  // Health check
  server.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }));

  // Register middleware
  await registerAuthMiddleware(server);
  await registerAcsMiddleware(server);

  // Register routes
  await registerRoutes(server);

  return server;
}

