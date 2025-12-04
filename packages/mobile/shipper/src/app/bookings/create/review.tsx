/**
 * Post Load - Step 4: Review & Submit
 */

import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { RButton, RCard, LoadCard } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { useCreateBooking } from '@rodistaa/mobile-shared';

export default function ReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const createBookingMutation = useCreateBooking();

  const handleSubmit = async () => {
    try {
      const booking = await createBookingMutation.mutateAsync({
        pickupAddress: `${params.pickupAddress}, ${params.pickupCity}, ${params.pickupState} ${params.pickupPincode}`,
        dropAddress: `${params.dropAddress}, ${params.dropCity}, ${params.dropState} ${params.dropPincode}`,
        weightTons: parseFloat(params.weightTons as string),
        materialType: params.materialType as string,
        expectedPriceRange: {
          min: parseFloat(params.priceMin as string),
          max: parseFloat(params.priceMax as string),
        },
        specialInstructions: params.specialInstructions as string,
      });

      Alert.alert('Success', 'Booking created successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace(`/bookings/${booking.id}`),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create booking');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <RCard style={styles.card}>
        <LoadCard
          id="PREVIEW"
          pickup={{
            address: params.pickupAddress as string,
            city: params.pickupCity as string,
            state: params.pickupState as string,
          }}
          drop={{
            address: params.dropAddress as string,
            city: params.dropCity as string,
            state: params.dropState as string,
          }}
          tonnage={parseFloat(params.weightTons as string)}
          priceRange={{
            min: parseFloat(params.priceMin as string),
            max: parseFloat(params.priceMax as string),
          }}
          status="DRAFT"
        />
      </RCard>

      <RButton
        title="Submit Booking"
        variant="primary"
        onPress={handleSubmit}
        loading={createBookingMutation.isPending}
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
    marginBottom: RodistaaSpacing.lg,
  },
  button: {
    marginTop: RodistaaSpacing.md,
  },
});

