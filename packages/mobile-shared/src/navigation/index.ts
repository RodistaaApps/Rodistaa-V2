/**
 * Central Navigation Export
 * Single source of truth for navigation utilities
 */

export { RouteNames } from './routeNames';
export type { RouteName } from './routeNames';

export {
  DeepLinkMapping,
  parseDeepLink,
  generateDeepLink,
} from './deepLinks';
export type { DeepLinkParams } from './deepLinks';

export {
  checkAuth,
  checkRole,
  checkKYC,
  checkTruckEligibility,
  checkActiveBid,
  guardOperatorBidRoute,
  guardDriverTripRoute,
  guardShipperBookingRoute,
} from './guards';
export type { UserAuth, TruckStatus, GuardResult } from './guards';

