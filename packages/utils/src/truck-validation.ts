/**
 * @rodistaa/utils - Truck Criteria Validation Service
 * 
 * Validates truck registration against Rodistaa criteria:
 * - HGV only (open/container)
 * - BS4/BS6 emission standard
 * - 2018+ year of manufacture
 * - National Permit required
 * - Max 10 trucks per operator
 * 
 * BUSINESS RULE: Strict truck criteria for safety and compliance.
 */

import { PrismaClient } from '@prisma/client';

export interface TruckValidationParams {
  vehicleType: string; // HGV, LCV, etc.
  emissionStandard: string; // BS4, BS6, etc.
  yearOfManufacture: number;
  permitType: string; // National, State, etc.
  operatorId: string;
}

export interface TruckValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  criteria: {
    vehicleType: boolean;
    emissionStandard: boolean;
    yearOfManufacture: boolean;
    permitType: boolean;
    maxTrucks: boolean;
  };
}

export class TruckValidationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Validate truck against Rodistaa criteria
   * 
   * BUSINESS RULES:
   * - HGV only (open/container)
   * - BS4/BS6 emission standard
   * - 2018+ year
   * - National Permit
   */
  async validateTruck(params: TruckValidationParams): Promise<TruckValidationResult> {
    const { vehicleType, emissionStandard, yearOfManufacture, permitType, operatorId } = params;

    const errors: string[] = [];
    const warnings: string[] = [];
    const criteria = {
      vehicleType: false,
      emissionStandard: false,
      yearOfManufacture: false,
      permitType: false,
      maxTrucks: false,
    };

    // BUSINESS RULE: HGV only (open/container)
    const validVehicleTypes = ['HGV', 'HEAVY_GOODS_VEHICLE'];
    const isHGV = validVehicleTypes.includes(vehicleType.toUpperCase()) ||
                  vehicleType.toUpperCase().includes('HGV');
    
    if (!isHGV) {
      errors.push('BUSINESS RULE: Only HGV (Heavy Goods Vehicle) type trucks are allowed. Open or container body type required.');
    } else {
      criteria.vehicleType = true;
    }

    // BUSINESS RULE: BS4/BS6 emission standard
    const validEmissionStandards = ['BS4', 'BS6', 'BS-IV', 'BS-VI'];
    const isValidEmission = validEmissionStandards.some(standard =>
      emissionStandard.toUpperCase().includes(standard.toUpperCase())
    );

    if (!isValidEmission) {
      errors.push('BUSINESS RULE: Only BS4 (BS-IV) or BS6 (BS-VI) emission standard trucks are allowed.');
    } else {
      criteria.emissionStandard = true;
    }

    // BUSINESS RULE: 2018+ year of manufacture
    if (yearOfManufacture < 2018) {
      errors.push(`BUSINESS RULE: Only trucks manufactured in 2018 or later are allowed. Provided: ${yearOfManufacture}`);
    } else {
      criteria.yearOfManufacture = true;
    }

    // BUSINESS RULE: National Permit required
    if (!permitType.toUpperCase().includes('NATIONAL')) {
      errors.push('BUSINESS RULE: National Permit is required for all trucks.');
    } else {
      criteria.permitType = true;
    }

    // BUSINESS RULE: Max 10 trucks per operator
    const operatorTruckCount = await this.prisma.truck.count({
      where: {
        operatorId,
        status: {
          not: 'DELETED',
        },
      },
    });

    if (operatorTruckCount >= 10) {
      errors.push(`BUSINESS RULE: Maximum 10 trucks allowed per operator. Current count: ${operatorTruckCount}`);
    } else {
      criteria.maxTrucks = true;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      criteria,
    };
  }

  /**
   * Validate truck registration before allowing bid placement
   */
  async validateTruckForBidding(truckId: string, operatorId: string): Promise<{
    canBid: boolean;
    isValid: boolean;
    errors: string[];
  }> {
    const truck = await this.prisma.truck.findUnique({
      where: {
        id: truckId,
      },
    });

    if (!truck) {
      return {
        canBid: false,
        isValid: false,
        errors: ['Truck not found'],
      };
    }

    if (truck.operatorId !== operatorId) {
      return {
        canBid: false,
        isValid: false,
        errors: ['Truck does not belong to operator'],
      };
    }

    // Check if truck is verified
    if (!truck.isVerified) {
      return {
        canBid: false,
        isValid: false,
        errors: ['Truck must be verified (SurePass) before bidding'],
      };
    }

    // Check if truck is available
    if (truck.status !== 'AVAILABLE') {
      return {
        canBid: false,
        isValid: false,
        errors: [`Truck is not available. Current status: ${truck.status}`],
      };
    }

    // Validate truck criteria
    const validation = await this.validateTruck({
      vehicleType: truck.vehicleType || '',
      emissionStandard: truck.emissionStandard || '',
      yearOfManufacture: truck.yearOfManufacture || 0,
      permitType: truck.permitType || '',
      operatorId,
    });

    return {
      canBid: validation.isValid && truck.isVerified && truck.status === 'AVAILABLE',
      isValid: validation.isValid,
      errors: validation.errors,
    };
  }
}

