/**
 * Login Screen - Operator App
 * Pure React Native CLI with Rodistaa Design System
 * Follows UI/UX specifications from design system
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
// Import tokens directly from design system (components excluded from web build)
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system/tokens';
import { SecureStore } from '../utils/storage.web';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestOTP = async () => {
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // TODO: Call API to request OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep('otp');
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // TODO: Call API to verify OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockToken = 'mock-jwt-token-12345';
      await SecureStore.setItemAsync('authToken', mockToken);
      await SecureStore.setItemAsync('userRole', 'operator');
      
      navigation.replace('Main');
    } catch (error) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Logo Section - Rodistaa Branding */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🚛</Text>
            <Text style={styles.appName}>Rodistaa</Text>
            <Text style={styles.tagline}>Operator</Text>
            <Text style={styles.subTagline}>Manage your fleet & shipments</Text>
          </View>

          {step === 'phone' ? (
            /* Phone Number Step */
            <View style={styles.formContainer}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.phoneInput}>
                <Text style={styles.prefix}>+91</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor={RodistaaColors.text.disabled}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    setError(null);
                  }}
                  editable={!loading}
                  accessibilityLabel="Mobile number input"
                />
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRequestOTP}
                disabled={loading}
                accessibilityLabel="Request OTP button"
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={RodistaaColors.primary.contrast} />
                ) : (
                  <Text style={styles.buttonText}>Request OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* OTP Verification Step */
            <View style={styles.formContainer}>
              <Text style={styles.label}>Enter OTP</Text>
              <Text style={styles.subtitle}>Sent to +91 {phone}</Text>
              
              <TextInput
                style={styles.otpInput}
                placeholder="000000"
                placeholderTextColor={RodistaaColors.text.disabled}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={(text) => {
                  setOtp(text);
                  setError(null);
                }}
                editable={!loading}
                textAlign="center"
                accessibilityLabel="OTP input"
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyOTP}
                disabled={loading}
                accessibilityLabel="Verify OTP button"
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={RodistaaColors.primary.contrast} />
                ) : (
                  <Text style={styles.buttonText}>Verify & Login</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setStep('phone');
                  setError(null);
                }}
                disabled={loading}
                accessibilityLabel="Change phone number"
                activeOpacity={0.7}
              >
                <Text style={styles.backButtonText}>← Change Number</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Rodistaa Trade & Transport © 2025
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
    width: '100%',
    minHeight: '100vh',
    ...(Platform.OS === 'web' ? { display: 'flex' } : {}),
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: RodistaaSpacing.lg, // 16px - follows spacing scale (not 32px)
    minHeight: '100vh',
    width: '100%',
    ...(Platform.OS === 'web' ? { display: 'flex', flexDirection: 'column' } : {}),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: RodistaaSpacing.xxl, // 32px - follows spacing scale (reduced from 64px)
    width: '100%',
  },
  logoEmoji: {
    fontSize: 64, // Reduced from 80 for better proportion
    marginBottom: RodistaaSpacing.xl, // 24px - follows spacing scale
  },
  appName: {
    ...MobileTextStyles.h1, // Baloo Bhai, 32px - for main heading
    color: RodistaaColors.primary.main, // Rodistaa Red #C90D0D
    marginBottom: RodistaaSpacing.xs, // 4px - follows spacing scale
    textAlign: 'center',
  },
  tagline: {
    ...MobileTextStyles.h3, // Baloo Bhai, 20px - for subtitle
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs, // 4px - follows spacing scale
    textAlign: 'center',
    fontWeight: '600',
  },
  subTagline: {
    ...MobileTextStyles.bodySmall, // Times New Roman, 12px - for body text
    color: RodistaaColors.text.secondary,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: RodistaaSpacing.md, // 12px - follows spacing scale
  },
  label: {
    ...MobileTextStyles.body, // Times New Roman, 14px
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.sm, // 8px
  },
  subtitle: {
    ...MobileTextStyles.bodySmall, // Times New Roman, 12px
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.lg, // 16px
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.lg, // 8px - follows spacing scale
    borderWidth: 1,
    borderColor: RodistaaColors.border.light,
    marginBottom: RodistaaSpacing.lg, // 16px - follows spacing scale
    paddingHorizontal: RodistaaSpacing.lg, // 16px - follows spacing scale
    height: 48, // Minimum touch target (44px+) - follows design system
  },
  prefix: {
    ...MobileTextStyles.body, // Times New Roman
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginRight: RodistaaSpacing.sm, // 8px
  },
  input: {
    flex: 1,
    ...MobileTextStyles.body, // Times New Roman, 14px
    color: RodistaaColors.text.primary,
    paddingVertical: RodistaaSpacing.md, // 12px
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  otpInput: {
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.lg, // 8px - follows spacing scale
    borderWidth: 1,
    borderColor: RodistaaColors.border.light,
    height: 64,
    ...MobileTextStyles.h2, // Larger font for OTP (24px Baloo Bhai)
    fontWeight: 'bold',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.lg, // 16px - follows spacing scale
    letterSpacing: 8,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  button: {
    backgroundColor: RodistaaColors.primary.main, // Rodistaa Red #C90D0D
    borderRadius: RodistaaSpacing.borderRadius.lg, // 8px - follows spacing scale
    height: 48, // Minimum touch target (44px+) - follows design system
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: RodistaaSpacing.md, // 12px - follows spacing scale
    marginBottom: RodistaaSpacing.md, // 12px - follows spacing scale
    paddingHorizontal: RodistaaSpacing.xl, // 24px - follows spacing scale
    // Shadow follows design system spec: 0 2px 4px rgba(0,0,0,0.08)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...MobileTextStyles.button, // Baloo Bhai for button text
    color: RodistaaColors.primary.contrast, // White
  },
  backButton: {
    alignItems: 'center',
    padding: RodistaaSpacing.md, // 12px
    minHeight: 44, // Touch target
  },
  backButtonText: {
    ...MobileTextStyles.bodySmall, // Times New Roman, 12px
    color: RodistaaColors.text.secondary,
  },
  errorText: {
    ...MobileTextStyles.bodySmall, // Times New Roman
    color: RodistaaColors.error.main, // Error red
    marginBottom: RodistaaSpacing.md, // 12px
  },
  footer: {
    padding: RodistaaSpacing.xl, // 32px
    alignItems: 'center',
    marginTop: RodistaaSpacing.xl, // 32px
  },
  footerText: {
    ...MobileTextStyles.caption, // Times New Roman, 10px
    color: RodistaaColors.text.disabled,
  },
});

