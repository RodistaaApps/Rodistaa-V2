/**
 * @rodistaa/utils - Alternate Truck Assignment Service
 * 
 * Handles alternate truck assignment when breakdown/accident occurs:
 * - Allows operator to assign alternate truck to same shipment
 * - NO new bidding fee charged (business rule)
 * - Shipment ID persists
 * 
 * BUSINESS RULE: Alternate truck assignment allowed for breakdown/accident.
 * No additional bidding fee charged.
 */

import { PrismaClient, Prisma } from '@prisma/client';

export interface AssignAlternateTruckParams {
  shipmentId: string;
  breakdownId: string; // Must reference existing ShipmentBreakdown
  operatorId: string;
  alternateTruckId: string;
  alternateDriverId?: string; // Optional - can keep same driver
  reason?: string;
}

export interface AssignAlternateTruckResult {
  shipmentId: string;
  oldTruckId: string;
  newTruckId: string;
  breakdownId: string;
  biddingFeeCharged: boolean; // Should always be false
}

export class AlternateTruckAssignmentService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Assign alternate truck after breakdown/accident
   * 
   * BUSINESS RULE:
   * - Only allowed if breakdown/accident reported
   * - NO new bidding fee charged
   * - Shipment ID remains same
   */
  async assignAlternateTruck(params: AssignAlternateTruckParams): Promise<AssignAlternateTruckResult> {
    const { shipmentId, breakdownId, operatorId, alternateTruckId, alternateDriverId, reason } = params;

    // 1. Verify shipment exists and belongs to operator
    const shipment = await this.prisma.shipment.findUnique({
      where: { shipmentId },
      include: {
        breakdowns: true,
      },
    });

    if (!shipment) {
      throw new Error(`Shipment ${shipmentId} not found`);
    }

    if (shipment.operatorId !== operatorId) {
      throw new Error(`Shipment does not belong to operator ${operatorId}`);
    }

    // 2. Verify breakdown/accident was reported
    const breakdown = await this.prisma.shipmentBreakdown.findUnique({
      where: { id: breakdownId },
    });

    if (!breakdown) {
      throw new Error(`Breakdown record ${breakdownId} not found`);
    }

    if (breakdown.shipmentId !== shipmentId) {
      throw new Error(`Breakdown does not belong to shipment ${shipmentId}`);
    }

    if (breakdown.status !== 'REPORTED' && breakdown.status !== 'RESOLVING') {
      throw new Error(
        `Alternate truck assignment only allowed for reported breakdowns/accidents. Current breakdown status: ${breakdown.status}`
      );
    }

    // 3. Verify alternate truck exists and belongs to operator
    const alternateTruck = await this.prisma.truck.findUnique({
      where: { id: alternateTruckId },
    });

    if (!alternateTruck) {
      throw new Error(`Alternate truck ${alternateTruckId} not found`);
    }

    if (alternateTruck.operatorId !== operatorId) {
      throw new Error(`Alternate truck does not belong to operator ${operatorId}`);
    }

    if (alternateTruck.status !== 'AVAILABLE') {
      throw new Error(`Alternate truck ${alternateTruckId} is not available (status: ${alternateTruck.status})`);
    }

    // 4. Verify alternate driver if provided
    if (alternateDriverId) {
      const alternateDriver = await this.prisma.driver.findUnique({
        where: { id: alternateDriverId },
      });

      if (!alternateDriver) {
        throw new Error(`Alternate driver ${alternateDriverId} not found`);
      }

      if (alternateDriver.operatorId !== operatorId) {
        throw new Error(`Alternate driver does not belong to operator ${operatorId}`);
      }

      // Check driver doesn't have active shipment (business rule)
      const activeShipment = await this.prisma.shipment.findFirst({
        where: {
          driverId: alternateDriverId,
          status: {
            in: ['ASSIGNED', 'IN_TRANSIT', 'PICKUP_COMPLETED', 'DELIVERY_COMPLETED'],
          },
          id: {
            not: shipmentId, // Exclude current shipment
          },
        },
      });

      if (activeShipment) {
        throw new Error(
          `Alternate driver ${alternateDriverId} already has an active shipment. Business Rule: One active shipment per driver.`
        );
      }
    }

    const oldTruckId = shipment.truckId;
    const oldDriverId = shipment.driverId;

    // 5. Assign alternate truck (NO NEW BIDDING FEE - business rule)
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update shipment with alternate truck
      await tx.shipment.update({
        where: { shipmentId },
        data: {
          truckId: alternateTruckId,
          driverId: alternateDriverId || oldDriverId, // Keep same driver if not specified
        },
      });

      // Update breakdown record
      await tx.shipmentBreakdown.update({
        where: { id: breakdownId },
        data: {
          alternateTruckId,
          alternateDriverId: alternateDriverId || null,
          status: 'RESOLVED',
          resolvedAt: new Date(),
        },
      });

      // Update old truck to AVAILABLE
      await tx.truck.update({
        where: { id: oldTruckId },
        data: { status: 'AVAILABLE' },
      });

      // Update alternate truck to ON_TRIP
      await tx.truck.update({
        where: { id: alternateTruckId },
        data: { status: 'ON_TRIP' },
      });

      // Update driver status if changed
      if (alternateDriverId && alternateDriverId !== oldDriverId) {
        // Release old driver
        await tx.driver.update({
          where: { id: oldDriverId },
          data: { status: 'AVAILABLE' },
        });

        // Update new driver
        await tx.driver.update({
          where: { id: alternateDriverId },
          data: { status: 'ON_TRIP' },
        });
      }
    });

    return {
      shipmentId,
      oldTruckId,
      newTruckId: alternateTruckId,
      breakdownId,
      biddingFeeCharged: false, // BUSINESS RULE: No new bidding fee for alternate truck
    };
  }

  /**
   * Check if alternate truck can be assigned
   */
  async canAssignAlternateTruck(shipmentId: string, operatorId: string): Promise<{
    canAssign: boolean;
    hasBreakdown: boolean;
    breakdownId?: string;
    message?: string;
  }> {
    const shipment = await this.prisma.shipment.findUnique({
      where: { shipmentId },
      include: {
        breakdowns: {
          where: {
            status: {
              in: ['REPORTED', 'RESOLVING'],
            },
          },
        },
      },
    });

    if (!shipment) {
      return {
        canAssign: false,
        hasBreakdown: false,
        message: 'Shipment not found',
      };
    }

    if (shipment.operatorId !== operatorId) {
      return {
        canAssign: false,
        hasBreakdown: false,
        message: 'Only shipment operator can assign alternate truck',
      };
    }

    const hasBreakdown = shipment.breakdowns.length > 0;

    if (!hasBreakdown) {
      return {
        canAssign: false,
        hasBreakdown: false,
        message: 'Alternate truck assignment only allowed when breakdown/accident is reported. Business Rule: No alternate truck without breakdown.',
      };
    }

    return {
      canAssign: true,
      hasBreakdown: true,
      breakdownId: shipment.breakdowns[0].id,
      message: 'Alternate truck can be assigned. BUSINESS RULE: No new bidding fee will be charged.',
    };
  }
}

