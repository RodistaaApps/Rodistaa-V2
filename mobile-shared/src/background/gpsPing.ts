/**
 * Background GPS Ping Service
 * Sends GPS location updates every 60 seconds during active shipments
 */

import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as BackgroundFetch from 'expo-background-fetch';
import { getCurrentLocation } from '../utils/gpsUtils';
import { apiClient } from '../api/client';

const GPS_TASK_NAME = 'gps-ping-task';
const PING_INTERVAL_MS = 60000; // 60 seconds

interface GPSPingContext {
  shipmentId: string;
  userId: string;
  deviceId: string;
}

let pingContext: GPSPingContext | null = null;

/**
 * Register GPS ping task
 */
export async function registerGpsPingTask(): Promise<void> {
  try {
    TaskManager.defineTask(GPS_TASK_NAME, async ({ data, error }) => {
      if (error) {
        console.error('GPS ping task error:', error);
        return;
      }

      if (!pingContext) {
        return;
      }

      try {
        const location = await getCurrentLocation(50);
        if (!location) {
          console.warn('GPS location not available or accuracy insufficient');
          return;
        }

        // Send GPS ping to backend
        await apiClient.post(`/shipments/${pingContext.shipmentId}/ping`, {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          altitude: location.altitude,
          heading: location.heading,
          speed: location.speed,
          timestamp: new Date(location.timestamp).toISOString(),
        });
      } catch (error) {
        console.error('GPS ping failed:', error);
        // Queue for retry via offline queue
      }
    });

    await BackgroundFetch.registerTaskAsync(GPS_TASK_NAME, {
      minimumInterval: PING_INTERVAL_MS / 1000, // Convert to seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (error) {
    console.error('Failed to register GPS ping task:', error);
  }
}

/**
 * Start GPS pinging for a shipment
 */
export async function startGpsPing(context: GPSPingContext): Promise<void> {
  pingContext = context;
  await registerGpsPingTask();
}

/**
 * Stop GPS pinging
 */
export async function stopGpsPing(): Promise<void> {
  pingContext = null;
  try {
    await BackgroundFetch.unregisterTaskAsync(GPS_TASK_NAME);
  } catch (error) {
    console.error('Failed to stop GPS ping:', error);
  }
}

/**
 * Check if GPS ping is active
 */
export function isGpsPingActive(): boolean {
  return pingContext !== null;
}

