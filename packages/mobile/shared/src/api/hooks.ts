/**
 * React Query Hooks for API
 * Typed hooks for all API endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

// Auth Hooks
export function useLogin() {
  return useMutation({
    mutationFn: async (data: { phone: string; otp: string; deviceId: string }) => {
      return apiClient.post('/auth/login', data);
    },
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: async (refreshToken: string) => {
      return apiClient.post('/auth/refresh', { refreshToken });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return apiClient.post('/auth/logout', {});
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

// User Hooks
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.get(`/users/${userId}`),
    enabled: !!userId,
  });
}

// KYC Hooks
export function useUploadKyc() {
  return useMutation({
    mutationFn: async (data: { encryptedBlob: string; documentType: string }) => {
      return apiClient.post('/kyc', data);
    },
  });
}

export function useGetKyc(kycId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['kyc', kycId],
    queryFn: () => apiClient.get(`/kyc/${kycId}`),
    enabled: enabled && !!kycId,
  });
}

// Booking Hooks
export function useCreateBooking() {
  return useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post('/bookings', data);
    },
  });
}

export function useGetBooking(bookingId: string) {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => apiClient.get(`/bookings/${bookingId}`),
    enabled: !!bookingId,
  });
}

export function useGetBookings(filters?: any) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => apiClient.get('/bookings', filters),
  });
}

// Bid Hooks
export function useCreateBid(bookingId: string) {
  return useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post(`/bookings/${bookingId}/bids`, data);
    },
  });
}

export function useUpdateBid(bidId: string) {
  return useMutation({
    mutationFn: async (data: any) => {
      return apiClient.patch(`/bids/${bidId}`, data);
    },
  });
}

export function useGetBids(bookingId: string) {
  return useQuery({
    queryKey: ['bids', bookingId],
    queryFn: () => apiClient.get(`/bookings/${bookingId}/bids`),
    enabled: !!bookingId,
  });
}

export function useFinalizeBid(bidId: string) {
  return useMutation({
    mutationFn: async () => {
      return apiClient.post(`/bids/${bidId}/finalize`, {});
    },
  });
}

// Shipment Hooks
export function useGetShipment(shipmentId: string) {
  return useQuery({
    queryKey: ['shipment', shipmentId],
    queryFn: () => apiClient.get(`/shipments/${shipmentId}`),
    enabled: !!shipmentId,
  });
}

export function useStartShipment(shipmentId: string) {
  return useMutation({
    mutationFn: async () => {
      return apiClient.post(`/shipments/${shipmentId}/start`, {});
    },
  });
}

export function usePingGps(shipmentId: string) {
  return useMutation({
    mutationFn: async (data: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      altitude?: number;
      heading?: number;
      speed?: number;
      timestamp: string;
    }) => {
      return apiClient.post(`/shipments/${shipmentId}/ping`, data);
    },
  });
}

export function useUploadPod(shipmentId: string) {
  return useMutation({
    mutationFn: async (data: { fileHash: string; fileUrl: string; metadata: any }) => {
      return apiClient.post(`/shipments/${shipmentId}/pod`, data);
    },
  });
}

export function useCompleteShipment(shipmentId: string) {
  return useMutation({
    mutationFn: async (data: { otp: string; proof?: string }) => {
      return apiClient.post(`/shipments/${shipmentId}/complete`, data);
    },
  });
}

// Truck Hooks
export function useCreateTruck() {
  return useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post('/trucks', data);
    },
  });
}

export function useGetTruck(truckId: string) {
  return useQuery({
    queryKey: ['truck', truckId],
    queryFn: () => apiClient.get(`/trucks/${truckId}`),
    enabled: !!truckId,
  });
}

export function useInspectTruck(truckId: string) {
  return useMutation({
    mutationFn: async (data: { photos: string[]; geo: { lat: number; lng: number }; timestamp: string }) => {
      return apiClient.post(`/trucks/${truckId}/inspect`, data);
    },
  });
}

// Driver Hooks
export function useCreateDriver() {
  return useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post('/drivers', data);
    },
  });
}

export function useLinkDriver(driverId: string) {
  return useMutation({
    mutationFn: async (data: { truckId: string }) => {
      return apiClient.post(`/drivers/${driverId}/link-truck`, data);
    },
  });
}

