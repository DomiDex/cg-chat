import { prisma } from '../client';
import { Prisma } from '@prisma/client';

export async function createAuditLog(params: {
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
}) {
  return prisma.auditLog.create({
    data: {
      ...params,
      oldValues: params.oldValues ? JSON.parse(JSON.stringify(params.oldValues)) : null,
      newValues: params.newValues ? JSON.parse(JSON.stringify(params.newValues)) : null,
      metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : null,
    },
  });
}

// Prisma middleware for automatic audit logging
export function auditMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    const auditableActions = ['create', 'update', 'delete'];
    const auditableModels = ['User', 'Session', 'ApiKey'];
    
    if (
      auditableActions.includes(params.action) &&
      auditableModels.includes(params.model || '')
    ) {
      const before = params.action === 'update' || params.action === 'delete'
        ? await (prisma as any)[params.model!.toLowerCase()].findUnique({
            where: params.args.where,
          })
        : null;
      
      const result = await next(params);
      
      await createAuditLog({
        action: params.action,
        entity: params.model!,
        entityId: result?.id || before?.id,
        oldValues: before,
        newValues: params.action !== 'delete' ? result : null,
      });
      
      return result;
    }
    
    return next(params);
  };
}