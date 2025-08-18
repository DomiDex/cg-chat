import type { MiddlewareHandler } from 'hono';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(400, message, details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(409, message, details);
    this.name = 'ConflictError';
  }
}

export class TooManyRequestsError extends ApiError {
  constructor(message = 'Too many requests', retryAfter?: number) {
    super(429, message, { retryAfter });
    this.name = 'TooManyRequestsError';
  }
}

export const errorMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    try {
      await next();
      return; // Explicitly return for normal flow
    } catch (error) {
      // Log error details
      const requestId = c.get('requestId') || 'unknown';
      const method = c.req.method;
      const path = c.req.path;
      
      console.error(`[${requestId}] Error in ${method} ${path}:`, error);

      // Handle ApiError instances
      if (error instanceof ApiError) {
        return c.json(
          {
            error: error.name,
            message: error.message,
            details: error.details,
            requestId,
          },
          error.statusCode as any
        );
      }

      // Handle Convex errors
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as Error).message;
        
        if (message?.includes('Invalid authentication')) {
          return c.json(
            {
              error: 'Unauthorized',
              message: 'Invalid or expired token',
              requestId,
            },
            401
          );
        }

        if (message?.includes('not found')) {
          return c.json(
            {
              error: 'Not Found',
              message,
              requestId,
            },
            404
          );
        }
      }

      // Handle validation errors from zod
      if (error && typeof error === 'object' && 'issues' in error) {
        return c.json(
          {
            error: 'Validation Error',
            message: 'Invalid request data',
            details: (error as { issues: unknown }).issues,
            requestId,
          },
          400
        );
      }

      // Default error response
      const isDev = process.env.NODE_ENV !== 'production';
      return c.json(
        {
          error: 'Internal Server Error',
          message: isDev ? (error as Error).message : 'An unexpected error occurred',
          ...(isDev && { stack: (error as Error).stack }),
          requestId,
        },
        500
      );
    }
  };
};