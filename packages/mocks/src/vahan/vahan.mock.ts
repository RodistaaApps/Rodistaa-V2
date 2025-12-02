/**
 * Vahan Mock Service
 * Simulates Vahan vehicle registration API for local development
 */

import express, { Request, Response } from 'express';

const router = express.Router();

// Mock vehicle data
const mockVehicles: Record<string, any> = {
  'MH12AB1234': {
    regNo: 'MH-12-AB-1234',
    ownerName: 'Reliable Logistics',
    vehicleClass: 'HGV',
    fuelType: 'Diesel',
    modelYear: 2020,
    manufacturer: 'Tata',
    model: 'LPT 1613',
    chassisNumber: 'TATA123456789',
    engineNumber: 'ENG123456789',
    registrationDate: '2020-01-15',
    fitnessExpiry: '2025-06-30',
    insuranceExpiry: '2025-12-31',
    pollutionExpiry: '2026-06-30',
    isValid: true,
  },
  'GJ01EF9012': {
    regNo: 'GJ-01-EF-9012',
    ownerName: 'Fast Track Movers',
    vehicleClass: 'HGV',
    fuelType: 'Diesel',
    modelYear: 2021,
    manufacturer: 'Ashok Leyland',
    model: '1613',
    chassisNumber: 'AL987654321',
    engineNumber: 'ENG987654321',
    registrationDate: '2021-03-20',
    fitnessExpiry: '2025-09-30',
    insuranceExpiry: '2025-11-30',
    pollutionExpiry: '2026-03-30',
    isValid: true,
  },
};

// Verify vehicle registration
router.get('/verify/:regNo', (req: Request, res: Response) => {
  const { regNo } = req.params;
  const normalizedRegNo = regNo.replace(/-/g, '').toUpperCase();

  const vehicle = Object.values(mockVehicles).find(
    (v) => v.regNo.replace(/-/g, '').toUpperCase() === normalizedRegNo
  );

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      error: 'Vehicle not found',
    });
  }

  // Check expiry dates
  const now = new Date();
  const fitnessExpiry = new Date(vehicle.fitnessExpiry);
  const insuranceExpiry = new Date(vehicle.insuranceExpiry);
  const pollutionExpiry = new Date(vehicle.pollutionExpiry);

  const isFitnessValid = fitnessExpiry > now;
  const isInsuranceValid = insuranceExpiry > now;
  const isPollutionValid = pollutionExpiry > now;

  res.json({
    success: true,
    data: {
      regNo: vehicle.regNo,
      ownerName: vehicle.ownerName,
      vehicleClass: vehicle.vehicleClass,
      fuelType: vehicle.fuelType,
      modelYear: vehicle.modelYear,
      manufacturer: vehicle.manufacturer,
      model: vehicle.model,
      isValid: vehicle.isValid,
      documents: {
        fitness: {
          expiry: vehicle.fitnessExpiry,
          isValid: isFitnessValid,
        },
        insurance: {
          expiry: vehicle.insuranceExpiry,
          isValid: isInsuranceValid,
        },
        pollution: {
          expiry: vehicle.pollutionExpiry,
          isValid: isPollutionValid,
        },
      },
    },
  });
});

// Get vehicle details
router.get('/details/:regNo', (req: Request, res: Response) => {
  const { regNo } = req.params;
  const normalizedRegNo = regNo.replace(/-/g, '').toUpperCase();

  const vehicle = Object.values(mockVehicles).find(
    (v) => v.regNo.replace(/-/g, '').toUpperCase() === normalizedRegNo
  );

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      error: 'Vehicle not found',
    });
  }

  res.json({
    success: true,
    data: vehicle,
  });
});

export default router;

