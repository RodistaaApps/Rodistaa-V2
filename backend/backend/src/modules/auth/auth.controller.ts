/**
 * Auth Controller
 * Handles authentication endpoints
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import {
  generateOTP,
  validateOTP,
  findOrCreateUser,
  generateTokens,
  refreshAccessToken,
  updateUserSession,
  UserRole,
} from './auth.service';

export class AuthController {
  /**
   * Generate and send OTP
   */
  async requestOTP(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { mobile } = req.body as { mobile: string };

      if (!mobile || !mobile.match(/^\+?[1-9]\d{1,14}$/)) {
        return reply.code(400).send({
          code: 'INVALID_MOBILE',
          message: 'Invalid mobile number format',
        });
      }

      await generateOTP(mobile);

      return reply.code(200).send({
        message: 'OTP sent successfully',
      });
    } catch (error: any) {
      req.log.error({ error }, 'OTP generation failed');
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate OTP',
      });
    }
  }

  /**
   * Login with OTP
   */
  async login(req: FastifyRequest, reply: FastifyReply) {
    try {
      const payload = req.body as { mobile: string; otp: string; deviceId?: string };

      req.log.info({ mobile: payload.mobile?.substring(0, 5) + '***' }, 'Login attempt');

      if (!payload.mobile || !payload.otp) {
        return reply.code(400).send({
          code: 'MISSING_FIELDS',
          message: 'Mobile and OTP are required',
        });
      }

      // Validate OTP
      req.log.info('Validating OTP');
      if (!validateOTP(payload.mobile, payload.otp)) {
        req.log.warn('OTP validation failed');
        return reply.code(401).send({
          code: 'INVALID_OTP',
          message: 'Invalid or expired OTP',
        });
      }

      // Find or create user
      req.log.info('Finding or creating user');
      const user = await findOrCreateUser(payload.mobile, UserRole.SHIPPER);
      req.log.info({ userId: user.id }, 'User found/created');

      // Generate tokens
      req.log.info('Generating tokens');
      const tokens = generateTokens(user, payload.deviceId);

      // Update user session
      req.log.info('Updating session');
      await updateUserSession(user.id, payload.deviceId);

      req.log.info('Login successful');
      return reply.code(200).send({
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          role: user.role,
          name: user.name,
          mobileMasked: user.mobileMasked,
        },
      });
    } catch (error: any) {
      req.log.error({ 
        error: error.message,
        stack: error.stack,
        name: error.name 
      }, 'Login failed with exception');
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Login failed',
      });
    }
  }

  /**
   * Refresh access token
   */
  async refresh(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { refreshToken } = req.body as { refreshToken: string };

      if (!refreshToken) {
        return reply.code(400).send({
          code: 'MISSING_TOKEN',
          message: 'Refresh token is required',
        });
      }

      const token = await refreshAccessToken(refreshToken);

      return reply.code(200).send({
        token,
      });
    } catch (error: any) {
      req.log.error({ error }, 'Token refresh failed');
      return reply.code(401).send({
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired refresh token',
      });
    }
  }

  /**
   * Logout
   */
  async logout(req: FastifyRequest, reply: FastifyReply) {
    // In production, invalidate refresh token in database/Redis
    // For now, client-side logout is sufficient
    return reply.code(200).send({
      message: 'Logged out successfully',
    });
  }
}

