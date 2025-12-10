/**
 * Safe Fallback UI for Driver App
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface SafeFallbackProps {
  error?: Error;
}

export const SafeFallback: React.FC<SafeFallbackProps> = ({ error }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.icon}>🚗</Text>
      <Text style={styles.title}>Rodistaa Driver</Text>
      <Text style={styles.subtitle}>Initialization Error</Text>
      
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>
          {error?.message || 'The app failed to start properly.'}
        </Text>
      </View>
      
      <Text style={styles.hint}>
        Please restart the app. If the problem persists, contact support.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    maxWidth: 400,
  },
  errorText: {
    fontSize: 14,
    color: '#111827',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

