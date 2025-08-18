import { Prisma } from '@prisma/client';
export declare function createAuditLog(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    oldValues?: any;
    newValues?: any;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
}): Promise<{
    id: string;
    metadata: Prisma.JsonValue | null;
    createdAt: Date;
    userId: string | null;
    userAgent: string | null;
    ipAddress: string | null;
    action: string;
    requestId: string | null;
    entity: string;
    entityId: string | null;
    oldValues: Prisma.JsonValue | null;
    newValues: Prisma.JsonValue | null;
}>;
export declare function auditMiddleware(): Prisma.Middleware;
//# sourceMappingURL=audit.d.ts.map