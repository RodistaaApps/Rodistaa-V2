/**
 * Vahan API Mock Service
 * Simulates Vahan (Vehicle Registration) API for vehicle verification
 * 
 * In production, replace with real Vahan API integration
 */

import { logger } from '../../utils/logger';

const log = logger.child({ module: 'vahan-mock' });

export interface VahanVerificationRequest {
  registrationNumber: string;
  chassisNumber?: string;
  engineNumber?: string;
}

export interface VahanVerificationResponse {
  success: boolean;
  verified: boolean;
  registrationNumber: string;
  
  // Vehicle details from Vahan
  ownerName?: string;
  vehicleClass?: string; // LMV, HMV, MGV, etc.
  make?: string;
  model?: string;
  manufacturingYear?: number;
  registrationDate?: string;
  
  // Registration details
  rtoCode?: string;
  rtoName?: string;
  state?: string;
  
  // Status
  status?: 'ACTIVE' | 'SUSPENDED' | 'BLACKLISTED' | 'NOT_FOUND';
  taxValidity?: string;
  fitnessValidity?: string;
  insuranceValidity?: string;
  pucValidity?: string;
  permitValidity?: string;
  
  // Matching
  matchScore?: number; // 0-100
  mismatches?: string[];
  
  // API metadata
  apiCallId?: string;
  timestamp?: string;
  
  // Error
  error?: string;
}

/**
 * Simulate Vahan API verification
 */
export async function verifyVehicle(
  request: VahanVerificationRequest
): Promise<VahanVerificationResponse> {
  try {
    log.info({ registrationNumber: request.registrationNumber }, 'Vahan verification requested');
    
    // Simulate API delay
    await delay(500 + Math.random() * 1000);
    
    // Parse registration number (format: XX00XX0000)
    const regNo = request.registrationNumber.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (regNo.length < 8) {
      return {
        success: false,
        verified: false,
        registrationNumber: request.registrationNumber,
        error: 'Invalid registration number format',
      };
    }
    
    // Simulate 90% success rate
    if (Math.random() < 0.1) {
      return {
        success: false,
        verified: false,
        registrationNumber: request.registrationNumber,
        error: 'Vahan API temporarily unavailable',
      };
    }
    
    // Extract state code
    const stateCode = regNo.substring(0, 2);
    const rtoData = getRTOData(stateCode);
    
    // Simulate 5% NOT FOUND
    if (Math.random() < 0.05) {
      return {
        success: true,
        verified: false,
        registrationNumber: request.registrationNumber,
        status: 'NOT_FOUND',
        error: 'Vehicle not found in Vahan database',
      };
    }
    
    // Simulate 2% BLACKLISTED
    if (Math.random() < 0.02) {
      return {
        success: true,
        verified: false,
        registrationNumber: request.registrationNumber,
        status: 'BLACKLISTED',
        ownerName: generateOwnerName(),
        vehicleClass: 'HMV',
        make: generateMake(),
        model: generateModel(),
        manufacturingYear: 2015 + Math.floor(Math.random() * 8),
        rtoCode: stateCode + '01',
        rtoName: rtoData.rtoName,
        state: rtoData.state,
        mismatches: ['Vehicle blacklisted by transport authority'],
      };
    }
    
    // Generate synthetic vehicle data
    const manufacturingYear = 2015 + Math.floor(Math.random() * 10);
    const registrationDate = new Date(manufacturingYear, Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));
    
    // Calculate validity dates
    const today = new Date();
    const taxValidity = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    const fitnessValidity = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate());
    const insuranceValidity = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
    const pucValidity = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
    const permitValidity = new Date(today.getFullYear() + 3, today.getMonth(), today.getDate());
    
    // Calculate match score
    let matchScore = 100;
    const mismatches: string[] = [];
    
    // Simulate 10% mismatch
    if (Math.random() < 0.1) {
      matchScore -= 20;
      mismatches.push('Chassis number mismatch detected');
    }
    
    // Simulate 5% expired fitness
    let status: 'ACTIVE' | 'SUSPENDED' | 'BLACKLISTED' = 'ACTIVE';
    if (Math.random() < 0.05) {
      status = 'SUSPENDED';
      mismatches.push('Fitness certificate expired');
      matchScore -= 30;
    }
    
    const verified = matchScore >= 80 && status === 'ACTIVE';
    
    const response: VahanVerificationResponse = {
      success: true,
      verified,
      registrationNumber: request.registrationNumber,
      
      ownerName: generateOwnerName(),
      vehicleClass: 'HMV',
      make: generateMake(),
      model: generateModel(),
      manufacturingYear,
      registrationDate: registrationDate.toISOString().split('T')[0],
      
      rtoCode: stateCode + '01',
      rtoName: rtoData.rtoName,
      state: rtoData.state,
      
      status,
      taxValidity: taxValidity.toISOString().split('T')[0],
      fitnessValidity: fitnessValidity.toISOString().split('T')[0],
      insuranceValidity: insuranceValidity.toISOString().split('T')[0],
      pucValidity: pucValidity.toISOString().split('T')[0],
      permitValidity: permitValidity.toISOString().split('T')[0],
      
      matchScore,
      mismatches: mismatches.length > 0 ? mismatches : undefined,
      
      apiCallId: `VAHAN-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
    };
    
    log.info({ 
      registrationNumber: request.registrationNumber, 
      verified, 
      matchScore 
    }, 'Vahan verification completed');
    
    return response;
  } catch (error) {
    log.error({ error, request }, 'Vahan verification failed');
    return {
      success: false,
      verified: false,
      registrationNumber: request.registrationNumber,
      error: 'Internal error during verification',
    };
  }
}

/**
 * Get RTO data by state code
 */
function getRTOData(stateCode: string): { rtoName: string; state: string } {
  const rtoMap: Record<string, { rtoName: string; state: string }> = {
    'AP': { rtoName: 'Vijayawada RTO', state: 'Andhra Pradesh' },
    'TS': { rtoName: 'Hyderabad RTO', state: 'Telangana' },
    'KA': { rtoName: 'Bangalore RTO', state: 'Karnataka' },
    'TN': { rtoName: 'Chennai RTO', state: 'Tamil Nadu' },
    'MH': { rtoName: 'Mumbai RTO', state: 'Maharashtra' },
    'DL': { rtoName: 'Delhi RTO', state: 'Delhi' },
    'UP': { rtoName: 'Lucknow RTO', state: 'Uttar Pradesh' },
    'GJ': { rtoName: 'Ahmedabad RTO', state: 'Gujarat' },
    'RJ': { rtoName: 'Jaipur RTO', state: 'Rajasthan' },
  };
  
  return rtoMap[stateCode] || { rtoName: 'Unknown RTO', state: 'Unknown' };
}

/**
 * Generate random owner name (Indian names)
 */
function generateOwnerName(): string {
  const firstNames = [
    'Rajesh', 'Suresh', 'Ramesh', 'Krishna', 'Venkata',
    'Srinivas', 'Murali', 'Prakash', 'Kumar', 'Ravi',
    'Lakshmi', 'Sita', 'Rani', 'Devi', 'Priya'
  ];
  
  const lastNames = [
    'Reddy', 'Naidu', 'Rao', 'Kumar', 'Singh',
    'Sharma', 'Patel', 'Gupta', 'Verma', 'Choudhary'
  ];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

/**
 * Generate truck make
 */
function generateMake(): string {
  const makes = [
    'TATA', 'ASHOK LEYLAND', 'EICHER', 'MAHINDRA',
    'BHARAT BENZ', 'FORCE', 'SML ISUZU'
  ];
  return makes[Math.floor(Math.random() * makes.length)];
}

/**
 * Generate truck model
 */
function generateModel(): string {
  const models = [
    'LPT 1412', 'SIGNA 1918', 'PRO 3015', 'BLAZO X 35',
    'DOST PLUS', '1512 SE', '407 PICKUP', 'ULTRA T.7'
  ];
  return models[Math.floor(Math.random() * models.length)];
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Batch verification (for seeding/testing)
 */
export async function batchVerifyVehicles(
  registrationNumbers: string[]
): Promise<VahanVerificationResponse[]> {
  const results: VahanVerificationResponse[] = [];
  
  for (const regNo of registrationNumbers) {
    const result = await verifyVehicle({ registrationNumber: regNo });
    results.push(result);
    
    // Rate limiting simulation
    await delay(100);
  }
  
  return results;
}

