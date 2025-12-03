#!/usr/bin/env node
/**
 * Token Generator Script
 * Converts tokens.json (Figma format) → TypeScript files
 * 
 * Usage: pnpm tokens:generate
 */

const fs = require('fs');
const path = require('path');

const TOKENS_JSON = path.join(__dirname, '../tokens/tokens.json');
const OUTPUT_DIR = path.join(__dirname, '../src/tokens');

console.log('🎨 Generating TypeScript tokens from tokens.json...\n');

// Read tokens.json
const tokensData = JSON.parse(fs.readFileSync(TOKENS_JSON, 'utf8'));
const tokens = tokensData.global;

// Generate colors.ts
const colorsContent = `/**
 * Rodistaa Design System - Color Tokens
 * AUTO-GENERATED from tokens.json - DO NOT EDIT MANUALLY
 * Last sync: ${tokensData.$metadata.lastUpdated}
 */

export const RodistaaColors = {
  // PRIMARY BRAND COLORS
  primary: {
    main: '${tokens.color.primary.value}',      // ${tokens.color.primary.description}
    light: '#E85454',     // Lighter red for hover states
    dark: '#A10A0A',      // Darker red for pressed states
    contrast: '${tokens.color.white.value}',  // White text on red backgrounds
  },

  // SECONDARY COLORS
  secondary: {
    main: '${tokens.color.white.value}',      // White
    light: '${tokens.color.lightGray.value}',     // Accent Gray (backgrounds)
    dark: '#E0E0E0',      // Border gray
    contrast: '${tokens.color.black.value}',  // Black text on white backgrounds
  },

  // TEXT COLORS
  text: {
    primary: '${tokens.color.black.value}',   // ${tokens.color.black.description}
    secondary: '${tokens.color.gray.value}', // ${tokens.color.gray.description}
    tertiary: '#888888',  // Light gray (hints, placeholders)
    disabled: '#CCCCCC',  // Disabled text
    inverse: '${tokens.color.white.value}',   // White text (on dark backgrounds)
  },

  // SEMANTIC COLORS
  success: {
    main: '${tokens.color.success.value}',      // ${tokens.color.success.description}
    light: '#E6F7ED',     // Success background
    dark: '#128A51',      // Success dark
    contrast: '${tokens.color.white.value}',  // White text on success
  },

  warning: {
    main: '${tokens.color.warning.value}',      // ${tokens.color.warning.description}
    light: '#FFF8E1',     // Warning background
    dark: '#F29F05',      // Warning dark
    contrast: '${tokens.color.black.value}',  // Black text on warning
  },

  error: {
    main: '${tokens.color.error.value}',      // ${tokens.color.error.description}
    light: '#FFEBEE',     // Error background
    dark: '#C62828',      // Error dark
    contrast: '${tokens.color.white.value}',  // White text on error
  },

  info: {
    main: '${tokens.color.info.value}',      // ${tokens.color.info.description}
    light: '#E3F2FD',     // Info background
    dark: '#1976D2',      // Info dark
    contrast: '${tokens.color.white.value}',  // White text on info
  },

  // BACKGROUND COLORS
  background: {
    default: '${tokens.color.white.value}',   // Main background
    paper: '#FAFAFA',     // Card/surface background
    elevated: '${tokens.color.white.value}',  // Elevated surfaces
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay
  },

  // BORDER COLORS
  border: {
    default: '#E0E0E0',   // Default border
    light: '${tokens.color.lightGray.value}',     // Light border
    dark: '#CCCCCC',      // Dark border
    focus: '${tokens.color.primary.value}',     // Focus state (Rodistaa Red)
  },

  // STATUS BADGE COLORS
  status: {
    draft: '#888888',
    published: '${tokens.color.info.value}',
    confirmed: '${tokens.color.success.value}',
    pending: '${tokens.color.warning.value}',
    accepted: '${tokens.color.success.value}',
    rejected: '${tokens.color.error.value}',
    inTransit: '${tokens.color.info.value}',
    delivered: '${tokens.color.success.value}',
    completed: '#128A51',
    cancelled: '${tokens.color.error.value}',
    blocked: '${tokens.color.error.value}',
  },

  // ROLE-SPECIFIC ACCENT COLORS (subtle differentiation)
  role: {
    shipper: '${tokens.color.primary.value}',   // Rodistaa Red
    operator: '${tokens.color.info.value}',  // Blue
    driver: '${tokens.color.success.value}',    // Green
    admin: '${tokens.color.black.value}',     // Black
    franchise: '#8E24AA', // Purple
  },
} as const;

// Type-safe color access
export type RodistaaColorKey = keyof typeof RodistaaColors;

// Helper function to get color
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let value: any = RodistaaColors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(\`Color path not found: \${path}\`);
      return '#000000';
    }
  }
  
  return value;
};

// Export default for easy import
export default RodistaaColors;
`;

// Generate spacing.ts
const spacingContent = `/**
 * Rodistaa Design System - Spacing Tokens
 * AUTO-GENERATED from tokens.json - DO NOT EDIT MANUALLY
 * Last sync: ${tokensData.$metadata.lastUpdated}
 */

export const RodistaaSpacing = {
  // BASE SPACING SCALE (4px base unit)
  xxs: ${parseInt(tokens.space['4'].value)},   // Extra extra small
  xs: ${parseInt(tokens.space['8'].value)},    // Extra small
  sm: ${parseInt(tokens.space['12'].value)},   // Small
  md: ${parseInt(tokens.space['16'].value)},   // Medium (default)
  lg: ${parseInt(tokens.space['24'].value)},   // Large
  xl: ${parseInt(tokens.space['32'].value)},   // Extra large
  xxl: ${parseInt(tokens.space['48'].value)},  // Extra extra large
  xxxl: 64, // Triple extra large

  // COMPONENT-SPECIFIC SPACING
  component: {
    buttonHeight: ${parseInt(tokens.sizes.button.height.value)},
    buttonPaddingX: ${parseInt(tokens.space['24'].value)},
    buttonPaddingY: ${parseInt(tokens.space['12'].value)},
    inputHeight: ${parseInt(tokens.sizes.input.height.value)},
    inputPaddingX: ${parseInt(tokens.space['16'].value)},
    inputPaddingY: ${parseInt(tokens.space['12'].value)},
    cardPadding: ${parseInt(tokens.space['16'].value)},
    screenPadding: ${parseInt(tokens.space['16'].value)},
    sectionMarginBottom: ${parseInt(tokens.space['24'].value)},
    listItemHeight: 56,
    iconSize: ${parseInt(tokens.sizes.icon.size.value)},
    iconSizeLarge: ${parseInt(tokens.space['32'].value)},
    iconSizeSmall: 20,
  },

  // LAYOUT SPACING
  layout: {
    screenPadding: ${parseInt(tokens.space['16'].value)},
    sectionGap: ${parseInt(tokens.space['24'].value)},
    componentGap: ${parseInt(tokens.space['12'].value)},
    formFieldGap: ${parseInt(tokens.space['16'].value)},
    cardGap: ${parseInt(tokens.space['16'].value)},
    gridGap: ${parseInt(tokens.space['16'].value)},
  },

  // BORDER RADIUS
  borderRadius: {
    none: 0,
    sm: ${parseInt(tokens.radius.sm.value)},
    md: ${parseInt(tokens.radius.md.value)},
    lg: ${parseInt(tokens.radius.lg.value)},    // DEFAULT - Rodistaa standard
    xl: ${parseInt(tokens.radius.xl.value)},
    xxl: 16,
    full: 9999, // For circular elements
  },

  // MINIMUM TOUCH TARGET (Mobile Accessibility)
  touchTarget: {
    minHeight: 44,
    minWidth: 44,
  },

  // ELEVATION (Shadows)
  elevation: {
    none: 0,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },
} as const;

// React Native shadow styles
export const RNShadowStyles = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  sm: {
    shadowColor: '${tokens.shadow.sm.value.color}',
    shadowOffset: { width: ${parseInt(tokens.shadow.sm.value.offsetX)}, height: ${parseInt(tokens.shadow.sm.value.offsetY)} },
    shadowOpacity: 0.08,
    shadowRadius: ${parseInt(tokens.shadow.sm.value.blur)},
    elevation: 1,
  },
  
  md: {
    shadowColor: '${tokens.shadow.md.value.color}',
    shadowOffset: { width: ${parseInt(tokens.shadow.md.value.offsetX)}, height: ${parseInt(tokens.shadow.md.value.offsetY)} },
    shadowOpacity: 0.1,
    shadowRadius: ${parseInt(tokens.shadow.md.value.blur)},
    elevation: 2,
  },
  
  lg: {
    shadowColor: '${tokens.shadow.lg.value.color}',
    shadowOffset: { width: ${parseInt(tokens.shadow.lg.value.offsetX)}, height: ${parseInt(tokens.shadow.lg.value.offsetY)} },
    shadowOpacity: 0.12,
    shadowRadius: ${parseInt(tokens.shadow.lg.value.blur)},
    elevation: 3,
  },
  
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;

// Web box-shadow styles
export const WebShadowStyles = {
  none: 'none',
  sm: '${tokens.shadow.sm.value.offsetX} ${tokens.shadow.sm.value.offsetY} ${tokens.shadow.sm.value.blur} ${tokens.shadow.sm.value.color}',
  md: '${tokens.shadow.md.value.offsetX} ${tokens.shadow.md.value.offsetY} ${tokens.shadow.md.value.blur} ${tokens.shadow.md.value.color}',
  lg: '${tokens.shadow.lg.value.offsetX} ${tokens.shadow.lg.value.offsetY} ${tokens.shadow.lg.value.blur} ${tokens.shadow.lg.value.color}',
  xl: '0 8px 16px rgba(0, 0, 0, 0.08)',
} as const;

export default RodistaaSpacing;
`;

// Write files
fs.writeFileSync(path.join(OUTPUT_DIR, 'colors.ts'), colorsContent);
fs.writeFileSync(path.join(OUTPUT_DIR, 'spacing.ts'), spacingContent);

console.log('✅ Generated colors.ts');
console.log('✅ Generated spacing.ts');
console.log('\n🎉 Token generation complete!');
console.log(`📊 Synced ${Object.keys(tokens.color).length} colors, ${Object.keys(tokens.space).length} spacing values\n`);

