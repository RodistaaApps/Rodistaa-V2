/**
 * Bookings List Screen
 * View all bookings and their bids - Uses design system components
 */

import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { RLoader, LoadCard } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
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
    return <RLoader />;
  }

  const parseAddress = (address: string) => {
    const parts = address.split(',').map((p) => p.trim());
    return {
      address: parts[0] || '',
      city: parts[1] || '',
      state: parts[2] || '',
    };
  };

  const renderBooking = ({ item }: { item: any }) => {
    const pickup = parseAddress(item.pickupAddress || '');
    const drop = parseAddress(item.dropAddress || '');

    return (
      <LoadCard
        id={item.id}
        pickup={pickup}
        drop={drop}
        tonnage={item.weightTons || 0}
        priceRange={{
          min: item.expectedPriceRange?.min || 0,
          max: item.expectedPriceRange?.max || 0,
        }}
        status={item.status as any}
        bidCount={item.bidCount || 0}
        onPress={() => router.push(`/bookings/${item.id}`)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings?.data || []}
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
    backgroundColor: RodistaaColors.background.default,
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
