/**
 * Post Load - Step 3: Price Suggestion
 */

import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { RInput, RButton, RCard } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { useState } from 'react';

export default function PriceSuggestionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [formData, setFormData] = useState({
    priceMin: params.priceMin?.toString() || '',
    priceMax: params.priceMax?.toString() || '',
  });

  const handleNext = () => {
    router.push({
      pathname: '/bookings/create/review',
      params: { ...params, ...formData },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <RCard style={styles.card}>
        <RInput
          label="Expected Price Range (Min)"
          placeholder="Minimum expected price"
          value={formData.priceMin}
          onChangeText={(text) => setFormData({ ...formData, priceMin: text })}
          keyboardType="decimal-pad"
        />
        
        <RInput
          label="Expected Price Range (Max)"
          placeholder="Maximum expected price"
          value={formData.priceMax}
          onChangeText={(text) => setFormData({ ...formData, priceMax: text })}
          keyboardType="decimal-pad"
        />
      </RCard>

      <RButton
        title="Next: Review"
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

