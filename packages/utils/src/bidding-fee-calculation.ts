/**
 * @rodistaa/utils - Bidding Fee Calculation Service
 * 
 * Calculates bidding fee using domain formula:
 * Bidding fee = (₹5 × tonnage) + (₹0.25 × distance_km)
 * 
 * BUSINESS RULE: Bidding fee must be deducted from operator ledger immediately.
 * Ledger cannot go negative.
 */

import { PrismaClient } from '@prisma/client';

export interface CalculateBiddingFeeParams {
  tonnage: number; // Weight in tons
  distanceKm: number; // Distance in kilometers
}

export interface BiddingFeeResult {
  biddingFee: number; // Total bidding fee in ₹
  breakdown: {
    tonnageComponent: number; // ₹5 × tonnage
    distanceComponent: number; // ₹0.25 × distance_km
  };
  formula: string; // Formula description
}

/**
 * Calculate bidding fee using domain formula
 * 
 * BUSINESS RULE:
 * Bidding fee = (₹5 × tonnage) + (₹0.25 × distance_km)
 */
export function calculateBiddingFee(params: CalculateBiddingFeeParams): BiddingFeeResult {
  const { tonnage, distanceKm } = params;

  if (tonnage <= 0) {
    throw new Error('Tonnage must be greater than 0');
  }

  if (distanceKm <= 0) {
    throw new Error('Distance must be greater than 0');
  }

  // BUSINESS RULE: Formula = (₹5 × tonnage) + (₹0.25 × distance_km)
  const tonnageComponent = 5 * tonnage; // ₹5 per ton
  const distanceComponent = 0.25 * distanceKm; // ₹0.25 per km

  const biddingFee = tonnageComponent + distanceComponent;

  return {
    biddingFee: Math.round(biddingFee * 100) / 100, // Round to 2 decimal places
    breakdown: {
      tonnageComponent: Math.round(tonnageComponent * 100) / 100,
      distanceComponent: Math.round(distanceComponent * 100) / 100,
    },
    formula: `(₹5 × ${tonnage} tons) + (₹0.25 × ${distanceKm} km) = ₹${biddingFee.toFixed(2)}`,
  };
}

/**
 * Bidding Fee Distribution Service
 * 
 * BUSINESS RULE:
 * - 25% to operator (operator commission)
 * - 5% to district franchise
 * - 70% to HQ
 */
export interface BiddingFeeDistribution {
  operatorShare: number; // 25%
  districtShare: number; // 5%
  hqShare: number; // 70%
  total: number;
}

export function distributeBiddingFee(totalFee: number): BiddingFeeDistribution {
  if (totalFee <= 0) {
    throw new Error('Bidding fee must be greater than 0');
  }

  const operatorShare = totalFee * 0.25; // 25%
  const districtShare = totalFee * 0.05; // 5%
  const hqShare = totalFee * 0.70; // 70%

  // Verify distribution adds up to 100%
  const total = operatorShare + districtShare + hqShare;

  return {
    operatorShare: Math.round(operatorShare * 100) / 100,
    districtShare: Math.round(districtShare * 100) / 100,
    hqShare: Math.round(hqShare * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export class BiddingFeeCalculationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Calculate and validate bidding fee
   * 
   * BUSINESS RULE:
   * - Formula: (₹5 × tonnage) + (₹0.25 × distance_km)
   * - Must validate before deducting from ledger
   */
  async calculateBiddingFee(params: CalculateBiddingFeeParams): Promise<BiddingFeeResult> {
    return calculateBiddingFee(params);
  }

  /**
   * Calculate bidding fee for a booking
   */
  async calculateBiddingFeeForBooking(bookingId: string): Promise<BiddingFeeResult> {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingId },
    });

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    // Get distance from booking (should be calculated when booking is created)
    const distanceKm = booking.distanceKm || 0;

    if (distanceKm <= 0) {
      throw new Error(`Booking ${bookingId} has invalid distance. Distance must be calculated first.`);
    }

    return this.calculateBiddingFee({
      tonnage: booking.weightTons,
      distanceKm: distanceKm,
    });
  }
}

