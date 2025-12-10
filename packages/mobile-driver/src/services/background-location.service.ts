/**
 * Background Location Service - Driver App
 * Sends GPS updates every 60 seconds during active shipments
 * Privacy-first: Only tracks during active trips
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const LOCATION_TASK_NAME = 'RODISTAA_BACKGROUND_LOCATION';
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000/v1' : 'http://localhost:4000/v1';

let sequenceNumber = 0;
let activeShipmentId: string | null = null;
let lastSentTime = 0;

/**
 * Define background task for location updates
 */
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error('[Background Location] Task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    
    if (locations && locations.length > 0) {
      const location = locations[0];
      
      // Only send if we have an active shipment
      if (!activeShipmentId) {
        console.log('[Background Location] No active shipment, skipping');
        return;
      }

      // Enforce 60-second minimum interval
      const now = Date.now();
      if (now - lastSentTime < 60000) {
        console.log('[Background Location] Too soon, skipping');
        return;
      }

      try {
        await sendLocationToServer(location);
        lastSentTime = now;
        console.log('[Background Location] Location sent:', {
          lat: location.coords.latitude.toFixed(6),
          lng: location.coords.longitude.toFixed(6),
          sequence: sequenceNumber,
        });
      } catch (error) {
        console.error('[Background Location] Failed to send:', error);
        // Store for retry when network returns
        await storeLocationForRetry(location);
      }
    }
  }
});

/**
 * Send location to backend API
 */
async function sendLocationToServer(location: Location.LocationObject): Promise<void> {
  try {
    const token = await SecureStore.getItemAsync('authToken');
    if (!token) {
      throw new Error('No auth token');
    }

    const payload = {
      shipmentId: activeShipmentId,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || undefined,
      altitude: location.coords.altitude || undefined,
      speed: location.coords.speed ? location.coords.speed * 3.6 : undefined, // m/s to km/h
      bearing: location.coords.heading || undefined,
      recordedAt: new Date(location.timestamp).toISOString(),
      metadata: {
        sequenceNumber: ++sequenceNumber,
        networkType: 'UNKNOWN', // Would detect actual network type
        batteryLevel: 100, // Would get actual battery level
      },
    };

    const response = await fetch(`${API_URL}/tracking/location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    
    // Handle geofence events if any
    if (result.data?.geofenceEvents && result.data.geofenceEvents.length > 0) {
      console.log('[Background Location] Geofence events:', result.data.geofenceEvents);
      // TODO: Show notification for geofence entry/exit
    }
  } catch (error) {
    console.error('[Background Location] Send failed:', error);
    throw error;
  }
}

/**
 * Store location for retry when offline
 */
async function storeLocationForRetry(location: Location.LocationObject): Promise<void> {
  try {
    // Get existing queue
    const queueJson = await SecureStore.getItemAsync('location_retry_queue');
    const queue = queueJson ? JSON.parse(queueJson) : [];
    
    // Add new location
    queue.push({
      shipmentId: activeShipmentId,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      speed: location.coords.speed ? location.coords.speed * 3.6 : undefined,
      recordedAt: new Date(location.timestamp).toISOString(),
      sequenceNumber: sequenceNumber,
    });

    // Keep only last 100 locations
    const trimmedQueue = queue.slice(-100);
    
    await SecureStore.setItemAsync('location_retry_queue', JSON.stringify(trimmedQueue));
    console.log('[Background Location] Stored for retry, queue size:', trimmedQueue.length);
  } catch (error) {
    console.error('[Background Location] Failed to store for retry:', error);
  }
}

/**
 * Start background location tracking
 */
export async function startBackgroundLocation(shipmentId: string): Promise<void> {
  try {
    // Request permissions
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      throw new Error('Foreground location permission not granted');
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      throw new Error('Background location permission not granted');
    }

    // Set active shipment
    activeShipmentId = shipmentId;
    sequenceNumber = 0;
    lastSentTime = 0;

    // Check if already running
    const isTaskDefined = await TaskManager.isTaskDefinedAsync(LOCATION_TASK_NAME);
    if (!isTaskDefined) {
      throw new Error('Location task not defined');
    }

    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isTaskRegistered) {
      console.log('[Background Location] Already running, updating shipment ID');
      return;
    }

    // Start background location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 60000, // 60 seconds
      distanceInterval: 0, // Send even if not moved (stationary updates)
      deferredUpdatesInterval: 60000,
      foregroundService: {
        notificationTitle: 'Rodistaa Driver',
        notificationBody: 'Tracking your trip for safety and transparency',
        notificationColor: '#C90D0D',
      },
      pausesUpdatesAutomatically: false,
      activityType: Location.ActivityType.AutomotiveNavigation,
      showsBackgroundLocationIndicator: true,
    });

    console.log('[Background Location] Started for shipment:', shipmentId);
  } catch (error) {
    console.error('[Background Location] Failed to start:', error);
    throw error;
  }
}

/**
 * Stop background location tracking
 */
export async function stopBackgroundLocation(): Promise<void> {
  try {
    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    
    if (isTaskRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('[Background Location] Stopped');
    }

    activeShipmentId = null;
    sequenceNumber = 0;

    // Retry any queued locations
    await retryQueuedLocations();
  } catch (error) {
    console.error('[Background Location] Failed to stop:', error);
    throw error;
  }
}

/**
 * Retry sending queued locations
 */
async function retryQueuedLocations(): Promise<void> {
  try {
    const queueJson = await SecureStore.getItemAsync('location_retry_queue');
    if (!queueJson) return;

    const queue = JSON.parse(queueJson);
    if (queue.length === 0) return;

    console.log('[Background Location] Retrying queued locations:', queue.length);

    const token = await SecureStore.getItemAsync('authToken');
    if (!token) return;

    // Send all queued locations
    for (const location of queue) {
      try {
        await fetch(`${API_URL}/tracking/location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(location),
        });
      } catch (error) {
        console.error('[Background Location] Retry failed for location:', error);
      }
    }

    // Clear queue after successful retry
    await SecureStore.deleteItemAsync('location_retry_queue');
    console.log('[Background Location] Queue cleared');
  } catch (error) {
    console.error('[Background Location] Retry queue processing failed:', error);
  }
}

/**
 * Check if background location is running
 */
export async function isBackgroundLocationActive(): Promise<boolean> {
  try {
    return await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  } catch (error) {
    console.error('[Background Location] Failed to check status:', error);
    return false;
  }
}

/**
 * Get current tracking status
 */
export async function getTrackingStatus(): Promise<{
  isTracking: boolean;
  shipmentId: string | null;
  sequenceNumber: number;
  lastSentTime: number;
}> {
  const isTracking = await isBackgroundLocationActive();
  
  return {
    isTracking,
    shipmentId: activeShipmentId,
    sequenceNumber,
    lastSentTime,
  };
}

