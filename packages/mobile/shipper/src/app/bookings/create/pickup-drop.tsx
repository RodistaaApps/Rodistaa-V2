/**
 * Post Load - Step 1: Pickup & Drop
 */

import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BookingFlow } from '@rodistaa/design-system';
import { RodistaaColors } from '@rodistaa/design-system';
import { useState } from 'react';
import type { BookingData } from '@rodistaa/design-system';

export default function PickupDropScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<BookingData>>({});

  const handleNext = (data: Partial<BookingData>) => {
    setFormData({ ...formData, ...data });
    router.push('/bookings/create/material-weight');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <BookingFlow
        initialStep={0}
        initialData={formData}
        onStepComplete={handleNext}
        onCancel={handleCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
});

