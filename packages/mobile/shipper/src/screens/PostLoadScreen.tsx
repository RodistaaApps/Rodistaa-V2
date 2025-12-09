/**
 * Post Load Screen - Create New Booking
 * Pure React Native CLI component
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { RCard } from '@rodistaa/design-system';
import { apiClient } from '@rodistaa/mobile-shared';
import { useTranslation } from '@rodistaa/mobile-shared';

export interface PostLoadScreenProps {
  navigation: any;
}

export const PostLoadScreen: React.FC<PostLoadScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pickupAddress: '',
    pickupCity: '',
    pickupState: '',
    pickupPincode: '',
    dropAddress: '',
    dropCity: '',
    dropState: '',
    dropPincode: '',
    material: '',
    weight: '',
    expectedPrice: '',
    pickupDate: '',
    specialRequirements: '',
  });

  const handleSubmit = async () => {
    // Validation
    if (!formData.pickupCity || !formData.dropCity || !formData.material || !formData.weight) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/bookings', {
        pickup: {
          address: formData.pickupAddress,
          city: formData.pickupCity,
          state: formData.pickupState,
          pincode: formData.pickupPincode,
        },
        drop: {
          address: formData.dropAddress,
          city: formData.dropCity,
          state: formData.dropState,
          pincode: formData.dropPincode,
        },
        material: formData.material,
        tonnage: parseFloat(formData.weight),
        priceRange: {
          min: parseFloat(formData.expectedPrice) * 0.9,
          max: parseFloat(formData.expectedPrice) * 1.1,
        },
        pickupDate: formData.pickupDate,
        specialRequirements: formData.specialRequirements,
      });

      Alert.alert('Success', 'Load posted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to post load. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Post New Load</Text>
      </View>

      <RCard style={styles.card}>
        <Text style={styles.sectionLabel}>Pickup Location</Text>
        
        <Text style={styles.inputLabel}>City *</Text>
        <TextInput
          style={styles.input}
          value={formData.pickupCity}
          onChangeText={(text) => setFormData({ ...formData, pickupCity: text })}
          placeholder="Enter pickup city"
          placeholderTextColor={RodistaaColors.text.disabled}
          accessibilityLabel="Pickup city input"
        />

        <Text style={styles.inputLabel}>State *</Text>
        <TextInput
          style={styles.input}
          value={formData.pickupState}
          onChangeText={(text) => setFormData({ ...formData, pickupState: text })}
          placeholder="Enter pickup state"
          placeholderTextColor={RodistaaColors.text.disabled}
          accessibilityLabel="Pickup state input"
        />

        <Text style={styles.inputLabel}>Address</Text>
        <TextInput
          style={styles.input}
          value={formData.pickupAddress}
          onChangeText={(text) => setFormData({ ...formData, pickupAddress: text })}
          placeholder="Enter full address"
          placeholderTextColor={RodistaaColors.text.disabled}
          multiline
          accessibilityLabel="Pickup address input"
        />

        <Text style={styles.inputLabel}>Pincode</Text>
        <TextInput
          style={styles.input}
          value={formData.pickupPincode}
          onChangeText={(text) => setFormData({ ...formData, pickupPincode: text })}
          placeholder="Enter pincode"
          placeholderTextColor={RodistaaColors.text.disabled}
          keyboardType="number-pad"
          maxLength={6}
          accessibilityLabel="Pickup pincode input"
        />
      </RCard>

      <RCard style={styles.card}>
        <Text style={styles.sectionLabel}>Drop Location</Text>
        
        <Text style={styles.inputLabel}>City *</Text>
        <TextInput
          style={styles.input}
          value={formData.dropCity}
          onChangeText={(text) => setFormData({ ...formData, dropCity: text })}
          placeholder="Enter drop city"
          placeholderTextColor={RodistaaColors.text.disabled}
          accessibilityLabel="Drop city input"
        />

        <Text style={styles.inputLabel}>State *</Text>
        <TextInput
          style={styles.input}
          value={formData.dropState}
          onChangeText={(text) => setFormData({ ...formData, dropState: text })}
          placeholder="Enter drop state"
          placeholderTextColor={RodistaaColors.text.disabled}
          accessibilityLabel="Drop state input"
        />

        <Text style={styles.inputLabel}>Address</Text>
        <TextInput
          style={styles.input}
          value={formData.dropAddress}
          onChangeText={(text) => setFormData({ ...formData, dropAddress: text })}
          placeholder="Enter full address"
          placeholderTextColor={RodistaaColors.text.disabled}
          multiline
          accessibilityLabel="Drop address input"
        />
      </RCard>

      <RCard style={styles.card}>
        <Text style={styles.sectionLabel}>Load Details</Text>
        
        <Text style={styles.inputLabel}>Material Type *</Text>
        <TextInput
          style={styles.input}
          value={formData.material}
          onChangeText={(text) => setFormData({ ...formData, material: text })}
          placeholder="e.g., Electronics, Machinery, Textiles"
          placeholderTextColor={RodistaaColors.text.disabled}
          accessibilityLabel="Material type input"
        />

        <Text style={styles.inputLabel}>Weight (Tons) *</Text>
        <TextInput
          style={styles.input}
          value={formData.weight}
          onChangeText={(text) => setFormData({ ...formData, weight: text })}
          placeholder="Enter weight in tons"
          placeholderTextColor={RodistaaColors.text.disabled}
          keyboardType="decimal-pad"
          accessibilityLabel="Weight input"
        />

        <Text style={styles.inputLabel}>Expected Price (₹) *</Text>
        <TextInput
          style={styles.input}
          value={formData.expectedPrice}
          onChangeText={(text) => setFormData({ ...formData, expectedPrice: text })}
          placeholder="Enter expected price"
          placeholderTextColor={RodistaaColors.text.disabled}
          keyboardType="number-pad"
          accessibilityLabel="Expected price input"
        />

        <Text style={styles.inputLabel}>Pickup Date</Text>
        <TextInput
          style={styles.input}
          value={formData.pickupDate}
          onChangeText={(text) => setFormData({ ...formData, pickupDate: text })}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={RodistaaColors.text.disabled}
          accessibilityLabel="Pickup date input"
        />

        <Text style={styles.inputLabel}>Special Requirements</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.specialRequirements}
          onChangeText={(text) => setFormData({ ...formData, specialRequirements: text })}
          placeholder="Any special requirements or instructions"
          placeholderTextColor={RodistaaColors.text.disabled}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          accessibilityLabel="Special requirements input"
        />
      </RCard>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        accessibilityLabel="Submit load posting"
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Posting...' : 'Post Load'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  header: {
    backgroundColor: RodistaaColors.background.paper,
    padding: RodistaaSpacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },
  headerTitle: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.text.primary,
  },
  card: {
    margin: RodistaaSpacing.lg,
    padding: RodistaaSpacing.lg,
  },
  sectionLabel: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.lg,
  },
  inputLabel: {
    ...MobileTextStyles.bodySmall,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
    marginTop: RodistaaSpacing.md,
  },
  input: {
    ...MobileTextStyles.body,
    backgroundColor: RodistaaColors.background.default,
    borderRadius: RodistaaSpacing.borderRadius.md,
    padding: RodistaaSpacing.md,
    borderWidth: 1,
    borderColor: RodistaaColors.border.light,
    color: RodistaaColors.text.primary,
  },
  textArea: {
    height: 100,
    paddingTop: RodistaaSpacing.md,
  },
  submitButton: {
    backgroundColor: RodistaaColors.primary.main,
    margin: RodistaaSpacing.xl,
    paddingVertical: RodistaaSpacing.lg,
    borderRadius: RodistaaSpacing.borderRadius.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.primary.contrast,
  },
});

