/**
 * Notification Service
 * Send SMS/push notifications to drivers
 */

export interface NotificationPayload {
  type: 'ASSIGNMENT' | 'UNASSIGNMENT' | 'REMINDER';
  assignment_id?: string;
  truck_id?: number;
  role?: 'PRIMARY_DRIVER' | 'CO_DRIVER';
  start_at?: Date;
  end_at?: Date;
  reason?: string;
}

/**
 * Mock SMS Provider (for development/testing)
 */
class MockSMSProvider {
  async send(phone: string, message: string): Promise<{ success: boolean; message_id?: string }> {
    console.log(`[MOCK SMS] To: ${phone}, Message: ${message}`);
    return {
      success: true,
      message_id: `MOCK-${Date.now()}`,
    };
  }
}

/**
 * External SMS Provider (TODO: Integrate with real provider like Twilio, AWS SNS)
 */
class ExternalSMSProvider {
  private apiKey?: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.SMS_API_KEY;
    this.apiUrl = process.env.SMS_API_URL || 'https://api.smsprovider.com';
  }

  async send(phone: string, message: string): Promise<{ success: boolean; message_id?: string }> {
    if (!this.apiKey) {
      throw new Error('SMS_API_KEY not configured');
    }

    try {
      // TODO: Replace with actual API call
      // const response = await axios.post(`${this.apiUrl}/send`, {
      //   to: phone,
      //   message,
      // }, {
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //   },
      // });

      // For now, log and return mock
      console.log(`[SMS] To: ${phone}, Message: ${message}`);
      return {
        success: true,
        message_id: `SMS-${Date.now()}`,
      };
    } catch (error: any) {
      console.error('SMS send failed:', error);
      return {
        success: false,
      };
    }
  }
}

/**
 * Factory to get SMS provider
 */
function getSMSProvider() {
  const useMock = process.env.USE_MOCK_SMS === 'true' || !process.env.SMS_API_KEY;
  return useMock ? new MockSMSProvider() : new ExternalSMSProvider();
}

const smsProvider = getSMSProvider();

/**
 * Notify driver
 */
export async function notifyDriver(
  phone: string,
  payload: NotificationPayload
): Promise<void> {
  let message = '';

  switch (payload.type) {
    case 'ASSIGNMENT':
      const roleText = payload.role === 'CO_DRIVER' ? 'Co-driver' : 'Primary driver';
      const startDate = payload.start_at ? new Date(payload.start_at).toLocaleDateString() : 'soon';
      message = `You have been assigned as ${roleText} for truck ${payload.truck_id}. Start date: ${startDate}`;
      break;

    case 'UNASSIGNMENT':
      message = `Your assignment for truck ${payload.truck_id} has been ended. ${payload.reason ? `Reason: ${payload.reason}` : ''}`;
      break;

    case 'REMINDER':
      message = `Reminder: Your assignment starts ${payload.start_at ? new Date(payload.start_at).toLocaleDateString() : 'soon'}`;
      break;
  }

  if (!message) {
    return;
  }

  try {
    await smsProvider.send(phone, message);
  } catch (error) {
    console.error('Failed to send notification:', error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Notify franchise (via webhook)
 */
export async function notifyFranchise(
  franchiseId: string,
  event: string,
  data: any
): Promise<void> {
  // TODO: Implement webhook integration
  console.log(`[Franchise Notification] ${franchiseId}: ${event}`, data);
}

