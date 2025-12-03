/**
 * RPhotoCapture - Rodistaa Mobile Photo Capture Component
 * For capturing and displaying photos (inspection, POD, etc.)
 */

import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing, RNShadowStyles } from '../../tokens/spacing';

export interface RPhotoCaptureProps {
  photoUri?: string;
  onCapture: () => void;
  onRemove?: () => void;
  label?: string;
  aspectRatio?: number;
  style?: ViewStyle;
  testID?: string;
}

export const RPhotoCapture: React.FC<RPhotoCaptureProps> = ({
  photoUri,
  onCapture,
  onRemove,
  label,
  aspectRatio = 16 / 9,
  style,
  testID,
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {label && <Text style={styles.label}>{label}</Text>}

      {photoUri ? (
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: photoUri }}
            style={[styles.photo, { aspectRatio }]}
            resizeMode="cover"
          />
          {onRemove && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={onRemove}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.captureButton, { aspectRatio }]}
          onPress={onCapture}
          activeOpacity={0.7}
        >
          <Text style={styles.captureIcon}>📷</Text>
          <Text style={styles.captureText}>Tap to capture photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: RodistaaSpacing.md,
  },

  label: {
    ...MobileTextStyles.label,
    marginBottom: RodistaaSpacing.xs,
    color: RodistaaColors.text.primary,
  },

  photoContainer: {
    position: 'relative',
    borderRadius: RodistaaSpacing.borderRadius.lg,
    overflow: 'hidden',
    ...RNShadowStyles.sm,
  },

  photo: {
    width: '100%',
    backgroundColor: RodistaaColors.background.paper,
  },

  removeButton: {
    position: 'absolute',
    top: RodistaaSpacing.xs,
    right: RodistaaSpacing.xs,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: RodistaaColors.error.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...RNShadowStyles.md,
  },

  removeButtonText: {
    color: RodistaaColors.text.inverse,
    fontSize: 18,
    fontWeight: 'bold',
  },

  captureButton: {
    width: '100%',
    backgroundColor: RodistaaColors.background.paper,
    borderWidth: 2,
    borderColor: RodistaaColors.border.default,
    borderStyle: 'dashed',
    borderRadius: RodistaaSpacing.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  captureIcon: {
    fontSize: 48,
    marginBottom: RodistaaSpacing.xs,
  },

  captureText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.secondary,
  },
});

export default RPhotoCapture;

