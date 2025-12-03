/**
 * Rodistaa Operator App - Main Entry Point
 * Simplified without expo-router for reliability
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SecureStorage } from '@rodistaa/mobile-shared';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStorage.getToken();
      if (token) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('No saved token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOTP = () => {
    // Mock OTP request
    console.log('Requesting OTP for:', phone);
    setOtpSent(true);
  };

  const handleLogin = async () => {
    // Mock login
    console.log('Logging in with OTP:', otp);
    await SecureStorage.setToken('mock-token-' + Date.now());
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await SecureStorage.removeToken();
    setIsAuthenticated(false);
    setOtpSent(false);
    setPhone('');
    setOtp('');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#C90D0D" />
        <Text style={styles.loadingText}>Loading Rodistaa Operator...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Rodistaa Operator</Text>
        <Text style={styles.subtitle}>Fleet Management & Bidding</Text>

        {!otpSent ? (
          <View style={styles.form}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit mobile number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <TouchableOpacity
              style={[styles.button, !phone || phone.length < 10 ? styles.buttonDisabled : null]}
              onPress={handleRequestOTP}
              disabled={!phone || phone.length < 10}
            >
              <Text style={styles.buttonText}>Request OTP</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>Enter OTP</Text>
            <Text style={styles.hint}>Sent to {phone}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.button, !otp || otp.length < 6 ? styles.buttonDisabled : null]}
              onPress={handleLogin}
              disabled={!otp || otp.length < 6}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOtpSent(false)}>
              <Text style={styles.linkText}>Change phone number</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Operator Dashboard</Text>
      <Text style={styles.subtitle}>Welcome to Rodistaa!</Text>

      <View style={styles.dashboard}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fleet Management</Text>
          <Text style={styles.cardValue}>5 Trucks</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Bids</Text>
          <Text style={styles.cardValue}>12 Bids</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shipments</Text>
          <Text style={styles.cardValue}>8 Active</Text>
        </View>

        <TouchableOpacity style={[styles.button, { marginTop: 24 }]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C90D0D',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4F4F4F',
    marginBottom: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4F4F4F',
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#4F4F4F',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#C90D0D',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#D0D0D0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#C90D0D',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  dashboard: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    backgroundColor: '#F4F4F4',
    padding: 20,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#C90D0D',
  },
  cardTitle: {
    fontSize: 14,
    color: '#4F4F4F',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
});

