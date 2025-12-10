/**
 * Tickets Seeder
 * 
 * Generates 30 tickets with varied priorities, statuses, and linked entities
 * for local development and testing.
 */

import { Pool } from 'pg';

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const statuses = ['NEW', 'OPEN', 'IN_PROGRESS', 'AWAITING_OPERATOR', 'RESOLVED', 'CLOSED', 'ESCALATED'];
const linkedTypes = ['booking', 'shipment', 'user', 'truck', 'operator'];
const roles = ['ops_agent', 'ops_manager', 'finance', 'compliance_officer', 'hq_support', 'franchise_agent'];

const ticketTemplates = [
  {
    title: 'Payment not received for shipment {id}',
    description: 'Driver completed delivery but payment not credited to wallet. Requesting immediate resolution.',
    linked_type: 'shipment',
    tags: ['payment', 'urgent'],
  },
  {
    title: 'Truck KYC documents expired for {id}',
    description: 'RC and insurance documents have expired. Need immediate renewal or truck will be blocked.',
    linked_type: 'truck',
    tags: ['kyc', 'compliance'],
  },
  {
    title: 'POD mismatch reported for shipment {id}',
    description: 'Shipper reports delivered quantity does not match POD. Need investigation.',
    linked_type: 'shipment',
    tags: ['pod', 'dispute'],
  },
  {
    title: 'Operator account suspended - verification needed',
    description: 'Operator account auto-suspended due to multiple ACS flags. Requires compliance review.',
    linked_type: 'operator',
    tags: ['acs', 'compliance', 'urgent'],
  },
  {
    title: 'Booking auto-finalization failed for {id}',
    description: 'Auto-finalize worker encountered error. No valid bids available. Manual intervention needed.',
    linked_type: 'booking',
    tags: ['booking', 'system'],
  },
  {
    title: 'Driver license expiring soon',
    description: 'Driver license will expire in 15 days. Need to update DL or suspend driver.',
    linked_type: 'user',
    tags: ['kyc', 'driver'],
  },
  {
    title: 'Shipment delayed beyond ETA',
    description: 'Shipment is 6 hours past ETA with no GPS updates. Need to contact driver.',
    linked_type: 'shipment',
    tags: ['delay', 'tracking'],
  },
  {
    title: 'Fraud alert: Duplicate POD submitted',
    description: 'LLM detected POD image has been used before. Possible fraud attempt.',
    linked_type: 'shipment',
    tags: ['fraud', 'critical'],
  },
];

const generateTickets = (count: number) => {
  const tickets = [];

  for (let i = 1; i <= count; i++) {
    const template = ticketTemplates[Math.floor(Math.random() * ticketTemplates.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const linkedId = `${template.linked_type?.toUpperCase().slice(0, 3)}-${String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}`;

    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));

    // Calculate SLA based on priority
    const slaMinutes = {
      LOW: 4320,
      MEDIUM: 2880,
      HIGH: 1440,
      CRITICAL: 240,
    }[priority] || 2880;

    const sla_due_at = new Date(createdDate.getTime() + slaMinutes * 60 * 1000);
    const sla_breached = sla_due_at < new Date() && !['RESOLVED', 'CLOSED'].includes(status);

    const ticket = {
      id: `TKT-${String(i).padStart(3, '0')}`,
      title: template.title.replace('{id}', linkedId),
      description: template.description,
      created_by_id: Math.random() > 0.3 ? `USR-${Math.floor(Math.random() * 50) + 201}` : 'SYSTEM',
      created_by_role: Math.random() > 0.3 ? ['driver', 'shipper', 'operator'][Math.floor(Math.random() * 3)] : 'system',
      owner_id: status !== 'NEW' ? `ADM-00${Math.floor(Math.random() * 5) + 1}` : null,
      owner_role: status !== 'NEW' ? roles[Math.floor(Math.random() * roles.length)] : null,
      assigned_franchise_id: Math.random() > 0.7 ? `FR-00${Math.floor(Math.random() * 5) + 1}` : null,
      priority,
      status,
      severity: template.tags.includes('critical') ? 'HIGH' : null,
      linked_type: template.linked_type,
      linked_id: linkedId,
      sla_due_at: sla_due_at.toISOString(),
      sla_escalation_level: sla_breached ? Math.floor(Math.random() * 2) : 0,
      sla_breached,
      tags: template.tags,
      is_sensitive: Math.random() > 0.8,
      archived: false,
      resolution_summary: ['RESOLVED', 'CLOSED'].includes(status) ? 'Issue resolved by team' : null,
      metadata: {},
      created_at: createdDate.toISOString(),
      updated_at: new Date(createdDate.getTime() + Math.floor(Math.random() * 12) * 60 * 60 * 1000).toISOString(),
      resolved_at: status === 'RESOLVED' ? new Date(createdDate.getTime() + 24 * 60 * 60 * 1000).toISOString() : null,
      closed_at: status === 'CLOSED' ? new Date(createdDate.getTime() + 30 * 60 * 60 * 1000).toISOString() : null,
    };

    tickets.push(ticket);
  }

  return tickets;
};

const generateMessages = (ticketIds: string[]) => {
  const messages = [];
  let messageId = 1;

  for (const ticketId of ticketIds.slice(0, 20)) {
    const numMessages = Math.floor(Math.random() * 4) + 1;

    for (let i = 0; i < numMessages; i++) {
      const createdDate = new Date();
      createdDate.setHours(createdDate.getHours() - Math.floor(Math.random() * 48));

      messages.push({
        id: messageId++,
        ticket_id: ticketId,
        actor_id: i === 0 ? `USR-${Math.floor(Math.random() * 50) + 201}` : `ADM-00${Math.floor(Math.random() * 5) + 1}`,
        actor_role: i === 0 ? 'driver' : roles[Math.floor(Math.random() * roles.length)],
        message: i === 0
          ? 'Reported issue with details. Requesting assistance.'
          : 'Team is investigating. Will update soon.',
        attachments: [],
        is_internal_note: Math.random() > 0.7,
        created_at: createdDate.toISOString(),
      });
    }
  }

  return messages;
};

const generateAuditEntries = (ticketIds: string[]) => {
  const audits = [];
  let auditId = 1;

  for (const ticketId of ticketIds) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));

    // Created event
    audits.push({
      id: auditId++,
      ticket_id: ticketId,
      actor_id: `USR-${Math.floor(Math.random() * 50) + 201}`,
      actor_role: 'driver',
      action: 'CREATED',
      payload: { priority: 'HIGH' },
      ip_address: '192.168.1.' + Math.floor(Math.random() * 255),
      created_at: createdDate.toISOString(),
    });

    // Assigned event
    if (Math.random() > 0.3) {
      audits.push({
        id: auditId++,
        ticket_id: ticketId,
        actor_id: `ADM-00${Math.floor(Math.random() * 5) + 1}`,
        actor_role: 'ops_manager',
        action: 'ASSIGNED',
        payload: { owner_id: `ADM-00${Math.floor(Math.random() * 5) + 1}`, owner_role: roles[Math.floor(Math.random() * roles.length)] },
        ip_address: '192.168.1.' + Math.floor(Math.random() * 255),
        created_at: new Date(createdDate.getTime() + 60 * 60 * 1000).toISOString(),
      });
    }
  }

  return audits;
};

export const seedTickets = async (pool: Pool) => {
  console.log('🌱 Seeding tickets...');

  try {
    // Generate data
    const tickets = generateTickets(30);
    const messages = generateMessages(tickets.map(t => t.id));
    const audits = generateAuditEntries(tickets.map(t => t.id));

    // Insert tickets
    for (const ticket of tickets) {
      await pool.query(`
        INSERT INTO tickets (
          id, title, description, created_by_id, created_by_role, owner_id, owner_role,
          assigned_franchise_id, priority, status, severity, linked_type, linked_id,
          sla_due_at, sla_escalation_level, sla_breached, tags, is_sensitive, archived,
          resolution_summary, metadata, created_at, updated_at, resolved_at, closed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
        ON CONFLICT (id) DO NOTHING
      `, [
        ticket.id, ticket.title, ticket.description, ticket.created_by_id, ticket.created_by_role,
        ticket.owner_id, ticket.owner_role, ticket.assigned_franchise_id, ticket.priority,
        ticket.status, ticket.severity, ticket.linked_type, ticket.linked_id, ticket.sla_due_at,
        ticket.sla_escalation_level, ticket.sla_breached, ticket.tags, ticket.is_sensitive,
        ticket.archived, ticket.resolution_summary, JSON.stringify(ticket.metadata),
        ticket.created_at, ticket.updated_at, ticket.resolved_at, ticket.closed_at,
      ]);
    }

    console.log(`✅ Inserted ${tickets.length} tickets`);

    // Insert messages
    for (const message of messages) {
      await pool.query(`
        INSERT INTO ticket_messages (
          id, ticket_id, actor_id, actor_role, message, attachments, is_internal_note, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO NOTHING
      `, [
        message.id, message.ticket_id, message.actor_id, message.actor_role,
        message.message, message.attachments, message.is_internal_note, message.created_at,
      ]);
    }

    console.log(`✅ Inserted ${messages.length} messages`);

    // Insert audit entries
    for (const audit of audits) {
      await pool.query(`
        INSERT INTO ticket_audit (
          id, ticket_id, actor_id, actor_role, action, payload, ip_address, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO NOTHING
      `, [
        audit.id, audit.ticket_id, audit.actor_id, audit.actor_role,
        audit.action, JSON.stringify(audit.payload), audit.ip_address, audit.created_at,
      ]);
    }

    console.log(`✅ Inserted ${audits.length} audit entries`);
    console.log('🎉 Tickets seeding complete!');

  } catch (error) {
    console.error('❌ Error seeding tickets:', error);
    throw error;
  }
};

// Run directly if called as script
if (require.main === module) {
  const { Pool } = require('pg');
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'rodistaa',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  seedTickets(pool)
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

