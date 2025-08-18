import { PrismaClient } from '@prisma/client';
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
export declare function createRLSClient(prisma: PrismaClient, context: RLSContext): Promise<PrismaClient>;
/**
 * Execute a query with RLS context
 * Wraps the query in a transaction with user context
 */
export declare function withRLS<T>(prisma: PrismaClient, context: RLSContext, callback: (tx: PrismaClient) => Promise<T>): Promise<T>;
/**
 * Create a Neon pool connection with RLS context
 * For use with serverless/edge functions
 */
export declare class RLSPool {
    private pool;
    constructor(connectionString: string);
    /**
     * Execute a query with RLS context
     */
    query<T = any>(text: string, values: any[], context: RLSContext): Promise<T>;
    /**
     * Execute a transaction with RLS context
     */
    transaction<T>(context: RLSContext, callback: (client: any) => Promise<T>): Promise<T>;
    /**
     * Close the pool
     */
    close(): Promise<void>;
}
/**
 * Prisma middleware to automatically set RLS context
 * Add this to your Prisma client configuration
 */
export declare function rlsMiddleware(defaultContext?: RLSContext): (params: any, next: any) => Promise<any>;
/**
 * Verify RLS is enabled on a table
 */
export declare function verifyRLSEnabled(prisma: PrismaClient, tableName: string): Promise<boolean>;
/**
 * List all RLS policies for a table
 */
export declare function listRLSPolicies(prisma: PrismaClient, tableName: string): Promise<any[]>;
/**
 * Bypass RLS for administrative operations
 * Use with caution - only for system operations
 */
export declare function bypassRLS<T>(prisma: PrismaClient, callback: (tx: PrismaClient) => Promise<T>): Promise<T>;
/**
 * Test RLS policies for a specific user
 */
export declare function testRLSAccess(prisma: PrismaClient, context: RLSContext, tableName: string, operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'): Promise<boolean>;
declare const _default: {
    createRLSClient: typeof createRLSClient;
    withRLS: typeof withRLS;
    RLSPool: typeof RLSPool;
    rlsMiddleware: typeof rlsMiddleware;
    verifyRLSEnabled: typeof verifyRLSEnabled;
    listRLSPolicies: typeof listRLSPolicies;
    bypassRLS: typeof bypassRLS;
    testRLSAccess: typeof testRLSAccess;
};
export default _default;
//# sourceMappingURL=rls.d.ts.map