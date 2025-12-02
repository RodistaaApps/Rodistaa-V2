/**
 * Bid Domain Model
 */

import { generateBidId } from '../ids';
import { BookingStatus } from './booking';

export enum BidStatus {
  ACTIVE = 'ACTIVE',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export interface Bid {
  id: string; // BK-<ulid>
  bookingId: string; // RID-YYYYMMDD-xxxx
  operatorId: string; // USR-OP-<ulid>
  amount: number; // Bid amount
  status: BidStatus;
  biddingFee: number; // Calculated: ₹5 × tonnage + ₹0.25 × distance
  ledgerDeducted: boolean; // Whether fee was deducted from ledger
  ledgerTransactionId?: string;
  modifiedAt?: Date; // Track bid modifications
  modificationsCount: number; // Unlimited modifications allowed
  acceptedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BidCreateRequest {
  bookingId: string;
  operatorId: string;
  amount: number;
}

export interface BidModifyRequest {
  bidId: string;
  newAmount: number;
}

