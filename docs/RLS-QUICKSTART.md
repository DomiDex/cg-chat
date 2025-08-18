# RLS Quick Start Guide

## 5-Minute Setup

### 1. Install & Configure

```bash
# Clone and install
git clone <repository>
cd cg-chat
pnpm install

# Set environment variables
cp .env.example .env.local
# Add your Neon database URLs to .env.local
```

### 2. Apply Database Migration

```bash
cd packages/database
npx prisma generate
npx prisma migrate dev
```

### 3. Basic Usage

#### In API Routes

```typescript
import { prismaRLS } from '@cg/database';
import { authMiddleware, withRLSContext } from '../middleware/rls.js';

// Simple route with RLS
app.get('/api/my-data', authMiddleware(), async (c) => {
  const data = await withRLSContext(c, async () => {
    // This automatically filters to current user's data
    return prismaRLS.session.findMany();
  });
  
  return c.json(data);
});
```

#### Direct Database Access

```typescript
import { prismaRLS } from '@cg/database';

// Query with user context
const userData = await prismaRLS.$withRLS(
  { userId: 'user-123', userRole: 'USER' },
  async () => {
    return prismaRLS.user.findUnique({
      where: { id: 'user-123' }
    });
  }
);
```

## Key Concepts

### 1. User Context
Every database query needs a user context:
- `userId`: The user making the request
- `userRole`: Their permission level (USER, ADMIN, SUPPORT, etc.)

### 2. Automatic Filtering
RLS automatically filters data based on the user context:
- Regular users see only their own data
- Admins see everything
- Support staff have elevated read access

### 3. The RLS Client
Use `prismaRLS` instead of regular `prisma`:
- `prismaRLS` includes RLS context management
- Regular `prisma` bypasses RLS (dangerous!)

## Common Scenarios

### User Profile Management

```typescript
// Get my profile
app.get('/users/me', authMiddleware(), async (c) => {
  const user = await withRLSContext(c, async () => {
    return prismaRLS.user.findUnique({
      where: { id: c.get('userId') }
    });
  });
  return c.json(user);
});

// Update my profile
app.put('/users/me', authMiddleware(), async (c) => {
  const updates = await c.req.json();
  
  const user = await withRLSContext(c, async () => {
    return prismaRLS.user.update({
      where: { id: c.get('userId') },
      data: updates
    });
  });
  
  return c.json(user);
});
```

### Session Management

```typescript
// Get my sessions
app.get('/sessions', authMiddleware(), async (c) => {
  const sessions = await withRLSContext(c, async () => {
    // RLS ensures only my sessions are returned
    return prismaRLS.session.findMany({
      orderBy: { lastActivity: 'desc' }
    });
  });
  
  return c.json({ sessions });
});

// Revoke a session
app.delete('/sessions/:id', authMiddleware(), async (c) => {
  const sessionId = c.req.param('id');
  
  await withRLSContext(c, async () => {
    // RLS ensures I can only delete my own sessions
    await prismaRLS.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    });
  });
  
  return c.json({ success: true });
});
```

### API Key Management

```typescript
// Create API key
app.post('/api-keys', authMiddleware(), async (c) => {
  const { name, scopes } = await c.req.json();
  
  const apiKey = await withRLSContext(c, async () => {
    return prismaRLS.apiKey.create({
      data: {
        userId: c.get('userId'),
        name,
        key: generateApiKey(),
        hashedKey: hashApiKey(key),
        scopes
      }
    });
  });
  
  return c.json({ 
    key: apiKey.key, // Return unhashed key only once
    name: apiKey.name 
  });
});
```

### Admin Operations

```typescript
// Admin route to view all users
app.get('/admin/users', 
  authMiddleware(), 
  adminOnlyMiddleware(),
  async (c) => {
    const users = await withRLSContext(c, async () => {
      // Admin context allows viewing all users
      return prismaRLS.user.findMany({
        include: {
          _count: {
            select: { sessions: true, apiKeys: true }
          }
        }
      });
    });
    
    return c.json({ users });
  }
);
```

## Testing Your Implementation

### Quick Test Script

```typescript
// test-rls.ts
import { prismaRLS } from '@cg/database';

async function testRLS() {
  // Test as regular user
  const userContext = { 
    userId: 'test-user', 
    userRole: 'USER' as const 
  };
  
  const userSessions = await prismaRLS.$withRLS(
    userContext,
    async () => prismaRLS.session.count()
  );
  
  console.log(`User sees ${userSessions} sessions`);
  
  // Test as admin
  const adminContext = { 
    userId: 'admin-user', 
    userRole: 'ADMIN' as const 
  };
  
  const adminSessions = await prismaRLS.$withRLS(
    adminContext,
    async () => prismaRLS.session.count()
  );
  
  console.log(`Admin sees ${adminSessions} sessions`);
}

testRLS();
```

Run with:
```bash
npx tsx test-rls.ts
```

## Troubleshooting

### Issue: "Cannot see my own data"
**Solution**: Check that you're using `withRLSContext` or `$withRLS`

### Issue: "Permission denied" errors
**Solution**: Verify your user role and that RLS policies are applied

### Issue: "All users can see all data"
**Solution**: Ensure you're using `prismaRLS` not regular `prisma`

### Debug Mode

Enable query logging to see what's happening:

```typescript
// In your route
console.log('User context:', {
  userId: c.get('userId'),
  userRole: c.get('userRole')
});

// In database package
export const prismaRLS = new PrismaClient({
  log: ['query', 'error'], // Enable logging
  // ... rest of config
});
```

## Security Checklist

- [ ] Always use `prismaRLS` for user queries
- [ ] Never expose `prisma` directly to API routes
- [ ] Validate user context before operations
- [ ] Use `bypassRLS` only for system tasks
- [ ] Audit log sensitive operations
- [ ] Test RLS policies regularly

## Next Steps

1. Read the [full documentation](./RLS-DOCUMENTATION.md)
2. Review the [API reference](./RLS-API-REFERENCE.md)
3. Check [implementation examples](./RLS-IMPLEMENTATION-SUMMARY.md)
4. Run the test suite: `pnpm test`

## Need Help?

- Check error messages for RLS policy violations
- Enable debug logging to see actual queries
- Review test files for working examples
- Consult the troubleshooting guide

---

*Ready to build secure, multi-tenant applications with confidence!*