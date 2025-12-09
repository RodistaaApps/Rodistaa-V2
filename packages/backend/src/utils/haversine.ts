/**
 * haversine.ts
 * Small helper to compute great-circle distance between two lat/lon pairs in kilometers.
 */

export function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Compute approximate distance (in km) between two points using the Haversine formula.
 * Suitable for pricing estimate; for route (road) distance replace with routing service.
 *
 * @param lat1 - latitude of point A in degrees
 * @param lon1 - longitude of point A in degrees
 * @param lat2 - latitude of point B in degrees
 * @param lon2 - longitude of point B in degrees
 * @returns distance in kilometers (float)
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}
