/**
 * Rodistaa Typography Tokens
 * Heading: Baloo Bhai
 * Body: Times New Roman
 */
export const typography = {
  heading: "Baloo Bhai",
  body: "Times New Roman",
} as const;

// React Native compatible typography styles
export const MobileTextStyles = {
  h1: {
    fontFamily: "Baloo Bhai",
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 40,
    color: "#1A1A1A",
  },
  h2: {
    fontFamily: "Baloo Bhai",
    fontSize: 24,
    fontWeight: "600" as const,
    lineHeight: 32,
    color: "#1A1A1A",
  },
  h3: {
    fontFamily: "Baloo Bhai",
    fontSize: 20,
    fontWeight: "600" as const,
    lineHeight: 28,
    color: "#1A1A1A",
  },
  h4: {
    fontFamily: "Baloo Bhai",
    fontSize: 18,
    fontWeight: "600" as const,
    lineHeight: 24,
    color: "#1A1A1A",
  },
  body: {
    fontFamily: "Times New Roman",
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
    color: "#1A1A1A",
  },
  bodySmall: {
    fontFamily: "Times New Roman",
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
    color: "#4F4F4F",
  },
  caption: {
    fontFamily: "Times New Roman",
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
    color: "#666666",
  },
  button: {
    fontFamily: "Baloo Bhai",
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 24,
  },
  label: {
    fontFamily: "Times New Roman",
    fontSize: 14,
    fontWeight: "600" as const,
    lineHeight: 20,
    color: "#1A1A1A",
  },
} as const;

// Web typography styles (CSS-compatible)
export const WebTextStyles = {
  h1: {
    fontFamily: '"Baloo Bhai", sans-serif',
    fontSize: '32px',
    fontWeight: '700',
    lineHeight: '40px',
    color: '#1A1A1A',
  },
  h2: {
    fontFamily: '"Baloo Bhai", sans-serif',
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '32px',
    color: '#1A1A1A',
  },
  h3: {
    fontFamily: '"Baloo Bhai", sans-serif',
    fontSize: '20px',
    fontWeight: '600',
    lineHeight: '28px',
    color: '#1A1A1A',
  },
  h4: {
    fontFamily: '"Baloo Bhai", sans-serif',
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: '24px',
    color: '#1A1A1A',
  },
  body: {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '24px',
    color: '#1A1A1A',
  },
  bodySmall: {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '20px',
    color: '#4F4F4F',
  },
  caption: {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '12px',
    fontWeight: '400',
    lineHeight: '16px',
    color: '#666666',
  },
  button: {
    fontFamily: '"Baloo Bhai", sans-serif',
    fontSize: '16px',
    fontWeight: '600',
    lineHeight: '24px',
  },
  label: {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '14px',
    fontWeight: '600',
    lineHeight: '20px',
    color: '#1A1A1A',
  },
} as const;

export type Typography = typeof typography;
export type MobileTextStylesType = typeof MobileTextStyles;
export type WebTextStylesType = typeof WebTextStyles;
