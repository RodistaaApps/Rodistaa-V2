/**
 * RStepper - Rodistaa Mobile Stepper Component
 * Used for multi-step forms and wizards
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface RStepperProps {
  steps: string[];
  currentStep: number;
  style?: ViewStyle;
  testID?: string;
}

export const RStepper: React.FC<RStepperProps> = ({
  steps,
  currentStep,
  style,
  testID,
}) => {
  const renderStep = (step: string, index: number) => {
    const stepNumber = index + 1;
    const isActive = stepNumber === currentStep;
    const isCompleted = stepNumber < currentStep;
    const isPending = stepNumber > currentStep;

    return (
      <View key={index} style={styles.stepContainer}>
        {/* Step Circle */}
        <View
          style={[
            styles.stepCircle,
            isActive && styles.stepCircleActive,
            isCompleted && styles.stepCircleCompleted,
            isPending && styles.stepCirclePending,
          ]}
        >
          {isCompleted ? (
            <Text style={styles.checkmark}>✓</Text>
          ) : (
            <Text
              style={[
                styles.stepNumber,
                isActive && styles.stepNumberActive,
                isPending && styles.stepNumberPending,
              ]}
            >
              {stepNumber}
            </Text>
          )}
        </View>

        {/* Step Label */}
        <Text
          style={[
            styles.stepLabel,
            isActive && styles.stepLabelActive,
            isCompleted && styles.stepLabelCompleted,
            isPending && styles.stepLabelPending,
          ]}
          numberOfLines={1}
        >
          {step}
        </Text>

        {/* Connector Line */}
        {index < steps.length - 1 && (
          <View
            style={[
              styles.connector,
              isCompleted && styles.connectorCompleted,
              !isCompleted && styles.connectorPending,
            ]}
          />
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {steps.map((step, index) => renderStep(step, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: RodistaaSpacing.lg,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: RodistaaColors.background.paper,
    borderWidth: 2,
    borderColor: RodistaaColors.text.disabled,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: RodistaaSpacing.sm,
  },
  stepCircleActive: {
    backgroundColor: RodistaaColors.primary.main,
    borderColor: RodistaaColors.primary.main,
  },
  stepCircleCompleted: {
    backgroundColor: RodistaaColors.success.main,
    borderColor: RodistaaColors.success.main,
  },
  stepCirclePending: {
    backgroundColor: RodistaaColors.background.default,
    borderColor: RodistaaColors.text.disabled,
  },
  stepNumber: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    fontWeight: '600',
  },
  stepNumberActive: {
    color: RodistaaColors.primary.contrast,
  },
  stepNumberPending: {
    color: RodistaaColors.text.disabled,
  },
  checkmark: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.success.contrast,
    fontWeight: '700',
  },
  stepLabel: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.disabled,
    textAlign: 'center',
    maxWidth: 80,
  },
  stepLabelActive: {
    color: RodistaaColors.primary.main,
    fontWeight: '600',
  },
  stepLabelCompleted: {
    color: RodistaaColors.success.main,
  },
  stepLabelPending: {
    color: RodistaaColors.text.disabled,
  },
  connector: {
    position: 'absolute',
    top: 16,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: RodistaaColors.text.disabled,
    zIndex: -1,
  },
  connectorCompleted: {
    backgroundColor: RodistaaColors.success.main,
  },
  connectorPending: {
    backgroundColor: RodistaaColors.text.disabled,
  },
});

export default RStepper;

