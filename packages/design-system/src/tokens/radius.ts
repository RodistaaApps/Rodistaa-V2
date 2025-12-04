/**
 * Rodistaa Border Radius Tokens
 * Spec: 6px / 8px primary radii
 */
export const radius = {
  sm: 4,
  md: 6,  // Primary small radius
  lg: 8,  // Primary large radius
  xl: 12,
  // Standard Rodistaa radii
  standard: 6,
  large: 8,
} as const;
export type Radius = typeof radius;
