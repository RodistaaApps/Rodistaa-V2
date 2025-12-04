/**
 * LoadCard - Rodistaa Mobile Load/Booking Card Component
 * Displays booking information in a card format
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { RCard } from './RCard';
import { RTag } from './RTag';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing, RNShadowStyles } from '../../tokens/spacing';

export interface LoadCardProps {
  id: string;
  pickup: {
    address: string;
    city: string;
    state: string;
  };
  drop: {
    address: string;
    city: string;
    state: string;
  };
  tonnage: number;
  priceRange: {
    min: number;
    max: number;
  };
  status: 'OPEN_FOR_BIDDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  bidCount?: number;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const LoadCard: React.FC<LoadCardProps> = ({
  id,
  pickup,
  drop,
  tonnage,
  priceRange,
  status,
  bidCount,
  onPress,
  style,
  testID,
}) => {
  const getStatusVariant = (): 'primary' | 'success' | 'warning' | 'error' | 'neutral' => {
    switch (status) {
      case 'OPEN_FOR_BIDDING':
        return 'primary';
      case 'CONFIRMED':
        return 'success';
      case 'IN_TRANSIT':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const formatStatus = (): string => {
    switch (status) {
      case 'OPEN_FOR_BIDDING':
        return 'Open for Bidding';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'IN_TRANSIT':
        return 'In Transit';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const CardContent = (
    <View style={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.loadId}>Load #{id.slice(-6)}</Text>
        <RTag label={formatStatus()} variant={getStatusVariant()} size="small" />
      </View>

      {/* Route */}
      <View style={styles.route}>
        <View style={styles.location}>
          <View style={[styles.dot, styles.pickupDot]} />
          <View style={styles.locationText}>
            <Text style={styles.locationLabel}>Pickup</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>
              {pickup.address}, {pickup.city}, {pickup.state}
            </Text>
          </View>
        </View>

        <View style={styles.location}>
          <View style={[styles.dot, styles.dropDot]} />
          <View style={styles.locationText}>
            <Text style={styles.locationLabel}>Drop</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>
              {drop.address}, {drop.city}, {drop.state}
            </Text>
          </View>
        </View>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Tonnage</Text>
          <Text style={styles.detailValue}>{tonnage} tons</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Price Range</Text>
          <Text style={styles.detailValue}>
            ₹{priceRange.min.toLocaleString()} - ₹{priceRange.max.toLocaleString()}
          </Text>
        </View>
        {bidCount !== undefined && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Bids</Text>
            <Text style={styles.detailValue}>{bidCount}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onPress}
        activeOpacity={0.7}
        testID={testID}
      >
        <RCard style={styles.card}>{CardContent}</RCard>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]} testID={testID}>
      <RCard style={styles.card}>{CardContent}</RCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: RodistaaSpacing.md,
  },
  card: {
    padding: RodistaaSpacing.lg,
  },
  content: {
    gap: RodistaaSpacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadId: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.text.primary,
  },
  route: {
    gap: RodistaaSpacing.sm,
    paddingLeft: RodistaaSpacing.md,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: RodistaaSpacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  pickupDot: {
    backgroundColor: RodistaaColors.success.main,
  },
  dropDot: {
    backgroundColor: RodistaaColors.error.main,
  },
  locationText: {
    flex: 1,
  },
  locationLabel: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationAddress: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.primary,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: RodistaaSpacing.md,
    borderTopWidth: 1,
    borderTopColor: RodistaaColors.border.light,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
    marginBottom: 4,
  },
  detailValue: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.primary,
    fontWeight: '600',
  },
});

export default LoadCard;

