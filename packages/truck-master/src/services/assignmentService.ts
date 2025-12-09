/**
 * Assignment Service
 * Manage truck-driver assignments with validation and conflict detection
 */

import { query, transaction, PoolClient } from '../db';
import {
  AssignmentCreateDTO,
  AssignmentResponse,
  TruckDriverAssignment,
  DriverRecord,
} from '../models/driver';
import { isDLClassCompatible, getRequiredDLClassPriority } from '../models/driver';
import { getDriver, getDriverFlags } from './driverService';
import { checkDriverAvailability } from './availabilityService';
import { logAudit } from './auditService';
import { notifyDriver } from './notificationService';

const MAX_CO_DRIVERS = parseInt(process.env.MAX_CO_DRIVERS || '2', 10);
const ALLOW_DRIVER_MULTI_TRUCK_OVERLAP = process.env.ALLOW_DRIVER_MULTI_TRUCK_OVERLAP === 'true';

/**
 * Create assignment
 */
export async function createAssignment(
  dto: AssignmentCreateDTO,
  assignedBy: string,
  assignedByRole: 'OPERATOR' | 'FRANCHISE' | 'HQ_ADMIN'
): Promise<AssignmentResponse> {
  const warnings: AssignmentResponse['warnings'] = [];

  // Validate co-drivers count
  const coDriverCount = dto.co_driver_ids?.length || 0;
  if (coDriverCount > MAX_CO_DRIVERS) {
    throw new Error(`Maximum ${MAX_CO_DRIVERS} co-drivers allowed per truck`);
  }

  // Get truck details
  const truckResult = await query(
    `SELECT id, operator_id, body_type, compliance_status 
     FROM operator_trucks 
     WHERE id = $1`,
    [dto.truck_id]
  );

  if (truckResult.rows.length === 0) {
    throw new Error('Truck not found');
  }

  const truck = truckResult.rows[0];

  // Check if truck has active assignment
  const existingAssignment = await query<TruckDriverAssignment>(
    `SELECT * FROM truck_driver_assignments 
     WHERE truck_id = $1 AND is_active = TRUE`,
    [dto.truck_id]
  );

  if (existingAssignment.rows.length > 0 && !dto.force_assigned) {
    throw new Error('Truck already has an active assignment. End existing assignment first or use force assign.');
  }

  // Validate primary driver
  let primaryDriver: DriverRecord | null = null;
  if (dto.primary_driver_id) {
    primaryDriver = await getDriver(dto.primary_driver_id);
    if (!primaryDriver) {
      throw new Error('Primary driver not found');
    }

    // Check driver operator match (unless HQ override)
    if (primaryDriver.operator_id !== truck.operator_id && assignedByRole !== 'HQ_ADMIN') {
      throw new Error('Driver belongs to different operator. HQ approval required.');
    }

    // Validate driver eligibility
    const driverValidation = await validateDriverEligibility(
      primaryDriver,
      truck,
      dto,
      dto.force_assigned || false
    );

    if (!driverValidation.valid) {
      if (dto.force_assigned) {
        warnings.push({
          type: 'DL_EXPIRED',
          driver_id: primaryDriver.id,
          driver_name: primaryDriver.name,
          message: driverValidation.error || 'Driver validation failed',
          severity: 'HIGH',
        });
      } else {
        throw new Error(`Primary driver validation failed: ${driverValidation.error}`);
      }
    }

    if (driverValidation.warnings) {
      warnings.push(...driverValidation.warnings);
    }

    // Check for conflicting assignments
    if (!ALLOW_DRIVER_MULTI_TRUCK_OVERLAP) {
      const conflict = await checkDriverAssignmentConflict(
        primaryDriver.id,
        dto.start_at,
        dto.end_at
      );
      
      if (conflict) {
        if (dto.force_assigned) {
          warnings.push({
            type: 'CONFLICT',
            driver_id: primaryDriver.id,
            driver_name: primaryDriver.name,
            message: 'Driver has overlapping assignment with another truck',
            severity: 'HIGH',
          });
        } else {
          throw new Error(`Driver has conflicting assignment: ${conflict}`);
        }
      }
    }
  }

  // Validate co-drivers
  const coDrivers: DriverRecord[] = [];
  if (dto.co_driver_ids && dto.co_driver_ids.length > 0) {
    // Check duplicates
    const uniqueIds = new Set(dto.co_driver_ids);
    if (uniqueIds.size !== dto.co_driver_ids.length) {
      throw new Error('Duplicate co-driver IDs');
    }

    // Check primary driver not in co-drivers
    if (dto.primary_driver_id && dto.co_driver_ids.includes(dto.primary_driver_id)) {
      throw new Error('Primary driver cannot be a co-driver');
    }

    for (const coDriverId of dto.co_driver_ids) {
      const coDriver = await getDriver(coDriverId);
      if (!coDriver) {
        throw new Error(`Co-driver ${coDriverId} not found`);
      }

      // Check operator match
      if (coDriver.operator_id !== truck.operator_id && assignedByRole !== 'HQ_ADMIN') {
        throw new Error(`Co-driver ${coDriver.name} belongs to different operator`);
      }

      // Validate co-driver DL class (must be same or higher than primary)
      if (primaryDriver) {
        const primaryPriority = getRequiredDLClassPriority(primaryDriver.dl_class, 'HCV');
        const coPriority = getRequiredDLClassPriority(coDriver.dl_class, 'HCV');
        
        if (coPriority > primaryPriority) {
          warnings.push({
            type: 'DL_EXPIRED',
            driver_id: coDriver.id,
            driver_name: coDriver.name,
            message: `Co-driver DL class ${coDriver.dl_class} may be insufficient`,
            severity: 'MEDIUM',
          });
        }
      }

      // Validate eligibility
      const coValidation = await validateDriverEligibility(
        coDriver,
        truck,
        dto,
        dto.force_assigned || false
      );

      if (!coValidation.valid && !dto.force_assigned) {
        throw new Error(`Co-driver ${coDriver.name} validation failed: ${coValidation.error}`);
      }

      if (coValidation.warnings) {
        warnings.push(...coValidation.warnings);
      }

      coDrivers.push(coDriver);
    }
  }

  // Create assignment
  return transaction(async (client) => {
    // Deactivate existing assignment if force assigned
    if (existingAssignment.rows.length > 0 && dto.force_assigned) {
      await client.query(
        `UPDATE truck_driver_assignments 
         SET is_active = FALSE, end_at = CURRENT_TIMESTAMP
         WHERE truck_id = $1 AND is_active = TRUE`,
        [dto.truck_id]
      );
    }

    // Insert new assignment
    const result = await client.query<TruckDriverAssignment>(
      `INSERT INTO truck_driver_assignments
       (truck_id, primary_driver_id, co_driver_ids, assigned_by, assigned_by_role,
        start_at, end_at, is_active, assignment_reason, force_assigned, force_assignment_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        dto.truck_id,
        dto.primary_driver_id || null,
        dto.co_driver_ids || [],
        assignedBy,
        assignedByRole,
        dto.start_at,
        dto.end_at || null,
        true,
        dto.assignment_reason || null,
        dto.force_assigned || false,
        dto.force_assignment_reason || null,
      ]
    );

    const assignment = result.rows[0];

    // Log audit
    await logAudit({
      rc_number: '', // Will be fetched from truck
      operator_id: truck.operator_id,
      event_type: 'DRIVER_ASSIGNMENT_CREATED',
      decision: {
        assignment_id: assignment.id,
        truck_id: dto.truck_id,
        primary_driver_id: dto.primary_driver_id,
        co_driver_ids: dto.co_driver_ids,
        force_assigned: dto.force_assigned || false,
      },
    }, client);

    // Notify drivers
    if (primaryDriver) {
      await notifyDriver(primaryDriver.mobile, {
        type: 'ASSIGNMENT',
        assignment_id: assignment.id,
        truck_id: dto.truck_id,
        start_at: dto.start_at,
      }).catch(err => console.error('Notification failed:', err));
    }

    for (const coDriver of coDrivers) {
      await notifyDriver(coDriver.mobile, {
        type: 'ASSIGNMENT',
        assignment_id: assignment.id,
        truck_id: dto.truck_id,
        role: 'CO_DRIVER',
        start_at: dto.start_at,
      }).catch(err => console.error('Notification failed:', err));
    }

    return {
      assignment_id: assignment.id,
      warnings,
      assignment,
    };
  });
}

/**
 * Validate driver eligibility
 */
async function validateDriverEligibility(
  driver: DriverRecord,
  truck: any,
  assignment: AssignmentCreateDTO,
  forceAssigned: boolean
): Promise<{ valid: boolean; error?: string; warnings?: AssignmentResponse['warnings'] }> {
  const warnings: AssignmentResponse['warnings'] = [];

  // Check driver is active
  if (!driver.is_active) {
    return { valid: false, error: 'Driver is inactive' };
  }

  // Check driver flags
  const flags = await getDriverFlags(driver.id, true);
  const blockingFlags = flags.filter(f => 
    ['DL_EXPIRED', 'BACKGROUND_ISSUE'].includes(f.flag_code) ||
    (f.meta.severity === 'CRITICAL' || f.meta.severity === 'HIGH')
  );

  if (blockingFlags.length > 0 && !forceAssigned) {
    return { 
      valid: false, 
      error: `Driver has blocking flags: ${blockingFlags.map(f => f.flag_code).join(', ')}` 
    };
  }

  if (blockingFlags.length > 0 && forceAssigned) {
    warnings.push({
      type: 'DL_EXPIRED',
      driver_id: driver.id,
      driver_name: driver.name,
      message: `Driver has flags: ${blockingFlags.map(f => f.flag_code).join(', ')}`,
      severity: 'HIGH',
    });
  }

  // Check DL expiry
  const daysUntilExpiry = Math.floor(
    (new Date(driver.dl_valid_till).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0 && !forceAssigned) {
    return { valid: false, error: 'DL is expired' };
  }

  if (daysUntilExpiry < 0 && forceAssigned) {
    warnings.push({
      type: 'DL_EXPIRED',
      driver_id: driver.id,
      driver_name: driver.name,
      message: 'DL is expired',
      severity: 'CRITICAL',
    });
  } else if (daysUntilExpiry < 30) {
    warnings.push({
      type: 'DL_EXPIRING',
      driver_id: driver.id,
      driver_name: driver.name,
      message: `DL expires in ${daysUntilExpiry} days`,
      severity: daysUntilExpiry < 7 ? 'HIGH' : 'MEDIUM',
    });
  }

  // Check DL class compatibility
  // TODO: Get truck category from truck record
  const truckCategory = 'HCV'; // Default, should be inferred from truck
  if (!isDLClassCompatible(driver.dl_class, truckCategory as any)) {
    if (!forceAssigned) {
      return { 
        valid: false, 
        error: `DL class ${driver.dl_class} not compatible with truck category ${truckCategory}` 
      };
    }
    warnings.push({
      type: 'DL_EXPIRED',
      driver_id: driver.id,
      driver_name: driver.name,
      message: `DL class ${driver.dl_class} may not be compatible with truck category`,
      severity: 'MEDIUM',
    });
  }

  // Check assignment end date vs DL expiry
  if (assignment.end_at) {
    const assignmentEnd = new Date(assignment.end_at);
    const dlExpiry = new Date(driver.dl_valid_till);
    
    if (assignmentEnd > dlExpiry && !forceAssigned) {
      return { valid: false, error: 'Assignment end date exceeds DL expiry' };
    }
    
    if (assignmentEnd > dlExpiry && forceAssigned) {
      warnings.push({
        type: 'DL_EXPIRING',
        driver_id: driver.id,
        driver_name: driver.name,
        message: 'Assignment end date exceeds DL expiry',
        severity: 'HIGH',
      });
    }
  }

  // Check availability
  const availabilityCheck = await checkDriverAvailability(
    driver.id,
    assignment.start_at,
    assignment.end_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Default 1 year
  );

  if (!availabilityCheck.available && !forceAssigned) {
    return { valid: false, error: `Driver unavailable: ${availabilityCheck.reason}` };
  }

  if (!availabilityCheck.available && forceAssigned) {
    warnings.push({
      type: 'AVAILABILITY',
      driver_id: driver.id,
      driver_name: driver.name,
      message: `Driver unavailable: ${availabilityCheck.reason}`,
      severity: 'MEDIUM',
    });
  }

  return { valid: true, warnings };
}

/**
 * Check for conflicting assignments
 */
async function checkDriverAssignmentConflict(
  driverId: string,
  startAt: Date,
  endAt?: Date
): Promise<string | null> {
  const endDate = endAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  // Check primary driver assignments
  const primaryConflicts = await query(
    `SELECT tda.id, tda.truck_id, ot.rc_number
     FROM truck_driver_assignments tda
     JOIN operator_trucks ot ON ot.id = tda.truck_id
     WHERE tda.primary_driver_id = $1
       AND tda.is_active = TRUE
       AND (
         (tda.start_at <= $2 AND (tda.end_at IS NULL OR tda.end_at >= $2))
         OR (tda.start_at <= $3 AND (tda.end_at IS NULL OR tda.end_at >= $3))
         OR (tda.start_at >= $2 AND (tda.end_at IS NULL OR tda.end_at <= $3))
       )`,
    [driverId, startAt, endDate]
  );

  if (primaryConflicts.rows.length > 0) {
    return `Conflicting primary assignment: ${primaryConflicts.rows[0].rc_number}`;
  }

  // Check co-driver assignments
  const coDriverConflicts = await query(
    `SELECT tda.id, tda.truck_id, ot.rc_number
     FROM truck_driver_assignments tda
     JOIN operator_trucks ot ON ot.id = tda.truck_id
     WHERE $1 = ANY(tda.co_driver_ids)
       AND tda.is_active = TRUE
       AND (
         (tda.start_at <= $2 AND (tda.end_at IS NULL OR tda.end_at >= $2))
         OR (tda.start_at <= $3 AND (tda.end_at IS NULL OR tda.end_at >= $3))
         OR (tda.start_at >= $2 AND (tda.end_at IS NULL OR tda.end_at <= $3))
       )`,
    [driverId, startAt, endDate]
  );

  if (coDriverConflicts.rows.length > 0) {
    return `Conflicting co-driver assignment: ${coDriverConflicts.rows[0].rc_number}`;
  }

  return null;
}

/**
 * Get current assignment for truck
 */
export async function getTruckAssignment(truckId: number): Promise<TruckDriverAssignment | null> {
  const result = await query<TruckDriverAssignment>(
    `SELECT * FROM truck_driver_assignments 
     WHERE truck_id = $1 AND is_active = TRUE
     LIMIT 1`,
    [truckId]
  );

  return result.rows[0] || null;
}

/**
 * Get driver assignment history
 */
export async function getDriverAssignments(
  driverId: string,
  activeOnly = false
): Promise<TruckDriverAssignment[]> {
  let sql = `
    SELECT tda.* 
    FROM truck_driver_assignments tda
    WHERE (tda.primary_driver_id = $1 OR $1 = ANY(tda.co_driver_ids))
  `;
  
  const params: any[] = [driverId];

  if (activeOnly) {
    sql += ` AND tda.is_active = TRUE`;
  }

  sql += ` ORDER BY tda.start_at DESC`;

  const result = await query<TruckDriverAssignment>(sql, params);
  return result.rows;
}

/**
 * End assignment
 */
export async function endAssignment(
  truckId: number,
  endedBy: string,
  reason?: string
): Promise<void> {
  await transaction(async (client) => {
    const assignment = await client.query<TruckDriverAssignment>(
      `SELECT * FROM truck_driver_assignments 
       WHERE truck_id = $1 AND is_active = TRUE
       LIMIT 1`,
      [truckId]
    );

    if (assignment.rows.length === 0) {
      throw new Error('No active assignment found');
    }

    await client.query(
      `UPDATE truck_driver_assignments
       SET is_active = FALSE, end_at = CURRENT_TIMESTAMP
       WHERE truck_id = $1 AND is_active = TRUE`,
      [truckId]
    );

    // Notify drivers
    const activeAssignment = assignment.rows[0];
    if (activeAssignment.primary_driver_id) {
      const driver = await getDriver(activeAssignment.primary_driver_id);
      if (driver) {
        await notifyDriver(driver.mobile, {
          type: 'UNASSIGNMENT',
          truck_id: truckId,
          reason,
        }).catch(err => console.error('Notification failed:', err));
      }
    }

    // Log audit
    await logAudit({
      rc_number: '',
      operator_id: '', // Will be fetched
      event_type: 'DRIVER_ASSIGNMENT_ENDED',
      decision: {
        assignment_id: activeAssignment.id,
        truck_id: truckId,
        reason,
      },
    }, client);
  });
}

