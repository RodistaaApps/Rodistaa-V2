/**
 * @rodistaa/utils - Document Expiry Auto-Blocking Service
 * 
 * Monitors and blocks trucks with expired documents:
 * - Auto-block on document expiry
 * - Auto-unblock on document update
 * - Alert before expiry
 * 
 * BUSINESS RULE: Document expiry → automatic block. Auto-unblock on update.
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { isAfter, isBefore, differenceInDays } from 'date-fns';

export interface DocumentExpiryStatus {
  truckId: string;
  hasExpiredDocuments: boolean;
  expiredDocuments: string[];
  documentsExpiringSoon: string[];
  isBlocked: boolean;
}

export class DocumentExpiryService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Check document expiry status for truck
   */
  async checkDocumentExpiry(truckId: string): Promise<DocumentExpiryStatus> {
    const truck = await this.prisma.truck.findUnique({
      where: { id: truckId },
      select: {
        id: true,
        status: true,
        permitExpiry: true,
        insuranceExpiry: true,
        fitnessExpiry: true,
        pollutionExpiry: true,
        // Add other document expiry fields as per schema
      },
    });

    if (!truck) {
      throw new Error(`Truck ${truckId} not found`);
    }

    const now = new Date();
    const expiredDocuments: string[] = [];
    const documentsExpiringSoon: string[] = [];

    // Check each document expiry
    if (truck.permitExpiry && isBefore(truck.permitExpiry, now)) {
      expiredDocuments.push('PERMIT');
    } else if (truck.permitExpiry && differenceInDays(truck.permitExpiry, now) <= 7) {
      documentsExpiringSoon.push('PERMIT');
    }

    if (truck.insuranceExpiry && isBefore(truck.insuranceExpiry, now)) {
      expiredDocuments.push('INSURANCE');
    } else if (truck.insuranceExpiry && differenceInDays(truck.insuranceExpiry, now) <= 7) {
      documentsExpiringSoon.push('INSURANCE');
    }

    if (truck.fitnessExpiry && isBefore(truck.fitnessExpiry, now)) {
      expiredDocuments.push('FITNESS');
    } else if (truck.fitnessExpiry && differenceInDays(truck.fitnessExpiry, now) <= 7) {
      documentsExpiringSoon.push('FITNESS');
    }

    if (truck.pollutionExpiry && isBefore(truck.pollutionExpiry, now)) {
      expiredDocuments.push('POLLUTION');
    } else if (truck.pollutionExpiry && differenceInDays(truck.pollutionExpiry, now) <= 7) {
      documentsExpiringSoon.push('POLLUTION');
    }

    return {
      truckId,
      hasExpiredDocuments: expiredDocuments.length > 0,
      expiredDocuments,
      documentsExpiringSoon,
      isBlocked: truck.status === 'BLOCKED',
    };
  }

  /**
   * Auto-block truck with expired documents
   * 
   * BUSINESS RULE: Auto-block on document expiry
   */
  async autoBlockExpiredDocuments(truckId: string): Promise<{
    blocked: boolean;
    reason: string;
    expiredDocuments: string[];
  }> {
    const status = await this.checkDocumentExpiry(truckId);

    if (!status.hasExpiredDocuments) {
      return {
        blocked: false,
        reason: 'No expired documents',
        expiredDocuments: [],
      };
    }

    // BUSINESS RULE: Auto-block truck
    await this.prisma.truck.update({
      where: { id: truckId },
      data: {
        status: 'BLOCKED',
        blockedReason: `DOCUMENT_EXPIRED: ${status.expiredDocuments.join(', ')}`,
      },
    });

    return {
      blocked: true,
      reason: `Truck blocked due to expired documents: ${status.expiredDocuments.join(', ')}`,
      expiredDocuments: status.expiredDocuments,
    };
  }

  /**
   * Auto-unblock truck when documents updated
   * 
   * BUSINESS RULE: Auto-unblock on document update
   */
  async autoUnblockOnDocumentUpdate(truckId: string): Promise<{
    unblocked: boolean;
    message: string;
  }> {
    const status = await this.checkDocumentExpiry(truckId);

    // If no expired documents and truck is blocked due to expiry, unblock
    if (!status.hasExpiredDocuments && status.isBlocked) {
      await this.prisma.truck.update({
        where: { id: truckId },
        data: {
          status: 'AVAILABLE',
          blockedReason: null,
        },
      });

      return {
        unblocked: true,
        message: 'Truck unblocked automatically. All documents are now valid.',
      };
    }

    return {
      unblocked: false,
      message: status.hasExpiredDocuments
        ? 'Cannot unblock: Truck still has expired documents'
        : 'Truck is not blocked',
    };
  }

  /**
   * Process auto-blocking for all trucks with expired documents
   * 
   * BUSINESS RULE: Run this as a scheduled job
   */
  async processAutoBlocking(): Promise<{
    checked: number;
    blocked: number;
    truckIds: string[];
  }> {
    const trucks = await this.prisma.truck.findMany({
      where: {
        status: {
          not: 'BLOCKED',
        },
      },
    });

    const blockedTruckIds: string[] = [];

    for (const truck of trucks) {
      try {
        const result = await this.autoBlockExpiredDocuments(truck.id);
        if (result.blocked) {
          blockedTruckIds.push(truck.id);
        }
      } catch (error) {
        console.error(`Failed to check/block truck ${truck.id}:`, error);
      }
    }

    return {
      checked: trucks.length,
      blocked: blockedTruckIds.length,
      truckIds: blockedTruckIds,
    };
  }
}

