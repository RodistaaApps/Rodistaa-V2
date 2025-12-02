/**
 * Bookings List Screen
 * View all bookings and their bids
 */

import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, LoadingSpinner } from '@rodistaa/mobile-shared';
import { useGetBookings } from '@rodistaa/mobile-shared';
import { useState } from 'react';

export default function BookingsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { data: bookings, isLoading, refetch } = useGetBookings();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const renderBooking = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/bookings/${item.id}`)}
      style={styles.bookingCard}
    >
      <Card>
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingId}>Booking #{item.id}</Text>
          <Text style={styles.bookingStatus}>{item.status}</Text>
        </View>
        <Text style={styles.route}>
          {item.pickupAddress} → {item.dropAddress}
        </Text>
        <View style={styles.bookingFooter}>
          <Text style={styles.bidCount}>
            {item.bidCount || 0} Bids
          </Text>
          <Text style={styles.price}>
            ₹{item.expectedPriceRange?.min || 0} - ₹{item.expectedPriceRange?.max || 0}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings?.data || []}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Text style={styles.emptySubtext}>Create your first booking to get started</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    padding: 16,
  },
  bookingCard: {
    marginBottom: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bookingId: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    fontWeight: '600',
    color: '#333333',
  },
  bookingStatus: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#C90D0D',
    fontWeight: '500',
  },
  route: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
    marginBottom: 8,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  bidCount: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
  },
  price: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    fontWeight: '600',
    color: '#C90D0D',
  },
  empty: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Times New Roman',
    color: '#666666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#999999',
  },
});

