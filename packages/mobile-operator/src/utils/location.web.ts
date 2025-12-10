/**
 * Location utility - Web implementation
 * Replaces expo-location for web platform
 */

export interface LocationObject {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

export const Location = {
  async requestForegroundPermissionsAsync(): Promise<{ status: string }> {
    return { status: 'granted' }; // Browser will prompt automatically
  },

  async getCurrentPositionAsync(): Promise<LocationObject> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed,
            },
            timestamp: position.timestamp,
          });
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 1000,
        }
      );
    });
  },

  async watchPositionAsync(
    options: any,
    callback: (location: LocationObject) => void
  ): Promise<{ remove: () => void }> {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude,
            accuracy: position.coords.accuracy,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
          },
          timestamp: position.timestamp,
        });
      },
      (error) => console.error('Location watch error:', error),
      {
        enableHighAccuracy: options.accuracy === 6,
        timeout: 20000,
        maximumAge: options.timeInterval || 1000,
      }
    );

    return {
      remove: () => navigator.geolocation.clearWatch(watchId),
    };
  },
};

