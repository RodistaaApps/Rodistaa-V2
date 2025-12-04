/**
 * Shippers Service
 * Business logic for shipper management, list, detail, and operations
 */

import { db } from '../../lib/db';

export interface ShippersListParams {
  limit?: number;
  offset?: number;
  search?: string;
  franchise?: string;
  city?: string;
  state?: string;
  sort?: 'name' | 'last_active' | 'bookings' | 'ledger_balance' | 'trust_score';
  order?: 'asc' | 'desc';
  has_acs?: boolean;
  min_balance?: number;
  last_active_range?: number;
}

export class ShippersService {
  /**
   * Get paginated list of shippers with filters
   */
  async getShippersList(params: ShippersListParams) {
    const {
      limit = 25,
      offset = 0,
      search,
      franchise,
      city,
      state,
      sort = 'last_active',
      order = 'desc',
      has_acs,
      min_balance,
      last_active_range,
    } = params;

    let query = db('users')
      .where({ role: 'shipper' })
      .select(
        'users.id',
        'users.role',
        'users.name',
        'users.mobile',
        'users.franchise_id',
        'users.city',
        'users.state',
        'users.last_active',
        'users.ledger_balance',
        'users.trust_score',
        'franchises.name as franchise'
      )
      .leftJoin('franchises', 'users.franchise_id', 'franchises.id');

    // Search filter
    if (search) {
      query = query.where(function() {
        this.where('users.id', 'like', `%${search}%`)
          .orWhere('users.name', 'like', `%${search}%`)
          .orWhere('users.mobile', 'like', `%${search}%`);
      });
    }

    // Franchise filter
    if (franchise) {
      query = query.where('users.franchise_id', franchise);
    }

    // City/State filters
    if (city) {
      query = query.where('users.city', city);
    }
    if (state) {
      query = query.where('users.state', state);
    }

    // Ledger balance filter
    if (min_balance !== undefined) {
      query = query.where('users.ledger_balance', '>=', min_balance);
    }

    // Last active range filter
    if (last_active_range) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - last_active_range);
      query = query.where('users.last_active', '>=', cutoffDate);
    }

    // Get total count
    const countQuery = query.clone();
    const [{ count }] = await countQuery.count('* as count');

    // Get metrics for each shipper
    const shippers = await query
      .orderBy(`users.${sort}`, order)
      .limit(limit)
      .offset(offset);

    // Fetch metrics (bookings, shipments, ACS flags) for each shipper
    const shipperIds = shippers.map(s => s.id);
    
    const bookingCounts = await db('bookings')
      .whereIn('shipper_id', shipperIds)
      .select('shipper_id')
      .count('* as count')
      .groupBy('shipper_id');

    const shipmentCounts = await db('shipments')
      .whereIn('shipper_id', shipperIds)
      .where('status', 'delivered')
      .select('shipper_id')
      .count('* as count')
      .groupBy('shipper_id');

    const acsCounts = await db('acs_flags')
      .whereIn('user_id', shipperIds)
      .where('status', 'active')
      .select('user_id')
      .count('* as count')
      .groupBy('user_id');

    // Merge metrics into shipper objects
    const enrichedShippers = shippers.map(shipper => ({
      ...shipper,
      metrics: {
        bookings: bookingCounts.find(b => b.shipper_id === shipper.id)?.count || 0,
        completed_shipments: shipmentCounts.find(s => s.shipper_id === shipper.id)?.count || 0,
      },
      acs_flags_count: acsCounts.find(a => a.user_id === shipper.id)?.count || 0,
    }));

    // ACS filter
    let filteredShippers = enrichedShippers;
    if (has_acs !== undefined) {
      filteredShippers = enrichedShippers.filter(s => 
        has_acs ? s.acs_flags_count > 0 : s.acs_flags_count === 0
      );
    }

    return {
      data: filteredShippers,
      meta: {
        total: Number(count),
        limit,
        offset,
      },
    };
  }

  /**
   * Get detailed shipper information with all related data
   */
  async getShipperDetail(shipperId: string) {
    const shipper = await db('users')
      .where({ id: shipperId, role: 'shipper' })
      .select('*')
      .first();

    if (!shipper) {
      throw new Error('Shipper not found');
    }

    // Get franchise info
    const franchise = await db('franchises')
      .where({ id: shipper.franchise_id })
      .select('name')
      .first();

    // Get metrics
    const [bookingsCount] = await db('bookings')
      .where({ shipper_id: shipperId })
      .count('* as count');

    const [completedShipmentsCount] = await db('shipments')
      .where({ shipper_id: shipperId, status: 'delivered' })
      .count('* as count');

    const [openShipmentsCount] = await db('shipments')
      .where({ shipper_id: shipperId })
      .whereIn('status', ['assigned', 'in_transit', 'at_pickup'])
      .count('* as count');

    // Get ACS flags
    const acsFlags = await db('acs_flags')
      .where({ user_id: shipperId, status: 'active' })
      .orderBy('created_at', 'desc')
      .limit(10);

    // Get recent activities
    const recentActivities = await db('user_activities')
      .where({ user_id: shipperId })
      .orderBy('created_at', 'desc')
      .limit(20);

    // Get documents
    const documents = await db('documents')
      .where({ user_id: shipperId })
      .select('*');

    // Get recent bookings (limited)
    const recentBookings = await db('bookings')
      .where({ shipper_id: shipperId })
      .orderBy('created_at', 'desc')
      .limit(10);

    // Get recent shipments (limited)
    const recentShipments = await db('shipments')
      .where({ shipper_id: shipperId })
      .orderBy('created_at', 'desc')
      .limit(10);

    return {
      ...shipper,
      franchise: franchise?.name || 'HQ',
      metrics: {
        bookings: Number(bookingsCount.count),
        completed_shipments: Number(completedShipmentsCount.count),
        open_shipments: Number(openShipmentsCount.count),
      },
      ledger: {
        balance: parseFloat(shipper.ledger_balance || '0'),
      },
      acs_flags: acsFlags,
      recent_activities: recentActivities,
      documents: documents,
      bookings: {
        total: Number(bookingsCount.count),
        items: recentBookings,
      },
      shipments: {
        total: Number(completedShipmentsCount.count) + Number(openShipmentsCount.count),
        items: recentShipments,
      },
    };
  }

  /**
   * Get shipper bookings (paginated)
   */
  async getShipperBookings(shipperId: string, limit = 20, offset = 0, status?: string) {
    let query = db('bookings')
      .where({ shipper_id: shipperId });

    if (status) {
      query = query.where({ status });
    }

    const [{ count }] = await query.clone().count('* as count');
    const bookings = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data: bookings,
      meta: { total: Number(count), limit, offset },
    };
  }

  /**
   * Get shipper shipments (paginated)
   */
  async getShipperShipments(shipperId: string, limit = 20, offset = 0, status?: string) {
    let query = db('shipments')
      .where({ shipper_id: shipperId });

    if (status) {
      query = query.where({ status });
    }

    const [{ count }] = await query.clone().count('* as count');
    const shipments = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data: shipments,
      meta: { total: Number(count), limit, offset },
    };
  }

  /**
   * Get shipper ledger transactions
   */
  async getShipperLedger(shipperId: string, limit = 20, offset = 0) {
    const [{ count }] = await db('ledger_transactions')
      .where({ user_id: shipperId })
      .count('* as count');

    const transactions = await db('ledger_transactions')
      .where({ user_id: shipperId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data: transactions,
      meta: { total: Number(count), limit, offset },
    };
  }

  /**
   * Manual ledger adjustment (admin-only)
   * SECURITY: Creates audit log
   */
  async adjustLedger(params: {
    shipperId: string;
    adminId: string;
    type: 'credit' | 'debit';
    amount: number;
    reason: string;
  }) {
    const { shipperId, adminId, type, amount, reason } = params;

    if (!reason || reason.trim().length < 10) {
      throw new Error('Reason must be at least 10 characters');
    }

    return await db.transaction(async (trx) => {
      // Get current balance
      const shipper = await trx('users')
        .where({ id: shipperId })
        .select('ledger_balance')
        .first()
        .forUpdate();

      const balanceBefore = parseFloat(shipper.ledger_balance || '0');
      const adjustmentAmount = type === 'credit' ? amount : -amount;
      const balanceAfter = balanceBefore + adjustmentAmount;

      // Update balance
      await trx('users')
        .where({ id: shipperId })
        .update({ ledger_balance: balanceAfter });

      // Create transaction record
      const transactionId = `TXN-${Date.now()}`;
      await trx('ledger_transactions').insert({
        id: transactionId,
        user_id: shipperId,
        transaction_type: 'adjustment',
        amount: Math.abs(adjustmentAmount),
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: reason,
        created_by: adminId,
      });

      // Create audit log
      await trx('audit_logs').insert({
        id: `AUD-${Date.now()}`,
        actor_id: adminId,
        target_type: 'user',
        target_id: shipperId,
        action: 'ledger_adjustment',
        payload: { type, amount, reason, transaction_id: transactionId },
      });

      return { success: true, new_balance: balanceAfter, transaction_id: transactionId };
    });
  }

  /**
   * Get shipper documents
   */
  async getShipperDocuments(shipperId: string) {
    return await db('documents')
      .where({ user_id: shipperId })
      .orderBy('uploaded_at', 'desc');
  }

  /**
   * View document with permission check and audit logging
   * SECURITY: Creates audit log entry
   */
  async viewDocument(params: {
    shipperId: string;
    documentId: string;
    adminId: string;
    adminRole: string;
    reason: string;
    ipAddress?: string;
  }) {
    const { shipperId, documentId, adminId, adminRole, reason, ipAddress } = params;

    // Get document
    const document = await db('documents')
      .where({ id: documentId, user_id: shipperId })
      .first();

    if (!document) {
      throw new Error('Document not found');
    }

    // Permission check
    const allowedRoles = ['super_admin', 'compliance_officer', 'kyc_admin'];
    const hasPermission = document.is_sensitive ? allowedRoles.includes(adminRole) : true;

    // Create audit log
    await db('document_access_logs').insert({
      id: `DAL-${Date.now()}`,
      document_id: documentId,
      accessed_by: adminId,
      reason: reason || 'Admin view',
      access_granted: hasPermission,
      ip_address: ipAddress,
    });

    if (!hasPermission) {
      return {
        access_granted: false,
        message: 'Insufficient permissions. Request submitted for review.',
      };
    }

    // Generate temporary signed URL (mock for now)
    const signedUrl = `${document.file_url}?token=temp-${Date.now()}`;

    return {
      access_granted: true,
      url: signedUrl,
      document,
    };
  }

  /**
   * Get audit trail for shipper
   */
  async getAuditTrail(shipperId: string, limit = 20, offset = 0) {
    const [{ count }] = await db('audit_logs')
      .where({ target_id: shipperId })
      .count('* as count');

    const logs = await db('audit_logs')
      .where({ target_id: shipperId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data: logs,
      meta: { total: Number(count), limit, offset },
    };
  }

  /**
   * Create audit log action
   */
  async createAuditAction(params: {
    shipperId: string;
    adminId: string;
    action: string;
    payload?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { shipperId, adminId, action, payload, ipAddress, userAgent } = params;

    await db('audit_logs').insert({
      id: `AUD-${Date.now()}`,
      actor_id: adminId,
      target_type: 'user',
      target_id: shipperId,
      action,
      payload,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return { success: true };
  }

  /**
   * Block/Unblock shipper
   * SECURITY: Creates audit log
   */
  async toggleBlock(params: {
    shipperId: string;
    adminId: string;
    block: boolean;
    reason: string;
    duration?: string; // '7d', '30d', '90d', 'permanent'
  }) {
    const { shipperId, adminId, block, reason, duration } = params;

    if (block && (!reason || reason.trim().length < 10)) {
      throw new Error('Block reason must be at least 10 characters');
    }

    let blockedUntil = null;
    if (block && duration && duration !== 'permanent') {
      const days = parseInt(duration.replace('d', ''));
      blockedUntil = new Date();
      blockedUntil.setDate(blockedUntil.getDate() + days);
    }

    await db.transaction(async (trx) => {
      // Update user status
      await trx('users')
        .where({ id: shipperId })
        .update({
          is_blocked: block,
          block_reason: block ? reason : null,
          blocked_at: block ? new Date() : null,
          blocked_until: blockedUntil,
        });

      // Create audit log
      await trx('audit_logs').insert({
        id: `AUD-${Date.now()}`,
        actor_id: adminId,
        target_type: 'user',
        target_id: shipperId,
        action: block ? 'block_user' : 'unblock_user',
        payload: { reason, duration },
      });
    });

    return { success: true };
  }
}

export const shippersService = new ShippersService();

