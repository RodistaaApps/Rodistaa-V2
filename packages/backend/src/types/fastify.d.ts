/**
 * Fastify Type Extensions
 * Extends FastifyRequest to include user property
 */

import { FastifyRequest } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      role: string;
      name: string;
      mobile: string;
      kycStatus: string;
      deviceId?: string;
      franchiseId?: string;
    };
  }
}

