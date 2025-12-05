/**
 * Notification Service
 * 
 * Handles in-app notifications, email alerts, and webhook dispatching.
 * Supports:
 * - In-app notifications (stored in admin_notifications table)
 * - Slack webhooks for critical alerts
 * - Email notifications
 * - Real-time updates via WebSocket/SSE
 * 
 * Usage:
 *   await notificationService.notify({
 *     type: 'SLA_BREACH',
 *     severity: 'critical',
 *     title: 'Ticket SLA Breached',
 *     message: 'Ticket #123 has exceeded SLA',
 *     targetAdminId: 'ADM-001',
 *     actionUrl: '/admin/tickets/123'
 *   });
 */

import { Pool } from 'pg';
import axios from 'axios';

// TODO: Import actual DB connection
const pool: Pool | null = null; // Stub for now

export interface Notification {
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message?: string;
  payload?: Record<string, any>;
  targetAdminId?: string; // null = broadcast to all
  actionUrl?: string;
  expiresAt?: Date;
}

export enum NotificationType {
  SLA_BREACH = 'SLA_BREACH',
  PROVIDER_OUTAGE = 'PROVIDER_OUTAGE',
  DUPLICATE_CHASSIS = 'DUPLICATE_CHASSIS',
  BLOCKING_EVENT = 'BLOCKING_EVENT',
  VERIFICATION_FAILURE = 'VERIFICATION_FAILURE',
  TICKET_ASSIGNED = 'TICKET_ASSIGNED',
  TICKET_RESOLVED = 'TICKET_RESOLVED',
  BULK_ACTION_COMPLETE = 'BULK_ACTION_COMPLETE',
  EXPORT_READY = 'EXPORT_READY',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

export enum NotificationSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Create in-app notification
 */
export const notify = async (notification: Notification): Promise<number> => {
  try {
    if (!pool) {
      console.log('[NOTIFICATION - STUB]', notification);
      return 0;
    }

    const query = `
      INSERT INTO admin_notifications (
        type,
        severity,
        title,
        message,
        payload,
        target_admin_id,
        action_url,
        expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const values = [
      notification.type,
      notification.severity,
      notification.title,
      notification.message || null,
      JSON.stringify(notification.payload || {}),
      notification.targetAdminId || null,
      notification.actionUrl || null,
      notification.expiresAt || null,
    ];

    const result = await pool.query(query, values);
    const notificationId = result.rows[0].id;

    // Send webhook for critical alerts
    if (notification.severity === NotificationSeverity.CRITICAL) {
      await sendSlackAlert(notification);
    }

    // TODO: Send real-time update via WebSocket/SSE
    // broadcastToClients(notification);

    return notificationId;
  } catch (error: any) {
    console.error('[NOTIFICATION SERVICE] Failed to create notification:', error);
    return 0;
  }
};

/**
 * Send Slack webhook alert
 */
export const sendSlackAlert = async (notification: Notification): Promise<void> => {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!slackWebhookUrl) {
    console.warn('[NOTIFICATION SERVICE] Slack webhook URL not configured');
    return;
  }

  try {
    const color = {
      [NotificationSeverity.INFO]: '#36a64f',
      [NotificationSeverity.WARNING]: '#ff9900',
      [NotificationSeverity.ERROR]: '#ff0000',
      [NotificationSeverity.CRITICAL]: '#8b0000',
    }[notification.severity];

    const slackMessage = {
      text: `🚨 ${notification.title}`,
      attachments: [
        {
          color,
          title: notification.title,
          text: notification.message,
          fields: [
            {
              title: 'Type',
              value: notification.type,
              short: true,
            },
            {
              title: 'Severity',
              value: notification.severity.toUpperCase(),
              short: true,
            },
            ...(notification.actionUrl
              ? [
                  {
                    title: 'Action',
                    value: `<${notification.actionUrl}|View Details>`,
                    short: false,
                  },
                ]
              : []),
          ],
          footer: 'Rodistaa Admin Portal',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await axios.post(slackWebhookUrl, slackMessage);
  } catch (error: any) {
    console.error('[NOTIFICATION SERVICE] Failed to send Slack alert:', error.message);
  }
};

/**
 * Send email notification
 */
export const sendEmail = async (
  to: string,
  subject: string,
  body: string,
  html?: string
): Promise<void> => {
  // TODO: Implement email sending via SendGrid/SES
  console.log('[EMAIL - STUB]', { to, subject, body });
};

/**
 * Get unread notifications for admin
 */
export const getUnread = async (adminId: string): Promise<any[]> => {
  try {
    if (!pool) {
      return [];
    }

    const query = `
      SELECT *
      FROM admin_notifications
      WHERE (target_admin_id = $1 OR target_admin_id IS NULL)
        AND read = FALSE
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const result = await pool.query(query, [adminId]);
    return result.rows;
  } catch (error: any) {
    console.error('[NOTIFICATION SERVICE] Failed to get unread:', error);
    return [];
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId: number, adminId: string): Promise<void> => {
  try {
    if (!pool) {
      return;
    }

    const query = `
      UPDATE admin_notifications
      SET read = TRUE, read_at = NOW()
      WHERE id = $1 
        AND (target_admin_id = $2 OR target_admin_id IS NULL)
    `;

    await pool.query(query, [notificationId, adminId]);
  } catch (error: any) {
    console.error('[NOTIFICATION SERVICE] Failed to mark as read:', error);
  }
};

/**
 * Mark all notifications as read for admin
 */
export const markAllAsRead = async (adminId: string): Promise<number> => {
  try {
    if (!pool) {
      return 0;
    }

    const query = `
      UPDATE admin_notifications
      SET read = TRUE, read_at = NOW()
      WHERE (target_admin_id = $1 OR target_admin_id IS NULL)
        AND read = FALSE
    `;

    const result = await pool.query(query, [adminId]);
    return result.rowCount || 0;
  } catch (error: any) {
    console.error('[NOTIFICATION SERVICE] Failed to mark all as read:', error);
    return 0;
  }
};

/**
 * Dispatch webhook event
 */
export const dispatchWebhook = async (
  eventType: string,
  payload: Record<string, any>
): Promise<void> => {
  try {
    if (!pool) {
      console.log('[WEBHOOK DISPATCH - STUB]', { eventType, payload });
      return;
    }

    // Get active webhook subscriptions for this event type
    const query = `
      SELECT endpoint_url, secret
      FROM webhook_subscriptions
      WHERE event_type = $1 AND is_active = TRUE
    `;

    const result = await pool.query(query, [eventType]);

    // Dispatch to all subscribers (async, don't await)
    result.rows.forEach(async (sub) => {
      try {
        const signature = generateWebhookSignature(payload, sub.secret);

        await axios.post(
          sub.endpoint_url,
          {
            event: eventType,
            timestamp: new Date().toISOString(),
            data: payload,
          },
          {
            headers: {
              'X-Rodistaa-Signature': signature,
              'Content-Type': 'application/json',
            },
            timeout: 5000,
          }
        );

        // Update last_success_at
        await pool.query(
          'UPDATE webhook_subscriptions SET last_success_at = NOW(), retry_count = 0 WHERE endpoint_url = $1',
          [sub.endpoint_url]
        );
      } catch (error: any) {
        console.error(`[WEBHOOK] Failed to dispatch to ${sub.endpoint_url}:`, error.message);

        // Update last_failure_at and retry_count
        await pool.query(
          'UPDATE webhook_subscriptions SET last_failure_at = NOW(), retry_count = retry_count + 1 WHERE endpoint_url = $1',
          [sub.endpoint_url]
        );
      }
    });
  } catch (error: any) {
    console.error('[NOTIFICATION SERVICE] Failed to dispatch webhook:', error);
  }
};

/**
 * Generate HMAC signature for webhook
 */
const generateWebhookSignature = (payload: Record<string, any>, secret: string): string => {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
};

/**
 * Notify about SLA breach
 */
export const notifySLABreach = async (ticketId: string, dueAt: Date): Promise<void> => {
  await notify({
    type: NotificationType.SLA_BREACH,
    severity: NotificationSeverity.CRITICAL,
    title: 'Ticket SLA Breached',
    message: `Ticket ${ticketId} exceeded SLA (due ${dueAt.toISOString()})`,
    actionUrl: `/admin/fleet/tickets?id=${ticketId}`,
    payload: { ticketId, dueAt },
  });

  await sendSlackAlert({
    type: NotificationType.SLA_BREACH,
    severity: NotificationSeverity.CRITICAL,
    title: `🚨 SLA BREACH: Ticket ${ticketId}`,
    message: `Ticket exceeded SLA deadline. Immediate action required.`,
    actionUrl: `${process.env.ADMIN_BASE_URL}/admin/fleet/tickets?id=${ticketId}`,
  });
};

/**
 * Notify about duplicate chassis detection
 */
export const notifyDuplicateChassis = async (
  chassisHash: string,
  rcNumbers: string[]
): Promise<void> => {
  await notify({
    type: NotificationType.DUPLICATE_CHASSIS,
    severity: NotificationSeverity.ERROR,
    title: 'Duplicate Chassis Detected',
    message: `Chassis hash ${chassisHash} found in ${rcNumbers.length} vehicles`,
    actionUrl: `/admin/fleet/trucks?chassis=${chassisHash}`,
    payload: { chassisHash, rcNumbers },
  });
};

/**
 * Notify about provider outage
 */
export const notifyProviderOutage = async (
  provider: string,
  errorRate: number
): Promise<void> => {
  await notify({
    type: NotificationType.PROVIDER_OUTAGE,
    severity: NotificationSeverity.CRITICAL,
    title: `Provider Outage: ${provider}`,
    message: `${provider} error rate: ${errorRate}%. Verification may be delayed.`,
    actionUrl: '/admin/fleet/analytics',
    payload: { provider, errorRate },
  });

  await sendSlackAlert({
    type: NotificationType.PROVIDER_OUTAGE,
    severity: NotificationSeverity.CRITICAL,
    title: `⚠️ PROVIDER OUTAGE: ${provider}`,
    message: `Error rate at ${errorRate}%. Immediate attention required.`,
  });
};

/**
 * Notify about bulk action completion
 */
export const notifyBulkActionComplete = async (
  adminId: string,
  action: string,
  totalCount: number,
  successCount: number,
  failureCount: number
): Promise<void> => {
  await notify({
    type: NotificationType.BULK_ACTION_COMPLETE,
    severity: failureCount > 0 ? NotificationSeverity.WARNING : NotificationSeverity.INFO,
    title: `Bulk Action Complete: ${action}`,
    message: `${successCount}/${totalCount} succeeded, ${failureCount} failed`,
    targetAdminId: adminId,
    payload: { action, totalCount, successCount, failureCount },
  });
};

/**
 * Notify about export ready for download
 */
export const notifyExportReady = async (
  adminId: string,
  exportId: string,
  filename: string
): Promise<void> => {
  await notify({
    type: NotificationType.EXPORT_READY,
    severity: NotificationSeverity.INFO,
    title: 'Export Ready',
    message: `Your export "${filename}" is ready for download`,
    targetAdminId: adminId,
    actionUrl: `/admin/exports/${exportId}`,
    payload: { exportId, filename },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });
};

/**
 * Cleanup expired notifications (cron job)
 */
export const cleanupExpired = async (): Promise<number> => {
  try {
    if (!pool) {
      return 0;
    }

    const query = `
      DELETE FROM admin_notifications
      WHERE expires_at IS NOT NULL AND expires_at < NOW()
    `;

    const result = await pool.query(query);
    return result.rowCount || 0;
  } catch (error: any) {
    console.error('[NOTIFICATION SERVICE] Failed to cleanup expired:', error);
    return 0;
  }
};

export default {
  notify,
  sendSlackAlert,
  sendEmail,
  getUnread,
  markAsRead,
  markAllAsRead,
  dispatchWebhook,
  notifySLABreach,
  notifyDuplicateChassis,
  notifyProviderOutage,
  notifyBulkActionComplete,
  notifyExportReady,
  cleanupExpired,
  NotificationType,
  NotificationSeverity,
};

