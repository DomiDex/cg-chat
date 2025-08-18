import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';
/**
 * Enhanced Prisma client with RLS support
 * Uses AsyncLocalStorage to maintain user context across async operations
 */
// Create async local storage for RLS context
const asyncLocalStorage = new AsyncLocalStorage();
// Custom Prisma client with RLS extensions
const prismaClientSingleton = () => {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
        errorFormat: 'pretty',
    }).$extends({
        query: {
            // Before every query, set the RLS context if available
            async $allOperations({ operation, model, args, query }) {
                const context = asyncLocalStorage.getStore();
                if (context && model) {
                    // Set RLS context for this query
                    await prisma.$executeRawUnsafe(`
            SET LOCAL app.current_user_id = '${context.userId}';
            SET LOCAL app.current_user_role = '${context.userRole}';
          `);
                }
                return query(args);
            },
        },
        client: {
            /**
             * Execute queries with RLS context
             */
            async $withRLS(context, callback) {
                return asyncLocalStorage.run(context, callback);
            },
            /**
             * Execute queries as a specific user
             */
            async $asUser(userId, userRole, callback) {
                const context = { userId, userRole };
                return asyncLocalStorage.run(context, callback);
            },
            /**
             * Execute queries with admin privileges
             */
            async $asAdmin(adminId, callback) {
                const context = { userId: adminId, userRole: 'ADMIN' };
                return asyncLocalStorage.run(context, callback);
            },
            /**
             * Execute queries bypassing RLS (use with caution)
             */
            async $bypassRLS(callback) {
                return prisma.$transaction(async (tx) => {
                    await tx.$executeRawUnsafe(`SET LOCAL ROLE service_role;`);
                    try {
                        return await callback(tx);
                    }
                    finally {
                        await tx.$executeRawUnsafe(`RESET ROLE;`);
                    }
                });
            },
            /**
             * Check if current context can access a record
             */
            async $canAccess(model, operation, where) {
                const context = asyncLocalStorage.getStore();
                if (!context)
                    return false;
                try {
                    const modelLower = model.toLowerCase();
                    switch (operation) {
                        case 'read':
                            await prisma[modelLower].findFirst({ where });
                            return true;
                        case 'create':
                            // Check would require actual data, return based on role
                            return context.userRole === 'ADMIN';
                        case 'update':
                            await prisma[modelLower].updateMany({
                                where,
                                data: {}
                            });
                            return true;
                        case 'delete':
                            // Don't actually delete, just check
                            const count = await prisma[modelLower].count({ where });
                            return count > 0;
                        default:
                            return false;
                    }
                }
                catch {
                    return false;
                }
            },
            /**
             * Get current RLS context
             */
            $getContext() {
                return asyncLocalStorage.getStore();
            },
        },
    });
};
// Global singleton
const globalForPrisma = global;
// Export the RLS-enabled Prisma client
export const prismaRLS = globalForPrisma.prismaRLS ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prismaRLS = prismaRLS;
}
// Export the regular Prisma client for backwards compatibility
export const prisma = prismaRLS;
/**
 * Express/Hono middleware to set RLS context from request
 */
export function rlsMiddleware() {
    return async (req, res, next) => {
        // Get user from request (assumes auth middleware has already run)
        const user = req.user;
        if (user) {
            const context = {
                userId: user.id,
                userRole: user.role,
                sessionId: req.session?.id,
            };
            // Run the rest of the request with RLS context
            asyncLocalStorage.run(context, () => {
                next();
            });
        }
        else {
            next();
        }
    };
}
/**
 * Verify RLS is working correctly
 */
export async function verifyRLS() {
    const tables = [
        'users', 'sessions', 'api_keys', 'audit_logs',
        'rate_limits', 'webhook_events', 'email_queue',
        'feature_flags', 'system_config'
    ];
    const results = await Promise.all(tables.map(async (table) => {
        const rlsStatus = await prisma.$queryRaw `
        SELECT relrowsecurity 
        FROM pg_class 
        WHERE relname = ${table}
      `;
        const policies = await prisma.$queryRaw `
        SELECT COUNT(*) as count
        FROM pg_policy
        JOIN pg_class ON pg_class.oid = pg_policy.polrelid
        WHERE pg_class.relname = ${table}
      `;
        return {
            table,
            rlsEnabled: rlsStatus[0]?.relrowsecurity || false,
            policyCount: Number(policies[0]?.count || 0),
        };
    }));
    const allEnabled = results.every(r => r.rlsEnabled);
    return {
        enabled: allEnabled,
        tables: results,
    };
}
/**
 * Initialize RLS (run migrations if needed)
 */
export async function initializeRLS() {
    try {
        // Check if RLS is already enabled
        const status = await verifyRLS();
        if (!status.enabled) {
            console.log('RLS not fully enabled, applying migrations...');
            // Read and execute the RLS migration
            const fs = await import('fs/promises');
            const path = await import('path');
            const migrationPath = path.join(__dirname, '../prisma/migrations/20250818_add_rls/migration.sql');
            const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
            // Split by semicolons and execute each statement
            const statements = migrationSQL
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);
            for (const statement of statements) {
                try {
                    await prisma.$executeRawUnsafe(statement);
                }
                catch (error) {
                    // Some statements might fail if already applied
                    if (!error.message.includes('already exists')) {
                        console.error('Failed to execute:', statement.slice(0, 50) + '...');
                        throw error;
                    }
                }
            }
            console.log('RLS migrations applied successfully');
        }
        else {
            console.log('RLS is already enabled on all tables');
        }
        // Verify final status
        const finalStatus = await verifyRLS();
        console.log('RLS Status:', finalStatus);
    }
    catch (error) {
        console.error('Failed to initialize RLS:', error);
        throw error;
    }
}
export default prismaRLS;
//# sourceMappingURL=client-rls.js.map