/**
 * Tracking Controller
 * REST APIs for GPS tracking, geofencing, and route management
 */

import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../auth/auth.middleware';
import * as gpsService from '../../services/tracking/gps.service';
import * as geofencingService from '../../services/tracking/geofencing.service';
import * as etaService from '../../services/tracking/eta.service';
import { logger } from '../../utils/logger';

const log = logger.child({ module: 'tracking-controller' });
const router = Router();

// ============================================================================
// GPS TRACKING ENDPOINTS
// ============================================================================

/**
 * POST /api/v1/tracking/session/start
 * Start tracking session (when driver starts trip)
 */
router.post('/session/start', authMiddleware, requireRole(['DRIVER']), async (req: Request, res: Response) => {
  try {
    const { shipmentId, truckId } = req.body;
    const driverId = req.user!.id;

    const session = await gpsService.startTrackingSession(shipmentId, driverId, truckId);

    res.json({
      success: true,
      message: 'Tracking session started',
      data: session,
    });
  } catch (error: any) {
    log.error({ error, userId: req.user?.id }, 'Failed to start tracking');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start tracking session',
    });
  }
});

/**
 * POST /api/v1/tracking/location
 * Record location point (called every 60 seconds from Driver app)
 */
router.post('/location', authMiddleware, requireRole(['DRIVER']), async (req: Request, res: Response) => {
  try {
    const { shipmentId, latitude, longitude, accuracy, altitude, speed, bearing, recordedAt, metadata } = req.body;
    const driverId = req.user!.id;

    // Validate coordinates
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const point = await gpsService.recordLocationPoint(
      shipmentId,
      driverId,
      {
        latitude,
        longitude,
        accuracy,
        altitude,
        speed,
        bearing,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
      },
      metadata
    );

    // Process geofence events
    const geofenceEvents = await geofencingService.processGeofenceEvents(
      shipmentId,
      driverId,
      latitude,
      longitude,
      point.id
    );

    res.json({
      success: true,
      message: 'Location recorded',
      data: {
        point,
        geofenceEvents,
      },
    });
  } catch (error: any) {
    log.error({ error, userId: req.user?.id }, 'Failed to record location');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to record location',
    });
  }
});

/**
 * POST /api/v1/tracking/session/pause
 * Pause tracking (driver break)
 */
router.post('/session/pause', authMiddleware, requireRole(['DRIVER']), async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    await gpsService.pauseTracking(sessionId);

    res.json({
      success: true,
      message: 'Tracking paused',
    });
  } catch (error: any) {
    log.error({ error }, 'Failed to pause tracking');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to pause tracking',
    });
  }
});

/**
 * POST /api/v1/tracking/session/resume
 * Resume tracking
 */
router.post('/session/resume', authMiddleware, requireRole(['DRIVER']), async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    await gpsService.resumeTracking(sessionId);

    res.json({
      success: true,
      message: 'Tracking resumed',
    });
  } catch (error: any) {
    log.error({ error }, 'Failed to resume tracking');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resume tracking',
    });
  }
});

/**
 * POST /api/v1/tracking/session/stop
 * Stop tracking (trip completed)
 */
router.post('/session/stop', authMiddleware, requireRole(['DRIVER']), async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    await gpsService.stopTrackingSession(sessionId);

    res.json({
      success: true,
      message: 'Tracking stopped and route history generated',
    });
  } catch (error: any) {
    log.error({ error }, 'Failed to stop tracking');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to stop tracking',
    });
  }
});

/**
 * GET /api/v1/tracking/shipment/:shipmentId/location
 * Get latest location for shipment (Shipper/Operator view)
 */
router.get('/shipment/:shipmentId/location', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { shipmentId } = req.params;
    const location = await gpsService.getLatestLocation(shipmentId);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'No location data available for this shipment',
      });
    }

    res.json({
      success: true,
      data: location,
    });
  } catch (error: any) {
    log.error({ error, shipmentId: req.params.shipmentId }, 'Failed to get location');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve location',
    });
  }
});

/**
 * GET /api/v1/tracking/shipment/:shipmentId/route
 * Get route history for shipment
 */
router.get('/shipment/:shipmentId/route', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { shipmentId } = req.params;
    const limit = parseInt(req.query.limit as string) || 1000;
    
    const points = await gpsService.getRoutePoints(shipmentId, undefined, undefined, limit);

    res.json({
      success: true,
      data: {
        shipmentId,
        points,
        totalPoints: points.length,
      },
    });
  } catch (error: any) {
    log.error({ error, shipmentId: req.params.shipmentId }, 'Failed to get route');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve route',
    });
  }
});

/**
 * GET /api/v1/tracking/shipment/:shipmentId/eta
 * Get current ETA for shipment
 */
router.get('/shipment/:shipmentId/eta', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { shipmentId } = req.params;
    const eta = await etaService.getLatestETA(shipmentId);

    if (!eta) {
      return res.status(404).json({
        success: false,
        message: 'No ETA calculation available',
      });
    }

    res.json({
      success: true,
      data: eta,
    });
  } catch (error: any) {
    log.error({ error, shipmentId: req.params.shipmentId }, 'Failed to get ETA');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve ETA',
    });
  }
});

/**
 * GET /api/v1/tracking/active-sessions
 * Get all active tracking sessions (Admin)
 */
router.get('/active-sessions', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const sessions = await gpsService.getActiveTrackingSessions();

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error: any) {
    log.error({ error }, 'Failed to get active sessions');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve active sessions',
    });
  }
});

// ============================================================================
// GEOFENCING ENDPOINTS
// ============================================================================

/**
 * POST /api/v1/tracking/geofence/create
 * Create geofence (Admin)
 */
router.post('/geofence/create', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { name, type, centerLatitude, centerLongitude, radiusMeters, options } = req.body;

    const geofence = await geofencingService.createGeofence(
      name,
      type,
      centerLatitude,
      centerLongitude,
      radiusMeters,
      options
    );

    res.json({
      success: true,
      message: 'Geofence created',
      data: geofence,
    });
  } catch (error: any) {
    log.error({ error }, 'Failed to create geofence');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create geofence',
    });
  }
});

/**
 * GET /api/v1/tracking/shipment/:shipmentId/geofence-events
 * Get geofence events for shipment
 */
router.get('/shipment/:shipmentId/geofence-events', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { shipmentId } = req.params;
    const events = await geofencingService.getGeofenceEvents(shipmentId);

    res.json({
      success: true,
      data: events,
    });
  } catch (error: any) {
    log.error({ error, shipmentId: req.params.shipmentId }, 'Failed to get geofence events');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve geofence events',
    });
  }
});

export default router;

