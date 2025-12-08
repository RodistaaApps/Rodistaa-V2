/**
 * Safe Fallback UI - Shown when app initialization fails
 */
import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
// Import tokens directly from design system (components excluded from web build)
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system/tokens';

interface SafeFallbackProps {
  error?: Error;
  onSendLogs?: () => void;
}

const SafeFallback: React.FC<SafeFallbackProps> = ({ error, onSendLogs }) => {
  const handleSendLogs = () => {
    // Write error to logs directory
    const logData = {
      timestamp: new Date().toISOString(),
      error: error?.message || 'Unknown error',
      stack: error?.stack || '',
    };
    
    // In a real implementation, write to reports/mobile/
    console.error('SafeFallback - Error logged:', logData);
    
    if (onSendLogs) {
      onSendLogs();
    } else {
      // Fallback: log to console
      alert(`Debug Log:\n\n${JSON.stringify(logData, null, 2)}`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🚛</Text>
      </View>
      <Text style={styles.title}>Rodistaa Operator</Text>
      <Text style={styles.subtitle}>Initialization Error</Text>
      
      <View style={styles.errorBox}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>
          {error?.message || 'The app failed to start properly. Please restart the app.'}
        </Text>
        {error?.stack && (
          <ScrollView style={styles.stackTrace}>
            <Text style={styles.stackText}>{error.stack}</Text>
          </ScrollView>
        )}
      </View>

      <View style={styles.actions}>
        <Button
          title="Send Debug Log"
          onPress={handleSendLogs}
          color={RodistaaColors.primary.main}
        />
        <Text style={styles.hint}>
          This will help us diagnose the issue. The log will be saved to reports/mobile/
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: RodistaaSpacing.xl,
  },
  iconContainer: {
    marginBottom: RodistaaSpacing.lg,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    ...MobileTextStyles.h1,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  subtitle: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xl,
  },
  errorBox: {
    backgroundColor: RodistaaColors.background.paper,
    padding: RodistaaSpacing.lg,
    borderRadius: RodistaaSpacing.borderRadius.md,
    marginBottom: RodistaaSpacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  errorTitle: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.error.main,
    marginBottom: RodistaaSpacing.sm,
  },
  errorText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.md,
  },
  stackTrace: {
    maxHeight: 200,
    backgroundColor: '#F3F4F6',
    padding: RodistaaSpacing.md,
    borderRadius: RodistaaSpacing.borderRadius.sm,
  },
  stackText: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
    fontFamily: 'monospace',
  },
  actions: {
    width: '100%',
    maxWidth: 400,
  },
  hint: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
    textAlign: 'center',
    marginTop: RodistaaSpacing.md,
  },
});

export default SafeFallback;
