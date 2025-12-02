/**
 * Booking Details Screen
 * View booking details and bids, accept bids
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Button, LoadingSpinner } from '@rodistaa/mobile-shared';
import { useGetBooking, useGetBids, useFinalizeBid } from '@rodistaa/mobile-shared';

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: booking, isLoading: bookingLoading } = useGetBooking(id);
  const { data: bids, isLoading: bidsLoading } = useGetBids(id);
  const finalizeMutation = useFinalizeBid();

  const handleAcceptBid = async (bidId: string) => {
    Alert.alert(
      'Accept Bid',
      'Are you sure you want to accept this bid? This will finalize the booking.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await finalizeMutation.mutateAsync(bidId);
              Alert.alert('Success', 'Bid accepted! Shipment will be created.', [
                { text: 'OK', onPress: () => router.push('/(tabs)/shipments') },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to accept bid');
            }
          },
        },
      ]
    );
  };

  if (bookingLoading || bidsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.sectionTitle}>Booking Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Pickup:</Text>
          <Text style={styles.value}>{booking?.pickupAddress}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Drop:</Text>
          <Text style={styles.value}>{booking?.dropAddress}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Weight:</Text>
          <Text style={styles.value}>{booking?.weightTons} tons</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, styles.status]}>{booking?.status}</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Bids ({bids?.data?.length || 0})</Text>
        {bids?.data && bids.data.length > 0 ? (
          bids.data.map((bid: any) => (
            <View key={bid.id} style={styles.bidItem}>
              <View style={styles.bidHeader}>
                <Text style={styles.bidOperator}>
                  Operator: {bid.operatorName || 'Anonymous'}
                </Text>
                <Text style={styles.bidAmount}>₹{bid.amount}</Text>
              </View>
              <Text style={styles.bidTruck}>
                Truck: {bid.truckType} - {bid.truckCapacity} tons
              </Text>
              {bid.status === 'pending' && (
                <Button
                  title="Accept Bid"
                  onPress={() => handleAcceptBid(bid.id)}
                  style={styles.acceptButton}
                  loading={finalizeMutation.isPending}
                />
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noBids}>No bids yet</Text>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  card: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Times New Roman',
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
    width: 80,
  },
  value: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#333333',
    flex: 1,
  },
  status: {
    color: '#C90D0D',
    fontWeight: '600',
  },
  bidItem: {
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 12,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bidOperator: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#333333',
  },
  bidAmount: {
    fontSize: 18,
    fontFamily: 'Times New Roman',
    fontWeight: '600',
    color: '#C90D0D',
  },
  bidTruck: {
    fontSize: 12,
    fontFamily: 'Times New Roman',
    color: '#666666',
    marginBottom: 12,
  },
  acceptButton: {
    marginTop: 8,
  },
  noBids: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#999999',
    textAlign: 'center',
    padding: 24,
  },
});

