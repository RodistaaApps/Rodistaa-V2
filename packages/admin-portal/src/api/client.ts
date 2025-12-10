/**
 * API Client for Rodistaa Portals
 * Axios-based client with authentication
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response.data,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearToken();
          // Only redirect in production (not during development)
          if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'development') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  }

  // Auth
  async sendOTP(mobile: string) {
    const response = await this.client.post('/auth/otp', { mobile });
    return response;
  }

  async login(mobile: string, otp: string) {
    const response = await this.client.post('/auth/login', { mobile, otp });
    return response;
  }

  async logout() {
    await this.client.post('/auth/logout');
    this.clearToken();
  }

  // Users
  async getUser(userId: string) {
    return this.client.get(`/users/${userId}`);
  }

  // KYC
  async getKyc(kycId: string) {
    return this.client.get(`/kyc/${kycId}`);
  }

  async decryptKyc(kycId: string) {
    return this.client.post(`/kyc/${kycId}/decrypt`);
  }

  async verifyKyc(kycId: string, status: string) {
    return this.client.post(`/kyc/${kycId}/verify`, { status });
  }

  // Trucks
  async getTrucks(filters?: any) {
    return this.client.get('/trucks', { params: filters });
  }

  async getTruck(truckId: string) {
    return this.client.get(`/trucks/${truckId}`);
  }

  async blockTruck(truckId: string, reason: string) {
    return this.client.post(`/trucks/${truckId}/block`, { reason });
  }

  async unblockTruck(truckId: string) {
    return this.client.post(`/trucks/${truckId}/unblock`);
  }

  // Bookings
  async getBookings(filters?: any) {
    return this.client.get('/bookings', { params: filters });
  }

  async getBooking(bookingId: string) {
    return this.client.get(`/bookings/${bookingId}`);
  }

  // Bids
  async getBids(bookingId: string) {
    return this.client.get(`/bookings/${bookingId}/bids`);
  }

  async finalizeBid(bidId: string) {
    return this.client.post(`/bids/${bidId}/finalize`);
  }

  // Shipments
  async getShipments(filters?: any) {
    return this.client.get('/shipments', { params: filters });
  }

  async getShipment(shipmentId: string) {
    return this.client.get(`/shipments/${shipmentId}`);
  }

  // Admin
  async getOverrides(filters?: any) {
    return this.client.get('/admin/overrides', { params: filters });
  }

  async approveOverride(overrideId: string) {
    return this.client.post(`/admin/overrides/${overrideId}/approve`);
  }

  async denyOverride(overrideId: string, reason: string) {
    return this.client.post(`/admin/overrides/${overrideId}/deny`, { reason });
  }

  async getAuditLogs(entityType: string, entityId: string) {
    return this.client.get(`/acs/audit/${entityType}/${entityId}`);
  }

  async getDashboardStats() {
    return this.client.get('/admin/dashboard');
  }

  // Franchise
  async getFranchises(type?: string) {
    return this.client.get('/franchise', { params: { type } });
  }

  async createFranchise(data: any) {
    return this.client.post('/franchise', data);
  }

  async setTargets(franchiseId: string, targets: any) {
    return this.client.post(`/franchise/${franchiseId}/targets`, targets);
  }

  async getReports(franchiseId: string) {
    return this.client.get(`/franchise/${franchiseId}/reports`);
  }
}

export const apiClient = new ApiClient();

