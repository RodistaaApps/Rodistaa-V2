// Export individual tokens
export { colors, RodistaaColors } from "./colors";
export { spacing, RodistaaSpacing, RNShadowStyles } from "./spacing";
export { radius } from "./radius";
export { typography, MobileTextStyles, WebTextStyles } from "./typography";
export { sizes } from "./sizes";
export { shadows } from "./shadows";
export { RodistaaAnimations } from "./animations";

// Import for unified theme
import { RodistaaColors } from "./colors";
import { RodistaaSpacing } from "./spacing";
import { radius } from "./radius";
import { typography } from "./typography";
import { sizes } from "./sizes";
import { shadows } from "./shadows";
import { RodistaaAnimations } from "./animations";

// Unified theme export
export const RodistaaTheme = {
  colors: RodistaaColors,
  spacing: RodistaaSpacing,
  radius,
  typography,
  sizes,
  shadows,
  animations: RodistaaAnimations,
} as const;
