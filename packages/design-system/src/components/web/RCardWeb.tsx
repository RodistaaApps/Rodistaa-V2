/**
 * RCardWeb - Rodistaa Web Card Component
 * For portal cards
 */

import React, { CSSProperties } from 'react';
import { RodistaaColors } from '../../tokens/colors';
import { RodistaaSpacing, WebShadowStyles } from '../../tokens/spacing';

export interface RCardWebProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  bordered?: boolean;
  elevated?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const RCardWeb: React.FC<RCardWebProps> = ({
  children,
  title,
  actions,
  bordered = false,
  elevated = true,
  hoverable = false,
  onClick,
  className = '',
  style,
}) => {
  const cardStyles: CSSProperties = {
    backgroundColor: RodistaaColors.background.default,
    borderRadius: `${RodistaaSpacing.borderRadius.lg}px`,
    padding: `${RodistaaSpacing.lg}px`,
    ...(elevated && { boxShadow: WebShadowStyles.md }),
    ...(bordered && { border: `1px solid ${RodistaaColors.border.default}` }),
    ...(hoverable && {
      cursor: 'pointer',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    }),
    ...style,
  };

  const headerStyles: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: `${RodistaaSpacing.md}px`,
    paddingBottom: `${RodistaaSpacing.sm}px`,
    borderBottom: `1px solid ${RodistaaColors.border.light}`,
  };

  const titleStyles: CSSProperties = {
    fontSize: '20px',
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    margin: 0,
  };

  return (
    <div
      className={className}
      style={cardStyles}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hoverable && e.currentTarget) {
          const target = e.currentTarget as HTMLDivElement;
          target.style.boxShadow = WebShadowStyles.lg;
          target.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable && e.currentTarget) {
          const target = e.currentTarget as HTMLDivElement;
          target.style.boxShadow = elevated
            ? WebShadowStyles.md
            : 'none';
          target.style.transform = 'translateY(0)';
        }
      }}
    >
      {(title || actions) && (
        <div style={headerStyles}>
          {title && <h3 style={titleStyles}>{title}</h3>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default RCardWeb;

