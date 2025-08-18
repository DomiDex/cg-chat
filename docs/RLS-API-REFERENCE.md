# RLS API Reference

## Quick Reference Guide

### Prisma RLS Client Methods

```typescript
import { prismaRLS, RLSContext } from '@cg/database';
```

#### Core Methods

| Method | Description | Usage |
|--------|-------------|-------|
| `$withRLS(context, callback)` | Execute with specific context | General purpose |
| `$asUser(userId, callback)` | Execute as specific user | User operations |
| `$asAdmin(callback)` | Execute with admin privileges | Admin operations |
| `$asSupport(callback)` | Execute as support staff | Support operations |
| `$bypassRLS(callback)` | Bypass RLS entirely | System operations |

#### Context Interface

```typescript
interface RLSContext {
  userId: string;
  userRole: 'USER' | 'ADMIN' | 'AGENT' | 'DEVELOPER' | 'SUPPORT';
  sessionId?: string;  // Optional session tracking
}
```

### Middleware Functions

```typescript
import { 
  authMiddleware,
  adminOnlyMiddleware,
  withRLSContext 
} from '../middleware/rls.js';
```

| Function | Description | Returns |
|----------|-------------|---------|
| `authMiddleware()` | Validates JWT and sets user context | Middleware |
| `adminOnlyMiddleware()` | Restricts to admin users only | Middleware |
| `withRLSContext(c, callback)` | Executes callback with request context | Promise<T> |

### Code Examples

#### Basic Query with RLS

```typescript
// Get current user's profile
const user = await prismaRLS.$withRLS(
  { userId: 'user-123', userRole: 'USER' },
  async () => {
    return prismaRLS.user.findUnique({
      where: { id: 'user-123' }
    });
  }
);
```

#### API Route with RLS

```typescript
app.get('/api/sessions', authMiddleware(), async (c) => {
  const sessions = await withRLSContext(c, async () => {
    // Automatically filtered to current user
    return prismaRLS.session.findMany({
      orderBy: { createdAt: 'desc' }
    });
  });
  
  return c.json({ sessions });
});
```

#### Admin Operation

```typescript
// Admin viewing all users
app.get('/api/admin/users', 
  authMiddleware(), 
  adminOnlyMiddleware(),
  async (c) => {
    const users = await withRLSContext(c, async () => {
      return prismaRLS.user.findMany({
        include: {
          sessions: { select: { id: true, lastActivity: true } },
          _count: { select: { apiKeys: true } }
        }
      });
    });
    
    return c.json({ users });
  }
);
```

#### Transaction with RLS

```typescript
const result = await prismaRLS.$withRLS(context, async () => {
  return prismaRLS.$transaction(async (tx) => {
    // Update user
    const user = await tx.user.update({
      where: { id: context.userId },
      data: { lastActive: new Date() }
    });
    
    // Create audit log
    await tx.auditLog.create({
      data: {
        userId: context.userId,
        action: 'USER_ACTIVITY',
        entity: 'user',
        entityId: user.id
      }
    });
    
    return user;
  });
});
```

#### Bypass RLS for System Tasks

```typescript
// Clean up old sessions (system task)
const deleted = await prismaRLS.$bypassRLS(async (tx) => {
  return tx.session.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });
});

console.log(`Deleted ${deleted.count} expired sessions`);
```

### Error Handling

```typescript
try {
  await prismaRLS.$withRLS(context, async () => {
    // Database operations
  });
} catch (error) {
  if (error.code === 'P2025') {
    // Record not found (possibly due to RLS)
    return { error: 'Not found or access denied' };
  }
  if (error.code === 'P2010') {
    // Raw query failed (possibly RLS policy violation)
    return { error: 'Permission denied' };
  }
  throw error;
}
```

### Testing Utilities

```typescript
// Test user access
async function testUserAccess(userId: string) {
  const context = { userId, userRole: 'USER' as const };
  
  const canRead = await prismaRLS.$withRLS(context, async () => {
    try {
      await prismaRLS.user.findUnique({ where: { id: userId } });
      return true;
    } catch {
      return false;
    }
  });
  
  return canRead;
}

// Verify RLS is enabled
async function verifyRLSEnabled(table: string) {
  const result = await prisma.$queryRaw<{ enabled: boolean }[]>`
    SELECT relrowsecurity as enabled 
    FROM pg_class 
    WHERE relname = ${table}
  `;
  
  return result[0]?.enabled || false;
}
```

### Performance Tips

1. **Batch Operations**: Group related queries
```typescript
await prismaRLS.$withRLS(context, async () => {
  const [user, sessions, apiKeys] = await Promise.all([
    prismaRLS.user.findUnique({ where: { id: userId } }),
    prismaRLS.session.findMany({ where: { userId } }),
    prismaRLS.apiKey.findMany({ where: { userId } })
  ]);
  
  return { user, sessions, apiKeys };
});
```

2. **Use Includes**: Reduce round trips
```typescript
const userWithRelations = await prismaRLS.$withRLS(context, async () => {
  return prismaRLS.user.findUnique({
    where: { id: userId },
    include: {
      sessions: true,
      apiKeys: true,
      auditLogs: { take: 10, orderBy: { createdAt: 'desc' } }
    }
  });
});
```

3. **Cache Context**: Reuse context for multiple operations
```typescript
const context = { userId: req.userId, userRole: req.userRole };

// Reuse context for multiple operations
const profile = await prismaRLS.$withRLS(context, getProfile);
const settings = await prismaRLS.$withRLS(context, getSettings);
const activity = await prismaRLS.$withRLS(context, getActivity);
```

### Common Patterns

#### User Self-Service
```typescript
// Users managing their own data
app.put('/api/profile', authMiddleware(), async (c) => {
  const updates = await c.req.json();
  
  const updated = await withRLSContext(c, async () => {
    return prismaRLS.user.update({
      where: { id: c.get('userId') },
      data: updates
    });
  });
  
  return c.json(updated);
});
```

#### Role-Based Routes
```typescript
// Different responses based on role
app.get('/api/dashboard', authMiddleware(), async (c) => {
  const role = c.get('userRole');
  
  const data = await withRLSContext(c, async () => {
    switch (role) {
      case 'ADMIN':
        return getAdminDashboard();
      case 'SUPPORT':
        return getSupportDashboard();
      default:
        return getUserDashboard();
    }
  });
  
  return c.json(data);
});
```

#### Audit Trail
```typescript
// Automatic audit logging
async function auditedOperation(
  context: RLSContext,
  operation: string,
  callback: () => Promise<any>
) {
  const start = Date.now();
  let success = false;
  let result;
  
  try {
    result = await prismaRLS.$withRLS(context, callback);
    success = true;
    return result;
  } finally {
    await prismaRLS.auditLog.create({
      data: {
        userId: context.userId,
        action: operation,
        success,
        duration: Date.now() - start,
        metadata: { role: context.userRole }
      }
    });
  }
}
```

---

*For full documentation, see [RLS-DOCUMENTATION.md](./RLS-DOCUMENTATION.md)*