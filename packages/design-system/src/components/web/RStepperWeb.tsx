/**
 * RStepperWeb - Rodistaa Web Stepper Component
 * Used for multi-step forms and wizards
 */

import React, { CSSProperties } from 'react';
import { RodistaaColors } from '../../tokens/colors';
import { WebTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface RStepperWebProps {
  steps: string[];
  currentStep: number;
  className?: string;
  style?: CSSProperties;
}

export const RStepperWeb: React.FC<RStepperWebProps> = ({
  steps,
  currentStep,
  className = '',
  style,
}) => {
  const renderStep = (step: string, index: number) => {
    const stepNumber = index + 1;
    const isActive = stepNumber === currentStep;
    const isCompleted = stepNumber < currentStep;
    const isPending = stepNumber > currentStep;

    const stepCircleStyles: CSSProperties = {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: `${RodistaaSpacing.sm}px`,
      borderWidth: '2px',
      borderStyle: 'solid',
      transition: 'all 120ms ease',
      ...(isActive && {
        backgroundColor: RodistaaColors.primary.main,
        borderColor: RodistaaColors.primary.main,
      }),
      ...(isCompleted && {
        backgroundColor: RodistaaColors.success.main,
        borderColor: RodistaaColors.success.main,
      }),
      ...(isPending && {
        backgroundColor: RodistaaColors.background.default,
        borderColor: RodistaaColors.text.disabled,
      }),
    };

    const stepLabelStyles: CSSProperties = {
      ...WebTextStyles.caption,
      textAlign: 'center',
      maxWidth: '80px',
      transition: 'color 120ms ease',
      ...(isActive && {
        color: RodistaaColors.primary.main,
        fontWeight: '600',
      }),
      ...(isCompleted && {
        color: RodistaaColors.success.main,
      }),
      ...(isPending && {
        color: RodistaaColors.text.disabled,
      }),
    };

    return (
      <div
        key={index}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Step Circle */}
        <div style={stepCircleStyles}>
          {isCompleted ? (
            <span style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.success.contrast, fontWeight: '700' }}>
              ✓
            </span>
          ) : (
            <span
              style={{
                ...WebTextStyles.bodySmall,
                color: isActive
                  ? RodistaaColors.primary.contrast
                  : isPending
                  ? RodistaaColors.text.disabled
                  : RodistaaColors.text.secondary,
                fontWeight: '600',
              }}
            >
              {stepNumber}
            </span>
          )}
        </div>

        {/* Step Label */}
        <span style={stepLabelStyles}>{step}</span>

        {/* Connector Line */}
        {index < steps.length - 1 && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '50%',
              width: '100%',
              height: '2px',
              backgroundColor: isCompleted
                ? RodistaaColors.success.main
                : RodistaaColors.text.disabled,
              zIndex: -1,
            }}
          />
        )}
      </div>
    );
  };

  const containerStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${RodistaaSpacing.lg}px 0`,
    ...style,
  };

  return (
    <div className={className} style={containerStyles}>
      {steps.map((step, index) => renderStep(step, index))}
    </div>
  );
};

export default RStepperWeb;

