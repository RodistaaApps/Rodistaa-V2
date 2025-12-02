/**
 * SIP (Session Initiation Protocol) / Calling Mock Service
 * Simulates telephony/calling API for local development
 */

import express, { Request, Response } from 'express';

const router = express.Router();

// Mock call sessions
const activeCalls: Map<string, any> = new Map();

// Initiate call
router.post('/call/initiate', (req: Request, res: Response) => {
  const { from, to, callType = 'voice' } = req.body;

  if (!from || !to) {
    return res.status(400).json({
      success: false,
      error: 'from and to parameters required',
    });
  }

  const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const call = {
    callId,
    from: from.replace(/\d(?=\d{4})/g, 'x'), // Mask phone number
    to: to.replace(/\d(?=\d{4})/g, 'x'),
    callType,
    status: 'ringing',
    startedAt: new Date().toISOString(),
  };

  activeCalls.set(callId, call);

  // Simulate call status updates
  setTimeout(() => {
    const activeCall = activeCalls.get(callId);
    if (activeCall) {
      activeCall.status = 'connected';
    }
  }, 2000);

  res.json({
    success: true,
    data: call,
  });
});

// Get call status
router.get('/call/:callId/status', (req: Request, res: Response) => {
  const { callId } = req.params;
  const call = activeCalls.get(callId);

  if (!call) {
    return res.status(404).json({
      success: false,
      error: 'Call not found',
    });
  }

  res.json({
    success: true,
    data: call,
  });
});

// End call
router.post('/call/:callId/end', (req: Request, res: Response) => {
  const { callId } = req.params;
  const call = activeCalls.get(callId);

  if (!call) {
    return res.status(404).json({
      success: false,
      error: 'Call not found',
    });
  }

  call.status = 'ended';
  call.endedAt = new Date().toISOString();
  const duration = new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime();
  call.durationSeconds = Math.floor(duration / 1000);

  activeCalls.delete(callId);

  res.json({
    success: true,
    data: call,
  });
});

// Send OTP via SMS (mock)
router.post('/sms/send', (req: Request, res: Response) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({
      success: false,
      error: 'to and message required',
    });
  }

  const messageId = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  res.json({
    success: true,
    data: {
      messageId,
      to: to.replace(/\d(?=\d{4})/g, 'x'),
      status: 'sent',
      sentAt: new Date().toISOString(),
    },
  });
});

export default router;

