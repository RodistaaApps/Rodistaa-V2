/**
 * My Postings Screen - Posted Loads List
 * Pure React Native CLI component
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
// LoadCard available but using custom card for flexibility
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@rodistaa/mobile-shared';
import { ScrollView } from 'react-native';

export interface MyPostingsScreenProps {
  navigation: any;
}

interface Booking {
  id: string;
  pickup: { city: string; state: string };
  drop: { city: string; state: string };
  material: string;
  tonnage: number;
  priceRange: { min: number; max: number };
  status: 'OPEN_FOR_BIDDING' | 'BIDDING_CLOSED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED';
  bidCount: number;
  createdAt: string;
}

export const MyPostingsScreen: React.FC<MyPostingsScreenProps> = ({ navigation }) => {
  const { data: bookings = [], isLoading, refetch } = useQuery<Booking[]>({
    queryKey: ['my-postings'],
    queryFn: async () => {
      // TODO: Filter by current user's bookings
      const response = await apiClient.get<{ data: Booking[] }>('/bookings');
      return response.data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN_FOR_BIDDING': return RodistaaColors.info.main;
      case 'ACCEPTED': return RodistaaColors.success.main;
      case 'IN_PROGRESS': return RodistaaColors.warning.main;
      case 'COMPLETED': return RodistaaColors.success.dark;
      default: return RodistaaColors.text.secondary;
    }
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('LoadDetail', { id: item.id })}
      activeOpacity={0.7}
      style={{ marginBottom: RodistaaSpacing.md }}
      accessibilityLabel={`Booking ${item.id}`}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.bookingId}>{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
          </View>
        </View>

        <Text style={styles.route}>
          {item.pickup.city} → {item.drop.city}
        </Text>
        <Text style={styles.details}>
          {item.material} • {item.tonnage} MT • {item.bidCount} bids
        </Text>

        <Text style={styles.price}>
          ₹{(item.priceRange.min / 1000).toFixed(0)}K - ₹{(item.priceRange.max / 1000).toFixed(0)}K
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Postings</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => navigation.navigate('PostLoad')}
          accessibilityLabel="Post new load"
        >
          <Text style={styles.newButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={RodistaaColors.primary.main} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No postings yet</Text>
            <Text style={styles.emptySubtext}>Post your first load to get started</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: RodistaaSpacing.xl,
    backgroundColor: RodistaaColors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },
  headerTitle: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.text.primary,
  },
  newButton: {
    backgroundColor: RodistaaColors.primary.main,
    paddingHorizontal: RodistaaSpacing.lg,
    paddingVertical: RodistaaSpacing.sm,
    borderRadius: RodistaaSpacing.borderRadius.md,
  },
  newButtonText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.primary.contrast,
    fontWeight: '600',
  },
  list: {
    padding: RodistaaSpacing.lg,
  },
  card: {
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.md,
    padding: RodistaaSpacing.lg,
    borderWidth: 1,
    borderColor: RodistaaColors.border.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RodistaaSpacing.md,
  },
  bookingId: {
    ...MobileTextStyles.body,
    fontWeight: '700',
    color: RodistaaColors.primary.main,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: RodistaaSpacing.md,
    paddingVertical: RodistaaSpacing.xs,
    borderRadius: RodistaaSpacing.borderRadius.sm,
  },
  statusText: {
    ...MobileTextStyles.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  route: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  details: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.sm,
  },
  price: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.success.main,
  },
  empty: {
    alignItems: 'center',
    padding: RodistaaSpacing.xxxl,
  },
  emptyText: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.sm,
  },
  emptySubtext: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.disabled,
  },
});

