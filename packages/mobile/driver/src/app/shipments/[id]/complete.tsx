/**
 * Complete Delivery - OTP Verification
 * Final step: Enter OTP to complete delivery
 */

import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RInput, RButton, RCard } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { useCompleteDelivery, useGetShipment } from '@rodistaa/mobile-shared';
import { useState } from 'react';
import { stopGPSWorker } from '@rodistaa/mobile-shared';

export default function CompleteDeliveryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: shipment } = useGetShipment(id);
  const completeMutation = useCompleteDelivery();
  const [otp, setOtp] = useState('');

  const handleComplete = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await completeMutation.mutateAsync({
        shipmentId: id,
        otp,
      });

      // Stop GPS worker
      await stopGPSWorker();

      Alert.alert('Success', 'Delivery completed successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/shipments'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete delivery');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <RCard style={styles.card}>
        <Text style={styles.title}>Complete Delivery</Text>
        <Text style={styles.subtitle}>
          Enter the OTP received from the consignee to complete the delivery
        </Text>
      </RCard>

      <RInput
        label="OTP"
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        style={styles.input}
      />

      <RButton
        title="Complete Delivery"
        variant="primary"
        onPress={handleComplete}
        loading={completeMutation.isPending}
        disabled={otp.length !== 6}
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
    padding: RodistaaSpacing.lg,
  },
  title: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  subtitle: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.secondary,
  },
  input: {
    marginBottom: RodistaaSpacing.lg,
  },
  button: {
    marginTop: RodistaaSpacing.md,
  },
});
