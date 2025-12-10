/**
 * Monitoring & Logging Configuration
 * Prometheus metrics, Pino logger, Sentry error tracking
 */

import pino from 'pino';

// Pino Logger Configuration
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
    },
  } : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Prometheus Metrics (if enabled)
export interface MetricsConfig {
  enabled: boolean;
  port: number;
  path: string;
}

export const metricsConfig: MetricsConfig = {
  enabled: process.env.ENABLE_METRICS === 'true',
  port: parseInt(process.env.METRICS_PORT || '9090'),
  path: '/metrics',
};

// Custom Metrics
export const metrics = {
  httpRequestDuration: {
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
  },
  httpRequestTotal: {
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  },
  bookingCreatedTotal: {
    name: 'bookings_created_total',
    help: 'Total bookings created',
  },
  bidPlacedTotal: {
    name: 'bids_placed_total',
    help: 'Total bids placed',
  },
  shipmentCompletedTotal: {
    name: 'shipments_completed_total',
    help: 'Total shipments completed',
  },
  acsBlockedTotal: {
    name: 'acs_blocks_total',
    help: 'Total ACS blocks triggered',
    labelNames: ['rule_name', 'severity'],
  },
  activeUsers: {
    name: 'active_users_current',
    help: 'Current number of active users',
    labelNames: ['role'],
  },
};

// Sentry Configuration (Error Tracking)
export interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
}

export const sentryConfig: SentryConfig = {
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
};

// Initialize Sentry (if DSN provided)
export function initializeSentry() {
  if (!sentryConfig.dsn) {
    logger.info('Sentry DSN not provided, error tracking disabled');
    return;
  }

  // TODO: Import and initialize Sentry when credentials provided
  // const Sentry = require('@sentry/node');
  // Sentry.init({
  //   dsn: sentryConfig.dsn,
  //   environment: sentryConfig.environment,
  //   tracesSampleRate: sentryConfig.tracesSampleRate,
  // });

  logger.info('Sentry initialized for error tracking');
}

// Request Logging Middleware
export function logRequest(method: string, url: string, statusCode: number, duration: number) {
  logger.info({
    method,
    url,
    statusCode,
    duration: `${duration}ms`,
  }, 'HTTP Request');
}

// Log ACS Action
export function logACSAction(ruleName: string, action: string, entity: any) {
  logger.warn({
    type: 'ACS_ACTION',
    ruleName,
    action,
    entity,
  }, 'ACS Rule Triggered');
}

