/**
 * Complete Shipment Screen
 * Driver completes delivery with OTP verification
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card, Button, Input } from '@rodistaa/mobile-shared';

export default function CompleteShipmentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter valid 6-digit OTP from shipper');
      return;
    }

    setCompleting(true);
    try {
      // API call: await completeShipment(id, otp);
      Alert.alert(
        'Success',
        'Shipment completed successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)/home');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid OTP or completion failed');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Complete Delivery</Text>
        <Text style={styles.subtitle}>Shipment: {id}</Text>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Completion Steps:</Text>
          <Text style={styles.instructionText}>1. Ensure POD has been uploaded</Text>
          <Text style={styles.instructionText}>2. Get OTP from shipper/receiver</Text>
          <Text style={styles.instructionText}>3. Enter OTP below to complete</Text>
        </View>

        <Input
          label="Shipper OTP *"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
        />

        <Text style={styles.note}>
          ⚠️ The OTP was sent to the shipper's registered mobile number. Ask them to share it with you.
        </Text>

        <Button
          title="Complete Shipment"
          onPress={handleComplete}
          loading={completing}
          style={styles.completeButton}
        />

        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
          style={styles.cancelButton}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  card: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
    marginBottom: 24,
  },
  instructions: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  instructionTitle: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
    marginBottom: 6,
  },
  note: {
    fontSize: 12,
    fontFamily: 'Times New Roman',
    color: '#FF9800',
    fontStyle: 'italic',
    marginTop: 12,
    marginBottom: 24,
  },
  completeButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginTop: 8,
  },
});

