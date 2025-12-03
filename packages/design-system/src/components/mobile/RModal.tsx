/**
 * RModal - Rodistaa Mobile Modal Component
 * STRICT: Follow Rodistaa modal guidelines
 * - Animation: fade-in 140ms
 * - Sizes: small (400px), medium (600px), large (800px)
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Dimensions,
  ScrollView,
} from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing, RNShadowStyles } from '../../tokens/spacing';

export type RModalSize = 'small' | 'medium' | 'large' | 'fullscreen';

export interface RModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: RModalSize;
  showCloseButton?: boolean;
  actions?: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const RModal: React.FC<RModalProps> = ({
  visible,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  actions,
  scrollable = true,
  style,
  testID,
}) => {
  const modalWidth = getModalWidth(size);
  const modalWidthNumber = typeof modalWidth === 'string' ? undefined : modalWidth;

  const ContentWrapper = scrollable ? ScrollView : View;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { width: modalWidthNumber }, style]}>
          {/* Header */}
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              {showCloseButton && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Content */}
          <ContentWrapper
            style={styles.content}
            showsVerticalScrollIndicator={scrollable}
          >
            {children}
          </ContentWrapper>

          {/* Actions */}
          {actions && <View style={styles.actions}>{actions}</View>}
        </View>
      </View>
    </Modal>
  );
};

const getModalWidth = (size: RModalSize): number | string => {
  switch (size) {
    case 'small':
      return Math.min(400, SCREEN_WIDTH * 0.9);
    case 'medium':
      return Math.min(600, SCREEN_WIDTH * 0.9);
    case 'large':
      return Math.min(800, SCREEN_WIDTH * 0.95);
    case 'fullscreen':
      return SCREEN_WIDTH;
    default:
      return Math.min(600, SCREEN_WIDTH * 0.9);
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: RodistaaColors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    backgroundColor: RodistaaColors.background.default,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    maxHeight: '90%',
    ...RNShadowStyles.xl,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: RodistaaSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },

  title: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
    flex: 1,
  },

  closeButton: {
    minWidth: RodistaaSpacing.touchTarget.minWidth,
    minHeight: RodistaaSpacing.touchTarget.minHeight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: RodistaaSpacing.md,
  },

  closeButtonText: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.text.secondary,
  },

  content: {
    padding: RodistaaSpacing.lg,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: RodistaaSpacing.lg,
    borderTopWidth: 1,
    borderTopColor: RodistaaColors.border.light,
    gap: RodistaaSpacing.sm,
  },
});

export default RModal;

