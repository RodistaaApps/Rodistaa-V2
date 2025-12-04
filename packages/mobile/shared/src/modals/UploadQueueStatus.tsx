/**
 * Upload Queue Status Modal
 * Shows pending uploads and queue status
 */

import { View, StyleSheet, FlatList, Text } from 'react-native';
import { RModal, RButton, RTag } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { getUploadQueue, processUploadQueue, QueuedUpload } from '../offline/uploadQueue';
import { useState, useEffect } from 'react';

export interface UploadQueueStatusProps {
  visible: boolean;
  onClose: () => void;
}

export function UploadQueueStatus({ visible, onClose }: UploadQueueStatusProps) {
  const [queue, setQueue] = useState<QueuedUpload[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadQueue();
    }
  }, [visible]);

  async function loadQueue() {
    const queueState = await getUploadQueue();
    setQueue(queueState.items);
  }

  async function handleProcessQueue() {
    setIsProcessing(true);
    const result = await processUploadQueue();
    setIsProcessing(false);
    await loadQueue();
    
    Alert.alert(
      'Queue Processed',
      `Success: ${result.success}, Failed: ${result.failed}`
    );
  }

  const renderItem = ({ item }: { item: QueuedUpload }) => (
    <View style={styles.item}>
      <Text style={styles.itemType}>{item.type.toUpperCase()}</Text>
      <Text style={styles.itemTime}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
      <RTag
        label={`Attempts: ${item.attemptCount}/${item.maxRetries}`}
        variant={item.attemptCount >= item.maxRetries ? 'error' : 'warning'}
        size="small"
      />
    </View>
  );

  return (
    <RModal visible={visible} onClose={onClose} title="Upload Queue">
      <View style={styles.container}>
        <Text style={styles.count}>
          {queue.length} item{queue.length !== 1 ? 's' : ''} in queue
        </Text>
        
        <FlatList
          data={queue}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
        
        <RButton
          title={isProcessing ? 'Processing...' : 'Process Queue Now'}
          variant="primary"
          onPress={handleProcessQueue}
          loading={isProcessing}
          disabled={queue.length === 0 || isProcessing}
          style={styles.button}
        />
      </View>
    </RModal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: RodistaaSpacing.lg,
    maxHeight: 500,
  },
  count: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.md,
  },
  list: {
    maxHeight: 300,
    marginBottom: RodistaaSpacing.lg,
  },
  item: {
    padding: RodistaaSpacing.md,
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.md,
    marginBottom: RodistaaSpacing.sm,
  },
  itemType: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  itemTime: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  button: {
    marginTop: RodistaaSpacing.md,
  },
});

