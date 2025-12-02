/**
 * @rodistaa/utils - Booking Cancellation Service
 * 
 * Handles booking cancellation with strict business rules:
 * - Rejects ALL pending bids
 * - NO refunds to operators (bidding fees retained)
 * - Updates booking status to CANCELLED
 * 
 * BUSINESS RULE: If shipper cancels after bids, all bids rejected, NO refunds.
 */

import { PrismaClient, Prisma } from '@prisma/client';

export interface CancelBookingParams {
  bookingId: string;
  shipperId: string;
  cancellationReason?: string;
}

export interface CancelBookingResult {
  bookingId: string;
  cancelledBidsCount: number;
  bidsRejected: string[];
  refundsIssued: number; // Should always be 0 per business rule
}

export class BookingCancellationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Cancel a booking - rejects all bids, NO refunds
   * 
   * BUSINESS RULE:
   * - All pending bids are rejected
   * - Bidding fees are NOT refunded to operators
   * - Booking status updated to CANCELLED
   */
  async cancelBooking(params: CancelBookingParams): Promise<CancelBookingResult> {
    const { bookingId, shipperId, cancellationReason } = params;

    // Get booking with bids
    const booking = await this.prisma.booking.findUnique({
      where: { bookingId },
      include: {
        bids: {
          where: {
            status: 'PENDING',
          },
        },
      },
    });

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    // Verify shipper owns the booking
    if (booking.shipperId !== shipperId) {
      throw new Error(`Booking ${bookingId} does not belong to shipper ${shipperId}`);
    }

    // Business Rule: Can cancel anytime
    // But if bids exist, they must be rejected with NO refunds

    const pendingBidIds = booking.bids.map((bid: any) => bid.id);

    // Reject all pending bids (NO refunds - business rule)
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Reject all pending bids
      if (pendingBidIds.length > 0) {
        await tx.bid.updateMany({
          where: {
            bookingId: booking.id,
            status: 'PENDING',
          },
          data: {
            status: 'REJECTED',
            // Note: Bidding fees are NOT refunded - this is by design
            // Operators paid the fee, and it's retained per business rule
          },
        });
      }

      // 2. Update booking status to CANCELLED
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          // Store cancellation reason if provided
          // Note: No refunds field needed - business rule is NO REFUNDS
        },
      });
    });

    return {
      bookingId,
      cancelledBidsCount: pendingBidIds.length,
      bidsRejected: pendingBidIds,
      refundsIssued: 0, // BUSINESS RULE: NO REFUNDS when booking cancelled after bids
    };
  }

  /**
   * Check if booking can be cancelled
   */
  async canCancelBooking(bookingId: string, shipperId: string): Promise<{
    canCancel: boolean;
    hasBids: boolean;
    pendingBidsCount: number;
    message?: string;
  }> {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingId },
      include: {
        bids: {
          where: {
            status: 'PENDING',
          },
        },
      },
    });

    if (!booking) {
      return {
        canCancel: false,
        hasBids: false,
        pendingBidsCount: 0,
        message: 'Booking not found',
      };
    }

    if (booking.shipperId !== shipperId) {
      return {
        canCancel: false,
        hasBids: false,
        pendingBidsCount: 0,
        message: 'Only shipper can cancel their booking',
      };
    }

    const hasBids = booking.bids.length > 0;
    const pendingBidsCount = booking.bids.length;

    if (hasBids) {
      return {
        canCancel: true,
        hasBids: true,
        pendingBidsCount,
        message: `Booking can be cancelled. ${pendingBidsCount} pending bid(s) will be rejected. BUSINESS RULE: No refunds will be issued to operators.`,
      };
    }

    return {
      canCancel: true,
      hasBids: false,
      pendingBidsCount: 0,
      message: 'Booking can be cancelled. No pending bids.',
    };
  }

  /**
   * Get cancellation impact (for confirmation UI)
   */
  async getCancellationImpact(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingId },
      include: {
        bids: {
          where: {
            status: 'PENDING',
          },
          include: {
            operator: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    return {
      bookingId,
      pendingBidsCount: booking.bids.length,
      affectedOperators: booking.bids.map((bid: any) => ({
        operatorId: bid.operatorId,
        operatorName: bid.operator?.name,
        bidAmount: bid.amount,
      })),
      warning: booking.bids.length > 0
        ? 'BUSINESS RULE: All pending bids will be rejected. NO REFUNDS will be issued to operators for bidding fees already paid.'
        : null,
    };
  }
}

