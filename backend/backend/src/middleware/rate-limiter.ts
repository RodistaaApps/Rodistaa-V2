/**
 * Rate Limiter Middleware
 * Throttles API requests based on API keys and user limits
 */

import { Request, Response, NextFunction } from 'express';
import { query } from '../db';
import { logger } from '../utils/logger';

const log = logger.child({ module: 'rate-limiter' });

// In-memory rate limit cache (use Redis in production)
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

/**
 * Rate limiter middleware factory
 */
export function rateLimiter(config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = getIdentifier(req);
      const now = Date.now();

      // Get current count
      let rateLimit = rateLimitCache.get(identifier);

      if (!rateLimit || rateLimit.resetAt < now) {
        // Reset window
        rateLimit = {
          count: 0,
          resetAt: now + config.windowMs,
        };
      }

      rateLimit.count++;
      rateLimitCache.set(identifier, rateLimit);

      // Check limit
      if (rateLimit.count > config.maxRequests) {
        const retryAfter = Math.ceil((rateLimit.resetAt - now) / 1000);
        
        res.setHeader('Retry-After', retryAfter);
        res.setHeader('X-RateLimit-Limit', config.maxRequests);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', rateLimit.resetAt);

        log.warn({ identifier, count: rateLimit.count }, 'Rate limit exceeded');

        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Retry after ${retryAfter} seconds.`,
          retryAfter,
        });
      }

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', config.maxRequests - rateLimit.count);
      res.setHeader('X-RateLimit-Reset', rateLimit.resetAt);

      next();
    } catch (error) {
      log.error({ error }, 'Rate limiter error');
      next(); // Don't block on rate limiter errors
    }
  };
}

/**
 * Get identifier for rate limiting
 */
function getIdentifier(req: Request): string {
  // Check for API key
  const apiKey = req.headers['x-api-key'];
  if (apiKey) {
    return `api_key:${apiKey}`;
  }

  // Check for user ID (from JWT)
  const userId = (req as any).user?.id;
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return `ip:${ip}`;
}

/**
 * API key rate limiter (checks DB limits)
 */
export async function apiKeyRateLimiter(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return next();
    }

    // Get API key config from DB
    const result = await query(
      `SELECT * FROM api_keys WHERE key_hash = $1 AND is_active = TRUE`,
      [await hashApiKey(apiKey)]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const keyConfig = result.rows[0];

    // Check if expired
    if (keyConfig.expires_at && new Date(keyConfig.expires_at) < new Date()) {
      return res.status(401).json({ error: 'API key expired' });
    }

    // Apply rate limit from DB config
    const identifier = `api_key:${keyConfig.key_id}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute

    let rateLimit = rateLimitCache.get(identifier);

    if (!rateLimit || rateLimit.resetAt < now) {
      rateLimit = {
        count: 0,
        resetAt: now + windowMs,
      };
    }

    rateLimit.count++;
    rateLimitCache.set(identifier, rateLimit);

    if (rateLimit.count > keyConfig.rate_limit_per_minute) {
      const retryAfter = Math.ceil((rateLimit.resetAt - now) / 1000);
      
      res.setHeader('Retry-After', retryAfter);
      
      return res.status(429).json({
        error: 'Rate limit exceeded for API key',
        retryAfter,
      });
    }

    // Update last used
    await query(
      `UPDATE api_keys 
       SET last_used_at = NOW(), total_requests = total_requests + 1
       WHERE id = $1`,
      [keyConfig.id]
    );

    // Log usage
    await query(
      `INSERT INTO api_key_usage
       (id, api_key_id, endpoint, method, status_code, ip_address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [uuid(), keyConfig.id, req.path, req.method, 200, req.ip || 'unknown']
    );

    next();
  } catch (error) {
    log.error({ error }, 'API key rate limiter error');
    next();
  }
}

async function hashApiKey(key: string): Promise<string> {
  return require('bcryptjs').hash(key, 10);
}

