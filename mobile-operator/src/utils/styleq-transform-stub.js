/**
 * Stub for styleq/transform-localize-style
 * react-native-web expects this export but styleq doesn't provide it
 * This function localizes styles for RTL/LTR support
 */
export function localizeStyle(style, isRTL) {
  if (!style || typeof style !== 'object') {
    return style;
  }
  
  const localized = {};
  for (const key in style) {
    if (style.hasOwnProperty(key)) {
      // For now, just return the style as-is
      // In a real implementation, this would handle RTL transforms
      localized[key] = style[key];
    }
  }
  
  return localized;
}

