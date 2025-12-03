#!/usr/bin/env node
/**
 * generate-comprehensive-tokens.js
 * - Reads tokens.json and generates comprehensive TypeScript files
 * - Maintains backward compatibility with existing component imports
 * - Generates: colors.ts, spacing.ts, typography.ts, animations.ts, index.ts
 */
const fs = require('fs');
const path = require('path');
const prettier = require('prettier');

const TOKENS_JSON = path.join(__dirname, '../../design-system/tokens/tokens.json');
const OUT_DIR = path.join(__dirname, '../../design-system/src/tokens');

function format(code) {
  try {
    return prettier.format(code, { parser: 'typescript' });
  } catch {
    return code;
  }
}

function ensureOut() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}

function writeFile(file, content) {
  fs.writeFileSync(path.join(OUT_DIR, file), format(content), 'utf8');
  console.log('✅ Wrote', file);
}

function main() {
  console.log('🔧 Generating comprehensive design tokens...\n');

  if (!fs.existsSync(TOKENS_JSON)) {
    console.error('❌ tokens.json not found at:', TOKENS_JSON);
    process.exit(1);
  }

  const tokens = JSON.parse(fs.readFileSync(TOKENS_JSON, 'utf8'));
  ensureOut();

  // ============================================================================
  // colors.ts - Comprehensive color system
  // ============================================================================
  const colorsContent = `
/**
 * Rodistaa Color Tokens
 * Source: tokens.json
 * Generated: ${new Date().toISOString()}
 */

export const RodistaaColors = {
  // Primary Brand Colors with variants
  primary: {
    main: "${tokens.color.primary}",
    light: "#E03C3C",
    dark: "#8B0909",
    contrast: "${tokens.color.white}",
  },
  
  // Secondary color (neutral)
  secondary: {
    main: "${tokens.color.gray}",
    light: "${tokens.color.lightGray}",
    dark: "#2A2A2A",
    contrast: "${tokens.color.white}",
  },
  
  // Neutral Colors with variants
  white: {
    main: "${tokens.color.white}",
    default: "${tokens.color.white}",
  },
  
  black: {
    main: "${tokens.color.black}",
    default: "${tokens.color.black}",
  },
  
  gray: {
    main: "${tokens.color.gray}",
    light: "#8F8F8F",
    dark: "#2A2A2A",
  },
  
  lightGray: {
    main: "${tokens.color.lightGray}",
    light: "#FAFAFA",
    dark: "#E0E0E0",
    default: "${tokens.color.lightGray}",
  },
  
  // Semantic Colors with variants
  success: {
    main: "${tokens.color.success}",
    light: "#4CD694",
    dark: "#0F8A4E",
    contrast: "${tokens.color.white}",
  },
  
  warning: {
    main: "${tokens.color.warning}",
    light: "#FECD5D",
    dark: "#D99A0F",
    contrast: "${tokens.color.black}",
  },
  
  error: {
    main: "${tokens.color.error}",
    light: "#F25252",
    dark: "#B92323",
    contrast: "${tokens.color.white}",
  },
  
  info: {
    main: "${tokens.color.info}",
    light: "#66A6F4",
    dark: "#1D5CB5",
    contrast: "${tokens.color.white}",
  },
  
  // Extended palette
  background: {
    default: "${tokens.color.white}",
    paper: "${tokens.color.white}",
    light: "#FAFAFA",
  },
  
  surface: {
    default: "${tokens.color.white}",
    elevated: "${tokens.color.white}",
  },
  
  border: {
    default: "${tokens.color.lightGray}",
    light: "#F0F0F0",
    dark: "${tokens.color.gray}",
  },
  
  disabled: {
    default: "${tokens.color.lightGray}",
    text: "#AAAAAA",
  },
  
  // Text colors
  text: {
    primary: "${tokens.color.black}",
    secondary: "${tokens.color.gray}",
    tertiary: "#8F8F8F",
    disabled: "${tokens.color.lightGray}",
    inverse: "${tokens.color.white}",
    hint: "#AAAAAA",
  },
} as const;

export type RodistaaColorsType = typeof RodistaaColors;
`;
  writeFile('colors.ts', colorsContent);

  // ============================================================================
  // typography.ts - Comprehensive typography system
  // ============================================================================
  const typographyContent = `
/**
 * Rodistaa Typography Tokens
 * Source: tokens.json
 * Generated: ${new Date().toISOString()}
 */

export const RodistaaTypography = {
  fonts: {
    heading: "${tokens.typography.heading}",
    body: "${tokens.typography.body}",
    system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  lineHeights: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },
  
  fontWeights: {
    regular: "400" as const,
    medium: "500" as const,
    bold: "700" as const,
  },
} as const;

// Mobile-specific text styles
export const MobileTextStyles = {
  h1: {
    fontFamily: RodistaaTypography.fonts.heading,
    fontSize: RodistaaTypography.fontSizes.xxxl,
    fontWeight: RodistaaTypography.fontWeights.bold,
    lineHeight: RodistaaTypography.fontSizes.xxxl * RodistaaTypography.lineHeights.tight,
  },
  h2: {
    fontFamily: RodistaaTypography.fonts.heading,
    fontSize: RodistaaTypography.fontSizes.xxl,
    fontWeight: RodistaaTypography.fontWeights.bold,
    lineHeight: RodistaaTypography.fontSizes.xxl * RodistaaTypography.lineHeights.tight,
  },
  h3: {
    fontFamily: RodistaaTypography.fonts.heading,
    fontSize: RodistaaTypography.fontSizes.xl,
    fontWeight: RodistaaTypography.fontWeights.bold,
    lineHeight: RodistaaTypography.fontSizes.xl * RodistaaTypography.lineHeights.normal,
  },
  body: {
    fontFamily: RodistaaTypography.fonts.body,
    fontSize: RodistaaTypography.fontSizes.md,
    fontWeight: RodistaaTypography.fontWeights.regular,
    lineHeight: RodistaaTypography.fontSizes.md * RodistaaTypography.lineHeights.normal,
  },
  bodySmall: {
    fontFamily: RodistaaTypography.fonts.body,
    fontSize: RodistaaTypography.fontSizes.sm,
    fontWeight: RodistaaTypography.fontWeights.regular,
    lineHeight: RodistaaTypography.fontSizes.sm * RodistaaTypography.lineHeights.normal,
  },
  caption: {
    fontFamily: RodistaaTypography.fonts.body,
    fontSize: RodistaaTypography.fontSizes.xs,
    fontWeight: RodistaaTypography.fontWeights.regular,
    lineHeight: RodistaaTypography.fontSizes.xs * RodistaaTypography.lineHeights.normal,
  },
  label: {
    fontFamily: RodistaaTypography.fonts.body,
    fontSize: RodistaaTypography.fontSizes.sm,
    fontWeight: RodistaaTypography.fontWeights.medium,
    lineHeight: RodistaaTypography.fontSizes.sm * RodistaaTypography.lineHeights.normal,
  },
  button: {
    fontFamily: RodistaaTypography.fonts.heading,
    fontSize: RodistaaTypography.fontSizes.md,
    fontWeight: RodistaaTypography.fontWeights.bold,
    lineHeight: RodistaaTypography.fontSizes.md * RodistaaTypography.lineHeights.tight,
  },
} as const;

// Web-specific text styles
export const WebTextStyles = {
  h1: {
    fontFamily: RodistaaTypography.fonts.heading,
    fontSize: '32px',
    fontWeight: RodistaaTypography.fontWeights.bold,
    lineHeight: '1.1',
  },
  h2: {
    fontFamily: RodistaaTypography.fonts.heading,
    fontSize: '24px',
    fontWeight: RodistaaTypography.fontWeights.bold,
    lineHeight: '1.2',
  },
  h3: {
    fontFamily: RodistaaTypography.fonts.heading,
    fontSize: '20px',
    fontWeight: RodistaaTypography.fontWeights.bold,
    lineHeight: '1.3',
  },
  body: {
    fontFamily: RodistaaTypography.fonts.body,
    fontSize: '16px',
    fontWeight: RodistaaTypography.fontWeights.regular,
    lineHeight: '1.5',
  },
  bodySmall: {
    fontFamily: RodistaaTypography.fonts.body,
    fontSize: '14px',
    fontWeight: RodistaaTypography.fontWeights.regular,
    lineHeight: '1.5',
  },
  caption: {
    fontFamily: RodistaaTypography.fonts.body,
    fontSize: '12px',
    fontWeight: RodistaaTypography.fontWeights.regular,
    lineHeight: '1.4',
  },
} as const;

export type RodistaaTypographyType = typeof RodistaaTypography;
export type MobileTextStylesType = typeof MobileTextStyles;
export type WebTextStylesType = typeof WebTextStyles;
`;
  writeFile('typography.ts', typographyContent);

  // ============================================================================
  // spacing.ts - Comprehensive spacing and layout system
  // ============================================================================
  const spacingContent = `
/**
 * Rodistaa Spacing & Layout Tokens
 * Source: tokens.json
 * Generated: ${new Date().toISOString()}
 */

export const RodistaaSpacing = {
  // Base spacing scale
  xxs: 2,
  xs: ${tokens.spacing['4']},
  sm: ${tokens.spacing['8']},
  md: ${tokens.spacing['12']},
  base: ${tokens.spacing['16']},
  lg: ${tokens.spacing['24']},
  xl: ${tokens.spacing['32']},
  xxl: ${tokens.spacing['48']},
  
  // Component-specific
  component: {
    horizontal: ${tokens.spacing['16']},
    vertical: ${tokens.spacing['12']},
  },
  
  layout: {
    screen: ${tokens.spacing['16']},
    section: ${tokens.spacing['24']},
    item: ${tokens.spacing['12']},
  },
  
  buttonPadding: ${tokens.spacing['16']},
  inputPadding: ${tokens.spacing['12']},
  cardPadding: ${tokens.spacing['16']},
  screenPadding: ${tokens.spacing['16']},
  
  // Touch targets
  touchTarget: 44,
  minTouchTarget: 44,
  
  // Border radius
  borderRadius: {
    none: 0,
    sm: ${tokens.radius.sm},
    md: ${tokens.radius.md},
    lg: ${tokens.radius.lg},
    xl: ${tokens.radius.xl},
    full: 9999,
  },
  
  // Component sizes
  buttonHeight: ${tokens.sizes.buttonHeight},
  inputHeight: ${tokens.sizes.inputHeight},
  iconSize: ${tokens.sizes.iconSize},
  modalPadding: ${tokens.sizes.modalPadding},
} as const;

// React Native shadow styles
export const RNShadowStyles = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// Web shadow styles
export const WebShadowStyles = {
  sm: "${tokens.shadow.sm}",
  md: "${tokens.shadow.md}",
  lg: "${tokens.shadow.lg}",
} as const;

export type RodistaaSpacingType = typeof RodistaaSpacing;
export type RNShadowStylesType = typeof RNShadowStyles;
export type WebShadowStylesType = typeof WebShadowStyles;
`;
  writeFile('spacing.ts', spacingContent);

  // ============================================================================
  // animations.ts - Animation tokens
  // ============================================================================
  const animationsContent = `
/**
 * Rodistaa Animation Tokens
 * Generated: ${new Date().toISOString()}
 */

export const RodistaaAnimations = {
  duration: {
    fast: 120,
    normal: 180,
    slow: 300,
  },
  
  easing: {
    easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  },
} as const;

export type RodistaaAnimationsType = typeof RodistaaAnimations;
`;
  writeFile('animations.ts', animationsContent);

  // ============================================================================
  // index.ts - Re-export everything
  // ============================================================================
  const indexContent = `
/**
 * Rodistaa Design Tokens - Main Export
 * Generated: ${new Date().toISOString()}
 */

export {
  RodistaaColors,
  type RodistaaColorsType,
} from './colors';

export {
  RodistaaTypography,
  MobileTextStyles,
  WebTextStyles,
  type RodistaaTypographyType,
  type MobileTextStylesType,
  type WebTextStylesType,
} from './typography';

export {
  RodistaaSpacing,
  RNShadowStyles,
  WebShadowStyles,
  type RodistaaSpacingType,
  type RNShadowStylesType,
  type WebShadowStylesType,
} from './spacing';

export {
  RodistaaAnimations,
  type RodistaaAnimationsType,
} from './animations';

// Combined theme object
export const RodistaaTheme = {
  colors: RodistaaColors,
  typography: RodistaaTypography,
  spacing: RodistaaSpacing,
  animations: RodistaaAnimations,
} as const;

export type RodistaaThemeType = typeof RodistaaTheme;
`;
  writeFile('index.ts', indexContent);

  console.log('\n✅ Token generation complete!');
  console.log('📁 Output:', OUT_DIR);
  console.log('📊 Files generated: colors.ts, typography.ts, spacing.ts, animations.ts, index.ts\n');
}

main();

