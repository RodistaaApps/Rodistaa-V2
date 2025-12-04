/**
 * Truck Master Service Entry Point
 * Fastify server with environment configuration
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { initDb } from './db';
import { registerTruckMasterRoutes } from './api/truckMasterRoutes';

const PORT = parseInt(process.env.PORT || '3001', 10);
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/rodistaa';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function buildApp() {
  const fastify = Fastify({
    logger: true,
  });

  // Initialize database
  initDb(DATABASE_URL);

  // Register plugins
  await fastify.register(cors, {
    origin: true,
  });

  await fastify.register(jwt, {
    secret: JWT_SECRET,
  });

  // Register routes
  await registerTruckMasterRoutes(fastify);

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', service: 'truck-master' };
  });

  return fastify;
}

async function start() {
  try {
    const app = await buildApp();
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Truck Master Service listening on port ${PORT}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

export { buildApp };

