/**
 * Rodistaa Color Tokens
 * Primary: #C90D0D (Rodistaa Red)
 */
export const colors = {
  primary: "#C90D0D",  // Rodistaa Red - Primary brand color
  white: "#FFFFFF",
  black: "#1A1A1A",
  gray: "#4F4F4F",
  lightGray: "#F4F4F4",
  success: "#17B169",
  warning: "#FDBA21",
  error: "#E03131",
  info: "#2F80ED",
  // Extended palette
  primaryDark: "#A00A0A",
  primaryLight: "#FF1A1A",
  gray50: "#FAFAFA",
  gray100: "#F4F4F4",
  gray200: "#E0E0E0",
  gray300: "#CCCCCC",
  gray400: "#999999",
  gray500: "#666666",
  gray600: "#4F4F4F",
  gray700: "#333333",
  gray800: "#1A1A1A",
  gray900: "#000000",
} as const;

// React Native compatible color object
export const RodistaaColors = {
  primary: {
    main: "#C90D0D",
    dark: "#A00A0A",
    light: "#FF1A1A",
    contrast: "#FFFFFF",
  },
  secondary: {
    main: "#4F4F4F",
    dark: "#333333",
    light: "#666666",
    contrast: "#FFFFFF",
  },
  error: {
    main: "#E03131",
    dark: "#B02525",
    light: "#FF4D4D",
    contrast: "#FFFFFF",
  },
  success: {
    main: "#17B169",
    dark: "#128A54",
    light: "#1FD87E",
    contrast: "#FFFFFF",
  },
  warning: {
    main: "#FDBA21",
    dark: "#CC951A",
    light: "#FFC947",
    contrast: "#1A1A1A",
  },
  info: {
    main: "#2F80ED",
    dark: "#2566BE",
    light: "#4A9EFF",
    contrast: "#FFFFFF",
  },
  background: {
    default: "#FFFFFF",
    paper: "#F4F4F4",
    dark: "#1A1A1A",
    overlay: "rgba(0, 0, 0, 0.5)",
  },
  text: {
    primary: "#1A1A1A",
    secondary: "#4F4F4F",
    disabled: "#CCCCCC",
    hint: "#999999",
    inverse: "#FFFFFF",
  },
  border: {
    default: "#D9D9D9",
    light: "#E0E0E0",
    dark: "#CCCCCC",
  },
  status: {
    draft: "#999999",
    published: "#2F80ED",
    confirmed: "#17B169",
    pending: "#FDBA21",
    accepted: "#17B169",
    rejected: "#E03131",
    inTransit: "#2F80ED",
    delivered: "#17B169",
    completed: "#17B169",
    cancelled: "#E03131",
    blocked: "#4F4F4F",
    active: "#2F80ED",
    approved: "#17B169",
    inProgress: "#2F80ED",
    onHold: "#FDBA21",
  },
} as const;

export type Colors = typeof colors;
export type RodistaaColorsType = typeof RodistaaColors;
