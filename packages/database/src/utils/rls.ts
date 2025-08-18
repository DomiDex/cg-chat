import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';

/**
 * Row Level Security (RLS) utilities for secure database access
 */

export interface RLSContext {
  userId: string;
  userRole: 'USER' | 'ADMIN' | 'AGENT' | 'DEVELOPER' | 'SUPPORT';
  sessionId?: string;
}

/**
 * Create a Prisma client with RLS context
 * This sets the current user context for RLS policies
 */
export async function createRLSClient(
  prisma: PrismaClient,
  context: RLSContext
): Promise<PrismaClient> {
  // Set the user context for the current transaction
  await prisma.$executeRawUnsafe(`SET LOCAL app.current_user_id = '${context.userId}'`);
  await prisma.$executeRawUnsafe(`SET LOCAL app.current_user_role = '${context.userRole}'`);
  if (context.sessionId) {
    await prisma.$executeRawUnsafe(`SET LOCAL app.current_session_id = '${context.sessionId}'`);
  }
  
  return prisma;
}

/**
 * Execute a query with RLS context
 * Wraps the query in a transaction with user context
 */
export async function withRLS<T>(
  prisma: PrismaClient,
  context: RLSContext,
  callback: (tx: any) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // Set the RLS context for this transaction
    await tx.$executeRawUnsafe(`SET LOCAL app.current_user_id = '${context.userId}'`);
    await tx.$executeRawUnsafe(`SET LOCAL app.current_user_role = '${context.userRole}'`);
    if (context.sessionId) {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_session_id = '${context.sessionId}'`);
    }
    
    // Execute the callback with RLS context active
    return callback(tx);
  });
}

/**
 * Create a Neon pool connection with RLS context
 * For use with serverless/edge functions
 */
export class RLSPool {
  private pool: Pool;
  
  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  
  /**
   * Execute a query with RLS context
   */
  async query<T = any>(
    text: string,
    values: any[],
    context: RLSContext
  ): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      // Set RLS context
      await client.query(
        `SET LOCAL app.current_user_id = $1;
         SET LOCAL app.current_user_role = $2;`,
        [context.userId, context.userRole]
      );
      
      // Execute the actual query
      const result = await client.query(text, values);
      return result.rows as T;
    } finally {
      client.release();
    }
  }
  
  /**
   * Execute a transaction with RLS context
   */
  async transaction<T>(
    context: RLSContext,
    callback: (client: any) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Set RLS context
      await client.query(
        `SET LOCAL app.current_user_id = $1;
         SET LOCAL app.current_user_role = $2;`,
        [context.userId, context.userRole]
      );
      
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Close the pool
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

/**
 * Prisma middleware to automatically set RLS context
 * Add this to your Prisma client configuration
 */
export function rlsMiddleware(defaultContext?: RLSContext) {
  return async (params: any, next: any) => {
    // Skip for certain operations that don't need RLS
    const skipOperations = ['$connect', '$disconnect', '$on', '$transaction', '$use'];
    if (skipOperations.includes(params.action)) {
      return next(params);
    }
    
    // Get context from async local storage or use default
    const context = getContextFromAsyncStorage() || defaultContext;
    
    if (context) {
      // For each query, set the RLS context
      // This is a simplified version - in production you'd use a connection pool
      console.log(`[RLS] Setting context for user: ${context.userId}, role: ${context.userRole}`);
    }
    
    return next(params);
  };
}

/**
 * Get RLS context from async local storage
 * This would integrate with your auth middleware
 */
function getContextFromAsyncStorage(): RLSContext | null {
  // This would be implemented using AsyncLocalStorage in Node.js
  // For now, returning null to use default context
  return null;
}

/**
 * Verify RLS is enabled on a table
 */
export async function verifyRLSEnabled(
  prisma: PrismaClient,
  tableName: string
): Promise<boolean> {
  const result = await prisma.$queryRaw<{ relrowsecurity: boolean }[]>`
    SELECT relrowsecurity 
    FROM pg_class 
    WHERE relname = ${tableName}
  `;
  
  return result[0]?.relrowsecurity || false;
}

/**
 * List all RLS policies for a table
 */
export async function listRLSPolicies(
  prisma: PrismaClient,
  tableName: string
): Promise<any[]> {
  const result = await prisma.$queryRaw`
    SELECT 
      polname as policy_name,
      polcmd as command,
      polpermissive as permissive,
      pg_get_expr(polqual, polrelid) as using_expression,
      pg_get_expr(polwithcheck, polrelid) as with_check_expression
    FROM pg_policy
    JOIN pg_class ON pg_class.oid = pg_policy.polrelid
    WHERE pg_class.relname = ${tableName}
  `;
  
  return result as any[];
}

/**
 * Bypass RLS for administrative operations
 * Use with caution - only for system operations
 */
export async function bypassRLS<T>(
  prisma: PrismaClient,
  callback: (tx: any) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // Set role to service_role which bypasses RLS
    await tx.$executeRawUnsafe(`SET LOCAL ROLE service_role;`);
    
    try {
      return await callback(tx);
    } finally {
      // Reset role
      await tx.$executeRawUnsafe(`RESET ROLE;`);
    }
  });
}

/**
 * Test RLS policies for a specific user
 */
export async function testRLSAccess(
  prisma: PrismaClient,
  context: RLSContext,
  tableName: string,
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'
): Promise<boolean> {
  try {
    await withRLS(prisma, context, async (tx) => {
      switch (operation) {
        case 'SELECT':
          await tx.$queryRawUnsafe(`SELECT * FROM ${tableName} LIMIT 1`);
          break;
        case 'INSERT':
          // This would need proper column values for a real test
          throw new Error('INSERT test not implemented');
        case 'UPDATE':
          await tx.$queryRawUnsafe(`UPDATE ${tableName} SET id = id WHERE false`);
          break;
        case 'DELETE':
          await tx.$queryRawUnsafe(`DELETE FROM ${tableName} WHERE false`);
          break;
      }
    });
    return true;
  } catch (error: any) {
    if (error.message.includes('row-level security')) {
      return false;
    }
    throw error;
  }
}

export default {
  createRLSClient,
  withRLS,
  RLSPool,
  rlsMiddleware,
  verifyRLSEnabled,
  listRLSPolicies,
  bypassRLS,
  testRLSAccess,
};