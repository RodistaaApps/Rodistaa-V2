/**
 * Integration Test: Truck Inspection Flow
 */

import { createServer } from '../../src/server';
import { FastifyInstance } from 'fastify';
import { query } from '../../src/db/connection';

describe('Truck Inspection Flow', () => {
  let server: FastifyInstance;
  let operatorToken: string;
  let franchiseToken: string;
  let truckId: string;

  beforeAll(async () => {
    server = await createServer();
    await server.ready();

    // Create test users
    await query(
      `INSERT INTO users (id, mobile, name, role, kyc_status, is_active)
       VALUES ('TEST-OP', '+919999999910', 'Test Operator', 'OPERATOR', 'VERIFIED', true)`
    );
    await query(
      `INSERT INTO users (id, mobile, name, role, kyc_status, is_active, franchise_id)
       VALUES ('TEST-FR', '+919999999911', 'Test Franchise', 'FRANCHISE', 'VERIFIED', true, 'FR-001')`
    );

    // Create test truck
    const truckResult = await query(
      `INSERT INTO trucks (id, operator_id, registration_number, vehicle_type, capacity_tons, status)
       VALUES ('TEST-TRUCK-2', 'TEST-OP', 'MH12CD5678', 'DXL', 15, 'ACTIVE')
       RETURNING id`
    );
    truckId = truckResult.rows[0].id;

    operatorToken = 'mock-operator-token';
    franchiseToken = 'mock-franchise-token';
  });

  afterAll(async () => {
    await query(`DELETE FROM truck_inspections WHERE truck_id = $1`, [truckId]);
    await query(`DELETE FROM trucks WHERE id = $1`, [truckId]);
    await query(`DELETE FROM users WHERE id IN ('TEST-OP', 'TEST-FR')`);
    await server.close();
  });

  test('1. Create inspection', async () => {
    const response = await server.inject({
      method: 'POST',
      url: `/v1/trucks/${truckId}/inspect`,
      headers: {
        authorization: `Bearer ${franchiseToken}`,
      },
      payload: {
        photos: [
          {
            base64: Buffer.from('test image').toString('base64'),
            fileName: 'inspection1.jpg',
          },
        ],
        latitude: 12.9716,
        longitude: 77.5946,
        notes: 'Truck in good condition',
      },
    });

    expect(response.statusCode).toBe(201);
    const inspection = JSON.parse(response.body);
    expect(inspection.truckId).toBe(truckId);
  });

  test('2. Get truck inspections', async () => {
    const response = await server.inject({
      method: 'GET',
      url: `/v1/trucks/${truckId}`,
      headers: {
        authorization: `Bearer ${operatorToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const truck = JSON.parse(response.body);
    expect(truck.id).toBe(truckId);
  });
});

