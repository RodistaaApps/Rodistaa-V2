/**
 * Shipments API Service
 */

// import { apiClient } from '@rodistaa/mobile-shared';
// TODO: Re-enable when mobile-shared package is properly configured for web

export interface Shipment {
  id: string;
  bookingId: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  progress: number; // 0-100
  from: string;
  to: string;
  truck: string;
  driver: string;
  eta: string | null;
  lastUpdate: string;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  distance?: number;
  currentLocation?: { lat: number; lng: number };
}

export const shipmentService = {
  async getShipments(status?: string): Promise<Shipment[]> {
    try {
      // TODO: Replace with actual API call
      // return await apiClient.get<Shipment[]>('/operator/shipments', { status });
      
      // Mock data
      return [
        {
          id: 'SHP-001',
          bookingId: 'BKG-002',
          status: 'in_transit',
          progress: 65,
          from: 'Delhi',
          to: 'Bangalore',
          truck: 'DL 01 AB 1234',
          driver: 'Ramesh Kumar',
          eta: '2 hours',
          lastUpdate: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          distance: 2150,
        },
        {
          id: 'SHP-002',
          bookingId: 'BKG-005',
          status: 'pending',
          progress: 0,
          from: 'Mumbai',
          to: 'Pune',
          truck: 'MH 12 CD 9012',
          driver: 'Suresh Reddy',
          eta: null,
          lastUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          distance: 120,
        },
      ];
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
      return [];
    }
  },

  async getShipmentDetails(id: string): Promise<Shipment> {
    try {
      // TODO: Replace with actual API call
      // return await apiClient.get<Shipment>(`/shipments/${id}`);
      throw new Error('Not implemented - backend integration required');
    } catch (error) {
      console.error('Failed to fetch shipment details:', error);
      throw error;
    }
  },

  async updateShipmentDriver(id: string, driverId: string): Promise<Shipment> {
    try {
      // TODO: Replace with actual API call
      // return await apiClient.put<Shipment>(`/shipments/${id}/driver`, { driverId });
      throw new Error('Not implemented - backend integration required');
    } catch (error) {
      console.error('Failed to update driver:', error);
      throw error;
    }
  },
};

