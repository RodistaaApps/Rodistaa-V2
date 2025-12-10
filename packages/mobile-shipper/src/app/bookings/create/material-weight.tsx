/**
 * Post Load - Step 2: Material & Weight
 */

import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { RInput, RButton, RCard } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { useState } from 'react';

export default function MaterialWeightScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [formData, setFormData] = useState({
    materialType: '',
    weightTons: '',
    specialInstructions: '',
  });

  const handleNext = () => {
    router.push({
      pathname: '/bookings/create/price-suggestion',
      params: { ...params, ...formData },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <RCard style={styles.card}>
        <RInput
          label="Material Type"
          placeholder="e.g., Electronics, Food, etc."
          value={formData.materialType}
          onChangeText={(text) => setFormData({ ...formData, materialType: text })}
        />
        
        <RInput
          label="Weight (Tons)"
          placeholder="Enter weight in tons"
          value={formData.weightTons}
          onChangeText={(text) => setFormData({ ...formData, weightTons: text })}
          keyboardType="decimal-pad"
        />
        
        <RInput
          label="Special Instructions"
          placeholder="Any special handling requirements..."
          value={formData.specialInstructions}
          onChangeText={(text) => setFormData({ ...formData, specialInstructions: text })}
          multiline
          numberOfLines={4}
        />
      </RCard>

      <RButton
        title="Next: Price Suggestion"
        variant="primary"
        onPress={handleNext}
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

