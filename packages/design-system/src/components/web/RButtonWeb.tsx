/**
 * RButtonWeb - Rodistaa Web Button Component
 * For Next.js portals (Admin, Franchise)
 * STRICT: Primary = Red bg + white text, Secondary = White bg + red border
 */

import React, { CSSProperties } from 'react';
import { RodistaaColors } from '../../tokens/colors';
import { WebTextStyles } from '../../tokens/typography';
import { RodistaaSpacing, WebShadowStyles } from '../../tokens/spacing';
import { RodistaaAnimations } from '../../tokens/animations';

export type RButtonWebVariant = 'primary' | 'secondary' | 'text' | 'danger';
export type RButtonWebSize = 'small' | 'medium' | 'large';

export interface RButtonWebProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: RButtonWebVariant;
  size?: RButtonWebSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: CSSProperties;
}

export const RButtonWeb: React.FC<RButtonWebProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  type = 'button',
  className = '',
  style,
}) => {
  const isDisabled = disabled || loading;

  const baseStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${RodistaaSpacing.xs}px`,
    border: 'none',
    borderRadius: `${RodistaaSpacing.borderRadius.lg}px`,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: RodistaaAnimations.web.default,
    fontFamily: WebTextStyles.button.fontFamily,
    fontSize: WebTextStyles.button.fontSize,
    fontWeight: WebTextStyles.button.fontWeight,
    textTransform: 'none',
    width: fullWidth ? '100%' : 'auto',
    ...getSizeStyles(size),
    ...getVariantStyles(variant, isDisabled),
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={className}
      style={{ ...baseStyles, ...style }}
    >
      {loading ? (
        <span>Loading...</span>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

const getSizeStyles = (size: RButtonWebSize): CSSProperties => {
  switch (size) {
    case 'small':
      return {
        height: '36px',
        paddingLeft: `${RodistaaSpacing.md}px`,
        paddingRight: `${RodistaaSpacing.md}px`,
        fontSize: '14px',
      };
    case 'large':
      return {
        height: '56px',
        paddingLeft: `${RodistaaSpacing.xl}px`,
        paddingRight: `${RodistaaSpacing.xl}px`,
        fontSize: '18px',
      };
    case 'medium':
    default:
      return {
        height: '48px',
        paddingLeft: `${RodistaaSpacing.lg}px`,
        paddingRight: `${RodistaaSpacing.lg}px`,
        fontSize: '16px',
      };
  }
};

const getVariantStyles = (
  variant: RButtonWebVariant,
  disabled: boolean
): CSSProperties => {
  if (disabled) {
    return {
      backgroundColor: '#E0E0E0',
      color: '#999999',
      opacity: 0.6,
    };
  }

  switch (variant) {
    case 'primary':
      return {
        backgroundColor: RodistaaColors.primary.main,
        color: RodistaaColors.primary.contrast,
        boxShadow: WebShadowStyles.sm,
      };
    case 'secondary':
      return {
        backgroundColor: RodistaaColors.secondary.main,
        color: RodistaaColors.primary.main,
        border: `2px solid ${RodistaaColors.primary.main}`,
        boxShadow: WebShadowStyles.sm,
      };
    case 'text':
      return {
        backgroundColor: 'transparent',
        color: RodistaaColors.primary.main,
      };
    case 'danger':
      return {
        backgroundColor: RodistaaColors.error.main,
        color: RodistaaColors.error.contrast,
        boxShadow: WebShadowStyles.sm,
      };
    default:
      return {};
  }
};

export default RButtonWeb;

