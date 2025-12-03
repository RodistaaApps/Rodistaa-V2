export const shadows = {
  sm: "0px 1px 3px rgba(0,0,0,0.08)",
  md: "0px 3px 6px rgba(0,0,0,0.1)",
  lg: "0px 6px 12px rgba(0,0,0,0.12)",
} as const;
export type Shadows = typeof shadows;
