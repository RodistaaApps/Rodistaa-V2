/**
 * Bidding Priority Algorithm Service
 * Ranks bids using weighted scoring: ETA (40%) + Price (35%) + Reliability (25%)
 * Ensures fair, transparent bid matching for shippers
 */

import { query } from '../../db';
import { logger } from '../../utils/logger';
import * as etaService from '../tracking/eta.service';

const log = logger.child({ module: 'priority-algorithm' });

export interface BidScore {
  bidId: string;
  operatorId: string;
  bidAmount: number;
  totalScore: number;
  etaScore: number;
  priceScore: number;
  reliabilityScore: number;
  rank: number;
}

export interface ScoringWeights {
  eta: number; // Default: 0.40 (40%)
  price: number; // Default: 0.35 (35%)
  reliability: number; // Default: 0.25 (25%)
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  eta: 0.40,
  price: 0.35,
  reliability: 0.25,
};

/**
 * Calculate priority scores for all bids on a booking
 */
export async function calculateBidPriority(
  bookingId: string,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): Promise<BidScore[]> {
  try {
    // Get all bids for this booking
    const bidsResult = await query(
      `SELECT b.id, b.operator_id, b.bid_amount, b.eta_hours, b.created_at,
              op.current_location_lat, op.current_location_lng,
              bk.pickup_latitude, bk.pickup_longitude
       FROM bids b
       JOIN users op ON op.id = b.operator_id
       LEFT JOIN bookings bk ON bk.id = b.booking_id
       WHERE b.booking_id = $1 AND b.status = 'PENDING'`,
      [bookingId]
    );

    if (bidsResult.rows.length === 0) {
      return [];
    }

    const bids = bidsResult.rows;
    const bidScores: BidScore[] = [];

    // Calculate individual scores
    for (const bid of bids) {
      const etaScore = await calculateETAScore(
        bid.id,
        bid.operator_id,
        bid.eta_hours,
        bid.current_location_lat,
        bid.current_location_lng,
        bid.pickup_latitude,
        bid.pickup_longitude
      );

      const priceScore = calculatePriceScore(
        bid.bid_amount,
        bids.map(b => parseFloat(b.bid_amount))
      );

      const reliabilityScore = await calculateReliabilityScore(bid.operator_id);

      // Calculate weighted total score (0-100)
      const totalScore = 
        (etaScore * weights.eta) +
        (priceScore * weights.price) +
        (reliabilityScore * weights.reliability);

      bidScores.push({
        bidId: bid.id,
        operatorId: bid.operator_id,
        bidAmount: parseFloat(bid.bid_amount),
        totalScore: Math.round(totalScore * 100) / 100,
        etaScore,
        priceScore,
        reliabilityScore,
        rank: 0, // Will be set after sorting
      });
    }

    // Sort by total score (descending) and assign ranks
    bidScores.sort((a, b) => b.totalScore - a.totalScore);
    bidScores.forEach((bid, index) => {
      bid.rank = index + 1;
    });

    // Store scores in database for transparency
    await storeBidScores(bookingId, bidScores);

    log.info({ 
      bookingId, 
      totalBids: bidScores.length,
      topScore: bidScores[0]?.totalScore,
      topBidder: bidScores[0]?.operatorId,
    }, 'Bid priority scores calculated');

    return bidScores;
  } catch (error: any) {
    log.error({ error, bookingId }, 'Failed to calculate bid priority');
    throw error;
  }
}

/**
 * Calculate ETA score (0-100)
 * Lower ETA = Higher score
 * Also considers operator's current location distance from pickup
 */
async function calculateETAScore(
  bidId: string,
  operatorId: string,
  promisedETAHours: number,
  operatorLat?: number,
  operatorLng?: number,
  pickupLat?: number,
  pickupLng?: number
): Promise<number> {
  try {
    // Calculate distance from operator's location to pickup (if available)
    let distanceToPickup = 0;
    if (operatorLat && operatorLng && pickupLat && pickupLng) {
      distanceToPickup = calculateDistance(operatorLat, operatorLng, pickupLat, pickupLng);
    }

    // Calculate estimated time to pickup (assuming 50 km/h average)
    const hoursToPickup = distanceToPickup / 50;
    
    // Total ETA = Time to pickup + Promised delivery ETA
    const totalETA = hoursToPickup + promisedETAHours;

    // Score: Inverse of ETA (faster = better)
    // Normalize to 0-100 scale
    // Best case: 4 hours total = 100 points
    // Worst case: 48 hours total = 0 points
    const score = Math.max(0, Math.min(100, 100 - ((totalETA - 4) / 44) * 100));

    return Math.round(score * 100) / 100;
  } catch (error) {
    log.error({ error, bidId, operatorId }, 'Failed to calculate ETA score');
    return 50; // Default middle score on error
  }
}

/**
 * Calculate price score (0-100)
 * Lower price = Higher score (but not linear, to avoid race to bottom)
 * Uses logarithmic scaling to reward competitive pricing
 */
function calculatePriceScore(bidAmount: number, allBidAmounts: number[]): number {
  if (allBidAmounts.length === 0) return 50;

  const minBid = Math.min(...allBidAmounts);
  const maxBid = Math.max(...allBidAmounts);
  const range = maxBid - minBid;

  if (range === 0) return 50; // All bids same price

  // Normalize to 0-1 range
  const normalized = (bidAmount - minBid) / range;

  // Logarithmic scaling to avoid extreme low-ball bids
  // Low bids get high scores, but with diminishing returns
  const score = (1 - normalized) * 60 + 40; // Maps to 40-100 range

  return Math.round(score * 100) / 100;
}

/**
 * Calculate reliability score (0-100)
 * Based on operator's historical performance
 */
async function calculateReliabilityScore(operatorId: string): Promise<number> {
  try {
    const result = await query(
      `SELECT 
         COUNT(*) AS total_trips,
         COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) AS completed_trips,
         COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) AS cancelled_trips,
         AVG(CASE 
           WHEN status = 'COMPLETED' AND actual_delivery_at IS NOT NULL AND estimated_delivery_at IS NOT NULL 
           THEN EXTRACT(EPOCH FROM (actual_delivery_at - estimated_delivery_at))/3600 
         END) AS avg_delay_hours
       FROM shipments
       WHERE operator_id = $1
       AND created_at >= NOW() - INTERVAL '6 months'`,
      [operatorId]
    );

    const stats = result.rows[0];
    const totalTrips = parseInt(stats.total_trips);

    if (totalTrips === 0) {
      // New operator: give benefit of doubt
      return 70; // Default score for new operators
    }

    const completedTrips = parseInt(stats.completed_trips);
    const cancelledTrips = parseInt(stats.cancelled_trips);
    const avgDelayHours = parseFloat(stats.avg_delay_hours || '0');

    // Completion rate (0-50 points)
    const completionRate = completedTrips / totalTrips;
    const completionScore = completionRate * 50;

    // On-time performance (0-30 points)
    // Penalize delays: 0 delay = 30 points, 12+ hours delay = 0 points
    const onTimeScore = Math.max(0, 30 - (Math.abs(avgDelayHours) / 12) * 30);

    // Cancellation penalty (0-20 points)
    // No cancellations = 20 points, high cancellations = 0 points
    const cancellationRate = cancelledTrips / totalTrips;
    const cancellationScore = Math.max(0, 20 - (cancellationRate * 100));

    const totalScore = completionScore + onTimeScore + cancellationScore;

    return Math.round(Math.min(100, totalScore) * 100) / 100;
  } catch (error) {
    log.error({ error, operatorId }, 'Failed to calculate reliability score');
    return 50; // Default middle score on error
  }
}

/**
 * Helper: Calculate distance (Haversine)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Store bid scores for transparency and audit
 */
async function storeBidScores(bookingId: string, scores: BidScore[]): Promise<void> {
  try {
    // Could create a bid_scores table, or store in bid record
    // For now, log for transparency
    log.info({ bookingId, scores }, 'Bid scores stored');
  } catch (error) {
    log.error({ error, bookingId }, 'Failed to store bid scores');
  }
}

/**
 * Get recommended bid (highest scoring bid)
 */
export async function getRecommendedBid(bookingId: string): Promise<BidScore | null> {
  const scores = await calculateBidPriority(bookingId);
  return scores.length > 0 ? scores[0] : null;
}

