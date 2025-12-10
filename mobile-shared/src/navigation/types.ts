/**
 * Navigation Types for React Navigation
 * Shared type definitions for all mobile apps
 */

import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  Permissions: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
  Help: undefined;
};

// Shipper specific
export type ShipperStackParamList = {
  'ShipperHome': undefined;
  'PostLoad': undefined;
  'MyPostings': undefined;
  'LoadDetail': { id: string };
  'BidsViewer': { bookingId: string };
  'LiveTracking': { shipmentId: string };
  'Payments': undefined;
  'BookingHistory': undefined;
  'Chat': undefined;
};

// Operator specific
export type OperatorStackParamList = {
  'OperatorHome': undefined;
  'TruckList': undefined;
  'AddTruck': undefined;
  'TruckDetail': { id: string };
  'BidsCenter': undefined;
  'BidComposer': { bookingId: string };
  'MyShipments': undefined;
  'Ledger': undefined;
  'FranchiseTools': undefined;
};

// Driver specific
export type DriverStackParamList = {
  'DriverHome': undefined;
  'MyTrips': undefined;
  'TripDetail': { id: string };
  'LiveTracking': { tripId: string };
  'Inspection': { truckId: string };
  'PODCapture': { shipmentId: string };
  'DriverProfile': undefined;
  'Alerts': undefined;
};

