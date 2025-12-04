import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function App() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'login' | 'otp' | 'dashboard'>('login');

  const handleRequestOTP = () => {
    console.log('OTP requested for:', phone);
    setStep('otp');
  };

  const handleLogin = () => {
    console.log('Logged in with OTP:', otp);
    setStep('dashboard');
  };

  const handleLogout = () => {
    setPhone('');
    setOtp('');
    setStep('login');
  };

  if (step === 'login') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Rodistaa Operator</Text>
        <Text style={styles.subtitle}>Fleet Management System</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 10-digit number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
          />
          <TouchableOpacity
            style={[styles.button, phone.length !== 10 && styles.buttonDisabled]}
            onPress={handleRequestOTP}
            disabled={phone.length !== 10}
          >
            <Text style={styles.buttonText}>Request OTP</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'otp') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>Sent to {phone}</Text>

        <View style={styles.form}>
          <Text style={styles.label}>OTP Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
          <TouchableOpacity
            style={[styles.button, otp.length !== 6 && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={otp.length !== 6}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep('login')} style={styles.linkButton}>
            <Text style={styles.linkText}>Change phone number</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Operator Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, Operator!</Text>

        <View style={styles.dashboard}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Fleet Management</Text>
            <Text style={styles.cardValue}>5 Trucks</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Active Bids</Text>
            <Text style={styles.cardValue}>12 Bids</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Active Shipments</Text>
            <Text style={styles.cardValue}>8 Shipments</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Pending Inspections</Text>
            <Text style={styles.cardValue}>3 Trucks</Text>
          </View>

          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#C90D0D',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#4F4F4F',
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#C90D0D',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#C90D0D',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#D0D0D0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 10,
  },
  linkText: {
    color: '#C90D0D',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  dashboard: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    backgroundColor: '#F4F4F4',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 6,
    borderLeftColor: '#C90D0D',
  },
  cardLabel: {
    fontSize: 14,
    color: '#4F4F4F',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#4F4F4F',
  },
});
