/**
 * Shipments Module
 * Handles shipment-related operations including alternate truck assignment
 */

import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AlternateTruckService } from './alternate-truck.service';

@Module({
  providers: [
    PrismaService,
    AlternateTruckService,
  ],
  exports: [
    AlternateTruckService,
  ],
})
export class ShipmentsModule {}

