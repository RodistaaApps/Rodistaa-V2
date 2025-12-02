/**
 * Bids Module
 * Handles bid-related operations with business rule enforcement
 */

import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { BidsService } from './bids.service';

@Module({
  providers: [
    PrismaService,
    BidsService,
  ],
  exports: [
    BidsService,
  ],
})
export class BidsModule {}

