import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CompleteDeliveryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setCompleting(true);
    // Simulate API call
    setTimeout(() => {
      setCompleting(false);
      Alert.alert(
        'Success!',
        'Delivery completed successfully',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/home'),
          },
        ]
      );
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#27AE60" />
        </View>

        <Text style={styles.title}>Complete Delivery</Text>
        <Text style={styles.subtitle}>Shipment: {id}</Text>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#2E86DE" />
          <Text style={styles.infoText}>
            Enter the OTP provided by the receiver to complete this delivery
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Delivery OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />

          <TouchableOpacity
            style={[
              styles.completeButton,
              otp.length !== 6 && styles.completeButtonDisabled,
            ]}
            onPress={handleComplete}
            disabled={otp.length !== 6 || completing}
          >
            {completing ? (
              <Text style={styles.completeButtonText}>Completing...</Text>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                <Text style={styles.completeButtonText}>Complete Delivery</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Note:</Text>
          <Text style={styles.noteText}>
            • Ensure all items have been delivered
          </Text>
          <Text style={styles.noteText}>
            • POD should be uploaded before completion
          </Text>
          <Text style={styles.noteText}>
            • OTP is valid for 10 minutes
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4F4F4F',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4F4F4F',
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C90D0D',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 16,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    padding: 18,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonDisabled: {
    backgroundColor: '#D0D0D0',
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  noteCard: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#4F4F4F',
    marginBottom: 4,
  },
});
