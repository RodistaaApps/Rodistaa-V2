/**
 * Notification Domain Model
 */

export enum NotificationType {
  BOOKING_CREATED = 'BOOKING_CREATED',
  BID_RECEIVED = 'BID_RECEIVED',
  BID_ACCEPTED = 'BID_ACCEPTED',
  AUTO_FINALIZED = 'AUTO_FINALIZED',
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
  DRIVER_APPROVAL_REQUIRED = 'DRIVER_APPROVAL_REQUIRED',
  SHIPMENT_STARTED = 'SHIPMENT_STARTED',
  OTP_GENERATED = 'OTP_GENERATED',
  SHIPMENT_COMPLETED = 'SHIPMENT_COMPLETED',
  TRUCK_BLOCKED = 'TRUCK_BLOCKED',
  INSPECTION_DUE = 'INSPECTION_DUE',
  COMPLIANCE_ALERT = 'COMPLIANCE_ALERT',
  ADMIN_OVERRIDE = 'ADMIN_OVERRIDE',
}

export enum NotificationChannel {
  PUSH = 'PUSH',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
}

export interface Notification {
  id: string;
  userId: string; // Recipient
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  data?: Record<string, any>; // Additional payload
  read: boolean;
  readAt?: Date;
  sentAt: Date;
  createdAt: Date;
}

