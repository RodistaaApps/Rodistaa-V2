/**
 * RPDFViewer - Rodistaa Mobile PDF Viewer Component
 * For viewing PDFs (POD documents, etc.)
 * Note: Requires react-native-pdf or similar library in actual implementation
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing, RNShadowStyles } from '../../tokens/spacing';

export interface RPDFViewerProps {
  pdfUri: string;
  onOpen?: () => void;
  title?: string;
  style?: ViewStyle;
  testID?: string;
}

export const RPDFViewer: React.FC<RPDFViewerProps> = ({
  pdfUri,
  onOpen,
  title,
  style,
  testID,
}) => {
  // In actual implementation, this would use react-native-pdf
  // For now, providing a button to open PDF
  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.pdfPreview}>
        <Text style={styles.pdfIcon}>📄</Text>
        <Text style={styles.title}>{title || 'PDF Document'}</Text>
        <Text style={styles.uri} numberOfLines={1}>
          {pdfUri}
        </Text>
      </View>

      {onOpen && (
        <TouchableOpacity
          style={styles.openButton}
          onPress={onOpen}
          activeOpacity={0.7}
        >
          <Text style={styles.openButtonText}>Open PDF</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: RodistaaSpacing.md,
  },

  pdfPreview: {
    backgroundColor: RodistaaColors.background.paper,
    borderWidth: 1,
    borderColor: RodistaaColors.border.default,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    padding: RodistaaSpacing.lg,
    alignItems: 'center',
    ...RNShadowStyles.sm,
  },

  pdfIcon: {
    fontSize: 48,
    marginBottom: RodistaaSpacing.sm,
  },

  title: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    fontWeight: '600',
    marginBottom: RodistaaSpacing.xxs,
  },

  uri: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
  },

  openButton: {
    marginTop: RodistaaSpacing.sm,
    backgroundColor: RodistaaColors.primary.main,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    paddingVertical: RodistaaSpacing.sm,
    paddingHorizontal: RodistaaSpacing.lg,
    alignItems: 'center',
  },

  openButtonText: {
    ...MobileTextStyles.button,
    color: RodistaaColors.text.inverse,
  },
});

export default RPDFViewer;

