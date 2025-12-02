/**
 * Offline Queue
 * Manages failed requests and retries when online
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
// Note: NetInfo import will be handled at runtime to avoid build issues

const QUEUE_KEY = 'offline_request_queue';
const MAX_QUEUE_SIZE = 100;

export interface QueuedRequest {
  id: string;
  endpoint: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
}

class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private maxRetries = 3;

  /**
   * Initialize queue from storage
   */
  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  /**
   * Add request to queue
   */
  async enqueue(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      // Remove oldest request
      this.queue.shift();
    }

    const queuedRequest: QueuedRequest = {
      ...request,
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(queuedRequest);
    await this.persist();
  }

  /**
   * Process queue when online
   */
  async processQueue(apiClient: any): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    // Dynamic import to avoid build issues
    const NetInfo = require('@react-native-community/netinfo');
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return;
    }

    this.isProcessing = true;

    const requestsToProcess = [...this.queue];
    this.queue = [];

    for (const request of requestsToProcess) {
      try {
        await apiClient.request(request.endpoint, {
          method: request.method as any,
          headers: request.headers,
          body: request.body,
        });
        // Request succeeded, remove from queue
      } catch (error) {
        // Request failed, retry if under max retries
        if (request.retries < this.maxRetries) {
          request.retries++;
          this.queue.push(request);
        }
      }
    }

    await this.persist();
    this.isProcessing = false;
  }

  /**
   * Clear queue
   */
  async clear(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(QUEUE_KEY);
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Persist queue to storage
   */
  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to persist offline queue:', error);
    }
  }
}

export const offlineQueue = new OfflineQueue();

