/**
 * Trucks Repository
 * Database operations for trucks
 */

import { query } from '../../db/connection';
import logger from 'pino';
import { generateTruckId, Truck, TruckStatus } from '@rodistaa/app-shared';
import { ulid } from 'ulid';

const log = logger({ name: 'trucks-repository' });

export interface TruckCreateInput {
  operatorId: string;
  registrationNumber: string;
  vehicleType?: string;
  capacityTons?: number;
  bodyType?: string;
  tyres?: number;
}

export interface TruckUpdateInput {
  vehicleType?: string;
  capacityTons?: number;
  bodyType?: string;
  tyres?: number;
  status?: TruckStatus;
  blockedReason?: string;
}

export interface TruckDocument {
  id: number;
  truckId: string;
  documentType: string;
  fileUrl: string;
  expiryDate: string | null;
  status: string;
}

export interface TruckInspection {
  id: string;
  truckId: string;
  inspectorId: string;
  status: string;
  photos: any;
  latitude?: number;
  longitude?: number;
  notes?: string;
  createdAt: string;
}

/**
 * Create a new truck
 */
export async function createTruck(input: TruckCreateInput): Promise<Truck> {
  const truckId = generateTruckId(input.registrationNumber);

  try {
    await query(
      `INSERT INTO trucks (
        id, operator_id, registration_number, vehicle_type,
        capacity_tons, body_type, tyres, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [
        truckId,
        input.operatorId,
        input.registrationNumber,
        input.vehicleType || null,
        input.capacityTons || null,
        input.bodyType || null,
        input.tyres || null,
        'ACTIVE',
      ]
    );

    return getTruckById(truckId) as Promise<Truck>;
  } catch (error: any) {
    log.error({ error, truckId }, 'Failed to create truck');
    throw new Error('Failed to create truck');
  }
}

/**
 * Get truck by ID
 */
export async function getTruckById(truckId: string): Promise<Truck | null> {
  try {
    const result = await query(
      `SELECT * FROM trucks WHERE id = $1 LIMIT 1`,
      [truckId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapRowToTruck(result.rows[0]);
  } catch (error: any) {
    log.error({ error, truckId }, 'Failed to get truck');
    throw error;
  }
}

/**
 * List trucks with filters
 */
export async function listTrucks(filters: {
  operatorId?: string;
  status?: TruckStatus;
  page?: number;
  limit?: number;
}): Promise<{ data: Truck[]; total: number }> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  try {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.operatorId) {
      conditions.push(`operator_id = $${paramIndex++}`);
      params.push(filters.operatorId);
    }

    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(filters.status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM trucks ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.total || '0', 10);

    // Get trucks
    params.push(limit, offset);
    const result = await query(
      `SELECT * FROM trucks 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      params
    );

    const trucks = result.rows.map(mapRowToTruck);

    return { data: trucks, total };
  } catch (error: any) {
    log.error({ error, filters }, 'Failed to list trucks');
    throw error;
  }
}

/**
 * Update truck
 */
export async function updateTruck(truckId: string, input: TruckUpdateInput, blockedBy?: string): Promise<Truck> {
  try {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (input.vehicleType !== undefined) {
      updates.push(`vehicle_type = $${paramIndex++}`);
      params.push(input.vehicleType);
    }

    if (input.capacityTons !== undefined) {
      updates.push(`capacity_tons = $${paramIndex++}`);
      params.push(input.capacityTons);
    }

    if (input.bodyType !== undefined) {
      updates.push(`body_type = $${paramIndex++}`);
      params.push(input.bodyType);
    }

    if (input.tyres !== undefined) {
      updates.push(`tyres = $${paramIndex++}`);
      params.push(input.tyres);
    }

    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(input.status);
      
      if (input.status === 'BLOCKED') {
        updates.push(`blocked_at = NOW()`);
        if (blockedBy) {
          updates.push(`blocked_by = $${paramIndex++}`);
          params.push(blockedBy);
        }
        if (input.blockedReason) {
          updates.push(`blocked_reason = $${paramIndex++}`);
          params.push(input.blockedReason);
        }
      } else if (input.status === 'ACTIVE') {
        updates.push(`blocked_at = NULL, blocked_by = NULL, blocked_reason = NULL`);
      }
    }

    if (updates.length === 0) {
      return getTruckById(truckId) as Promise<Truck>;
    }

    updates.push(`updated_at = NOW()`);
    params.push(truckId);

    await query(
      `UPDATE trucks SET ${updates.join(', ')} WHERE id = $${paramIndex++}`,
      params
    );

    return getTruckById(truckId) as Promise<Truck>;
  } catch (error: any) {
    log.error({ error, truckId }, 'Failed to update truck');
    throw error;
  }
}

/**
 * Add truck document
 */
export async function addTruckDocument(
  truckId: string,
  document: {
    documentType: string;
    fileUrl: string;
    expiryDate?: Date;
  }
): Promise<TruckDocument> {
  try {
    const expiryDate = document.expiryDate ? document.expiryDate.toISOString().split('T')[0] : null;
    
    // Determine status based on expiry
    let status = 'VALID';
    if (expiryDate) {
      const expiry = new Date(expiryDate);
      const daysUntilExpiry = Math.floor((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry < 0) {
        status = 'EXPIRED';
      } else if (daysUntilExpiry <= 30) {
        status = 'EXPIRING_SOON';
      }
    }

    const result = await query(
      `INSERT INTO truck_documents (truck_id, document_type, file_url, expiry_date, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, truck_id, document_type, file_url, expiry_date, status`,
      [truckId, document.documentType, document.fileUrl, expiryDate, status]
    );

    return {
      id: result.rows[0].id,
      truckId: result.rows[0].truck_id,
      documentType: result.rows[0].document_type,
      fileUrl: result.rows[0].file_url,
      expiryDate: result.rows[0].expiry_date,
      status: result.rows[0].status,
    };
  } catch (error: any) {
    log.error({ error, truckId }, 'Failed to add truck document');
    throw error;
  }
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
): Promise<TruckInspection> {
  const inspectionId = generateInspectionId();

  try {
    const result = await query(
      `INSERT INTO truck_inspections (
        id, truck_id, inspector_id, status, photos, latitude, longitude, notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id, truck_id, inspector_id, status, photos, latitude, longitude, notes, created_at`,
      [
        inspectionId,
        truckId,
        inspectorId,
        'PENDING',
        JSON.stringify(inspection.photos),
        inspection.latitude || null,
        inspection.longitude || null,
        inspection.notes || null,
      ]
    );

    return {
      id: result.rows[0].id,
      truckId: result.rows[0].truck_id,
      inspectorId: result.rows[0].inspector_id,
      status: result.rows[0].status,
      photos: typeof result.rows[0].photos === 'string' 
        ? JSON.parse(result.rows[0].photos) 
        : result.rows[0].photos,
      latitude: result.rows[0].latitude,
      longitude: result.rows[0].longitude,
      notes: result.rows[0].notes,
      createdAt: result.rows[0].created_at.toISOString(),
    };
  } catch (error: any) {
    log.error({ error, truckId, inspectionId }, 'Failed to create inspection');
    throw error;
  }
}

/**
 * Get expiring documents (within days)
 */
export async function getExpiringDocuments(days: number = 30): Promise<TruckDocument[]> {
  try {
    const result = await query(
      `SELECT td.*, t.registration_number, t.operator_id
       FROM truck_documents td
       JOIN trucks t ON td.truck_id = t.id
       WHERE td.expiry_date IS NOT NULL
         AND td.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${days} days'
         AND td.status != 'EXPIRED'
       ORDER BY td.expiry_date ASC`
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      truckId: row.truck_id,
      documentType: row.document_type,
      fileUrl: row.file_url,
      expiryDate: row.expiry_date,
      status: row.status,
    }));
  } catch (error: any) {
    log.error({ error }, 'Failed to get expiring documents');
    throw error;
  }
}

/**
 * Update document status
 */
export async function updateDocumentStatus(documentId: number, status: string): Promise<void> {
  try {
    await query(
      `UPDATE truck_documents SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, documentId]
    );
  } catch (error: any) {
    log.error({ error, documentId }, 'Failed to update document status');
    throw error;
  }
}

/**
 * Map database row to Truck object
 */
function mapRowToTruck(row: any): Truck {
  return {
    id: row.id,
    operatorId: row.operator_id,
    registrationNumber: row.registration_number,
    vehicleType: row.vehicle_type || undefined,
    capacityTons: row.capacity_tons || undefined,
    bodyType: row.body_type || undefined,
    tyres: row.tyres || undefined,
    status: row.status as TruckStatus,
    blockedReason: row.blocked_reason || undefined,
    blockedAt: row.blocked_at?.toISOString() || undefined,
    blockedBy: row.blocked_by || undefined,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at?.toISOString(),
  };
}

/**
 * Generate inspection ID
 */
function generateInspectionId(): string {
  return `INS-${ulid()}`;
}

