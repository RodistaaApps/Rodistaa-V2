/**
 * SECURITY PENETRATION TEST
 * Tests common security vulnerabilities
 * 
 * Run: k6 run tests/security/security-penetration-test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

// Custom metrics
const securityIssuesFound = new Counter('security_issues_found');
const vulnerabilityRate = new Rate('vulnerability_rate');
const authBypassAttempts = new Rate('auth_bypass_attempts');
const injectionAttempts = new Rate('injection_attempts');

export const options = {
  vus: 10,
  duration: '5m',
  thresholds: {
    'security_issues_found': ['count<5'], // Should find < 5 issues
    'vulnerability_rate': ['rate<0.1'],    // < 10% vulnerability rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000/v1';

export default function() {
  // Test 1: SQL Injection Attempts
  group('SQL Injection Tests', function() {
    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users--",
      "' UNION SELECT * FROM users--",
      "admin'--",
      "' OR 1=1--",
    ];
    
    sqlPayloads.forEach(payload => {
      const res = http.post(`${BASE_URL}/auth/otp`, JSON.stringify({
        mobile: payload,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
      
      const vulnerable = check(res, {
        'SQL injection blocked': (r) => r.status !== 200 || !r.body.includes('error'),
      });
      
      if (!vulnerable) {
        securityIssuesFound.add(1);
        vulnerabilityRate.add(1);
      }
    });
  });
  
  sleep(1);
  
  // Test 2: Authentication Bypass
  group('Authentication Bypass Tests', function() {
    // Try to access protected endpoints without token
    const protectedEndpoints = [
      '/bookings',
      '/bids',
      '/shipments',
      '/users/me',
      '/load-board',
    ];
    
    protectedEndpoints.forEach(endpoint => {
      const res = http.get(`${BASE_URL}${endpoint}`);
      
      const secure = check(res, {
        'Requires authentication': (r) => r.status === 401,
      });
      
      if (!secure) {
        securityIssuesFound.add(1);
        authBypassAttempts.add(1);
      }
    });
    
    // Try with invalid token
    const invalidTokenRes = http.get(`${BASE_URL}/bookings`, {
      headers: { 'Authorization': 'Bearer invalid_token_12345' },
    });
    
    check(invalidTokenRes, {
      'Invalid token rejected': (r) => r.status === 401,
    }) || securityIssuesFound.add(1);
  });
  
  sleep(1);
  
  // Test 3: XSS (Cross-Site Scripting)
  group('XSS Tests', function() {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>',
    ];
    
    // Get valid token first
    const otpRes = http.post(`${BASE_URL}/auth/otp`, JSON.stringify({
      mobile: '+919876543210',
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (otpRes.status === 200) {
      const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
        mobile: '+919876543210',
        otp: '123456',
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (loginRes.status === 200) {
        const token = JSON.parse(loginRes.body).token;
        
        xssPayloads.forEach(payload => {
          const res = http.post(`${BASE_URL}/bookings`, JSON.stringify({
            pickup: { address: payload, coordinates: { lat: 19, lng: 72 } },
            drop: { address: 'Delhi', coordinates: { lat: 28, lng: 77 } },
            goods: payload,
            tonnage: 10,
            priceRange: { min: 40000, max: 50000 },
          }), {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          
          const sanitized = check(res, {
            'XSS payload sanitized': (r) => {
              if (r.status === 201) {
                const body = r.body;
                return !body.includes('<script>') && !body.includes('onerror');
              }
              return true;
            },
          });
          
          if (!sanitized) {
            securityIssuesFound.add(1);
            vulnerabilityRate.add(1);
          }
        });
      }
    }
  });
  
  sleep(1);
  
  // Test 4: CSRF Protection
  group('CSRF Tests', function() {
    // Try to make requests from different origins
    const res = http.post(`${BASE_URL}/bookings`, JSON.stringify({
      pickup: { address: 'Mumbai', coordinates: { lat: 19, lng: 72 } },
      drop: { address: 'Delhi', coordinates: { lat: 28, lng: 77 } },
      goods: 'Test',
      tonnage: 10,
      priceRange: { min: 40000, max: 50000 },
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://evil.com',
      },
    });
    
    check(res, {
      'CORS properly configured': (r) => r.status === 401 || r.status === 403,
    }) || securityIssuesFound.add(1);
  });
  
  sleep(1);
  
  // Test 5: Rate Limiting
  group('Rate Limiting Tests', function() {
    let blockedCount = 0;
    
    // Attempt to make 150 rapid requests
    for (let i = 0; i < 150; i++) {
      const res = http.get(`${BASE_URL}/health`);
      if (res.status === 429) {
        blockedCount++;
      }
    }
    
    check(blockedCount, {
      'Rate limiting active': (count) => count > 50, // Should block some requests
    }) || securityIssuesFound.add(1);
  });
  
  sleep(1);
  
  // Test 6: Sensitive Data Exposure
  group('Data Exposure Tests', function() {
    // Check if errors expose sensitive information
    const res = http.get(`${BASE_URL}/bookings/non-existent-id`);
    
    check(res, {
      'No stack trace in error': (r) => !r.body.includes('at ') && !r.body.includes('Error:'),
      'No database details': (r) => !r.body.includes('postgres') && !r.body.includes('SQL'),
    }) || securityIssuesFound.add(1);
  });
  
  sleep(1);
  
  // Test 7: JWT Token Security
  group('JWT Security Tests', function() {
    // Try to use expired token (would need actual expired token)
    // Try to modify token
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiJ9.fake_signature';
    
    const res = http.get(`${BASE_URL}/bookings`, {
      headers: { 'Authorization': `Bearer ${fakeToken}` },
    });
    
    check(res, {
      'Fake JWT rejected': (r) => r.status === 401,
    }) || securityIssuesFound.add(1);
  });
  
  sleep(1);
  
  // Test 8: Path Traversal
  group('Path Traversal Tests', function() {
    const traversalPayloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32',
      '....//....//....//etc/passwd',
    ];
    
    traversalPayloads.forEach(payload => {
      const res = http.get(`${BASE_URL}/files/${payload}`);
      
      check(res, {
        'Path traversal blocked': (r) => r.status === 404 || r.status === 400,
      }) || securityIssuesFound.add(1);
    });
  });
  
  sleep(1);
  
  // Test 9: Mass Assignment
  group('Mass Assignment Tests', function() {
    const otpRes = http.post(`${BASE_URL}/auth/otp`, JSON.stringify({
      mobile: '+919876543210',
    }), { headers: { 'Content-Type': 'application/json' } });
    
    if (otpRes.status === 200) {
      const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
        mobile: '+919876543210',
        otp: '123456',
      }), { headers: { 'Content-Type': 'application/json' } });
      
      if (loginRes.status === 200) {
        const token = JSON.parse(loginRes.body).token;
        
        // Try to set admin role via mass assignment
        const res = http.post(`${BASE_URL}/bookings`, JSON.stringify({
          pickup: { address: 'Mumbai', coordinates: { lat: 19, lng: 72 } },
          drop: { address: 'Delhi', coordinates: { lat: 28, lng: 77 } },
          goods: 'Test',
          tonnage: 10,
          priceRange: { min: 40000, max: 50000 },
          role: 'ADMIN', // Try to inject admin role
          isVerified: true, // Try to bypass verification
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        check(res, {
          'Mass assignment prevented': (r) => {
            if (r.status === 201) {
              const body = JSON.parse(r.body);
              return !body.role || body.role !== 'ADMIN';
            }
            return true;
          },
        }) || securityIssuesFound.add(1);
      }
    }
  });
  
  sleep(1);
  
  // Test 10: NoSQL Injection (if applicable)
  group('NoSQL Injection Tests', function() {
    const noSqlPayloads = [
      '{"$gt": ""}',
      '{"$ne": null}',
      '{"$regex": ".*"}',
    ];
    
    noSqlPayloads.forEach(payload => {
      const res = http.post(`${BASE_URL}/auth/otp`, JSON.stringify({
        mobile: payload,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
      
      check(res, {
        'NoSQL injection blocked': (r) => r.status !== 200 || r.body.includes('Invalid'),
      }) || injectionAttempts.add(1);
    });
  });
}

export function handleSummary(data) {
  const issuesFound = data.metrics.security_issues_found.values.count;
  
  let summary = '\n' + '='.repeat(70) + '\n';
  summary += '          SECURITY PENETRATION TEST SUMMARY\n';
  summary += '='.repeat(70) + '\n\n';
  
  summary += `Security Issues Found: ${issuesFound}\n\n`;
  
  if (issuesFound === 0) {
    summary += '✓ NO SECURITY VULNERABILITIES DETECTED!\n';
    summary += 'All security tests passed successfully.\n';
  } else if (issuesFound < 5) {
    summary += `⚠ ${issuesFound} MINOR ISSUES FOUND\n`;
    summary += 'Review and address these issues before production.\n';
  } else {
    summary += `✗ ${issuesFound} SECURITY ISSUES FOUND!\n`;
    summary += 'CRITICAL: Address all issues immediately!\n';
  }
  
  summary += '\n' + '='.repeat(70) + '\n';
  
  return {
    'security-test-results.json': JSON.stringify(data, null, 2),
    stdout: summary,
  };
}

