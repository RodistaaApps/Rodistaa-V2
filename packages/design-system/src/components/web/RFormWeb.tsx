/**
 * RFormWeb - Rodistaa Web Form Component
 * Form wrapper with consistent styling
 */

import React, { CSSProperties, FormEvent } from 'react';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface RFormWebProps {
  children: React.ReactNode;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  className?: string;
  style?: CSSProperties;
}

export const RFormWeb: React.FC<RFormWebProps> = ({
  children,
  onSubmit,
  className = '',
  style,
}) => {
  const formStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: `${RodistaaSpacing.layout.formFieldGap}px`,
    ...style,
  };

  return (
    <form className={className} style={formStyles} onSubmit={onSubmit}>
      {children}
    </form>
  );
};

export default RFormWeb;

