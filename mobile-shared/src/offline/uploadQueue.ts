/**
 * Offline Upload Queue
 * Manages queued uploads (photos, bids, PODs) for offline retry
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const UPLOAD_QUEUE_KEY = '@rodistaa/upload_queue';

export interface QueuedUpload {
  id: string;
  type: 'photo' | 'bid' | 'pod' | 'inspection';
  data: any;
  timestamp: string;
  attemptCount: number;
  maxRetries: number;
}

export interface UploadQueueState {
  items: QueuedUpload[];
  isProcessing: boolean;
}

/**
 * Add item to upload queue
 */
export async function queueUpload(upload: Omit<QueuedUpload, 'id' | 'timestamp' | 'attemptCount'>): Promise<string> {
  const id = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const queuedUpload: QueuedUpload = {
    id,
    ...upload,
    timestamp: new Date().toISOString(),
    attemptCount: 0,
  };

  try {
    const queue = await getUploadQueue();
    queue.items.push(queuedUpload);
    await AsyncStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(queue));
    return id;
  } catch (error) {
    console.error('Failed to queue upload:', error);
    throw error;
  }
}

/**
 * Get upload queue
 */
export async function getUploadQueue(): Promise<UploadQueueState> {
  try {
    const stored = await AsyncStorage.getItem(UPLOAD_QUEUE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return { items: [], isProcessing: false };
  } catch (error) {
    console.error('Failed to get upload queue:', error);
    return { items: [], isProcessing: false };
  }
}

/**
 * Remove item from queue
 */
export async function removeQueuedUpload(id: string): Promise<void> {
  try {
    const queue = await getUploadQueue();
    queue.items = queue.items.filter((item) => item.id !== id);
    await AsyncStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to remove queued upload:', error);
  }
}

/**
 * Process upload queue (flush when online)
 */
export async function processUploadQueue(): Promise<{ success: number; failed: number }> {
  const queue = await getUploadQueue();
  if (queue.isProcessing || queue.items.length === 0) {
    return { success: 0, failed: 0 };
  }

  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    return { success: 0, failed: 0 };
  }

  // Mark as processing
  queue.isProcessing = true;
  await AsyncStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(queue));

  let success = 0;
  let failed = 0;
  const remainingItems: QueuedUpload[] = [];

  for (const item of queue.items) {
    try {
      // Process based on type
      let processed = false;
      
      if (item.type === 'photo') {
        // Process photo upload
        // await apiClient.uploadPhoto(item.data);
        processed = true;
      } else if (item.type === 'bid') {
        // Process bid submission
        // await apiClient.submitBid(item.data);
        processed = true;
      } else if (item.type === 'pod') {
        // Process POD upload
        // await apiClient.uploadPOD(item.data);
        processed = true;
      } else if (item.type === 'inspection') {
        // Process inspection upload
        // await apiClient.uploadInspection(item.data);
        processed = true;
      }

      if (processed) {
        success++;
      } else {
        item.attemptCount++;
        if (item.attemptCount < item.maxRetries) {
          remainingItems.push(item);
        } else {
          failed++;
        }
      }
    } catch (error) {
      item.attemptCount++;
      if (item.attemptCount < item.maxRetries) {
        remainingItems.push(item);
      } else {
        failed++;
      }
    }
  }

  // Update queue
  queue.items = remainingItems;
  queue.isProcessing = false;
  await AsyncStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(queue));

  return { success, failed };
}

/**
 * Get queue count
 */
export async function getUploadQueueCount(): Promise<number> {
  const queue = await getUploadQueue();
  return queue.items.length;
}

