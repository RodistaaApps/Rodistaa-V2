/**
 * Rodistaa Spacing Tokens
 * Spec: 4/8/12/16/24/32
 */
export const spacing = {
  "4": 4,
  "8": 8,
  "12": 12,
  "16": 16,
  "24": 24,
  "32": 32,
  "48": 48,
} as const;

// React Native compatible spacing object
export const RodistaaSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  // Component-specific spacing
  component: {
    buttonPaddingX: 24,
    buttonPaddingY: 12,
    buttonHeight: 48,
    inputPaddingX: 16,
    inputPaddingY: 12,
    cardPadding: 16,
    modalPadding: 24,
  },
  // Border radius (moved here for RN compatibility)
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
  },
} as const;

// React Native shadow styles
export const RNShadowStyles = {
  none: {},
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

export type Spacing = typeof spacing;
export type RodistaaSpacingType = typeof RodistaaSpacing;
