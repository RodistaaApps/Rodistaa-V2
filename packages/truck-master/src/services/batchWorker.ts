/**
 * Nightly Batch Worker
 * Orchestrates VAHAN verification, flag computation, and escalation
 */

import { query, transaction } from '../db';
import { VahanClientEnhanced } from './vahanClientEnhanced';
import { computeFlags, checkPersistentMismatch } from './truckValidator';
import { TruckCreateDTO, FlagRecord, VahanSnapshot } from '../models/truckDimensions';
import { createTicket } from './ticketing';
import { assignPhotoVerificationTask } from './franchiseService';
import { logAudit } from './auditService';

const BATCH_SIZE = 50;
const CONCURRENCY = 10;
const STALE_VERIFICATION_DAYS = 7;

/**
 * Batch worker configuration
 */
interface BatchWorkerConfig {
  batchSize?: number;
  concurrency?: number;
  staleDays?: number;
}

/**
 * Process pending trucks for VAHAN verification
 */
export async function processPendingTrucks(config: BatchWorkerConfig = {}): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  const {
    batchSize = BATCH_SIZE,
    concurrency = CONCURRENCY,
    staleDays = STALE_VERIFICATION_DAYS,
  } = config;

  const vahanClient = new VahanClientEnhanced();
  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  // Query pending or stale trucks
  const pendingTrucks = await query<{
    id: number;
    operator_id: string;
    rc_number: string;
    tyre_count: number;
    body_length_ft: number;
    body_type: string;
    payload_kg?: number;
    flags: FlagRecord[];
    flags_history: FlagRecord[];
    last_verified_at?: Date;
    vahan_snapshot?: any;
  }>(
    `SELECT id, operator_id, rc_number, tyre_count, body_length_ft, body_type, 
            payload_kg, flags, flags_history, last_verified_at, vahan_snapshot
     FROM operator_trucks
     WHERE compliance_status = 'PENDING' 
        OR last_verified_at IS NULL
        OR last_verified_at < NOW() - INTERVAL '${staleDays} days'
     ORDER BY created_at ASC
     LIMIT $1`,
    [batchSize]
  );

  // Process in batches with concurrency control
  for (let i = 0; i < pendingTrucks.rows.length; i += concurrency) {
    const batch = pendingTrucks.rows.slice(i, i + concurrency);
    
    await Promise.allSettled(
      batch.map(async (truck) => {
        try {
          await processSingleTruck(truck, vahanClient);
          succeeded++;
        } catch (error) {
          console.error(`Failed to process truck ${truck.id}:`, error);
          failed++;
        } finally {
          processed++;
        }
      })
    );
  }

  return { processed, succeeded, failed };
}

/**
 * Process a single truck
 */
async function processSingleTruck(
  truck: any,
  vahanClient: VahanClientEnhanced
): Promise<void> {
  return transaction(async (client) => {
    // Fetch VAHAN snapshot
    let vahanSnapshot: VahanSnapshot;
    try {
      vahanSnapshot = await vahanClient.fetchVahanSnapshot(truck.rc_number);
    } catch (error: any) {
      console.error(`VAHAN fetch failed for RC ${truck.rc_number}:`, error);
      // Continue with existing flags if VAHAN fails
      vahanSnapshot = truck.vahan_snapshot;
      if (!vahanSnapshot) {
        throw error;
      }
    }

    // Prepare truck DTO for flag computation
    const dto: TruckCreateDTO = {
      operator_id: truck.operator_id,
      rc_number: truck.rc_number,
      tyre_count: truck.tyre_count,
      body_length_ft: truck.body_length_ft,
      body_type: truck.body_type as any,
      payload_kg: truck.payload_kg,
      rc_copy: Buffer.from(''), // Not needed for flag computation
    };

    // Compute flags with VAHAN data
    const newFlags = await computeFlags(dto, vahanSnapshot);

    // Check for persistent mismatches
    const allFlagsHistory = [...(truck.flags_history || []), ...newFlags];
    const persistentFlags = checkPersistentMismatch(allFlagsHistory);

    // Add PERSISTENT_MISMATCH flag if applicable
    for (const persistentFlag of persistentFlags) {
      if (!newFlags.some(f => f.flag_code === persistentFlag)) {
        newFlags.push({
          flag_code: 'PERSISTENT_MISMATCH',
          meta: {
            reason: `Flag ${persistentFlag} has occurred 3+ times`,
            related_flag: persistentFlag,
            severity: 'HIGH',
          },
          created_at: new Date().toISOString(),
        });
      }
    }

    // Update truck record
    const updatedFlags = [...newFlags];
    const updatedFlagsHistory = [...allFlagsHistory, ...newFlags.map(f => ({
      ...f,
      meta: { ...f.meta, occurrence_count: (f.meta.occurrence_count || 1) },
    }))];

    // Determine compliance status
    let complianceStatus = 'ACTIVE';
    if (newFlags.some(f => f.flag_code === 'VAHAN_DISCREPANCY' && f.meta.severity === 'CRITICAL')) {
      complianceStatus = 'BLOCKED';
    } else if (newFlags.some(f => f.flag_code === 'PERSISTENT_MISMATCH')) {
      complianceStatus = 'BLOCKED';
    }

    // Update truck in database
    await client.query(
      `UPDATE operator_trucks
       SET vahan_snapshot = $1,
           flags = $2,
           flags_history = $3,
           compliance_status = $4,
           last_verified_at = NOW()
       WHERE id = $5`,
      [
        JSON.stringify(vahanSnapshot),
        JSON.stringify(updatedFlags),
        JSON.stringify(updatedFlagsHistory),
        complianceStatus,
        truck.id,
      ]
    );

    // Log audit entry
    await logAudit({
      rc_number: truck.rc_number,
      operator_id: truck.operator_id,
      event_type: 'VERIFICATION_SUCCESS',
      provider: vahanSnapshot.provider,
      txn_id: vahanSnapshot.txn_id,
      decision: {
        flags: newFlags.map(f => f.flag_code),
        compliance_status: complianceStatus,
      },
    }, client);

    // Create franchise tasks for photo verification
    if (newFlags.some(f => f.flag_code === 'REQUIRES_PHOTO_VERIFICATION')) {
      await assignPhotoVerificationTask(truck.id, truck.operator_id, client);
    }

    // Create admin tickets for persistent mismatches or critical flags
    if (newFlags.some(f => 
      f.flag_code === 'PERSISTENT_MISMATCH' ||
      (f.flag_code === 'VAHAN_DISCREPANCY' && f.meta.severity === 'CRITICAL')
    )) {
      await createTicket({
        truck_id: truck.id,
        operator_id: truck.operator_id,
        reason_code: newFlags.find(f => f.meta.severity === 'CRITICAL')?.flag_code || 'PERSISTENT_MISMATCH',
        severity: 'HIGH',
        notes: {
          description: 'Automated escalation due to persistent mismatch or critical discrepancy',
          flags: newFlags.map(f => f.flag_code),
          provider_data: vahanSnapshot,
        },
      }, client);
    }

    // Check for duplicate chassis/engine
    if (vahanSnapshot.chassis_number || vahanSnapshot.engine_number) {
      await checkDuplicateChassisOrEngine(truck, vahanSnapshot, client);
    }
  });
}

/**
 * Check for duplicate chassis or engine numbers
 */
async function checkDuplicateChassisOrEngine(
  truck: any,
  vahanSnapshot: VahanSnapshot,
  client: any
): Promise<void> {
  if (vahanSnapshot.chassis_number) {
    const duplicateChassis = await client.query(
      `SELECT id, operator_id, rc_number
       FROM operator_trucks
       WHERE chassis_hash = $1 AND id != $2
       LIMIT 1`,
      [vahanSnapshot.chassis_number, truck.id]
    );

    if (duplicateChassis.rows.length > 0) {
      // Block truck and create ticket
      await client.query(
        `UPDATE operator_trucks
         SET compliance_status = 'BLOCKED',
             flags = jsonb_insert(
               COALESCE(flags, '[]'::jsonb),
               '{-1}',
               jsonb_build_object(
                 'flag_code', 'DUPLICATE_CHASSIS',
                 'meta', jsonb_build_object(
                   'reason', 'Chassis number already registered to another truck',
                   'duplicate_truck_id', $1,
                   'severity', 'CRITICAL'
                 ),
                 'created_at', NOW()
               )
             )
         WHERE id = $2`,
        [duplicateChassis.rows[0].id, truck.id]
      );

      await createTicket({
        truck_id: truck.id,
        operator_id: truck.operator_id,
        reason_code: 'DUPLICATE_CHASSIS',
        severity: 'CRITICAL',
        notes: {
          description: 'Duplicate chassis number detected',
          duplicate_truck_id: duplicateChassis.rows[0].id,
          duplicate_rc: duplicateChassis.rows[0].rc_number,
        },
      }, client);
    }
  }

  // Similar check for engine number
  if (vahanSnapshot.engine_number) {
    const duplicateEngine = await client.query(
      `SELECT id, operator_id, rc_number
       FROM operator_trucks
       WHERE engine_hash = $1 AND id != $2
       LIMIT 1`,
      [vahanSnapshot.engine_number, truck.id]
    );

    if (duplicateEngine.rows.length > 0) {
      await client.query(
        `UPDATE operator_trucks
         SET compliance_status = 'BLOCKED',
             flags = jsonb_insert(
               COALESCE(flags, '[]'::jsonb),
               '{-1}',
               jsonb_build_object(
                 'flag_code', 'DUPLICATE_ENGINE',
                 'meta', jsonb_build_object(
                   'reason', 'Engine number already registered to another truck',
                   'duplicate_truck_id', $1,
                   'severity', 'CRITICAL'
                 ),
                 'created_at', NOW()
               )
             )
         WHERE id = $2`,
        [duplicateEngine.rows[0].id, truck.id]
      );

      await createTicket({
        truck_id: truck.id,
        operator_id: truck.operator_id,
        reason_code: 'DUPLICATE_ENGINE',
        severity: 'CRITICAL',
        notes: {
          description: 'Duplicate engine number detected',
          duplicate_truck_id: duplicateEngine.rows[0].id,
          duplicate_rc: duplicateEngine.rows[0].rc_number,
        },
      }, client);
    }
  }
}

/**
 * Run batch worker (entry point for cron job)
 */
export async function runBatchWorker(): Promise<void> {
  console.log('Starting batch worker...');
  const startTime = Date.now();

  try {
    const result = await processPendingTrucks();
    const duration = Date.now() - startTime;

    console.log(`Batch worker completed in ${duration}ms:`, result);
  } catch (error) {
    console.error('Batch worker failed:', error);
    throw error;
  }
}

