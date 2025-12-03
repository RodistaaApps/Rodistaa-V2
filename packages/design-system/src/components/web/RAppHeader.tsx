/**
 * RAppHeader - Rodistaa Web App Header Component
 * Top header with user menu
 */

import React, { CSSProperties } from 'react';
import { RodistaaColors } from '../../tokens/colors';
import { WebTextStyles } from '../../tokens/typography';
import { RodistaaSpacing, WebShadowStyles } from '../../tokens/spacing';

export interface RAppHeaderProps {
  title?: string;
  userMenu?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const RAppHeader: React.FC<RAppHeaderProps> = ({
  title,
  userMenu,
  breadcrumbs,
  actions,
  className = '',
  style,
}) => {
  const headerStyles: CSSProperties = {
    height: '64px',
    backgroundColor: RodistaaColors.background.default,
    borderBottom: `1px solid ${RodistaaColors.border.light}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `0 ${RodistaaSpacing.lg}px`,
    boxShadow: WebShadowStyles.sm,
    ...style,
  };

  const leftSectionStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: `${RodistaaSpacing.lg}px`,
    flex: 1,
  };

  const titleStyles: CSSProperties = {
    ...WebTextStyles.h3,
    margin: 0,
  };

  const rightSectionStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: `${RodistaaSpacing.md}px`,
  };

  return (
    <header className={className} style={headerStyles}>
      <div style={leftSectionStyles}>
        {breadcrumbs && <div>{breadcrumbs}</div>}
        {title && <h1 style={titleStyles}>{title}</h1>}
      </div>

      <div style={rightSectionStyles}>
        {actions && <div>{actions}</div>}
        {userMenu && <div>{userMenu}</div>}
      </div>
    </header>
  );
};

export default RAppHeader;

