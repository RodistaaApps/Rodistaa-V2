/**
 * Users Controller
 * Handles user management endpoints
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import * as usersService from './users.service';
import logger from 'pino';

const log = logger({ name: 'users-controller' });

export class UsersController {
  /**
   * Get current user profile
   */
  async getCurrentUser(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const profile = await usersService.getCurrentUser(user.id);

      if (!profile) {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return reply.code(200).send(profile);
    } catch (error: any) {
      log.error({ error }, 'Failed to get current user');
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve user profile',
      });
    }
  }

  /**
   * Get user by ID
   */
  async getUser(req: FastifyRequest, reply: FastifyReply) {
    try {
      const requestingUser = req.user;
      const { userId } = req.params as { userId: string };

      const user = await usersService.getUserById(
        userId,
        requestingUser.id,
        requestingUser.role
      );

      if (!user) {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return reply.code(200).send(user);
    } catch (error: any) {
      log.error({ error }, 'Failed to get user');
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve user',
      });
    }
  }

  /**
   * Register new user
   */
  async register(req: FastifyRequest, reply: FastifyReply) {
    try {
      const payload = req.body as { mobile: string; name: string; role: string; email?: string };

      if (!payload.mobile || !payload.name || !payload.role) {
        return reply.code(400).send({
          code: 'MISSING_FIELDS',
          message: 'Missing required fields: mobile, name, role',
        });
      }

      const user = await usersService.registerUser({
        mobile: payload.mobile,
        name: payload.name,
        role: payload.role as any,
        email: payload.email,
      });

      return reply.code(201).send(user);
    } catch (error: any) {
      log.error({ error }, 'User registration failed');
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: error.message || 'User registration failed',
      });
    }
  }
}

