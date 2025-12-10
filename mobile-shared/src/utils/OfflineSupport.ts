/**
 * Offline Support Utilities
 * Provides hooks and utilities for offline-first functionality
 */

import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { processUploadQueue } from '../offline/uploadQueue';

/**
 * Hook to detect online/offline status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [networkType, setNetworkType] = useState<string>('unknown');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
      setNetworkType(state.type);
    });

    // Initial check
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? false);
      setNetworkType(state.type);
    });

    return () => unsubscribe();
  }, []);

  return { isOnline, networkType };
}

/**
 * Hook to process upload queue when online
 */
export function useOfflineQueue() {
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    if (isOnline) {
      // Process queue when coming back online
      processUploadQueue().then((result) => {
        if (result.success > 0 || result.failed > 0) {
          console.log(`Processed upload queue: ${result.success} success, ${result.failed} failed`);
        }
      });
    }
  }, [isOnline]);

  return { isOnline };
}

/**
 * Higher-order component to provide offline data fallback
 */
export function withOfflineFallback<T>(
  Component: React.ComponentType<T>,
  getCachedData: () => Promise<any>
) {
  return (props: T) => {
    const { isOnline } = useNetworkStatus();
    const [cachedData, setCachedData] = useState<any>(null);

    useEffect(() => {
      if (!isOnline) {
        getCachedData().then(setCachedData);
      }
    }, [isOnline]);

    return <Component {...props} offlineData={!isOnline ? cachedData : undefined} />;
  };
}

