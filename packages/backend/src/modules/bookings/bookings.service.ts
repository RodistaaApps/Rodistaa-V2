/**
 * Bookings Service
 * Business logic for bookings with ACS integration
 */

import * as bookingsRepo from './bookings.repository';
import { evaluateAcsRules } from '../acs-adapter';
import logger from 'pino';
import { generateBookingId, Booking } from '@rodistaa/app-shared';

const log = logger({ name: 'bookings-service' });

export interface CreateBookingInput {
  pickup: any;
  drop: any;
  goods: any;
  tonnage: number;
  priceRangeMin: number;
  priceRangeMax: number;
}

/**
 * Mock price estimation (would call ChatGPT/AI service in production)
 */
async function estimateBookingPrice(input: CreateBookingInput): Promise<number> {
  // Mock implementation: simple calculation based on distance and tonnage
  // In production, this would call an AI service with route analysis
  
  const basePricePerTonneKm = 12; // Rs per tonne-km
  const estimatedDistance = 500; // Mock distance in km (would calculate from coordinates)
  const estimatedPrice = input.tonnage * estimatedDistance * basePricePerTonneKm;
  
  // Add some variance
  const variance = estimatedPrice * 0.15; // ±15%
  const finalPrice = estimatedPrice + (Math.random() * variance * 2 - variance);
  
  log.debug({ 
    tonnage: input.tonnage, 
    estimatedDistance, 
    estimatedPrice: finalPrice 
  }, 'Price estimated (mock)');
  
  return Math.round(finalPrice);
}

/**
 * Create a new booking with ACS evaluation
 */
export async function createBooking(
  shipperId: string,
  input: CreateBookingInput,
  context: any
): Promise<Booking> {
  // Evaluate ACS rules for booking creation
  const event = {
    type: 'booking.create',
    payload: {
      shipperId,
      tonnage: input.tonnage,
      pickupCity: input.pickup?.city,
      dropCity: input.drop?.city,
    },
  };

  const acsContext = {
    userId: shipperId,
    userRole: context.userRole || 'shipper',
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

  // Estimate price if not provided
  let expectedPrice = input.priceRangeMin + (input.priceRangeMax - input.priceRangeMin) / 2;
  try {
    expectedPrice = await estimateBookingPrice(input);
  } catch (error: any) {
    log.warn({ error }, 'Price estimation failed, using midpoint');
  }

  // Calculate auto-finalize time (24 hours from now)
  const autoFinalizeAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Create booking
  const booking = await bookingsRepo.createBooking({
    shipperId,
    pickup: input.pickup,
    drop: input.drop,
    goods: input.goods,
    tonnage: input.tonnage,
    expectedPrice,
    priceRangeMin: input.priceRangeMin,
    priceRangeMax: input.priceRangeMax,
    autoFinalizeAt,
  });

  log.info({ bookingId: booking.id, shipperId }, 'Booking created');

  return booking;
}

/**
 * Get booking by ID
 */
export async function getBookingById(bookingId: string): Promise<Booking | null> {
  return bookingsRepo.getBookingById(bookingId);
}

/**
 * List bookings with filters
 */
export async function listBookings(filters: {
  shipperId?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: Booking[]; total: number; page: number; limit: number; totalPages: number }> {
  const result = await bookingsRepo.listBookings(filters);
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const totalPages = Math.ceil(result.total / limit);

  return {
    ...result,
    page,
    limit,
    totalPages,
  };
}

/**
 * Update booking status
 */
export async function updateBooking(
  bookingId: string,
  updates: bookingsRepo.BookingUpdateInput
): Promise<Booking> {
  return bookingsRepo.updateBooking(bookingId, updates);
}

/**
 * Cancel booking
 */
export async function cancelBooking(
  bookingId: string,
  reason: string,
  userId: string
): Promise<Booking> {
  // Verify ownership
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.shipperId !== userId) {
    throw new Error('Unauthorized: Cannot cancel another user\'s booking');
  }

  if (booking.status !== 'OPEN' && booking.status !== 'NEGOTIATION') {
    throw new Error('Cannot cancel booking in current status');
  }

  return updateBooking(bookingId, {
    status: 'CANCELLED',
    cancellationReason: reason,
  });
}

