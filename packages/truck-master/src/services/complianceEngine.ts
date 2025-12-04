/**
 * Compliance Engine
 * Applies all rules to decide allow/block and reasons
 * Writes to vehicle_compliance_cache
 */

import { query, transaction } from '../db';
import { hashChassis, hashEngine } from './hashUtil';
import { classifyFleetType } from './classifier';
import { normalizeVahanResponse, validateSnapshot } from './normalizer';
import { inferBodyLength } from './inference';
import type { VahanSnapshot } from '../models/vahanSnapshot';
import type { ComplianceDecision } from '../models/compliance';
import type { VahanResponse } from '@rodistaa/fleet-verification';

export interface ComplianceCheckInput {
  rc_number: string;
  operator_id: string;
  vahan_response: VahanResponse;
  gps_last_ping_at?: Date;
  is_trailer?: boolean;
  linked_tractor_rc?: string;
}

/**
 * Check compliance for a vehicle
 */
export async function checkCompliance(input: ComplianceCheckInput): Promise<ComplianceDecision> {
  const { rc_number, operator_id, vahan_response, gps_last_ping_at, is_trailer, linked_tractor_rc } = input;

  // Normalize VAHAN response
  const snapshot = normalizeVahanResponse(vahan_response.data, vahan_response.provider);
  
  // Validate snapshot
  const validation = validateSnapshot(snapshot);
  if (!validation.valid) {
    return {
      allow: false,
      reasons: validation.errors,
      decision_at: new Date(),
      provider: vahan_response.provider,
      last_verified_at: null,
      rules_applied: ['VALIDATION_CHECK'],
    };
  }

  const reasons: string[] = [];
  const rulesApplied: string[] = [];
  let allow = true;

  // Check duplicate chassis/engine
  const duplicateCheck = await checkDuplicates(snapshot, operator_id);
  if (duplicateCheck.isDuplicate) {
    allow = false;
    reasons.push(duplicateCheck.reasonCode!);
    rulesApplied.push('DUPLICATE_CHECK');
  }

  // Infer body length
  const inference = await inferBodyLength(snapshot);
  rulesApplied.push(...inference.rules_applied);

  // Classify fleet type
  const classification = classifyFleetType(snapshot, inference.inferred_length_ft);
  if (classification.isBlocked) {
    allow = false;
    reasons.push(...classification.blockReasons);
    rulesApplied.push(...classification.rules_applied);
  }

  // Check permit
  const permitCheck = checkPermit(snapshot.permit_valid_upto, snapshot.permit_type);
  if (!permitCheck.allowed) {
    allow = false;
    reasons.push(permitCheck.reasonCode!);
    rulesApplied.push('PERMIT_CHECK');
  }

  // Check fitness
  const fitnessCheck = checkFitness(snapshot.fitness_valid_upto);
  if (!fitnessCheck.allowed) {
    allow = false;
    reasons.push(fitnessCheck.reasonCode!);
    rulesApplied.push('FITNESS_CHECK');
  }

  // Check insurance
  const insuranceCheck = checkInsurance(snapshot.insurance_valid_upto);
  if (!insuranceCheck.allowed) {
    allow = false;
    reasons.push(insuranceCheck.reasonCode!);
    rulesApplied.push('INSURANCE_CHECK');
  }

  // Check PUC
  const pucCheck = checkPUC(snapshot.puc_valid_upto);
  if (!pucCheck.allowed) {
    allow = false;
    reasons.push(pucCheck.reasonCode!);
    rulesApplied.push('PUC_CHECK');
  }

  // Check vehicle category (GOODS only)
  if (snapshot.vehicle_category && snapshot.vehicle_category !== 'GOODS') {
    allow = false;
    reasons.push(`INVALID_CATEGORY_${snapshot.vehicle_category}`);
    rulesApplied.push('CATEGORY_CHECK');
  }

  // Check GPS heartbeat
  const gpsCheck = checkGPSHeartbeat(gps_last_ping_at);
  if (!gpsCheck.allowed) {
    allow = false;
    reasons.push(gpsCheck.reasonCode!);
    rulesApplied.push('GPS_CHECK');
  }

  // Check trailer pairing
  if (is_trailer && !linked_tractor_rc) {
    allow = false;
    reasons.push('PENDING_TRACTOR_PAIRING');
    rulesApplied.push('TRAILER_PAIRING_CHECK');
  }

  // Check operator truck limit
  const operatorLimitCheck = await checkOperatorLimit(operator_id);
  if (!operatorLimitCheck.allowed) {
    allow = false;
    reasons.push(operatorLimitCheck.reasonCode!);
    rulesApplied.push('OPERATOR_LIMIT_CHECK');
  }

  const decision: ComplianceDecision = {
    allow,
    reasons,
    decision_at: new Date(),
    provider: vahan_response.provider,
    last_verified_at: vahan_response.timestamp,
    rules_applied: rulesApplied,
    inference_confidence: inference.confidence,
  };

  // Write to cache
  await writeToCache(rc_number, operator_id, snapshot, decision, inference);

  return decision;
}

/**
 * Check for duplicate chassis/engine
 */
async function checkDuplicates(
  snapshot: VahanSnapshot,
  operator_id: string
): Promise<{ isDuplicate: boolean; reasonCode?: string }> {
  const chassisHash = hashChassis(snapshot.chassis_number!);
  const engineHash = hashEngine(snapshot.engine_number!);

  const result = await query(
    `SELECT rc_number, operator_id
     FROM vehicle_compliance_cache
     WHERE (chassis_hash = $1 OR engine_hash = $2)
     AND (rc_number != $3 OR operator_id != $4)
     LIMIT 1`,
    [chassisHash, engineHash, snapshot.rc_number, operator_id]
  );

  if (result.rows.length > 0) {
    const duplicate = result.rows[0];
    return {
      isDuplicate: true,
      reasonCode: `DUPLICATE_CHASSIS_${duplicate.rc_number}_${duplicate.operator_id}`,
    };
  }

  return { isDuplicate: false };
}

/**
 * Check permit validity
 */
function checkPermit(permitValidUpto?: string, permitType?: string): { allowed: boolean; reasonCode?: string } {
  // Block temporary/private/non-transport permits
  const blockedTypes = ['TEMPORARY', 'PRIVATE', 'NON-TRANSPORT'];
  if (permitType && blockedTypes.some(type => permitType.toUpperCase().includes(type))) {
    return {
      allowed: false,
      reasonCode: `BLOCKED_PERMIT_TYPE_${permitType}`,
    };
  }

  // Allow blank permit (inconsistent VAHAN fields)
  if (!permitValidUpto || permitValidUpto.trim() === '') {
    return { allowed: true };
  }

  // Check expiry
  const expiryDate = new Date(permitValidUpto);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return { allowed: false, reasonCode: 'PERMIT_EXPIRED' };
  }

  if (daysUntilExpiry < 7) {
    return { allowed: false, reasonCode: `PERMIT_EXPIRING_SOON_${daysUntilExpiry}_DAYS` };
  }

  return { allowed: true };
}

/**
 * Check fitness validity
 */
function checkFitness(fitnessValidUpto?: string): { allowed: boolean; reasonCode?: string } {
  if (!fitnessValidUpto) return { allowed: true }; // Allow blank
  
  const expiryDate = new Date(fitnessValidUpto);
  const today = new Date();
  
  if (expiryDate < today) {
    return { allowed: false, reasonCode: 'FITNESS_EXPIRED' };
  }
  
  return { allowed: true };
}

/**
 * Check insurance validity
 */
function checkInsurance(insuranceValidUpto?: string): { allowed: boolean; reasonCode?: string } {
  if (!insuranceValidUpto) return { allowed: true }; // Allow blank
  
  const expiryDate = new Date(insuranceValidUpto);
  const today = new Date();
  
  if (expiryDate < today) {
    return { allowed: false, reasonCode: 'INSURANCE_EXPIRED' };
  }
  
  return { allowed: true };
}

/**
 * Check PUC validity
 */
function checkPUC(pucValidUpto?: string): { allowed: boolean; reasonCode?: string } {
  if (!pucValidUpto) return { allowed: true }; // Allow blank
  
  const expiryDate = new Date(pucValidUpto);
  const today = new Date();
  
  if (expiryDate < today) {
    return { allowed: false, reasonCode: 'PUC_EXPIRED' };
  }
  
  return { allowed: true };
}

/**
 * Check GPS heartbeat
 */
function checkGPSHeartbeat(gpsLastPingAt?: Date): { allowed: boolean; reasonCode?: string } {
  if (!gpsLastPingAt) {
    return { allowed: false, reasonCode: 'GPS_NO_PING' };
  }

  const now = new Date();
  const minutesSincePing = Math.floor((now.getTime() - gpsLastPingAt.getTime()) / (1000 * 60));

  if (minutesSincePing > 60) {
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
async function checkOperatorLimit(operator_id: string): Promise<{ allowed: boolean; reasonCode?: string }> {
  const maxTrucks = 10;

  const result = await query(
    `SELECT COUNT(*) as count
     FROM operator_trucks
     WHERE operator_id = $1
     AND status = 'ACTIVE'`,
    [operator_id]
  );

  const count = parseInt(result.rows[0].count, 10);

  if (count >= maxTrucks) {
    return {
      allowed: false,
      reasonCode: `OPERATOR_LIMIT_EXCEEDED_${count}_${maxTrucks}`,
    };
  }

  return { allowed: true };
}

/**
 * Write compliance decision to cache
 */
async function writeToCache(
  rc_number: string,
  operator_id: string,
  snapshot: VahanSnapshot,
  decision: ComplianceDecision,
  inference: any
): Promise<void> {
  const chassisHash = hashChassis(snapshot.chassis_number!);
  const engineHash = hashEngine(snapshot.engine_number!);
  const cacheExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await query(
    `INSERT INTO vehicle_compliance_cache (
      rc_number, operator_id, allow, reasons, decision_at, provider,
      last_verified_at, permit_status, fitness_status, insurance_status,
      puc_status, category_status, duplicate_status, telemetry_status,
      rules_applied, cache_expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    ON CONFLICT (rc_number, operator_id)
    DO UPDATE SET
      allow = EXCLUDED.allow,
      reasons = EXCLUDED.reasons,
      decision_at = EXCLUDED.decision_at,
      provider = EXCLUDED.provider,
      last_verified_at = EXCLUDED.last_verified_at,
      permit_status = EXCLUDED.permit_status,
      fitness_status = EXCLUDED.fitness_status,
      insurance_status = EXCLUDED.insurance_status,
      puc_status = EXCLUDED.puc_status,
      category_status = EXCLUDED.category_status,
      duplicate_status = EXCLUDED.duplicate_status,
      telemetry_status = EXCLUDED.telemetry_status,
      rules_applied = EXCLUDED.rules_applied,
      cache_expires_at = EXCLUDED.cache_expires_at,
      updated_at = CURRENT_TIMESTAMP`,
    [
      rc_number,
      operator_id,
      decision.allow,
      decision.reasons,
      decision.decision_at,
      decision.provider,
      decision.last_verified_at,
      snapshot.permit_valid_upto ? 'VALID' : 'BLANK',
      snapshot.fitness_valid_upto ? 'VALID' : 'BLANK',
      snapshot.insurance_valid_upto ? 'VALID' : 'BLANK',
      snapshot.puc_valid_upto ? 'VALID' : 'BLANK',
      snapshot.vehicle_category || null,
      'CLEAN', // Would be set by duplicate check
      'ACTIVE', // Would be set by GPS check
      decision.rules_applied,
      cacheExpiresAt,
    ]
  );
}

