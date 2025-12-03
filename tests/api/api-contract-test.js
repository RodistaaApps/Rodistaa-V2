/**
 * API CONTRACT TEST
 * Validates API responses match expected schemas and contracts
 * 
 * Run: k6 run tests/api/api-contract-test.js
 */

import http from 'k6/http';
import { check, group } from 'k6';
import { Rate, Counter } from 'k6/metrics';

// Custom metrics
const contractViolations = new Counter('contract_violations');
const schemaValidationRate = new Rate('schema_validation_success');

export const options = {
  vus: 5,
  duration: '3m',
  thresholds: {
    'contract_violations': ['count<10'], // Should have < 10 violations
    'schema_validation_success': ['rate>0.95'], // 95%+ valid responses
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000/v1';

// Expected schemas
const schemas = {
  healthCheck: {
    required: ['status', 'timestamp'],
    types: {
      status: 'string',
      timestamp: 'string',
    },
  },
  
  loginResponse: {
    required: ['token', 'user'],
    types: {
      token: 'string',
      user: 'object',
    },
    nested: {
      user: {
        required: ['id', 'mobile', 'role'],
        types: {
          id: 'string',
          mobile: 'string',
          role: 'string',
        },
      },
    },
  },
  
  booking: {
    required: ['id', 'shipperId', 'type', 'status', 'createdAt'],
    types: {
      id: 'string',
      shipperId: 'string',
      type: 'string',
      status: 'string',
      tonnage: 'number',
      createdAt: 'string',
    },
  },
  
  bid: {
    required: ['id', 'bookingId', 'operatorId', 'amount', 'status'],
    types: {
      id: 'string',
      bookingId: 'string',
      operatorId: 'string',
      amount: 'number',
      status: 'string',
    },
  },
  
  errorResponse: {
    required: ['code', 'message'],
    types: {
      code: 'string',
      message: 'string',
    },
  },
};

// Schema validation function
function validateSchema(obj, schema) {
  const errors = [];
  
  // Check required fields
  schema.required.forEach(field => {
    if (!(field in obj)) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Check types
  Object.keys(schema.types).forEach(field => {
    if (field in obj) {
      const expectedType = schema.types[field];
      const actualType = typeof obj[field];
      
      if (expectedType === 'object' && obj[field] !== null && actualType !== 'object') {
        errors.push(`Field ${field}: expected object, got ${actualType}`);
      } else if (expectedType !== 'object' && actualType !== expectedType) {
        errors.push(`Field ${field}: expected ${expectedType}, got ${actualType}`);
      }
    }
  });
  
  // Check nested schemas
  if (schema.nested) {
    Object.keys(schema.nested).forEach(field => {
      if (field in obj && obj[field]) {
        const nestedErrors = validateSchema(obj[field], schema.nested[field]);
        errors.push(...nestedErrors);
      }
    });
  }
  
  return errors;
}

export default function() {
  let token = null;
  
  // Test 1: Health Check Contract
  group('Health Check API Contract', function() {
    const res = http.get(`${BASE_URL.replace('/v1', '')}/health`);
    
    const valid = check(res, {
      'status is 200': (r) => r.status === 200,
      'response is JSON': (r) => r.headers['Content-Type']?.includes('application/json'),
    });
    
    if (valid && res.body) {
      try {
        const body = JSON.parse(res.body);
        const errors = validateSchema(body, schemas.healthCheck);
        
        const schemaValid = check(errors, {
          'schema is valid': (e) => e.length === 0,
        });
        
        schemaValidationRate.add(schemaValid);
        
        if (!schemaValid) {
          console.log('Health check schema errors:', errors);
          contractViolations.add(errors.length);
        }
      } catch (e) {
        contractViolations.add(1);
        schemaValidationRate.add(0);
      }
    }
  });
  
  // Test 2: Authentication API Contract
  group('Authentication API Contract', function() {
    // Request OTP
    const otpRes = http.post(`${BASE_URL}/auth/otp`, JSON.stringify({
      mobile: '+919876543210',
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    check(otpRes, {
      'OTP request returns 200': (r) => r.status === 200,
      'Content-Type is JSON': (r) => r.headers['Content-Type']?.includes('application/json'),
    });
    
    // Login
    const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
      mobile: '+919876543210',
      otp: '123456',
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (loginRes.status === 200) {
      try {
        const body = JSON.parse(loginRes.body);
        const errors = validateSchema(body, schemas.loginResponse);
        
        const schemaValid = check(errors, {
          'login schema is valid': (e) => e.length === 0,
        });
        
        schemaValidationRate.add(schemaValid);
        
        if (!schemaValid) {
          console.log('Login schema errors:', errors);
          contractViolations.add(errors.length);
        }
        
        token = body.token;
      } catch (e) {
        contractViolations.add(1);
        schemaValidationRate.add(0);
      }
    }
  });
  
  if (!token) return;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  
  // Test 3: Booking API Contract
  group('Booking API Contract', function() {
    // Create booking
    const createRes = http.post(`${BASE_URL}/bookings`, JSON.stringify({
      type: 'FTL',
      pickup: {
        address: 'Mumbai, Maharashtra',
        coordinates: { lat: 19.076, lng: 72.8777 },
        date: new Date(Date.now() + 86400000).toISOString(),
      },
      drop: {
        address: 'Delhi, Delhi',
        coordinates: { lat: 28.7041, lng: 77.1025 },
      },
      goods: 'Test Goods',
      tonnage: 10,
      truckType: '20ft Container',
      priceRange: { min: 40000, max: 50000 },
    }), { headers });
    
    if (createRes.status === 201) {
      try {
        const body = JSON.parse(createRes.body);
        const errors = validateSchema(body, schemas.booking);
        
        const schemaValid = check(errors, {
          'booking schema is valid': (e) => e.length === 0,
        });
        
        schemaValidationRate.add(schemaValid);
        
        if (!schemaValid) {
          console.log('Booking schema errors:', errors);
          contractViolations.add(errors.length);
        }
      } catch (e) {
        contractViolations.add(1);
        schemaValidationRate.add(0);
      }
    }
    
    // List bookings
    const listRes = http.get(`${BASE_URL}/bookings`, { headers });
    
    if (listRes.status === 200) {
      try {
        const body = JSON.parse(listRes.body);
        
        check(body, {
          'bookings list is array': (b) => Array.isArray(b),
        }) || contractViolations.add(1);
        
        if (Array.isArray(body) && body.length > 0) {
          const errors = validateSchema(body[0], schemas.booking);
          const schemaValid = errors.length === 0;
          schemaValidationRate.add(schemaValid);
          
          if (!schemaValid) {
            contractViolations.add(errors.length);
          }
        }
      } catch (e) {
        contractViolations.add(1);
        schemaValidationRate.add(0);
      }
    }
  });
  
  // Test 4: Error Response Contract
  group('Error Response Contract', function() {
    // Trigger error by accessing non-existent resource
    const res = http.get(`${BASE_URL}/bookings/non-existent-id-12345`, { headers });
    
    if (res.status === 404) {
      try {
        const body = JSON.parse(res.body);
        const errors = validateSchema(body, schemas.errorResponse);
        
        const schemaValid = check(errors, {
          'error schema is valid': (e) => e.length === 0,
        });
        
        schemaValidationRate.add(schemaValid);
        
        if (!schemaValid) {
          console.log('Error response schema errors:', errors);
          contractViolations.add(errors.length);
        }
      } catch (e) {
        contractViolations.add(1);
        schemaValidationRate.add(0);
      }
    }
  });
  
  // Test 5: HTTP Headers Contract
  group('HTTP Headers Contract', function() {
    const res = http.get(`${BASE_URL}/health`);
    
    check(res, {
      'Has Content-Type header': (r) => r.headers['Content-Type'] !== undefined,
      'Has security headers': (r) => {
        // Check for common security headers
        const hasCSP = r.headers['Content-Security-Policy'] !== undefined;
        const hasXFrame = r.headers['X-Frame-Options'] !== undefined;
        const hasXContent = r.headers['X-Content-Type-Options'] !== undefined;
        
        // At least one should be present (Helmet adds these)
        return hasCSP || hasXFrame || hasXContent;
      },
    }) || contractViolations.add(1);
  });
  
  // Test 6: Response Time Contract
  group('Response Time Contract', function() {
    const res = http.get(`${BASE_URL}/health`);
    
    check(res, {
      'Health check responds < 100ms': (r) => r.timings.duration < 100,
    }) || contractViolations.add(1);
  });
}

export function handleSummary(data) {
  const violations = data.metrics.contract_violations?.values.count || 0;
  const validationRate = data.metrics.schema_validation_success?.values.rate || 0;
  
  let summary = '\n' + '='.repeat(70) + '\n';
  summary += '          API CONTRACT TEST SUMMARY\n';
  summary += '='.repeat(70) + '\n\n';
  
  summary += `Contract Violations: ${violations}\n`;
  summary += `Schema Validation Success: ${(validationRate * 100).toFixed(2)}%\n\n`;
  
  if (violations === 0 && validationRate > 0.95) {
    summary += '✓ ALL API CONTRACTS VALID!\n';
    summary += 'API responses match expected schemas.\n';
  } else {
    summary += `⚠ ${violations} CONTRACT VIOLATIONS FOUND\n`;
    summary += 'Review and fix API response schemas.\n';
  }
  
  summary += '\n' + '='.repeat(70) + '\n';
  
  return {
    'api-contract-results.json': JSON.stringify(data, null, 2),
    stdout: summary,
  };
}

