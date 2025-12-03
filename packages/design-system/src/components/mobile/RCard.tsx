/**
 * RCard - Rodistaa Mobile Card Component
 * STRICT: Follow Rodistaa card memory rules
 * - Bookings: 168px height
 * - Bids: 152px height
 * - Shipments: 196px height
 * - Banners: 108px height
 * - Highlights: 148px height
 * - All cards: 20px radius, 16-18px padding
 * - NO inline buttons (actions in detail sheets)
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { RodistaaSpacing, RNShadowStyles } from '../../tokens/spacing';

export type RCardType = 'booking' | 'bid' | 'shipment' | 'banner' | 'highlight' | 'custom';

export interface RCardProps {
  type?: RCardType;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  bordered?: boolean;
  disabled?: boolean;
  testID?: string;
}

export const RCard: React.FC<RCardProps> = ({
  type = 'custom',
  onPress,
  children,
  style,
  elevated = true,
  bordered = false,
  disabled = false,
  testID,
}) => {
  const cardStyle: ViewStyle = {
    ...styles.base,
    ...(elevated && styles.elevated),
    ...(bordered && styles.bordered),
    ...(disabled && styles.disabled),
    ...getTypeStyle(type),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[cardStyle, style]} testID={testID}>
      {children}
    </View>
  );
};

const getTypeStyle = (type: RCardType): ViewStyle => {
  switch (type) {
    case 'booking':
      return { height: 168 };
    case 'bid':
      return { height: 152 };
    case 'shipment':
      return { height: 196 };
    case 'banner':
      return { height: 108 };
    case 'highlight':
      return { height: 148 };
    case 'custom':
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: RodistaaColors.background.default,
    borderRadius: 20, // Rodistaa standard: 20px for cards (per memory)
    padding: RodistaaSpacing.md, // 16px
    marginBottom: RodistaaSpacing.md,
  },

  elevated: {
    ...RNShadowStyles.md,
  },

  bordered: {
    borderWidth: 1,
    borderColor: RodistaaColors.border.default,
  },

  disabled: {
    opacity: 0.5,
  },
});

export default RCard;

