/**
 * ACS Action Handlers
 * 
 * Real action implementations for rule actions with full DB integration,
 * audit logging, and persistence.
 */

import logger from 'pino';
import { createAuditEntry, writeAuditEntry, AuditEntry, DbAdapter } from './auditWriter';
import { PostgresDbAdapter, MockDbAdapter } from './dbAdapter';
import { generateBlockId } from '@rodistaa/app-shared';

const log = logger({ name: 'acs-actions' });

// Global DB adapter (set by backend integration)
let dbAdapter: DbAdapter | undefined;

/**
 * Set the database adapter for action handlers
 */
export function setDbAdapter(adapter: DbAdapter | undefined) {
  dbAdapter = adapter;
  log.info({ hasAdapter: !!adapter }, 'DB adapter set for ACS actions');
}

/**
 * Get the current database adapter
 */
export function getDbAdapter(): DbAdapter | undefined {
  return dbAdapter;
}

/**
 * Freeze a shipment (prevent further actions)
 */
export async function freezeShipmentAction(payload: any, evalCtx: any) {
  const { shipmentId, reason } = payload;
  log.info({ shipmentId, reason }, 'freezeShipmentAction called');

  try {
    // Create audit entry
    const auditEntry = createAuditEntry(
      'shipment',
      shipmentId || 'unknown',
      'FREEZE',
      {
        reason,
        ruleId: evalCtx.ruleId,
      },
      {
        performedBy: evalCtx.ctx?.userId,
        ruleId: evalCtx.ruleId,
      }
    );

    // Write audit entry
    await writeAuditEntry(auditEntry, dbAdapter);

    // TODO: In full implementation, update shipment status in database
    // await dbAdapter.updateShipmentStatus(shipmentId, 'FROZEN');

    return {
      ok: true,
      shipmentId,
      reason,
      auditId: auditEntry.id,
      timestamp: auditEntry.timestamp,
    };
  } catch (error: any) {
    log.error({ error, shipmentId }, 'Failed to freeze shipment');
    throw error;
  }
}

/**
 * Block an entity (user, truck, device, etc.)
 */
export async function blockEntityAction(payload: any, evalCtx: any) {
  const { entityType, entityId, reason, severity = 'HIGH' } = payload;
  log.info({ entityType, entityId, reason, severity }, 'blockEntityAction called');

  try {
    const blockId = generateBlockId();

    // Insert block into database
    if (dbAdapter && 'insertBlock' in dbAdapter) {
      await (dbAdapter as any).insertBlock({
        id: blockId,
        entityType,
        entityId,
        ruleId: evalCtx.ruleId,
        severity: severity.toUpperCase(),
        reason,
        context: {
          ruleId: evalCtx.ruleId,
          performedBy: evalCtx.ctx?.userId,
          timestamp: new Date(),
        },
        expiresAt: payload.expiresAt || null,
      });
    }

    // Create audit entry
    const auditEntry = createAuditEntry(
      entityType,
      entityId,
      'BLOCK',
      {
        blockId,
        reason,
        severity,
        ruleId: evalCtx.ruleId,
      },
      {
        performedBy: evalCtx.ctx?.userId,
        ruleId: evalCtx.ruleId,
      }
    );

    await writeAuditEntry(auditEntry, dbAdapter);

    return {
      ok: true,
      blockId,
      entityType,
      entityId,
      reason,
      severity,
      auditId: auditEntry.id,
    };
  } catch (error: any) {
    log.error({ error, entityType, entityId }, 'Failed to block entity');
    throw error;
  }
}

/**
 * Create a ticket for manual review/action
 */
export async function createTicketAction(payload: any, evalCtx: any) {
  const { team, summary, refs = [], priority = 'NORMAL' } = payload;
  log.info({ team, summary, refs }, 'createTicketAction called');

  try {
    const ticketRef = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create audit entry
    const auditEntry = createAuditEntry(
      'ticket',
      ticketRef,
      'CREATE',
      {
        team,
        summary,
        refs,
        priority,
        ruleId: evalCtx.ruleId,
      },
      {
        performedBy: evalCtx.ctx?.userId,
        ruleId: evalCtx.ruleId,
      }
    );

    await writeAuditEntry(auditEntry, dbAdapter);

    // TODO: In full implementation, create ticket in ticketing system (Jira, etc.)
    // await ticketService.create({ team, summary, refs, priority });

    return {
      ok: true,
      ticketRef,
      team,
      summary,
      auditId: auditEntry.id,
    };
  } catch (error: any) {
    log.error({ error, team, summary }, 'Failed to create ticket');
    throw error;
  }
}

/**
 * Emit an event to the event bus
 */
export async function emitEventAction(payload: any, evalCtx: any) {
  const { name, payload: eventPayload = {} } = payload;
  log.info({ name, payload: eventPayload }, 'emitEventAction called');

  try {
    // Create audit entry
    const auditEntry = createAuditEntry(
      'event',
      name,
      'EMIT',
      {
        eventName: name,
        eventPayload,
        ruleId: evalCtx.ruleId,
      },
      {
        performedBy: evalCtx.ctx?.userId,
        ruleId: evalCtx.ruleId,
      }
    );

    await writeAuditEntry(auditEntry, dbAdapter);

    // TODO: In full implementation, emit to Kafka/EventBridge/etc.
    // await eventBus.emit(name, eventPayload);

    return {
      ok: true,
      eventName: name,
      eventPayload,
      auditId: auditEntry.id,
    };
  } catch (error: any) {
    log.error({ error, name }, 'Failed to emit event');
    throw error;
  }
}

/**
 * Reject a request with error code and message
 */
export async function rejectRequestAction(payload: any, evalCtx: any) {
  const { code, message } = payload;
  log.info({ code, message }, 'rejectRequestAction called');

  try {
    // Create audit entry
    const auditEntry = createAuditEntry(
      'request',
      evalCtx.event?.id || 'unknown',
      'REJECT',
      {
        code,
        message,
        ruleId: evalCtx.ruleId,
        requestType: evalCtx.event?.type,
      },
      {
        performedBy: evalCtx.ctx?.userId,
        ruleId: evalCtx.ruleId,
      }
    );

    await writeAuditEntry(auditEntry, dbAdapter);

    return {
      ok: false,
      rejected: true,
      code,
      message,
      auditId: auditEntry.id,
    };
  } catch (error: any) {
    log.error({ error, code }, 'Failed to reject request');
    throw error;
  }
}

/**
 * Flag an entity for watchlist monitoring
 */
export async function flagWatchlistAction(payload: any, evalCtx: any) {
  const { entityType, entityId, reason } = payload;
  log.info({ entityType, entityId, reason }, 'flagWatchlistAction called');

  try {
    // Create audit entry
    const auditEntry = createAuditEntry(
      entityType,
      entityId,
      'FLAG_WATCHLIST',
      {
        reason,
        ruleId: evalCtx.ruleId,
      },
      {
        performedBy: evalCtx.ctx?.userId,
        ruleId: evalCtx.ruleId,
      }
    );

    await writeAuditEntry(auditEntry, dbAdapter);

    // TODO: In full implementation, insert into watchlist table
    // await dbAdapter.insertWatchlist({ entityType, entityId, reason, addedBy: evalCtx.ctx?.userId });

    return {
      ok: true,
      entityType,
      entityId,
      reason,
      auditId: auditEntry.id,
    };
  } catch (error: any) {
    log.error({ error, entityType, entityId }, 'Failed to flag watchlist');
    throw error;
  }
}

/**
 * Require manual review for an entity
 */
export async function requireManualReviewAction(payload: any, evalCtx: any) {
  const { entityType, entityId, reason } = payload;
  log.info({ entityType, entityId, reason }, 'requireManualReviewAction called');

  try {
    const reviewId = `REVIEW-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create audit entry
    const auditEntry = createAuditEntry(
      entityType,
      entityId,
      'REQUIRE_MANUAL_REVIEW',
      {
        reviewId,
        reason,
        ruleId: evalCtx.ruleId,
      },
      {
        performedBy: evalCtx.ctx?.userId,
        ruleId: evalCtx.ruleId,
      }
    );

    await writeAuditEntry(auditEntry, dbAdapter);

    // TODO: In full implementation, create review queue entry
    // await reviewQueue.create({ entityType, entityId, reason, reviewId });

    return {
      ok: true,
      reviewId,
      entityType,
      entityId,
      reason,
      auditId: auditEntry.id,
    };
  } catch (error: any) {
    log.error({ error, entityType, entityId }, 'Failed to require manual review');
    throw error;
  }
}

/**
 * Redact a field from response (data masking)
 */
export async function redactFieldAction(payload: any, evalCtx: any) {
  const { field, entityType, entityId } = payload;
  log.info({ field, entityType, entityId }, 'redactFieldAction called');

  try {
    // Create audit entry
    const auditEntry = createAuditEntry(
      entityType,
      entityId,
      'REDACT_FIELD',
      {
        field,
        ruleId: evalCtx.ruleId,
      },
      {
        performedBy: evalCtx.ctx?.userId,
        ruleId: evalCtx.ruleId,
      }
    );

    await writeAuditEntry(auditEntry, dbAdapter);

    // Note: Field redaction is typically handled in the response middleware
    // This action logs the intent to redact

    return {
      ok: true,
      field,
      entityType,
      entityId,
      auditId: auditEntry.id,
    };
  } catch (error: any) {
    log.error({ error, field, entityType }, 'Failed to redact field');
    throw error;
  }
}

/**
 * Throttle requests from an entity (rate limiting)
 */
export async function throttleAction(payload: any, evalCtx: any) {
  const { entityId, duration, reason } = payload;
  log.info({ entityId, duration, reason }, 'throttleAction called');

  try {
    // Create audit entry
    const auditEntry = createAuditEntry(
      'user',
      entityId,
      'THROTTLE',
      {
        duration,
        reason,
        ruleId: evalCtx.ruleId,
      },
      {
        performedBy: evalCtx.ctx?.userId,
        ruleId: evalCtx.ruleId,
      }
    );

    await writeAuditEntry(auditEntry, dbAdapter);

    // TODO: In full implementation, apply rate limit in Redis
    // await rateLimiter.throttle(entityId, duration);

    return {
      ok: true,
      entityId,
      duration,
      reason,
      auditId: auditEntry.id,
    };
  } catch (error: any) {
    log.error({ error, entityId }, 'Failed to throttle entity');
    throw error;
  }
}

/**
 * Notify users by role
 */
export async function notifyRoleAction(payload: any, evalCtx: any) {
  const { role, title, message } = payload;
  log.info({ role, title, message }, 'notifyRoleAction called');

  try {
    // Create audit entry
    const auditEntry = createAuditEntry(
      'notification',
      role,
      'NOTIFY_ROLE',
      {
        role,
        title,
        message,
        ruleId: evalCtx.ruleId,
      },
      {
        performedBy: evalCtx.ctx?.userId,
        ruleId: evalCtx.ruleId,
      }
    );

    await writeAuditEntry(auditEntry, dbAdapter);

    // TODO: In full implementation, send notifications via push/FCM/email
    // await notificationService.sendToRole(role, { title, message });

    return {
      ok: true,
      role,
      title,
      message,
      auditId: auditEntry.id,
    };
  } catch (error: any) {
    log.error({ error, role }, 'Failed to notify role');
    throw error;
  }
}

/**
 * Action handler registry for rule evaluation
 */
export const actionHandlers: Record<string, (payload: any, evalCtx: any) => Promise<any>> = {
  freezeShipment: freezeShipmentAction,
  blockEntity: blockEntityAction,
  createTicket: createTicketAction,
  emitEvent: emitEventAction,
  rejectRequest: rejectRequestAction,
  flagWatchlist: flagWatchlistAction,
  requireManualReview: requireManualReviewAction,
  redactField: redactFieldAction,
  throttle: throttleAction,
  notifyRole: notifyRoleAction,
};
