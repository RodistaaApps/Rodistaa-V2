/**
 * Truck API Endpoint Tests
 */

import { buildApp } from '../index';
import { FastifyInstance } from 'fastify';

describe('Truck API Endpoints', () => {
  let app: FastifyInstance;
  const testOperatorId = 'OP_TEST_001';
  const testToken = 'test-jwt-token';

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/operator/:operatorId/trucks', () => {
    it('should return 201 and flags array when unusual config submitted', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/operator/${testOperatorId}/trucks`,
        headers: {
          authorization: `Bearer ${testToken}`,
        },
        payload: {
          rc_number: 'MH12AB1234',
          tyre_count: 6,
          body_length_ft: 24, // Unusual for 6-tyre
          body_type: 'OPEN',
          rc_copy: Buffer.from('test rc copy').toString('base64'),
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.flags).toBeDefined();
      expect(Array.isArray(body.flags)).toBe(true);
      expect(body.status).toBe('PENDING_VERIFICATION');
    });

    it('should return 400 for invalid input', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/operator/${testOperatorId}/trucks`,
        headers: {
          authorization: `Bearer ${testToken}`,
        },
        payload: {
          rc_number: 'SHORT', // Invalid
          tyre_count: 8, // Invalid
          body_length_ft: 16,
          body_type: 'OPEN',
          rc_copy: Buffer.from('test').toString('base64'),
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errors).toBeDefined();
    });

    it('should return 409 for duplicate RC number', async () => {
      // First create
      await app.inject({
        method: 'POST',
        url: `/api/operator/${testOperatorId}/trucks`,
        headers: {
          authorization: `Bearer ${testToken}`,
        },
        payload: {
          rc_number: 'MH12AB5678',
          tyre_count: 6,
          body_length_ft: 16,
          body_type: 'OPEN',
          rc_copy: Buffer.from('test').toString('base64'),
        },
      });

      // Try duplicate
      const response = await app.inject({
        method: 'POST',
        url: `/api/operator/${testOperatorId}/trucks`,
        headers: {
          authorization: `Bearer ${testToken}`,
        },
        payload: {
          rc_number: 'MH12AB5678', // Duplicate
          tyre_count: 6,
          body_length_ft: 16,
          body_type: 'OPEN',
          rc_copy: Buffer.from('test').toString('base64'),
        },
      });

      expect(response.statusCode).toBe(409);
    });
  });

  describe('GET /api/trucks/:truckId', () => {
    it('should return truck details with flags history', async () => {
      // Create truck first
      const createResponse = await app.inject({
        method: 'POST',
        url: `/api/operator/${testOperatorId}/trucks`,
        headers: {
          authorization: `Bearer ${testToken}`,
        },
        payload: {
          rc_number: 'MH12AB9999',
          tyre_count: 6,
          body_length_ft: 16,
          body_type: 'OPEN',
          rc_copy: Buffer.from('test').toString('base64'),
        },
      });

      const created = JSON.parse(createResponse.body);
      const truckId = created.id;

      // Get details
      const response = await app.inject({
        method: 'GET',
        url: `/api/trucks/${truckId}`,
        headers: {
          authorization: `Bearer ${testToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.truck).toBeDefined();
      expect(body.flags_history).toBeDefined();
    });
  });
});

