/**
 * Swagger/OpenAPI Documentation Setup
 * Serves interactive API documentation
 */

import { FastifyInstance } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';

export async function registerSwagger(app: FastifyInstance) {
  // Register Swagger plugin
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Rodistaa API',
        description: 'Freight logistics platform API - Backend services for Rodistaa platform',
        version: '1.0.0',
        contact: {
          name: 'Rodistaa Engineering',
          email: 'engineering@rodistaa.com',
        },
      },
      servers: [
        {
          url: 'http://localhost:4000',
          description: 'Development server',
        },
        {
          url: 'https://api-staging.rodistaa.com',
          description: 'Staging server',
        },
        {
          url: 'https://api.rodistaa.com',
          description: 'Production server',
        },
      ],
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'bookings', description: 'Booking management' },
        { name: 'bids', description: 'Bidding operations' },
        { name: 'shipments', description: 'Shipment tracking' },
        { name: 'trucks', description: 'Truck fleet management' },
        { name: 'kyc', description: 'KYC verification' },
        { name: 'users', description: 'User management' },
        { name: 'franchise', description: 'Franchise operations' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  // Register Swagger UI
  await app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      displayRequestDuration: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  // Log swagger URL
  app.log.info('Swagger documentation available at /docs');
}

