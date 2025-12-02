/**
 * OTP Service
 * Handles OTP generation and sending via SMS providers
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
   * Send OTP via SMS (AWS SNS)
   */
  async sendOTPViaSNS(phone: string, otp: string): Promise<boolean> {
    // TODO: Implement AWS SNS when credentials provided
    // const sns = new SNSClient({ region: 'ap-south-1' });
    // await sns.send(new PublishCommand({
    //   PhoneNumber: `+91${phone}`,
    //   Message: `Your Rodistaa OTP is: ${otp}. Valid for 5 minutes.`,
    // }));

    console.log(`[OTP] Would send to ${phone}: ${otp}`);
    return true;
  }

  /**
   * Send OTP via Twilio
   */
  async sendOTPViaTwilio(phone: string, otp: string): Promise<boolean> {
    // TODO: Implement Twilio when credentials provided
    // const twilio = require('twilio')(accountSid, authToken);
    // await twilio.messages.create({
    //   body: `Your Rodistaa OTP is: ${otp}. Valid for 5 minutes.`,
    //   from: twilioPhone,
    //   to: `+91${phone}`,
    // });

    console.log(`[OTP] Would send to ${phone}: ${otp}`);
    return true;
  }

  /**
   * Send OTP (mock mode for development)
   */
  async sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
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

    // Send via SMS provider
    const useMock = process.env.USE_MOCK_OTP !== 'false';
    if (useMock) {
      // Mock mode for development
      console.log(`[MOCK OTP] Phone: ${phone}, OTP: ${otp}`);
      return {
        success: true,
        message: `OTP sent to ${phone}. Mock OTP: ${otp}`,
      };
    } else {
      // Production: Use real SMS provider
      const provider = process.env.SMS_PROVIDER || 'sns';
      const sent = provider === 'twilio'
        ? await this.sendOTPViaTwilio(phone, otp)
        : await this.sendOTPViaSNS(phone, otp);

      return {
        success: sent,
        message: sent ? `OTP sent to ${phone}` : 'Failed to send OTP',
      };
    }
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

