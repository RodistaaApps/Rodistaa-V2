/**
 * @rodistaa/utils - Auto-Finalization Service
 * 
 * Automatically finalizes bookings when shipper is idle:
 * - Finds lowest bid
 * - Auto-accepts lowest bid
 * - Auto-rejects all other bids
 * - Creates shipment
 * 
 * BUSINESS RULE: Lowest bid auto-finalizes if shipper idle.
 */

import { PrismaClient, Prisma } from '@prisma/client';

export interface AutoFinalizeBookingParams {
  bookingId: string;
  shipperInactiveHours?: number; // Default: configurable
}

export interface AutoFinalizationResult {
  bookingId: string;
  autoFinalized: boolean;
  acceptedBidId?: string;
  rejectedBidIds: string[];
  shipmentCreated: boolean;
  shipmentId?: string;
}

export class AutoFinalizationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Auto-finalize booking by accepting lowest bid
   * 
   * BUSINESS RULE:
   * - Lowest bid (amount ASC) wins
   * - All other bids auto-rejected
   * - Shipment created from accepted bid
   */
  async autoFinalizeBooking(params: AutoFinalizeBookingParams): Promise<AutoFinalizationResult> {
    const { bookingId, shipperInactiveHours = 24 } = params;

    const booking = await this.prisma.booking.findUnique({
      where: { bookingId },
      include: {
        bids: {
          where: {
            status: 'PENDING',
          },
          orderBy: {
            amount: 'asc', // BUSINESS RULE: Lowest bid wins
          },
        },
      },
    });

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    // Check if booking is still open
    if (booking.status !== 'POSTED' && booking.status !== 'OPEN') {
      return {
        bookingId,
        autoFinalized: false,
        rejectedBidIds: [],
        shipmentCreated: false,
      };
    }

    // Check if shipper has been inactive
    const now = new Date();
    const lastActivity = booking.updatedAt || booking.createdAt;
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

    if (hoursSinceActivity < shipperInactiveHours) {
      return {
        bookingId,
        autoFinalized: false,
        rejectedBidIds: [],
        shipmentCreated: false,
      };
    }

    // Check if there are any pending bids
    if (booking.bids.length === 0) {
      return {
        bookingId,
        autoFinalized: false,
        rejectedBidIds: [],
        shipmentCreated: false,
      };
    }

    // BUSINESS RULE: Lowest bid wins (already ordered by amount ASC)
    const lowestBid = booking.bids[0];
    const otherBids = booking.bids.slice(1);

    // Auto-finalize in transaction
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Accept lowest bid
      const acceptedBid = await tx.bid.update({
        where: { id: lowestBid.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: now,
        },
      });

      // 2. Reject all other bids
      const rejectedBidIds: string[] = [];
      if (otherBids.length > 0) {
        await tx.bid.updateMany({
          where: {
            bookingId: booking.id,
            status: 'PENDING',
            id: {
              not: lowestBid.id,
            },
          },
          data: {
            status: 'REJECTED',
            rejectedAt: now,
          },
        });

        rejectedBidIds.push(...otherBids.map((bid: { id: string }) => bid.id));
      }

      // 3. Update booking status to CONFIRMED
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CONFIRMED',
          acceptedBidId: lowestBid.id,
          acceptedAt: now,
          autoFinalized: true, // Mark as auto-finalized
        },
      });

      // 4. Create shipment from accepted bid
      const shipment = await tx.shipment.create({
        data: {
          shipmentId: `SHIP-${Date.now()}-${booking.bookingId.slice(-6)}`,
          bookingId: booking.id,
          operatorId: lowestBid.operatorId,
          status: 'ASSIGNED',
          acceptedBidId: lowestBid.id,
        },
      });

      return {
        bookingId,
        autoFinalized: true,
        acceptedBidId: lowestBid.id,
        rejectedBidIds,
        shipmentCreated: true,
        shipmentId: shipment.shipmentId,
      };
    });
  }

  /**
   * Check if booking should be auto-finalized
   */
  async shouldAutoFinalize(bookingId: string, shipperInactiveHours: number = 24): Promise<{
    shouldAutoFinalize: boolean;
    hasBids: boolean;
    lowestBidAmount?: number;
    hoursSinceActivity: number;
    message?: string;
  }> {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingId },
      include: {
        bids: {
          where: {
            status: 'PENDING',
          },
          orderBy: {
            amount: 'asc',
          },
        },
      },
    });

    if (!booking) {
      return {
        shouldAutoFinalize: false,
        hasBids: false,
        hoursSinceActivity: 0,
        message: 'Booking not found',
      };
    }

    if (booking.status !== 'POSTED' && booking.status !== 'OPEN') {
      return {
        shouldAutoFinalize: false,
        hasBids: false,
        hoursSinceActivity: 0,
        message: `Booking status is ${booking.status}, cannot auto-finalize`,
      };
    }

    const now = new Date();
    const lastActivity = booking.updatedAt || booking.createdAt;
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

    const hasBids = booking.bids.length > 0;

    if (!hasBids) {
      return {
        shouldAutoFinalize: false,
        hasBids: false,
        hoursSinceActivity,
        message: 'No pending bids to auto-finalize',
      };
    }

    if (hoursSinceActivity < shipperInactiveHours) {
      return {
        shouldAutoFinalize: false,
        hasBids: true,
        lowestBidAmount: booking.bids[0]?.amount,
        hoursSinceActivity,
        message: `Shipper has been active within last ${shipperInactiveHours} hours`,
      };
    }

    return {
      shouldAutoFinalize: true,
      hasBids: true,
      lowestBidAmount: booking.bids[0]?.amount,
      hoursSinceActivity,
      message: `Booking ready for auto-finalization. Lowest bid: ₹${booking.bids[0]?.amount}`,
    };
  }

  /**
   * Process auto-finalization for all eligible bookings
   * 
   * BUSINESS RULE: Run this as a scheduled job
   */
  async processAutoFinalizations(shipperInactiveHours: number = 24): Promise<{
    processed: number;
    finalized: number;
    results: AutoFinalizationResult[];
  }> {
    // Find all open bookings with pending bids
    const eligibleBookings = await this.prisma.booking.findMany({
      where: {
        status: {
          in: ['POSTED', 'OPEN'],
        },
        bids: {
          some: {
            status: 'PENDING',
          },
        },
      },
      include: {
        bids: {
          where: {
            status: 'PENDING',
          },
        },
      },
    });

    const results: AutoFinalizationResult[] = [];
    let finalized = 0;

    for (const booking of eligibleBookings) {
      try {
        const result = await this.autoFinalizeBooking({
          bookingId: booking.bookingId,
          shipperInactiveHours,
        });

        results.push(result);
        if (result.autoFinalized) {
          finalized++;
        }
      } catch (error) {
        // Log error but continue processing other bookings
        console.error(`Failed to auto-finalize booking ${booking.bookingId}:`, error);
      }
    }

    return {
      processed: eligibleBookings.length,
      finalized,
      results,
    };
  }
}

