/**
 * IRP (International Road Permit) Mock Service
 * Simulates IRP API for local development
 */

import express, { Request, Response } from 'express';

const router = express.Router();

// Mock IRP data
const mockIRPs: Record<string, any> = {
  'IRP123456789': {
    irpNo: 'IRP123456789',
    regNo: 'MH-12-AB-1234',
    validityFrom: '2024-01-01',
    validityTo: '2024-12-31',
    states: ['Maharashtra', 'Gujarat', 'Rajasthan', 'Delhi'],
    isActive: true,
  },
  'IRP987654321': {
    irpNo: 'IRP987654321',
    regNo: 'GJ-01-EF-9012',
    validityFrom: '2024-06-01',
    validityTo: '2025-05-31',
    states: ['Gujarat', 'Maharashtra', 'Madhya Pradesh'],
    isActive: true,
  },
};

// Verify IRP
router.get('/verify/:irpNo', (req: Request, res: Response) => {
  const { irpNo } = req.params;
  const irp = mockIRPs[irpNo];

  if (!irp) {
    return res.status(404).json({
      success: false,
      error: 'IRP not found',
    });
  }

  const now = new Date();
  const validityTo = new Date(irp.validityTo);
  const isValid = validityTo > now && irp.isActive;

  res.json({
    success: true,
    data: {
      irpNo: irp.irpNo,
      regNo: irp.regNo,
      validityFrom: irp.validityFrom,
      validityTo: irp.validityTo,
      states: irp.states,
      isActive: irp.isActive,
      isValid,
    },
  });
});

// Get IRP details
router.get('/details/:irpNo', (req: Request, res: Response) => {
  const { irpNo } = req.params;
  const irp = mockIRPs[irpNo];

  if (!irp) {
    return res.status(404).json({
      success: false,
      error: 'IRP not found',
    });
  }

  res.json({
    success: true,
    data: irp,
  });
});

export default router;

