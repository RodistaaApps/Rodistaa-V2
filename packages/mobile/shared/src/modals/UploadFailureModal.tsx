/**
 * Upload Failure Modal
 * Handles upload failures with retry options
 */

import { View, StyleSheet, Text } from 'react-native';
import { RModal, RButton } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';

export interface UploadFailureModalProps {
  visible: boolean;
  uploadType: 'photo' | 'bid' | 'pod' | 'inspection';
  errorMessage: string;
  onRetry: () => void;
  onCancel: () => void;
  onForceSync?: () => void;
}

export function UploadFailureModal({
  visible,
  uploadType,
  errorMessage,
  onRetry,
  onCancel,
  onForceSync,
}: UploadFailureModalProps) {
  return (
    <RModal visible={visible} onClose={onCancel} title="Upload Failed">
      <View style={styles.container}>
        <Text style={styles.message}>
          Failed to upload {uploadType}. {errorMessage}
        </Text>
        
        <Text style={styles.info}>
          The item has been queued and will be retried automatically when online.
        </Text>
        
        <View style={styles.actions}>
          <RButton
            title="Retry Now"
            variant="primary"
            onPress={onRetry}
            style={styles.button}
          />
          {onForceSync && (
            <RButton
              title="Force Sync"
              variant="secondary"
              onPress={onForceSync}
              style={styles.button}
            />
          )}
          <RButton
            title="Cancel"
            variant="text"
            onPress={onCancel}
            style={styles.button}
          />
        </View>
      </View>
    </RModal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: RodistaaSpacing.lg,
  },
  message: {
    ...MobileTextStyles.body,
    color: RodistaaColors.error.main,
    marginBottom: RodistaaSpacing.md,
  },
  info: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.lg,
  },
  actions: {
    gap: RodistaaSpacing.md,
  },
  button: {
    marginTop: RodistaaSpacing.xs,
  },
});

