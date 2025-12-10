/**
 * Create Booking Screen
 * Post a new load/booking - Uses BookingFlow component
 */

import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { BookingFlow, BookingData } from '@rodistaa/design-system';
import { useCreateBooking } from '@rodistaa/mobile-shared';

export default function CreateBookingScreen() {
  const router = useRouter();
  const createBookingMutation = useCreateBooking();

  const handleComplete = async (data: BookingData) => {
    try {
      const booking = await createBookingMutation.mutateAsync({
        pickupAddress: `${data.pickup.address}, ${data.pickup.city}, ${data.pickup.state} ${data.pickup.pincode}`,
        dropAddress: `${data.drop.address}, ${data.drop.city}, ${data.drop.state} ${data.drop.pincode}`,
        weightTons: data.goods.tonnage,
        materialType: data.goods.type,
        expectedPriceRange: {
          min: data.priceRange.min,
          max: data.priceRange.max,
        },
        specialInstructions: data.goods.description || '',
      });

      Alert.alert('Success', 'Booking created successfully!', [
        {
          text: 'OK',
          onPress: () => router.push(`/bookings/${booking.id}`),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create booking');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <BookingFlow onComplete={handleComplete} onCancel={handleCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

