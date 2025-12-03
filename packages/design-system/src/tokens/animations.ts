/**
 * Rodistaa Animation Tokens
 * Generated: 2025-12-03T04:48:11.820Z
 */

export const RodistaaAnimations = {
  duration: {
    fast: 120,
    normal: 180,
    slow: 300,
  },

  easing: {
    easeOut: "cubic-bezier(0.0, 0.0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0.0, 1, 1)",
    easeInOut: "cubic-bezier(0.4, 0.0, 0.2, 1)",
  },
} as const;

export type RodistaaAnimationsType = typeof RodistaaAnimations;
