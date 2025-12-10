/**
 * SLA Monitor Worker Tests
 * 
 * Tests for SLA monitoring and auto-escalation:
 * - Near-breach detection
 * - Breach detection
 * - Auto-escalation logic
 * - Redis locking
 * - Idempotency
 */

import { Pool } from 'pg';
import Redis from 'ioredis';
import { SLAMonitorWorker } from '../slaMonitorWorker';

jest.mock('ioredis');
jest.mock('../../admin/services/notificationService');

describe('SLAMonitorWorker', () => {
  let pool: jest.Mocked<Pool>;
  let redis: jest.Mocked<Redis>;
  let worker: SLAMonitorWorker;

  beforeEach(() => {
    pool = {
      query: jest.fn(),
      connect: jest.fn(),
    } as any;

    redis = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    } as any;

    worker = new SLAMonitorWorker(pool, redis, {
      nearBreachCheckIntervalMs: 1000,
      breachCheckIntervalMs: 5000,
      lockTtlMs: 500,
      batchSize: 10,
    });
  });

  afterEach(() => {
    if (worker) {
      worker.stop();
    }
    jest.clearAllMocks();
  });

  describe('findNearBreachTickets', () => {
    it('should find tickets with <20% time remaining', async () => {
      const mockTickets = [
        {
          id: 'TKT-001',
          priority: 'HIGH',
          sla_due_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          escalation_chain: ['ops_agent', 'ops_manager'],
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockTickets });

      const tickets = await (worker as any).findNearBreachTickets();

      expect(tickets).toEqual(mockTickets);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('sla_due_at'),
        [10]
      );
    });
  });

  describe('findBreachedTickets', () => {
    it('should find tickets past SLA deadline', async () => {
      const mockTickets = [
        {
          id: 'TKT-002',
          priority: 'CRITICAL',
          sla_due_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          sla_breached: false,
          escalation_chain: ['hq_support', 'ceo_oncall'],
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockTickets });

      const tickets = await (worker as any).findBreachedTickets();

      expect(tickets).toEqual(mockTickets);
    });
  });

  describe('handleNearBreach', () => {
    it('should notify and mark metadata', async () => {
      const mockTicket = {
        id: 'TKT-001',
        owner_id: 'ADM-001',
      };

      (redis.set as jest.Mock).mockResolvedValue('OK');
      (redis.get as jest.Mock).mockResolvedValue('mock-value');
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      await (worker as any).handleNearBreach(mockTicket);

      // Verify metadata updated
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('near_breach_notified'),
        ['TKT-001']
      );

      // Verify audit entry created
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SLA_NEAR_BREACH'),
        expect.any(Array)
      );

      // Verify lock released
      expect(redis.del).toHaveBeenCalled();
    });

    it('should skip if lock cannot be acquired', async () => {
      const mockTicket = { id: 'TKT-001' };

      (redis.set as jest.Mock).mockResolvedValue(null);

      await (worker as any).handleNearBreach(mockTicket);

      // Should not update database
      expect(pool.query).not.toHaveBeenCalled();
    });
  });

  describe('handleBreach', () => {
    it('should escalate to next role in chain', async () => {
      const mockTicket = {
        id: 'TKT-002',
        owner_role: 'ops_agent',
        sla_escalation_level: 0,
        escalation_chain: ['ops_agent', 'ops_manager', 'regional_manager'],
      };

      (redis.set as jest.Mock).mockResolvedValue('OK');
      (redis.get as jest.Mock).mockResolvedValue('mock-value');
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      await (worker as any).handleBreach(mockTicket);

      // Verify ticket escalated
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('owner_role'),
        ['ops_manager', 1, 'TKT-002']
      );

      // Verify audit entry
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AUTO_ESCALATED'),
        expect.any(Array)
      );
    });

    it('should not escalate beyond max level', async () => {
      const mockTicket = {
        id: 'TKT-003',
        sla_escalation_level: 2,
        escalation_chain: ['ops_agent', 'ops_manager', 'regional_manager'],
      };

      (redis.set as jest.Mock).mockResolvedValue('OK');
      (redis.get as jest.Mock).mockResolvedValue('mock-value');
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      await (worker as any).handleBreach(mockTicket);

      // Should only mark as breached, not escalate
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('sla_breached = TRUE'),
        ['TKT-003']
      );
    });
  });

  describe('Worker lifecycle', () => {
    it('should start and stop worker', () => {
      jest.useFakeTimers();

      worker.start();
      expect((worker as any).nearBreachInterval).not.toBeNull();
      expect((worker as any).breachInterval).not.toBeNull();

      worker.stop();
      expect((worker as any).nearBreachInterval).toBeNull();
      expect((worker as any).breachInterval).toBeNull();

      jest.useRealTimers();
    });
  });
});

