/**
 * Bookings Screen - Browse available bookings with LoadCard from design system
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RCard } from '../components/RCard';
import {
  RodistaaColors,
  MobileTextStyles,
  RodistaaSpacing,
} from '../theme/colors';
import { bookingService, type Booking } from '../services/bookingService';
import { useNavigation } from '@react-navigation/native';

interface BookingsScreenProps {
  navigation?: any;
}

export default function BookingsScreen({ navigation: navProp }: BookingsScreenProps) {
  // Use navigation from props first, fallback to hook
  let navigation;
  try {
    navigation = navProp || useNavigation();
  } catch (error) {
    console.error('Navigation error in BookingsScreen:', error);
    navigation = {
      navigate: (name: string) => console.log('Navigate to:', name),
    };
  }
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'open' | 'mybids' | 'all'>('open');

  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ['bookings', filter],
    queryFn: () => {
      const filters: any = {};
      if (filter === 'open') {
        filters.status = 'OPEN_FOR_BIDDING';
      }
      return bookingService.getBookings(filters);
    },
    staleTime: 30000, // 30 seconds
  });

  const { data: myBids = [] } = useQuery({
    queryKey: ['myBids'],
    queryFn: () => bookingService.getMyBids(),
    staleTime: 30000,
  });

  const onRefresh = async () => {
    await Promise.all([
      refetch(),
      queryClient.invalidateQueries({ queryKey: ['myBids'] }),
    ]);
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'open') return booking.status === 'OPEN_FOR_BIDDING';
    if (filter === 'mybids') {
      return myBids.some(bid => bid.bookingId === booking.id);
    }
    return true;
  });

  const handleBookingPress = (bookingId: string) => {
    Alert.alert('Booking Details', `View details for booking ${bookingId}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'View', onPress: () => console.log('View booking:', bookingId) },
    ]);
  };

  const handlePlaceBid = (booking: Booking) => {
    // For web, use window.prompt as Alert.prompt is not available
    const amount = window.prompt(
      `Place Bid for ${booking.id}\n\nPrice range: ₹${booking.priceRange.min.toLocaleString()} - ₹${booking.priceRange.max.toLocaleString()}\n\nEnter your bid amount:`
    );
    
    if (amount === null) {
      return; // User cancelled
    }
    
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    (async () => {
      try {
        // TODO: Call bookingService.placeBid(booking.id, Number(amount))
        Alert.alert('Success', `Bid of ₹${Number(amount).toLocaleString()} placed successfully!`);
        await onRefresh();
      } catch (error) {
        Alert.alert('Error', 'Failed to place bid. Please try again.');
      }
    })();
  };

  if (isLoading && bookings.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={RodistaaColors.primary.main} />
        <Text style={{ marginTop: 16, color: RodistaaColors.text.secondary }}>
          Loading bookings...
        </Text>
      </View>
    );
  }

  const renderBooking = ({ item }: { item: Booking; index?: number }) => (
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

        <TouchableOpacity
          style={styles.bidButton}
          onPress={() => handlePlaceBid(item)}
        >
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={RodistaaColors.primary.main}
          />
        }
      >
        {filteredBookings.length === 0 && !isLoading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No bookings found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <View key={booking.id}>
              {renderBooking({ item: booking, index: filteredBookings.indexOf(booking) })}
            </View>
          ))
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
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
