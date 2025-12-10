/**
 * Deep Link Mapping
 * Maps universal deep links to app routes
 */

import { RouteNames } from './routeNames';

export interface DeepLinkParams {
  bookingId?: string;
  shipmentId?: string;
  truckId?: string;
  tripId?: string;
  inspectionId?: string;
}

export const DeepLinkMapping = {
  'booking/:id': (params: DeepLinkParams) => {
    // Determine which app based on user role
    if (params.bookingId) {
      return RouteNames.SHIPPER_BOOKING_DETAIL.replace('[id]', params.bookingId);
    }
    return null;
  },
  
  'shipment/:id': (params: DeepLinkParams) => {
    if (params.shipmentId) {
      return RouteNames.DRIVER_TRIP_DETAIL.replace('[id]', params.shipmentId);
    }
    return null;
  },
  
  'truck/:id': (params: DeepLinkParams) => {
    if (params.truckId) {
      return RouteNames.OPERATOR_TRUCK_DETAIL.replace('[id]', params.truckId);
    }
    return null;
  },
  
  'trip/:id': (params: DeepLinkParams) => {
    if (params.tripId) {
      return RouteNames.DRIVER_TRIP_DETAIL.replace('[id]', params.tripId);
    }
    return null;
  },
  
  'inspection/:id': (params: DeepLinkParams) => {
    if (params.inspectionId && params.truckId) {
      return RouteNames.OPERATOR_INSPECTION_HISTORY.replace('[id]', params.truckId);
    }
    return null;
  },
};

/**
 * Parse deep link URL and return route name
 */
export function parseDeepLink(url: string): { route: string; params: DeepLinkParams } | null {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;
    
    // Handle rodistaa:// scheme
    if (url.startsWith('rodistaa://')) {
      const pathOnly = url.replace('rodistaa://', '');
      const [entity, id] = pathOnly.split('/');
      
      const params: DeepLinkParams = {};
      if (entity === 'booking' && id) params.bookingId = id;
      if (entity === 'shipment' && id) params.shipmentId = id;
      if (entity === 'truck' && id) params.truckId = id;
      if (entity === 'trip' && id) params.tripId = id;
      if (entity === 'inspection' && id) params.inspectionId = id;
      
      const key = `${entity}/:id` as keyof typeof DeepLinkMapping;
      const route = DeepLinkMapping[key]?.(params);
      
      if (route) {
        return { route, params };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to parse deep link:', error);
    return null;
  }
}

/**
 * Generate deep link URL from route and params
 */
export function generateDeepLink(entity: 'booking' | 'shipment' | 'truck' | 'trip' | 'inspection', id: string): string {
  return `rodistaa://${entity}/${id}`;
}

