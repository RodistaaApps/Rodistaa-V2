/**
 * Bookings Screen - Browse available bookings - Uses design system LoadCard
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LoadCard, RTag } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';

const mockBookings = [
  {
    id: 'BKG-2024-001',
    pickup: { address: '123 Main St', city: 'Chennai', state: 'TN' },
    drop: { address: '456 Park Ave', city: 'Bangalore', state: 'KA' },
    tonnage: 10,
    priceRange: { min: 20000, max: 30000 },
    status: 'OPEN_FOR_BIDDING' as const,
    bidsCount: 5,
    pickupDate: '2024-12-10',
  },
  {
    id: 'BKG-2024-002',
    pickup: { address: '789 Market Rd', city: 'Bangalore', state: 'KA' },
    drop: { address: '321 Tower St', city: 'Mumbai', state: 'MH' },
    tonnage: 15,
    priceRange: { min: 50000, max: 60000 },
    status: 'OPEN_FOR_BIDDING' as const,
    bidsCount: 8,
    pickupDate: '2024-12-12',
  },
  {
    id: 'BKG-2024-003',
    pickup: { address: '555 Tech Park', city: 'Chennai', state: 'TN' },
    drop: { address: '777 Business Hub', city: 'Hyderabad', state: 'TS' },
    tonnage: 8,
    priceRange: { min: 25000, max: 35000 },
    status: 'OPEN_FOR_BIDDING' as const,
    bidsCount: 3,
    pickupDate: '2024-12-08',
  },
];

export default function BookingsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'mybids'>('open');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredBookings = mockBookings.filter((booking) => {
    if (filter === 'open') return booking.status === 'OPEN_FOR_BIDDING';
    if (filter === 'mybids') return booking.bidsCount > 0;
    return true;
  });

  const renderBooking = ({ item }: { item: typeof mockBookings[0] }) => (
    <LoadCard
      id={item.id}
      pickup={item.pickup}
      drop={item.drop}
      tonnage={item.tonnage}
      priceRange={item.priceRange}
      status={item.status}
      bidCount={item.bidsCount}
      onPress={() => router.push(`/bookings/${item.id}/bid`)}
    />
  );

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'open' && styles.filterTabActive]}
          onPress={() => setFilter('open')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'open' && styles.filterTextActive,
            ]}
          >
            Open Bookings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'mybids' && styles.filterTabActive]}
          onPress={() => setFilter('mybids')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'mybids' && styles.filterTextActive,
            ]}
          >
            My Bids
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={RodistaaColors.primary.main}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No bookings found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: RodistaaColors.background.default,
    padding: RodistaaSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },
  filterTab: {
    flex: 1,
    padding: RodistaaSpacing.md,
    alignItems: 'center',
    borderRadius: RodistaaSpacing.borderRadius.md,
  },
  filterTabActive: {
    backgroundColor: RodistaaColors.primary.main,
  },
  filterText: {
    ...MobileTextStyles.bodySmall,
    fontWeight: '600',
    color: RodistaaColors.text.secondary,
  },
  filterTextActive: {
    color: RodistaaColors.primary.contrast,
  },
  list: {
    padding: RodistaaSpacing.lg,
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
