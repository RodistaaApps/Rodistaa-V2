/**
 * CYM (Certified Yard Method) Workflow Service
 * Manages the complete CYM flow: yard check-in, verification, CYR generation
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { ulid } from 'ulid';
import { logger } from '../../utils/logger';
import * as documentGeneration from './document-generation.service';

const log = logger.child({ module: 'cym-workflow' });

export interface YardCheckIn {
  checkInId: string;
  bookingId: string;
  yardId: string;
  shipperId: string;
  checkInTime: Date;
  status: string;
}

export interface CYRData {
  goodsDescription: string;
  quantity: number;
  unit: string;
  weight: number;
  photos: string[];
  verifierNotes: string;
  conditionRating: number; // 1-5
}

/**
 * Check in goods at certified yard
 */
export async function checkInToYard(
  bookingId: string,
  yardId: string,
  shipperId: string,
  goodsDetails: any
): Promise<YardCheckIn> {
  try {
    const checkInId = `CIN-${ulid()}`;
    const id = uuid();

    // Verify yard is active
    const yardResult = await query(
      `SELECT status FROM certified_yards WHERE yard_id = $1`,
      [yardId]
    );

    if (yardResult.rows.length === 0) {
      throw new Error('Yard not found');
    }

    if (yardResult.rows[0].status !== 'ACTIVE') {
      throw new Error('Yard is not active');
    }

    // Create check-in record
    await query(
      `INSERT INTO yard_check_ins
       (id, check_in_id, booking_id, yard_id, shipper_id, goods_details, status, checked_in_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'CHECKED_IN', NOW())`,
      [id, checkInId, bookingId, yardId, shipperId, JSON.stringify(goodsDetails)]
    );

    // Create verification request automatically
    await createCYMVerificationRequest(bookingId, yardId, shipperId);

    log.info({ checkInId, bookingId, yardId }, 'Goods checked in to yard');

    return {
      checkInId,
      bookingId,
      yardId,
      shipperId,
      checkInTime: new Date(),
      status: 'CHECKED_IN',
    };
  } catch (error: any) {
    log.error({ error, bookingId, yardId }, 'Failed to check in to yard');
    throw error;
  }
}

/**
 * Create CYM verification request
 */
async function createCYMVerificationRequest(
  bookingId: string,
  yardId: string,
  shipperId: string
): Promise<string> {
  const requestId = `VRQ-${ulid()}`;
  const id = uuid();

  // Get yard location for verification
  const yardResult = await query(
    `SELECT latitude, longitude, address FROM certified_yards WHERE yard_id = $1`,
    [yardId]
  );

  const yard = yardResult.rows[0];

  await query(
    `INSERT INTO verification_requests
     (id, request_id, document_id, booking_id, requested_by, requester_role,
      verification_mode, location_latitude, location_longitude, location_address,
      status, scheduled_at, sla_deadline)
     SELECT $1, $2, 
            (SELECT id FROM transport_documents WHERE booking_id = $3 AND document_type = 'CTL' LIMIT 1),
            $3, $4, 'SHIPPER', 'CYM', $5, $6, $7, 'PENDING', NOW(), NOW() + INTERVAL '2 hours'
     FROM bookings WHERE id = $3`,
    [id, requestId, bookingId, shipperId, yard.latitude, yard.longitude, yard.address]
  );

  return requestId;
}

/**
 * Complete CYM verification and generate CYR
 */
export async function completeCYMVerification(
  requestId: string,
  cyrData: CYRData,
  verifiedBy: string
): Promise<{ cyrDocumentId: string; stnDocumentId: string }> {
  try {
    // Get verification request
    const requestResult = await query(
      `SELECT vr.id, vr.booking_id, vr.document_id, cy.yard_id
       FROM verification_requests vr
       JOIN certified_yards cy ON cy.yard_id = vr.location_address
       WHERE vr.request_id = $1`,
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      throw new Error('Verification request not found');
    }

    const request = requestResult.rows[0];

    // Generate CYR
    const cyrDocumentId = await documentGeneration.generateCYR(
      request.booking_id,
      request.yard_id,
      {
        description: cyrData.goodsDescription,
        quantity: cyrData.quantity,
        unit: cyrData.unit,
        weight: cyrData.weight,
        conditionRating: cyrData.conditionRating,
      },
      {
        photos: cyrData.photos,
        verifierNotes: cyrData.verifierNotes,
        verifiedAt: new Date().toISOString(),
      },
      verifiedBy
    );

    // Convert CTL to STN (CYM verification approves the shipment)
    const ctlDocumentId = await query(
      `SELECT document_id FROM transport_documents WHERE id = $1`,
      [request.document_id]
    );

    const stnDocumentId = await documentGeneration.convertCTLToSTN(
      ctlDocumentId.rows[0].document_id,
      verifiedBy,
      'CYM'
    );

    // Update verification request
    await query(
      `UPDATE verification_requests
       SET 
         status = 'COMPLETED',
         verification_result = 'APPROVED',
         verification_evidence = $1,
         verifier_notes = $2,
         completed_at = NOW()
       WHERE request_id = $3`,
      [JSON.stringify({ cyrDocumentId, photos: cyrData.photos }), cyrData.verifierNotes, requestId]
    );

    log.info({ requestId, cyrDocumentId, stnDocumentId }, 'CYM verification completed');

    return {
      cyrDocumentId,
      stnDocumentId,
    };
  } catch (error: any) {
    log.error({ error, requestId }, 'Failed to complete CYM verification');
    throw error;
  }
}

/**
 * Get yard statistics
 */
export async function getYardStatistics(yardId: string): Promise<{
  totalCheckIns: number;
  pendingVerifications: number;
  completedToday: number;
  avgVerificationTimeMinutes: number;
}> {
  try {
    const result = await query(
      `SELECT 
         COUNT(*) AS total_check_ins,
         COUNT(CASE WHEN status = 'CHECKED_IN' THEN 1 END) AS pending,
         COUNT(CASE WHEN DATE(checked_in_at) = CURRENT_DATE THEN 1 END) AS completed_today,
         AVG(EXTRACT(EPOCH FROM (verified_at - checked_in_at))/60) AS avg_time
       FROM yard_check_ins
       WHERE yard_id = $1
       AND checked_in_at >= NOW() - INTERVAL '30 days'`,
      [yardId]
    );

    const stats = result.rows[0];

    return {
      totalCheckIns: parseInt(stats.total_check_ins),
      pendingVerifications: parseInt(stats.pending || '0'),
      completedToday: parseInt(stats.completed_today || '0'),
      avgVerificationTimeMinutes: parseFloat(stats.avg_time || '0'),
    };
  } catch (error) {
    log.error({ error, yardId }, 'Failed to get yard statistics');
    throw new Error('Failed to retrieve yard statistics');
  }
}

