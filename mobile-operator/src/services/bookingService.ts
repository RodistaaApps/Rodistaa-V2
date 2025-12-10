/**
 * Bookings API Service
 */

// import { apiClient } from '@rodistaa/mobile-shared';
// TODO: Re-enable when mobile-shared package is properly configured for web

export interface Booking {
  id: string;
  pickup: {
    address: string;
    city: string;
    state: string;
    pincode?: string;
    coordinates?: { lat: number; lng: number };
  };
  drop: {
    address: string;
    city: string;
    state: string;
    pincode?: string;
    coordinates?: { lat: number; lng: number };
  };
  tonnage: number;
  priceRange: { min: number; max: number };
  status: 'OPEN_FOR_BIDDING' | 'BIDDING_CLOSED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  bidCount: number;
  pickupDate: string;
  material: string;
  distance: number;
  materialType?: string;
  specialRequirements?: string;
}

export interface Bid {
  id: string;
  bookingId: string;
  amount: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export const bookingService = {
  async getBookings(filters?: {
    status?: string;
    city?: string;
    minTonnage?: number;
  }): Promise<Booking[]> {
    try {
      // TODO: Replace with actual API call
      // return await apiClient.get<Booking[]>('/bookings', filters);
      
      // Mock data
      return [
        {
          id: 'BKG-001',
          pickup: {
            address: '123 Main Street, Sector 15',
            city: 'Hyderabad',
            state: 'Telangana',
          },
          drop: {
            address: '456 Park Avenue, Andheri West',
            city: 'Mumbai',
            state: 'Maharashtra',
          },
          tonnage: 5,
          priceRange: { min: 45000, max: 55000 },
          status: 'OPEN_FOR_BIDDING',
          bidCount: 4,
          pickupDate: '2025-12-06',
          material: 'Electronics',
          distance: 710,
        },
        {
          id: 'BKG-002',
          pickup: {
            address: '789 Market Road',
            city: 'Delhi',
            state: 'Delhi',
          },
          drop: {
            address: '321 Tower Street, Whitefield',
            city: 'Bangalore',
            state: 'Karnataka',
          },
          tonnage: 12,
          priceRange: { min: 85000, max: 95000 },
          status: 'OPEN_FOR_BIDDING',
          bidCount: 6,
          pickupDate: '2025-12-07',
          material: 'Machinery Parts',
          distance: 2150,
        },
        {
          id: 'BKG-003',
          pickup: {
            address: '555 Tech Park',
            city: 'Chennai',
            state: 'Tamil Nadu',
          },
          drop: {
            address: '777 Business Hub',
            city: 'Pune',
            state: 'Maharashtra',
          },
          tonnage: 8,
          priceRange: { min: 35000, max: 45000 },
          status: 'OPEN_FOR_BIDDING',
          bidCount: 2,
          pickupDate: '2025-12-08',
          material: 'Textiles',
          distance: 1200,
        },
      ];
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      return [];
    }
  },

  async getMyBids(): Promise<Bid[]> {
    try {
      // TODO: Replace with actual API call
      // return await apiClient.get<Bid[]>('/operator/bids');
      return [];
    } catch (error) {
      console.error('Failed to fetch bids:', error);
      return [];
    }
  },

  async placeBid(bookingId: string, amount: number): Promise<Bid> {
    try {
      // TODO: Replace with actual API call
      // return await apiClient.post<Bid>(`/bookings/${bookingId}/bid`, { amount });
      throw new Error('Not implemented - backend integration required');
    } catch (error) {
      console.error('Failed to place bid:', error);
      throw error;
    }
  },
};

