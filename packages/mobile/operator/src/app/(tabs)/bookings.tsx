/**
 * Bookings List Screen for Operator App
 */

import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Card, LoadingSpinner } from '@rodistaa/mobile-shared';
import { useGetBookings } from '@rodistaa/mobile-shared';
import { Ionicons } from '@expo/vector-icons';

export default function BookingsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { data: bookings, isLoading, refetch } = useGetBookings({ status: 'open' });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderBooking = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => router.push(`/bookings/${item.id}/bid`)} activeOpacity={0.7}>
      <Card style={styles.bookingCard}>
        <Text style={styles.route}>{item.pickupAddress} → {item.dropAddress}</Text>
        <Text style={styles.material}>{item.weightTons} tons • {item.materialType}</Text>
        <Text style={styles.priceRange}>
          ₹{item.expectedPriceRange?.min} - ₹{item.expectedPriceRange?.max}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings || []}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>No open bookings</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  list: { padding: 16 },
  bookingCard: { padding: 16, marginBottom: 12 },
  route: { fontSize: 16, fontFamily: 'Times New Roman', fontWeight: '600', color: '#000000', marginBottom: 4 },
  material: { fontSize: 14, fontFamily: 'Times New Roman', color: '#666666', marginBottom: 8 },
  priceRange: { fontSize: 14, fontFamily: 'Times New Roman', fontWeight: '600', color: '#C90D0D' },
  emptyContainer: { alignItems: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 18, fontFamily: 'Times New Roman', color: '#666666', marginTop: 16 },
});

