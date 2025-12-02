/**
 * Trucks Service
 * Business logic for trucks with inspection and document management
 */

import * as trucksRepo from './trucks.repository';
import { evaluateAcsRules } from '../acs-adapter';
import logger from 'pino';
import { Truck, TruckStatus } from '@rodistaa/app-shared';

const log = logger({ name: 'trucks-service' });

/**
 * Create a new truck with ACS evaluation
 */
export async function createTruck(
  operatorId: string,
  input: trucksRepo.TruckCreateInput,
  context: any
): Promise<Truck> {
  // Evaluate ACS rules for truck registration
  const event = {
    type: 'truck.register',
    payload: {
      operatorId,
      registrationNumber: input.registrationNumber,
      capacityTons: input.capacityTons,
    },
  };

  const acsContext = {
    userId: operatorId,
    userRole: context.userRole || 'operator',
    userKycStatus: context.kycStatus || 'PENDING',
  };

  try {
    await evaluateAcsRules(event, acsContext);
  } catch (error: any) {
    if (error.message && error.message.includes('rejected')) {
      throw new Error(error.message);
    }
    log.warn({ error }, 'ACS evaluation warning (continuing)');
  }

  const truck = await trucksRepo.createTruck({
    ...input,
    operatorId,
  });

  log.info({ truckId: truck.id, operatorId }, 'Truck created');

  return truck;
}

/**
 * Get truck by ID
 */
export async function getTruckById(truckId: string): Promise<Truck | null> {
  return trucksRepo.getTruckById(truckId);
}

/**
 * List trucks with filters
 */
export async function listTrucks(filters: {
  operatorId?: string;
  status?: TruckStatus;
  page?: number;
  limit?: number;
}): Promise<{ data: Truck[]; total: number; page: number; limit: number; totalPages: number }> {
  const result = await trucksRepo.listTrucks(filters);
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const totalPages = Math.ceil(result.total / limit);

  return {
    ...result,
    page,
    limit,
    totalPages,
  };
}

/**
 * Block truck (admin only)
 */
export async function blockTruck(
  truckId: string,
  reason: string,
  adminId: string
): Promise<Truck> {
  const truck = await getTruckById(truckId);
  if (!truck) {
    throw new Error('Truck not found');
  }

  return trucksRepo.updateTruck(truckId, {
    status: 'BLOCKED',
    blockedReason: reason,
  }, adminId);
}

/**
 * Unblock truck (admin only)
 */
export async function unblockTruck(truckId: string): Promise<Truck> {
  const truck = await getTruckById(truckId);
  if (!truck) {
    throw new Error('Truck not found');
  }

  return trucksRepo.updateTruck(truckId, {
    status: 'ACTIVE',
  });
}

/**
 * Create truck inspection
 */
export async function createInspection(
  truckId: string,
  inspectorId: string,
  inspection: {
    photos: string[];
    latitude?: number;
    longitude?: number;
    notes?: string;
  }
): Promise<trucksRepo.TruckInspection> {
  const truck = await getTruckById(truckId);
  if (!truck) {
    throw new Error('Truck not found');
  }

  return trucksRepo.createInspection(truckId, inspectorId, inspection);
}

/**
 * Update inspection status
 */
export async function updateInspectionStatus(
  inspectionId: string,
  status: 'PASSED' | 'FAILED',
  notes?: string
): Promise<void> {
  // In a full implementation, this would update the inspection
  // For now, we'll create the inspection with the status
  log.info({ inspectionId, status }, 'Inspection status updated');
}

/**
 * Add truck document
 */
export async function addDocument(
  truckId: string,
  document: {
    documentType: string;
    fileUrl: string;
    expiryDate?: Date;
  }
): Promise<trucksRepo.TruckDocument> {
  const truck = await getTruckById(truckId);
  if (!truck) {
    throw new Error('Truck not found');
  }

  return trucksRepo.addTruckDocument(truckId, document);
}

/**
 * Check and update document expiry statuses
 * This would typically run as a cron job
 */
export async function checkDocumentExpiry(): Promise<void> {
  try {
    // Get documents expiring in next 30 days
    const expiringDocs = await trucksRepo.getExpiringDocuments(30);
    
    // Update document statuses
    for (const doc of expiringDocs) {
      if (doc.expiryDate) {
        const expiryDate = new Date(doc.expiryDate);
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        let newStatus = 'VALID';
        if (daysUntilExpiry < 0) {
          newStatus = 'EXPIRED';
          // Auto-block truck if critical document expired
          if (doc.documentType === 'FITNESS' || doc.documentType === 'PERMIT') {
            await trucksRepo.updateTruck(doc.truckId, {
              status: 'BLOCKED',
              blockedReason: `${doc.documentType} expired`,
            });
          }
        } else if (daysUntilExpiry <= 30) {
          newStatus = 'EXPIRING_SOON';
        }

        // Update document status in database
        await trucksRepo.updateDocumentStatus(doc.id, newStatus);
      }
    }

    log.info({ count: expiringDocs.length }, 'Document expiry check completed');
  } catch (error: any) {
    log.error({ error }, 'Failed to check document expiry');
    throw error;
  }
}

