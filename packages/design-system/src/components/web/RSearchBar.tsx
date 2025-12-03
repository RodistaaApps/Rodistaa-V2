/**
 * RSearchBar - Rodistaa Web Search Bar Component
 * For filtering and search
 */

import React, { CSSProperties, useState } from 'react';
import { RodistaaColors } from '../../tokens/colors';
import { WebTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface RSearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const RSearchBar: React.FC<RSearchBarProps> = ({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search...',
  disabled = false,
  className = '',
  style,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const currentValue = onChange ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const newValue = target.value;
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(currentValue);
    }
  };

  const containerStyles: CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
    ...style,
  };

  const inputStyles: CSSProperties = {
    width: '100%',
    height: '40px',
    padding: `0 ${RodistaaSpacing.md}px 0 ${RodistaaSpacing.xl + 8}px`,
    border: `1px solid ${
      isFocused ? RodistaaColors.primary.main : RodistaaColors.border.default
    }`,
    borderRadius: `${RodistaaSpacing.borderRadius.lg}px`,
    ...WebTextStyles.body,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: disabled
      ? RodistaaColors.background.paper
      : RodistaaColors.background.default,
  };

  const iconStyles: CSSProperties = {
    position: 'absolute',
    left: `${RodistaaSpacing.sm}px`,
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '18px',
    color: RodistaaColors.text.secondary,
  };

  return (
    <div className={className} style={containerStyles}>
      <span style={iconStyles}>🔍</span>
      <input
        type="text"
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        style={inputStyles}
      />
    </div>
  );
};

export default RSearchBar;

