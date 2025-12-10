/**
 * Stub for react-native-reanimated
 * Used when react-native-reanimated is not installed
 * Provides minimal API surface to prevent import errors
 */

// Minimal reanimated stub for web
export default {
  default: {
    Value: class Value {},
    event: () => ({}),
    add: () => {},
    sub: () => {},
    multiply: () => {},
    divide: () => {},
    pow: () => {},
    modulo: () => {},
    sqrt: () => {},
    sin: () => {},
    cos: () => {},
    exp: () => {},
    round: () => {},
    lessThan: () => {},
    eq: () => {},
    greaterThan: () => {},
    lessOrEq: () => {},
    greaterOrEq: () => {},
    neq: () => {},
    and: () => {},
    or: () => {},
    defined: () => {},
    not: () => {},
    set: () => {},
    concat: () => {},
    cond: () => {},
    block: () => {},
    call: () => {},
    debug: () => {},
    onChange: () => {},
    startClock: () => {},
    stopClock: () => {},
    clockRunning: () => {},
    timing: () => {},
    decay: () => {},
    spring: () => {},
    proc: () => {},
    useSharedValue: () => ({ value: 0 }),
    useAnimatedStyle: () => ({}),
    useAnimatedReaction: () => {},
    useAnimatedGestureHandler: () => {},
    useAnimatedScrollHandler: () => {},
    withTiming: (value) => value,
    withSpring: (value) => value,
    withDecay: (value) => value,
    cancelAnimation: () => {},
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
    createAnimatedComponent: (component) => component,
    interpolate: (value, input, output) => output[0],
    Extrapolate: {
      EXTEND: 'extend',
      CLAMP: 'clamp',
      IDENTITY: 'identity',
    },
    Extrapolation: {
      EXTEND: 'extend',
      CLAMP: 'clamp',
      IDENTITY: 'identity',
    },
  },
};

// Export common functions
export const Value = class Value {};
export const event = () => ({});
export const createAnimatedComponent = (component) => component;
export const useSharedValue = () => ({ value: 0 });
export const useAnimatedStyle = () => ({});
export const withTiming = (value) => value;
export const withSpring = (value) => value;

