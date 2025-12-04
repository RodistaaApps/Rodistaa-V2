/**
 * BookingFlow - Rodistaa Mobile Booking Flow Component
 * Complete 4-step booking wizard for shipper app
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, ScrollView } from 'react-native';
import { RStepper } from './RStepper';
import { RButton } from './RButton';
import { RInput } from './RInput';
import { RCard } from './RCard';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface BookingFlowProps {
  onComplete: (data: BookingData) => void;
  onCancel?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export interface BookingData {
  pickup: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  drop: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  goods: {
    type: string;
    description?: string;
    tonnage: number;
  };
  priceRange: {
    min: number;
    max: number;
  };
}

const STEPS = ['Pickup', 'Drop', 'Goods', 'Price'];

export const BookingFlow: React.FC<BookingFlowProps> = ({
  onComplete,
  onCancel,
  style,
  testID,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<BookingData>>({
    pickup: { address: '', city: '', state: '', pincode: '' },
    drop: { address: '', city: '', state: '', pincode: '' },
    goods: { type: '', tonnage: 0 },
    priceRange: { min: 0, max: 0 },
  });

  const updateFormData = (section: keyof BookingData, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData as BookingData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (onCancel) {
      onCancel();
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(
          formData.pickup?.address &&
          formData.pickup?.city &&
          formData.pickup?.state &&
          formData.pickup?.pincode
        );
      case 2:
        return !!(
          formData.drop?.address &&
          formData.drop?.city &&
          formData.drop?.state &&
          formData.drop?.pincode
        );
      case 3:
        return !!(formData.goods?.type && formData.goods?.tonnage > 0);
      case 4:
        return !!(
          formData.priceRange?.min &&
          formData.priceRange?.max &&
          formData.priceRange.min > 0 &&
          formData.priceRange.max >= formData.priceRange.min
        );
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Pickup Location</Text>
            <RInput
              label="Address"
              placeholder="Enter pickup address"
              value={formData.pickup?.address || ''}
              onChangeText={(text) => updateFormData('pickup', { address: text })}
              style={styles.input}
            />
            <View style={styles.row}>
              <RInput
                label="City"
                placeholder="City"
                value={formData.pickup?.city || ''}
                onChangeText={(text) => updateFormData('pickup', { city: text })}
                style={StyleSheet.flatten([styles.input, styles.halfInput])}
              />
              <RInput
                label="State"
                placeholder="State"
                value={formData.pickup?.state || ''}
                onChangeText={(text) => updateFormData('pickup', { state: text })}
                style={StyleSheet.flatten([styles.input, styles.halfInput])}
              />
            </View>
            <RInput
              label="Pincode"
              placeholder="Pincode"
              value={formData.pickup?.pincode || ''}
              onChangeText={(text) => updateFormData('pickup', { pincode: text })}
              keyboardType="numeric"
              style={styles.input}
            />
            <RInput
              label="Landmark (Optional)"
              placeholder="Nearby landmark"
              value={formData.pickup?.landmark || ''}
              onChangeText={(text) => updateFormData('pickup', { landmark: text })}
              style={styles.input}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Drop Location</Text>
            <RInput
              label="Address"
              placeholder="Enter drop address"
              value={formData.drop?.address || ''}
              onChangeText={(text) => updateFormData('drop', { address: text })}
              style={styles.input}
            />
            <View style={styles.row}>
              <RInput
                label="City"
                placeholder="City"
                value={formData.drop?.city || ''}
                onChangeText={(text) => updateFormData('drop', { city: text })}
                style={StyleSheet.flatten([styles.input, styles.halfInput])}
              />
              <RInput
                label="State"
                placeholder="State"
                value={formData.drop?.state || ''}
                onChangeText={(text) => updateFormData('drop', { state: text })}
                style={StyleSheet.flatten([styles.input, styles.halfInput])}
              />
            </View>
            <RInput
              label="Pincode"
              placeholder="Pincode"
              value={formData.drop?.pincode || ''}
              onChangeText={(text) => updateFormData('drop', { pincode: text })}
              keyboardType="numeric"
              style={styles.input}
            />
            <RInput
              label="Landmark (Optional)"
              placeholder="Nearby landmark"
              value={formData.drop?.landmark || ''}
              onChangeText={(text) => updateFormData('drop', { landmark: text })}
              style={styles.input}
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Goods Information</Text>
            <RInput
              label="Goods Type"
              placeholder="e.g., Cement, Steel, Food grains"
              value={formData.goods?.type || ''}
              onChangeText={(text) => updateFormData('goods', { type: text })}
              style={styles.input}
            />
            <RInput
              label="Tonnage (tons)"
              placeholder="Enter tonnage"
              value={formData.goods?.tonnage?.toString() || ''}
              onChangeText={(text) => updateFormData('goods', { tonnage: parseFloat(text) || 0 })}
              keyboardType="numeric"
              style={styles.input}
            />
            <RInput
              label="Description (Optional)"
              placeholder="Additional details about goods"
              value={formData.goods?.description || ''}
              onChangeText={(text) => updateFormData('goods', { description: text })}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Price Range</Text>
            <RCard style={styles.infoCard}>
              <Text style={styles.infoText}>
                Set your expected price range. Operators will bid within this range.
              </Text>
            </RCard>
            <RInput
              label="Minimum Price (₹)"
              placeholder="Min amount"
              value={formData.priceRange?.min?.toString() || ''}
              onChangeText={(text) =>
                updateFormData('priceRange', { min: parseFloat(text) || 0 })
              }
              keyboardType="numeric"
              style={styles.input}
            />
            <RInput
              label="Maximum Price (₹)"
              placeholder="Max amount"
              value={formData.priceRange?.max?.toString() || ''}
              onChangeText={(text) =>
                updateFormData('priceRange', { max: parseFloat(text) || 0 })
              }
              keyboardType="numeric"
              style={styles.input}
            />
            {formData.priceRange?.min && formData.priceRange?.max && (
              <RCard style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Price Range</Text>
                <Text style={styles.summaryValue}>
                  ₹{formData.priceRange.min.toLocaleString('en-IN')} - ₹
                  {formData.priceRange.max.toLocaleString('en-IN')}
                </Text>
              </RCard>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Stepper */}
        <RStepper steps={STEPS} currentStep={currentStep} style={styles.stepper} />

        {/* Step Content */}
        {renderStepContent()}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <RButton
          title={currentStep === 1 ? 'Cancel' : 'Back'}
          variant="secondary"
          onPress={handleBack}
          style={styles.actionButton}
        />
        <RButton
          title={currentStep === STEPS.length ? 'Create Booking' : 'Next'}
          variant="primary"
          onPress={handleNext}
          disabled={!canProceed()}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: RodistaaSpacing.lg,
  },
  stepper: {
    marginBottom: RodistaaSpacing.xl,
  },
  stepContent: {
    gap: RodistaaSpacing.md,
  },
  stepTitle: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.md,
  },
  input: {
    marginBottom: RodistaaSpacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: RodistaaSpacing.md,
  },
  halfInput: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: RodistaaColors.info.light,
    padding: RodistaaSpacing.md,
    marginBottom: RodistaaSpacing.md,
  },
  infoText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.info.main,
  },
  summaryCard: {
    backgroundColor: RodistaaColors.background.paper,
    padding: RodistaaSpacing.md,
    marginTop: RodistaaSpacing.sm,
  },
  summaryLabel: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
    marginBottom: 4,
  },
  summaryValue: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.primary.main,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: RodistaaSpacing.md,
    padding: RodistaaSpacing.lg,
    borderTopWidth: 1,
    borderTopColor: RodistaaColors.border.light,
    backgroundColor: RodistaaColors.background.default,
  },
  actionButton: {
    flex: 1,
  },
});

export default BookingFlow;

