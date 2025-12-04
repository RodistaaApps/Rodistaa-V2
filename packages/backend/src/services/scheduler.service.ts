/**
 * Scheduler Service
 * Handles periodic tasks and scheduled jobs
 * 
 * BUSINESS RULES:
 * - GPS tracking alerts check every minute
 * - Auto-finalization check every hour
 * - Document expiry check daily
 * - Inspection reminders daily
 */

import logger from 'pino';
import { GPSTrackingAlertsService } from './gps-tracking-alerts.service';
import { query } from '../db/connection';

const log = logger({ name: 'scheduler-service' });

export class SchedulerService {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private gpsAlertsService: GPSTrackingAlertsService;

  constructor() {
    this.gpsAlertsService = new GPSTrackingAlertsService();
  }

  /**
   * Start all scheduled jobs
   */
  start(): void {
    log.info('Starting scheduler service...');

    // GPS Tracking Alerts - Every minute
    // BUSINESS RULE: Check for missing GPS pings (30-minute threshold)
    const gpsAlertsInterval = setInterval(async () => {
      try {
        const result = await this.gpsAlertsService.processTrackingAlerts();
        if (result.alertsGenerated > 0) {
          log.warn({ 
            checked: result.checked, 
            alertsGenerated: result.alertsGenerated 
          }, 'GPS tracking alerts generated');
        }
      } catch (error) {
        log.error({ error }, 'GPS tracking alerts job failed');
      }
    }, 60 * 1000); // Every minute

    this.intervals.set('gps-alerts', gpsAlertsInterval);
    log.info('GPS tracking alerts job started (every minute)');

    // Auto-finalization check - Every hour
    // BUSINESS RULE: Auto-finalize lowest bid if shipper inactive 24 hours
    const autoFinalizationInterval = setInterval(async () => {
      try {
        await this.checkAutoFinalization();
      } catch (error) {
        log.error({ error }, 'Auto-finalization job failed');
      }
    }, 60 * 60 * 1000); // Every hour

    this.intervals.set('auto-finalization', autoFinalizationInterval);
    log.info('Auto-finalization job started (every hour)');

    // Document expiry check - Daily at midnight
    // BUSINESS RULE: Auto-block trucks with expired documents
    const documentExpiryInterval = setInterval(async () => {
      try {
        await this.checkDocumentExpiry();
      } catch (error) {
        log.error({ error }, 'Document expiry check job failed');
      }
    }, 24 * 60 * 60 * 1000); // Every 24 hours

    this.intervals.set('document-expiry', documentExpiryInterval);
    log.info('Document expiry check job started (daily)');

    // Inspection reminders - Daily
    // BUSINESS RULE: Send reminders 30 days, 7 days, 5 days before inspection due
    const inspectionRemindersInterval = setInterval(async () => {
      try {
        await this.sendInspectionReminders();
      } catch (error) {
        log.error({ error }, 'Inspection reminders job failed');
      }
    }, 24 * 60 * 60 * 1000); // Every 24 hours

    this.intervals.set('inspection-reminders', inspectionRemindersInterval);
    log.info('Inspection reminders job started (daily)');

    log.info('All scheduled jobs started');
  }

  /**
   * Stop all scheduled jobs
   */
  stop(): void {
    log.info('Stopping scheduler service...');
    for (const [name, interval] of this.intervals.entries()) {
      clearInterval(interval);
      log.info(`Stopped job: ${name}`);
    }
    this.intervals.clear();
    log.info('All scheduled jobs stopped');
  }

  /**
   * Check for bookings that need auto-finalization
   * BUSINESS RULE: Auto-finalize lowest bid if shipper inactive 24 hours
   */
  private async checkAutoFinalization(): Promise<void> {
    try {
      // Find bookings in NEGOTIATION status with bids (24 hours inactive)
      const bookingsResult = await query(
        `SELECT b.booking_id, b.shipper_id, b.updated_at
         FROM bookings b
         WHERE b.status = 'NEGOTIATION'
         AND b.updated_at <= NOW() - INTERVAL '24 hours'`
      );

      for (const booking of bookingsResult.rows) {
        // Get pending bids for this booking
        const bidsResult = await query(
          `SELECT bid_id, operator_id, amount 
           FROM bids 
           WHERE booking_id = $1 AND status = 'PENDING' 
           ORDER BY amount ASC`,
          [booking.booking_id]
        );

        if (bidsResult.rows.length > 0) {
          try {
            // Use the auto-finalization service (it uses Prisma, but we'll need to adapt)
            // For now, log that auto-finalization should be triggered
            log.info({ 
              bookingId: booking.booking_id,
              bidsCount: bidsResult.rows.length 
            }, 'Booking eligible for auto-finalization');
            
            // TODO: Integrate with auto-finalization service using database adapter
            // This requires refactoring auto-finalization to use query() instead of Prisma
          } catch (error) {
            log.error({ error, bookingId: booking.booking_id }, 'Auto-finalization failed');
          }
        }
      }
    } catch (error) {
      log.error({ error }, 'Auto-finalization check failed');
    }
  }

  /**
   * Check for expired documents and auto-block trucks
   * BUSINESS RULE: Auto-block trucks with expired documents
   */
  private async checkDocumentExpiry(): Promise<void> {
    try {
      // Find trucks with expired documents
      const expiredTrucksResult = await query(
        `SELECT id FROM trucks 
         WHERE status != 'BLOCKED'
         AND (
           rc_expiry <= NOW() OR
           fitness_expiry <= NOW() OR
           insurance_expiry <= NOW() OR
           permit_expiry <= NOW() OR
           pollution_expiry <= NOW()
         )`
      );

      for (const truck of expiredTrucksResult.rows) {
        try {
          await query(
            `UPDATE trucks 
             SET status = 'BLOCKED', 
                 blocked_reason = $1, 
                 blocked_at = NOW() 
             WHERE id = $2`,
            [
              'Document expired - BUSINESS RULE: Auto-block on document expiry',
              truck.id,
            ]
          );
          log.warn({ truckId: truck.id }, 'Truck auto-blocked due to expired documents');
        } catch (error) {
          log.error({ error, truckId: truck.id }, 'Failed to block truck');
        }
      }
    } catch (error) {
      log.error({ error }, 'Document expiry check failed');
    }
  }

  /**
   * Send inspection reminders
   * BUSINESS RULE: Reminders at 30 days, 7 days, 5 days before inspection due
   */
  private async sendInspectionReminders(): Promise<void> {
    try {
      // Get trucks with upcoming inspections
      const upcomingInspectionsResult = await query(
        `SELECT id, next_inspection_due, operator_id 
         FROM trucks 
         WHERE next_inspection_due IS NOT NULL 
         AND next_inspection_due > NOW() 
         AND status != 'BLOCKED'`
      );

      const now = new Date();

      for (const truck of upcomingInspectionsResult.rows) {
        const nextInspectionDue = new Date(truck.next_inspection_due);
        const daysUntilDue = Math.floor(
          (nextInspectionDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Send reminder if 30, 7, or 5 days before due
        if (daysUntilDue === 30 || daysUntilDue === 7 || daysUntilDue === 5) {
          try {
            // TODO: Send in-app notification to operator
            log.info({ 
              truckId: truck.id,
              operatorId: truck.operator_id,
              daysUntilDue 
            }, `Inspection reminder: ${daysUntilDue} days until due`);
          } catch (error) {
            log.error({ error, truckId: truck.id }, 'Failed to send inspection reminder');
          }
        }
      }
    } catch (error) {
      log.error({ error }, 'Inspection reminders check failed');
    }
  }
}

