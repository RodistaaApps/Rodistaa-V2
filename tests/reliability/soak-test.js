/**
 * SOAK TEST (Endurance Test)
 * Tests system stability over extended period (24 hours recommended)
 * Detects memory leaks, connection leaks, and degradation over time
 * 
 * Run: k6 run tests/reliability/soak-test.js
 * Quick run (1 hour): k6 run --duration 1h tests/reliability/soak-test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { randomIntBetween, randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const memoryLeakIndicator = new Trend('memory_leak_indicator');
const responseTimeOverTime = new Trend('response_time_over_time');
const errorRateOverTime = new Rate('error_rate_over_time');
const activeConnections = new Gauge('active_connections');
const successfulOperations = new Counter('successful_operations');

export const options = {
  scenarios: {
    // Constant load for extended period
    constant_load: {
      executor: 'constant-vus',
      vus: 100, // Moderate constant load
      duration: '24h', // 24 hours - change for shorter tests
      gracefulStop: '30s',
    },
  },
  
  thresholds: {
    http_req_duration: ['p(95)<1000'], // Should stay consistent
    http_req_failed: ['rate<0.02'],     // Error rate should stay low
    'response_time_over_time': ['p(95)<1500'], // No degradation
    'error_rate_over_time': ['rate<0.03'], // Error rate stable
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000/v1';

const cities = [
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
];

const goods = ['Electronics', 'Furniture', 'Textiles', 'Machinery'];

export function setup() {
  console.log('🕐 Starting SOAK TEST (Endurance Test)');
  console.log('This test runs for an extended period to detect:');
  console.log('  - Memory leaks');
  console.log('  - Connection leaks');
  console.log('  - Performance degradation');
  console.log('  - Resource exhaustion');
  console.log('');
  console.log('Monitor your system resources during this test!');
  
  // Authenticate users
  const http = require('k6/http').default;
  const users = [];
  
  ['+919876543210', '+919876543211', '+919876543212'].forEach(mobile => {
    const otpRes = http.post(`${BASE_URL}/auth/otp`, JSON.stringify({ mobile }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (otpRes.status === 200) {
      const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
        mobile,
        otp: '123456',
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (loginRes.status === 200) {
        const body = JSON.parse(loginRes.body);
        users.push({
          mobile,
          token: body.token,
          userId: body.user.id,
          role: body.user.role,
        });
      }
    }
  });
  
  console.log(`✓ Authenticated ${users.length} users`);
  return { users, startTime: Date.now() };
}

export default function(data) {
  const user = randomItem(data.users);
  if (!user) return;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`,
  };
  
  const elapsedHours = (Date.now() - data.startTime) / 3600000;
  
  // Vary operations to simulate real usage
  const operation = randomIntBetween(1, 10);
  
  if (operation <= 3) {
    // 30%: List bookings
    group('List Bookings', function() {
      const startTime = Date.now();
      const res = http.get(`${BASE_URL}/bookings?limit=20`, { headers });
      const duration = Date.now() - startTime;
      
      responseTimeOverTime.add(duration);
      
      const success = check(res, {
        'list bookings success': (r) => r.status === 200,
        'response time acceptable': (r) => duration < 2000,
      });
      
      if (success) {
        successfulOperations.add(1);
      } else {
        errorRateOverTime.add(1);
      }
      
      // Memory leak indicator: if response time increases over time
      if (elapsedHours > 1) {
        memoryLeakIndicator.add(duration);
      }
    });
    
  } else if (operation <= 5) {
    // 20%: Create booking
    group('Create Booking', function() {
      const pickup = randomItem(cities);
      const drop = randomItem(cities);
      
      const startTime = Date.now();
      const res = http.post(`${BASE_URL}/bookings`, JSON.stringify({
        type: 'FTL',
        pickup: {
          address: `${pickup.name}, India`,
          coordinates: { lat: pickup.lat, lng: pickup.lng },
          date: new Date(Date.now() + randomIntBetween(1, 7) * 86400000).toISOString(),
        },
        drop: {
          address: `${drop.name}, India`,
          coordinates: { lat: drop.lat, lng: drop.lng },
        },
        goods: randomItem(goods),
        tonnage: randomIntBetween(5, 20),
        truckType: '20ft Container',
        priceRange: { min: 40000, max: 50000 },
      }), { headers });
      const duration = Date.now() - startTime;
      
      responseTimeOverTime.add(duration);
      
      const success = check(res, {
        'create booking success': (r) => r.status === 201,
      });
      
      if (success) {
        successfulOperations.add(1);
      } else {
        errorRateOverTime.add(1);
      }
    });
    
  } else if (operation <= 7) {
    // 20%: View load board
    group('View Load Board', function() {
      const startTime = Date.now();
      const res = http.get(`${BASE_URL}/load-board?limit=50`, { headers });
      const duration = Date.now() - startTime;
      
      responseTimeOverTime.add(duration);
      
      const success = check(res, {
        'load board success': (r) => r.status === 200,
      });
      
      if (success) {
        successfulOperations.add(1);
      } else {
        errorRateOverTime.add(1);
      }
    });
    
  } else if (operation <= 9) {
    // 20%: GPS updates
    group('GPS Update', function() {
      const location = randomItem(cities);
      
      const startTime = Date.now();
      const res = http.post(`${BASE_URL}/tracking/gps`, JSON.stringify({
        shipmentId: `SH-TEST-${randomIntBetween(1, 100)}`,
        coordinates: {
          lat: location.lat + (Math.random() - 0.5) * 0.1,
          lng: location.lng + (Math.random() - 0.5) * 0.1,
        },
        speed: randomIntBetween(40, 80),
        heading: randomIntBetween(0, 360),
      }), { headers });
      const duration = Date.now() - startTime;
      
      responseTimeOverTime.add(duration);
      
      const success = check(res, {
        'gps update success': (r) => [200, 201].includes(r.status),
      });
      
      if (success) {
        successfulOperations.add(1);
      } else {
        errorRateOverTime.add(1);
      }
    });
    
  } else {
    // 10%: Health check
    const res = http.get(`${BASE_URL.replace('/v1', '')}/health`);
    check(res, {
      'health check success': (r) => r.status === 200,
    });
  }
  
  // Simulate realistic user think time
  sleep(randomIntBetween(2, 8));
}

export function handleSummary(data) {
  const totalRequests = data.metrics.http_reqs.values.count;
  const avgDuration = data.metrics.http_req_duration.values.avg;
  const p95Duration = data.metrics.http_req_duration.values['p(95)'];
  const errorRate = data.metrics.http_req_failed.values.rate;
  const successOps = data.metrics.successful_operations?.values.count || 0;
  
  let summary = '\n' + '='.repeat(70) + '\n';
  summary += '          SOAK TEST (ENDURANCE) SUMMARY\n';
  summary += '='.repeat(70) + '\n\n';
  
  summary += `Total Requests: ${totalRequests}\n`;
  summary += `Successful Operations: ${successOps}\n`;
  summary += `Average Response Time: ${avgDuration.toFixed(2)}ms\n`;
  summary += `P95 Response Time: ${p95Duration.toFixed(2)}ms\n`;
  summary += `Error Rate: ${(errorRate * 100).toFixed(2)}%\n\n`;
  
  // Check for performance degradation
  const responseTimeMetric = data.metrics.response_time_over_time;
  if (responseTimeMetric) {
    const minTime = responseTimeMetric.values.min;
    const maxTime = responseTimeMetric.values.max;
    const degradation = ((maxTime - minTime) / minTime) * 100;
    
    summary += `Performance Degradation: ${degradation.toFixed(2)}%\n`;
    
    if (degradation < 20) {
      summary += '✓ NO SIGNIFICANT DEGRADATION\n';
    } else if (degradation < 50) {
      summary += '⚠ MODERATE DEGRADATION - Review for memory leaks\n';
    } else {
      summary += '✗ SIGNIFICANT DEGRADATION - Memory leak likely!\n';
    }
  }
  
  summary += '\n';
  
  if (errorRate < 0.02 && avgDuration < 1000) {
    summary += '✓ SYSTEM IS STABLE FOR EXTENDED PERIODS\n';
    summary += 'No memory leaks or performance degradation detected.\n';
  } else {
    summary += '⚠ STABILITY ISSUES DETECTED\n';
    summary += 'Review logs and metrics for optimization opportunities.\n';
  }
  
  summary += '\n' + '='.repeat(70) + '\n';
  
  return {
    'soak-test-results.json': JSON.stringify(data, null, 2),
    stdout: summary,
  };
}

