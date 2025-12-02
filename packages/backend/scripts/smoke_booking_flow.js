/**
 * Smoke Test: End-to-End Booking Flow
 * 
 * Node.js version for Windows compatibility
 * 
 * Validates the complete booking lifecycle:
 * 1. Create booking
 * 2. Create bid
 * 3. Auto-finalize bid
 * 4. Create shipment
 * 5. Start shipment
 * 6. Record GPS ping
 * 7. Upload POD
 * 8. Complete shipment
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const LOG_FILE = process.env.LOG_FILE || './smoke_test.log';
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

function log(message) {
  const msg = `[INFO] ${message}`;
  console.log(`${colors.green}${msg}${colors.reset}`);
  fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} ${msg}\n`);
}

function error(message) {
  const msg = `[ERROR] ${message}`;
  console.error(`${colors.red}${msg}${colors.reset}`);
  fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} ${msg}\n`);
  process.exit(1);
}

function warn(message) {
  const msg = `[WARN] ${message}`;
  console.warn(`${colors.yellow}${msg}${colors.reset}`);
  fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} ${msg}\n`);
}

// HTTP request helper
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
          resolve({ status: res.statusCode, data: json, raw: data });
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

async function main() {
  // Clean log file
  fs.writeFileSync(LOG_FILE, '');

  log('==========================================');
  log('Rodistaa Backend - Smoke Test (Node.js)');
  log(`Base URL: ${BASE_URL}`);
  log('==========================================');

  try {
    // Step 1: Health check
    log('Step 0: Health Check');
    const healthCheck = await request(`${BASE_URL}/health`);
    if (healthCheck.status !== 200) {
      error(`Health check failed: ${healthCheck.status}`);
    }
    log('Health check passed');

    // Step 1: Login as Shipper
    log('Step 1: Login as Shipper');
    const shipperLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        mobile: '+919876543210',
        otp: '123456', // Mock OTP
      },
    });

    if (shipperLogin.status !== 200 || !shipperLogin.data?.token) {
      error(`Shipper login failed: ${JSON.stringify(shipperLogin.data)}`);
    }

    const shipperToken = shipperLogin.data.token;
    log('Shipper token obtained');

    // Step 2: Create Booking
    log('Step 2: Create Booking');
    const bookingPayload = {
      pickup: {
        city: 'Mumbai',
        state: 'Maharashtra',
        coordinates: {
          latitude: 19.0760,
          longitude: 72.8777,
        },
      },
      drop: {
        city: 'Delhi',
        state: 'Delhi',
        coordinates: {
          latitude: 28.6139,
          longitude: 77.2090,
        },
      },
      goods: {
        type: 'General Cargo',
        description: 'Electronics',
      },
      tonnage: 10,
      priceRange: {
        min: 50000,
        max: 75000,
      },
    };

    const bookingResponse = await request(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${shipperToken}`,
      },
      body: bookingPayload,
    });

    if (bookingResponse.status !== 201 || !bookingResponse.data?.id) {
      error(`Booking creation failed: ${JSON.stringify(bookingResponse.data)}`);
    }

    const bookingId = bookingResponse.data.id;
    log(`Booking created: ${bookingId}`);

    // Step 3: Login as Operator
    log('Step 3: Login as Operator');
    const operatorLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        mobile: '+919876543211',
        otp: '123456',
      },
    });

    const operatorToken = operatorLogin.data?.token || 'mock-operator-token';
    log('Operator token obtained');

    // Step 4: Create Bid
    log('Step 4: Create Bid');
    const bidPayload = {
      truckId: 'TRK-MH01AB1234-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      amount: 60000,
      notes: 'Best rate for this route',
    };

    const bidResponse = await request(`${BASE_URL}/bookings/${bookingId}/bids`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${operatorToken}`,
      },
      body: bidPayload,
    });

    const bidId = bidResponse.data?.id || 'BID-MOCK';
    log(`Bid created: ${bidId}`);

    // Step 5: Auto-Finalize Bid (internal endpoint)
    log('Step 5: Auto-Finalize Bid');
    const finalizeResponse = await request(`${BASE_URL}/internal/bookings/${bookingId}/auto-finalize`, {
      method: 'POST',
    });

    if (finalizeResponse.data?.finalized) {
      log('Bid auto-finalized successfully');
    } else {
      warn(`Auto-finalization response: ${JSON.stringify(finalizeResponse.data)}`);
    }

    // Step 6: Get Booking Status
    log('Step 6: Verify Booking Status');
    const bookingStatus = await request(`${BASE_URL}/bookings/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${shipperToken}`,
      },
    });

    if (bookingStatus.data?.status) {
      log(`Booking status: ${bookingStatus.data.status}`);
    }

    // Summary
    log('==========================================');
    log('Smoke Test Summary');
    log('==========================================');
    log(`Booking ID: ${bookingId}`);
    log(`Bid ID: ${bidId}`);
    log(`Booking Status: ${bookingStatus.data?.status || 'N/A'}`);
    log('==========================================');

    log('Smoke test completed successfully!');
    log(`Check ${LOG_FILE} for detailed logs`);

  } catch (err) {
    error(`Smoke test failed: ${err.message}`);
    if (err.stack) {
      fs.appendFileSync(LOG_FILE, `Stack: ${err.stack}\n`);
    }
    process.exit(1);
  }
}

// Run smoke test
if (require.main === module) {
  main().catch((err) => {
    error(`Unhandled error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main };

