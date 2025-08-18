import { PrismaClient } from '@prisma/client';
import { RLSContext } from './utils/rls';
export declare const prismaRLS: import("@prisma/client/runtime/library").DynamicClientExtensionThis<import("@prisma/client").Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
    result: {};
    model: {};
    query: {};
    client: {
        $withRLS: () => <T>(context: RLSContext, callback: () => Promise<T>) => Promise<T>;
        $asUser: () => <T>(userId: string, userRole: RLSContext["userRole"], callback: () => Promise<T>) => Promise<T>;
        $asAdmin: () => <T>(adminId: string, callback: () => Promise<T>) => Promise<T>;
        $bypassRLS: () => <T>(callback: (tx: PrismaClient) => Promise<T>) => Promise<T>;
        $canAccess: () => (model: string, operation: "read" | "create" | "update" | "delete", where?: any) => Promise<boolean>;
        $getContext: () => () => RLSContext | undefined;
    };
}, {}>, import("@prisma/client").Prisma.TypeMapCb<{
    log: ("error" | "query" | "warn")[];
    errorFormat: "pretty";
}>, {
    result: {};
    model: {};
    query: {};
    client: {
        $withRLS: () => <T>(context: RLSContext, callback: () => Promise<T>) => Promise<T>;
        $asUser: () => <T>(userId: string, userRole: RLSContext["userRole"], callback: () => Promise<T>) => Promise<T>;
        $asAdmin: () => <T>(adminId: string, callback: () => Promise<T>) => Promise<T>;
        $bypassRLS: () => <T>(callback: (tx: PrismaClient) => Promise<T>) => Promise<T>;
        $canAccess: () => (model: string, operation: "read" | "create" | "update" | "delete", where?: any) => Promise<boolean>;
        $getContext: () => () => RLSContext | undefined;
    };
}>;
export declare const prisma: PrismaClient;
/**
 * Express/Hono middleware to set RLS context from request
 */
export declare function rlsMiddleware(): (req: any, res: any, next: any) => Promise<void>;
/**
 * Verify RLS is working correctly
 */
export declare function verifyRLS(): Promise<{
    enabled: boolean;
    tables: Array<{
        table: string;
        rlsEnabled: boolean;
        policyCount: number;
    }>;
}>;
/**
 * Initialize RLS (run migrations if needed)
 */
export declare function initializeRLS(): Promise<void>;
export default prismaRLS;
//# sourceMappingURL=client-rls.d.ts.map