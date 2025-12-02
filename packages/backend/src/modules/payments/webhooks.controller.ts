/**
 * Payment Webhooks Controller
 * Handles Razorpay webhook events
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        method: string;
        captured: boolean;
        email: string;
        contact: string;
        created_at: number;
      };
    };
  };
  created_at: number;
}

export class PaymentWebhooksController {
  /**
   * Verify Razorpay webhook signature
   */
  private verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  }

  /**
   * Handle payment success webhook
   */
  async handlePaymentSuccess(orderId: string, paymentId: string, amount: number) {
    console.log(`[Payment] Success - Order: ${orderId}, Payment: ${paymentId}, Amount: ${amount}`);

    // TODO: Implement business logic
    // 1. Update shipment payment status
    // 2. Release funds to operator
    // 3. Update ledger
    // 4. Send confirmation notifications

    // Example:
    // await db('shipments')
    //   .where({ orderId })
    //   .update({ paymentStatus: 'PAID', paymentId, paidAt: new Date() });
  }

  /**
   * Handle payment failure webhook
   */
  async handlePaymentFailure(orderId: string, reason: string) {
    console.log(`[Payment] Failed - Order: ${orderId}, Reason: ${reason}`);

    // TODO: Implement business logic
    // 1. Mark payment as failed
    // 2. Notify shipper
    // 3. Optionally retry or request new payment
  }

  /**
   * Handle payment refund webhook
   */
  async handleRefund(paymentId: string, refundId: string, amount: number) {
    console.log(`[Payment] Refund - Payment: ${paymentId}, Refund: ${refundId}, Amount: ${amount}`);

    // TODO: Implement business logic
    // 1. Update shipment status
    // 2. Credit shipper account
    // 3. Update ledger
    // 4. Send refund confirmation
  }

  /**
   * Main webhook handler
   */
  async handleWebhook(req: FastifyRequest, reply: FastifyReply) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'mock-webhook-secret';

      // Verify signature
      const isValid = this.verifyWebhookSignature(
        JSON.stringify(req.body),
        signature,
        webhookSecret
      );

      if (!isValid) {
        return reply.status(401).send({ error: 'Invalid signature' });
      }

      const payload = req.body as RazorpayWebhookPayload;

      // Handle different event types
      switch (payload.event) {
        case 'payment.captured':
          await this.handlePaymentSuccess(
            payload.payload.payment.entity.order_id,
            payload.payload.payment.entity.id,
            payload.payload.payment.entity.amount / 100 // Convert paise to rupees
          );
          break;

        case 'payment.failed':
          await this.handlePaymentFailure(
            payload.payload.payment.entity.order_id,
            'Payment failed'
          );
          break;

        case 'refund.created':
          // Handle refund
          break;

        default:
          console.log(`[Payment] Unknown event: ${payload.event}`);
      }

      return reply.status(200).send({ status: 'ok' });
    } catch (error: any) {
      console.error('[Payment Webhook Error]', error);
      return reply.status(500).send({ error: 'Webhook processing failed' });
    }
  }
}

export const paymentWebhooksController = new PaymentWebhooksController();

