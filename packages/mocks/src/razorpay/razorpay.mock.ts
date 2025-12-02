/**
 * Razorpay Mock Service
 * Simulates Razorpay payment gateway for local development
 */

import express, { Request, Response } from 'express';

const router = express.Router();

// Mock payment methods
const mockPaymentMethods = {
  card: true,
  netbanking: true,
  wallet: true,
  upi: true,
};

// Mock payment statuses
type PaymentStatus = 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';

interface MockPayment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string;
  created_at: number;
}

const payments: Map<string, MockPayment> = new Map();

// Create payment
router.post('/payments', (req: Request, res: Response) => {
  const { amount, currency = 'INR', method = 'card' } = req.body;

  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const payment: MockPayment = {
    id: paymentId,
    amount: amount * 100, // Convert to paise
    currency,
    status: 'created',
    method,
    created_at: Math.floor(Date.now() / 1000),
  };

  payments.set(paymentId, payment);

  res.json({
    id: payment.id,
    entity: 'payment',
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    method: payment.method,
    created_at: payment.created_at,
  });
});

// Get payment status
router.get('/payments/:paymentId', (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const payment = payments.get(paymentId);

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  // Simulate payment processing
  if (payment.status === 'created') {
    payment.status = 'authorized';
    setTimeout(() => {
      payment.status = 'captured';
    }, 2000);
  }

  res.json({
    id: payment.id,
    entity: 'payment',
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    method: payment.method,
    created_at: payment.created_at,
  });
});

// Capture payment
router.post('/payments/:paymentId/capture', (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const payment = payments.get(paymentId);

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  if (payment.status !== 'authorized') {
    return res.status(400).json({ error: 'Payment must be authorized to capture' });
  }

  payment.status = 'captured';
  
  res.json({
    id: payment.id,
    entity: 'payment',
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    method: payment.method,
    created_at: payment.created_at,
  });
});

// Refund payment
router.post('/payments/:paymentId/refund', (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const payment = payments.get(paymentId);

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  if (payment.status !== 'captured') {
    return res.status(400).json({ error: 'Only captured payments can be refunded' });
  }

  payment.status = 'refunded';
  
  const refundId = `rfnd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  res.json({
    id: refundId,
    entity: 'refund',
    amount: payment.amount,
    currency: payment.currency,
    payment_id: payment.id,
    status: 'processed',
    created_at: Math.floor(Date.now() / 1000),
  });
});

export default router;

