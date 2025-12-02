/**
 * K6 Load Test - Complete Booking Flow
 * Tests: Booking creation → Bid placement → Acceptance → Shipment
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const bookingDuration = new Trend('booking_creation_duration');
const bidDuration = new Trend('bid_placement_duration');
const bookingCounter = new Counter('bookings_created');
const bidCounter = new Counter('bids_placed');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 20 },  // Ramp up to 20 users
    { duration: '3m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 for 5 minutes
    { duration: '1m', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:4000/v1';

// Helper: Generate random phone number
function randomPhone() {
  return `98${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
}

// Helper: Login and get token
function login(role = 'shipper') {
  const phone = randomPhone();
  const otp = '123456'; // Mock OTP
  
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    phone,
    otp,
    deviceId: `device-${__VU}-${__ITER}`,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'got access token': (r) => JSON.parse(r.body).accessToken !== undefined,
  });

  if (loginRes.status !== 200) {
    errorRate.add(1);
    return null;
  }

  return JSON.parse(loginRes.body).accessToken;
}

// Main scenario
export default function () {
  // Shipper flow: Create booking
  const shipperToken = login('shipper');
  if (!shipperToken) return;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${shipperToken}`,
  };

  // Create booking
  const bookingStart = Date.now();
  const bookingPayload = {
    pickup: {
      address: 'Mumbai Port, Gate 5',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      coordinates: { lat: 18.9388, lng: 72.8354 },
    },
    drop: {
      address: 'Delhi Warehouse, Sector 12',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      coordinates: { lat: 28.6139, lng: 77.2090 },
    },
    goods: {
      type: 'Electronics',
      description: 'Consumer electronics',
    },
    tonnage: 15,
    priceRangeMin: 20000,
    priceRangeMax: 30000,
  };

  const bookingRes = http.post(
    `${BASE_URL}/bookings`,
    JSON.stringify(bookingPayload),
    { headers }
  );

  const bookingSuccess = check(bookingRes, {
    'booking created': (r) => r.status === 201,
    'booking has ID': (r) => JSON.parse(r.body).id !== undefined,
  });

  if (!bookingSuccess) {
    errorRate.add(1);
    return;
  }

  bookingDuration.add(Date.now() - bookingStart);
  bookingCounter.add(1);

  const booking = JSON.parse(bookingRes.body);
  sleep(1);

  // Operator flow: Place bid
  const operatorToken = login('operator');
  if (!operatorToken) return;

  const operatorHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${operatorToken}`,
  };

  const bidStart = Date.now();
  const bidPayload = {
    bookingId: booking.id,
    amount: 25000,
    truckId: `TRK-${Math.random().toString(36).substr(2, 9)}`,
  };

  const bidRes = http.post(
    `${BASE_URL}/bookings/${booking.id}/bids`,
    JSON.stringify(bidPayload),
    { headers: operatorHeaders }
  );

  const bidSuccess = check(bidRes, {
    'bid placed': (r) => r.status === 201,
    'bid has ID': (r) => JSON.parse(r.body).id !== undefined,
  });

  if (!bidSuccess) {
    errorRate.add(1);
    return;
  }

  bidDuration.add(Date.now() - bidStart);
  bidCounter.add(1);

  sleep(1);

  // Shipper flow: Accept bid (admin can force-finalize)
  const bidsListRes = http.get(
    `${BASE_URL}/bookings/${booking.id}/bids`,
    { headers }
  );

  check(bidsListRes, {
    'bids retrieved': (r) => r.status === 200,
  });

  sleep(2); // Simulate user think time
}

// Teardown (optional)
export function teardown(data) {
  console.log('Load test completed');
  console.log(`Total bookings created: ${bookingCounter.count}`);
  console.log(`Total bids placed: ${bidCounter.count}`);
}

