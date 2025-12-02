/**
 * @rodistaa/utils - GPS Tracking Alert Service
 * 
 * Monitors GPS tracking and generates alerts:
 * - Pings every 60 seconds
 * - Alert at 30 mins without ping
 * - Route deviation alerts
 * - Speed violation alerts
 * 
 * BUSINESS RULE: Alert at 30 mins without ping.
 */

import { PrismaClient } from '@prisma/client';

export interface LocationUpdateParams {
  shipmentId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  speed?: number; // km/h
}

export interface TrackingAlertResult {
  alertGenerated: boolean;
  alertType?: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
  message?: string;
}

export class GPSTrackingAlertsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Process GPS location update and check for alerts
   * 
   * BUSINESS RULE: Pings every 60 sec, alert at 30 mins without ping
   */
  async processLocationUpdate(params: LocationUpdateParams): Promise<TrackingAlertResult> {
    const { shipmentId, latitude, longitude, timestamp, speed } = params;

    // Record location update
    await this.prisma.locationUpdate.create({
      data: {
        shipmentId,
        latitude,
        longitude,
        timestamp,
        speed: speed || null,
      },
    });

    // Check for alerts
    return this.checkTrackingAlerts(shipmentId);
  }

  /**
   * Check for tracking alerts
   * 
   * BUSINESS RULE: Alert at 30 mins without ping
   */
  async checkTrackingAlerts(shipmentId: string): Promise<TrackingAlertResult> {
    const shipment = await this.prisma.shipment.findUnique({
      where: { shipmentId },
      include: {
        locationUpdates: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!shipment) {
      throw new Error(`Shipment ${shipmentId} not found`);
    }

    // Check if shipment is in transit
    if (shipment.status !== 'IN_TRANSIT' && shipment.status !== 'PICKUP_COMPLETED') {
      return {
        alertGenerated: false,
      };
    }

    const now = new Date();
    const lastUpdate = shipment.locationUpdates[0]?.timestamp;

    if (!lastUpdate) {
      // No location updates yet - may be just starting
      return {
        alertGenerated: false,
      };
    }

    // BUSINESS RULE: Alert at 30 mins without ping
    const minutesSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);

    if (minutesSinceLastUpdate > 30) {
      // Check if alert already exists
      const existingAlert = await this.prisma.trackingAlert.findFirst({
        where: {
          shipmentId,
          alertType: 'NO_PING',
          acknowledged: false,
          createdAt: {
            gte: new Date(now.getTime() - 60 * 60 * 1000), // Last hour
          },
        },
      });

      if (!existingAlert) {
        // Create alert
        await this.prisma.trackingAlert.create({
          data: {
            shipmentId,
            alertType: 'NO_PING',
            severity: minutesSinceLastUpdate > 60 ? 'CRITICAL' : 'WARNING',
            message: `No GPS ping received for ${Math.round(minutesSinceLastUpdate)} minutes. BUSINESS RULE: Alert at 30 mins without ping.`,
            details: {
              lastUpdateTimestamp: lastUpdate,
              minutesSinceLastUpdate: Math.round(minutesSinceLastUpdate),
            },
          },
        });

        return {
          alertGenerated: true,
          alertType: 'NO_PING',
          severity: minutesSinceLastUpdate > 60 ? 'CRITICAL' : 'WARNING',
          message: `No GPS ping for ${Math.round(minutesSinceLastUpdate)} minutes`,
        };
      }
    }

    return {
      alertGenerated: false,
    };
  }

  /**
   * Check for route deviation
   */
  async checkRouteDeviation(shipmentId: string, currentLat: number, currentLng: number): Promise<TrackingAlertResult> {
    // TODO: Implement route deviation detection
    // This requires route planning and comparison logic
    
    return {
      alertGenerated: false,
    };
  }

  /**
   * Check for speed violations
   */
  async checkSpeedViolation(shipmentId: string, speed: number): Promise<TrackingAlertResult> {
    if (speed > 80) { // Example threshold - adjust as per business rules
      await this.prisma.trackingAlert.create({
        data: {
          shipmentId,
          alertType: 'SPEED_VIOLATION',
          severity: speed > 100 ? 'CRITICAL' : 'WARNING',
          message: `Speed violation detected: ${speed} km/h`,
          details: {
            speed,
            threshold: 80,
          },
        },
      });

      return {
        alertGenerated: true,
        alertType: 'SPEED_VIOLATION',
        severity: speed > 100 ? 'CRITICAL' : 'WARNING',
        message: `Speed violation: ${speed} km/h`,
      };
    }

    return {
      alertGenerated: false,
    };
  }

  /**
   * Process tracking alerts for all active shipments
   * 
   * BUSINESS RULE: Run this as a scheduled job (every minute)
   */
  async processTrackingAlerts(): Promise<{
    checked: number;
    alertsGenerated: number;
  }> {
    const activeShipments = await this.prisma.shipment.findMany({
      where: {
        status: {
          in: ['IN_TRANSIT', 'PICKUP_COMPLETED'],
        },
      },
      select: {
        shipmentId: true,
      },
    });

    let alertsGenerated = 0;

    for (const shipment of activeShipments) {
      try {
        const result = await this.checkTrackingAlerts(shipment.shipmentId);
        if (result.alertGenerated) {
          alertsGenerated++;
        }
      } catch (error) {
        console.error(`Failed to check alerts for shipment ${shipment.shipmentId}:`, error);
      }
    }

    return {
      checked: activeShipments.length,
      alertsGenerated,
    };
  }
}

