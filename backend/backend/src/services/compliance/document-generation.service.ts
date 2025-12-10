/**
 * Transport Document Generation Service
 * Generates STN/CTL/CYR documents for Indian freight compliance
 */

import { query } from '../../db';
import { v4 as uuid } from 'uuid';
import { ulid } from 'ulid';
import { logger } from '../../utils/logger';

const log = logger.child({ module: 'document-generation' });

export interface DocumentData {
  bookingId: string;
  shipmentId?: string;
  operatorId: string;
  shipperId: string;
  driverId?: string;
  pickupDetails: any;
  dropDetails: any;
  goodsDetails: any;
  truckDetails: any;
}

/**
 * Generate CTL (Consignment Transport List) for drop-shipping
 */
export async function generateCTL(data: DocumentData, createdBy: string): Promise<string> {
  try {
    const documentId = `CTL-${ulid()}`;
    const id = uuid();

    const documentData = {
      documentNumber: documentId,
      issuedDate: new Date().toISOString(),
      bookingId: data.bookingId,
      consignor: data.pickupDetails,
      consignee: data.dropDetails,
      goods: data.goodsDetails,
      truck: data.truckDetails,
      route: {
        from: data.pickupDetails.location,
        to: data.dropDetails.location,
      },
    };

    await query(
      `INSERT INTO transport_documents
       (id, document_id, document_type, booking_id, shipment_id, operator_id, shipper_id,
        driver_id, status, verification_status, document_data, created_by, issued_at)
       VALUES ($1, $2, 'CTL', $3, $4, $5, $6, $7, 'ISSUED', 'UNVERIFIED', $8, $9, NOW())`,
      [
        id,
        documentId,
        data.bookingId,
        data.shipmentId,
        data.operatorId,
        data.shipperId,
        data.driverId,
        JSON.stringify(documentData),
        createdBy,
      ]
    );

    log.info({ documentId, bookingId: data.bookingId }, 'CTL generated');

    // Generate PDF asynchronously
    setTimeout(() => generatePDF(id, 'CTL', documentData), 1000);

    return documentId;
  } catch (error: any) {
    log.error({ error, bookingId: data.bookingId }, 'Failed to generate CTL');
    throw error;
  }
}

/**
 * Convert CTL to STN after verification
 */
export async function convertCTLToSTN(
  ctlDocumentId: string,
  verifiedBy: string,
  verificationMethod: string
): Promise<string> {
  try {
    // Get CTL document
    const ctlResult = await query(
      `SELECT id, document_data, booking_id, shipment_id, operator_id, shipper_id, driver_id
       FROM transport_documents
       WHERE document_id = $1 AND document_type = 'CTL'`,
      [ctlDocumentId]
    );

    if (ctlResult.rows.length === 0) {
      throw new Error('CTL document not found');
    }

    const ctl = ctlResult.rows[0];
    const stnId = `STN-${ulid()}`;
    const newDocId = uuid();

    // Create STN with same data but verified status
    const documentData = JSON.parse(ctl.document_data);
    documentData.documentNumber = stnId;
    documentData.convertedFrom = ctlDocumentId;
    documentData.verificationMethod = verificationMethod;

    await query(
      `INSERT INTO transport_documents
       (id, document_id, document_type, booking_id, shipment_id, operator_id, shipper_id,
        driver_id, status, verification_status, document_data, verified_by, verified_at,
        verification_method, created_by, issued_at, parent_document_id)
       VALUES ($1, $2, 'STN', $3, $4, $5, $6, $7, 'ISSUED', 'VERIFIED', $8, $9, NOW(), $10, $9, NOW(), $11)`,
      [
        newDocId,
        stnId,
        ctl.booking_id,
        ctl.shipment_id,
        ctl.operator_id,
        ctl.shipper_id,
        ctl.driver_id,
        JSON.stringify(documentData),
        verifiedBy,
        verificationMethod,
        ctl.id,
      ]
    );

    // Mark CTL as superseded
    await query(
      `UPDATE transport_documents
       SET status = 'COMPLETED', is_latest_version = FALSE, updated_at = NOW()
       WHERE id = $1`,
      [ctl.id]
    );

    // Log conversion
    await query(
      `INSERT INTO document_conversions (id, source_document_id, target_document_id, conversion_type, triggered_by)
       VALUES ($1, $2, $3, 'CTL_TO_STN', $4)`,
      [uuid(), ctl.id, newDocId, verifiedBy]
    );

    log.info({ ctlDocumentId, stnId, verificationMethod }, 'CTL converted to STN');

    // Generate STN PDF
    setTimeout(() => generatePDF(newDocId, 'STN', documentData), 1000);

    return stnId;
  } catch (error: any) {
    log.error({ error, ctlDocumentId }, 'Failed to convert CTL to STN');
    throw error;
  }
}

/**
 * Generate CYR (Certified Yard Report)
 */
export async function generateCYR(
  bookingId: string,
  yardId: string,
  goodsDetails: any,
  verificationEvidence: any,
  createdBy: string
): Promise<string> {
  try {
    const documentId = `CYR-${ulid()}`;
    const id = uuid();

    const documentData = {
      documentNumber: documentId,
      issuedDate: new Date().toISOString(),
      yardId,
      bookingId,
      goods: goodsDetails,
      verification: verificationEvidence,
      certifiedBy: createdBy,
    };

    await query(
      `INSERT INTO transport_documents
       (id, document_id, document_type, booking_id, operator_id, shipper_id,
        status, verification_status, document_data, verified_by, verified_at,
        verification_method, created_by, issued_at)
       SELECT $1, $2, 'CYR', $3,
              b.operator_id, b.shipper_id,
              'ISSUED', 'VERIFIED', $4, $5, NOW(), 'CYM', $5, NOW()
       FROM bookings b
       WHERE b.id = $3`,
      [id, documentId, bookingId, JSON.stringify(documentData), createdBy]
    );

    log.info({ documentId, bookingId, yardId }, 'CYR generated');

    // Generate PDF
    setTimeout(() => generatePDF(id, 'CYR', documentData), 1000);

    return documentId;
  } catch (error: any) {
    log.error({ error, bookingId, yardId }, 'Failed to generate CYR');
    throw error;
  }
}

/**
 * Generate PDF (mock - in production would use actual PDF library)
 */
async function generatePDF(documentDbId: string, documentType: string, documentData: any): Promise<void> {
  try {
    // In production: Use Puppeteer, PDFKit, or similar
    // For MVP: Mock PDF generation
    const pdfUrl = `/documents/${documentType.toLowerCase()}/${documentData.documentNumber}.pdf`;

    await query(
      `UPDATE transport_documents
       SET pdf_url = $1, pdf_generated_at = NOW(), updated_at = NOW()
       WHERE id = $2`,
      [pdfUrl, documentDbId]
    );

    log.info({ documentType, documentNumber: documentData.documentNumber }, 'PDF generated (mock)');
  } catch (error) {
    log.error({ error, documentDbId }, 'Failed to generate PDF');
  }
}

/**
 * Get document by ID
 */
export async function getDocument(documentId: string): Promise<any> {
  try {
    const result = await query(
      `SELECT document_id, document_type, status, verification_status, document_data, pdf_url,
              issued_at, verified_at, verified_by
       FROM transport_documents
       WHERE document_id = $1 AND is_latest_version = TRUE`,
      [documentId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const doc = result.rows[0];
    return {
      documentId: doc.document_id,
      documentType: doc.document_type,
      status: doc.status,
      verificationStatus: doc.verification_status,
      data: JSON.parse(doc.document_data),
      pdfUrl: doc.pdf_url,
      issuedAt: doc.issued_at,
      verifiedAt: doc.verified_at,
      verifiedBy: doc.verified_by,
    };
  } catch (error) {
    log.error({ error, documentId }, 'Failed to get document');
    throw new Error('Failed to retrieve document');
  }
}

