/**
 * Truck/Fleet API Service
 */

// import { apiClient } from '@rodistaa/mobile-shared';
// TODO: Re-enable when mobile-shared package is properly configured for web

export interface Truck {
  id: string;
  registrationNumber: string;
  vehicleType: string;
  capacityTons: number;
  bodyType: string;
  status: 'ACTIVE' | 'PENDING_INSPECTION' | 'BLOCKED' | 'MAINTENANCE';
  inspectionDue: string;
  driver: string | null;
  ownerName?: string;
  ownerPhone?: string;
  insuranceExpiry?: string;
  permitExpiry?: string;
}

export const truckService = {
  async getTrucks(): Promise<Truck[]> {
    try {
      // TODO: Replace with actual API call
      // return await apiClient.get<Truck[]>('/operator/trucks');
      
      // Mock data
      return [
        {
          id: '1',
          registrationNumber: 'DL 01 AB 1234',
          vehicleType: 'Container 20ft',
          capacityTons: 10,
          bodyType: 'Container',
          status: 'ACTIVE',
          inspectionDue: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
          driver: 'Ramesh Kumar',
        },
        {
          id: '2',
          registrationNumber: 'HR 26 BX 5678',
          vehicleType: 'Open Body 14ft',
          capacityTons: 7.5,
          bodyType: 'Open Body',
          status: 'PENDING_INSPECTION',
          inspectionDue: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          driver: null,
        },
        {
          id: '3',
          registrationNumber: 'MH 12 CD 9012',
          vehicleType: 'Trailer 32ft',
          capacityTons: 25,
          bodyType: 'Trailer',
          status: 'ACTIVE',
          inspectionDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          driver: 'Suresh Reddy',
        },
        {
          id: '4',
          registrationNumber: 'GJ 05 EF 3456',
          vehicleType: 'Tanker',
          capacityTons: 20,
          bodyType: 'Tanker',
          status: 'BLOCKED',
          inspectionDue: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          driver: null,
        },
        {
          id: '5',
          registrationNumber: 'KA 01 GH 7890',
          vehicleType: 'Container 20ft',
          capacityTons: 10,
          bodyType: 'Container',
          status: 'ACTIVE',
          inspectionDue: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          driver: 'Vijay Kumar',
        },
      ];
    } catch (error) {
      console.error('Failed to fetch trucks:', error);
      return [];
    }
  },

  async addTruck(data: Partial<Truck>): Promise<Truck> {
    try {
      // TODO: Replace with actual API call
      // return await apiClient.post<Truck>('/operator/trucks', data);
      throw new Error('Not implemented - backend integration required');
    } catch (error) {
      console.error('Failed to add truck:', error);
      throw error;
    }
  },

  async updateTruck(id: string, data: Partial<Truck>): Promise<Truck> {
    try {
      // TODO: Replace with actual API call
      // return await apiClient.put<Truck>(`/operator/trucks/${id}`, data);
      throw new Error('Not implemented - backend integration required');
    } catch (error) {
      console.error('Failed to update truck:', error);
      throw error;
    }
  },
};

