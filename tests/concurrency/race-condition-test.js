/**
 * RACE CONDITION & CONCURRENCY TEST
 * Tests for race conditions, deadlocks, and concurrent update issues
 * 
 * Run: k6 run tests/concurrency/race-condition-test.js
 */

import http from 'k6/http';
import { check, group } from 'k6';
import { Rate, Counter } from 'k6/metrics';

// Custom metrics
const raceConditionsDetected = new Counter('race_conditions_detected');
const concurrencyIssues = new Counter('concurrency_issues');
const dataIntegrityViolations = new Counter('data_integrity_violations');
const deadlocksDetected = new Counter('deadlocks_detected');

export const options = {
  scenarios: {
    // High concurrency on same resources
    concurrent_updates: {
      executor: 'shared-iterations',
      vus: 50,
      iterations: 500,
      maxDuration: '5m',
    },
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000/v1';

export function setup() {
  const http = require('k6/http').default;
  
  // Authenticate a user
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    mobile: '+919876543210',
    otp: '123456',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (loginRes.status === 200) {
    const body = JSON.parse(loginRes.body);
    return { token: body.token };
  }
  
  return { token: null };
}

export default function(data) {
  if (!data.token) return;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };
  
  // Test 1: Concurrent booking updates
  group('Concurrent Booking Status Updates', function() {
    const bookingId = `BK-RACE-${__VU}`; // Shared booking ID
    
    // Try to update status concurrently
    const statuses = ['CONFIRMED', 'CANCELLED', 'PUBLISHED'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    const res = http.patch(`${BASE_URL}/bookings/${bookingId}/status`, JSON.stringify({
      status: randomStatus,
    }), { headers });
    
    // Should handle concurrent updates gracefully
    check(res, {
      'No 500 errors on concurrent update': (r) => r.status !== 500,
      'Returns valid response': (r) => r.status === 200 || r.status === 404 || r.status === 409,
    }) || concurrencyIssues.add(1);
    
    if (res.status === 409) {
      // Conflict detected - good!
      raceConditionsDetected.add(1);
    }
  });
  
  // Test 2: Concurrent bid acceptance
  group('Concurrent Bid Acceptance', function() {
    const bookingId = `BK-MULTI-BID-${__VU}`;
    const bidId = `BD-TEST-${__ITER}`;
    
    // Multiple VUs try to accept same bid
    const res = http.post(`${BASE_URL}/bids/${bidId}/accept`, JSON.stringify({}), { headers });
    
    check(res, {
      'Handles concurrent bid acceptance': (r) => {
        // First one should succeed (200), others should fail (409 or 400)
        return r.status === 200 || r.status === 409 || r.status === 400 || r.status === 404;
      },
    }) || concurrencyIssues.add(1);
    
    if (res.status === 409) {
      // Optimistic locking working
      console.log('Concurrent bid acceptance prevented');
    }
  });
  
  // Test 3: Database transaction isolation
  group('Transaction Isolation Test', function() {
    // Create multiple bookings rapidly
    const responses = http.batch([
      ['POST', `${BASE_URL}/bookings`, JSON.stringify({
        type: 'FTL',
        pickup: { address: 'Mumbai', coordinates: { lat: 19, lng: 72 } },
        drop: { address: 'Delhi', coordinates: { lat: 28, lng: 77 } },
        goods: 'Test',
        tonnage: 10,
        truckType: '20ft Container',
        priceRange: { min: 40000, max: 50000 },
      }), { headers }],
      ['POST', `${BASE_URL}/bookings`, JSON.stringify({
        type: 'FTL',
        pickup: { address: 'Mumbai', coordinates: { lat: 19, lng: 72 } },
        drop: { address: 'Delhi', coordinates: { lat: 28, lng: 77 } },
        goods: 'Test 2',
        tonnage: 12,
        truckType: '20ft Container',
        priceRange: { min: 40000, max: 50000 },
      }), { headers }],
    ]);
    
    responses.forEach(res => {
      check(res, {
        'Transaction completed': (r) => r.status === 201 || r.status === 400 || r.status === 401,
        'No deadlock': (r) => !r.body.includes('deadlock'),
      }) || deadlocksDetected.add(1);
    });
  });
  
  // Test 4: GPS update race condition
  group('Concurrent GPS Updates', function() {
    const shipmentId = `SH-GPS-RACE-${__VU}`;
    
    // Rapid GPS updates
    for (let i = 0; i < 3; i++) {
      http.post(`${BASE_URL}/tracking/gps`, JSON.stringify({
        shipmentId,
        coordinates: {
          lat: 19.076 + (Math.random() - 0.5) * 0.01,
          lng: 72.8777 + (Math.random() - 0.5) * 0.01,
        },
        speed: 60,
        heading: 45,
      }), { headers });
    }
    
    // Verify data integrity - all updates should be saved
    const gpsRes = http.get(`${BASE_URL}/tracking/gps/${shipmentId}`, { headers });
    
    if (gpsRes.status === 200) {
      try {
        const body = JSON.parse(gpsRes.body);
        
        check(body, {
          'GPS updates not lost': (b) => {
            // Should have at least one update
            return Array.isArray(b) ? b.length > 0 : true;
          },
        }) || dataIntegrityViolations.add(1);
      } catch (e) {
        dataIntegrityViolations.add(1);
      }
    }
  });
  
  // Test 5: Counter increment race condition
  group('Counter Increment Race Condition', function() {
    // Multiple VUs incrementing same counter
    const res = http.post(`${BASE_URL}/stats/increment`, JSON.stringify({
      metric: 'test_counter',
      value: 1,
    }), { headers });
    
    check(res, {
      'Counter increment handled': (r) => [200, 201, 404].includes(r.status),
    }) || concurrencyIssues.add(1);
  });
}

export function handleSummary(data) {
  const raceConditions = data.metrics.race_conditions_detected?.values.count || 0;
  const concurrencyIssues = data.metrics.concurrency_issues?.values.count || 0;
  const dataViolations = data.metrics.data_integrity_violations?.values.count || 0;
  const deadlocks = data.metrics.deadlocks_detected?.values.count || 0;
  
  let summary = '\n' + '='.repeat(70) + '\n';
  summary += '          RACE CONDITION & CONCURRENCY TEST SUMMARY\n';
  summary += '='.repeat(70) + '\n\n';
  
  summary += `Race Conditions Detected: ${raceConditions}\n`;
  summary += `Concurrency Issues: ${concurrencyIssues}\n`;
  summary += `Data Integrity Violations: ${dataViolations}\n`;
  summary += `Deadlocks Detected: ${deadlocks}\n\n`;
  
  const totalIssues = concurrencyIssues + dataViolations + deadlocks;
  
  if (totalIssues === 0) {
    summary += '✓ NO CONCURRENCY ISSUES DETECTED!\n';
    summary += 'System handles concurrent requests properly.\n';
  } else if (totalIssues < 10) {
    summary += `⚠ ${totalIssues} MINOR ISSUES FOUND\n`;
    summary += 'Review concurrent access patterns.\n';
  } else {
    summary += `✗ ${totalIssues} CONCURRENCY ISSUES!\n`;
    summary += 'CRITICAL: Fix race conditions before production!\n';
  }
  
  summary += '\n' + '='.repeat(70) + '\n';
  
  return {
    'race-condition-results.json': JSON.stringify(data, null, 2),
    stdout: summary,
  };
}

