/**
 * Operators Service - Business logic for operator management
 */

import { db } from '../../lib/db';

export class OperatorsService {
  async getOperatorsList(params: any) {
    const { limit = 25, offset = 0, search, franchise, city, state, sort = 'last_active', order = 'desc', has_pending_inspections, min_trucks } = params;

    let query = db('users').where({ role: 'operator' });

    if (search) {
      query = query.where(function() {
        this.where('users.id', 'like', `%${search}%`)
          .orWhere('users.name', 'like', `%${search}%`)
          .orWhere('users.mobile', 'like', `%${search}%`);
      });
    }

    const [{ count }] = await query.clone().count('* as count');
    const operators = await query.orderBy(`users.${sort}`, order).limit(limit).offset(offset);

    // Fetch metrics
    const operatorIds = operators.map(o => o.id);
    const truckCounts = await db('trucks').whereIn('operator_id', operatorIds).select('operator_id').count('* as total').sum(db.raw("CASE WHEN status = 'active' THEN 1 ELSE 0 END as active")).sum(db.raw("CASE WHEN status = 'blocked' THEN 1 ELSE 0 END as blocked")).groupBy('operator_id');
    const bidCounts = await db('bids').whereIn('operator_id', operatorIds).where('status', 'active').select('operator_id').count('* as count').groupBy('operator_id');

    const enriched = operators.map(op => ({
      ...op,
      trucks: truckCounts.find(t => t.operator_id === op.id) || { total: 0, active: 0, blocked: 0 },
      active_bids: bidCounts.find(b => b.operator_id === op.id)?.count || 0,
      pending_inspections: 0, // TODO: Calculate from inspections table
      acs_flags_count: 0,
    }));

    return { data: enriched, meta: { total: Number(count), limit, offset } };
  }

  async getOperatorDetail(operatorId: string) {
    const operator = await db('users').where({ id: operatorId, role: 'operator' }).first();
    if (!operator) throw new Error('Operator not found');

    const [trucksCount] = await db('trucks').where({ operator_id: operatorId }).count('* as count');
    const [bidsCount] = await db('bids').where({ operator_id: operatorId }).count('* as count');
    const [shipmentsCount] = await db('shipments').where({ operator_id: operatorId }).count('* as count');
    const [driversCount] = await db('drivers').where({ operator_id: operatorId }).count('* as count');

    return {
      ...operator,
      metrics: {
        trucks: { total: Number(trucksCount.count), active: 0, blocked: 0 },
        active_bids: 0,
        completed_shipments: 0,
      },
      trucks_list: { total: Number(trucksCount.count), items: [] },
      bids: { total: Number(bidsCount.count), items: [] },
      shipments: { total: Number(shipmentsCount.count), items: [] },
      drivers: { total: Number(driversCount.count), items: [] },
      inspections: { pending: 0, items: [] },
    };
  }

  async getOperatorTrucks(operatorId: string, limit = 20, offset = 0) {
    const trucks = await db('trucks').where({ operator_id: operatorId }).limit(limit).offset(offset);
    const [{ count }] = await db('trucks').where({ operator_id: operatorId }).count('* as count');
    return { data: trucks, meta: { total: Number(count), limit, offset } };
  }

  async blockTruck(truckId: string, adminId: string, reason: string) {
    await db.transaction(async (trx) => {
      await trx('trucks').where({ id: truckId }).update({ status: 'blocked', blocked_at: new Date(), block_reason: reason });
      await trx('audit_logs').insert({ id: `AUD-${Date.now()}`, actor_id: adminId, target_type: 'truck', target_id: truckId, action: 'block_truck', payload: { reason } });
    });
    return { success: true };
  }

  async transferTruck(params: { truckId: string; targetOperatorId: string; adminId: string; reason: string }) {
    const { truckId, targetOperatorId, adminId, reason } = params;
    
    // Check truck not in active shipment
    const activeShipment = await db('shipments').where({ truck_id: truckId }).whereIn('status', ['assigned', 'in_transit']).first();
    if (activeShipment) throw new Error('Truck is in active shipment');

    await db.transaction(async (trx) => {
      await trx('trucks').where({ id: truckId }).update({ operator_id: targetOperatorId, transferred_at: new Date() });
      await trx('audit_logs').insert({ id: `AUD-${Date.now()}`, actor_id: adminId, target_type: 'truck', target_id: truckId, action: 'transfer_truck', payload: { target_operator_id: targetOperatorId, reason } });
    });
    
    return { success: true };
  }
}

export const operatorsService = new OperatorsService();

