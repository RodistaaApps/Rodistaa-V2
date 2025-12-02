/**
 * Create Booking Screen
 * Post a new load/booking
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input, Card } from '@rodistaa/mobile-shared';
import { useCreateBooking } from '@rodistaa/mobile-shared';

export default function CreateBookingScreen() {
  const router = useRouter();
  const createBookingMutation = useCreateBooking();

  const [formData, setFormData] = useState({
    pickupAddress: '',
    dropAddress: '',
    pickupContact: '',
    dropContact: '',
    weightTons: '',
    materialType: '',
    expectedPriceMin: '',
    expectedPriceMax: '',
    pickupDate: '',
    specialInstructions: '',
  });

  const handleSubmit = async () => {
    // Validation
    if (!formData.pickupAddress || !formData.dropAddress) {
      Alert.alert('Error', 'Please enter pickup and drop addresses');
      return;
    }

    try {
      const booking = await createBookingMutation.mutateAsync({
        pickupAddress: formData.pickupAddress,
        dropAddress: formData.dropAddress,
        pickupContact: formData.pickupContact,
        dropContact: formData.dropContact,
        weightTons: parseFloat(formData.weightTons),
        materialType: formData.materialType,
        expectedPriceRange: {
          min: parseFloat(formData.expectedPriceMin),
          max: parseFloat(formData.expectedPriceMax),
        },
        pickupDate: formData.pickupDate,
        specialInstructions: formData.specialInstructions,
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.sectionTitle}>Pickup Details</Text>
        <Input
          label="Pickup Address"
          placeholder="Enter pickup address"
          value={formData.pickupAddress}
          onChangeText={(text) => setFormData({ ...formData, pickupAddress: text })}
        />
        <Input
          label="Pickup Contact"
          placeholder="Contact person phone"
          value={formData.pickupContact}
          onChangeText={(text) => setFormData({ ...formData, pickupContact: text })}
          keyboardType="phone-pad"
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Drop Details</Text>
        <Input
          label="Drop Address"
          placeholder="Enter drop address"
          value={formData.dropAddress}
          onChangeText={(text) => setFormData({ ...formData, dropAddress: text })}
        />
        <Input
          label="Drop Contact"
          placeholder="Contact person phone"
          value={formData.dropContact}
          onChangeText={(text) => setFormData({ ...formData, dropContact: text })}
          keyboardType="phone-pad"
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Load Details</Text>
        <Input
          label="Weight (Tons)"
          placeholder="Enter weight in tons"
          value={formData.weightTons}
          onChangeText={(text) => setFormData({ ...formData, weightTons: text })}
          keyboardType="decimal-pad"
        />
        <Input
          label="Material Type"
          placeholder="e.g., Electronics, Food, etc."
          value={formData.materialType}
          onChangeText={(text) => setFormData({ ...formData, materialType: text })}
        />
        <Input
          label="Expected Price Range (Min)"
          placeholder="Minimum expected price"
          value={formData.expectedPriceMin}
          onChangeText={(text) => setFormData({ ...formData, expectedPriceMin: text })}
          keyboardType="decimal-pad"
        />
        <Input
          label="Expected Price Range (Max)"
          placeholder="Maximum expected price"
          value={formData.expectedPriceMax}
          onChangeText={(text) => setFormData({ ...formData, expectedPriceMax: text })}
          keyboardType="decimal-pad"
        />
      </Card>

      <Button
        title="Create Booking"
        onPress={handleSubmit}
        loading={createBookingMutation.isPending}
        style={styles.submitButton}
      />
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
  submitButton: {
    marginTop: 24,
  },
});

