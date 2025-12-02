/**
 * @rodistaa/utils - Distance Calculation Service
 * 
 * Calculates road distance between locations:
 * - Pickup to drop distance
 * - Multi-waypoint routes
 * - Road distance (not straight-line)
 * - Used for bidding fee calculation
 * 
 * BUSINESS RULE: Distance needed for bidding fee calculation.
 */

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface DistanceCalculationParams {
  origin: Location;
  destination: Location;
  waypoints?: Location[];
}

export interface DistanceResult {
  distanceKm: number; // Road distance in kilometers
  durationMinutes: number; // Estimated travel time
  route: {
    origin: Location;
    destination: Location;
    waypoints?: Location[];
  };
}

/**
 * Calculate Haversine distance (straight-line)
 * This is a fallback - road distance should use routing API
 */
function calculateHaversineDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // Earth radius in km
  const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
  const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(loc1.latitude * Math.PI / 180) *
            Math.cos(loc2.latitude * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Calculate road distance using routing API
 * 
 * BUSINESS RULE: Use road distance for accurate bidding fee calculation
 */
export async function calculateRoadDistance(
  params: DistanceCalculationParams,
  useRoutingAPI: boolean = false
): Promise<DistanceResult> {
  const { origin, destination, waypoints } = params;

  // TODO: Integrate with routing API (Google Maps, OSRM, etc.)
  // For now, use Haversine as fallback
  // In production, use: Google Maps Distance Matrix API or OSRM
  
  if (useRoutingAPI) {
    // TODO: Implement routing API integration
    // const roadDistance = await callRoutingAPI(origin, destination, waypoints);
    throw new Error('Routing API integration not yet implemented. Use Haversine fallback.');
  }

  // Fallback: Haversine distance with road factor (1.3x for road distance estimate)
  let distanceKm = calculateHaversineDistance(origin, destination);
  
  // Apply road factor (typically 1.2-1.5x straight-line distance)
  distanceKm = distanceKm * 1.3;

  // Estimate duration (assuming average 50 km/h)
  const durationMinutes = (distanceKm / 50) * 60;

  return {
    distanceKm: Math.round(distanceKm * 100) / 100,
    durationMinutes: Math.round(durationMinutes),
    route: {
      origin,
      destination,
      waypoints,
    },
  };
}

/**
 * Calculate distance for booking
 */
export async function calculateBookingDistance(
  pickupLocation: Location,
  dropLocation: Location
): Promise<DistanceResult> {
  return calculateRoadDistance({
    origin: pickupLocation,
    destination: dropLocation,
  });
}

/**
 * Calculate multi-waypoint route distance
 */
export async function calculateMultiWaypointDistance(
  origin: Location,
  destination: Location,
  waypoints: Location[]
): Promise<DistanceResult> {
  if (waypoints.length === 0) {
    return calculateRoadDistance({
      origin,
      destination,
    });
  }

  // Calculate distance: origin -> waypoint1 -> waypoint2 -> ... -> destination
  let totalDistance = 0;
  
  // Origin to first waypoint
  totalDistance += calculateHaversineDistance(origin, waypoints[0]) * 1.3;
  
  // Waypoint to waypoint
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += calculateHaversineDistance(waypoints[i], waypoints[i + 1]) * 1.3;
  }
  
  // Last waypoint to destination
  totalDistance += calculateHaversineDistance(waypoints[waypoints.length - 1], destination) * 1.3;

  const durationMinutes = (totalDistance / 50) * 60;

  return {
    distanceKm: Math.round(totalDistance * 100) / 100,
    durationMinutes: Math.round(durationMinutes),
    route: {
      origin,
      destination,
      waypoints,
    },
  };
}

