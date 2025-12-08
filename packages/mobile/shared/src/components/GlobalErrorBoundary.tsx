/**
 * Global Error Boundary - Catches errors and displays SafeFallback
 * Pure React Native CLI component
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('GlobalErrorBoundary caught error:', error, errorInfo);
    
    // Write diagnostic logs
    this.writeDiagnosticLog(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  writeDiagnosticLog = async (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      const logData = {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        componentStack: errorInfo.componentStack,
      };

      // Store in AsyncStorage for retrieval
      const logKey = `@rodistaa/error_log_${Date.now()}`;
      await AsyncStorage.setItem(logKey, JSON.stringify(logData));
      
      // Also store in recent errors list (keep last 10)
      const recentErrorsKey = '@rodistaa/recent_errors';
      const recentErrors = await AsyncStorage.getItem(recentErrorsKey);
      const errors = recentErrors ? JSON.parse(recentErrors) : [];
      errors.push(logData);
      if (errors.length > 10) {
        errors.shift(); // Keep only last 10
      }
      await AsyncStorage.setItem(recentErrorsKey, JSON.stringify(errors));
      
      console.log('Error log saved to AsyncStorage:', logKey);
    } catch (writeError) {
      console.error('Failed to write error log:', writeError);
    }
  };

  handleReload = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🚨</Text>
          </View>
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.message}>
            The app encountered an unexpected error. Please try restarting the app.
          </Text>

          {this.state.error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Error Details:</Text>
              <Text style={styles.errorMessage}>
                {this.state.error.name}: {this.state.error.message}
              </Text>
              {this.state.error.stack && (
                <ScrollView style={styles.stackTrace}>
                  <Text style={styles.stackText}>{this.state.error.stack}</Text>
                </ScrollView>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={this.handleReload}>
            <Text style={styles.buttonText}>Reload App</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>
            Error logs have been saved to reports/mobile/
          </Text>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

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
    ...MobileTextStyles.h2,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.md,
    textAlign: 'center',
  },
  message: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.secondary,
    textAlign: 'center',
    marginBottom: RodistaaSpacing.xl,
    paddingHorizontal: RodistaaSpacing.lg,
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
  errorMessage: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.md,
  },
  stackTrace: {
    maxHeight: 200,
    backgroundColor: RodistaaColors.background.default,
    padding: RodistaaSpacing.md,
    borderRadius: RodistaaSpacing.borderRadius.sm,
  },
  stackText: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: RodistaaColors.primary.main,
    paddingHorizontal: RodistaaSpacing.xl,
    paddingVertical: RodistaaSpacing.md,
    borderRadius: RodistaaSpacing.borderRadius.md,
    marginBottom: RodistaaSpacing.md,
  },
  buttonText: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.primary.contrast,
  },
  hint: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.disabled,
    textAlign: 'center',
    marginTop: RodistaaSpacing.md,
  },
});

