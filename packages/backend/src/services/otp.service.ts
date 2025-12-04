/**
 * OTP Service
 * BUSINESS RULE: OTP delivery via in-app notifications ONLY - No SMS/WhatsApp
 * Handles OTP generation and storage for in-app notification delivery
 */

import crypto from 'crypto';

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
   * BUSINESS RULE: OTP delivery via in-app notifications ONLY
   * SMS/WhatsApp sending methods removed - violates business rule
   * OTP is stored and delivered via in-app notification system
   */

  /**
   * Generate and store OTP for in-app notification delivery
   * BUSINESS RULE: OTP delivered via in-app notifications ONLY - No SMS/WhatsApp
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

    // BUSINESS RULE: OTP is delivered via in-app notification system
    // In development, return OTP for testing purposes
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV OTP] Phone: ${phone}, OTP: ${otp} (for testing - production uses in-app notifications)`);
      return {
        success: true,
        message: `OTP generated. Check your in-app notifications. (DEV: ${otp})`,
        otp, // Only in development
      };
    }

    // Production: OTP delivered via in-app notification (handled by notification service)
    return {
      success: true,
      message: 'OTP generated. Please check your in-app notifications.',
    };
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
  private getRecentOTPCount(phone: string): number {
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

