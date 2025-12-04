/**
 * Auth Service
 * Handles authentication business logic: OTP, JWT tokens, device binding
 */

import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { query } from '../../db/connection';
import logger from 'pino';
import { generateUserId, UserRole } from '@rodistaa/app-shared';

export { UserRole };

const log = logger({ name: 'auth-service' });

export interface LoginRequest {
  mobile: string;
  otp: string;
  deviceId?: string;
}

export interface TokenPair {
  token: string;
  refreshToken: string;
}

export interface UserContext {
  id: string;
  role: UserRole;
  name: string;
  mobileMasked: string;
  kycStatus: string;
}

// OTP storage (in production, use Redis with TTL)
const otpStore: Map<string, { otp: string; expiresAt: Date }> = new Map();

/**
 * Generate and send login OTP via SMS
 * 
 * NOTE: Login OTP is sent via SMS. Other OTPs (shipment completion, etc.) use in-app notifications.
 */
export async function generateOTP(mobile: string): Promise<void> {
  // Import OTP service for SMS sending
  const { otpService } = await import('../../services/otp.service');
  
  // Format phone number to E.164 format
  const cleaned = mobile.replace(/\D/g, '');
  const phoneNumber = cleaned.startsWith('91') ? `+${cleaned}` : `+91${cleaned}`;

  // Generate and send OTP via SMS
  const result = await otpService.generateAndSendLoginOTP(phoneNumber);

  if (!result.success) {
    log.error({ mobile: maskMobile(mobile), error: result.message }, 'Failed to generate/send login OTP');
    throw new Error(result.message || 'Failed to send OTP');
  }

  // Store OTP in local store for validation (backup)
  // The OTP service also stores it, but we keep this for backward compatibility
  if (result.otp) {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    otpStore.set(mobile, { otp: result.otp, expiresAt });
  }

  log.info({ mobile: maskMobile(mobile) }, 'Login OTP sent via SMS');
}

/**
 * Validate OTP
 */
export function validateOTP(mobile: string, otp: string): boolean {
  const stored = otpStore.get(mobile);
  if (!stored) {
    return false;
  }

  if (new Date() > stored.expiresAt) {
    otpStore.delete(mobile);
    return false;
  }

  if (stored.otp !== otp) {
    return false;
  }

  // OTP is valid, remove it (one-time use)
  otpStore.delete(mobile);
  return true;
}

/**
 * Mask mobile number for privacy
 */
function maskMobile(mobile: string): string {
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.length < 4) return mobile;
  const visible = cleaned.slice(-4);
  return `+${cleaned.slice(0, -4).replace(/\d/g, 'X')}${visible}`;
}

/**
 * Find or create user by mobile number
 */
export async function findOrCreateUser(mobile: string, role: UserRole = UserRole.SHIPPER): Promise<UserContext> {
  const cleaned = mobile.replace(/\D/g, '');
  const fullMobile = cleaned.startsWith('91') ? `+${cleaned}` : `+91${cleaned}`;

  try {
    // Try to find existing user
    const result = await query(
      `SELECT id, role, name, mobile, kyc_status 
       FROM users 
       WHERE mobile = $1 
       LIMIT 1`,
      [fullMobile]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      return {
        id: user.id,
        role: user.role as UserRole,
        name: user.name,
        mobileMasked: maskMobile(user.mobile),
        kycStatus: user.kyc_status,
      };
    }

    // Create new user
    const userId = generateUserId(role);
    const name = `User ${fullMobile.slice(-4)}`; // Default name from last 4 digits

    await query(
      `INSERT INTO users (id, mobile, name, role, kyc_status, is_active, created_at)
       VALUES ($1, $2, $3, $4, 'PENDING', true, NOW())`,
      [userId, fullMobile, name, role]
    );

    log.info({ userId, mobile: maskMobile(fullMobile) }, 'New user created');

    return {
      id: userId,
      role,
      name,
      mobileMasked: maskMobile(fullMobile),
      kycStatus: 'PENDING',
    };
  } catch (error: any) {
    log.error({ 
      error: error.message, 
      stack: error.stack,
      code: error.code,
      mobile: maskMobile(fullMobile) 
    }, 'Failed to find or create user');
    throw error; // Re-throw original error for better debugging
  }
}

/**
 * Generate JWT token pair
 */
export function generateTokens(user: UserContext, deviceId?: string): TokenPair {
  const payload = {
    userId: user.id,
    role: user.role,
    kycStatus: user.kycStatus,
    deviceId,
  };

  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign({ userId: user.id }, config.jwt.secret, {
    expiresIn: '30d',
  } as jwt.SignOptions);

  return { token, refreshToken };
}

/**
 * Validate and decode JWT token
 */
export function validateToken(token: string): any {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    throw new Error('Invalid token');
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  try {
    const decoded: any = jwt.verify(refreshToken, config.jwt.secret);
    
    // Get user from database
    const result = await query(
      `SELECT id, role, name, mobile, kyc_status 
       FROM users 
       WHERE id = $1 AND is_active = true 
       LIMIT 1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];
    const userContext: UserContext = {
      id: user.id,
      role: user.role as UserRole,
      name: user.name,
      mobileMasked: maskMobile(user.mobile),
      kycStatus: user.kyc_status,
    };

    // Generate new access token
    const { token } = generateTokens(userContext);
    return token;
  } catch (error: any) {
    log.error({ error }, 'Token refresh failed');
    throw new Error('Invalid refresh token');
  }
}

/**
 * Update user last login and device binding
 */
export async function updateUserSession(userId: string, deviceId?: string): Promise<void> {
  try {
    await query(
      `UPDATE users 
       SET last_login_at = NOW(), device_id = COALESCE($2, device_id), updated_at = NOW()
       WHERE id = $1`,
      [userId, deviceId]
    );
  } catch (error: any) {
    log.error({ error, userId }, 'Failed to update user session');
    // Don't throw - session update is non-critical
  }
}

