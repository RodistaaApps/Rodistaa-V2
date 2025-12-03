/**
 * AGGRESSIVE STRESS TEST for Rodistaa Platform
 * Tests system under extreme load conditions
 * 
 * Run: k6 run tests/stress/aggressive-stress-test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { randomIntBetween, randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const bookingCreationRate = new Rate('booking_creation_success');
const bidPlacementRate = new Rate('bid_placement_success');
const gpsUpdateRate = new Rate('gps_update_success');
const errorRate = new Rate('errors');
const bookingLatency = new Trend('booking_creation_latency');
const bidLatency = new Trend('bid_placement_latency');
const apiLatency = new Trend('api_response_latency');
const activeUsers = new Gauge('active_concurrent_users');
const dbConnections = new Gauge('database_connections');

// AGGRESSIVE TEST CONFIGURATION
export const options = {
  stages: [
    // RAMP UP: Gradual increase
    { duration: '2m', target: 100 },   // 0-100 users in 2 min
    { duration: '3m', target: 300 },   // 100-300 users in 3 min
    { duration: '2m', target: 500 },   // 300-500 users in 2 min
    
    // PEAK LOAD: Sustained high load
    { duration: '10m', target: 500 },  // Hold 500 users for 10 min
    
    // SPIKE TEST: Sudden spike
    { duration: '30s', target: 1000 }, // Sudden spike to 1000
    { duration: '5m', target: 1000 },  // Hold 1000 users for 5 min
    
    // EXTREME STRESS: Push to limits
    { duration: '1m', target: 1500 },  // Push to 1500
    { duration: '3m', target: 1500 },  // Hold 1500 users
    
    // RECOVERY TEST: Gradual cooldown
    { duration: '2m', target: 500 },   // Drop to 500
    { duration: '2m', target: 100 },   // Drop to 100
    { duration: '1m', target: 0 },     // Ramp down
  ],
  
  thresholds: {
    // Relaxed thresholds for aggressive testing
    http_req_duration: ['p(95)<2000', 'p(99)<5000'], // 95% < 2s, 99% < 5s
    http_req_failed: ['rate<0.05'],                   // Error rate < 5%
    errors: ['rate<0.10'],                             // Custom error rate < 10%
    booking_creation_success: ['rate>0.85'],          // 85% booking success
    bid_placement_success: ['rate>0.85'],             // 85% bid success
    gps_update_success: ['rate>0.90'],                // 90% GPS success
  },
  
  // Extended timeouts for aggressive testing
  httpDebug: 'full',
  noConnectionReuse: false,
  userAgent: 'K6-Stress-Test/1.0',
};

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000/v1';
const TEST_DURATION = 30; // minutes

// Test data pools
const cities = [
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
];

const goods = [
  'Electronics', 'Furniture', 'Textiles', 'Machinery', 
  'Food Items', 'Steel', 'Cement', 'Coal', 'Chemicals'
];

const truckTypes = ['20ft Container', '32ft Container', 'Trailer', 'Open Truck'];

// User pools (simulate multiple users)
const testUsers = [
  { mobile: '+919876543210', role: 'SHIPPER', token: null },
  { mobile: '+919876543211', role: 'OPERATOR', token: null },
  { mobile: '+919876543212', role: 'OPERATOR', token: null },
  { mobile: '+919876543213', role: 'DRIVER', token: null },
  { mobile: '+919876543214', role: 'SHIPPER', token: null },
];

// Setup function - runs once per VU
export function setup() {
  console.log('🔥 STARTING AGGRESSIVE STRESS TEST');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Duration: ${TEST_DURATION} minutes`);
  console.log(`Max Concurrent Users: 1500`);
  
  // Authenticate test users
  const authenticatedUsers = [];
  
  for (const user of testUsers) {
    try {
      // Request OTP
      http.post(`${BASE_URL}/auth/otp`, JSON.stringify({
        mobile: user.mobile,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
      
      sleep(0.5);
      
      // Login
      const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
        mobile: user.mobile,
        otp: '123456',
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (loginRes.status === 200) {
        const body = JSON.parse(loginRes.body);
        authenticatedUsers.push({
          ...user,
          token: body.token,
          userId: body.user.id,
        });
      }
    } catch (e) {
      console.error(`Failed to authenticate ${user.mobile}:`, e);
    }
  }
  
  console.log(`✓ Authenticated ${authenticatedUsers.length} users`);
  return { users: authenticatedUsers };
}

// Main test function
export default function(data) {
  activeUsers.add(1);
  
  // Randomly select user type for this VU
  const user = randomItem(data.users);
  
  if (!user || !user.token) {
    errorRate.add(1);
    sleep(1);
    return;
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`,
  };
  
  // Simulate different user behaviors based on role
  if (user.role === 'SHIPPER') {
    shipperFlow(headers);
  } else if (user.role === 'OPERATOR') {
    operatorFlow(headers);
  } else if (user.role === 'DRIVER') {
    driverFlow(headers);
  }
  
  // Random think time (1-5 seconds)
  sleep(randomIntBetween(1, 5));
}

// Shipper user flow
function shipperFlow(headers) {
  group('Shipper Flow', function() {
    // 1. View my bookings (70% probability)
    if (Math.random() < 0.7) {
      const start = new Date();
      const res = http.get(`${BASE_URL}/bookings?limit=20`, { headers });
      const duration = new Date() - start;
      
      apiLatency.add(duration);
      
      check(res, {
        'list bookings success': (r) => r.status === 200,
      }) || errorRate.add(1);
    }
    
    sleep(1);
    
    // 2. Create new booking (30% probability)
    if (Math.random() < 0.3) {
      const pickup = randomItem(cities);
      const drop = randomItem(cities);
      
      const booking = {
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
        truckType: randomItem(truckTypes),
        priceRange: {
          min: randomIntBetween(30000, 50000),
          max: randomIntBetween(50000, 80000),
        },
      };
      
      const start = new Date();
      const res = http.post(`${BASE_URL}/bookings`, JSON.stringify(booking), { headers });
      const duration = new Date() - start;
      
      bookingLatency.add(duration);
      apiLatency.add(duration);
      
      const success = check(res, {
        'create booking success': (r) => r.status === 201,
      });
      
      bookingCreationRate.add(success);
      if (!success) errorRate.add(1);
      
      // If successful, try to publish (50% chance)
      if (success && Math.random() < 0.5) {
        sleep(0.5);
        const body = JSON.parse(res.body);
        const publishRes = http.post(
          `${BASE_URL}/bookings/${body.id}/publish`,
          JSON.stringify({
            bidDeadline: new Date(Date.now() + 7200000).toISOString(),
          }),
          { headers }
        );
        
        check(publishRes, {
          'publish booking success': (r) => [200, 201].includes(r.status),
        }) || errorRate.add(1);
      }
    }
    
    sleep(1);
    
    // 3. Check bids (40% probability)
    if (Math.random() < 0.4) {
      const res = http.get(`${BASE_URL}/bookings?status=PUBLISHED&limit=10`, { headers });
      
      if (res.status === 200) {
        try {
          const bookings = JSON.parse(res.body);
          if (bookings.length > 0) {
            const bookingId = bookings[0].id;
            const bidsRes = http.get(`${BASE_URL}/bookings/${bookingId}/bids`, { headers });
            
            check(bidsRes, {
              'get bids success': (r) => r.status === 200,
            }) || errorRate.add(1);
          }
        } catch (e) {
          errorRate.add(1);
        }
      }
    }
  });
}

// Operator user flow
function operatorFlow(headers) {
  group('Operator Flow', function() {
    // 1. View load board (80% probability)
    if (Math.random() < 0.8) {
      const start = new Date();
      const res = http.get(`${BASE_URL}/load-board?limit=50`, { headers });
      const duration = new Date() - start;
      
      apiLatency.add(duration);
      
      check(res, {
        'load board success': (r) => r.status === 200,
      }) || errorRate.add(1);
    }
    
    sleep(1);
    
    // 2. Place bid (40% probability)
    if (Math.random() < 0.4) {
      const loadBoardRes = http.get(`${BASE_URL}/load-board?limit=20`, { headers });
      
      if (loadBoardRes.status === 200) {
        try {
          const bookings = JSON.parse(loadBoardRes.body);
          if (bookings.length > 0) {
            const booking = randomItem(bookings);
            
            const bid = {
              bookingId: booking.id,
              amount: randomIntBetween(35000, 75000),
              truckId: `TRK-${randomIntBetween(1, 10)}`,
              estimatedPickupTime: new Date(Date.now() + randomIntBetween(1, 48) * 3600000).toISOString(),
              remarks: 'Quick delivery available',
            };
            
            const start = new Date();
            const bidRes = http.post(`${BASE_URL}/bids`, JSON.stringify(bid), { headers });
            const duration = new Date() - start;
            
            bidLatency.add(duration);
            apiLatency.add(duration);
            
            const success = check(bidRes, {
              'place bid success': (r) => r.status === 201,
            });
            
            bidPlacementRate.add(success);
            if (!success) errorRate.add(1);
          }
        } catch (e) {
          errorRate.add(1);
        }
      }
    }
    
    sleep(1);
    
    // 3. View my bids (50% probability)
    if (Math.random() < 0.5) {
      const res = http.get(`${BASE_URL}/bids?status=PENDING&limit=20`, { headers });
      
      check(res, {
        'get my bids success': (r) => r.status === 200,
      }) || errorRate.add(1);
    }
  });
}

// Driver user flow
function driverFlow(headers) {
  group('Driver Flow', function() {
    // 1. View assigned shipments (90% probability)
    if (Math.random() < 0.9) {
      const res = http.get(`${BASE_URL}/shipments/assigned`, { headers });
      
      check(res, {
        'get assigned shipments success': (r) => r.status === 200,
      }) || errorRate.add(1);
    }
    
    sleep(0.5);
    
    // 2. Send GPS updates (70% probability)
    if (Math.random() < 0.7) {
      const location = randomItem(cities);
      
      const gpsData = {
        shipmentId: `SH-TEST-${randomIntBetween(1, 100)}`,
        coordinates: {
          lat: location.lat + (Math.random() - 0.5) * 0.1,
          lng: location.lng + (Math.random() - 0.5) * 0.1,
        },
        speed: randomIntBetween(40, 80),
        heading: randomIntBetween(0, 360),
      };
      
      const start = new Date();
      const res = http.post(`${BASE_URL}/tracking/gps`, JSON.stringify(gpsData), { headers });
      const duration = new Date() - start;
      
      apiLatency.add(duration);
      
      const success = check(res, {
        'gps update success': (r) => [200, 201].includes(r.status),
      });
      
      gpsUpdateRate.add(success);
      if (!success) errorRate.add(1);
    }
  });
}

// Teardown function
export function teardown(data) {
  console.log('\n🏁 STRESS TEST COMPLETE');
  console.log(`Total VUs tested: ${data.users.length}`);
  console.log('Check summary for detailed metrics');
}

// Custom summary
export function handleSummary(data) {
  return {
    'stress-test-results.json': JSON.stringify(data, null, 2),
    stdout: generateTextSummary(data),
  };
}

function generateTextSummary(data) {
  const indent = '  ';
  let summary = '\n' + '='.repeat(70) + '\n';
  summary += '          AGGRESSIVE STRESS TEST SUMMARY\n';
  summary += '='.repeat(70) + '\n\n';
  
  // HTTP metrics
  summary += 'HTTP Metrics:\n';
  summary += `${indent}Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}Failed Requests: ${data.metrics.http_req_failed.values.passes} (${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%)\n`;
  summary += `${indent}Request Duration (avg): ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}Request Duration (p95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}Request Duration (p99): ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  summary += `${indent}Request Duration (max): ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n\n`;
  
  // Custom metrics
  summary += 'Business Metrics:\n';
  if (data.metrics.booking_creation_success) {
    summary += `${indent}Booking Creation Success: ${(data.metrics.booking_creation_success.values.rate * 100).toFixed(2)}%\n`;
  }
  if (data.metrics.bid_placement_success) {
    summary += `${indent}Bid Placement Success: ${(data.metrics.bid_placement_success.values.rate * 100).toFixed(2)}%\n`;
  }
  if (data.metrics.gps_update_success) {
    summary += `${indent}GPS Update Success: ${(data.metrics.gps_update_success.values.rate * 100).toFixed(2)}%\n`;
  }
  if (data.metrics.errors) {
    summary += `${indent}Error Rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%\n`;
  }
  
  summary += '\n';
  
  // Latency metrics
  summary += 'Latency Breakdown:\n';
  if (data.metrics.booking_creation_latency) {
    summary += `${indent}Booking Creation (avg): ${data.metrics.booking_creation_latency.values.avg.toFixed(2)}ms\n`;
  }
  if (data.metrics.bid_placement_latency) {
    summary += `${indent}Bid Placement (avg): ${data.metrics.bid_placement_latency.values.avg.toFixed(2)}ms\n`;
  }
  
  summary += '\n';
  
  // Threshold results
  summary += 'Threshold Results:\n';
  let passCount = 0;
  let failCount = 0;
  
  Object.keys(data.metrics).forEach(metric => {
    if (data.metrics[metric].thresholds) {
      Object.keys(data.metrics[metric].thresholds).forEach(threshold => {
        const passed = data.metrics[metric].thresholds[threshold].ok;
        const status = passed ? '✓ PASS' : '✗ FAIL';
        summary += `${indent}${status}: ${threshold}\n`;
        
        if (passed) passCount++;
        else failCount++;
      });
    }
  });
  
  summary += '\n';
  summary += `Thresholds Passed: ${passCount}/${passCount + failCount}\n`;
  
  summary += '\n' + '='.repeat(70) + '\n';
  
  if (failCount === 0) {
    summary += '✓ ALL TESTS PASSED - System handled stress well!\n';
  } else {
    summary += `⚠ ${failCount} THRESHOLD(S) FAILED - Review and optimize\n`;
  }
  
  summary += '='.repeat(70) + '\n\n';
  
  return summary;
}

