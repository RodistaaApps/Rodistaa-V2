/**
 * Navigation Guards
 * RBAC, KYC, and business rule guards for route protection
 */

import { SecureStorage } from '../storage/secureStorage';
import { RouteNames } from './routeNames';

export interface UserAuth {
  token: string;
  role: 'SHIPPER' | 'OPERATOR' | 'DRIVER';
  kycStatus: 'pending' | 'verified' | 'rejected';
  userId: string;
}

export interface TruckStatus {
  id: string;
  docsExpired: boolean;
  inspectionDue: boolean;
  blocked: boolean;
}

export interface GuardResult {
  allowed: boolean;
  redirectTo?: string;
  reason?: string;
}

/**
 * Check if user is authenticated
 */
export async function checkAuth(): Promise<GuardResult> {
  try {
    const token = await SecureStorage.getToken();
    if (!token) {
      return {
        allowed: false,
        redirectTo: RouteNames.OTP_LOGIN,
        reason: 'Not authenticated',
      };
    }
    return { allowed: true };
  } catch (error) {
    return {
      allowed: false,
      redirectTo: RouteNames.OTP_LOGIN,
      reason: 'Auth check failed',
    };
  }
}

/**
 * Check if user has required role
 */
export function checkRole(user: UserAuth | null, requiredRole: 'SHIPPER' | 'OPERATOR' | 'DRIVER'): GuardResult {
  if (!user) {
    return {
      allowed: false,
      redirectTo: RouteNames.OTP_LOGIN,
      reason: 'Not authenticated',
    };
  }
  
  if (user.role !== requiredRole) {
    return {
      allowed: false,
      redirectTo: RouteNames.AUTH_WELCOME,
      reason: `Requires ${requiredRole} role`,
    };
  }
  
  return { allowed: true };
}

/**
 * Check if user KYC is verified
 */
export function checkKYC(user: UserAuth | null, requireVerified: boolean = true): GuardResult {
  if (!user) {
    return {
      allowed: false,
      redirectTo: RouteNames.OTP_LOGIN,
      reason: 'Not authenticated',
    };
  }
  
  if (requireVerified && user.kycStatus !== 'verified') {
    return {
      allowed: false,
      redirectTo: RouteNames.KYC_UPLOAD,
      reason: 'KYC verification required',
    };
  }
  
  return { allowed: true };
}

/**
 * Check if truck is eligible for bidding
 */
export function checkTruckEligibility(truck: TruckStatus | null): GuardResult {
  if (!truck) {
    return {
      allowed: false,
      reason: 'Truck not found',
    };
  }
  
  if (truck.blocked) {
    return {
      allowed: false,
      reason: 'Truck is blocked',
    };
  }
  
  if (truck.docsExpired) {
    return {
      allowed: false,
      reason: 'Truck documents expired',
    };
  }
  
  if (truck.inspectionDue) {
    return {
      allowed: false,
      reason: 'Truck inspection due',
    };
  }
  
  return { allowed: true };
}

/**
 * Check if booking has active bid (one active bid per operator per booking rule)
 */
export function checkActiveBid(hasActiveBid: boolean): GuardResult {
  if (hasActiveBid) {
    return {
      allowed: false,
      reason: 'You already have an active bid for this booking',
    };
  }
  
  return { allowed: true };
}

/**
 * Combined guard for operator bidding routes
 */
export async function guardOperatorBidRoute(
  user: UserAuth | null,
  truck: TruckStatus | null,
  hasActiveBid: boolean
): Promise<GuardResult> {
  // Check auth
  const authResult = await checkAuth();
  if (!authResult.allowed) return authResult;
  
  // Check role
  const roleResult = checkRole(user, 'OPERATOR');
  if (!roleResult.allowed) return roleResult;
  
  // Check KYC
  const kycResult = checkKYC(user, true);
  if (!kycResult.allowed) return kycResult;
  
  // Check truck eligibility
  const truckResult = checkTruckEligibility(truck);
  if (!truckResult.allowed) return truckResult;
  
  // Check active bid
  const bidResult = checkActiveBid(hasActiveBid);
  if (!bidResult.allowed) return bidResult;
  
  return { allowed: true };
}

/**
 * Guard for driver trip routes
 */
export async function guardDriverTripRoute(user: UserAuth | null): Promise<GuardResult> {
  const authResult = await checkAuth();
  if (!authResult.allowed) return authResult;
  
  const roleResult = checkRole(user, 'DRIVER');
  if (!roleResult.allowed) return roleResult;
  
  const kycResult = checkKYC(user, true);
  if (!kycResult.allowed) return kycResult;
  
  return { allowed: true };
}

/**
 * Guard for shipper booking routes
 */
export async function guardShipperBookingRoute(user: UserAuth | null): Promise<GuardResult> {
  const authResult = await checkAuth();
  if (!authResult.allowed) return authResult;
  
  const roleResult = checkRole(user, 'SHIPPER');
  if (!roleResult.allowed) return roleResult;
  
  const kycResult = checkKYC(user, true);
  if (!kycResult.allowed) return kycResult;
  
  return { allowed: true };
}

