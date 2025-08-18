import type { MiddlewareHandler } from 'hono';
import { prismaRLS, type RLSContext } from '@cg/database';
import { AsyncLocalStorage } from 'async_hooks';

// Create async local storage for RLS context
const asyncLocalStorage = new AsyncLocalStorage<RLSContext>();

/**
 * RLS Middleware for Hono
 * Sets the Row Level Security context based on authenticated user
 * Must be used AFTER auth middleware
 */
export const rlsMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    // Get auth info from context (set by auth middleware)
    const auth = c.get('auth');
    
    if (auth && auth.userId) {
      // Map auth role to database role
      const dbRole = mapAuthRoleToDbRole(auth.role);
      
      // Create RLS context
      const context: RLSContext = {
        userId: auth.userId,
        userRole: dbRole,
        sessionId: auth.sessionId,
      };
      
      // Store context in async local storage for database queries
      return asyncLocalStorage.run(context, async () => {
        // Set context in Hono for easy access
        c.set('rlsContext', context);
        
        // Continue with request
        return next();
      });
    }
    
    // No auth, continue without RLS context
    return next();
  };
};

/**
 * Execute database operations with RLS context
 * Use this wrapper for database operations in route handlers
 */
export async function withRLSContext<T>(
  c: any,
  callback: () => Promise<T>
): Promise<T> {
  const context = c.get('rlsContext') as RLSContext | undefined;
  
  if (context) {
    return prismaRLS.$withRLS(context, callback);
  }
  
  // No context, execute normally (will use default database permissions)
  return callback();
}

/**
 * Get current RLS context from async storage
 */
export function getRLSContext(): RLSContext | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * Map auth role to database role enum
 */
function mapAuthRoleToDbRole(authRole: 'user' | 'admin' | 'agent'): RLSContext['userRole'] {
  switch (authRole) {
    case 'admin':
      return 'ADMIN';
    case 'agent':
      return 'AGENT';
    case 'user':
    default:
      return 'USER';
  }
}

/**
 * Middleware to enforce admin-only access
 * Must be used AFTER auth and RLS middleware
 */
export const adminOnlyMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const context = c.get('rlsContext') as RLSContext | undefined;
    
    if (!context || context.userRole !== 'ADMIN') {
      return c.json(
        { error: 'Admin access required' },
        403
      );
    }
    
    return next();
  };
};

/**
 * Middleware to enforce support team access
 * Must be used AFTER auth and RLS middleware
 */
export const supportOnlyMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const context = c.get('rlsContext') as RLSContext | undefined;
    
    if (!context || !['ADMIN', 'SUPPORT'].includes(context.userRole)) {
      return c.json(
        { error: 'Support team access required' },
        403
      );
    }
    
    return next();
  };
};

export default rlsMiddleware;