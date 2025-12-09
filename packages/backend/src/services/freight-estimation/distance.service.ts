/**
 * distance.service.ts
 * Distance calculation service with routing fallback
 */

import { haversineDistanceKm } from '../../utils/haversine';

export async function getDistanceKm(pickup: any, drop: any): Promise<number> {
  // TODO: integrate OSRM or Mapbox routing with timeout
  try {
    // Try routing engine (pseudo)
    // const route = await routingEngine.getRoute(pickup, drop, { timeout: 100 });
    // return route.distance_km;
  } catch (err) {
    // log error and fallback
  }

  const d = haversineDistanceKm(pickup.lat, pickup.lng, drop.lat, drop.lng);
  return d * 1.20; // detour factor
}
