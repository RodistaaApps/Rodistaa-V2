/**
 * Mobile App Configuration
 */

export const config = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/v1',
  ENABLE_LOGGING: process.env.EXPO_PUBLIC_ENABLE_LOGGING === 'true',
};

