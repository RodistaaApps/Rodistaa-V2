/**
 * Bookings Module
 * Handles booking-related operations including cancellation
 */

import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { BookingCancellationService } from './booking-cancellation.service';

@Module({
  providers: [
    PrismaService,
    BookingCancellationService,
  ],
  exports: [
    BookingCancellationService,
  ],
})
export class BookingsModule {}

