/**
 * RSideNav - Rodistaa Web Side Navigation Component
 * Left sidebar with red accents
 */

import React, { CSSProperties, useState } from 'react';
import { RodistaaColors } from '../../tokens/colors';
import { WebTextStyles } from '../../tokens/typography';
import { RodistaaSpacing, WebShadowStyles } from '../../tokens/spacing';

export interface RNavItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path: string;
}

export interface RSideNavProps {
  items: RNavItem[];
  activeKey: string;
  onItemClick: (key: string) => void;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  collapsed?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const RSideNav: React.FC<RSideNavProps> = ({
  items,
  activeKey,
  onItemClick,
  logo,
  footer,
  collapsed = false,
  className = '',
  style,
}) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const sideNavStyles: CSSProperties = {
    width: collapsed ? '80px' : '240px',
    height: '100vh',
    backgroundColor: RodistaaColors.background.default,
    borderRight: `1px solid ${RodistaaColors.border.light}`,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: WebShadowStyles.sm,
    transition: 'width 0.2s ease',
    ...style,
  };

  const logoContainerStyles: CSSProperties = {
    padding: `${RodistaaSpacing.lg}px`,
    borderBottom: `1px solid ${RodistaaColors.border.light}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'flex-start',
  };

  const navItemsStyles: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: `${RodistaaSpacing.sm}px 0`,
  };

  const getItemStyles = (key: string): CSSProperties => {
    const isActive = key === activeKey;
    const isHovered = key === hoveredKey;

    return {
      display: 'flex',
      alignItems: 'center',
      gap: `${RodistaaSpacing.sm}px`,
      padding: `${RodistaaSpacing.sm}px ${RodistaaSpacing.md}px`,
      margin: `0 ${RodistaaSpacing.xs}px`,
      borderRadius: `${RodistaaSpacing.borderRadius.md}px`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: isActive
        ? `${RodistaaColors.primary.main}15`
        : isHovered
        ? RodistaaColors.background.paper
        : 'transparent',
      borderLeft: isActive ? `3px solid ${RodistaaColors.primary.main}` : '3px solid transparent',
      ...WebTextStyles.body,
      color: isActive ? RodistaaColors.primary.main : RodistaaColors.text.primary,
      fontWeight: isActive ? '600' : '400',
    };
  };

  return (
    <aside className={className} style={sideNavStyles}>
      {logo && <div style={logoContainerStyles}>{logo}</div>}

      <nav style={navItemsStyles}>
        {items.map((item) => (
          <div
            key={item.key}
            style={getItemStyles(item.key)}
            onClick={() => onItemClick(item.key)}
            onMouseEnter={() => setHoveredKey(item.key)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            {item.icon && <span>{item.icon}</span>}
            {!collapsed && <span>{item.label}</span>}
          </div>
        ))}
      </nav>

      {footer && (
        <div
          style={{
            padding: `${RodistaaSpacing.md}px`,
            borderTop: `1px solid ${RodistaaColors.border.light}`,
          }}
        >
          {footer}
        </div>
      )}
    </aside>
  );
};

export default RSideNav;

