/**
 * useTruckMaster Hook
 * Hook for fetching truck master details with caching TTL logic
 */

import { useState, useEffect, useCallback } from 'react';

interface TruckMasterDetail {
  truck: any;
  latest_snapshot?: any;
  inference?: any;
  compliance?: any;
  linked_tractor?: any;
  linked_trailer?: any;
  tickets?: any[];
}

interface UseTruckMasterOptions {
  rcNumber: string;
  operatorId?: string;
  refreshInterval?: number; // milliseconds
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes client cache
const cache = new Map<string, { data: TruckMasterDetail; timestamp: number }>();

export function useTruckMaster({ rcNumber, operatorId, refreshInterval }: UseTruckMasterOptions) {
  const [data, setData] = useState<TruckMasterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTruckMaster = useCallback(async () => {
    // Check cache
    const cacheKey = `${rcNumber}_${operatorId || ''}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/trucks/${rcNumber}`);
      if (!response.ok) {
        throw new Error('Failed to fetch truck master');
      }
      
      const result = await response.json();
      const truckData = result.truck;
      
      // Update cache
      cache.set(cacheKey, { data: truckData, timestamp: Date.now() });
      
      setData(truckData);
      setError(null);
    } catch (err: any) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [rcNumber, operatorId]);

  useEffect(() => {
    fetchTruckMaster();

    if (refreshInterval) {
      const interval = setInterval(fetchTruckMaster, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchTruckMaster, refreshInterval]);

  const refresh = useCallback(() => {
    const cacheKey = `${rcNumber}_${operatorId || ''}`;
    cache.delete(cacheKey);
    fetchTruckMaster();
  }, [fetchTruckMaster, rcNumber, operatorId]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}

