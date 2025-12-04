/**
 * RTagWeb - Rodistaa Web Tag Component
 * Used for status indicators, categories, and labels
 */

import React, { CSSProperties } from 'react';
import { RodistaaColors } from '../../tokens/colors';
import { WebTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export type RTagWebVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type RTagWebSize = 'small' | 'medium' | 'large';

export interface RTagWebProps {
  label: string;
  variant?: RTagWebVariant;
  size?: RTagWebSize;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

export const RTagWeb: React.FC<RTagWebProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  className = '',
  style,
  onClick,
}) => {
  const getVariantStyles = (): CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: RodistaaColors.primary.light,
          borderColor: RodistaaColors.primary.main,
          color: RodistaaColors.primary.main,
        };
      case 'success':
        return {
          backgroundColor: RodistaaColors.success.light,
          borderColor: RodistaaColors.success.main,
          color: RodistaaColors.success.main,
        };
      case 'warning':
        return {
          backgroundColor: RodistaaColors.warning.light,
          borderColor: RodistaaColors.warning.main,
          color: RodistaaColors.warning.main,
        };
      case 'error':
        return {
          backgroundColor: RodistaaColors.error.light,
          borderColor: RodistaaColors.error.main,
          color: RodistaaColors.error.main,
        };
      case 'info':
        return {
          backgroundColor: RodistaaColors.info.light,
          borderColor: RodistaaColors.info.main,
          color: RodistaaColors.info.main,
        };
      case 'neutral':
        return {
          backgroundColor: RodistaaColors.background.paper,
          borderColor: RodistaaColors.text.secondary,
          color: RodistaaColors.text.secondary,
        };
      default:
        return {
          backgroundColor: RodistaaColors.primary.light,
          borderColor: RodistaaColors.primary.main,
          color: RodistaaColors.primary.main,
        };
    }
  };

  const getSizeStyles = (): CSSProperties => {
    switch (size) {
      case 'small':
        return {
          padding: `${RodistaaSpacing.xs / 2}px ${RodistaaSpacing.sm}px`,
          fontSize: '12px',
          borderRadius: `${RodistaaSpacing.borderRadius.sm}px`,
        };
      case 'medium':
        return {
          padding: `${RodistaaSpacing.xs}px ${RodistaaSpacing.md}px`,
          fontSize: '14px',
          borderRadius: `${RodistaaSpacing.borderRadius.md}px`,
        };
      case 'large':
        return {
          padding: `${RodistaaSpacing.sm}px ${RodistaaSpacing.lg}px`,
          fontSize: '16px',
          borderRadius: `${RodistaaSpacing.borderRadius.lg}px`,
        };
      default:
        return {
          padding: `${RodistaaSpacing.xs}px ${RodistaaSpacing.md}px`,
          fontSize: '14px',
          borderRadius: `${RodistaaSpacing.borderRadius.md}px`,
        };
    }
  };

  const tagStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: '1px',
    borderStyle: 'solid',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 120ms ease',
    ...WebTextStyles.caption,
    fontWeight: '600',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  const Component = onClick ? 'button' : 'span';
  const componentProps = onClick
    ? {
        onClick,
        type: 'button' as const,
        style: { ...tagStyles, background: 'none', border: tagStyles.border },
      }
    : { style: tagStyles };

  return (
    <Component className={className} {...componentProps}>
      {label}
    </Component>
  );
};

export default RTagWeb;

