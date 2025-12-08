/**
 * Flag Toast Component
 * Non-blocking toast for unusual configuration with CTA to create ticket
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface FlagToastProps {
  flags: Array<{
    code: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reason: string;
  }>;
  onRequestHelp: () => void;
  onDismiss?: () => void;
}

export const FlagToast: React.FC<FlagToastProps> = ({ flags, onRequestHelp, onDismiss }) => {
  if (flags.length === 0) return null;

  const severityColors = {
    LOW: '#ffc107',
    MEDIUM: '#ff9800',
    HIGH: '#f44336',
    CRITICAL: '#d32f2f',
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>⚠️</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Configuration Notice</Text>
        {flags.map((flag, index) => (
          <Text key={index} style={styles.message}>
            {flag.reason}
          </Text>
        ))}
        <TouchableOpacity style={styles.helpButton} onPress={onRequestHelp}>
          <Text style={styles.helpButtonText}>Request Help</Text>
        </TouchableOpacity>
      </View>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Text style={styles.dismissText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#856404',
  },
  message: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 8,
  },
  helpButton: {
    backgroundColor: '#ffc107',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  helpButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  dismissButton: {
    marginLeft: 8,
  },
  dismissText: {
    fontSize: 24,
    color: '#856404',
  },
});

export default FlagToast;

