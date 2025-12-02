/**
 * Alternate Truck Assignment Service (NestJS)
 * Wraps the core alternate truck assignment business logic
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AlternateTruckAssignmentService as CoreAlternateTruckService } from '@rodistaa/utils';

export interface AssignAlternateTruckDto {
  shipmentId: string;
  breakdownId: string;
  alternateTruckId: string;
  alternateDriverId?: string;
  reason?: string;
}

@Injectable()
export class AlternateTruckService {
  private coreService: CoreAlternateTruckService;

  constructor(private prisma: PrismaService) {
    this.coreService = new CoreAlternateTruckService(this.prisma);
  }

  /**
   * Assign alternate truck after breakdown/accident
   * BUSINESS RULE: No new bidding fee charged
   */
  async assignAlternateTruck(operatorId: string, dto: AssignAlternateTruckDto) {
    return this.coreService.assignAlternateTruck({
      ...dto,
      operatorId,
    });
  }

  /**
   * Check if alternate truck can be assigned
   */
  async canAssignAlternateTruck(shipmentId: string, operatorId: string) {
    return this.coreService.canAssignAlternateTruck(shipmentId, operatorId);
  }
}

