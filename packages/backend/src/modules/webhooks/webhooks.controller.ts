/**
 * Webhooks Controller
 * Handles webhook endpoints from external services
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { query } from '../../db/connection';
import logger from 'pino';

const log = logger({ name: 'webhooks-controller' });

export class WebhooksController {
  /**
   * Razorpay payment webhook
   */
  async razorpay(req: FastifyRequest, reply: FastifyReply) {
    try {
      const payload = req.body as any;
      const signature = (req.headers as any)['x-razorpay-signature'];

      // In production, verify signature
      // For mock, just process the webhook
      log.info({ event: payload.event }, 'Razorpay webhook received');

      // Process payment webhook
      if (payload.event === 'payment.captured') {
        const paymentId = payload.payload?.payment?.entity?.id;
        const orderId = payload.payload?.payment?.entity?.order_id;
        const amount = payload.payload?.payment?.entity?.amount;

        // Update booking/shipment payment status
        // Store webhook event in database
        await query(
          `INSERT INTO webhook_events (provider, event_type, payload, processed_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT DO NOTHING`,
          ['razorpay', payload.event, JSON.stringify(payload)]
        );

        log.info({ paymentId, orderId, amount }, 'Payment captured webhook processed');

        return reply.code(200).send({ received: true });
      }

      // Other webhook events
      return reply.code(200).send({ received: true });
    } catch (error: any) {
      log.error({ error }, 'Webhook processing failed');
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Webhook processing failed',
      });
    }
  }
}

