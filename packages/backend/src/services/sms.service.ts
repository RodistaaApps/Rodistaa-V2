/**
 * SMS Service
 * Handles SMS sending via AWS SNS for login OTP
 * 
 * NOTE: SMS is ONLY used for login OTP. All other notifications use in-app notifications.
 */

import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import logger from 'pino';

const log = logger({ name: 'sms-service' });

export interface SendSMSOptions {
  phoneNumber: string; // E.164 format: +91XXXXXXXXXX
  message: string;
}

export class SMSService {
  private snsClient: SNSClient | null = null;
  private readonly enabled: boolean;
  private readonly region: string;

  constructor() {
    this.enabled = process.env.SMS_ENABLED === 'true' && !!process.env.AWS_ACCESS_KEY_ID;
    this.region = process.env.AWS_REGION || 'ap-south-1';

    if (this.enabled) {
      this.snsClient = new SNSClient({
        region: this.region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });
      log.info('SMS service initialized (AWS SNS)');
    } else {
      log.info('SMS service disabled (mock mode)');
    }
  }

  /**
   * Send SMS via AWS SNS
   * 
   * @param options SMS options
   * @returns Success status and message ID
   */
  async sendSMS(options: SendSMSOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { phoneNumber, message } = options;

    // Validate phone number format (E.164)
    if (!phoneNumber.startsWith('+')) {
      log.warn({ phoneNumber }, 'Invalid phone number format - must be E.164 (e.g., +91XXXXXXXXXX)');
      return {
        success: false,
        error: 'Invalid phone number format. Must be E.164 format (e.g., +91XXXXXXXXXX)',
      };
    }

    // Mock mode for development
    if (!this.enabled || !this.snsClient) {
      log.info({ phoneNumber, messageLength: message.length }, '[MOCK SMS] Would send SMS');
      return {
        success: true,
        messageId: `mock_${Date.now()}`,
      };
    }

    try {
      // Send SMS via AWS SNS
      const command = new PublishCommand({
        PhoneNumber: phoneNumber,
        Message: message,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional', // Transactional messages have higher delivery priority
          },
        },
      });

      const response = await this.snsClient.send(command);
      
      log.info({ 
        phoneNumber: this.maskPhone(phoneNumber), 
        messageId: response.MessageId 
      }, 'SMS sent successfully');

      return {
        success: true,
        messageId: response.MessageId,
      };
    } catch (error: any) {
      log.error({ error, phoneNumber: this.maskPhone(phoneNumber) }, 'Failed to send SMS');
      return {
        success: false,
        error: error.message || 'Failed to send SMS',
      };
    }
  }

  /**
   * Send login OTP via SMS
   * 
   * @param phoneNumber Phone number in E.164 format
   * @param otp 6-digit OTP
   * @returns Success status
   */
  async sendLoginOTP(phoneNumber: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message = `Your Rodistaa login OTP is: ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;

    return this.sendSMS({
      phoneNumber,
      message,
    });
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
   * Check if SMS service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
export const smsService = new SMSService();

