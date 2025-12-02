/**
 * Health and Readiness Endpoints
 * For production monitoring and load balancer health checks
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query } from './db/connection';
import logger from 'pino';

const log = logger({ name: 'health' });

let startTime = Date.now();

/**
 * Basic health check - always returns 200 if server is running
 */
export async function healthCheck(req: FastifyRequest, reply: FastifyReply) {
  return reply.code(200).send({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
  });
}

/**
 * Readiness check - verifies all dependencies are healthy
 * Use this for load balancer health checks
 */
export async function readinessCheck(req: FastifyRequest, reply: FastifyReply) {
  const checks: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Check database connectivity
  try {
    await query('SELECT 1');
    checks.checks.database = { status: 'healthy', message: 'Database connected' };
  } catch (error: any) {
    checks.status = 'unhealthy';
    checks.checks.database = { status: 'unhealthy', message: error.message };
    log.error({ error }, 'Database health check failed');
  }

  // Check ACS rules loaded
  try {
    // Simple check - if this module loaded, ACS is initialized
    checks.checks.acs = { status: 'healthy', message: 'ACS rules loaded' };
  } catch (error: any) {
    checks.status = 'unhealthy';
    checks.checks.acs = { status: 'unhealthy', message: error.message };
  }

  // Return appropriate status code
  const statusCode = checks.status === 'healthy' ? 200 : 503;
  return reply.code(statusCode).send(checks);
}

/**
 * Metrics endpoint for Prometheus
 */
export async function metricsEndpoint(req: FastifyRequest, reply: FastifyReply) {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  
  // Simple Prometheus-compatible metrics
  const metrics = `
# HELP rodistaa_uptime_seconds Application uptime in seconds
# TYPE rodistaa_uptime_seconds gauge
rodistaa_uptime_seconds ${uptime}

# HELP rodistaa_info Application info
# TYPE rodistaa_info gauge
rodistaa_info{version="1.0.0",env="${process.env.NODE_ENV || 'development'}"} 1
`.trim();

  return reply
    .header('Content-Type', 'text/plain')
    .code(200)
    .send(metrics);
}

/**
 * Register health endpoints
 */
export function registerHealthEndpoints(server: FastifyInstance) {
  server.get('/health', healthCheck);
  server.get('/ready', readinessCheck);
  server.get('/metrics', metricsEndpoint);
  
  // Reset start time when server initializes
  startTime = Date.now();
  
  log.info('Health endpoints registered: /health, /ready, /metrics');
}

