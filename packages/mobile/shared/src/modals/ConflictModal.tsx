/**
 * Conflict Modal
 * Handles bid conflicts and other business rule violations
 */

import { View, StyleSheet, Modal, Text } from 'react-native';
import { RModal, RButton } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';

export interface ConflictModalProps {
  visible: boolean;
  title: string;
  message: string;
  conflictType: 'bid' | 'truck' | 'driver' | 'other';
  onResolve: () => void;
  onCancel: () => void;
}

export function ConflictModal({
  visible,
  title,
  message,
  conflictType,
  onResolve,
  onCancel,
}: ConflictModalProps) {
  return (
    <RModal visible={visible} onClose={onCancel} title={title}>
      <View style={styles.container}>
        <Text style={styles.message}>{message}</Text>
        
        <View style={styles.actions}>
          <RButton
            title="Resolve"
            variant="primary"
            onPress={onResolve}
            style={styles.button}
          />
          <RButton
            title="Cancel"
            variant="secondary"
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
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: RodistaaSpacing.md,
  },
  button: {
    flex: 1,
  },
});

