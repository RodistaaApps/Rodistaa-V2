/**
 * Comprehensive API Type Definitions for Mobile Apps
 * Provides type safety for all API requests and responses
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  coordinates?: Coordinates;
}

// ============================================================================
// USER & AUTH TYPES
// ============================================================================

export type UserRole = 'admin' | 'operator' | 'driver' | 'shipper' | 'franchise';

export interface User {
  id: string;
  mobile: string;
  name?: string;
  email?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface LoginRequest {
  mobile: string;
  otp: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface OtpRequest {
  mobile: string;
}

export interface OtpResponse {
  message: string;
  expiresIn: number;
}

// ============================================================================
// KYC TYPES
// ============================================================================

export type KycStatus = 'pending' | 'approved' | 'rejected';
export type KycDocumentType = 
  | 'aadhaar'
  | 'pan'
  | 'driving_license'
  | 'vehicle_rc'
  | 'insurance'
  | 'permit'
  | 'fitness_certificate'
  | 'pollution_certificate';

export interface KycDocument {
  id: string;
  type: KycDocumentType;
  documentNumber: string;
  documentUrl: string;
  status: KycStatus;
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface KycData {
  id: string;
  userId: string;
  status: KycStatus;
  documents: KycDocument[];
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface KycSubmissionRequest {
  documents: Array<{
    type: KycDocumentType;
    documentNumber: string;
    documentUrl: string;
  }>;
}

// ============================================================================
// TRUCK & DRIVER TYPES
// ============================================================================

export type TruckType = 'FTL' | 'PTL';
export type TruckStatus = 'active' | 'inactive' | 'maintenance';

export interface Truck {
  id: string;
  registrationNumber: string;
  type: TruckType;
  capacity: number;
  status: TruckStatus;
  currentLocation?: Coordinates;
  operatorId: string;
  driverId?: string;
  kycStatus: KycStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  userId: string;
  name: string;
  mobile: string;
  licenseNumber: string;
  licenseExpiry: string;
  truckId?: string;
  isAvailable: boolean;
  currentLocation?: Coordinates;
  kycStatus: KycStatus;
  rating?: number;
  totalTrips?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TruckRegistrationRequest {
  registrationNumber: string;
  type: TruckType;
  capacity: number;
  documents: Array<{
    type: KycDocumentType;
    documentNumber: string;
    documentUrl: string;
  }>;
}

// ============================================================================
// BOOKING TYPES
// ============================================================================

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export type CargoType = 
  | 'general'
  | 'fragile'
  | 'perishable'
  | 'hazardous'
  | 'bulk';

export interface Booking {
  id: string;
  shipperId: string;
  pickupAddress: Address;
  deliveryAddress: Address;
  pickupDate: string;
  deliveryDate?: string;
  cargoType: CargoType;
  cargoWeight: number;
  cargoDescription: string;
  estimatedDistance: number;
  estimatedPrice: number;
  actualPrice?: number;
  status: BookingStatus;
  truckType: TruckType;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingCreateRequest {
  pickupAddress: Address;
  deliveryAddress: Address;
  pickupDate: string;
  cargoType: CargoType;
  cargoWeight: number;
  cargoDescription: string;
  truckType: TruckType;
  specialInstructions?: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  truckType?: TruckType;
  startDate?: string;
  endDate?: string;
  shipperId?: string;
}

// ============================================================================
// BID TYPES
// ============================================================================

export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface Bid {
  id: string;
  bookingId: string;
  operatorId: string;
  truckId: string;
  bidAmount: number;
  estimatedDeliveryTime: string;
  status: BidStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface BidCreateRequest {
  bookingId: string;
  truckId: string;
  bidAmount: number;
  estimatedDeliveryTime: string;
  message?: string;
}

export interface BidAcceptRequest {
  bidId: string;
}

// ============================================================================
// SHIPMENT TYPES
// ============================================================================

export type ShipmentStatus = 
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'at_checkpoint'
  | 'delivered'
  | 'cancelled';

export interface Checkpoint {
  id: string;
  name: string;
  location: Coordinates;
  address: Address;
  arrivedAt?: string;
  departedAt?: string;
  notes?: string;
}

export interface Shipment {
  id: string;
  bookingId: string;
  truckId: string;
  driverId: string;
  status: ShipmentStatus;
  currentLocation?: Coordinates;
  checkpoints: Checkpoint[];
  estimatedDelivery: string;
  actualDelivery?: string;
  podUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentUpdateRequest {
  status: ShipmentStatus;
  currentLocation?: Coordinates;
  notes?: string;
}

export interface ProofOfDelivery {
  shipmentId: string;
  signatureUrl: string;
  photoUrl?: string;
  recipientName: string;
  deliveredAt: string;
  notes?: string;
}

// ============================================================================
// TRACKING TYPES
// ============================================================================

export interface TrackingUpdate {
  id: string;
  shipmentId: string;
  location: Coordinates;
  status: ShipmentStatus;
  timestamp: string;
  notes?: string;
}

export interface LiveTracking {
  shipmentId: string;
  currentLocation: Coordinates;
  lastUpdated: string;
  speed?: number;
  heading?: number;
  estimatedArrival: string;
  distanceRemaining: number;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

// BUSINESS RULE: Cash-only payments - No digital payment methods
export type PaymentMethod = 'cod'; // Cash on Delivery only

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInitiateRequest {
  bookingId: string;
  amount: number;
  method: PaymentMethod;
}

export interface PaymentInitiateResponse {
  paymentId: string;
  gatewayOrderId: string;
  gatewayKey: string;
  amount: number;
  currency: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType = 
  | 'booking_created'
  | 'bid_received'
  | 'bid_accepted'
  | 'shipment_started'
  | 'shipment_updated'
  | 'shipment_delivered'
  | 'payment_completed'
  | 'kyc_approved'
  | 'kyc_rejected';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  push: boolean;
  sms: boolean;
  email: boolean;
  types: NotificationType[];
}

// ============================================================================
// STATISTICS & DASHBOARD TYPES
// ============================================================================

export interface DriverStats {
  totalTrips: number;
  completedTrips: number;
  activeTrips: number;
  totalEarnings: number;
  rating: number;
  onTimeDeliveryRate: number;
}

export interface OperatorStats {
  totalTrucks: number;
  activeTrucks: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  pendingBids: number;
}

export interface ShipperStats {
  totalBookings: number;
  activeShipments: number;
  completedShipments: number;
  totalSpent: number;
  pendingPayments: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ============================================================================
// FILE UPLOAD TYPES
// ============================================================================

export interface FileUploadRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface FileUploadResponse {
  uploadUrl: string;
  fileUrl: string;
  expiresIn: number;
}

