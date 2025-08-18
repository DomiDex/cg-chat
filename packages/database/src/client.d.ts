import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
export declare const prisma: PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare function createNeonPool(): Pool;
export declare function checkDatabaseHealth(): Promise<boolean>;
export declare function disconnectDatabase(): Promise<void>;
export declare function withTransaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T>;
export declare function withRetry<T>(fn: () => Promise<T>, retries?: number, delay?: number): Promise<T>;
export default prisma;
//# sourceMappingURL=client.d.ts.map