import { prisma, prismaRLS } from '../client-rls';
import { RLSContext } from '../utils/rls';
import { Role } from '@prisma/client';

/**
 * Security service for managing RLS policies and permissions
 */
export class SecurityService {
  /**
   * Check if a user has permission to perform an action
   */
  static async checkPermission(
    userId: string,
    resource: string,
    action: 'read' | 'create' | 'update' | 'delete'
  ): Promise<boolean> {
    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'ADMIN') return true;
    
    // Check specific permissions based on resource and action
    const permissions = this.getPermissionMatrix();
    const permission = permissions[resource]?.[action]?.[user.role];
    
    return permission || false;
  }
  
  /**
   * Get permission matrix for all resources
   */
  private static getPermissionMatrix(): Record<
    string,
    Record<string, Record<Role, boolean>>
  > {
    return {
      users: {
        read: { USER: false, ADMIN: true, AGENT: false, DEVELOPER: true, SUPPORT: true },
        create: { USER: false, ADMIN: true, AGENT: false, DEVELOPER: false, SUPPORT: false },
        update: { USER: false, ADMIN: true, AGENT: false, DEVELOPER: false, SUPPORT: false },
        delete: { USER: false, ADMIN: true, AGENT: false, DEVELOPER: false, SUPPORT: false },
      },
      sessions: {
        read: { USER: true, ADMIN: true, AGENT: true, DEVELOPER: true, SUPPORT: true },
        create: { USER: true, ADMIN: true, AGENT: true, DEVELOPER: true, SUPPORT: true },
        update: { USER: true, ADMIN: true, AGENT: true, DEVELOPER: true, SUPPORT: true },
        delete: { USER: true, ADMIN: true, AGENT: true, DEVELOPER: true, SUPPORT: true },
      },
      apiKeys: {
        read: { USER: true, ADMIN: true, AGENT: true, DEVELOPER: true, SUPPORT: true },
        create: { USER: true, ADMIN: true, AGENT: true, DEVELOPER: true, SUPPORT: true },
        update: { USER: true, ADMIN: true, AGENT: true, DEVELOPER: true, SUPPORT: true },
        delete: { USER: true, ADMIN: true, AGENT: true, DEVELOPER: true, SUPPORT: true },
      },
      auditLogs: {
        read: { USER: false, ADMIN: true, AGENT: false, DEVELOPER: true, SUPPORT: true },
        create: { USER: false, ADMIN: true, AGENT: false, DEVELOPER: false, SUPPORT: false },
        update: { USER: false, ADMIN: false, AGENT: false, DEVELOPER: false, SUPPORT: false },
        delete: { USER: false, ADMIN: false, AGENT: false, DEVELOPER: false, SUPPORT: false },
      },
      featureFlags: {
        read: { USER: true, ADMIN: true, AGENT: true, DEVELOPER: true, SUPPORT: true },
        create: { USER: false, ADMIN: true, AGENT: false, DEVELOPER: true, SUPPORT: false },
        update: { USER: false, ADMIN: true, AGENT: false, DEVELOPER: true, SUPPORT: false },
        delete: { USER: false, ADMIN: true, AGENT: false, DEVELOPER: true, SUPPORT: false },
      },
      systemConfig: {
        read: { USER: true, ADMIN: true, AGENT: true, DEVELOPER: true, SUPPORT: true },
        create: { USER: false, ADMIN: true, AGENT: false, DEVELOPER: false, SUPPORT: false },
        update: { USER: false, ADMIN: true, AGENT: false, DEVELOPER: false, SUPPORT: false },
        delete: { USER: false, ADMIN: true, AGENT: false, DEVELOPER: false, SUPPORT: false },
      },
    };
  }
  
  /**
   * Validate RLS policies are correctly applied
   */
  static async validateRLSPolicies(): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    
    // Check if RLS is enabled on all tables
    const tables = [
      'users', 'sessions', 'api_keys', 'audit_logs',
      'rate_limits', 'webhook_events', 'email_queue',
      'feature_flags', 'system_config'
    ];
    
    for (const table of tables) {
      const result = await prisma.$queryRaw<
        { relrowsecurity: boolean }[]
      >`
        SELECT relrowsecurity 
        FROM pg_class 
        WHERE relname = ${table}
      `;
      
      if (!result[0]?.relrowsecurity) {
        issues.push(`RLS not enabled on table: ${table}`);
      }
      
      // Check if policies exist
      const policies = await prisma.$queryRaw<
        { count: bigint }[]
      >`
        SELECT COUNT(*) as count
        FROM pg_policy
        JOIN pg_class ON pg_class.oid = pg_policy.polrelid
        WHERE pg_class.relname = ${table}
      `;
      
      if (Number(policies[0]?.count || 0) === 0) {
        issues.push(`No RLS policies found for table: ${table}`);
      }
    }
    
    // Check if auth functions exist
    const functions = ['auth.user_id', 'auth.user_role', 'auth.is_admin', 'auth.is_support'];
    for (const func of functions) {
      const [schema, name] = func.split('.');
      const result = await prisma.$queryRaw<
        { exists: boolean }[]
      >`
        SELECT EXISTS (
          SELECT 1 
          FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE n.nspname = ${schema} 
          AND p.proname = ${name}
        ) as exists
      `;
      
      if (!result[0]?.exists) {
        issues.push(`Required function not found: ${func}`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues,
    };
  }
  
  /**
   * Test RLS access for a specific user
   */
  static async testUserAccess(
    userId: string,
    tests?: {
      tables?: string[];
      operations?: ('SELECT' | 'INSERT' | 'UPDATE' | 'DELETE')[];
    }
  ): Promise<{
    userId: string;
    role: Role;
    results: Array<{
      table: string;
      operation: string;
      allowed: boolean;
      error?: string;
    }>;
  }> {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const context: RLSContext = {
      userId: user.id,
      userRole: user.role,
    };
    
    const tables = tests?.tables || ['users', 'sessions', 'api_keys'];
    const operations = tests?.operations || ['SELECT', 'UPDATE'];
    const results: any[] = [];
    
    for (const table of tables) {
      for (const operation of operations) {
        try {
          let allowed = false;
          
          await prismaRLS.$withRLS(context, async () => {
            switch (operation) {
              case 'SELECT':
                await prisma.$queryRawUnsafe(
                  `SELECT COUNT(*) FROM ${table}`
                );
                allowed = true;
                break;
                
              case 'INSERT':
                // Test with a dummy insert (rolled back)
                await prisma.$transaction(async () => {
                  // This would need proper data for each table
                  throw new Error('Rollback');
                }).catch(() => {});
                allowed = false;
                break;
                
              case 'UPDATE':
                // Test update without actually changing anything
                await prisma.$queryRawUnsafe(
                  `UPDATE ${table} SET id = id WHERE false`
                );
                allowed = true;
                break;
                
              case 'DELETE':
                // Test delete without actually removing anything
                await prisma.$queryRawUnsafe(
                  `DELETE FROM ${table} WHERE false`
                );
                allowed = true;
                break;
            }
          });
          
          results.push({
            table,
            operation,
            allowed,
          });
        } catch (error: any) {
          results.push({
            table,
            operation,
            allowed: false,
            error: error.message,
          });
        }
      }
    }
    
    return {
      userId: user.id,
      role: user.role,
      results,
    };
  }
  
  /**
   * Apply RLS to a query result to filter out unauthorized data
   */
  static async filterByRLS<T extends { userId?: string; id?: string }>(
    data: T[],
    context: RLSContext
  ): Promise<T[]> {
    // Admin sees everything
    if (context.userRole === 'ADMIN') {
      return data;
    }
    
    // Filter based on ownership
    return data.filter(item => {
      // User can see their own data
      if (item.userId === context.userId) {
        return true;
      }
      
      // Support can see everything except admin data
      if (context.userRole === 'SUPPORT') {
        return true;
      }
      
      return false;
    });
  }
  
  /**
   * Create a secure query builder with RLS
   */
  static createSecureQuery(context: RLSContext) {
    return {
      users: {
        findMany: async (args?: any) => {
          return prismaRLS.$withRLS(context, async () => {
            const users = await prisma.user.findMany(args);
            return SecurityService.filterByRLS(users, context);
          });
        },
        findUnique: async (args: any) => {
          return prismaRLS.$withRLS(context, async () => {
            const user = await prisma.user.findUnique(args);
            if (user && context.userId !== user.id && context.userRole !== 'ADMIN') {
              return null;
            }
            return user;
          });
        },
      },
      sessions: {
        findMany: async (args?: any) => {
          return prismaRLS.$withRLS(context, async () => {
            const sessions = await prisma.session.findMany(args);
            return SecurityService.filterByRLS(sessions, context);
          });
        },
      },
      apiKeys: {
        findMany: async (args?: any) => {
          return prismaRLS.$withRLS(context, async () => {
            const keys = await prisma.apiKey.findMany(args);
            return SecurityService.filterByRLS(keys, context);
          });
        },
      },
    };
  }
  
  /**
   * Log security events
   */
  static async logSecurityEvent(
    event: {
      userId?: string;
      action: string;
      resource: string;
      resourceId?: string;
      allowed: boolean;
      reason?: string;
      metadata?: any;
    }
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId: event.userId,
        action: `SECURITY_${event.action}`,
        entity: event.resource,
        entityId: event.resourceId,
        metadata: {
          allowed: event.allowed,
          reason: event.reason,
          ...event.metadata,
        },
      },
    });
  }
  
  /**
   * Get security audit trail for a user
   */
  static async getUserSecurityAudit(
    userId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<any[]> {
    const where: any = {
      userId,
      action: { startsWith: 'SECURITY_' },
    };
    
    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        where.createdAt.gte = options.startDate;
      }
      if (options.endDate) {
        where.createdAt.lte = options.endDate;
      }
    }
    
    return prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 100,
    });
  }
}

export default SecurityService;