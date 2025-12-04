/**
 * Ticketing System
 * Create HQ tickets with payload for discrepancies
 */

import { Pool } from 'pg';

export type TicketType = 'PROVIDER_MISMATCH' | 'DUPLICATE_CHASSIS' | 'PERMIT_DISCREPANCY' | 'LOW_TRUST' | 'COMPLIANCE_BLOCK';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TicketPayload {
  ticketType: TicketType;
  rcNumber?: string;
  operatorId?: string;
  payload: any;
  priority?: TicketPriority;
}

export interface Ticket {
  id: number;
  ticketType: TicketType;
  priority: TicketPriority;
  status: string;
  rcNumber?: string;
  operatorId?: string;
  payload: any;
  assignedTo?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create HQ ticket
 */
export async function createTicket(db: Pool, ticketData: TicketPayload): Promise<Ticket> {
  const priority = ticketData.priority || determinePriority(ticketData.ticketType);

  const query = `
    INSERT INTO tickets (
      ticket_type, priority, status, rc_number, operator_id, payload
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const result = await db.query(query, [
    ticketData.ticketType,
    priority,
    'OPEN',
    ticketData.rcNumber || null,
    ticketData.operatorId || null,
    JSON.stringify(ticketData.payload),
  ]);

  return mapRowToTicket(result.rows[0]);
}

/**
 * Get tickets by status
 */
export async function getTicketsByStatus(
  db: Pool,
  status: string,
  limit: number = 100
): Promise<Ticket[]> {
  const query = `
    SELECT * FROM tickets
    WHERE status = $1
    ORDER BY created_at DESC
    LIMIT $2
  `;

  const result = await db.query(query, [status, limit]);
  return result.rows.map(mapRowToTicket);
}

/**
 * Get tickets by type
 */
export async function getTicketsByType(
  db: Pool,
  ticketType: TicketType,
  limit: number = 100
): Promise<Ticket[]> {
  const query = `
    SELECT * FROM tickets
    WHERE ticket_type = $1
    ORDER BY created_at DESC
    LIMIT $2
  `;

  const result = await db.query(query, [ticketType, limit]);
  return result.rows.map(mapRowToTicket);
}

/**
 * Resolve ticket
 */
export async function resolveTicket(
  db: Pool,
  ticketId: number,
  resolutionNotes: string,
  assignedTo?: string
): Promise<Ticket> {
  const query = `
    UPDATE tickets
    SET status = 'RESOLVED',
        resolved_at = CURRENT_TIMESTAMP,
        resolution_notes = $1,
        assigned_to = COALESCE($2, assigned_to),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
  `;

  const result = await db.query(query, [resolutionNotes, assignedTo, ticketId]);
  return mapRowToTicket(result.rows[0]);
}

/**
 * Determine priority based on ticket type
 */
function determinePriority(ticketType: TicketType): TicketPriority {
  switch (ticketType) {
    case 'DUPLICATE_CHASSIS':
    case 'PROVIDER_MISMATCH':
      return 'HIGH';
    case 'COMPLIANCE_BLOCK':
      return 'MEDIUM';
    case 'PERMIT_DISCREPANCY':
      return 'MEDIUM';
    case 'LOW_TRUST':
      return 'LOW';
    default:
      return 'MEDIUM';
  }
}

/**
 * Map database row to Ticket object
 */
function mapRowToTicket(row: any): Ticket {
  return {
    id: row.id,
    ticketType: row.ticket_type,
    priority: row.priority,
    status: row.status,
    rcNumber: row.rc_number,
    operatorId: row.operator_id,
    payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
    assignedTo: row.assigned_to,
    resolvedAt: row.resolved_at,
    resolutionNotes: row.resolution_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

