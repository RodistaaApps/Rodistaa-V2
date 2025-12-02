/**
 * Driver Login Screen
 * OTP-based authentication for drivers
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input, useLogin, SecureStorage, apiClient } from '@rodistaa/mobile-shared';

export default function DriverLoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const loginMutation = useLogin();

  const handleSendOtp = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setStep('otp');
    Alert.alert('OTP Sent', 'Mock OTP: 123456');
  };

  const handleLogin = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const deviceId = await SecureStorage.getDeviceId();
      const result = await loginMutation.mutateAsync({
        phone,
        otp,
        deviceId: deviceId || 'unknown',
      });

      await SecureStorage.setToken(result.accessToken);
      await SecureStorage.setRefreshToken(result.refreshToken);
      await SecureStorage.setUserData(result.user);

      apiClient.setAuthToken(result.accessToken);
      if (deviceId) {
        apiClient.setDeviceId(deviceId);
      }

      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid OTP');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Rodistaa</Text>
          <Text style={styles.subtitle}>Driver App</Text>
        </View>

        {step === 'phone' ? (
          <View style={styles.form}>
            <Input
              label="Phone Number"
              placeholder="Enter 10-digit phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <Button
              title="Send OTP"
              onPress={handleSendOtp}
              loading={loginMutation.isPending}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.otpLabel}>Enter OTP sent to {phone}</Text>
            <Input
              label="OTP"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
            <Button
              title="Login"
              onPress={handleLogin}
              loading={loginMutation.isPending}
            />
            <Button
              title="Change Phone Number"
              onPress={() => {
                setStep('phone');
                setOtp('');
              }}
              variant="outline"
              style={styles.changePhoneButton}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 36,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#C90D0D',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Times New Roman',
    color: '#666666',
  },
  form: {
    width: '100%',
  },
  otpLabel: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
    marginBottom: 16,
    textAlign: 'center',
  },
  changePhoneButton: {
    marginTop: 16,
  },
});

