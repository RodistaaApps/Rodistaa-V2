/**
 * @rodistaa/utils - Truck Inspection 120-Day Cycle Service
 * 
 * Manages truck inspection cycle:
 * - Inspection every 120 days
 * - Remind before due date
 * - Block truck if overdue
 * 
 * BUSINESS RULE: Inspection every 120 days.
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { addDays, differenceInDays, isAfter, isBefore } from 'date-fns';

export interface InspectionCycleResult {
  truckId: string;
  lastInspectionDate: Date | null;
  nextInspectionDue: Date | null;
  daysUntilDue: number | null;
  isOverdue: boolean;
  isDueSoon: boolean; // Within 7 days
}

export class TruckInspectionService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Calculate next inspection due date
   * 
   * BUSINESS RULE: Next inspection = last inspection + 120 days
   */
  calculateNextInspectionDue(lastInspectionDate: Date): Date {
    return addDays(lastInspectionDate, 120);
  }

  /**
   * Get inspection status for truck
   */
  async getInspectionStatus(truckId: string): Promise<InspectionCycleResult> {
    const truck = await this.prisma.truck.findUnique({
      where: {
        id: truckId,
      },
      select: {
        id: true,
        lastInspectionDate: true,
      },
    });

    if (!truck) {
      throw new Error(`Truck ${truckId} not found`);
    }

    const lastInspectionDate = truck.lastInspectionDate;
    let nextInspectionDue: Date | null = null;
    let daysUntilDue: number | null = null;
    let isOverdue = false;
    let isDueSoon = false;

    if (lastInspectionDate) {
      // BUSINESS RULE: Next inspection = last inspection + 120 days
      nextInspectionDue = this.calculateNextInspectionDue(lastInspectionDate);
      const now = new Date();
      
      daysUntilDue = differenceInDays(nextInspectionDue, now);
      isOverdue = isBefore(nextInspectionDue, now);
      isDueSoon = daysUntilDue <= 7 && daysUntilDue > 0;
    }

    return {
      truckId,
      lastInspectionDate,
      nextInspectionDue,
      daysUntilDue,
      isOverdue,
      isDueSoon,
    };
  }

  /**
   * Record inspection for truck
   * 
   * BUSINESS RULE: Update last inspection date, recalculate next due date
   */
  async recordInspection(truckId: string, inspectionDate: Date = new Date()): Promise<{
    truckId: string;
    lastInspectionDate: Date;
    nextInspectionDue: Date;
  }> {
    const truck = await this.prisma.truck.findUnique({
      where: { id: truckId },
    });

    if (!truck) {
      throw new Error(`Truck ${truckId} not found`);
    }

    const nextInspectionDue = this.calculateNextInspectionDue(inspectionDate);

    await this.prisma.truck.update({
      where: { id: truckId },
      data: {
        lastInspectionDate: inspectionDate,
        nextInspectionDue,
      },
    });

    return {
      truckId,
      lastInspectionDate: inspectionDate,
      nextInspectionDue,
    };
  }

  /**
   * Check and block overdue inspections
   * 
   * BUSINESS RULE: Block truck if inspection overdue
   */
  async checkAndBlockOverdueInspections(): Promise<{
    checked: number;
    blocked: number;
    truckIds: string[];
  }> {
    const now = new Date();

    // Find trucks with overdue inspections
    const overdueTrucks = await this.prisma.truck.findMany({
      where: {
        nextInspectionDue: {
          lt: now, // Less than now = overdue
        },
        status: {
          not: 'BLOCKED',
        },
      },
    });

    const truckIds: string[] = [];

    // Block overdue trucks
    for (const truck of overdueTrucks) {
      await this.prisma.truck.update({
        where: { id: truck.id },
        data: {
          status: 'BLOCKED',
          blockedReason: 'INSPECTION_OVERDUE',
        },
      });
      truckIds.push(truck.id);
    }

    return {
      checked: overdueTrucks.length,
      blocked: truckIds.length,
      truckIds,
    };
  }

  /**
   * Get trucks due for inspection soon (within 7 days)
   */
  async getTrucksDueForInspectionSoon(days: number = 7): Promise<{
    truckId: string;
    nextInspectionDue: Date;
    daysUntilDue: number;
  }[]> {
    const now = new Date();
    const dueDateThreshold = addDays(now, days);

    const trucks = await this.prisma.truck.findMany({
      where: {
        nextInspectionDue: {
          gte: now,
          lte: dueDateThreshold,
        },
        status: {
          not: 'BLOCKED',
        },
      },
      select: {
        id: true,
        nextInspectionDue: true,
      },
    });

    return trucks.map((truck) => ({
      truckId: truck.id,
      nextInspectionDue: truck.nextInspectionDue!,
      daysUntilDue: differenceInDays(truck.nextInspectionDue!, now),
    }));
  }
}

