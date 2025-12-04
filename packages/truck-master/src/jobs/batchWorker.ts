/**
 * Batch Worker
 * Nightly orchestrator for VAHAN verification with failover
 */

import { query } from '../db';
import { VahanClient } from '../services/vahanClient';
import { normalizeVahanResponse, validateSnapshot } from '../services/normalizer';
import { inferBodyLength } from '../services/inference';
import { checkCompliance } from '../services/complianceEngine';
import { createTicket } from '../services/ticketing';
import { hashChassis, hashEngine } from '../services/hashUtil';
import type { VahanResponse } from '../services/vahanClient';

export interface BatchWorkerConfig {
  concurrency?: number;
  batchSize?: number;
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
  private vahanClient: VahanClient;
  private config: Required<BatchWorkerConfig>;

  constructor(vahanClient: VahanClient, config: BatchWorkerConfig = {}) {
    this.vahanClient = vahanClient;
    this.config = {
      concurrency: config.concurrency || 10,
      batchSize: config.batchSize || 100,
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

    // Get trucks needing verification
    const trucks = await this.getTrucksNeedingVerification();
    result.totalProcessed = trucks.length;

    // Process in batches
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
  private async getTrucksNeedingVerification(): Promise<Array<{ rc_number: string; operator_id: string }>> {
    const result = await query(
      `SELECT ot.rc_number, ot.operator_id
       FROM operator_trucks ot
       LEFT JOIN vehicle_compliance_cache vcc
         ON ot.rc_number = vcc.rc_number
         AND ot.operator_id = vcc.operator_id
       WHERE ot.status = 'PENDING_VERIFICATION'
          OR vcc.rc_number IS NULL
          OR vcc.cache_expires_at < NOW()
          OR vcc.last_verified_at IS NULL
          OR (vcc.last_verified_at < NOW() - INTERVAL '7 days')
       ORDER BY vcc.last_verified_at NULLS FIRST
       LIMIT 10000`
    );

    return result.rows;
  }

  /**
   * Process a single truck
   */
  private async processTruck(truck: { rc_number: string; operator_id: string }): Promise<{
    rcNumber: string;
    success: boolean;
    error?: string;
    ticketCreated?: boolean;
  }> {
    let vahanResponse: VahanResponse | null = null;

    try {
      vahanResponse = await this.vahanClient.verifyRC(truck.rc_number);
    } catch (error: any) {
      await this.logVerificationFailure(truck.rc_number, error.message);
      return {
        rcNumber: truck.rc_number,
        success: false,
        error: error.message,
      };
    }

    if (!vahanResponse || !vahanResponse.success) {
      await this.logVerificationFailure(truck.rc_number, 'All providers failed');
      return {
        rcNumber: truck.rc_number,
        success: false,
        error: 'All providers failed',
      };
    }

    // Store snapshot
    await this.storeVahanSnapshot(truck.rc_number, vahanResponse);

    // Check for provider mismatches
    const mismatchCheck = await this.checkProviderMismatch(truck.rc_number, vahanResponse);
    let ticketCreated = false;

    if (mismatchCheck.hasMismatch) {
      await createTicket(query, {
        ticketType: 'PROVIDER_MISMATCH',
        rcNumber: truck.rc_number,
        operatorId: truck.operator_id,
        payload: mismatchCheck.payload,
      });
      ticketCreated = true;
    }

    // Run inference
    const snapshot = normalizeVahanResponse(vahanResponse.data, vahanResponse.provider);
    const inference = await inferBodyLength(snapshot);

    // Store inference
    await this.storeInference(truck.rc_number, inference);

    // Run compliance check
    try {
      const complianceDecision = await checkCompliance({
        rc_number: truck.rc_number,
        operator_id: truck.operator_id,
        vahan_response: vahanResponse,
      });

      // Create ticket if blocked with critical reasons
      if (!complianceDecision.allow) {
        const criticalReasons = complianceDecision.reasons.filter(r =>
          r.includes('DUPLICATE') || r.includes('INVALID_LENGTH_FOR_CLASS')
        );

        if (criticalReasons.length > 0) {
          await createTicket(query, {
            ticketType: 'COMPLIANCE_BLOCK',
            rcNumber: truck.rc_number,
            operatorId: truck.operator_id,
            payload: {
              complianceStatus: complianceDecision.allow,
              reasonCodes: complianceDecision.reasons,
              classification: inference.inferred_length_ft,
            },
          });
          ticketCreated = true;
        }
      }

      // Log audit event
      await this.logAuditEvent(truck.rc_number, truck.operator_id, {
        event_type: 'VERIFICATION_SUCCESS',
        provider: vahanResponse.provider,
        txn_id: vahanResponse.txnId,
        decision: complianceDecision,
        rules_applied: complianceDecision.rules_applied,
        inference_confidence: inference.confidence,
      });

      return {
        rcNumber: truck.rc_number,
        success: true,
        ticketCreated,
      };
    } catch (error: any) {
      return {
        rcNumber: truck.rc_number,
        success: false,
        error: error.message || 'Compliance check failed',
      };
    }
  }

  /**
   * Store VAHAN snapshot
   */
  private async storeVahanSnapshot(rcNumber: string, response: VahanResponse): Promise<void> {
    const snapshot = normalizeVahanResponse(response.data, response.provider);
    const chassisHash = snapshot.chassis_number ? hashChassis(snapshot.chassis_number) : null;
    const engineHash = snapshot.engine_number ? hashEngine(snapshot.engine_number) : null;

    await query(
      `INSERT INTO vahan_vehicle_snapshot (
        rc_number, provider, txn_id, vahan_timestamp,
        maker, model_name, model_code, gvw_kg, ulw_kg, wheelbase_mm,
        body_type_code, body_type_name, vehicle_category,
        permit_type, permit_valid_upto, fitness_valid_upto,
        insurance_valid_upto, puc_valid_upto, registration_status,
        chassis_number, engine_number, chassis_hash, engine_hash,
        raw_json, normalized_json, verification_status, verified_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
      ON CONFLICT (rc_number, provider, txn_id) DO NOTHING`,
      [
        rcNumber,
        response.provider,
        response.txnId,
        response.timestamp,
        snapshot.maker,
        snapshot.model_name,
        snapshot.model_code,
        snapshot.gvw_kg,
        snapshot.ulw_kg,
        snapshot.wheelbase_mm,
        snapshot.body_type_code,
        snapshot.body_type_name,
        snapshot.vehicle_category,
        snapshot.permit_type,
        snapshot.permit_valid_upto,
        snapshot.fitness_valid_upto,
        snapshot.insurance_valid_upto,
        snapshot.puc_valid_upto,
        snapshot.registration_status,
        snapshot.chassis_number,
        snapshot.engine_number,
        chassisHash,
        engineHash,
        JSON.stringify(response.data),
        JSON.stringify(snapshot),
        'SUCCESS',
        new Date(),
      ]
    );
  }

  /**
   * Store inference
   */
  private async storeInference(rcNumber: string, inference: any): Promise<void> {
    await query(
      `INSERT INTO vehicle_inference (
        rc_number, inferred_body_type, inferred_length_ft,
        candidate_lengths, confidence_score, inference_method,
        rules_applied
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (rc_number)
      DO UPDATE SET
        inferred_body_type = EXCLUDED.inferred_body_type,
        inferred_length_ft = EXCLUDED.inferred_length_ft,
        candidate_lengths = EXCLUDED.candidate_lengths,
        confidence_score = EXCLUDED.confidence_score,
        inference_method = EXCLUDED.inference_method,
        rules_applied = EXCLUDED.rules_applied,
        updated_at = CURRENT_TIMESTAMP`,
      [
        rcNumber,
        null, // Would be set by classifier
        inference.inferred_length_ft,
        JSON.stringify(inference.candidate_lengths),
        inference.confidence,
        inference.method,
        inference.rules_applied,
      ]
    );
  }

  /**
   * Log verification failure
   */
  private async logVerificationFailure(rcNumber: string, error: string): Promise<void> {
    await query(
      `INSERT INTO vahan_vehicle_snapshot (
        rc_number, provider, raw_json, verification_status, error_message, verified_at
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [rcNumber, 'FAILED', JSON.stringify({ error }), 'FAILED', error, new Date()]
    );
  }

  /**
   * Check for provider mismatches
   */
  private async checkProviderMismatch(
    rcNumber: string,
    currentResponse: VahanResponse
  ): Promise<{ hasMismatch: boolean; payload?: any }> {
    const result = await query(
      `SELECT provider, normalized_json, verified_at
       FROM vahan_vehicle_snapshot
       WHERE rc_number = $1
       AND verification_status = 'SUCCESS'
       AND provider != $2
       ORDER BY verified_at DESC
       LIMIT 1`,
      [rcNumber, currentResponse.provider]
    );

    if (result.rows.length === 0) {
      return { hasMismatch: false };
    }

    const previous = result.rows[0];
    const currentSnapshot = normalizeVahanResponse(currentResponse.data, currentResponse.provider);

    const mismatches: string[] = [];
    if (previous.normalized_json?.vehicle_category !== currentSnapshot.vehicle_category) {
      mismatches.push(`vehicle_category: ${previous.normalized_json?.vehicle_category} vs ${currentSnapshot.vehicle_category}`);
    }
    if (previous.normalized_json?.gvw_kg !== currentSnapshot.gvw_kg) {
      mismatches.push(`gvw_kg: ${previous.normalized_json?.gvw_kg} vs ${currentSnapshot.gvw_kg}`);
    }

    if (mismatches.length > 0) {
      return {
        hasMismatch: true,
        payload: {
          previousProvider: previous.provider,
          currentProvider: currentResponse.provider,
          mismatches,
          previousData: previous.normalized_json,
          currentData: currentSnapshot,
        },
      };
    }

    return { hasMismatch: false };
  }

  /**
   * Log audit event
   */
  private async logAuditEvent(
    rcNumber: string,
    operatorId: string,
    eventData: any
  ): Promise<void> {
    await query(
      `INSERT INTO verification_audit_log (
        rc_number, operator_id, event_type, provider, txn_id,
        decision, rules_applied, inference_confidence
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        rcNumber,
        operatorId,
        eventData.event_type,
        eventData.provider,
        eventData.txn_id,
        JSON.stringify(eventData.decision),
        eventData.rules_applied,
        eventData.inference_confidence,
      ]
    );
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

