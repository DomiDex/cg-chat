import type { MiddlewareHandler } from 'hono';
import { z } from 'zod';
import { ValidationError } from './error.js';

export const validationMiddleware = <T extends z.ZodSchema>(
  schema: T,
  target: 'json' | 'query' | 'param' | 'header' = 'json'
): MiddlewareHandler => {
  return async (c, next) => {
    try {
      let data;

      switch (target) {
        case 'json':
          data = await c.req.json().catch(() => ({}));
          break;
        case 'query':
          data = c.req.query();
          break;
        case 'param':
          data = c.req.param();
          break;
        case 'header':
          data = Object.fromEntries(
            Array.from(c.req.raw.headers.entries())
          );
          break;
        default:
          data = {};
      }

      const validated = schema.parse(data);
      c.set('validated', validated);
      
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          'Validation failed',
          error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }))
        );
      }
      throw error;
    }
  };
};

// Common validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const emailSchema = z.string().email().toLowerCase();

export const phoneSchema = z.string().regex(
  /^\+?[1-9]\d{1,14}$/,
  'Invalid phone number format'
);

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Request validation helpers
export const validateBody = <T extends z.ZodSchema>(schema: T) => 
  validationMiddleware(schema, 'json');

export const validateQuery = <T extends z.ZodSchema>(schema: T) => 
  validationMiddleware(schema, 'query');

export const validateParams = <T extends z.ZodSchema>(schema: T) => 
  validationMiddleware(schema, 'param');

export const validateHeaders = <T extends z.ZodSchema>(schema: T) => 
  validationMiddleware(schema, 'header');

// Content filter for competitor mentions
const COMPETITOR_KEYWORDS = [
  'geek squad',
  'geeksquad',
  'best buy',
  'bestbuy',
  'microcenter',
  'micro center',
  'fry\'s',
  'frys electronics',
  'circuit city',
  'radio shack',
  'radioshack',
];

export const contentFilterMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    // Check request body for competitor mentions
    try {
      const body = await c.req.json().catch(() => null);
      
      if (body && typeof body === 'object') {
        const bodyString = JSON.stringify(body).toLowerCase();
        
        for (const keyword of COMPETITOR_KEYWORDS) {
          if (bodyString.includes(keyword)) {
            throw new ValidationError(
              'Content contains restricted terms',
              { 
                field: 'content',
                message: 'Please avoid mentioning competitor services',
              }
            );
          }
        }
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      // Ignore other errors (e.g., no body)
    }

    // Continue to next middleware
    await next();

    // Check response for competitor mentions (if JSON)
    if (c.res.headers.get('content-type')?.includes('application/json')) {
      try {
        const responseBody = await c.res.json();
        const responseString = JSON.stringify(responseBody).toLowerCase();
        
        let filtered = false;
        for (const keyword of COMPETITOR_KEYWORDS) {
          if (responseString.includes(keyword)) {
            filtered = true;
            // Recursively filter the response
            const filteredBody = filterCompetitorMentions(responseBody);
            c.res = c.json(filteredBody as any) as any;
            break;
          }
        }

        if (filtered) {
          console.warn('Competitor mentions filtered from response');
        }
      } catch {
        // Ignore errors in response filtering
      }
    }
  };
};

function filterCompetitorMentions(obj: unknown): unknown {
  if (typeof obj === 'string') {
    let filtered = obj;
    for (const keyword of COMPETITOR_KEYWORDS) {
      const regex = new RegExp(keyword, 'gi');
      filtered = filtered.replace(regex, '[filtered]');
    }
    return filtered;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => filterCompetitorMentions(item));
  }

  if (obj && typeof obj === 'object') {
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      filtered[key] = filterCompetitorMentions(value);
    }
    return filtered;
  }

  return obj;
}