/**
 * RDataBadge - Rodistaa Web Data Badge Component
 * For displaying counts, notifications, etc.
 */

import React, { CSSProperties } from 'react';
import { RodistaaColors } from '../../tokens/colors';
import { RodistaaSpacing } from '../../tokens/spacing';

export type RDataBadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface RDataBadgeProps {
  count: number;
  variant?: RDataBadgeVariant;
  showZero?: boolean;
  max?: number;
  className?: string;
  style?: CSSProperties;
}

export const RDataBadge: React.FC<RDataBadgeProps> = ({
  count,
  variant = 'primary',
  showZero = false,
  max = 99,
  className = '',
  style,
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count.toString();

  const badgeStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '600',
    ...getVariantStyles(variant),
    ...style,
  };

  return (
    <span className={className} style={badgeStyles}>
      {displayCount}
    </span>
  );
};

const getVariantStyles = (variant: RDataBadgeVariant): CSSProperties => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: RodistaaColors.primary.main,
        color: RodistaaColors.primary.contrast,
      };
    case 'success':
      return {
        backgroundColor: RodistaaColors.success.main,
        color: RodistaaColors.success.contrast,
      };
    case 'warning':
      return {
        backgroundColor: RodistaaColors.warning.main,
        color: RodistaaColors.warning.contrast,
      };
    case 'error':
      return {
        backgroundColor: RodistaaColors.error.main,
        color: RodistaaColors.error.contrast,
      };
    case 'info':
      return {
        backgroundColor: RodistaaColors.info.main,
        color: RodistaaColors.info.contrast,
      };
    default:
      return {};
  }
};

export default RDataBadge;

