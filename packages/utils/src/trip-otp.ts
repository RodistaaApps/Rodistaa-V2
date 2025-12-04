/**
 * @rodistaa/utils - Trip OTP Generation Service
 * 
 * Generates and verifies OTP for trip completion:
 * - 6-digit OTP
 * - 24-hour expiry
 * - Shipper provides to driver
 * - Driver verifies to complete shipment
 * 
 * BUSINESS RULE: 6-digit OTP, 24-hour expiry, shipper provides to driver.
 */

import { PrismaClient, Prisma } from '@prisma/client';

export interface GenerateOTPParams {
  shipmentId: string;
  shipperId: string;
}

export interface VerifyOTPParams {
  shipmentId: string;
  otp: string;
  driverId: string;
}

export interface OTPResult {
  otp: string; // 6-digit OTP
  shipmentId: string;
  expiresAt: Date; // 24 hours from generation
  validUntil: string; // Human-readable expiry
}

export interface OTPVerificationResult {
  valid: boolean;
  shipmentId: string;
  verified: boolean;
  message: string;
}

/**
 * Generate 6-digit OTP
 * 
 * BUSINESS RULE: OTP must be exactly 6 digits
 */
function generateOTP(): string {
  // Generate random 6-digit number (100000 to 999999)
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

export class TripOTPService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Generate OTP for shipment completion
   * 
   * BUSINESS RULE:
   * - 6-digit OTP
   * - 24-hour expiry
   * - Shipper provides to driver
   */
  async generateOTP(params: GenerateOTPParams): Promise<OTPResult> {
    const { shipmentId, shipperId } = params;

    // Verify shipment exists and belongs to shipper
    const shipment = await this.prisma.shipment.findUnique({
      where: { shipmentId },
      include: {
        booking: true,
      },
    });

    if (!shipment) {
      throw new Error(`Shipment ${shipmentId} not found`);
    }

    if (shipment.booking.shipperId !== shipperId) {
      throw new Error(`Shipment does not belong to shipper ${shipperId}`);
    }

    // Check if shipment is ready for OTP (delivery completed)
    if (shipment.status !== 'DELIVERY_COMPLETED' && shipment.status !== 'IN_TRANSIT') {
      throw new Error(
        `Shipment status is ${shipment.status}. OTP can only be generated when delivery is completed or in transit.`
      );
    }

    // Generate 6-digit OTP
    const otp = generateOTP();

    // BUSINESS RULE: 24-hour expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Store or update OTP in shipment
    await this.prisma.tripOTP.upsert({
      where: {
        shipmentId,
      },
      create: {
        shipmentId,
        otp: otp,
        generatedBy: shipperId,
        generatedAt: new Date(),
        expiresAt,
        verified: false,
      },
      update: {
        otp: otp,
        generatedBy: shipperId,
        generatedAt: new Date(),
        expiresAt,
        verified: false,
        verifiedAt: null,
        verifiedBy: null,
      },
    });

    return {
      otp,
      shipmentId,
      expiresAt,
      validUntil: expiresAt.toISOString(),
    };
  }

  /**
   * Verify OTP provided by driver
   * 
   * BUSINESS RULE:
   * - OTP must match
   * - OTP must not be expired (24 hours)
   * - Driver verifies to complete shipment
   */
  async verifyOTP(params: VerifyOTPParams): Promise<OTPVerificationResult> {
    const { shipmentId, otp, driverId } = params;

    // Get OTP record
    const otpRecord = await this.prisma.tripOTP.findUnique({
      where: {
        shipmentId,
      },
      include: {
        shipment: {
          include: {
            booking: true,
          },
        },
      },
    });

    if (!otpRecord) {
      return {
        valid: false,
        shipmentId,
        verified: false,
        message: 'No OTP generated for this shipment. Shipper must generate OTP first.',
      };
    }

    // Check if already verified
    if (otpRecord.verified) {
      return {
        valid: true,
        shipmentId,
        verified: true,
        message: 'OTP already verified. Shipment already completed.',
      };
    }

    // Check if expired
    const now = new Date();
    if (now > otpRecord.expiresAt) {
      return {
        valid: false,
        shipmentId,
        verified: false,
        message: 'OTP has expired. BUSINESS RULE: OTP expires after 24 hours. Shipper must generate new OTP.',
      };
    }

    // Verify OTP matches
    if (otpRecord.otp !== otp) {
      return {
        valid: false,
        shipmentId,
        verified: false,
        message: 'Invalid OTP. Please check the OTP provided by shipper.',
      };
    }

    // Verify driver belongs to shipment
    if (otpRecord.shipment.driverId !== driverId) {
      return {
        valid: false,
        shipmentId,
        verified: false,
        message: 'Only assigned driver can verify OTP for this shipment.',
      };
    }

    // BUSINESS RULE: Mark OTP as verified and complete shipment
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update OTP record
      await tx.tripOTP.update({
        where: {
          shipmentId,
        },
        data: {
          verified: true,
          verifiedAt: now,
          verifiedBy: driverId,
        },
      });

      // Update shipment status to COMPLETED
      await tx.shipment.update({
        where: {
          shipmentId,
        },
        data: {
          status: 'COMPLETED',
          completedAt: now,
        },
      });
    });

    return {
      valid: true,
      shipmentId,
      verified: true,
      message: 'OTP verified successfully. Shipment marked as completed.',
    };
  }

  /**
   * Get OTP status for shipment
   */
  async getOTPStatus(shipmentId: string): Promise<{
    hasOTP: boolean;
    isVerified: boolean;
    isExpired: boolean;
    expiresAt?: Date;
    generatedAt?: Date;
  }> {
    const otpRecord = await this.prisma.tripOTP.findUnique({
      where: {
        shipmentId,
      },
    });

    if (!otpRecord) {
      return {
        hasOTP: false,
        isVerified: false,
        isExpired: false,
      };
    }

    const now = new Date();
    const isExpired = now > otpRecord.expiresAt;

    return {
      hasOTP: true,
      isVerified: otpRecord.verified,
      isExpired,
      expiresAt: otpRecord.expiresAt,
      generatedAt: otpRecord.generatedAt,
    };
  }
}

