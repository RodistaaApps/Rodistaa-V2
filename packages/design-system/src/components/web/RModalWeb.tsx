/**
 * RModalWeb - Rodistaa Web Modal Component
 * STRICT: Animation fade-in 140ms, Sizes: small (400px), medium (600px), large (800px)
 */

import React, { CSSProperties, useEffect } from 'react';
import { RodistaaColors } from '../../tokens/colors';
import { WebTextStyles } from '../../tokens/typography';
import { RodistaaSpacing, WebShadowStyles } from '../../tokens/spacing';

export type RModalWebSize = 'small' | 'medium' | 'large';

export interface RModalWebProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: RModalWebSize;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const RModalWeb: React.FC<RModalWebProps> = ({
  visible,
  onClose,
  title,
  children,
  size = 'medium',
  footer,
  showCloseButton = true,
  className = '',
  style,
}) => {
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible]);

  if (!visible) return null;

  const overlayStyles: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: RodistaaColors.background.overlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 140ms ease-out',
  };

  const modalStyles: CSSProperties = {
    backgroundColor: RodistaaColors.background.default,
    borderRadius: `${RodistaaSpacing.borderRadius.lg}px`,
    boxShadow: WebShadowStyles.lg,
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    ...getModalWidth(size),
    animation: 'scaleIn 140ms ease-out',
    ...style,
  };

  const headerStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${RodistaaSpacing.lg}px`,
    borderBottom: `1px solid ${RodistaaColors.border.light}`,
  };

  const titleStyles: CSSProperties = {
    ...WebTextStyles.h3,
    margin: 0,
  };

  const closeButtonStyles: CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px 8px',
    color: RodistaaColors.text.secondary,
    minWidth: '44px',
    minHeight: '44px',
  };

  const contentStyles: CSSProperties = {
    padding: `${RodistaaSpacing.lg}px`,
    overflowY: 'auto',
    flex: 1,
  };

  const footerStyles: CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: `${RodistaaSpacing.sm}px`,
    padding: `${RodistaaSpacing.lg}px`,
    borderTop: `1px solid ${RodistaaColors.border.light}`,
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
      <div style={overlayStyles} onClick={onClose}>
        <div
          className={className}
          style={modalStyles}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || showCloseButton) && (
            <div style={headerStyles}>
              {title && <h3 style={titleStyles}>{title}</h3>}
              {showCloseButton && (
                <button
                  style={closeButtonStyles}
                  onClick={onClose}
                  aria-label="Close"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          <div style={contentStyles}>{children}</div>

          {footer && <div style={footerStyles}>{footer}</div>}
        </div>
      </div>
    </>
  );
};

const getModalWidth = (size: RModalWebSize): CSSProperties => {
  switch (size) {
    case 'small':
      return { width: '400px', maxWidth: '90vw' };
    case 'large':
      return { width: '800px', maxWidth: '90vw' };
    case 'medium':
    default:
      return { width: '600px', maxWidth: '90vw' };
  }
};

export default RModalWeb;

