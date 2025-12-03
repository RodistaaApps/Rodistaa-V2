/**
 * RMetricsCard - Rodistaa Web Metrics Card Component
 * For KPI displays in dashboards
 */

import React, { CSSProperties } from 'react';
import { RodistaaColors } from '../../tokens/colors';
import { WebTextStyles } from '../../tokens/typography';
import { RodistaaSpacing, WebShadowStyles } from '../../tokens/spacing';

export interface RMetricsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive?: boolean;
  };
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const RMetricsCard: React.FC<RMetricsCardProps> = ({
  title,
  value,
  change,
  icon,
  loading = false,
  className = '',
  style,
}) => {
  const cardStyles: CSSProperties = {
    backgroundColor: RodistaaColors.background.default,
    borderRadius: `${RodistaaSpacing.borderRadius.lg}px`,
    padding: `${RodistaaSpacing.lg}px`,
    boxShadow: WebShadowStyles.md,
    display: 'flex',
    flexDirection: 'column',
    gap: `${RodistaaSpacing.sm}px`,
    minHeight: '120px',
    ...style,
  };

  const headerStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const titleStyles: CSSProperties = {
    ...WebTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    margin: 0,
  };

  const valueStyles: CSSProperties = {
    fontSize: '32px',
    fontWeight: '700',
    color: RodistaaColors.text.primary,
    margin: 0,
  };

  const changeStyles: CSSProperties = {
    ...WebTextStyles.caption,
    color: change?.isPositive
      ? RodistaaColors.success.main
      : RodistaaColors.error.main,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  if (loading) {
    return (
      <div className={className} style={cardStyles}>
        <div style={{ color: RodistaaColors.text.secondary }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={className} style={cardStyles}>
      <div style={headerStyles}>
        <h4 style={titleStyles}>{title}</h4>
        {icon && <div>{icon}</div>}
      </div>

      <div>
        <div style={valueStyles}>{value}</div>
        {change && (
          <div style={changeStyles}>
            <span>{change.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(change.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RMetricsCard;

