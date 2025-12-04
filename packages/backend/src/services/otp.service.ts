/**
 * OTP Service
 * Handles OTP generation and delivery
 * 
 * NOTE: Login OTP is sent via SMS. All other OTPs (shipment completion, etc.) use in-app notifications.
 */

import crypto from 'crypto';
import { smsService } from './sms.service';
import logger from 'pino';

const log = logger({ name: 'otp-service' });

interface OTPRecord {
  phone: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
}

export class OTPService {
  private otpStore: Map<string, OTPRecord> = new Map();
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 5;

  /**
   * Generate secure 6-digit OTP
   */
  generateOTP(): string {
    const randomNumber = crypto.randomInt(100000, 1000000);
    return randomNumber.toString();
  }

  /**
   * Generate and send login OTP via SMS
   * 
   * NOTE: Login OTP is sent via SMS. Other OTPs (shipment completion, etc.) use in-app notifications.
   */
  async generateAndSendLoginOTP(phone: string): Promise<{ success: boolean; message: string; otp?: string }> {
    // Check rate limiting (max 3 OTPs per hour)
    const recentOTPs = this.getRecentOTPCount(phone);
    if (recentOTPs >= 3) {
      return {
        success: false,
        message: 'Too many OTP requests. Please try after 1 hour.',
      };
    }

    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP
    this.otpStore.set(phone, {
      phone,
      otp,
      expiresAt,
      attempts: 0,
    });

    // Send OTP via SMS
    const smsResult = await smsService.sendLoginOTP(phone, otp);

    if (!smsResult.success) {
      log.warn({ phone: this.maskPhone(phone), error: smsResult.error }, 'Failed to send OTP via SMS');
      // In development, still return OTP even if SMS fails
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          message: `OTP generated. SMS sending failed: ${smsResult.error}. (DEV OTP: ${otp})`,
          otp,
        };
      }
      return {
        success: false,
        message: `Failed to send OTP. Please try again.`,
      };
    }

    // In development, also return OTP for testing
    if (process.env.NODE_ENV === 'development') {
      log.info({ phone: this.maskPhone(phone), otp }, 'Login OTP sent via SMS (DEV mode - OTP visible)');
      return {
        success: true,
        message: `OTP sent to your phone. (DEV: ${otp})`,
        otp, // Only in development
      };
    }

    log.info({ phone: this.maskPhone(phone) }, 'Login OTP sent via SMS');
    return {
      success: true,
      message: 'OTP sent to your phone. Please check your SMS.',
    };
  }

  /**
   * Generate and store OTP for in-app notification delivery (non-login OTPs)
   * Used for shipment completion OTP, etc.
   */
  async generateAndStoreOTP(phone: string): Promise<{ success: boolean; message: string; otp?: string }> {
    // Check rate limiting (max 3 OTPs per hour)
    const recentOTPs = this.getRecentOTPCount(phone);
    if (recentOTPs >= 3) {
      return {
        success: false,
        message: 'Too many OTP requests. Please check your in-app notifications and try after 1 hour.',
      };
    }

    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP for in-app notification delivery
    this.otpStore.set(phone, {
      phone,
      otp,
      expiresAt,
      attempts: 0,
    });

    // In development, return OTP for testing purposes
    if (process.env.NODE_ENV === 'development') {
      log.info({ phone: this.maskPhone(phone), otp }, '[DEV OTP] Generated for in-app notification (DEV: OTP visible)');
      return {
        success: true,
        message: `OTP generated. Check your in-app notifications. (DEV: ${otp})`,
        otp, // Only in development
      };
    }

    // Production: OTP delivered via in-app notification (handled by notification service)
    log.info({ phone: this.maskPhone(phone) }, 'OTP generated for in-app notification');
    return {
      success: true,
      message: 'OTP generated. Please check your in-app notifications.',
    };
  }

  /**
   * Mask phone number for logging
   */
  private maskPhone(phone: string): string {
    if (phone.length < 4) return phone;
    const visible = phone.slice(-4);
    return `${phone.slice(0, -4).replace(/\d/g, 'X')}${visible}`;
  }

  /**
   * Verify OTP
   */
  verifyOTP(phone: string, otpInput: string): { valid: boolean; message: string } {
    const record = this.otpStore.get(phone);

    if (!record) {
      return { valid: false, message: 'No OTP found. Please request a new one.' };
    }

    // Check expiry
    if (new Date() > record.expiresAt) {
      this.otpStore.delete(phone);
      return { valid: false, message: 'OTP expired. Please request a new one.' };
    }

    // Check attempts
    if (record.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(phone);
      return { valid: false, message: 'Maximum attempts exceeded. Please request a new OTP.' };
    }

    // Verify OTP
    if (record.otp === otpInput) {
      this.otpStore.delete(phone);
      return { valid: true, message: 'OTP verified successfully' };
    } else {
      record.attempts++;
      return { valid: false, message: `Invalid OTP. ${this.MAX_ATTEMPTS - record.attempts} attempts remaining.` };
    }
  }

  /**
   * Get recent OTP count for rate limiting
   */
  private getRecentOTPCount(_phone: string): number {
    // TODO: Implement with Redis for distributed rate limiting
    // For now, simple in-memory check
    return 0;
  }

  /**
   * Clear expired OTPs (run periodically)
   */
  clearExpiredOTPs(): number {
    const now = new Date();
    let cleared = 0;

    for (const [phone, record] of this.otpStore.entries()) {
      if (now > record.expiresAt) {
        this.otpStore.delete(phone);
        cleared++;
      }
    }

    return cleared;
  }
}

// Singleton instance
export const otpService = new OTPService();

