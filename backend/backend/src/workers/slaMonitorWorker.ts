/**
 * SLA Monitor Worker
 * 
 * Background job that monitors ticket SLAs and auto-escalates:
 * - Checks every 1 minute for near-breach (<20% time remaining)
 * - Checks every 5 minutes for breached tickets
 * - Auto-escalates to next role in escalation chain
 * - Sends notifications to owner & watchers
 * - Redis locking prevents duplicate processing
 */

import { Pool } from 'pg';
import Redis from 'ioredis';
import notificationService from '../admin/services/notificationService';

interface SLAWorkerConfig {
  nearBreachCheckIntervalMs: number; // Default: 60000 (1 minute)
  breachCheckIntervalMs: number; // Default: 300000 (5 minutes)
  lockTtlMs: number; // Default: 30000 (30 seconds)
  batchSize: number; // Default: 20
}

const DEFAULT_CONFIG: SLAWorkerConfig = {
  nearBreachCheckIntervalMs: 60000, // 1 minute
  breachCheckIntervalMs: 300000, // 5 minutes
  lockTtlMs: 30000, // 30 seconds
  batchSize: 20,
};

export class SLAMonitorWorker {
  private pool: Pool;
  private redis: Redis;
  private config: SLAWorkerConfig;
  private nearBreachInterval: NodeJS.Timeout | null = null;
  private breachInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    pool: Pool,
    redis: Redis,
    config: Partial<SLAWorkerConfig> = {}
  ) {
    this.pool = pool;
    this.redis = redis;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the worker
   */
  start(): void {
    if (this.nearBreachInterval || this.breachInterval) {
      console.log('[SLA-MONITOR] Worker already running');
      return;
    }

    console.log('[SLA-MONITOR] Starting worker...');
    console.log(`[SLA-MONITOR] Near-breach check: every ${this.config.nearBreachCheckIntervalMs}ms`);
    console.log(`[SLA-MONITOR] Breach check: every ${this.config.breachCheckIntervalMs}ms`);

    // Run immediately
    this.checkNearBreach();
    this.checkBreached();

    // Then run at intervals
    this.nearBreachInterval = setInterval(() => {
      this.checkNearBreach();
    }, this.config.nearBreachCheckIntervalMs);

    this.breachInterval = setInterval(() => {
      this.checkBreached();
    }, this.config.breachCheckIntervalMs);

    console.log('[SLA-MONITOR] Worker started');
  }

  /**
   * Stop the worker
   */
  stop(): void {
    if (this.nearBreachInterval) {
      clearInterval(this.nearBreachInterval);
      this.nearBreachInterval = null;
    }
    if (this.breachInterval) {
      clearInterval(this.breachInterval);
      this.breachInterval = null;
    }
    console.log('[SLA-MONITOR] Worker stopped');
  }

  /**
   * Check for tickets nearing SLA breach
   */
  private async checkNearBreach(): Promise<void> {
    if (this.isRunning) {
      console.log('[SLA-MONITOR] Already running, skipping near-breach check');
      return;
    }

    this.isRunning = true;

    try {
      // Find tickets with <20% time remaining
      const tickets = await this.findNearBreachTickets();

      if (tickets.length === 0) {
        console.log('[SLA-MONITOR] No near-breach tickets');
        return;
      }

      console.log(`[SLA-MONITOR] Found ${tickets.length} near-breach tickets`);

      for (const ticket of tickets) {
        await this.handleNearBreach(ticket);
      }
    } catch (error) {
      console.error('[SLA-MONITOR] Error in near-breach check:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Check for breached tickets
   */
  private async checkBreached(): Promise<void> {
    try {
      const tickets = await this.findBreachedTickets();

      if (tickets.length === 0) {
        console.log('[SLA-MONITOR] No breached tickets');
        return;
      }

      console.log(`[SLA-MONITOR] Found ${tickets.length} breached tickets`);

      for (const ticket of tickets) {
        await this.handleBreach(ticket);
      }
    } catch (error) {
      console.error('[SLA-MONITOR] Error in breach check:', error);
    }
  }

  /**
   * Find tickets nearing SLA breach
   */
  private async findNearBreachTickets(): Promise<any[]> {
    const query = `
      SELECT 
        t.id,
        t.title,
        t.priority,
        t.status,
        t.owner_id,
        t.owner_role,
        t.sla_due_at,
        t.sla_escalation_level,
        sc.escalation_chain
      FROM tickets t
      JOIN sla_config sc ON sc.priority = t.priority
      WHERE 
        t.status NOT IN ('RESOLVED', 'CLOSED')
        AND t.sla_due_at IS NOT NULL
        AND t.sla_due_at > NOW()
        AND t.sla_due_at <= NOW() + (
          SELECT resolution_time_minutes * 0.2 
          FROM sla_config 
          WHERE priority = t.priority
        ) * INTERVAL '1 minute'
        AND t.metadata->>'near_breach_notified' IS NULL
      ORDER BY t.sla_due_at ASC
      LIMIT $1
    `;

    const result = await this.pool.query(query, [this.config.batchSize]);
    return result.rows;
  }

  /**
   * Find breached tickets
   */
  private async findBreachedTickets(): Promise<any[]> {
    const query = `
      SELECT 
        t.id,
        t.title,
        t.priority,
        t.status,
        t.owner_id,
        t.owner_role,
        t.sla_due_at,
        t.sla_escalation_level,
        sc.escalation_chain,
        sc.resolution_time_minutes
      FROM tickets t
      JOIN sla_config sc ON sc.priority = t.priority
      WHERE 
        t.status NOT IN ('RESOLVED', 'CLOSED')
        AND t.sla_due_at IS NOT NULL
        AND t.sla_due_at < NOW()
        AND t.sla_breached = FALSE
      ORDER BY t.sla_due_at ASC
      LIMIT $1
    `;

    const result = await this.pool.query(query, [this.config.batchSize]);
    return result.rows;
  }

  /**
   * Handle near-breach ticket
   */
  private async handleNearBreach(ticket: any): Promise<void> {
    const lockKey = `sla-near-breach:${ticket.id}`;
    const lockValue = `${Date.now()}`;

    try {
      // Acquire lock
      const acquired = await this.redis.set(
        lockKey,
        lockValue,
        'PX',
        this.config.lockTtlMs,
        'NX'
      );

      if (!acquired) {
        console.log(`[SLA-MONITOR] Ticket ${ticket.id} already locked for near-breach`);
        return;
      }

      console.log(`[SLA-MONITOR] Near-breach alert for ticket ${ticket.id}`);

      // Update metadata to mark as notified
      await this.pool.query(
        `UPDATE tickets 
         SET metadata = jsonb_set(metadata, '{near_breach_notified}', 'true', true),
             updated_at = NOW()
         WHERE id = $1`,
        [ticket.id]
      );

      // Create audit entry
      await this.pool.query(
        `INSERT INTO ticket_audit (ticket_id, actor_id, actor_role, action, payload, created_at)
         VALUES ($1, 'SYSTEM', 'system', 'SLA_NEAR_BREACH', $2, NOW())`,
        [ticket.id, JSON.stringify({ time_remaining_percent: 20 })]
      );

      // Send notification to owner & watchers
      // TODO: Implement notification dispatch
      console.log(`[SLA-MONITOR] Would notify owner ${ticket.owner_id} and watchers`);

    } catch (error) {
      console.error(`[SLA-MONITOR] Error handling near-breach for ${ticket.id}:`, error);
    } finally {
      // Release lock
      const currentValue = await this.redis.get(lockKey);
      if (currentValue === lockValue) {
        await this.redis.del(lockKey);
      }
    }
  }

  /**
   * Handle breached ticket (escalate)
   */
  private async handleBreach(ticket: any): Promise<void> {
    const lockKey = `sla-breach:${ticket.id}`;
    const lockValue = `${Date.now()}`;

    try {
      // Acquire lock
      const acquired = await this.redis.set(
        lockKey,
        lockValue,
        'PX',
        this.config.lockTtlMs,
        'NX'
      );

      if (!acquired) {
        console.log(`[SLA-MONITOR] Ticket ${ticket.id} already locked for breach`);
        return;
      }

      console.log(`[SLA-MONITOR] SLA BREACHED for ticket ${ticket.id}`);

      // Get escalation chain
      const escalationChain = ticket.escalation_chain as string[];
      const currentLevel = ticket.sla_escalation_level || 0;
      const nextLevel = currentLevel + 1;

      if (nextLevel >= escalationChain.length) {
        console.log(`[SLA-MONITOR] Ticket ${ticket.id} at max escalation level`);
        // Mark as breached but don't escalate further
        await this.pool.query(
          `UPDATE tickets 
           SET sla_breached = TRUE, status = 'ESCALATED', updated_at = NOW()
           WHERE id = $1`,
          [ticket.id]
        );
        return;
      }

      const nextRole = escalationChain[nextLevel];

      // Escalate ticket
      await this.pool.query(
        `UPDATE tickets 
         SET owner_role = $1,
             owner_id = NULL,
             sla_escalation_level = $2,
             sla_breached = TRUE,
             status = 'ESCALATED',
             updated_at = NOW()
         WHERE id = $3`,
        [nextRole, nextLevel, ticket.id]
      );

      // Create audit entry
      await this.pool.query(
        `INSERT INTO ticket_audit (ticket_id, actor_id, actor_role, action, payload, created_at)
         VALUES ($1, 'SYSTEM', 'system', 'AUTO_ESCALATED', $2, NOW())`,
        [
          ticket.id,
          JSON.stringify({
            reason: 'SLA breached',
            old_role: ticket.owner_role,
            new_role: nextRole,
            escalation_level: nextLevel,
          }),
        ]
      );

      console.log(`[SLA-MONITOR] Escalated ticket ${ticket.id} to ${nextRole} (level ${nextLevel})`);

      // Send critical notification
      // TODO: Implement notification dispatch
      console.log(`[SLA-MONITOR] Would send CRITICAL alert to ${nextRole}`);

    } catch (error) {
      console.error(`[SLA-MONITOR] Error handling breach for ${ticket.id}:`, error);
    } finally {
      // Release lock
      const currentValue = await this.redis.get(lockKey);
      if (currentValue === lockValue) {
        await this.redis.del(lockKey);
      }
    }
  }

  /**
   * Simulate SLA escalation (for testing)
   */
  async simulateEscalation(ticketId: string): Promise<void> {
    console.log(`[SLA-MONITOR] SIMULATION: Escalating ticket ${ticketId}`);
    
    const result = await this.pool.query(
      `SELECT t.*, sc.escalation_chain 
       FROM tickets t
       JOIN sla_config sc ON sc.priority = t.priority
       WHERE t.id = $1`,
      [ticketId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    await this.handleBreach(result.rows[0]);
  }
}

// Singleton instance
let workerInstance: SLAMonitorWorker | null = null;

/**
 * Initialize the worker
 */
export const initSLAMonitorWorker = (
  pool: Pool,
  redis: Redis,
  config?: Partial<SLAWorkerConfig>
): SLAMonitorWorker => {
  if (workerInstance) {
    console.log('[SLA-MONITOR] Worker already initialized');
    return workerInstance;
  }

  workerInstance = new SLAMonitorWorker(pool, redis, config);
  return workerInstance;
};

/**
 * Get worker instance
 */
export const getSLAMonitorWorker = (): SLAMonitorWorker | null => {
  return workerInstance;
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SLA-MONITOR] SIGTERM received, stopping worker...');
  if (workerInstance) {
    workerInstance.stop();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[SLA-MONITOR] SIGINT received, stopping worker...');
  if (workerInstance) {
    workerInstance.stop();
  }
  process.exit(0);
});

