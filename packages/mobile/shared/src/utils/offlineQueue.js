/**
 * Offline Queue
 * Manages failed requests and retries when online
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
// Note: NetInfo import will be handled at runtime to avoid build issues
const QUEUE_KEY = 'offline_request_queue';
const MAX_QUEUE_SIZE = 100;
class OfflineQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.maxRetries = 3;
    }
    /**
     * Initialize queue from storage
     */
    async initialize() {
        try {
            const stored = await AsyncStorage.getItem(QUEUE_KEY);
            if (stored) {
                this.queue = JSON.parse(stored);
            }
        }
        catch (error) {
            console.error('Failed to load offline queue:', error);
        }
    }
    /**
     * Add request to queue
     */
    async enqueue(request) {
        if (this.queue.length >= MAX_QUEUE_SIZE) {
            // Remove oldest request
            this.queue.shift();
        }
        const queuedRequest = {
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
    async processQueue(apiClient) {
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
                    method: request.method,
                    headers: request.headers,
                    body: request.body,
                });
                // Request succeeded, remove from queue
            }
            catch (error) {
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
    async clear() {
        this.queue = [];
        await AsyncStorage.removeItem(QUEUE_KEY);
    }
    /**
     * Get queue size
     */
    getQueueSize() {
        return this.queue.length;
    }
    /**
     * Persist queue to storage
     */
    async persist() {
        try {
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
        }
        catch (error) {
            console.error('Failed to persist offline queue:', error);
        }
    }
}
export const offlineQueue = new OfflineQueue();
