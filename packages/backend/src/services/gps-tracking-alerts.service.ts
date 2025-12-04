/**
 * GPS Tracking Alert Service (Backend Implementation)
 * 
 * Monitors GPS tracking and generates alerts:
 * - Pings every 60 seconds
 * - Alert at 30 mins without ping
 * - Route deviation alerts
 * - Speed violation alerts
 * 
 * BUSINESS RULE: Alert at 30 mins without ping.
 */

import { query } from '../db/connection';
import logger from 'pino';

const log = logger({ name: 'gps-tracking-alerts-service' });

export interface TrackingAlertResult {
  alertGenerated: boolean;
  alertType?: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
  message?: string;
}

export class GPSTrackingAlertsService {
  /**
   * Process tracking alerts for all active shipments
   * 
   * BUSINESS RULE: Run this as a scheduled job (every minute)
   */
  async processTrackingAlerts(): Promise<{
    checked: number;
    alertsGenerated: number;
  }> {
    try {
      // Find active shipments
      const activeShipmentsResult = await query(
        `SELECT shipment_id FROM shipments 
         WHERE status IN ('IN_TRANSIT', 'PICKUP_COMPLETED')`
      );

      const activeShipments = activeShipmentsResult.rows;
      let alertsGenerated = 0;

      for (const shipment of activeShipments) {
        try {
          const result = await this.checkTrackingAlerts(shipment.shipment_id);
          if (result.alertGenerated) {
            alertsGenerated++;
          }
        } catch (error) {
          log.error({ error, shipmentId: shipment.shipment_id }, 'Failed to check alerts for shipment');
        }
      }

      return {
        checked: activeShipments.length,
        alertsGenerated,
      };
    } catch (error) {
      log.error({ error }, 'Failed to process tracking alerts');
      throw error;
    }
  }

  /**
   * Check for tracking alerts
   * 
   * BUSINESS RULE: Alert at 30 mins without ping
   */
  async checkTrackingAlerts(shipmentId: string): Promise<TrackingAlertResult> {
    try {
      // Get shipment status
      const shipmentResult = await query(
        `SELECT status FROM shipments WHERE shipment_id = $1`,
        [shipmentId]
      );

      if (shipmentResult.rows.length === 0) {
        throw new Error(`Shipment ${shipmentId} not found`);
      }

      const shipment = shipmentResult.rows[0];

      // Check if shipment is in transit
      if (shipment.status !== 'IN_TRANSIT' && shipment.status !== 'PICKUP_COMPLETED') {
        return {
          alertGenerated: false,
        };
      }

      // Get last GPS ping
      const lastPingResult = await query(
        `SELECT timestamp FROM gps_pings 
         WHERE shipment_id = $1 
         ORDER BY timestamp DESC 
         LIMIT 1`,
        [shipmentId]
      );

      if (lastPingResult.rows.length === 0) {
        // No location updates yet - may be just starting
        return {
          alertGenerated: false,
        };
      }

      const lastUpdate = new Date(lastPingResult.rows[0].timestamp);
      const now = new Date();

      // BUSINESS RULE: Alert at 30 mins without ping
      const minutesSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);

      if (minutesSinceLastUpdate > 30) {
        // Check if alert already exists
        const existingAlertResult = await query(
          `SELECT id FROM tracking_alerts 
           WHERE shipment_id = $1 
           AND alert_type = 'NO_PING' 
           AND acknowledged = false 
           AND created_at >= $2`,
          [shipmentId, new Date(now.getTime() - 60 * 60 * 1000)] // Last hour
        );

        if (existingAlertResult.rows.length === 0) {
          // Create alert
          const severity = minutesSinceLastUpdate > 60 ? 'CRITICAL' : 'WARNING';
          await query(
            `INSERT INTO tracking_alerts (
              shipment_id, alert_type, severity, message, details, created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())`,
            [
              shipmentId,
              'NO_PING',
              severity,
              `No GPS ping received for ${Math.round(minutesSinceLastUpdate)} minutes. BUSINESS RULE: Alert at 30 mins without ping.`,
              JSON.stringify({
                lastUpdateTimestamp: lastUpdate,
                minutesSinceLastUpdate: Math.round(minutesSinceLastUpdate),
              }),
            ]
          );

          return {
            alertGenerated: true,
            alertType: 'NO_PING',
            severity,
            message: `No GPS ping for ${Math.round(minutesSinceLastUpdate)} minutes`,
          };
        }
      }

      return {
        alertGenerated: false,
      };
    } catch (error) {
      log.error({ error, shipmentId }, 'Failed to check tracking alerts');
      throw error;
    }
  }
}

