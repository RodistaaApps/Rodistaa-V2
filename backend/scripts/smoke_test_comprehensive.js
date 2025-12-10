/**
 * Comprehensive Smoke Test: All Endpoints
 * 
 * Tests all major endpoints implemented in Task A
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request({
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, raw: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testEndpoint(name, testFn) {
  try {
    console.log(`\n[TEST] ${name}`);
    await testFn();
    console.log(`[✓] ${name} - PASSED`);
    return true;
  } catch (error) {
    console.error(`[✗] ${name} - FAILED: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('==========================================');
  console.log('Rodistaa Backend - Comprehensive Smoke Test');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('==========================================');

  const results = [];

  // Health Check
  results.push(await testEndpoint('Health Check', async () => {
    const res = await request(`${BASE_URL}/health`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  }));

  // Auth: OTP Request
  results.push(await testEndpoint('POST /auth/otp', async () => {
    const res = await request(`${BASE_URL}/auth/otp`, {
      method: 'POST',
      body: { mobile: '+919876543210' },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  }));

  // Auth: Login
  let shipperToken = '';
  results.push(await testEndpoint('POST /auth/login', async () => {
    const res = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: { mobile: '+919876543210', otp: '123456' },
    });
    if (res.status !== 200 || !res.data?.token) {
      throw new Error('Login failed or no token returned');
    }
    shipperToken = res.data.token;
  }));

  // Users: Get Current User
  results.push(await testEndpoint('GET /users/me', async () => {
    const res = await request(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${shipperToken}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  }));

  // Bookings: Create
  let bookingId = '';
  results.push(await testEndpoint('POST /bookings', async () => {
    const res = await request(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${shipperToken}` },
      body: {
        pickup: { city: 'Mumbai', coordinates: { latitude: 19.0760, longitude: 72.8777 } },
        drop: { city: 'Delhi', coordinates: { latitude: 28.6139, longitude: 77.2090 } },
        goods: { type: 'Cargo' },
        tonnage: 10,
        priceRange: { min: 50000, max: 75000 },
      },
    });
    if (res.status !== 201 || !res.data?.id) {
      throw new Error('Booking creation failed');
    }
    bookingId = res.data.id;
  }));

  // Bookings: Get
  results.push(await testEndpoint('GET /bookings/:id', async () => {
    if (!bookingId) throw new Error('No booking ID available');
    const res = await request(`${BASE_URL}/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${shipperToken}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  }));

  // KYC: Get Status
  results.push(await testEndpoint('GET /kyc/status', async () => {
    const res = await request(`${BASE_URL}/kyc/status`, {
      headers: { Authorization: `Bearer ${shipperToken}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  }));

  // Admin: Dashboard (may fail if not admin - that's OK)
  results.push(await testEndpoint('GET /admin/dashboard', async () => {
    const res = await request(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${shipperToken}` },
    });
    // Accept 200 or 403
    if (res.status !== 200 && res.status !== 403) {
      throw new Error(`Unexpected status: ${res.status}`);
    }
  }));

  // ACS: Evaluate
  results.push(await testEndpoint('POST /acs/evaluate', async () => {
    const res = await request(`${BASE_URL}/acs/evaluate`, {
      method: 'POST',
      body: {
        event: { type: 'booking.create', payload: {} },
        context: { userId: 'test-user' },
      },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  }));

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('\n==========================================');
  console.log('Test Summary');
  console.log('==========================================');
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Failed: ${total - passed}/${total}`);
  console.log('==========================================');

  if (passed === total) {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. See above for details.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
}

module.exports = { main };

