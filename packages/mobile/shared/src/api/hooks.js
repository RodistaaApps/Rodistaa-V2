/**
 * React Query Hooks for API
 * Typed hooks for all API endpoints
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
// Auth Hooks
export function useLogin() {
    return useMutation({
        mutationFn: async (data) => {
            return apiClient.post('/auth/login', data);
        },
    });
}
export function useRefreshToken() {
    return useMutation({
        mutationFn: async (refreshToken) => {
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
export function useUser(userId) {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: () => apiClient.get(`/users/${userId}`),
        enabled: !!userId,
    });
}
// KYC Hooks
export function useUploadKyc() {
    return useMutation({
        mutationFn: async (data) => {
            return apiClient.post('/kyc', data);
        },
    });
}
export function useGetKyc(kycId, enabled = true) {
    return useQuery({
        queryKey: ['kyc', kycId],
        queryFn: () => apiClient.get(`/kyc/${kycId}`),
        enabled: enabled && !!kycId,
    });
}
// Booking Hooks
export function useCreateBooking() {
    return useMutation({
        mutationFn: async (data) => {
            return apiClient.post('/bookings', data);
        },
    });
}
export function useGetBooking(bookingId) {
    return useQuery({
        queryKey: ['booking', bookingId],
        queryFn: () => apiClient.get(`/bookings/${bookingId}`),
        enabled: !!bookingId,
    });
}
export function useGetBookings(filters) {
    return useQuery({
        queryKey: ['bookings', filters],
        queryFn: () => apiClient.get('/bookings', filters),
    });
}
// Bid Hooks
export function useCreateBid(bookingId) {
    return useMutation({
        mutationFn: async (data) => {
            return apiClient.post(`/bookings/${bookingId}/bids`, data);
        },
    });
}
export function useUpdateBid(bidId) {
    return useMutation({
        mutationFn: async (data) => {
            return apiClient.patch(`/bids/${bidId}`, data);
        },
    });
}
export function useGetBids(bookingId) {
    return useQuery({
        queryKey: ['bids', bookingId],
        queryFn: () => apiClient.get(`/bookings/${bookingId}/bids`),
        enabled: !!bookingId,
    });
}
export function useFinalizeBid(bidId) {
    return useMutation({
        mutationFn: async () => {
            return apiClient.post(`/bids/${bidId}/finalize`, {});
        },
    });
}
// Shipment Hooks
export function useGetShipment(shipmentId) {
    return useQuery({
        queryKey: ['shipment', shipmentId],
        queryFn: () => apiClient.get(`/shipments/${shipmentId}`),
        enabled: !!shipmentId,
    });
}
export function useStartShipment(shipmentId) {
    return useMutation({
        mutationFn: async () => {
            return apiClient.post(`/shipments/${shipmentId}/start`, {});
        },
    });
}
export function usePingGps(shipmentId) {
    return useMutation({
        mutationFn: async (data) => {
            return apiClient.post(`/shipments/${shipmentId}/ping`, data);
        },
    });
}
export function useUploadPod(shipmentId) {
    return useMutation({
        mutationFn: async (data) => {
            return apiClient.post(`/shipments/${shipmentId}/pod`, data);
        },
    });
}
export function useCompleteShipment(shipmentId) {
    return useMutation({
        mutationFn: async (data) => {
            return apiClient.post(`/shipments/${shipmentId}/complete`, data);
        },
    });
}
// Truck Hooks
export function useCreateTruck() {
    return useMutation({
        mutationFn: async (data) => {
            return apiClient.post('/trucks', data);
        },
    });
}
export function useGetTruck(truckId) {
    return useQuery({
        queryKey: ['truck', truckId],
        queryFn: () => apiClient.get(`/trucks/${truckId}`),
        enabled: !!truckId,
    });
}
export function useInspectTruck(truckId) {
    return useMutation({
        mutationFn: async (data) => {
            return apiClient.post(`/trucks/${truckId}/inspect`, data);
        },
    });
}
// Driver Hooks
export function useCreateDriver() {
    return useMutation({
        mutationFn: async (data) => {
            return apiClient.post('/drivers', data);
        },
    });
}
export function useLinkDriver(driverId) {
    return useMutation({
        mutationFn: async (data) => {
            return apiClient.post(`/drivers/${driverId}/link-truck`, data);
        },
    });
}
