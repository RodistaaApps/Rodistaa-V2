/**
 * RTabs - Rodistaa Web Tabs Component
 * For tabbed navigation
 */

import React, { CSSProperties } from 'react';
import { RodistaaColors } from '../../tokens/colors';
import { WebTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface RTab {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface RTabsProps {
  tabs: RTab[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const RTabs: React.FC<RTabsProps> = ({
  tabs,
  activeKey,
  onChange,
  className = '',
  style,
}) => {
  const tabsContainerStyles: CSSProperties = {
    display: 'flex',
    borderBottom: `2px solid ${RodistaaColors.border.light}`,
    ...style,
  };

  const getTabStyles = (tab: RTab): CSSProperties => {
    const isActive = tab.key === activeKey;

    return {
      display: 'flex',
      alignItems: 'center',
      gap: `${RodistaaSpacing.xs}px`,
      padding: `${RodistaaSpacing.sm}px ${RodistaaSpacing.lg}px`,
      cursor: tab.disabled ? 'not-allowed' : 'pointer',
      border: 'none',
      background: 'none',
      borderBottom: `3px solid ${
        isActive ? RodistaaColors.primary.main : 'transparent'
      }`,
      marginBottom: '-2px',
      transition: 'all 0.2s ease',
      ...WebTextStyles.body,
      color: isActive
        ? RodistaaColors.primary.main
        : tab.disabled
        ? RodistaaColors.text.disabled
        : RodistaaColors.text.primary,
      fontWeight: isActive ? '600' : '400',
      opacity: tab.disabled ? 0.5 : 1,
    };
  };

  return (
    <div className={className} style={tabsContainerStyles}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          style={getTabStyles(tab)}
          onClick={() => !tab.disabled && onChange(tab.key)}
          disabled={tab.disabled}
        >
          {tab.icon && <span>{tab.icon}</span>}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default RTabs;

