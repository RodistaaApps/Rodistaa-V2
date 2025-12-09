/**
 * Bid Submission Modal/Flow
 * Submit or modify bid for a booking
 */

import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RInput, RButton, RCard, LoadCard } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { useGetBooking, useSubmitBid, guardOperatorBidRoute } from '@rodistaa/mobile-shared';
import { useState, useEffect } from 'react';
import { checkActiveBid } from '@rodistaa/mobile-shared';

export default function BidModalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: booking } = useGetBooking(id);
  const submitBidMutation = useSubmitBid();
  const [formData, setFormData] = useState({
    amount: '',
    notes: '',
  });
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    checkBidEligibility();
  }, [booking]);

  async function checkBidEligibility() {
    // Check if operator already has active bid
    const hasActiveBid = false; // TODO: Fetch from API
    const result = checkActiveBid(hasActiveBid);
    setCanSubmit(result.allowed);
    
    if (!result.allowed) {
      Alert.alert('Cannot Submit Bid', result.reason || 'You already have an active bid for this booking');
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      await submitBidMutation.mutateAsync({
        bookingId: id,
        amount: parseFloat(formData.amount),
        notes: formData.notes,
      });
      
      Alert.alert('Success', 'Bid submitted successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit bid');
    }
  };

  if (!booking) {
    return <View style={styles.container} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LoadCard
        id={booking.id}
        pickup={{ address: booking.pickupAddress, city: '', state: '' }}
        drop={{ address: booking.dropAddress, city: '', state: '' }}
        tonnage={booking.weightTons || 0}
        priceRange={booking.expectedPriceRange || { min: 0, max: 0 }}
        status={booking.status as any}
      />

      <RCard style={styles.card}>
        <RInput
          label="Bid Amount (₹)"
          placeholder="Enter your bid amount"
          value={formData.amount}
          onChangeText={(text) => setFormData({ ...formData, amount: text })}
          keyboardType="decimal-pad"
        />
        
        <RInput
          label="Notes (Optional)"
          placeholder="Any additional information..."
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          multiline
          numberOfLines={3}
        />
      </RCard>

      <RButton
        title="Submit Bid"
        variant="primary"
        onPress={handleSubmit}
        disabled={!canSubmit || submitBidMutation.isPending}
        loading={submitBidMutation.isPending}
        style={styles.button}
      />
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
  card: {
    marginTop: RodistaaSpacing.lg,
  },
  button: {
    marginTop: RodistaaSpacing.md,
  },
});

