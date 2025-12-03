/**
 * K6 Load Test Script for Rodistaa Platform
 * Usage: k6 run tests/load/k6-load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency');
const successfulLogins = new Counter('successful_logins');
const successfulBookings = new Counter('successful_bookings');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Spike to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '5m', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    http_req_failed: ['rate<0.01'],                 // Error rate < 1%
    errors: ['rate<0.05'],                           // Custom error rate < 5%
    api_latency: ['p(95)<600'],                      // 95% API calls < 600ms
  },
};

// Environment configuration
const BASE_URL = __ENV.BASE_URL || 'https://api-staging.rodistaa.com';
const API_VERSION = '/v1';

// Test data
const TEST_USERS = [
  { mobile: '+919876543210', role: 'SHIPPER' },
  { mobile: '+919876543211', role: 'SHIPPER' },
  { mobile: '+919876543212', role: 'OPERATOR' },
  { mobile: '+919876543213', role: 'OPERATOR' },
  { mobile: '+919876543214', role: 'DRIVER' },
];

// Helper function to get random user
function getRandomUser() {
  return TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
}

// Helper function to login and get token
function login(mobile) {
  // Request OTP
  let otpRes = http.post(
    `${BASE_URL}${API_VERSION}/auth/otp`,
    JSON.stringify({ mobile }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(otpRes, {
    'OTP request successful': (r) => r.status === 200,
  });

  sleep(1);

  // Login with OTP
  let loginRes = http.post(
    `${BASE_URL}${API_VERSION}/auth/login`,
    JSON.stringify({ mobile, otp: '123456' }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const loginSuccess = check(loginRes, {
    'Login successful': (r) => r.status === 200,
    'Token received': (r) => r.json('token') !== undefined,
  });

  if (loginSuccess) {
    successfulLogins.add(1);
    const body = JSON.parse(loginRes.body);
    return body.token;
  }

  errorRate.add(1);
  return null;
}

// Main test scenarios
export default function () {
  const user = getRandomUser();

  group('Authentication Flow', () => {
    const token = login(user.mobile);

    if (!token) {
      return; // Skip rest if login failed
    }

    sleep(1);

    // Test protected endpoint
    group('Get User Profile', () => {
      const start = new Date();
      const res = http.get(`${BASE_URL}${API_VERSION}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const duration = new Date() - start;

      apiLatency.add(duration);

      check(res, {
        'Profile fetched': (r) => r.status === 200,
        'User data present': (r) => r.json('id') !== undefined,
      });
    });

    sleep(2);

    // Test specific to role
    if (user.role === 'SHIPPER') {
      shipperScenarios(token);
    } else if (user.role === 'OPERATOR') {
      operatorScenarios(token);
    } else if (user.role === 'DRIVER') {
      driverScenarios(token);
    }
  });

  sleep(1);
}

// Shipper-specific scenarios
function shipperScenarios(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  group('Shipper: View Bookings', () => {
    const res = http.get(`${BASE_URL}${API_VERSION}/bookings`, { headers });
    check(res, {
      'Bookings fetched': (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  sleep(1);

  group('Shipper: Create Booking', () => {
    const booking = {
      type: 'FTL',
      from: {
        address: 'Mumbai, Maharashtra',
        coordinates: { lat: 19.076, lng: 72.8777 },
      },
      to: {
        address: 'Delhi, Delhi',
        coordinates: { lat: 28.7041, lng: 77.1025 },
      },
      pickupTime: new Date(Date.now() + 86400000).toISOString(),
      truckType: '20ft Container',
      weight: 10000,
      material: 'Electronics',
    };

    const res = http.post(
      `${BASE_URL}${API_VERSION}/bookings`,
      JSON.stringify(booking),
      { headers }
    );

    const bookingSuccess = check(res, {
      'Booking created': (r) => r.status === 201,
      'Booking ID returned': (r) => r.json('id') !== undefined,
    });

    if (bookingSuccess) {
      successfulBookings.add(1);
    } else {
      errorRate.add(1);
    }
  });

  sleep(2);
}

// Operator-specific scenarios
function operatorScenarios(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  group('Operator: View Load Board', () => {
    const res = http.get(`${BASE_URL}${API_VERSION}/load-board`, { headers });
    check(res, {
      'Load board fetched': (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  sleep(1);

  group('Operator: View My Trucks', () => {
    const res = http.get(`${BASE_URL}${API_VERSION}/trucks`, { headers });
    check(res, {
      'Trucks fetched': (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  sleep(2);
}

// Driver-specific scenarios
function driverScenarios(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  group('Driver: View Assigned Shipments', () => {
    const res = http.get(`${BASE_URL}${API_VERSION}/shipments/assigned`, {
      headers,
    });
    check(res, {
      'Shipments fetched': (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  sleep(1);

  group('Driver: Update GPS Location', () => {
    const location = {
      shipmentId: 'SH-TEST-001',
      coordinates: {
        lat: 19.076 + Math.random() * 0.1,
        lng: 72.8777 + Math.random() * 0.1,
      },
      speed: 60 + Math.random() * 20,
      heading: Math.random() * 360,
    };

    const res = http.post(
      `${BASE_URL}${API_VERSION}/tracking/gps`,
      JSON.stringify(location),
      { headers }
    );

    check(res, {
      'GPS updated': (r) => r.status === 200 || r.status === 201,
    }) || errorRate.add(1);
  });

  sleep(30); // Simulate GPS update interval
}

// Health check scenario (separate)
export function healthCheck() {
  group('Health Checks', () => {
    const healthRes = http.get(`${BASE_URL}/health`);
    check(healthRes, {
      'Health check passed': (r) => r.status === 200,
    });

    const dbHealthRes = http.get(`${BASE_URL}${API_VERSION}/health/db`);
    check(dbHealthRes, {
      'Database healthy': (r) => r.status === 200,
    });

    const redisHealthRes = http.get(`${BASE_URL}${API_VERSION}/health/redis`);
    check(redisHealthRes, {
      'Redis healthy': (r) => r.status === 200,
    });
  });
}

// Summary handler
export function handleSummary(data) {
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;

  let summary = '\n' + indent + '='.repeat(60) + '\n';
  summary += indent + 'LOAD TEST SUMMARY\n';
  summary += indent + '='.repeat(60) + '\n\n';

  // HTTP metrics
  summary += indent + 'HTTP Metrics:\n';
  summary += indent + `  Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += indent + `  Failed Requests: ${data.metrics.http_req_failed.values.passes}\n`;
  summary += indent + `  Request Duration (avg): ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += indent + `  Request Duration (p95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += indent + `  Request Duration (p99): ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n\n`;

  // Custom metrics
  summary += indent + 'Custom Metrics:\n';
  summary += indent + `  Successful Logins: ${data.metrics.successful_logins.values.count}\n`;
  summary += indent + `  Successful Bookings: ${data.metrics.successful_bookings.values.count}\n`;
  summary += indent + `  Error Rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%\n\n`;

  // Thresholds
  summary += indent + 'Thresholds:\n';
  Object.keys(data.metrics).forEach((metric) => {
    if (data.metrics[metric].thresholds) {
      Object.keys(data.metrics[metric].thresholds).forEach((threshold) => {
        const passed = data.metrics[metric].thresholds[threshold].ok;
        const status = passed ? '✓ PASS' : '✗ FAIL';
        summary += indent + `  ${status}: ${threshold}\n`;
      });
    }
  });

  summary += '\n' + indent + '='.repeat(60) + '\n';

  return summary;
}

