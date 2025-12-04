/**
 * Batch Worker
 * Nightly batch orchestrator with failover: Parivahan → Surepass → Backup
 * Concurrency controls, logs txn_id, produces HQ tickets for discrepancies
 */

import { Pool } from 'pg';
import { VahanClient, type VahanResponse } from './vahanClient';
import { ComplianceEngine } from './complianceEngine';
import { createTicket, type TicketPayload } from './ticketing';
import { normalizeVahanResponse } from './normalizer';

export interface BatchWorkerConfig {
  concurrency?: number;
  batchSize?: number;
  retryFailed?: boolean;
  maxRetries?: number;
}

export interface BatchWorkerResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  ticketsCreated: number;
  errors: Array<{ rcNumber: string; error: string }>;
}

/**
 * Batch Worker for nightly VAHAN verification
 */
export class BatchWorker {
  private db: Pool;
  private vahanClient: VahanClient;
  private complianceEngine: ComplianceEngine;
  private config: Required<BatchWorkerConfig>;

  constructor(
    db: Pool,
    vahanClient: VahanClient,
    complianceEngine: ComplianceEngine,
    config: BatchWorkerConfig = {}
  ) {
    this.db = db;
    this.vahanClient = vahanClient;
    this.complianceEngine = complianceEngine;
    this.config = {
      concurrency: config.concurrency || 10,
      batchSize: config.batchSize || 100,
      retryFailed: config.retryFailed !== false,
      maxRetries: config.maxRetries || 3,
    };
  }

  /**
   * Run nightly batch verification
   */
  async runBatchVerification(): Promise<BatchWorkerResult> {
    const result: BatchWorkerResult = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      ticketsCreated: 0,
      errors: [],
    };

    // Get all trucks that need verification (cache expired or never verified)
    const trucks = await this.getTrucksNeedingVerification();

    result.totalProcessed = trucks.length;

    // Process in batches with concurrency control
    const batches = this.chunkArray(trucks, this.config.batchSize);

    for (const batch of batches) {
      const batchResults = await Promise.allSettled(
        batch.map(truck => this.processTruck(truck))
      );

      for (const batchResult of batchResults) {
        if (batchResult.status === 'fulfilled') {
          const truckResult = batchResult.value;
          if (truckResult.success) {
            result.successful++;
          } else {
            result.failed++;
            result.errors.push({
              rcNumber: truckResult.rcNumber,
              error: truckResult.error || 'Unknown error',
            });
          }
          if (truckResult.ticketCreated) {
            result.ticketsCreated++;
          }
        } else {
          result.failed++;
          result.errors.push({
            rcNumber: 'UNKNOWN',
            error: batchResult.reason?.message || 'Processing error',
          });
        }
      }
    }

    return result;
  }

  /**
   * Get trucks needing verification
   */
  private async getTrucksNeedingVerification(): Promise<Array<{ rcNumber: string; operatorId: string }>> {
    const query = `
      SELECT ot.rc_number, ot.operator_id
      FROM operator_trucks ot
      LEFT JOIN vehicle_compliance_cache vcc
        ON ot.rc_number = vcc.rc_number
        AND ot.operator_id = vcc.operator_id
      WHERE ot.status = 'ACTIVE'
      AND (
        vcc.rc_number IS NULL
        OR vcc.cache_expires_at < NOW()
        OR vcc.last_verification_at IS NULL
      )
      ORDER BY vcc.last_verification_at NULLS FIRST
      LIMIT 10000
    `;

    const result = await this.db.query(query);
    return result.rows;
  }

  /**
   * Process a single truck
   */
  private async processTruck(truck: { rcNumber: string; operatorId: string }): Promise<{
    rcNumber: string;
    success: boolean;
    error?: string;
    ticketCreated?: boolean;
  }> {
    let lastError: string | undefined;
    let vahanResponse: VahanResponse | null = null;

    // Try verification with failover
    try {
      vahanResponse = await this.vahanClient.verifyRC(truck.rcNumber);
    } catch (error: any) {
      lastError = error.message || 'VAHAN verification failed';
    }

    if (!vahanResponse || !vahanResponse.success) {
      // Log failure to vahan_vehicle_snapshot
      await this.logVerificationFailure(truck.rcNumber, lastError || 'All providers failed');
      return {
        rcNumber: truck.rcNumber,
        success: false,
        error: lastError || 'All providers failed',
      };
    }

    // Store raw VAHAN response
    await this.storeVahanSnapshot(truck.rcNumber, vahanResponse);

    // Check for provider mismatches (compare with previous verification)
    const mismatchCheck = await this.checkProviderMismatch(truck.rcNumber, vahanResponse);
    if (mismatchCheck.hasMismatch) {
      // Create HQ ticket
      await createTicket(this.db, {
        ticketType: 'PROVIDER_MISMATCH',
        rcNumber: truck.rcNumber,
        operatorId: truck.operatorId,
        payload: mismatchCheck.payload,
      });
    }

    // Run compliance check
    try {
      const complianceDecision = await this.complianceEngine.checkCompliance({
        rcNumber: truck.rcNumber,
        operatorId: truck.operatorId,
        vahanResponse,
      });

      // If blocked, create ticket if needed
      if (complianceDecision.status === 'BLOCKED' && complianceDecision.reasonCodes.length > 0) {
        const shouldCreateTicket = complianceDecision.reasonCodes.some(code =>
          code.includes('DUPLICATE') || code.includes('PROVIDER_MISMATCH')
        );

        if (shouldCreateTicket) {
          await createTicket(this.db, {
            ticketType: 'COMPLIANCE_BLOCK',
            rcNumber: truck.rcNumber,
            operatorId: truck.operatorId,
            payload: {
              complianceStatus: complianceDecision.status,
              reasonCodes: complianceDecision.reasonCodes,
              classification: complianceDecision.classification,
            },
          });
        }
      }

      return {
        rcNumber: truck.rcNumber,
        success: true,
        ticketCreated: mismatchCheck.hasMismatch || complianceDecision.status === 'BLOCKED',
      };
    } catch (error: any) {
      return {
        rcNumber: truck.rcNumber,
        success: false,
        error: error.message || 'Compliance check failed',
      };
    }
  }

  /**
   * Store VAHAN snapshot
   */
  private async storeVahanSnapshot(rcNumber: string, response: VahanResponse): Promise<void> {
    const query = `
      INSERT INTO vahan_vehicle_snapshot (
        rc_number, provider, txn_id, raw_json, normalized_data,
        chassis_hash, engine_hash, verification_status, verified_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (rc_number, provider, txn_id) DO NOTHING
    `;

    const normalized = normalizeVahanResponse(response.data, response.provider);
    const { hashChassis, hashEngine } = await import('./hashUtil');

    await this.db.query(query, [
      rcNumber,
      response.provider,
      response.txnId,
      JSON.stringify(response.data),
      JSON.stringify(normalized),
      normalized.chassisNumber ? hashChassis(normalized.chassisNumber) : null,
      normalized.engineNumber ? hashEngine(normalized.engineNumber) : null,
      response.success ? 'SUCCESS' : 'FAILED',
      new Date(),
    ]);
  }

  /**
   * Log verification failure
   */
  private async logVerificationFailure(rcNumber: string, error: string): Promise<void> {
    const query = `
      INSERT INTO vahan_vehicle_snapshot (
        rc_number, provider, raw_json, verification_status, error_message, verified_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `;

    await this.db.query(query, [
      rcNumber,
      'FAILED',
      JSON.stringify({ error }),
      'FAILED',
      error,
      new Date(),
    ]);
  }

  /**
   * Check for provider mismatches
   */
  private async checkProviderMismatch(
    rcNumber: string,
    currentResponse: VahanResponse
  ): Promise<{ hasMismatch: boolean; payload?: any }> {
    const query = `
      SELECT provider, normalized_data, verified_at
      FROM vahan_vehicle_snapshot
      WHERE rc_number = $1
      AND verification_status = 'SUCCESS'
      AND provider != $2
      ORDER BY verified_at DESC
      LIMIT 1
    `;

    const result = await this.db.query(query, [rcNumber, currentResponse.provider]);

    if (result.rows.length === 0) {
      return { hasMismatch: false };
    }

    const previous = result.rows[0];
    const currentNormalized = normalizeVahanResponse(currentResponse.data, currentResponse.provider);

    // Compare key fields
    const mismatches: string[] = [];
    if (previous.normalized_data.vehicleCategory !== currentNormalized.vehicleCategory) {
      mismatches.push(`vehicleCategory: ${previous.normalized_data.vehicleCategory} vs ${currentNormalized.vehicleCategory}`);
    }
    if (previous.normalized_data.gvwKg !== currentNormalized.gvwKg) {
      mismatches.push(`gvwKg: ${previous.normalized_data.gvwKg} vs ${currentNormalized.gvwKg}`);
    }

    if (mismatches.length > 0) {
      return {
        hasMismatch: true,
        payload: {
          previousProvider: previous.provider,
          currentProvider: currentResponse.provider,
          mismatches,
          previousData: previous.normalized_data,
          currentData: currentNormalized,
        },
      };
    }

    return { hasMismatch: false };
  }

  /**
   * Chunk array into batches
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

