/**
 * Screen Wrapper - Ensures screens always render something, even on error
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RodistaaColors, MobileTextStyles } from '../theme/colors';

interface Props {
  children: ReactNode;
  screenName: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ScreenWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.screenName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Error in {this.props.screenName}</Text>
          <Text style={styles.error}>{this.state.error?.message || 'Unknown error'}</Text>
          <Text style={styles.hint}>Check console for details</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: RodistaaColors.background.default,
  },
  title: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.error.main,
    marginBottom: 10,
  },
  error: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.secondary,
    marginBottom: 10,
    textAlign: 'center',
  },
  hint: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.disabled,
  },
});

