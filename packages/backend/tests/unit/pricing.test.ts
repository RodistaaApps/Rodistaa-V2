import {
  quoteByParams,
  quoteByCoordinates,
  TONNAGE_RATE,
  DISTANCE_RATE,
  MIN_FEE,
} from '../../src/services/pricing/pricing.service';
import { haversineDistanceKm } from '../../src/utils/haversine';

describe('Pricing engine - quoteByParams', () => {
  test('basic LCV short distance (tonnage 1.5t, 10 km)', () => {
    const q = quoteByParams(1.5, 10);
    // tonnage fee = 1.5 * 3 = 4.5 -> rounded 5
    // distance fee = 10 * 0.3 = 3 -> rounded 3
    // subtotal = 8 -> MIN_FEE (20) applies
    expect(q.tonnage_fee.amount).toBeGreaterThanOrEqual(4); // rounding sanity
    expect(q.distance_fee.amount).toBe(3);
    expect(q.min_fee_applied).toBe(true);
    expect(q.total.amount).toBe(MIN_FEE);
  });

  test('MCV mid distance (tonnage 8t, 150 km)', () => {
    const q = quoteByParams(8, 150);
    // tonnage = 24, distance = 45 => subtotal = 69
    expect(q.tonnage_fee.amount).toBe(24);
    expect(q.distance_fee.amount).toBe(45);
    expect(q.total.amount).toBe(69);
    expect(q.min_fee_applied).toBe(false);
  });

  test('HCV long haul (18t, 400 km)', () => {
    const q = quoteByParams(18, 400);
    // tonnage = 54, distance = 120 => subtotal = 174
    expect(q.tonnage_fee.amount).toBe(54);
    expect(q.distance_fee.amount).toBe(120);
    expect(q.total.amount).toBe(174);
  });

  test('minimum is not applied when applyMinFee=false', () => {
    const q = quoteByParams(0.5, 1, { applyMinFee: false });
    // tonnage = 1.5 => rounded 2, distance = 0.3 => rounded 0 => subtotal 2
    expect(q.min_fee_applied).toBe(false);
    expect(q.total.amount).toBeGreaterThanOrEqual(2);
  });

  test('invalid tonnage throws', () => {
    expect(() => quoteByParams(0, 10)).toThrow();
    expect(() => quoteByParams(-1, 10)).toThrow();
  });

  test('invalid distance throws', () => {
    expect(() => quoteByParams(2, -5)).toThrow();
  });
});

describe('Pricing engine - quoteByCoordinates', () => {
  test('haversine distance sanity check', () => {
    const d = haversineDistanceKm(17.3850, 78.4867, 16.5062, 80.6480); // HYD -> VJA approx
    expect(d).toBeGreaterThan(250);
    expect(d).toBeLessThan(350);
  });

  test('quote by coordinates matches params using haversine', () => {
    const d = haversineDistanceKm(17.3850, 78.4867, 16.5062, 80.6480);
    const q1 = quoteByCoordinates(10, 17.3850, 78.4867, 16.5062, 80.6480);
    const q2 = quoteByParams(10, d);

    expect(q1.total.amount).toBe(q2.total.amount);
  });
});
