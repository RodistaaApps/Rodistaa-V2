#!/usr/bin/env node

/**
 * Comprehensive Health Check Script for Rodistaa Platform
 * Verifies all services are running and accessible
 */

const http = require('http');
const https = require('https');

// Configuration
const TIMEOUT = 10000; // 10 seconds
const RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRIES = 3;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Services to check
const services = [
  {
    name: 'PostgreSQL',
    type: 'tcp',
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432'),
    critical: true,
  },
  {
    name: 'Redis',
    type: 'tcp',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    critical: true,
  },
  {
    name: 'Backend API',
    type: 'http',
    url: process.env.API_URL || 'http://localhost:4000/v1/health',
    critical: true,
  },
  {
    name: 'Admin Portal',
    type: 'http',
    url: process.env.PORTAL_URL || 'http://localhost:3001',
    critical: false,
  },
  {
    name: 'ACS Service',
    type: 'http',
    url: process.env.ACS_URL || 'http://localhost:3002/health',
    critical: false,
  },
  {
    name: 'Mock Service',
    type: 'http',
    url: process.env.MOCKS_URL || 'http://localhost:3003/health',
    critical: false,
  },
];

// Helper: Check TCP connection
function checkTcp(host, port, timeout = TIMEOUT) {
  return new Promise((resolve, reject) => {
    const net = require('net');
    const socket = new net.Socket();

    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error(`Connection timeout after ${timeout}ms`));
    }, timeout);

    socket.connect(port, host, () => {
      clearTimeout(timer);
      socket.destroy();
      resolve({ status: 'ok', message: 'Connection successful' });
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      socket.destroy();
      reject(err);
    });
  });
}

// Helper: Check HTTP endpoint
function checkHttp(url, timeout = TIMEOUT) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, { timeout }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({
            status: 'ok',
            statusCode: res.statusCode,
            message: data ? JSON.parse(data) : 'OK',
          });
        } else {
          reject(
            new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`)
          );
        }
      });
    });

    request.on('error', (err) => {
      reject(err);
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });
  });
}

// Helper: Retry logic
async function retryCheck(checkFn, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      return await checkFn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

// Main health check function
async function healthCheck(service) {
  const startTime = Date.now();

  try {
    let result;

    if (service.type === 'tcp') {
      result = await retryCheck(() =>
        checkTcp(service.host, service.port)
      );
    } else if (service.type === 'http') {
      result = await retryCheck(() => checkHttp(service.url));
    } else {
      throw new Error(`Unknown service type: ${service.type}`);
    }

    const duration = Date.now() - startTime;

    return {
      service: service.name,
      status: 'healthy',
      critical: service.critical,
      duration,
      details: result,
    };
  } catch (err) {
    const duration = Date.now() - startTime;

    return {
      service: service.name,
      status: 'unhealthy',
      critical: service.critical,
      duration,
      error: err.message,
    };
  }
}

// Format output
function formatResult(result) {
  const icon = result.status === 'healthy' ? '✓' : '✗';
  const color =
    result.status === 'healthy' ? colors.green : colors.red;
  const criticalTag = result.critical ? ' [CRITICAL]' : '';

  console.log(
    `${color}${icon}${colors.reset} ${result.service}${criticalTag} - ${result.duration}ms`
  );

  if (result.status === 'unhealthy') {
    console.log(`  ${colors.red}Error: ${result.error}${colors.reset}`);
  } else if (result.details?.message && typeof result.details.message === 'object') {
    console.log(
      `  ${colors.cyan}${JSON.stringify(result.details.message)}${colors.reset}`
    );
  }
}

// Main execution
async function main() {
  console.log(`\n${colors.blue}=== Rodistaa Platform Health Check ===${colors.reset}\n`);
  console.log(`Started at: ${new Date().toISOString()}\n`);

  const results = [];

  // Run all health checks in parallel
  for (const service of services) {
    const result = await healthCheck(service);
    results.push(result);
    formatResult(result);
  }

  // Summary
  console.log(`\n${colors.blue}=== Summary ===${colors.reset}`);

  const healthy = results.filter((r) => r.status === 'healthy').length;
  const unhealthy = results.filter((r) => r.status === 'unhealthy').length;
  const criticalUnhealthy = results.filter(
    (r) => r.status === 'unhealthy' && r.critical
  ).length;

  console.log(
    `${colors.green}Healthy: ${healthy}${colors.reset} | ${colors.red}Unhealthy: ${unhealthy}${colors.reset}`
  );

  if (criticalUnhealthy > 0) {
    console.log(
      `\n${colors.red}⚠️  ${criticalUnhealthy} critical service(s) are down!${colors.reset}`
    );
    process.exit(1);
  }

  if (unhealthy > 0) {
    console.log(
      `\n${colors.yellow}⚠️  ${unhealthy} non-critical service(s) are down${colors.reset}`
    );
  }

  console.log(`\n${colors.green}✓ All critical services are healthy${colors.reset}\n`);
  process.exit(0);
}

// Run
main().catch((err) => {
  console.error(`\n${colors.red}Fatal error: ${err.message}${colors.reset}\n`);
  process.exit(1);
});

