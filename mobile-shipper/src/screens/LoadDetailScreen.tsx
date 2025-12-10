/**
 * Load Detail Screen - View Booking & Bids
 * Pure React Native CLI component
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { RCard } from '@rodistaa/design-system';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from '@react-navigation/native';
import { apiClient } from '@rodistaa/mobile-shared';

export interface LoadDetailScreenProps {
  navigation: any;
  route: { params: { id: string } };
}

interface Bid {
  id: string;
  operatorId: string;
  operatorName: string;
  amount: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

interface Booking {
  id: string;
  pickup: { address: string; city: string; state: string };
  drop: { address: string; city: string; state: string };
  material: string;
  tonnage: number;
  priceRange: { min: number; max: number };
  status: string;
  bidCount: number;
  bids: Bid[];
}

export const LoadDetailScreen: React.FC<LoadDetailScreenProps> = ({ navigation }) => {
  const route = useRoute();
  const bookingId = (route.params as any)?.id || '';

  const { data: booking, isLoading } = useQuery<Booking>({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      return await apiClient.get(`/bookings/${bookingId}`);
    },
    enabled: !!bookingId,
  });

  const handleAcceptBid = (bidId: string) => {
    // TODO: Navigate to accept bid screen or show confirmation modal
    navigation.navigate('AcceptBid', { bidId, bookingId });
  };

  const handleViewBids = () => {
    navigation.navigate('BidsViewer', { bookingId });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={RodistaaColors.primary.main} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Booking not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <RCard style={styles.card}>
        <Text style={styles.bookingId}>{booking.id}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{booking.status}</Text>
        </View>

        <View style={styles.routeSection}>
          <View style={styles.locationRow}>
            <Text style={styles.locationLabel}>Pickup:</Text>
            <Text style={styles.locationText}>
              {booking.pickup.address}, {booking.pickup.city}, {booking.pickup.state}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <Text style={styles.locationLabel}>Drop:</Text>
            <Text style={styles.locationText}>
              {booking.drop.address}, {booking.drop.city}, {booking.drop.state}
            </Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Material</Text>
            <Text style={styles.detailValue}>{booking.material}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Weight</Text>
            <Text style={styles.detailValue}>{booking.tonnage} MT</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Price Range</Text>
            <Text style={styles.detailValue}>
              ₹{booking.priceRange.min.toLocaleString()} - ₹{booking.priceRange.max.toLocaleString()}
            </Text>
          </View>
        </View>
      </RCard>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bids ({booking.bidCount})</Text>
          {booking.bidCount > 0 && (
            <TouchableOpacity onPress={handleViewBids} accessibilityLabel="View all bids">
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {booking.bids && booking.bids.length > 0 ? (
          booking.bids.slice(0, 3).map((bid) => (
            <RCard key={bid.id} style={styles.bidCard}>
              <View style={styles.bidHeader}>
                <View>
                  <Text style={styles.operatorName}>{bid.operatorName}</Text>
                  <Text style={styles.bidAmount}>₹{bid.amount.toLocaleString()}</Text>
                </View>
                <View style={[styles.bidStatusBadge, { backgroundColor: getBidStatusColor(bid.status) }]}>
                  <Text style={styles.bidStatusText}>{bid.status}</Text>
                </View>
              </View>
              {bid.status === 'PENDING' && (
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAcceptBid(bid.id)}
                  accessibilityLabel={`Accept bid from ${bid.operatorName}`}
                >
                  <Text style={styles.acceptButtonText}>Accept Bid</Text>
                </TouchableOpacity>
              )}
            </RCard>
          ))
        ) : (
          <RCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>No bids yet</Text>
          </RCard>
        )}
      </View>
    </ScrollView>
  );
};

const getBidStatusColor = (status: string) => {
  switch (status) {
    case 'ACCEPTED': return RodistaaColors.success.main;
    case 'REJECTED': return RodistaaColors.error.main;
    default: return RodistaaColors.info.main;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.error.main,
  },
  card: {
    margin: RodistaaSpacing.lg,
    padding: RodistaaSpacing.lg,
  },
  bookingId: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.primary.main,
    fontFamily: 'monospace',
    marginBottom: RodistaaSpacing.md,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: RodistaaColors.info.main,
    paddingHorizontal: RodistaaSpacing.md,
    paddingVertical: RodistaaSpacing.xs,
    borderRadius: RodistaaSpacing.borderRadius.sm,
    marginBottom: RodistaaSpacing.lg,
  },
  statusText: {
    ...MobileTextStyles.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  routeSection: {
    marginBottom: RodistaaSpacing.lg,
  },
  locationRow: {
    marginBottom: RodistaaSpacing.md,
  },
  locationLabel: {
    ...MobileTextStyles.bodySmall,
    fontWeight: '600',
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  locationText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: RodistaaSpacing.md,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
  },
  detailLabel: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  detailValue: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
  },
  section: {
    padding: RodistaaSpacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RodistaaSpacing.md,
  },
  sectionTitle: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
  },
  viewAllText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.primary.main,
    fontWeight: '600',
  },
  bidCard: {
    marginBottom: RodistaaSpacing.md,
    padding: RodistaaSpacing.lg,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: RodistaaSpacing.md,
  },
  operatorName: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  bidAmount: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.success.main,
    fontWeight: '700',
  },
  bidStatusBadge: {
    paddingHorizontal: RodistaaSpacing.md,
    paddingVertical: RodistaaSpacing.xs,
    borderRadius: RodistaaSpacing.borderRadius.sm,
  },
  bidStatusText: {
    ...MobileTextStyles.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: RodistaaColors.primary.main,
    paddingVertical: RodistaaSpacing.md,
    borderRadius: RodistaaSpacing.borderRadius.md,
    alignItems: 'center',
  },
  acceptButtonText: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.primary.contrast,
  },
  emptyCard: {
    padding: RodistaaSpacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.secondary,
  },
});

