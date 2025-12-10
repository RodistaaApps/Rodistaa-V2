/**
 * GPS Utilities
 * Location permission handling, accuracy checking, and coordinate validation
 */

import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

/**
 * Request location permissions
 * @returns true if granted, false otherwise
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Location permission error:', error);
    return false;
  }
}

/**
 * Check if location permissions are granted
 */
export async function hasLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Location permission check error:', error);
    return false;
  }
}

/**
 * Get current location with accuracy check
 * @param maxAccuracyMeters - Maximum acceptable accuracy in meters (default: 50)
 * @returns Location data or null if accuracy is insufficient
 */
export async function getCurrentLocation(maxAccuracyMeters: number = 50): Promise<LocationData | null> {
  try {
    const hasPermission = await hasLocationPermission();
    if (!hasPermission) {
      const granted = await requestLocationPermission();
      if (!granted) {
        throw new Error('Location permission denied');
      }
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const accuracy = location.coords.accuracy || 0;
    if (accuracy > maxAccuracyMeters) {
      console.warn(`Location accuracy ${accuracy}m exceeds maximum ${maxAccuracyMeters}m`);
      return null;
    }

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || undefined,
      altitude: location.coords.altitude || undefined,
      heading: location.coords.heading || undefined,
      speed: location.coords.speed || undefined,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.error('Get location error:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Validate GPS coordinates
 */
export function isValidCoordinates(latitude: number, longitude: number): boolean {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  );
}

