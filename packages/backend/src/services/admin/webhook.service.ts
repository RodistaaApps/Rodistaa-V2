/**
 * Webhook Service - Event Subscriptions & Delivery
 * Enables partner integrations via webhooks
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { ulid } from 'ulid';
import { logger } from '../../utils/logger';
import crypto from 'crypto';

const log = logger.child({ module: 'webhook-service' });

export interface WebhookConfig {
  createdBy: string;
  label: string;
  url: string;
  secret?: string;
  events: string[];
  maxRetries?: number;
  retryDelaySeconds?: number;
}

export interface WebhookPayload {
  event: string;
  eventId: string;
  data: Record<string, any>;
  timestamp: string;
}

/**
 * Create webhook
 */
export async function createWebhook(config: WebhookConfig): Promise<string> {
  try {
    const webhookId = `WEBHOOK-${ulid()}`;
    const secret = config.secret || crypto.randomBytes(32).toString('hex');

    await query(
      `INSERT INTO webhooks
       (id, webhook_id, created_by, label, url, secret, events, 
        max_retries, retry_delay_seconds, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [
        uuid(),
        webhookId,
        config.createdBy,
        config.label,
        config.url,
        secret,
        config.events,
        config.maxRetries || 3,
        config.retryDelaySeconds || 60,
      ]
    );

    log.info({ webhookId, url: config.url, events: config.events }, 'Webhook created');

    return webhookId;
  } catch (error) {
    log.error({ error, config }, 'Failed to create webhook');
    throw error;
  }
}

/**
 * Trigger webhook delivery
 */
export async function triggerWebhook(
  event: string,
  eventId: string,
  data: Record<string, any>
): Promise<void> {
  try {
    // Find webhooks subscribed to this event
    const result = await query(
      `SELECT * FROM webhooks 
       WHERE is_active = TRUE AND $1 = ANY(events)`,
      [event]
    );

    for (const webhook of result.rows) {
      await scheduleWebhookDelivery(webhook, event, eventId, data);
    }
  } catch (error) {
    log.error({ error, event, eventId }, 'Failed to trigger webhooks');
  }
}

/**
 * Schedule webhook delivery
 */
async function scheduleWebhookDelivery(
  webhook: any,
  event: string,
  eventId: string,
  data: Record<string, any>
): Promise<void> {
  try {
    const payload: WebhookPayload = {
      event,
      eventId,
      data,
      timestamp: new Date().toISOString(),
    };

    // Create delivery record
    await query(
      `INSERT INTO webhook_deliveries
       (id, webhook_id, event_type, event_id, payload, attempt_number, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 1, 'PENDING', NOW())`,
      [uuid(), webhook.id, event, eventId, JSON.stringify(payload)]
    );

    // In production, queue this for async worker
    // For now, attempt immediate delivery
    setTimeout(() => deliverWebhook(webhook, payload), 100);
  } catch (error) {
    log.error({ error, webhook: webhook.webhook_id, event }, 'Failed to schedule webhook delivery');
  }
}

/**
 * Deliver webhook (with retry logic)
 */
async function deliverWebhook(webhook: any, payload: WebhookPayload): Promise<void> {
  const startTime = Date.now();
  
  try {
    // Create HMAC signature
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    // Mock HTTP POST (in production, use axios/fetch)
    const mockSuccess = Math.random() > 0.1; // 90% success rate

    if (mockSuccess) {
      const responseTime = Date.now() - startTime;

      // Update delivery status
      await query(
        `UPDATE webhook_deliveries
         SET status = 'SUCCESS', sent_at = NOW(), status_code = 200,
             response_time_ms = $1
         WHERE webhook_id = $2 AND event_id = $3 AND status = 'PENDING'`,
        [responseTime, webhook.id, payload.eventId]
      );

      // Update webhook stats
      await query(
        `UPDATE webhooks
         SET last_triggered_at = NOW(), total_deliveries = total_deliveries + 1
         WHERE id = $1`,
        [webhook.id]
      );

      log.info({ 
        webhook: webhook.webhook_id, 
        event: payload.event,
        responseTime
      }, 'Webhook delivered successfully');
    } else {
      throw new Error('Webhook endpoint returned error');
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Update delivery status to FAILED
    await query(
      `UPDATE webhook_deliveries
       SET status = 'FAILED', sent_at = NOW(), status_code = 500,
           error_message = $1, response_time_ms = $2
       WHERE webhook_id = $3 AND event_id = $4 AND status = 'PENDING'`,
      [
        error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        webhook.id,
        payload.eventId,
      ]
    );

    // Update webhook failure count
    await query(
      `UPDATE webhooks
       SET total_failures = total_failures + 1
       WHERE id = $1`,
      [webhook.id]
    );

    // Schedule retry if attempts < max_retries
    const deliveryResult = await query(
      `SELECT attempt_number FROM webhook_deliveries
       WHERE webhook_id = $1 AND event_id = $2`,
      [webhook.id, payload.eventId]
    );

    const attemptNumber = deliveryResult.rows[0]?.attempt_number || 1;

    if (attemptNumber < webhook.max_retries) {
      const nextRetryAt = new Date();
      nextRetryAt.setSeconds(nextRetryAt.getSeconds() + webhook.retry_delay_seconds * attemptNumber);

      await query(
        `UPDATE webhook_deliveries
         SET status = 'RETRYING', next_retry_at = $1
         WHERE webhook_id = $2 AND event_id = $3`,
        [nextRetryAt, webhook.id, payload.eventId]
      );

      log.warn({ 
        webhook: webhook.webhook_id, 
        event: payload.event,
        attempt: attemptNumber,
        nextRetry: nextRetryAt
      }, 'Webhook delivery failed, scheduled retry');
    } else {
      await query(
        `UPDATE webhook_deliveries
         SET status = 'ABANDONED'
         WHERE webhook_id = $1 AND event_id = $2`,
        [webhook.id, payload.eventId]
      );

      log.error({ 
        webhook: webhook.webhook_id, 
        event: payload.event 
      }, 'Webhook delivery abandoned after max retries');
    }
  }
}

/**
 * Replay webhook delivery (admin action)
 */
export async function replayWebhookDelivery(
  deliveryId: string,
  adminId: string
): Promise<void> {
  try {
    // Get delivery details
    const result = await query(
      `SELECT wd.*, w.url, w.secret
       FROM webhook_deliveries wd
       JOIN webhooks w ON w.id = wd.webhook_id
       WHERE wd.id = $1`,
      [deliveryId]
    );

    if (result.rows.length === 0) {
      throw new Error('Delivery not found');
    }

    const delivery = result.rows[0];
    const payload: WebhookPayload = JSON.parse(delivery.payload);

    // Log replay action
    await createAuditLog({
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'REPLAY_WEBHOOK',
      resourceType: 'WEBHOOK',
      resourceId: delivery.webhook_id,
      metadata: { deliveryId, eventId: payload.eventId },
    });

    // Trigger delivery
    await deliverWebhook(
      { 
        id: delivery.webhook_id,
        webhook_id: delivery.webhook_id,
        url: delivery.url,
        secret: delivery.secret,
        max_retries: 1,
        retry_delay_seconds: 0,
      },
      payload
    );

    log.info({ deliveryId, adminId }, 'Webhook delivery replayed');
  } catch (error) {
    log.error({ error, deliveryId }, 'Failed to replay webhook');
    throw error;
  }
}

/**
 * Get webhook delivery logs
 */
export async function getWebhookDeliveries(
  webhookId: string,
  limit: number = 50
): Promise<any[]> {
  const result = await query(
    `SELECT * FROM webhook_deliveries
     WHERE webhook_id = (SELECT id FROM webhooks WHERE webhook_id = $1)
     ORDER BY created_at DESC
     LIMIT $2`,
    [webhookId, limit]
  );

  return result.rows;
}

