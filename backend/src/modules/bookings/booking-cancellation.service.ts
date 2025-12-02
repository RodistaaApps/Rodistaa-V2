/**
 * Booking Cancellation Service (NestJS)
 * Wraps the core booking cancellation business logic
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { BookingCancellationService as CoreBookingCancellationService } from '@rodistaa/utils';

@Injectable()
export class BookingCancellationService {
  private coreService: CoreBookingCancellationService;

  constructor(private prisma: PrismaService) {
    this.coreService = new CoreBookingCancellationService(this.prisma);
  }

  /**
   * Cancel a booking
   * BUSINESS RULE: All pending bids rejected, NO refunds
   */
  async cancelBooking(bookingId: string, shipperId: string, cancellationReason?: string) {
    return this.coreService.cancelBooking({
      bookingId,
      shipperId,
      cancellationReason,
    });
  }

  /**
   * Check if booking can be cancelled
   */
  async canCancelBooking(bookingId: string, shipperId: string) {
    return this.coreService.canCancelBooking(bookingId, shipperId);
  }

  /**
   * Get cancellation impact (for confirmation UI)
   */
  async getCancellationImpact(bookingId: string) {
    return this.coreService.getCancellationImpact(bookingId);
  }
}

