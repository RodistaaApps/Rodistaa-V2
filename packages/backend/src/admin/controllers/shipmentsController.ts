/**
 * Shipments Controller
 * 
 * Admin shipment management endpoints:
 * - List shipments with filters
 * - View shipment details with timeline
 * - Force close shipment
 * - Reassign operator/truck/driver
 * - Mark payment settled
 * - Create/resolve disputes
 * - Get GPS tracking data
 * - View POD documents
 */

import { Response } from 'express';
import { AdminRequest } from '../middleware/auth';
import { Pool } from 'pg';
import auditService from '../services/auditService';

const pool: Pool | null = null; // TODO: Import actual DB connection

/**
 * List shipments
 * GET /admin/shipments?status=in_transit&operator_id=OP-001
 */
export const listShipments = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 25,
      status,
      operator_id,
      from_date,
      to_date,
      has_pod,
      has_dispute,
      franchise_id,
      payment_state,
      search,
    } = req.query;

    const mockShipments = [
      {
        id: 'SHP-001',
        booking_id: 'BKG-002',
        operator_id: 'OP-001',
        operator_name: 'ABC Transport',
        truck_id: 'DL01AB1234',
        driver_id: 'DR-001',
        driver_name: 'Ramesh Kumar',
        pickup_city: 'Delhi',
        drop_city: 'Bangalore',
        distance_km: 2150,
        start_at: '2025-12-04T19:00:00Z',
        estimated_arrival: '2025-12-06T10:00:00Z',
        status: 'in_transit',
        pod_uploaded: false,
        payment_state: 'advance_paid',
        freight_amount: 87500,
        advance_paid: 40000,
        has_dispute: false,
        last_ping_at: '2025-12-05T14:30:00Z',
        created_at: '2025-12-04T19:00:00Z',
      },
    ];

    res.json({
      success: true,
      data: mockShipments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 28,
        totalPages: 2,
      },
    });
  } catch (error: any) {
    console.error('[SHIPMENTS] List failed:', error);
    res.status(500).json({ error: 'Failed to list shipments', details: error.message });
  }
};

/**
 * Get shipment detail
 * GET /admin/shipments/:shipmentId
 */
export const getShipmentDetail = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { shipmentId } = req.params;

    const mockShipment = {
      id: shipmentId,
      booking_id: 'BKG-002',
      operator_id: 'OP-001',
      operator_name: 'ABC Transport',
      truck_id: 'DL01AB1234',
      truck_reg: 'DL 01 AB 1234',
      driver_id: 'DR-001',
      driver_name: 'Ramesh Kumar',
      driver_mobile: '+919876543210',
      pickup_address: 'Industrial Area, Delhi',
      pickup_city: 'Delhi',
      drop_address: 'Tech Park, Bangalore',
      drop_city: 'Bangalore',
      distance_km: 2150,
      start_at: '2025-12-04T19:00:00Z',
      estimated_arrival: '2025-12-06T10:00:00Z',
      actual_arrival: null,
      delivered_at: null,
      status: 'in_transit',
      pod_uploaded: false,
      pod_photos: [],
      pod_pdf_url: null,
      otp_verified: false,
      freight_amount: 87500,
      advance_paid: 40000,
      balance_amount: 47500,
      payment_state: 'advance_paid',
      settlement_reference: null,
      has_dispute: false,
      last_known_lat: 15.3173,
      last_known_lng: 75.7139,
      last_ping_at: '2025-12-05T14:30:00Z',
      total_distance_traveled: 890,
      created_at: '2025-12-04T19:00:00Z',
    };

    res.json({
      success: true,
      data: mockShipment,
    });
  } catch (error: any) {
    console.error('[SHIPMENTS] Get detail failed:', error);
    res.status(500).json({ error: 'Failed to get shipment details', details: error.message });
  }
};

/**
 * Force close shipment
 * POST /admin/shipments/:shipmentId/force-close
 */
export const forceClose = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { shipmentId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.length < 20) {
      res.status(400).json({ error: 'Reason must be at least 20 characters' });
      return;
    }

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Audit log
    const txnId = await auditService.log({
      adminId: req.admin.id,
      actionType: 'FORCE_CLOSE_SHIPMENT' as any,
      resourceType: 'shipment' as any,
      resourceId: shipmentId,
      payload: { reason },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Shipment force closed',
      data: {
        shipmentId,
        status: 'closed',
        txnId,
        closedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[SHIPMENTS] Force close failed:', error);
    res.status(500).json({ error: 'Failed to force close shipment', details: error.message });
  }
};

/**
 * Mark payment settled
 * POST /admin/shipments/:shipmentId/mark-payment-settled
 */
export const markPaymentSettled = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { shipmentId } = req.params;
    const { amount, reference, reason } = req.body;

    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Audit log
    const txnId = await auditService.log({
      adminId: req.admin.id,
      actionType: 'MARK_PAYMENT_SETTLED' as any,
      resourceType: 'shipment' as any,
      resourceId: shipmentId,
      payload: { amount, reference, reason },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Payment marked as settled',
      data: {
        shipmentId,
        paymentState: 'settled',
        settlementReference: reference,
        txnId,
      },
    });
  } catch (error: any) {
    console.error('[SHIPMENTS] Mark settled failed:', error);
    res.status(500).json({ error: 'Failed to mark payment settled', details: error.message });
  }
};

/**
 * Get shipment timeline
 * GET /admin/shipments/:shipmentId/timeline
 */
export const getShipmentTimeline = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { shipmentId } = req.params;

    const mockEvents = [
      {
        id: 1,
        event_type: 'BOOKING_CONVERTED',
        actor_id: 'SYSTEM',
        actor_role: 'system',
        payload: { booking_id: 'BKG-002', bid_amount: 87500 },
        created_at: '2025-12-04T18:45:00Z',
      },
      {
        id: 2,
        event_type: 'DRIVER_STARTED_TRIP',
        actor_id: 'DR-001',
        actor_role: 'driver',
        payload: {},
        geo_lat: 28.7041,
        geo_lng: 77.1025,
        created_at: '2025-12-04T19:00:00Z',
      },
      {
        id: 3,
        event_type: 'GPS_PING',
        actor_id: 'SYSTEM',
        actor_role: 'system',
        payload: { speed: 65, battery: 85 },
        geo_lat: 27.1767,
        geo_lng: 78.0081,
        created_at: '2025-12-05T02:30:00Z',
      },
    ];

    res.json({
      success: true,
      data: mockEvents,
    });
  } catch (error: any) {
    console.error('[SHIPMENTS] Get timeline failed:', error);
    res.status(500).json({ error: 'Failed to get timeline', details: error.message });
  }
};

/**
 * Get GPS tracking data
 * GET /admin/shipments/:shipmentId/gps?from=&to=
 */
export const getGPSTracking = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { shipmentId } = req.params;
    const { from, to, limit = 100 } = req.query;

    const mockGPSPoints = [
      { lat: 28.7041, lng: 77.1025, speed: 60, timestamp: '2025-12-04T19:00:00Z' },
      { lat: 27.1767, lng: 78.0081, speed: 65, timestamp: '2025-12-05T02:30:00Z' },
      { lat: 25.5941, lng: 77.7323, speed: 70, timestamp: '2025-12-05T08:00:00Z' },
      { lat: 23.2599, lng: 77.4126, speed: 55, timestamp: '2025-12-05T12:00:00Z' },
    ];

    res.json({
      success: true,
      data: mockGPSPoints,
    });
  } catch (error: any) {
    console.error('[SHIPMENTS] Get GPS failed:', error);
    res.status(500).json({ error: 'Failed to get GPS data', details: error.message });
  }
};

export default {
  listShipments,
  getShipmentDetail,
  forceClose,
  markPaymentSettled,
  getShipmentTimeline,
  getGPSTracking,
};

