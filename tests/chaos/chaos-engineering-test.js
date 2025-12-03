/**
 * CHAOS ENGINEERING TEST
 * Simulates various failure scenarios to test system resilience
 * 
 * Run: k6 run tests/chaos/chaos-engineering-test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const resilienceScore = new Rate('resilience_score');
const recoveryTime = new Trend('recovery_time_ms');
const failureHandling = new Rate('failure_handling_success');
const circuitBreakerTrips = new Counter('circuit_breaker_trips');

export const options = {
  scenarios: {
    // Scenario 1: Gradual degradation
    gradual_degradation: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '3m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'testGradualDegradation',
    },
    
    // Scenario 2: Network latency
    network_chaos: {
      executor: 'constant-vus',
      vus: 50,
      duration: '3m',
      startTime: '6m',
      exec: 'testNetworkChaos',
    },
    
    // Scenario 3: Random failures
    random_failures: {
      executor: 'constant-vus',
      vus: 30,
      duration: '3m',
      startTime: '9m',
      exec: 'testRandomFailures',
    },
  },
  
  thresholds: {
    'resilience_score': ['rate>0.80'], // System should handle 80%+ failures gracefully
    'failure_handling_success': ['rate>0.90'], // 90%+ proper error handling
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000/v1';

// Scenario 1: Test gradual degradation
export function testGradualDegradation() {
  group('Gradual Degradation Test', function() {
    // Simulate slow database by making complex queries
    const res = http.get(`${BASE_URL}/load-board?limit=100&sort=price&filter=all`);
    
    const handled = check(res, {
      'Request completes': (r) => r.status !== 0,
      'Response time acceptable': (r) => r.timings.duration < 5000, // 5s timeout
      'Error message clear': (r) => {
        if (r.status >= 500) {
          return r.body.includes('error') || r.body.includes('message');
        }
        return true;
      },
    });
    
    resilienceScore.add(handled);
    failureHandling.add(handled);
    
    sleep(1);
  });
}

// Scenario 2: Network chaos (latency, timeouts)
export function testNetworkChaos() {
  group('Network Chaos Test', function() {
    // Simulate network issues by using very short timeouts
    const params = {
      timeout: '500ms', // Very short timeout
    };
    
    const startTime = Date.now();
    const res = http.get(`${BASE_URL}/health`, params);
    const responseTime = Date.now() - startTime;
    
    const handled = check(res, {
      'Handles timeout gracefully': (r) => {
        if (r.status === 0) {
          // Request timed out - check if handled properly
          return r.error_code !== undefined;
        }
        return true;
      },
      'Returns within timeout': (r) => responseTime < 1000,
    });
    
    resilienceScore.add(handled);
    
    if (res.status === 0) {
      recoveryTime.add(responseTime);
    }
    
    sleep(randomIntBetween(1, 3));
  });
}

// Scenario 3: Random failures and edge cases
export function testRandomFailures() {
  group('Random Failures Test', function() {
    const scenarios = [
      // Scenario A: Invalid JSON
      () => {
        const res = http.post(`${BASE_URL}/bookings`, 'invalid{json}here', {
          headers: { 'Content-Type': 'application/json' },
        });
        return check(res, {
          'Invalid JSON handled': (r) => r.status === 400 || r.status === 401,
        });
      },
      
      // Scenario B: Missing required headers
      () => {
        const res = http.get(`${BASE_URL}/bookings`);
        return check(res, {
          'Missing auth handled': (r) => r.status === 401,
        });
      },
      
      // Scenario C: Invalid content type
      () => {
        const res = http.post(`${BASE_URL}/auth/otp`, 'mobile=123', {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return check(res, {
          'Wrong content type handled': (r) => r.status === 400 || r.status === 415,
        });
      },
      
      // Scenario D: Very large payload
      () => {
        const largePayload = 'x'.repeat(10000000); // 10MB string
        const res = http.post(`${BASE_URL}/bookings`, JSON.stringify({
          goods: largePayload,
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
        return check(res, {
          'Large payload rejected': (r) => r.status === 413 || r.status === 400 || r.status === 401,
        });
      },
      
      // Scenario E: Concurrent updates (race condition)
      () => {
        const bookingId = 'BK-TEST-001';
        const responses = http.batch([
          ['PATCH', `${BASE_URL}/bookings/${bookingId}/status`, JSON.stringify({ status: 'CONFIRMED' })],
          ['PATCH', `${BASE_URL}/bookings/${bookingId}/status`, JSON.stringify({ status: 'CANCELLED' })],
        ]);
        
        return check(responses, {
          'Race condition handled': (r) => r.every(res => res.status !== 0),
        });
      },
      
      // Scenario F: Null/undefined values
      () => {
        const res = http.post(`${BASE_URL}/bookings`, JSON.stringify({
          pickup: null,
          drop: undefined,
          goods: '',
          tonnage: null,
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
        return check(res, {
          'Null values handled': (r) => r.status === 400 || r.status === 401,
        });
      },
    ];
    
    // Run random scenario
    const scenario = scenarios[randomIntBetween(0, scenarios.length - 1)];
    const handled = scenario();
    
    failureHandling.add(handled);
    resilienceScore.add(handled);
    
    sleep(randomIntBetween(1, 5));
  });
}

export function handleSummary(data) {
  const issues = data.metrics.security_issues_found?.values.count || 0;
  const resilienceRate = data.metrics.resilience_score?.values.rate || 0;
  const failureHandlingRate = data.metrics.failure_handling_success?.values.rate || 0;
  
  let summary = '\n' + '='.repeat(70) + '\n';
  summary += '          CHAOS ENGINEERING TEST SUMMARY\n';
  summary += '='.repeat(70) + '\n\n';
  
  summary += `Resilience Score: ${(resilienceRate * 100).toFixed(2)}%\n`;
  summary += `Failure Handling: ${(failureHandlingRate * 100).toFixed(2)}%\n`;
  summary += `Security Issues: ${issues}\n\n`;
  
  if (resilienceRate > 0.8 && failureHandlingRate > 0.9 && issues < 5) {
    summary += '✓ SYSTEM IS RESILIENT!\n';
    summary += 'Platform handles failures gracefully.\n';
  } else {
    summary += '⚠ IMPROVEMENTS NEEDED\n';
    summary += 'Some failure scenarios not handled optimally.\n';
  }
  
  summary += '\n' + '='.repeat(70) + '\n';
  
  return {
    'chaos-test-results.json': JSON.stringify(data, null, 2),
    stdout: summary,
  };
}

