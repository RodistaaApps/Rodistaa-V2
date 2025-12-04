/**
 * Compliance Engine
 * Applies all rules to decide allow/block and reasons
 * Writes to vehicle_compliance_cache
 */

import { Pool } from 'pg';
import { hashChassis, hashEngine } from './hashUtil';
import { classifyFleetType, type ClassificationResult } from './classifier';
import { normalizeVahanResponse, type VahanSnapshot, validateSnapshot } from './normalizer';
import { BodyLengthInference } from './inference';
import type { VahanResponse } from './vahanClient';
import fleetMatrix from '../data/rodistaa_fleet_matrix.json';

export type ComplianceStatus = 'ALLOWED' | 'BLOCKED' | 'PENDING';
export type ReasonCode = string;

export interface ComplianceDecision {
  status: ComplianceStatus;
  reasonCodes: ReasonCode[];
  classification?: string;
  bodyCategory?: string;
  cacheExpiresAt: Date;
  lastVerificationAt: Date;
  lastVerificationProvider: string;
  lastVerificationTxnId?: string;
}

export interface ComplianceCheckInput {
  rcNumber: string;
  operatorId: string;
  vahanResponse: VahanResponse;
  gpsLastPingAt?: Date;
  permitValidUntil?: string;
  isTrailer?: boolean;
  linkedTractorRc?: string;
}

/**
 * Compliance Engine
 */
export class ComplianceEngine {
  private db: Pool;
  private inferenceEngine: BodyLengthInference;

  constructor(db: Pool) {
    this.db = db;
    this.inferenceEngine = new BodyLengthInference(db);
  }

  /**
   * Check compliance for a vehicle
   */
  async checkCompliance(input: ComplianceCheckInput): Promise<ComplianceDecision> {
    const { rcNumber, operatorId, vahanResponse, gpsLastPingAt, permitValidUntil, isTrailer, linkedTractorRc } = input;

    // Normalize VAHAN response
    const snapshot = normalizeVahanResponse(vahanResponse.data, vahanResponse.provider);
    
    // Validate snapshot
    const validation = validateSnapshot(snapshot);
    if (!validation.valid) {
      return {
        status: 'BLOCKED',
        reasonCodes: validation.errors,
        cacheExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastVerificationAt: new Date(),
        lastVerificationProvider: vahanResponse.provider,
        lastVerificationTxnId: vahanResponse.txnId,
      };
    }

    const reasonCodes: ReasonCode[] = [];
    let status: ComplianceStatus = 'ALLOWED';

    // Check duplicate chassis/engine
    const duplicateCheck = await this.checkDuplicates(snapshot, operatorId);
    if (duplicateCheck.isDuplicate) {
      status = 'BLOCKED';
      reasonCodes.push(duplicateCheck.reasonCode);
    }

    // Classify fleet type
    const classification = classifyFleetType(snapshot);
    if (classification.isBlocked) {
      status = 'BLOCKED';
      reasonCodes.push(...classification.blockReasons);
    }

    // Check permit
    const permitCheck = this.checkPermit(permitValidUntil, snapshot.permitType);
    if (!permitCheck.allowed) {
      status = 'BLOCKED';
      reasonCodes.push(permitCheck.reasonCode!);
    }

    // Check GPS heartbeat
    const gpsCheck = this.checkGPSHeartbeat(gpsLastPingAt);
    if (!gpsCheck.allowed) {
      status = 'BLOCKED';
      reasonCodes.push(gpsCheck.reasonCode!);
    }

    // Check trailer pairing
    if (isTrailer && !linkedTractorRc) {
      status = 'BLOCKED';
      reasonCodes.push('PENDING_TRACTOR_PAIRING');
    }

    // Check operator truck limit
    const operatorLimitCheck = await this.checkOperatorLimit(operatorId);
    if (!operatorLimitCheck.allowed) {
      status = 'BLOCKED';
      reasonCodes.push(operatorLimitCheck.reasonCode!);
    }

    // Infer body length
    const inference = await this.inferenceEngine.inferBodyLength(snapshot);

    // Calculate cache expiry (7 days from now)
    const cacheExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const decision: ComplianceDecision = {
      status,
      reasonCodes,
      classification: classification.classification,
      bodyCategory: classification.bodyCategory,
      cacheExpiresAt,
      lastVerificationAt: new Date(),
      lastVerificationProvider: vahanResponse.provider,
      lastVerificationTxnId: vahanResponse.txnId,
    };

    // Write to cache
    await this.writeToCache(rcNumber, operatorId, snapshot, decision, inference);

    return decision;
  }

  /**
   * Check for duplicate chassis/engine
   */
  private async checkDuplicates(
    snapshot: VahanSnapshot,
    operatorId: string
  ): Promise<{ isDuplicate: boolean; reasonCode?: ReasonCode }> {
    const chassisHash = hashChassis(snapshot.chassisNumber);
    const engineHash = hashEngine(snapshot.engineNumber);

    const query = `
      SELECT rc_number, operator_id
      FROM vehicle_compliance_cache
      WHERE (chassis_hash = $1 OR engine_hash = $2)
      AND (rc_number != $3 OR operator_id != $4)
      LIMIT 1
    `;

    try {
      const result = await this.db.query(query, [
        chassisHash,
        engineHash,
        snapshot.rcNumber,
        operatorId,
      ]);

      if (result.rows.length > 0) {
        const duplicate = result.rows[0];
        return {
          isDuplicate: true,
          reasonCode: `DUPLICATE_CHASSIS_${duplicate.rc_number}_${duplicate.operator_id}`,
        };
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
    }

    return { isDuplicate: false };
  }

  /**
   * Check permit validity
   */
  private checkPermit(
    permitValidUntil?: string,
    permitType?: string
  ): { allowed: boolean; reasonCode?: ReasonCode } {
    // Block temporary/private/non-transport permits
    const blockedTypes = fleetMatrix.blocked_patterns.permit_types_blocked || [];
    if (permitType && blockedTypes.some(type => permitType.toUpperCase().includes(type))) {
      return {
        allowed: false,
        reasonCode: `BLOCKED_PERMIT_TYPE_${permitType}`,
      };
    }

    // Allow blank permit (inconsistent VAHAN fields)
    if (!permitValidUntil || permitValidUntil.trim() === '') {
      return { allowed: true };
    }

    // Check expiry (block if < 7 days)
    const expiryDate = new Date(permitValidUntil);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return {
        allowed: false,
        reasonCode: 'PERMIT_EXPIRED',
      };
    }

    if (daysUntilExpiry < 7) {
      return {
        allowed: false,
        reasonCode: `PERMIT_EXPIRING_SOON_${daysUntilExpiry}_DAYS`,
      };
    }

    return { allowed: true };
  }

  /**
   * Check GPS heartbeat
   */
  private checkGPSHeartbeat(gpsLastPingAt?: Date): { allowed: boolean; reasonCode?: ReasonCode } {
    if (!gpsLastPingAt) {
      return {
        allowed: false,
        reasonCode: 'GPS_NO_PING',
      };
    }

    const now = new Date();
    const minutesSincePing = Math.floor((now.getTime() - gpsLastPingAt.getTime()) / (1000 * 60));

    const staleThreshold = fleetMatrix.validation_rules.gps_stale_threshold_minutes || 60;

    if (minutesSincePing > staleThreshold) {
      return {
        allowed: false,
        reasonCode: `GPS_STALE_${minutesSincePing}_MINUTES`,
      };
    }

    return { allowed: true };
  }

  /**
   * Check operator truck limit
   */
  private async checkOperatorLimit(operatorId: string): Promise<{ allowed: boolean; reasonCode?: ReasonCode }> {
    const maxTrucks = fleetMatrix.validation_rules.max_trucks_per_operator || 10;

    const query = `
      SELECT COUNT(*) as count
      FROM operator_trucks
      WHERE operator_id = $1
      AND status = 'ACTIVE'
    `;

    try {
      const result = await this.db.query(query, [operatorId]);
      const count = parseInt(result.rows[0].count, 10);

      if (count >= maxTrucks) {
        return {
          allowed: false,
          reasonCode: `OPERATOR_LIMIT_EXCEEDED_${count}_${maxTrucks}`,
        };
      }
    } catch (error) {
      console.error('Error checking operator limit:', error);
    }

    return { allowed: true };
  }

  /**
   * Write compliance decision to cache
   */
  private async writeToCache(
    rcNumber: string,
    operatorId: string,
    snapshot: VahanSnapshot,
    decision: ComplianceDecision,
    inference: any
  ): Promise<void> {
    const chassisHash = hashChassis(snapshot.chassisNumber);
    const engineHash = hashEngine(snapshot.engineNumber);

    const query = `
      INSERT INTO vehicle_compliance_cache (
        rc_number, operator_id, compliance_status, reason_codes,
        last_verification_at, last_verification_provider, last_verification_txn_id,
        cache_expires_at, gps_last_ping_at, gps_status,
        permit_valid_until, permit_status,
        chassis_hash, engine_hash, is_duplicate_chassis, is_duplicate_engine,
        gvw_kg, tyre_count, axle_count, body_length_ft,
        emission_code, body_type_category, fleet_classification
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23
      )
      ON CONFLICT (rc_number, operator_id)
      DO UPDATE SET
        compliance_status = EXCLUDED.compliance_status,
        reason_codes = EXCLUDED.reason_codes,
        last_verification_at = EXCLUDED.last_verification_at,
        last_verification_provider = EXCLUDED.last_verification_provider,
        last_verification_txn_id = EXCLUDED.last_verification_txn_id,
        cache_expires_at = EXCLUDED.cache_expires_at,
        gps_last_ping_at = EXCLUDED.gps_last_ping_at,
        gps_status = EXCLUDED.gps_status,
        permit_valid_until = EXCLUDED.permit_valid_until,
        permit_status = EXCLUDED.permit_status,
        chassis_hash = EXCLUDED.chassis_hash,
        engine_hash = EXCLUDED.engine_hash,
        is_duplicate_chassis = EXCLUDED.is_duplicate_chassis,
        is_duplicate_engine = EXCLUDED.is_duplicate_engine,
        gvw_kg = EXCLUDED.gvw_kg,
        tyre_count = EXCLUDED.tyre_count,
        axle_count = EXCLUDED.axle_count,
        body_length_ft = EXCLUDED.body_length_ft,
        emission_code = EXCLUDED.emission_code,
        body_type_category = EXCLUDED.body_type_category,
        fleet_classification = EXCLUDED.fleet_classification,
        updated_at = CURRENT_TIMESTAMP
    `;

    try {
      await this.db.query(query, [
        rcNumber,
        operatorId,
        decision.status,
        decision.reasonCodes,
        decision.lastVerificationAt,
        decision.lastVerificationProvider,
        decision.lastVerificationTxnId,
        decision.cacheExpiresAt,
        null, // gps_last_ping_at (would be set separately)
        'UNKNOWN', // gps_status
        snapshot.permitValidUntil || null,
        snapshot.permitValidUntil ? 'VALID' : 'BLANK',
        chassisHash,
        engineHash,
        false, // is_duplicate_chassis (checked separately)
        false, // is_duplicate_engine
        snapshot.gvwKg || null,
        snapshot.tyreCount || null,
        snapshot.axleCount || null,
        inference.inferredLengthFt || null,
        snapshot.emissionCode || null,
        decision.bodyCategory || null,
        decision.classification || null,
      ]);
    } catch (error) {
      console.error('Error writing to compliance cache:', error);
      throw error;
    }
  }
}

