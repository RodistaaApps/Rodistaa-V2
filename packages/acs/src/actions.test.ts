/**
 * Unit Tests for ACS Action Handlers
 */

import {
  freezeShipmentAction,
  blockEntityAction,
  createTicketAction,
  emitEventAction,
  rejectRequestAction,
  flagWatchlistAction,
  requireManualReviewAction,
  redactFieldAction,
  throttleAction,
  notifyRoleAction,
  setDbAdapter,
} from './actions';
import { MockDbAdapter } from './dbAdapter';

describe('Action Handlers', () => {
  let mockDb: MockDbAdapter;

  beforeEach(() => {
    mockDb = new MockDbAdapter();
    setDbAdapter(mockDb);
  });

  test('freezeShipmentAction should create audit entry', async () => {
    const payload = {
      shipmentId: 'SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      reason: 'GPS_JUMP',
    };

    const evalCtx = {
      ctx: { userId: 'USR-AD-01ARZ3NDEKTSV4RRFFQ69G5FAV' },
      ruleId: 'RF05_GPS_JUMP_ANOMALY',
    };

    const result = await freezeShipmentAction(payload, evalCtx);
    expect(result.ok).toBe(true);
    expect(result.shipmentId).toBe(payload.shipmentId);
    expect(result.auditId).toBeDefined();

    const auditLogs = mockDb.getAuditLogs();
    expect(auditLogs.length).toBeGreaterThan(0);
    expect(auditLogs.some((log) => log.action === 'FREEZE')).toBe(true);
  });

  test('blockEntityAction should create block and audit entry', async () => {
    const payload = {
      entityType: 'truck',
      entityId: 'TRK-MH01AB1234-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      reason: 'EXPIRED_DOCUMENTS',
      severity: 'CRITICAL',
    };

    const evalCtx = {
      ctx: { userId: 'USR-AD-01ARZ3NDEKTSV4RRFFQ69G5FAV' },
      ruleId: 'RF02_TRUCK_DOCS_EXPIRED',
    };

    const result = await blockEntityAction(payload, evalCtx);
    expect(result.ok).toBe(true);
    expect(result.blockId).toBeDefined();
    expect(result.entityType).toBe('truck');
    expect(result.auditId).toBeDefined();

    const blocks = mockDb.getBlocks();
    expect(blocks.length).toBeGreaterThan(0);
  });

  test('createTicketAction should create ticket and audit entry', async () => {
    const payload = {
      team: 'fraud',
      summary: 'Suspicious activity detected',
      refs: ['SH-01ARZ3NDEKTSV4RRFFQ69G5FAV'],
    };

    const evalCtx = {
      ctx: { userId: 'USR-AD-01ARZ3NDEKTSV4RRFFQ69G5FAV' },
      ruleId: 'RF05_GPS_JUMP_ANOMALY',
    };

    const result = await createTicketAction(payload, evalCtx);
    expect(result.ok).toBe(true);
    expect(result.ticketRef).toBeDefined();
    expect(result.ticketRef.startsWith('TICKET-')).toBe(true);
    expect(result.auditId).toBeDefined();
  });

  test('emitEventAction should create audit entry', async () => {
    const payload = {
      name: 'fraud.flagged',
      payload: { reason: 'GPS_JUMP', shipmentId: 'SH-01ARZ3NDEKTSV4RRFFQ69G5FAV' },
    };

    const evalCtx = {
      ctx: { userId: 'USR-AD-01ARZ3NDEKTSV4RRFFQ69G5FAV' },
      ruleId: 'RF05_GPS_JUMP_ANOMALY',
    };

    const result = await emitEventAction(payload, evalCtx);
    expect(result.ok).toBe(true);
    expect(result.eventName).toBe('fraud.flagged');
    expect(result.auditId).toBeDefined();
  });

  test('rejectRequestAction should return rejection', async () => {
    const payload = {
      code: 'KYC_REQUIRED',
      message: 'KYC verification required',
    };

    const evalCtx = {
      ctx: { userId: 'USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV' },
      ruleId: 'RF01_KYC_MANDATORY',
    };

    const result = await rejectRequestAction(payload, evalCtx);
    expect(result.ok).toBe(false);
    expect(result.rejected).toBe(true);
    expect(result.code).toBe('KYC_REQUIRED');
    expect(result.auditId).toBeDefined();
  });

  test('flagWatchlistAction should flag entity', async () => {
    const payload = {
      entityType: 'user',
      entityId: 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      reason: 'POD_DUPLICATE',
    };

    const evalCtx = {
      ctx: { userId: 'USR-AD-01ARZ3NDEKTSV4RRFFQ69G5FAV' },
      ruleId: 'RF07_POD_DUPLICATE_HASH',
    };

    const result = await flagWatchlistAction(payload, evalCtx);
    expect(result.ok).toBe(true);
    expect(result.entityId).toBe(payload.entityId);
    expect(result.auditId).toBeDefined();
  });

  test('requireManualReviewAction should create review', async () => {
    const payload = {
      entityType: 'shipment',
      entityId: 'SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      reason: 'SUSPICIOUS_ACTIVITY',
    };

    const evalCtx = {
      ctx: { userId: 'USR-AD-01ARZ3NDEKTSV4RRFFQ69G5FAV' },
      ruleId: 'RF05_GPS_JUMP_ANOMALY',
    };

    const result = await requireManualReviewAction(payload, evalCtx);
    expect(result.ok).toBe(true);
    expect(result.reviewId).toBeDefined();
    expect(result.reviewId.startsWith('REVIEW-')).toBe(true);
    expect(result.auditId).toBeDefined();
  });

  test('redactFieldAction should create audit entry', async () => {
    const payload = {
      field: 'mobile',
      entityType: 'user',
      entityId: 'USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
    };

    const evalCtx = {
      ctx: { userId: 'USR-AD-01ARZ3NDEKTSV4RRFFQ69G5FAV' },
      ruleId: 'RF01_KYC_MANDATORY',
    };

    const result = await redactFieldAction(payload, evalCtx);
    expect(result.ok).toBe(true);
    expect(result.field).toBe('mobile');
    expect(result.auditId).toBeDefined();
  });

  test('throttleAction should create audit entry', async () => {
    const payload = {
      entityId: 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      duration: 3600,
      reason: 'RATE_LIMIT_EXCEEDED',
    };

    const evalCtx = {
      ctx: { userId: 'USR-AD-01ARZ3NDEKTSV4RRFFQ69G5FAV' },
      ruleId: 'RF01_KYC_MANDATORY',
    };

    const result = await throttleAction(payload, evalCtx);
    expect(result.ok).toBe(true);
    expect(result.duration).toBe(3600);
    expect(result.auditId).toBeDefined();
  });

  test('notifyRoleAction should create audit entry', async () => {
    const payload = {
      role: 'operator',
      title: 'ACS Alert',
      message: 'Suspicious activity detected',
    };

    const evalCtx = {
      ctx: { userId: 'USR-AD-01ARZ3NDEKTSV4RRFFQ69G5FAV' },
      ruleId: 'RF05_GPS_JUMP_ANOMALY',
    };

    const result = await notifyRoleAction(payload, evalCtx);
    expect(result.ok).toBe(true);
    expect(result.role).toBe('operator');
    expect(result.auditId).toBeDefined();
  });
});

