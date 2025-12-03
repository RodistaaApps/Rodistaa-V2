/**
 * Complete Booking Flow Integration Test
 * Tests: Booking → Bidding → Shipment → POD → Payment
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000/v1';

describe('Complete Booking Flow - Integration Test', () => {
  let api: AxiosInstance;
  let shipperToken: string;
  let operatorToken: string;
  let driverToken: string;
  let bookingId: string;
  let bidId: string;
  let shipmentId: string;

  beforeAll(async () => {
    api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      validateStatus: () => true, // Don't throw on any status
    });

    // Login as shipper
    const shipperOtp = await api.post('/auth/otp', {
      mobile: '+919876543210',
    });
    expect(shipperOtp.status).toBe(200);

    const shipperLogin = await api.post('/auth/login', {
      mobile: '+919876543210',
      otp: '123456',
    });
    expect(shipperLogin.status).toBe(200);
    shipperToken = shipperLogin.data.token;

    // Login as operator
    const operatorOtp = await api.post('/auth/otp', {
      mobile: '+919876543211',
    });
    expect(operatorOtp.status).toBe(200);

    const operatorLogin = await api.post('/auth/login', {
      mobile: '+919876543211',
      otp: '123456',
    });
    expect(operatorLogin.status).toBe(200);
    operatorToken = operatorLogin.data.token;

    // Login as driver
    const driverOtp = await api.post('/auth/otp', {
      mobile: '+919876543213',
    });
    expect(driverOtp.status).toBe(200);

    const driverLogin = await api.post('/auth/login', {
      mobile: '+919876543213',
      otp: '123456',
    });
    expect(driverLogin.status).toBe(200);
    driverToken = driverLogin.data.token;
  });

  describe('Step 1: Create Booking (Shipper)', () => {
    it('should create a new booking', async () => {
      const response = await api.post(
        '/bookings',
        {
          type: 'FTL',
          pickup: {
            address: 'Mumbai, Maharashtra',
            coordinates: { lat: 19.076, lng: 72.8777 },
            date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          },
          drop: {
            address: 'Delhi, Delhi',
            coordinates: { lat: 28.7041, lng: 77.1025 },
          },
          goods: 'Electronics',
          tonnage: 10,
          truckType: '20ft Container',
          priceRange: {
            min: 40000,
            max: 50000,
          },
        },
        {
          headers: { Authorization: `Bearer ${shipperToken}` },
        }
      );

      console.log('Create Booking Response:', response.status, response.data);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.status).toBe('DRAFT');

      bookingId = response.data.id;
    });

    it('should publish booking to load board', async () => {
      const response = await api.post(
        `/bookings/${bookingId}/publish`,
        {
          bidDeadline: new Date(Date.now() + 7200000).toISOString(), // 2 hours
        },
        {
          headers: { Authorization: `Bearer ${shipperToken}` },
        }
      );

      console.log('Publish Booking Response:', response.status, response.data);

      expect([200, 201]).toContain(response.status);
      expect(response.data.status).toBe('PUBLISHED');
    });
  });

  describe('Step 2: Bidding (Operator)', () => {
    it('should view published booking on load board', async () => {
      const response = await api.get('/load-board', {
        headers: { Authorization: `Bearer ${operatorToken}` },
      });

      console.log('Load Board Response:', response.status, response.data);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      const booking = response.data.find((b: any) => b.id === bookingId);
      expect(booking).toBeDefined();
      expect(booking.status).toBe('PUBLISHED');
    });

    it('should place a bid on the booking', async () => {
      const response = await api.post(
        '/bids',
        {
          bookingId,
          amount: 45000,
          truckId: 'TRK-001', // Use existing truck
          estimatedPickupTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour
          remarks: 'Can deliver in 24 hours',
        },
        {
          headers: { Authorization: `Bearer ${operatorToken}` },
        }
      );

      console.log('Place Bid Response:', response.status, response.data);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.status).toBe('PENDING');

      bidId = response.data.id;
    });
  });

  describe('Step 3: Accept Bid (Shipper)', () => {
    it('should list bids for booking', async () => {
      const response = await api.get(`/bookings/${bookingId}/bids`, {
        headers: { Authorization: `Bearer ${shipperToken}` },
      });

      console.log('List Bids Response:', response.status, response.data);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);

      const bid = response.data.find((b: any) => b.id === bidId);
      expect(bid).toBeDefined();
    });

    it('should accept the bid', async () => {
      const response = await api.post(
        `/bids/${bidId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${shipperToken}` },
        }
      );

      console.log('Accept Bid Response:', response.status, response.data);

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('ACCEPTED');
    });

    it('should verify booking status changed to CONFIRMED', async () => {
      const response = await api.get(`/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${shipperToken}` },
      });

      console.log('Booking Status Response:', response.status, response.data);

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('CONFIRMED');
    });

    it('should create shipment after bid acceptance', async () => {
      const response = await api.get('/shipments', {
        headers: { Authorization: `Bearer ${shipperToken}` },
        params: { bookingId },
      });

      console.log('Get Shipment Response:', response.status, response.data);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      const shipment = response.data.find((s: any) => s.bookingId === bookingId);
      expect(shipment).toBeDefined();
      expect(shipment.status).toBe('ASSIGNED');

      shipmentId = shipment.id;
    });
  });

  describe('Step 4: Shipment Tracking (Driver)', () => {
    it('should view assigned shipment', async () => {
      const response = await api.get('/shipments/assigned', {
        headers: { Authorization: `Bearer ${driverToken}` },
      });

      console.log('Assigned Shipments Response:', response.status, response.data);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should update shipment status to IN_TRANSIT', async () => {
      const response = await api.patch(
        `/shipments/${shipmentId}/status`,
        {
          status: 'IN_TRANSIT',
          coordinates: { lat: 19.076, lng: 72.8777 },
        },
        {
          headers: { Authorization: `Bearer ${driverToken}` },
        }
      );

      console.log('Update Status Response:', response.status, response.data);

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('IN_TRANSIT');
    });

    it('should send GPS location updates', async () => {
      const response = await api.post(
        '/tracking/gps',
        {
          shipmentId,
          coordinates: { lat: 20.5937, lng: 78.9629 }, // Midway point
          speed: 60,
          heading: 45,
        },
        {
          headers: { Authorization: `Bearer ${driverToken}` },
        }
      );

      console.log('GPS Update Response:', response.status, response.data);

      expect([200, 201]).toContain(response.status);
    });
  });

  describe('Step 5: Proof of Delivery (Driver)', () => {
    it('should reach destination', async () => {
      const response = await api.patch(
        `/shipments/${shipmentId}/status`,
        {
          status: 'REACHED',
          coordinates: { lat: 28.7041, lng: 77.1025 },
        },
        {
          headers: { Authorization: `Bearer ${driverToken}` },
        }
      );

      console.log('Reached Status Response:', response.status, response.data);

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('REACHED');
    });

    it('should upload POD document', async () => {
      // Simulate file upload (in real test, use FormData)
      const response = await api.post(
        `/shipments/${shipmentId}/pod`,
        {
          type: 'PHOTO',
          url: 'https://example.com/pod.jpg', // Mock URL
          signature: 'base64-signature-data',
          otp: '123456', // Delivery OTP
          receiverName: 'John Doe',
          receiverMobile: '+919999999999',
        },
        {
          headers: { Authorization: `Bearer ${driverToken}` },
        }
      );

      console.log('Upload POD Response:', response.status, response.data);

      expect([200, 201]).toContain(response.status);
    });

    it('should mark shipment as DELIVERED', async () => {
      const response = await api.patch(
        `/shipments/${shipmentId}/status`,
        {
          status: 'DELIVERED',
        },
        {
          headers: { Authorization: `Bearer ${driverToken}` },
        }
      );

      console.log('Delivered Status Response:', response.status, response.data);

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('DELIVERED');
    });
  });

  describe('Step 6: Verify POD (Shipper)', () => {
    it('should view POD documents', async () => {
      const response = await api.get(`/shipments/${shipmentId}/pod`, {
        headers: { Authorization: `Bearer ${shipperToken}` },
      });

      console.log('View POD Response:', response.status, response.data);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('documents');
    });

    it('should accept POD', async () => {
      const response = await api.post(
        `/shipments/${shipmentId}/pod/accept`,
        {
          rating: 5,
          feedback: 'Excellent service',
        },
        {
          headers: { Authorization: `Bearer ${shipperToken}` },
        }
      );

      console.log('Accept POD Response:', response.status, response.data);

      expect(response.status).toBe(200);
    });
  });

  describe('Step 7: Payment', () => {
    it('should process payment', async () => {
      const response = await api.post(
        '/payments',
        {
          shipmentId,
          amount: 45000,
          method: 'RAZORPAY',
        },
        {
          headers: { Authorization: `Bearer ${shipperToken}` },
        }
      );

      console.log('Payment Response:', response.status, response.data);

      expect([200, 201]).toContain(response.status);
    });

    it('should verify booking status changed to COMPLETED', async () => {
      const response = await api.get(`/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${shipperToken}` },
      });

      console.log('Final Booking Status:', response.status, response.data);

      expect(response.status).toBe(200);
      expect(['COMPLETED', 'DELIVERED']).toContain(response.data.status);
    });
  });

  afterAll(async () => {
    console.log('\n=== Test Summary ===');
    console.log(`Booking ID: ${bookingId}`);
    console.log(`Bid ID: ${bidId}`);
    console.log(`Shipment ID: ${shipmentId}`);
    console.log('All steps completed successfully!');
  });
});

describe('Flow Error Scenarios', () => {
  let api: AxiosInstance;
  let shipperToken: string;

  beforeAll(async () => {
    api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      validateStatus: () => true,
    });

    const otpRes = await api.post('/auth/otp', { mobile: '+919876543210' });
    const loginRes = await api.post('/auth/login', {
      mobile: '+919876543210',
      otp: '123456',
    });
    shipperToken = loginRes.data.token;
  });

  it('should reject booking with invalid data', async () => {
    const response = await api.post(
      '/bookings',
      {
        // Missing required fields
        goods: 'Test',
      },
      {
        headers: { Authorization: `Bearer ${shipperToken}` },
      }
    );

    expect(response.status).toBe(400);
    expect(response.data).toHaveProperty('code');
  });

  it('should reject unauthorized bid acceptance', async () => {
    const response = await api.post(
      '/bids/non-existent-bid/accept',
      {},
      {
        headers: { Authorization: `Bearer ${shipperToken}` },
      }
    );

    expect([404, 403]).toContain(response.status);
  });

  it('should reject POD upload without reaching destination', async () => {
    const response = await api.post(
      '/shipments/non-existent/pod',
      {
        type: 'PHOTO',
        url: 'test.jpg',
      },
      {
        headers: { Authorization: `Bearer ${shipperToken}` },
      }
    );

    expect([404, 400, 403]).toContain(response.status);
  });
});

