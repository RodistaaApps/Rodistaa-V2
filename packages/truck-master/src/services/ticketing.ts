/**
 * Ticketing Service
 * Create and manage HQ tickets for discrepancies and persistent flags
 */

import { query, transaction, PoolClient } from '../db';
import { AdminTicket } from '../models/truckDimensions';

/**
 * Create admin ticket
 */
export async function createTicket(
  ticket: Omit<AdminTicket, 'id' | 'created_at'>,
  client?: PoolClient
): Promise<number> {
  const queryFn = client ? client.query.bind(client) : query;

  const result = await queryFn<{ id: number }>(
    `INSERT INTO admin_tickets 
     (truck_id, operator_id, reason_code, severity, assigned_to, status, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      ticket.truck_id,
      ticket.operator_id,
      ticket.reason_code,
      ticket.severity,
      ticket.assigned_to || null,
      ticket.status || 'OPEN',
      JSON.stringify(ticket.notes),
    ]
  );

  return result.rows[0].id;
}

/**
 * Get ticket by ID
 */
export async function getTicket(ticketId: number): Promise<AdminTicket | null> {
  const result = await query<AdminTicket>(
    `SELECT id, truck_id, operator_id, reason_code, severity, assigned_to, 
            status, notes, created_at, resolved_at, resolved_by
     FROM admin_tickets
     WHERE id = $1`,
    [ticketId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    ...row,
    notes: typeof row.notes === 'string' ? JSON.parse(row.notes) : row.notes,
  };
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(
  ticketId: number,
  status: AdminTicket['status'],
  resolvedBy?: string
): Promise<void> {
  await query(
    `UPDATE admin_tickets
     SET status = $1,
         resolved_at = CASE WHEN $1 IN ('RESOLVED', 'CLOSED') THEN NOW() ELSE resolved_at END,
         resolved_by = CASE WHEN $1 IN ('RESOLVED', 'CLOSED') THEN $2 ELSE resolved_by END
     WHERE id = $3`,
    [status, resolvedBy, ticketId]
  );
}

/**
 * List tickets with filters
 */
export async function listTickets(filters: {
  truck_id?: number;
  operator_id?: string;
  reason_code?: string;
  severity?: string;
  status?: string;
  assigned_to?: string;
  limit?: number;
  offset?: number;
}): Promise<{ tickets: AdminTicket[]; total: number }> {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.truck_id) {
    conditions.push(`truck_id = $${paramIndex++}`);
    params.push(filters.truck_id);
  }
  if (filters.operator_id) {
    conditions.push(`operator_id = $${paramIndex++}`);
    params.push(filters.operator_id);
  }
  if (filters.reason_code) {
    conditions.push(`reason_code = $${paramIndex++}`);
    params.push(filters.reason_code);
  }
  if (filters.severity) {
    conditions.push(`severity = $${paramIndex++}`);
    params.push(filters.severity);
  }
  if (filters.status) {
    conditions.push(`status = $${paramIndex++}`);
    params.push(filters.status);
  }
  if (filters.assigned_to) {
    conditions.push(`assigned_to = $${paramIndex++}`);
    params.push(filters.assigned_to);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM admin_tickets ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get tickets
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;
  params.push(limit, offset);

  const result = await query<AdminTicket>(
    `SELECT id, truck_id, operator_id, reason_code, severity, assigned_to,
            status, notes, created_at, resolved_at, resolved_by
     FROM admin_tickets
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    params
  );

  const tickets = result.rows.map(row => ({
    ...row,
    notes: typeof row.notes === 'string' ? JSON.parse(row.notes) : row.notes,
  }));

  return { tickets, total };
}
