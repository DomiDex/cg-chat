/**
 * Convex-specific error handling utilities
 */

export class ConvexError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ConvexError';
  }
}

export class ConvexAuthError extends ConvexError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'ConvexAuthError';
  }
}

export class ConvexPermissionError extends ConvexError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'PERMISSION_ERROR', 403);
    this.name = 'ConvexPermissionError';
  }
}

export class ConvexNotFoundError extends ConvexError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'ConvexNotFoundError';
  }
}

export class ConvexValidationError extends ConvexError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ConvexValidationError';
  }
}

export class ConvexRateLimitError extends ConvexError {
  constructor(retryAfter?: number) {
    super('Rate limit exceeded', 'RATE_LIMIT', 429, { retryAfter });
    this.name = 'ConvexRateLimitError';
  }
}

export class ConvexNetworkError extends ConvexError {
  constructor(message: string = 'Network error') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'ConvexNetworkError';
  }
}

/**
 * Check if an error is a Convex error
 */
export function isConvexError(error: unknown): error is ConvexError {
  return error instanceof ConvexError;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof ConvexNetworkError) return true;
  if (error instanceof ConvexRateLimitError) return true;
  
  if (error instanceof ConvexError) {
    return error.statusCode ? error.statusCode >= 500 : false;
  }
  
  return false;
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unknown error occurred';
}

/**
 * Format error for display to user
 */
export function formatErrorForUser(error: unknown): string {
  if (error instanceof ConvexAuthError) {
    return 'Please log in to continue';
  }
  
  if (error instanceof ConvexPermissionError) {
    return 'You do not have permission to perform this action';
  }
  
  if (error instanceof ConvexNotFoundError) {
    return error.message;
  }
  
  if (error instanceof ConvexValidationError) {
    return error.message;
  }
  
  if (error instanceof ConvexRateLimitError) {
    return 'Too many requests. Please try again later';
  }
  
  if (error instanceof ConvexNetworkError) {
    return 'Connection error. Please check your internet connection';
  }
  
  return 'Something went wrong. Please try again';
}

/**
 * Log error with appropriate level
 */
export function logError(error: unknown, context?: string): void {
  const message = getErrorMessage(error);
  const level = error instanceof ConvexError ? error.statusCode || 500 : 500;
  
  if (level >= 500) {
    console.error(`[${context || 'Error'}]`, message, error);
  } else if (level >= 400) {
    console.warn(`[${context || 'Warning'}]`, message, error);
  } else {
    console.log(`[${context || 'Info'}]`, message, error);
  }
}