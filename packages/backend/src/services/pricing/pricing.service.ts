/**
 * pricing.service.ts
 *
 * Rodistaa pricing engine (server-side).
 *
 * Pricing rule:
 *   fee = (tonnage_in_tonnes * TONNAGE_RATE) + (distance_km * DISTANCE_RATE)
 *   final_fee = max(MIN_FEE, fee)
 *
 * Constants are exported for easy tuning.
 */

import { haversineDistanceKm } from '../../utils/haversine';

/** Pricing constants (single source of truth) */
export const TONNAGE_RATE = 3.0; // ₹ per tonne
export const DISTANCE_RATE = 0.30; // ₹ per km
export const MIN_FEE = 20; // ₹ minimum charge
export const ROUND_TO = 1; // round to nearest rupee

export type Money = {
  amount: number;
  currency: 'INR';
};

export type QuoteBreakdown = {
  tonnage_fee: Money;
  distance_fee: Money;
  min_fee_applied: boolean;
  taxes?: Money | null; // placeholder for future
  insurance_fee?: Money | null;
  total: Money;
};

/**
 * Round number to nearest rupee (or nearest unit)
 */
function roundToNearest(value: number, unit = ROUND_TO): number {
  return Math.round(value / unit) * unit;
}

/**
 * Quote parameters by explicit values
 *
 * @param tonnageTon - weight in tonnes (positive number)
 * @param distanceKm - distance in kilometers (positive number)
 * @param options - optional object: { applyMinFee?: boolean } (default true)
 * @returns QuoteBreakdown
 */
export function quoteByParams(
  tonnageTon: number,
  distanceKm: number,
  options?: { applyMinFee?: boolean }
): QuoteBreakdown {
  if (!isFinite(tonnageTon) || tonnageTon <= 0) {
    throw new Error('Invalid tonnageTon. Must be > 0.');
  }
  if (!isFinite(distanceKm) || distanceKm < 0) {
    throw new Error('Invalid distanceKm. Must be >= 0.');
  }

  const applyMin = options?.applyMinFee ?? true;

  const tonnageFeeRaw = tonnageTon * TONNAGE_RATE;
  const distanceFeeRaw = distanceKm * DISTANCE_RATE;

  const tonnageFee = roundToNearest(tonnageFeeRaw);
  const distanceFee = roundToNearest(distanceFeeRaw);

  let subtotal = tonnageFee + distanceFee;
  let minFeeApplied = false;

  if (applyMin && subtotal < MIN_FEE) {
    subtotal = MIN_FEE;
    minFeeApplied = true;
  }

  // taxes and insurance are placeholders (0 for now)
  const taxes = { amount: 0, currency: 'INR' as const };
  const insuranceFee = { amount: 0, currency: 'INR' as const };

  const total = roundToNearest(
    subtotal + (taxes.amount || 0) + (insuranceFee.amount || 0)
  );

  return {
    tonnage_fee: { amount: tonnageFee, currency: 'INR' },
    distance_fee: { amount: distanceFee, currency: 'INR' },
    min_fee_applied: minFeeApplied,
    taxes,
    insurance_fee: insuranceFee,
    total: { amount: total, currency: 'INR' },
  };
}

/**
 * Quote using coordinates (lat/lng) — computes Haversine distance for estimate
 *
 * @param tonnageTon - weight in tonnes
 * @param pickupLat - pickup latitude
 * @param pickupLng - pickup longitude
 * @param dropLat - drop latitude
 * @param dropLng - drop longitude
 * @param options - applyMinFee default true
 * @returns QuoteBreakdown
 */
export function quoteByCoordinates(
  tonnageTon: number,
  pickupLat: number,
  pickupLng: number,
  dropLat: number,
  dropLng: number,
  options?: { applyMinFee?: boolean }
): QuoteBreakdown {
  const distanceKm = haversineDistanceKm(pickupLat, pickupLng, dropLat, dropLng);
  return quoteByParams(tonnageTon, distanceKm, options);
}

/** Export default for convenience */
export default {
  quoteByParams,
  quoteByCoordinates,
  TONNAGE_RATE,
  DISTANCE_RATE,
  MIN_FEE,
};
