/**
 * Truck Master Service Entry Point
 * Fastify server with environment configuration
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { initDb } from './db';
import { registerTruckMasterRoutes } from './api/truckMasterRoutes';
import { registerTruckRoutes } from './api/trucks';
import { registerFranchiseRoutes } from './api/franchise';
import { registerAdminRoutes } from './routes/admin/flags';

const PORT = parseInt(process.env.PORT || '3001', 10);
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/rodistaa';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  console.warn('⚠️  ENCRYPTION_KEY not set. RC copy encryption may not work properly.');
}

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

  // Add authentication decorator
  fastify.decorate('authenticate', async function(request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // Register routes
  await registerTruckMasterRoutes(fastify);
  registerTruckRoutes(fastify);
  registerFranchiseRoutes(fastify);
  registerAdminRoutes(fastify);
  
  // Driver & Assignment routes
  const { registerDriverRoutes } = await import('./api/drivers');
  const { registerAssignmentRoutes } = await import('./api/assignments');
  registerDriverRoutes(fastify);
  registerAssignmentRoutes(fastify);

  // Health check
  fastify.get('/health', async () => {
    return { 
      status: 'ok', 
      service: 'truck-master',
      timestamp: new Date().toISOString(),
    };
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

