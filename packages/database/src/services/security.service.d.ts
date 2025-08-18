import { RLSContext } from '../utils/rls';
import { Role } from '@prisma/client';
/**
 * Security service for managing RLS policies and permissions
 */
export declare class SecurityService {
    /**
     * Check if a user has permission to perform an action
     */
    static checkPermission(userId: string, resource: string, action: 'read' | 'create' | 'update' | 'delete'): Promise<boolean>;
    /**
     * Get permission matrix for all resources
     */
    private static getPermissionMatrix;
    /**
     * Validate RLS policies are correctly applied
     */
    static validateRLSPolicies(): Promise<{
        valid: boolean;
        issues: string[];
    }>;
    /**
     * Test RLS access for a specific user
     */
    static testUserAccess(userId: string, tests?: {
        tables?: string[];
        operations?: ('SELECT' | 'INSERT' | 'UPDATE' | 'DELETE')[];
    }): Promise<{
        userId: string;
        role: Role;
        results: Array<{
            table: string;
            operation: string;
            allowed: boolean;
            error?: string;
        }>;
    }>;
    /**
     * Apply RLS to a query result to filter out unauthorized data
     */
    static filterByRLS<T extends {
        userId?: string;
        id?: string;
    }>(data: T[], context: RLSContext): Promise<T[]>;
    /**
     * Create a secure query builder with RLS
     */
    static createSecureQuery(context: RLSContext): {
        users: {
            findMany: (args?: any) => Promise<{
                id: string;
                email: string;
                emailVerified: boolean;
                verificationToken: string | null;
                verificationExpiry: Date | null;
                name: string | null;
                role: import("@prisma/client").$Enums.Role;
                customerId: string | null;
                phone: string | null;
                avatar: string | null;
                preferences: import("@prisma/client/runtime/library").JsonValue;
                metadata: import("@prisma/client/runtime/library").JsonValue;
                createdAt: Date;
                updatedAt: Date;
                lastActive: Date | null;
                deletedAt: Date | null;
                bio: string | null;
                subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
                subscriptionValidUntil: Date | null;
            }[]>;
            findUnique: (args: any) => Promise<{
                id: string;
                email: string;
                emailVerified: boolean;
                verificationToken: string | null;
                verificationExpiry: Date | null;
                name: string | null;
                role: import("@prisma/client").$Enums.Role;
                customerId: string | null;
                phone: string | null;
                avatar: string | null;
                preferences: import("@prisma/client/runtime/library").JsonValue;
                metadata: import("@prisma/client/runtime/library").JsonValue;
                createdAt: Date;
                updatedAt: Date;
                lastActive: Date | null;
                deletedAt: Date | null;
                bio: string | null;
                subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
                subscriptionValidUntil: Date | null;
            } | null>;
        };
        sessions: {
            findMany: (args?: any) => Promise<{
                id: string;
                createdAt: Date;
                userId: string;
                userAgent: string | null;
                ipAddress: string | null;
                token: string;
                refreshToken: string;
                expiresAt: Date;
                refreshExpiresAt: Date;
                lastActivity: Date;
                deviceId: string | null;
                location: import("@prisma/client/runtime/library").JsonValue | null;
                revokedAt: Date | null;
            }[]>;
        };
        apiKeys: {
            findMany: (args?: any) => Promise<{
                id: string;
                name: string;
                createdAt: Date;
                userId: string;
                expiresAt: Date | null;
                key: string;
                rateLimit: number;
                revokedAt: Date | null;
                hashedKey: string;
                scopes: string[];
                lastUsedAt: Date | null;
                usageCount: number;
            }[]>;
        };
    };
    /**
     * Log security events
     */
    static logSecurityEvent(event: {
        userId?: string;
        action: string;
        resource: string;
        resourceId?: string;
        allowed: boolean;
        reason?: string;
        metadata?: any;
    }): Promise<void>;
    /**
     * Get security audit trail for a user
     */
    static getUserSecurityAudit(userId: string, options?: {
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<any[]>;
}
export default SecurityService;
//# sourceMappingURL=security.service.d.ts.map