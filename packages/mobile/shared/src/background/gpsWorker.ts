/**
 * GPS Background Worker
 * Handles GPS pings independently of navigation
 */

import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { apiClient } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GPS_TASK_NAME = 'background-gps-tracking';
const GPS_PING_INTERVAL = 60000; // 60 seconds
const GPS_CACHE_KEY = '@rodistaa/gps_ping_cache';

interface GPSPing {
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

interface CachedPing extends GPSPing {
  shipmentId: string;
  attemptCount: number;
}

/**
 * Initialize GPS worker
 */
export async function initializeGPSWorker(shipmentId: string): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission not granted');
      return false;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      console.warn('Background location permission not granted');
      return false;
    }

    await Location.startLocationUpdatesAsync(GPS_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: GPS_PING_INTERVAL,
      distanceInterval: 100, // meters
      foregroundService: {
        notificationTitle: 'Rodistaa GPS Tracking',
        notificationBody: 'Tracking your shipment location',
      },
    });

    // Store active shipment ID
    await AsyncStorage.setItem('@rodistaa/active_shipment', shipmentId);

    return true;
  } catch (error) {
    console.error('Failed to initialize GPS worker:', error);
    return false;
  }
}

/**
 * Stop GPS worker
 */
export async function stopGPSWorker(): Promise<void> {
  try {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(GPS_TASK_NAME);
    if (isRunning) {
      await Location.stopLocationUpdatesAsync(GPS_TASK_NAME);
      await AsyncStorage.removeItem('@rodistaa/active_shipment');
    }
  } catch (error) {
    console.error('Failed to stop GPS worker:', error);
  }
}

/**
 * Check if GPS worker is running
 */
export async function isGPSWorkerRunning(): Promise<boolean> {
  try {
    return await Location.hasStartedLocationUpdatesAsync(GPS_TASK_NAME);
  } catch (error) {
    return false;
  }
}

/**
 * Cache GPS ping for offline retry
 */
async function cacheGPSPing(ping: CachedPing): Promise<void> {
  try {
    const cached = await AsyncStorage.getItem(GPS_CACHE_KEY);
    const pings: CachedPing[] = cached ? JSON.parse(cached) : [];
    pings.push(ping);
    await AsyncStorage.setItem(GPS_CACHE_KEY, JSON.stringify(pings));
  } catch (error) {
    console.error('Failed to cache GPS ping:', error);
  }
}

/**
 * Flush cached GPS pings
 */
export async function flushCachedGPSPings(): Promise<number> {
  try {
    const cached = await AsyncStorage.getItem(GPS_CACHE_KEY);
    if (!cached) return 0;

    const pings: CachedPing[] = JSON.parse(cached);
    let successCount = 0;
    const failedPings: CachedPing[] = [];

    for (const ping of pings) {
      try {
        await apiClient.postGPSPing(ping.shipmentId, {
          latitude: ping.latitude,
          longitude: ping.longitude,
          timestamp: ping.timestamp,
          accuracy: ping.accuracy,
          speed: ping.speed,
          heading: ping.heading,
        });
        successCount++;
      } catch (error) {
        ping.attemptCount++;
        if (ping.attemptCount < 5) {
          failedPings.push(ping);
        }
      }
    }

    // Save failed pings back (with retry limit)
    await AsyncStorage.setItem(GPS_CACHE_KEY, JSON.stringify(failedPings));

    return successCount;
  } catch (error) {
    console.error('Failed to flush cached GPS pings:', error);
    return 0;
  }
}

/**
 * Define background task
 */
TaskManager.defineTask(GPS_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('GPS task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];

    if (location) {
      const shipmentId = await AsyncStorage.getItem('@rodistaa/active_shipment');
      if (!shipmentId) return;

      const ping: GPSPing = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
        accuracy: location.coords.accuracy || undefined,
        speed: location.coords.speed || undefined,
        heading: location.coords.heading || undefined,
      };

      try {
        await apiClient.post(`/shipments/${shipmentId}/ping`, ping);
      } catch (error) {
        // Cache for offline retry
        await cacheGPSPing({
          ...ping,
          shipmentId,
          attemptCount: 0,
        });
      }
    }
  }
});

