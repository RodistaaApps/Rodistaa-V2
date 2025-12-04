/**
 * Rodistaa Animation Tokens
 * Generated: 2025-12-03T04:48:11.820Z
 */

/**
 * Rodistaa Animation Tokens
 * Spec: 120ms micro-transitions
 */
export const RodistaaAnimations = {
  duration: {
    fast: 120,      // Primary micro-transition (spec requirement)
    normal: 180,
    slow: 300,
  },
  easing: {
    easeOut: "cubic-bezier(0.0, 0.0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0.0, 1, 1)",
    easeInOut: "cubic-bezier(0.4, 0.0, 0.2, 1)",
  },
  // Standard Rodistaa transition
  microTransition: 120, // ms
} as const;

export type RodistaaAnimationsType = typeof RodistaaAnimations;
