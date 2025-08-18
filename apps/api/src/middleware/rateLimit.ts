import type { MiddlewareHandler } from 'hono';
import Redis from 'ioredis';
import type { Context } from 'hono';
import { TooManyRequestsError } from './error.js';

// Initialize Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  keyGenerator?: (c: Context) => string;
  skip?: (c: Context) => boolean;
  handler?: (c: Context) => Response | Promise<Response>;
}

export const rateLimitMiddleware = (options: RateLimitOptions = {}): MiddlewareHandler => {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 60, // 60 requests per window
    keyGenerator = (c) => {
      // Use IP address or user ID as key
      const userId = c.get('userId');
      if (userId) return `rate:user:${userId}`;
      
      const ip = c.req.header('x-forwarded-for') || 
                 c.req.header('x-real-ip') || 
                 (c.req.raw as any).connection?.remoteAddress ||
                 'unknown';
      return `rate:ip:${ip}`;
    },
    skip = () => false,
    handler = () => {
      throw new TooManyRequestsError(
        'Too many requests, please try again later',
        Math.ceil(windowMs / 1000)
      );
    },
  } = options;

  return async (c, next) => {
    // Skip rate limiting if specified
    if (skip(c)) {
      return next();
    }

    const key = keyGenerator(c);
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Use Redis sorted set for sliding window rate limiting
      const pipeline = redis.pipeline();
      
      // Remove old entries outside the window
      pipeline.zremrangebyscore(key, '-inf', windowStart);
      
      // Count requests in current window
      pipeline.zcard(key);
      
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      
      // Set expiry
      pipeline.expire(key, Math.ceil(windowMs / 1000));
      
      const results = await pipeline.exec();
      
      if (!results) {
        // Redis error, allow request but log warning
        console.warn('Rate limiting failed: Redis pipeline returned no results');
        return next();
      }

      const count = (results[1]?.[1] as number) || 0;

      // Set rate limit headers
      c.header('X-RateLimit-Limit', max.toString());
      c.header('X-RateLimit-Remaining', Math.max(0, max - count - 1).toString());
      c.header('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

      // Check if limit exceeded
      if (count >= max) {
        c.header('Retry-After', Math.ceil(windowMs / 1000).toString());
        return handler(c);
      }

      return next();
    } catch (error) {
      // Log error but don't block request
      console.error('Rate limiting error:', error);
      return next();
    }
  };
};

// Specific rate limiters for different endpoints
export const authRateLimiter = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  keyGenerator: (c) => {
    const email = c.req.param('email') || c.req.query('email') || 'unknown';
    return `rate:auth:${email}`;
  },
});

export const webhookRateLimiter = rateLimitMiddleware({
  windowMs: 1000, // 1 second
  max: 10, // 10 requests per second
  keyGenerator: (c) => {
    const source = c.req.header('x-webhook-source') || 'unknown';
    return `rate:webhook:${source}`;
  },
});

export const messageRateLimiter = rateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  keyGenerator: (c) => {
    const userId = c.get('userId');
    const conversationId = c.req.param('conversationId');
    return `rate:message:${userId}:${conversationId}`;
  },
});