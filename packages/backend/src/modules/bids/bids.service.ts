/**
 * Bids Service
 * Business logic for bids with auto-finalization
 */

import * as bidsRepo from './bids.repository';
import * as bookingsRepo from '../bookings/bookings.repository';
import { evaluateAcsRules } from '../acs-adapter';
import logger from 'pino';
import { Bid, BidStatus, BookingStatus } from '@rodistaa/app-shared';

const log = logger({ name: 'bids-service' });

export interface CreateBidInput {
  bookingId: string;
  truckId: string;
  driverId?: string;
  amount: number;
  notes?: string;
}

/**
 * Create a new bid with ACS evaluation
 */
export async function createBid(
  operatorId: string,
  input: CreateBidInput,
  context: any
): Promise<Bid> {
  // Verify booking exists and is open
  const booking = await bookingsRepo.getBookingById(input.bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.status !== 'OPEN' && booking.status !== 'NEGOTIATION') {
    throw new Error('Booking is not accepting bids');
  }

  // Verify bid amount is within price range
  if (input.amount < booking.priceRange.min || input.amount > booking.priceRange.max) {
    throw new Error(`Bid amount must be between ${booking.priceRange.min} and ${booking.priceRange.max}`);
  }

  // Evaluate ACS rules for bid creation
  const event = {
    type: 'bid.create',
    payload: {
      bookingId: input.bookingId,
      operatorId,
      truckId: input.truckId,
      amount: input.amount,
    },
  };

  const acsContext = {
    userId: operatorId,
    userRole: context.userRole || 'operator',
    userKycStatus: context.kycStatus || 'PENDING',
  };

  try {
    await evaluateAcsRules(event, acsContext);
  } catch (error: any) {
    if (error.message && error.message.includes('rejected')) {
      throw new Error(error.message);
    }
    log.warn({ error }, 'ACS evaluation warning (continuing)');
  }

  // Create bid
  const bid = await bidsRepo.createBid({
    bookingId: input.bookingId,
    operatorId,
    truckId: input.truckId,
    driverId: input.driverId,
    amount: input.amount,
    notes: input.notes,
  });

  log.info({ bidId: bid.id, bookingId: input.bookingId, operatorId }, 'Bid created');

  // Update booking status to NEGOTIATION if first bid
  if (booking.status === 'OPEN') {
    await bookingsRepo.updateBooking(input.bookingId, {
      status: 'NEGOTIATION',
    });
  }

  return bid;
}

/**
 * Auto-finalize the lowest valid bid
 */
export async function autoFinalizeBid(bookingId: string): Promise<{ bid: Bid | null; finalized: boolean }> {
  try {
    const booking = await bookingsRepo.getBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Only auto-finalize if booking is in NEGOTIATION status
    if (booking.status !== 'NEGOTIATION') {
      return { bid: null, finalized: false };
    }

    // Check if auto-finalize time has passed
    if (booking.autoFinalizeAt) {
      const autoFinalizeTime = new Date(booking.autoFinalizeAt);
      if (new Date() < autoFinalizeTime) {
        return { bid: null, finalized: false };
      }
    }

    // Get lowest valid bid
    const lowestBid = await bidsRepo.getLowestValidBid(bookingId);
    if (!lowestBid) {
      // No valid bids, cancel booking
      await bookingsRepo.updateBooking(bookingId, {
        status: 'CANCELLED',
        cancellationReason: 'No bids received before auto-finalize deadline',
      });
      return { bid: null, finalized: false };
    }

    // Finalize the bid
    await bidsRepo.updateBid(lowestBid.id, {
      status: 'ACCEPTED',
    });

    // Reject all other bids
    const validBids = await bidsRepo.getValidBids(bookingId);
    for (const bid of validBids) {
      if (bid.id !== lowestBid.id) {
        await bidsRepo.updateBid(bid.id, {
          status: 'REJECTED',
        });
      }
    }

    // Update booking
    await bookingsRepo.updateBooking(bookingId, {
      status: 'FINALIZED',
      finalizedBidId: lowestBid.id,
    });

    log.info({ bookingId, bidId: lowestBid.id }, 'Bid auto-finalized');

    return { bid: lowestBid, finalized: true };
  } catch (error: any) {
    log.error({ error, bookingId }, 'Failed to auto-finalize bid');
    throw error;
  }
}

/**
 * Manually finalize a bid (admin override)
 */
export async function finalizeBid(bidId: string, adminId: string): Promise<Bid> {
  const bid = await bidsRepo.getBidById(bidId);
  if (!bid) {
    throw new Error('Bid not found');
  }

  if (bid.status !== 'PENDING') {
    throw new Error('Bid is not in pending status');
  }

  const booking = await bookingsRepo.getBookingById(bid.bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  // Update bid status
  await bidsRepo.updateBid(bidId, {
    status: 'ACCEPTED',
  });

  // Reject all other bids
  const validBids = await bidsRepo.getValidBids(bid.bookingId);
  for (const otherBid of validBids) {
    if (otherBid.id !== bidId) {
      await bidsRepo.updateBid(otherBid.id, {
        status: 'REJECTED',
      });
    }
  }

  // Update booking
  await bookingsRepo.updateBooking(bid.bookingId, {
    status: 'FINALIZED',
    finalizedBidId: bidId,
  });

  log.info({ bidId, bookingId: bid.bookingId, adminId }, 'Bid manually finalized by admin');

  return bidsRepo.getBidById(bidId) as Promise<Bid>;
}

/**
 * Get bid by ID
 */
export async function getBidById(bidId: string): Promise<Bid | null> {
  return bidsRepo.getBidById(bidId);
}

/**
 * List bids for a booking
 */
export async function listBidsByBooking(bookingId: string): Promise<Bid[]> {
  return bidsRepo.listBidsByBooking(bookingId);
}

/**
 * Update bid
 */
export async function updateBid(
  bidId: string,
  operatorId: string,
  updates: { amount?: number; notes?: string }
): Promise<Bid> {
  const bid = await getBidById(bidId);
  if (!bid) {
    throw new Error('Bid not found');
  }

  if (bid.operatorId !== operatorId) {
    throw new Error('Unauthorized: Cannot modify another operator\'s bid');
  }

  if (bid.status !== 'PENDING') {
    throw new Error('Cannot modify bid in current status');
  }

  return bidsRepo.updateBid(bidId, updates);
}

