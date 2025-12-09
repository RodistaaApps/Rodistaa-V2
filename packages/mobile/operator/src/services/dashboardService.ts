/**
 * Dashboard API Service
 */

// import { apiClient } from '@rodistaa/mobile-shared';
// TODO: Re-enable when mobile-shared package is properly configured for web

export interface DashboardData {
  activeTrucks: number;
  activeShipments: number;
  activeBids: number;
  pendingInspections: number;
  winsToday: number;
  mtdEarnings: number;
  pendingPayments: number;
  completedShipments: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  type: 'shipment' | 'bid' | 'inspection' | 'payment';
  title: string;
  description: string;
  timestamp: string;
}

export const dashboardService = {
  async getDashboard(): Promise<DashboardData> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // return await apiClient.get<DashboardData>('/operator/dashboard');
      
      // Mock data for now
      return {
        activeTrucks: 5,
        activeShipments: 8,
        activeBids: 12,
        pendingInspections: 3,
        winsToday: 2,
        mtdEarnings: 145000,
        pendingPayments: 45000,
        completedShipments: 234,
      };
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      throw error;
    }
  },

  async getAlerts(): Promise<Alert[]> {
    try {
      // TODO: Replace with actual API call
      // return await apiClient.get<Alert[]>('/operator/alerts');
      
      return [
        {
          id: '1',
          type: 'warning',
          title: 'Document Expiring Soon',
          message: 'RC for DL 01 AB 1234 expires in 15 days',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'info',
          title: 'Inspection Pending',
          message: '2 trucks need inspection this week',
          timestamp: new Date().toISOString(),
        },
      ];
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      return [];
    }
  },

  async getRecentActivity(): Promise<Activity[]> {
    try {
      // TODO: Replace with actual API call
      // return await apiClient.get<Activity[]>('/operator/activity');
      
      return [
        {
          id: '1',
          type: 'shipment',
          title: 'Shipment SHP-001 Delivered',
          description: 'DL 01 AB 1234 completed delivery to Mumbai',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          type: 'bid',
          title: 'Bid Accepted',
          description: 'Your bid of ₹48,000 for BKG-002 was accepted',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          type: 'inspection',
          title: 'Inspection Completed',
          description: 'Daily inspection for HR 26 BX 5678 marked as passed',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
    } catch (error) {
      console.error('Failed to fetch activity:', error);
      return [];
    }
  },
};

