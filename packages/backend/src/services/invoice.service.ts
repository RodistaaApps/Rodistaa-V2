/**
 * Invoice Service
 * Invoice generation and eInvoice pipeline to IRP
 */

import logger from 'pino';
import axios from 'axios';

const log = logger({ name: 'invoice-service' });

interface InvoiceData {
  shipmentId: string;
  bookingId: string;
  shipperId: string;
  operatorId: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  data: InvoiceData;
  pdfUrl?: string;
  irpAckNumber?: string;
  irpStatus?: 'PENDING' | 'SUBMITTED' | 'ACKNOWLEDGED' | 'FAILED';
}

/**
 * Generate invoice JSON (PDF generation stub)
 */
export async function generateInvoice(data: InvoiceData): Promise<Invoice> {
  const invoiceId = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const invoiceNumber = `INV/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`;

  const invoice: Invoice = {
    id: invoiceId,
    invoiceNumber,
    invoiceDate: new Date().toISOString().split('T')[0],
    data,
    irpStatus: 'PENDING',
  };

  log.info({ invoiceId, invoiceNumber, shipmentId: data.shipmentId }, 'Invoice generated');

  // TODO: Generate PDF using PDF library (pdfkit, puppeteer, etc.)
  // For now, return JSON invoice
  // invoice.pdfUrl = await generatePDF(invoice);

  return invoice;
}

/**
 * Submit invoice to IRP (eInvoice)
 */
export async function submitToIRP(invoice: Invoice): Promise<Invoice> {
  const irpUrl = process.env.IRP_USE_SANDBOX === 'true'
    ? process.env.IRP_SANDBOX_URL || 'http://localhost:5000/irp'
    : process.env.IRP_PROD_URL || 'https://einvoice.gst.gov.in';

  try {
    // In local dev, use mock service
    if (process.env.NODE_ENV === 'development' || irpUrl.includes('localhost')) {
      const response = await axios.post(`${irpUrl}/submit`, {
        invoice: invoice.data,
        invoiceNumber: invoice.invoiceNumber,
      });

      invoice.irpAckNumber = response.data.ackNumber || `MOCK-ACK-${Date.now()}`;
      invoice.irpStatus = 'ACKNOWLEDGED';

      log.info({ invoiceId: invoice.id, ackNumber: invoice.irpAckNumber }, 'Invoice submitted to IRP (mock)');
    } else {
      // Production IRP submission
      const clientId = process.env.IRP_PROD_CLIENT_ID;
      const clientSecret = process.env.IRP_PROD_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('IRP credentials not configured');
      }

      // TODO: Implement actual IRP API integration
      // This would involve:
      // 1. Authenticate with IRP
      // 2. Format invoice as per IRP schema
      // 3. Submit to IRP API
      // 4. Handle response and store ack number

      log.warn({ invoiceId: invoice.id }, 'IRP production integration not yet implemented');
      invoice.irpStatus = 'FAILED';
    }

    return invoice;
  } catch (error: any) {
    log.error({ error: error.message, invoiceId: invoice.id }, 'Failed to submit invoice to IRP');
    invoice.irpStatus = 'FAILED';
    throw new Error(`IRP submission failed: ${error.message}`);
  }
}

/**
 * Generate PDF from invoice (stub)
 */
async function generatePDF(invoice: Invoice): Promise<string> {
  // TODO: Implement PDF generation using pdfkit, puppeteer, or similar
  // For now, return placeholder URL
  log.info({ invoiceId: invoice.id }, 'PDF generation stub - not implemented');
  return `https://storage.example.com/invoices/${invoice.id}.pdf`;
}

