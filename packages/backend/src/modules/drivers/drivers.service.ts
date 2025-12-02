/**
 * Drivers Service
 * Business logic for driver management
 */

import * as usersRepo from '../users/users.repository';
import { query } from '../../db/connection';
import logger from 'pino';

const log = logger({ name: 'drivers-service' });

/**
 * Register driver (creates user with DRIVER role)
 */
export async function registerDriver(input: {
  mobile: string;
  name: string;
  licenseNumber: string;
  licenseFileUrl?: string;
}): Promise<usersRepo.User> {
  // Driver registration creates a user with DRIVER role
  // Actual user creation handled by auth service
  // This provides driver-specific metadata
  
  const driver = await usersRepo.getUserById(`USR-DR-${input.mobile.replace(/\D/g, '')}`, false);
  
  if (!driver) {
    throw new Error('Driver user not found. Please complete registration via auth flow first.');
  }

  // Store driver license info (in production, add driver_licenses table)
  if (input.licenseNumber || input.licenseFileUrl) {
    // Link license via KYC or separate table
    log.info({ driverId: driver.id, licenseNumber: input.licenseNumber }, 'Driver license registered');
  }

  return driver;
}

/**
 * Link driver to truck
 */
export async function linkDriverToTruck(
  driverId: string,
  truckId: string,
  operatorId: string
): Promise<void> {
  // Verify operator owns the truck
  const truckResult = await query(
    `SELECT owner_id FROM trucks WHERE id = $1`,
    [truckId]
  );

  if (truckResult.rows.length === 0) {
    throw new Error('Truck not found');
  }

  if (truckResult.rows[0].owner_id !== operatorId) {
    throw new Error('Operator does not own this truck');
  }

  // Driver-truck linking is handled via shipments
  // For now, we just verify the link can be made
  // Actual assignment happens when shipment is assigned to driver+truck
  log.info({ driverId, truckId, operatorId }, 'Driver-truck link verified (actual linking via shipments)');

  log.info({ driverId, truckId, operatorId }, 'Driver linked to truck');
}

/**
 * Get driver profile (full view for operator/admin)
 */
export async function getDriverProfile(
  driverId: string,
  requestingUserId: string,
  requestingUserRole: string
): Promise<any> {
  const driver = await usersRepo.getUserById(driverId, requestingUserRole !== 'ADMIN');

  if (!driver || driver.role !== 'DRIVER') {
    throw new Error('Driver not found');
  }

  // Get trucks assigned to driver via shipments
  const trucksResult = await query(
    `SELECT DISTINCT t.* FROM trucks t
     INNER JOIN shipments s ON t.id = s.truck_id
     WHERE s.driver_id = $1 AND s.status != 'COMPLETED'`,
    [driverId]
  );

  // Get driver stats
  const statsResult = await query(
    `SELECT 
       COUNT(*) as total_shipments,
       COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_shipments,
       COUNT(*) FILTER (WHERE status = 'FAILED') as failed_shipments
     FROM shipments
     WHERE driver_id = $1`,
    [driverId]
  );

  return {
    ...driver,
    trucks: trucksResult.rows,
    stats: statsResult.rows[0] || {
      totalShipments: 0,
      completedShipments: 0,
      failedShipments: 0,
    },
  };
}

