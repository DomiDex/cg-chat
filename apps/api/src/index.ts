import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { compress } from 'hono/compress';
import { secureHeaders } from 'hono/secure-headers';
import { timing } from 'hono/timing';
import { requestId } from 'hono/request-id';
import { ConvexHttpClient } from 'convex/browser';
import dotenv from 'dotenv';

// Import routes
import { authRoutes } from './routes/auth-simple.js';
import { healthRoutes } from './routes/health.js';
import { usersRoutes } from './routes/users.js';

// Import middleware
import { errorMiddleware } from './middleware/error.js';
import { rateLimitMiddleware } from './middleware/rateLimit.js';
import { rlsMiddleware } from './middleware/rls.js';

// Load environment variables
dotenv.config();

// Initialize Hono app
const app = new Hono();

// Initialize Convex client
const convexUrl = process.env.CONVEX_URL || '';
export const convexClient = new ConvexHttpClient(convexUrl);

// Global middleware
app.use('*', requestId());
app.use('*', timing());
app.use('*', logger());
app.use('*', compress());
app.use('*', secureHeaders());

// CORS configuration
app.use(
  '*',
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposeHeaders: ['X-Request-Id', 'X-Response-Time'],
    maxAge: 86400,
  })
);

// Apply rate limiting to all routes except health
app.use('/api/*', rateLimitMiddleware());

// RLS middleware - sets database context based on authenticated user
// This should come after auth but before routes that use the database
app.use('*', rlsMiddleware());

// Error handling middleware (must be before routes)
app.use('*', errorMiddleware());

// Health check routes (no auth required)
app.route('/health', healthRoutes);

// API routes
const api = new Hono();

// Public routes
api.route('/auth', authRoutes);

// Protected routes (require authentication)
api.route('/users', usersRoutes);

// Mount API routes
app.route('/api/v1', api);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: 'Not Found',
      message: 'The requested endpoint does not exist',
      path: c.req.path,
    },
    404
  );
});

// Global error handler
app.onError((err, c) => {
  console.error(`Error in ${c.req.method} ${c.req.path}:`, err);

  // Check if response was already sent
  if (c.finalized) {
    return c.res;
  }

  // Handle different error types
  if (err.name === 'ValidationError') {
    return c.json(
      {
        error: 'Validation Error',
        message: err.message,
        details: err.cause,
      },
      400
    );
  }

  if (err.name === 'UnauthorizedError') {
    return c.json(
      {
        error: 'Unauthorized',
        message: err.message || 'Authentication required',
      },
      401
    );
  }

  if (err.name === 'ForbiddenError') {
    return c.json(
      {
        error: 'Forbidden',
        message: err.message || 'Insufficient permissions',
      },
      403
    );
  }

  // Default error response
  return c.json(
    {
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
    500
  );
});

// Start server
const port = parseInt(process.env.PORT || '3001');

console.info(`🚀 API Server starting...`);
console.info(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
console.info(`🔗 Convex URL: ${convexUrl}`);

serve({
  fetch: app.fetch,
  port,
  hostname: '127.0.0.1', // Force IPv4 localhost
}, (info) => {
  console.info(`✅ API Server running at http://localhost:${info.port}`);
  console.info(`📡 Direct access: http://127.0.0.1:${info.port}`);
  console.info(`🔍 Test health: http://localhost:${info.port}/health`);
});
