/**
 * Central Route Name Constants
 * Single source of truth for all route names across mobile apps
 */

export const RouteNames = {
  // Auth Stack
  AUTH_WELCOME: 'auth/welcome',
  OTP_LOGIN: 'auth/otp-login',
  KYC_UPLOAD: 'auth/kyc-upload',
  
  // Shipper Routes
  SHIPPER_HOME: 'shipper/(tabs)/home',
  SHIPPER_POST_LOAD: 'shipper/bookings/create',
  SHIPPER_BOOKING_DETAIL: 'shipper/bookings/[id]',
  SHIPPER_BIDS_LIST: 'shipper/bookings/[id]/bids',
  SHIPPER_MY_BOOKINGS: 'shipper/(tabs)/bookings',
  SHIPPER_LIVE_TRACKING: 'shipper/shipments/[id]/track',
  
  // Operator Routes
  OPERATOR_HOME: 'operator/(tabs)/home',
  OPERATOR_TRUCK_LIST: 'operator/(tabs)/fleet',
  OPERATOR_TRUCK_DETAIL: 'operator/fleet/[id]',
  OPERATOR_INSPECTION_HISTORY: 'operator/fleet/[id]/inspections',
  OPERATOR_AVAILABLE_BOOKINGS: 'operator/(tabs)/bookings',
  OPERATOR_BID_MODAL: 'operator/bookings/[id]/bid',
  OPERATOR_DRIVER_LIST: 'operator/(tabs)/drivers',
  OPERATOR_DRIVER_DETAIL: 'operator/drivers/[id]',
  
  // Driver Routes
  DRIVER_HOME: 'driver/(tabs)/home',
  DRIVER_ASSIGNED_TRIPS: 'driver/(tabs)/shipments',
  DRIVER_TRIP_DETAIL: 'driver/shipments/[id]',
  DRIVER_START_TRIP: 'driver/shipments/[id]/start',
  DRIVER_PICKUP_PHOTO: 'driver/shipments/[id]/pickup',
  DRIVER_DROP_PHOTO: 'driver/shipments/[id]/drop',
  DRIVER_POD_UPLOAD: 'driver/shipments/[id]/pod',
  DRIVER_COMPLETE_OTP: 'driver/shipments/[id]/complete',
  
  // Global Modals
  CAMERA_MODAL: 'modals/camera',
  PDF_VIEWER_MODAL: 'modals/pdf-viewer',
  CONFIRM_MODAL: 'modals/confirm',
  NEGOTIATE_MODAL: 'modals/negotiate',
  OTP_VERIFICATION_MODAL: 'modals/otp-verification',
  UPLOAD_QUEUE_STATUS: 'modals/upload-queue',
  CONFLICT_MODAL: 'modals/conflict',
  UPLOAD_FAILURE_MODAL: 'modals/upload-failure',
  SOS_MODAL: 'modals/sos',
  
  // Activity/Account (shared)
  ACTIVITY_TAB: '(tabs)/activity',
  ACCOUNT_TAB: '(tabs)/account',
  PROFILE: 'account/profile',
  SETTINGS: 'account/settings',
  NOTIFICATIONS: 'activity/notifications',
  ACS_ALERTS: 'activity/acs-alerts',
} as const;

export type RouteName = typeof RouteNames[keyof typeof RouteNames];

