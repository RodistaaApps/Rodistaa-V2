/**
 * Background Location Service - Placeholder for Native Module
 * Pure React Native CLI compatible interface
 */

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  speed?: number;
  heading?: number;
}

export interface LocationServiceConfig {
  distanceInterval?: number; // meters
  timeInterval?: number; // milliseconds
  desiredAccuracy?: 'low' | 'balanced' | 'high' | 'highest';
}

class BackgroundLocationService {
  private isRunning = false;
  private config: LocationServiceConfig = {};

  /**
   * Start background location tracking
   */
  async start(config?: LocationServiceConfig): Promise<void> {
    if (this.isRunning) {
      console.warn('Location service already running');
      return;
    }

    this.config = config || {};
    
    // TODO: Call native module to start background location
    // NativeModules.BackgroundLocation.start(config);
    
    this.isRunning = true;
    console.log('Background location service started', config);
  }

  /**
   * Stop background location tracking
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    // TODO: Call native module to stop background location
    // NativeModules.BackgroundLocation.stop();
    
    this.isRunning = false;
    console.log('Background location service stopped');
  }

  /**
   * Get current status
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Get last known location
   */
  async getLastLocation(): Promise<LocationUpdate | null> {
    // TODO: Get from native module or cache
    // return await NativeModules.BackgroundLocation.getLastLocation();
    return null;
  }

  /**
   * Send manual ping
   */
  async sendPing(metadata?: Record<string, any>): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Location service is not running');
    }

    // TODO: Call native module to send ping
    // await NativeModules.BackgroundLocation.sendPing(metadata);
    console.log('Manual ping sent', metadata);
  }
}

export const backgroundLocationService = new BackgroundLocationService();

