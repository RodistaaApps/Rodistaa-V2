/**
 * Bookings Screen - Browse available bookings with LoadCard from design system
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { RCard } from '../components/RCard';
import {
  RodistaaColors,
  MobileTextStyles,
  RodistaaSpacing,
} from '../theme/colors';

const mockBookings = [
  {
    id: 'BKG-001',
    pickup: {
      address: '123 Main Street, Sector 15',
      city: 'Hyderabad',
      state: 'Telangana',
    },
    drop: {
      address: '456 Park Avenue, Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
    },
    tonnage: 5,
    priceRange: { min: 45000, max: 55000 },
    status: 'OPEN_FOR_BIDDING' as const,
    bidCount: 4,
    pickupDate: '2025-12-06',
    material: 'Electronics',
    distance: 710,
  },
  {
    id: 'BKG-002',
    pickup: {
      address: '789 Market Road',
      city: 'Delhi',
      state: 'Delhi',
    },
    drop: {
      address: '321 Tower Street, Whitefield',
      city: 'Bangalore',
      state: 'Karnataka',
    },
    tonnage: 12,
    priceRange: { min: 85000, max: 95000 },
    status: 'OPEN_FOR_BIDDING' as const,
    bidCount: 6,
    pickupDate: '2025-12-07',
    material: 'Machinery Parts',
    distance: 2150,
  },
  {
    id: 'BKG-003',
    pickup: {
      address: '555 Tech Park',
      city: 'Chennai',
      state: 'Tamil Nadu',
    },
    drop: {
      address: '777 Business Hub',
      city: 'Pune',
      state: 'Maharashtra',
    },
    tonnage: 8,
    priceRange: { min: 35000, max: 45000 },
    status: 'OPEN_FOR_BIDDING' as const,
    bidCount: 2,
    pickupDate: '2025-12-08',
    material: 'Textiles',
    distance: 1200,
  },
];

interface BookingsScreenProps {
  navigation?: any;
}

export default function BookingsScreen({ navigation }: BookingsScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'open' | 'mybids' | 'all'>('open');

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // TODO: Call GET /bookings API with filters
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to refresh bookings:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredBookings = mockBookings.filter(booking => {
    if (filter === 'open') return booking.status === 'OPEN_FOR_BIDDING';
    if (filter === 'mybids') return booking.bidCount > 0; // TODO: Check actual user bids
    return true;
  });

  const handleBookingPress = (bookingId: string) => {
    console.log('Navigate to bid screen:', bookingId);
    // TODO: Navigate to bid placement screen
  };

  const renderBooking = ({ item }: { item: typeof mockBookings[0] }) => (
    <TouchableOpacity
      onPress={() => handleBookingPress(item.id)}
      activeOpacity={0.7}
      style={{ marginBottom: RodistaaSpacing.md }}
    >
      <RCard>
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingId}>{item.id}</Text>
          <View style={styles.bidsBadge}>
            <Text style={styles.bidsText}>{item.bidCount} bids</Text>
          </View>
        </View>

        <View style={styles.route}>
          <Text style={styles.routeText}>
            {item.pickup.city} → {item.drop.city}
          </Text>
          <Text style={styles.routeDetails}>
            {item.distance} km • {item.tonnage} MT • {item.material}
          </Text>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.bookingDetailItem}>
            <Text style={styles.bookingLabel}>Pickup</Text>
            <Text style={styles.bookingValue}>
              {new Date(item.pickupDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
              })}
            </Text>
          </View>
          <View style={styles.bookingDetailItem}>
            <Text style={styles.bookingLabel}>Amount</Text>
            <Text style={styles.amountText}>
              ₹{(item.priceRange.min / 1000).toFixed(0)}K - ₹{(item.priceRange.max / 1000).toFixed(0)}K
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.bidButton}>
          <Text style={styles.bidButtonText}>Place Bid</Text>
        </TouchableOpacity>
      </RCard>
    </TouchableOpacity>
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

      {/* Bookings List */}
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
    backgroundColor: RodistaaColors.background.paper,
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
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    fontFamily: 'monospace',
  },
  bidsBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bidsText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
  },
  route: {
    marginBottom: 16,
  },
  routeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: RodistaaColors.text.primary,
    marginBottom: 4,
  },
  routeDetails: {
    fontSize: 13,
    color: RodistaaColors.text.secondary,
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bookingDetailItem: {
    flex: 1,
  },
  bookingLabel: {
    fontSize: 11,
    color: RodistaaColors.text.secondary,
    marginBottom: 4,
  },
  bookingValue: {
    fontSize: 13,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
  },
  amountText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#10B981',
  },
  bidButton: {
    backgroundColor: RodistaaColors.primary.main,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  bidButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
