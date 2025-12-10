/**
 * Login Screen - Mobile OTP Flow
 * Pure React Native CLI component
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
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { useTranslation } from '../i18n';
import { apiClient } from '../api/client';

export interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
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
      await apiClient.post('/auth/request-otp', { phone });
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
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
      const response = await apiClient.post<{ token: string; user: any }>('/auth/verify-otp', {
        phone,
        otp,
      });

      // Store token
      apiClient.setAuthToken(response.token);
      
      // Navigate to main app
      navigation.replace('Main');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🚛</Text>
            <Text style={styles.appName}>Rodistaa</Text>
            <Text style={styles.tagline}>Trade & Transport</Text>
          </View>

          {step === 'phone' ? (
            <View style={styles.formContainer}>
              <Text style={styles.label}>{t('auth.phoneNumber')}</Text>
              <View style={styles.phoneInput}>
                <Text style={styles.prefix}>+91</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.enterPhone')}
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
              >
                {loading ? (
                  <ActivityIndicator color={RodistaaColors.primary.contrast} />
                ) : (
                  <Text style={styles.buttonText}>{t('auth.requestOTP')}</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.label}>{t('auth.enterOTP')}</Text>
              <Text style={styles.subtitle}>
                {t('auth.otpSent')} +91 {phone}
              </Text>

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
              >
                {loading ? (
                  <ActivityIndicator color={RodistaaColors.primary.contrast} />
                ) : (
                  <Text style={styles.buttonText}>{t('auth.verifyOTP')}</Text>
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
              >
                <Text style={styles.backButtonText}>← {t('common.back')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Rodistaa Trade & Transport © 2025</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: RodistaaSpacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: RodistaaSpacing.xxxl,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: RodistaaSpacing.md,
  },
  appName: {
    ...MobileTextStyles.h1,
    color: RodistaaColors.primary.main,
    marginBottom: RodistaaSpacing.xs,
  },
  tagline: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.sm,
  },
  subtitle: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.lg,
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.md,
    borderWidth: 1,
    borderColor: RodistaaColors.border.light,
    marginBottom: RodistaaSpacing.lg,
    paddingHorizontal: RodistaaSpacing.lg,
  },
  prefix: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginRight: RodistaaSpacing.sm,
  },
  input: {
    flex: 1,
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    paddingVertical: RodistaaSpacing.md,
  },
  otpInput: {
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.md,
    borderWidth: 1,
    borderColor: RodistaaColors.border.light,
    height: 64,
    ...MobileTextStyles.h2,
    fontWeight: 'bold',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.lg,
    letterSpacing: 8,
  },
  button: {
    backgroundColor: RodistaaColors.primary.main,
    borderRadius: RodistaaSpacing.borderRadius.md,
    paddingVertical: RodistaaSpacing.lg,
    alignItems: 'center',
    marginBottom: RodistaaSpacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.primary.contrast,
  },
  backButton: {
    alignItems: 'center',
    padding: RodistaaSpacing.md,
  },
  backButtonText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  errorText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.error.main,
    marginBottom: RodistaaSpacing.md,
  },
  footer: {
    padding: RodistaaSpacing.xl,
    alignItems: 'center',
  },
  footerText: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.disabled,
  },
});

