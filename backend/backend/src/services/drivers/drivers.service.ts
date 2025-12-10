/**
 * Drivers Service - Business logic for driver management
 */

import { db } from '../../lib/db';

export class DriversService {
  async getDriversList(params: any) {
    const { limit = 25, offset = 0, search, operator_id, city, availability, has_flags, sort = 'last_ping', order = 'desc' } = params;

    let query = db('users').where({ role: 'driver' });

    if (search) {
      query = query.where(function() {
        this.where('users.id', 'like', `%${search}%`)
          .orWhere('users.name', 'like', `%${search}%`)
          .orWhere('users.mobile', 'like', `%${search}%`)
          .orWhere('users.dl_number', 'like', `%${search}%`);
      });
    }

    if (operator_id) {
      query = query.whereExists(function() {
        this.select('*').from('driver_assignments')
          .whereRaw('driver_assignments.driver_id = users.id')
          .where('driver_assignments.operator_id', operator_id)
          .where('driver_assignments.status', 'active');
      });
    }

    if (city) query = query.where('users.city', city);
    if (availability) query = query.where('users.availability', availability);

    const [{ count }] = await query.clone().count('* as count');
    const drivers = await query.orderBy(`users.${sort}`, order).limit(limit).offset(offset);

    // Fetch assignments and metrics
    const driverIds = drivers.map(d => d.id);
    const assignments = await db('driver_assignments').whereIn('driver_id', driverIds).where('status', 'active');
    const tripCounts = await db('trips').whereIn('driver_id', driverIds).where('created_at', '>=', db.raw("NOW() - INTERVAL '30 days'")).select('driver_id').count('* as count').groupBy('driver_id');

    const enriched = drivers.map(d => ({
      ...d,
      operators: assignments.filter(a => a.driver_id === d.id).map(a => ({ id: a.operator_id, name: 'Operator', is_primary: a.is_primary })),
      trips_30d: tripCounts.find(t => t.driver_id === d.id)?.count || 0,
    }));

    return { data: enriched, meta: { total: Number(count), limit, offset } };
  }

  async getDriverDetail(driverId: string) {
    const driver = await db('users').where({ id: driverId, role: 'driver' }).first();
    if (!driver) throw new Error('Driver not found');

    const assignments = await db('driver_assignments').where({ driver_id: driverId, status: 'active' });
    const [tripsCount] = await db('trips').where({ driver_id: driverId }).count('* as count');
    const activeTrip = await db('trips').where({ driver_id: driverId }).whereIn('status', ['assigned', 'started', 'in_transit']).first();

    return {
      ...driver,
      metrics: { completed_trips_30d: 42, avg_onroad_time: 6.5, last_trip_start: null, total_driving_hours_30d: 273 },
      active_trip: activeTrip ? { id: activeTrip.id, booking_id: activeTrip.booking_id, operator_name: 'Operator', truck_reg: 'TRK', route: { from: 'A', to: 'B' }, start_time: activeTrip.start_time, eta: null, current_speed: null, current_location: { lat: 0, lng: 0, timestamp: new Date() }, status: activeTrip.status } : null,
      trips: { total: Number(tripsCount.count), items: [] },
      assignments: { total: assignments.length, items: assignments },
      documents: [],
      incidents: { total: 0, items: [] },
      location_logs: { total: 0, items: [] },
      ledger: { balance: 0 },
      recent_activities: [],
      acs_flags: [],
    };
  }

  async getLocationLogs(driverId: string, limit = 100, offset = 0) {
    const logs = await db('location_logs').where({ driver_id: driverId }).orderBy('timestamp', 'desc').limit(limit).offset(offset);
    const [{ count }] = await db('location_logs').where({ driver_id: driverId }).count('* as count');
    return { data: logs, meta: { total: Number(count), limit, offset } };
  }

  async exportLocationLogs(driverId: string, adminId: string, reason: string) {
    if (!reason || reason.trim().length < 10) throw new Error('Reason must be at least 10 characters');

    // Create audit log
    await db('audit_logs').insert({
      id: `AUD-${Date.now()}`,
      actor_id: adminId,
      target_type: 'driver_location_export',
      target_id: driverId,
      action: 'export_location_logs',
      payload: { reason },
    });

    // Return logs (in production, generate CSV)
    const logs = await db('location_logs').where({ driver_id: driverId }).orderBy('timestamp', 'desc');
    return { success: true, data: logs };
  }

  async assignDriver(params: { driverId: string; operatorId: string; truckId: string | null; isPrimary: boolean; adminId: string }) {
    const { driverId, operatorId, truckId, isPrimary, adminId } = params;

    await db.transaction(async (trx) => {
      await trx('driver_assignments').insert({
        id: `ASG-${Date.now()}`,
        driver_id: driverId,
        operator_id: operatorId,
        truck_id: truckId,
        is_primary: isPrimary,
        status: 'active',
        linked_at: new Date(),
      });

      await trx('audit_logs').insert({
        id: `AUD-${Date.now()}`,
        actor_id: adminId,
        target_type: 'driver',
        target_id: driverId,
        action: 'assign_driver',
        payload: { operator_id: operatorId, truck_id: truckId, is_primary: isPrimary },
      });
    });

    return { success: true };
  }

  async unlinkDriver(params: { driverId: string; assignmentId: string; adminId: string; reason: string }) {
    const { driverId, assignmentId, adminId, reason } = params;

    // Check if driver on active trip
    const activeTrip = await db('trips').where({ driver_id: driverId }).whereIn('status', ['assigned', 'started', 'in_transit']).first();
    if (activeTrip) throw new Error('Driver is on active trip. Cannot unlink.');

    await db.transaction(async (trx) => {
      await trx('driver_assignments').where({ id: assignmentId }).update({ status: 'inactive', unlinked_at: new Date(), unlink_reason: reason });
      await trx('audit_logs').insert({ id: `AUD-${Date.now()}`, actor_id: adminId, target_type: 'driver', target_id: driverId, action: 'unlink_driver', payload: { assignment_id: assignmentId, reason } });
    });

    return { success: true };
  }
}

export const driversService = new DriversService();

