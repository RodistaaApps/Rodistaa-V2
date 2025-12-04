/**
 * Ticketing Service
 * Create HQ tickets for discrepancies
 */

import { query, Pool } from '../db';

export type TicketType = 'PROVIDER_MISMATCH' | 'DUPLICATE_CHASSIS' | 'PERMIT_DISCREPANCY' | 'LOW_TRUST' | 'COMPLIANCE_BLOCK' | 'INVALID_LENGTH_FOR_CLASS';
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
  ticket_type: TicketType;
  priority: TicketPriority;
  status: string;
  rc_number?: string;
  operator_id?: string;
  payload: any;
  assigned_to?: string;
  resolved_at?: Date;
  resolution_notes?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create HQ ticket
 */
export async function createTicket(db: any, ticketData: TicketPayload): Promise<Ticket> {
  const priority = ticketData.priority || determinePriority(ticketData.ticketType);

  const result = await db.query(
    `INSERT INTO tickets (ticket_type, priority, status, rc_number, operator_id, payload)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      ticketData.ticketType,
      priority,
      'OPEN',
      ticketData.rcNumber || null,
      ticketData.operatorId || null,
      JSON.stringify(ticketData.payload),
    ]
  );

  return result.rows[0];
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
    case 'INVALID_LENGTH_FOR_CLASS':
      return 'MEDIUM';
    case 'PERMIT_DISCREPANCY':
      return 'MEDIUM';
    case 'LOW_TRUST':
      return 'LOW';
    default:
      return 'MEDIUM';
  }
}

