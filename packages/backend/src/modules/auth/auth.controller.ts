/**
 * Auth Controller
 * Handles authentication endpoints
 */

import { FastifyRequest, FastifyReply } from 'fastify';

export class AuthController {
  async login(req: FastifyRequest, reply: FastifyReply) {
    // TODO: Implement OTP-based login
    const payload = req.body as { mobile: string; otp: string; deviceId?: string };
    
    // Mock implementation
    return reply.code(200).send({
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: 'USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
        role: 'SH',
        name: 'Test User',
      },
    });
  }

  async refresh(req: FastifyRequest, reply: FastifyReply) {
    // TODO: Implement token refresh
    return reply.code(200).send({
      token: 'new-mock-jwt-token',
    });
  }
}

