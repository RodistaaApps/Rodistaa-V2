/**
 * Truck Onboard Form
 * Mobile-first onboarding form for truck registration
 */

import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Text } from 'react-native';
import { RInput, RButton, RCard } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

interface TruckOnboardFormProps {
  operatorId: string;
  onSubmit: (data: OnboardData) => Promise<void>;
  onCancel?: () => void;
}

interface OnboardData {
  rc_number: string;
  nickname?: string;
  rc_copy?: string; // Base64 encoded
  is_tractor?: boolean;
  is_trailer?: boolean;
  legal_authorization_accepted: boolean;
  authorization_declaration?: string;
}

export function TruckOnboardForm({ operatorId, onSubmit, onCancel }: TruckOnboardFormProps) {
  const [formData, setFormData] = useState<OnboardData>({
    rc_number: '',
    legal_authorization_accepted: false,
  });
  const [rcCopyUri, setRcCopyUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateRC = (rc: string): boolean => {
    // Basic RC format validation (state code + district + series + number)
    if (rc.length < 10) return false;
    const rcPattern = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i;
    return rcPattern.test(rc);
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setRcCopyUri(result.assets[0].uri);
        
        // Convert to base64 (simplified - in production use proper file reading)
        // This is a placeholder - actual implementation would read file and encode
        setFormData({ ...formData, rc_copy: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSubmit = async () => {
    // Validate
    const newErrors: Record<string, string> = {};
    
    if (!formData.rc_number || !validateRC(formData.rc_number)) {
      newErrors.rc_number = 'Please enter a valid RC number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      Alert.alert(
        'Success',
        'Truck onboarded successfully. Verification will be completed within 24 hours.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to onboard truck');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <RCard style={styles.card}>
        <Text style={styles.title}>Onboard New Truck</Text>
        <Text style={styles.subtitle}>Enter truck details. Verification will be completed within 24 hours.</Text>
      </RCard>

      <RInput
        label="RC Number *"
        placeholder="e.g., KA01AB1234"
        value={formData.rc_number}
        onChangeText={(text) => {
          setFormData({ ...formData, rc_number: text.toUpperCase() });
          if (errors.rc_number) {
            setErrors({ ...errors, rc_number: '' });
          }
        }}
        error={errors.rc_number}
        autoCapitalize="characters"
      />

      <RInput
        label="Nickname (Optional)"
        placeholder="e.g., My Primary Truck"
        value={formData.nickname || ''}
        onChangeText={(text) => setFormData({ ...formData, nickname: text })}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Type</Text>
        <RButton
          title={formData.is_tractor ? 'Tractor ✓' : 'Mark as Tractor'}
          variant={formData.is_tractor ? 'primary' : 'secondary'}
          onPress={() => setFormData({ ...formData, is_tractor: !formData.is_tractor, is_trailer: false })}
          style={styles.typeButton}
        />
        <RButton
          title={formData.is_trailer ? 'Trailer ✓' : 'Mark as Trailer'}
          variant={formData.is_trailer ? 'primary' : 'secondary'}
          onPress={() => setFormData({ ...formData, is_trailer: !formData.is_trailer, is_tractor: false })}
          style={styles.typeButton}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>RC Copy Upload</Text>
        <RButton
          title={rcCopyUri ? 'Change RC Copy' : 'Upload RC Copy'}
          variant="secondary"
          onPress={handlePickDocument}
          style={styles.uploadButton}
        />
        {rcCopyUri && (
          <Text style={styles.uploadStatus}>✓ RC copy uploaded</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.infoText}>
          By submitting, you confirm that you are the authorized operator of this vehicle
          and have legal authorization to use it for commercial transport.
        </Text>
      </View>

      <RButton
        title="Submit for Verification"
        variant="primary"
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={!formData.rc_number || isSubmitting}
        style={styles.submitButton}
      />

      {onCancel && (
        <RButton
          title="Cancel"
          variant="text"
          onPress={onCancel}
          style={styles.cancelButton}
        />
      )}
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
    padding: RodistaaSpacing.lg,
  },
  title: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  subtitle: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  section: {
    marginBottom: RodistaaSpacing.lg,
  },
  sectionTitle: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.md,
  },
  typeButton: {
    marginBottom: RodistaaSpacing.sm,
  },
  uploadButton: {
    marginBottom: RodistaaSpacing.xs,
  },
  uploadStatus: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.success.main,
    marginTop: RodistaaSpacing.xs,
  },
  infoText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    fontStyle: 'italic',
  },
  submitButton: {
    marginTop: RodistaaSpacing.xl,
  },
  cancelButton: {
    marginTop: RodistaaSpacing.md,
  },
});

