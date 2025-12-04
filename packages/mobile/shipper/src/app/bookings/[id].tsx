/**
 * Booking Details Screen
 * View booking details and bids, accept bids - Uses design system components
 */

import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RLoader, RCard, RButton, LoadCard, BidCard } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
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
                { text: 'OK', onPress: () => router.push('/(tabs)/bookings') },
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
    return <RLoader />;
  }

  if (!booking) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Booking not found</Text>
      </View>
    );
  }

  // Parse addresses for LoadCard
  const parseAddress = (address: string) => {
    const parts = address.split(',').map((p) => p.trim());
    return {
      address: parts[0] || '',
      city: parts[1] || '',
      state: parts[2] || '',
    };
  };

  const pickup = parseAddress(booking.pickupAddress || '');
  const drop = parseAddress(booking.dropAddress || '');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LoadCard
        id={booking.id}
        pickup={pickup}
        drop={drop}
        tonnage={booking.weightTons || 0}
        priceRange={{
          min: booking.expectedPriceRange?.min || 0,
          max: booking.expectedPriceRange?.max || 0,
        }}
        status={booking.status as any}
        bidCount={bids?.data?.length || 0}
      />

      <RCard style={styles.bidsSection}>
        <Text style={styles.sectionTitle}>Bids ({bids?.data?.length || 0})</Text>
        {bids?.data && bids.data.length > 0 ? (
          bids.data.map((bid: any) => (
            <BidCard
              key={bid.id}
              id={bid.id}
              bookingId={booking.id}
              amount={bid.amount}
              operatorName={bid.operatorName || 'Anonymous'}
              operatorPhone={bid.operatorPhone}
              status={bid.status || 'PENDING'}
              submittedAt={bid.submittedAt || new Date().toISOString()}
              canAccept={bid.status === 'PENDING'}
              onAccept={() => handleAcceptBid(bid.id)}
            />
          ))
        ) : (
          <View style={styles.emptyBids}>
            <Text style={styles.emptyText}>No bids yet</Text>
            <Text style={styles.emptySubtext}>Bids will appear here when operators submit them</Text>
          </View>
        )}
      </RCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  content: {
    padding: RodistaaSpacing.lg,
  },
  bidsSection: {
    marginTop: RodistaaSpacing.lg,
  },
  sectionTitle: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.md,
  },
  emptyBids: {
    alignItems: 'center',
    padding: RodistaaSpacing.xl,
  },
  emptyText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  emptySubtext: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.disabled,
  },
  errorText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.error.main,
    textAlign: 'center',
    padding: RodistaaSpacing.xl,
  },
});
