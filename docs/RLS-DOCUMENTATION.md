# Row Level Security (RLS) Documentation

## 🔐 Overview

Row Level Security (RLS) provides database-level security by restricting which rows users can access in database tables. This implementation uses PostgreSQL's native RLS features with Prisma ORM and Neon database.

---

## 🏗️ Architecture

### Components

1. **PostgreSQL RLS Policies**: Database-level security rules
2. **Auth Functions**: SQL functions to get user context
3. **Prisma RLS Client**: Extended Prisma client with RLS support
4. **Security Service**: High-level API for security operations
5. **Middleware**: Express/Hono middleware for setting user context

### Security Layers

```
Application Layer
    ↓
Middleware (Auth + RLS Context)
    ↓
Prisma RLS Client
    ↓
PostgreSQL RLS Policies
    ↓
Database Tables
```

---

## 📊 RLS Policies Matrix

| Table | User (Own Data) | Admin | Support | Agent | Developer |
|-------|----------------|-------|---------|-------|-----------|
| **users** | Read ✅ Update ✅ | All ✅ | Read ✅ | - | Read ✅ |
| **sessions** | All ✅ | All ✅ | Read ✅ | - | - |
| **api_keys** | All ✅ | All ✅ | - | - | - |
| **audit_logs** | - | All ✅ | Read ✅ | - | Read ✅ |
| **rate_limits** | Read ✅ | All ✅ | - | - | - |
| **webhook_events** | - | All ✅ | - | - | - |
| **email_queue** | Read ✅ | All ✅ | Read ✅ | - | - |
| **feature_flags** | Read ✅ | All ✅ | Read ✅ | Read ✅ | All ✅ |
| **system_config** | Read* ✅ | All ✅ | Read* ✅ | Read* ✅ | Read* ✅ |

*Non-secret configs only

---

## 🚀 Usage

### Basic Setup

```typescript
import { prismaRLS, initializeRLS } from '@cg/database';

// Initialize RLS on application start
await initializeRLS();

// Verify RLS is enabled
const status = await verifyRLS();
console.log('RLS enabled:', status.enabled);
```

### Using RLS Context

#### Method 1: With Middleware (Recommended)

```typescript
import { prismaRLSMiddleware } from '@cg/database';
import express from 'express';

const app = express();

// Add auth middleware first
app.use(authMiddleware);

// Add RLS middleware
app.use(prismaRLSMiddleware());

// Now all database queries will use RLS context
app.get('/users', async (req, res) => {
  // This will only return users the current user can see
  const users = await prisma.user.findMany();
  res.json(users);
});
```

#### Method 2: Manual Context

```typescript
import { prismaRLS } from '@cg/database';

// Execute queries as a specific user
await prismaRLS.$asUser(userId, 'USER', async () => {
  // All queries here run with user context
  const myProfile = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  const mySessions = await prisma.session.findMany({
    where: { userId }
  });
});

// Execute queries as admin
await prismaRLS.$asAdmin(adminId, async () => {
  // Admin can see everything
  const allUsers = await prisma.user.findMany();
  const auditLogs = await prisma.auditLog.findMany();
});
```

#### Method 3: With RLS Wrapper

```typescript
import { withRLS } from '@cg/database';

const context = {
  userId: 'user-123',
  userRole: 'USER',
  sessionId: 'session-456'
};

const result = await withRLS(prisma, context, async (tx) => {
  // All queries use RLS context
  return tx.user.findMany();
});
```

### Bypassing RLS (System Operations)

```typescript
// Use with extreme caution - only for system operations
await prismaRLS.$bypassRLS(async (tx) => {
  // Queries here bypass RLS
  const allUsers = await tx.user.findMany();
  
  // Clean up expired sessions
  await tx.session.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });
});
```

### Security Service

```typescript
import { SecurityService } from '@cg/database';

// Check permissions
const canRead = await SecurityService.checkPermission(
  userId,
  'users',
  'read'
);

// Test user access
const accessTest = await SecurityService.testUserAccess(userId, {
  tables: ['users', 'sessions'],
  operations: ['SELECT', 'UPDATE']
});

// Log security events
await SecurityService.logSecurityEvent({
  userId,
  action: 'ACCESS_DENIED',
  resource: 'admin_panel',
  allowed: false,
  reason: 'Insufficient permissions'
});

// Get security audit trail
const audit = await SecurityService.getUserSecurityAudit(userId, {
  startDate: new Date('2024-01-01'),
  limit: 100
});
```

### Secure Query Builder

```typescript
const context = { userId: 'user-123', userRole: 'USER' };
const secureQuery = SecurityService.createSecureQuery(context);

// These queries automatically apply RLS
const users = await secureQuery.users.findMany();
const sessions = await secureQuery.sessions.findMany();
const apiKeys = await secureQuery.apiKeys.findMany();
```

---

## 🔧 API Integration

### Hono API Example

```typescript
import { Hono } from 'hono';
import { prismaRLS, RLSContext } from '@cg/database';

const app = new Hono();

// Middleware to set RLS context
app.use('*', async (c, next) => {
  const user = c.get('user'); // From auth middleware
  
  if (user) {
    const context: RLSContext = {
      userId: user.id,
      userRole: user.role,
      sessionId: c.get('sessionId')
    };
    
    // Set context for this request
    await prismaRLS.$withRLS(context, async () => {
      await next();
    });
  } else {
    await next();
  }
});

// Routes automatically use RLS
app.get('/api/users/me', async (c) => {
  const user = await prisma.user.findUnique({
    where: { id: c.get('user').id }
  });
  return c.json(user);
});

app.get('/api/sessions', async (c) => {
  // Only returns current user's sessions
  const sessions = await prisma.session.findMany();
  return c.json(sessions);
});
```

---

## 🧪 Testing

### Run RLS Tests

```bash
# Test RLS implementation
cd packages/database
npx tsx test-rls.ts

# Expected output:
# ✅ RLS is enabled on all tables
# ✅ RLS policies are correctly configured
# ✅ User access is properly restricted
# ✅ Admin access works as expected
# ✅ RLS context execution works
# ✅ RLS bypass for system operations works
# ✅ Security logging is functional
```

### Manual Testing

```typescript
// Test different user roles
const testRoles = async () => {
  // Create test users
  const admin = await createUser({ role: 'ADMIN' });
  const user = await createUser({ role: 'USER' });
  const support = await createUser({ role: 'SUPPORT' });
  
  // Test as regular user
  await prismaRLS.$asUser(user.id, 'USER', async () => {
    const users = await prisma.user.findMany();
    console.log('User sees:', users.length); // Should be 1 (self)
  });
  
  // Test as admin
  await prismaRLS.$asAdmin(admin.id, async () => {
    const users = await prisma.user.findMany();
    console.log('Admin sees:', users.length); // Should see all
  });
  
  // Test as support
  await prismaRLS.$asUser(support.id, 'SUPPORT', async () => {
    const users = await prisma.user.findMany();
    console.log('Support sees:', users.length); // Should see all
    
    const logs = await prisma.auditLog.findMany();
    console.log('Support can read audit logs:', logs.length > 0);
  });
};
```

---

## 🛠️ Maintenance

### Apply RLS Migration

```bash
# Apply RLS policies to database
cd packages/database
npx prisma migrate dev --name add_rls

# Or manually apply SQL
psql $DATABASE_URL < prisma/migrations/20250818_add_rls/migration.sql
```

### Verify RLS Status

```typescript
import { verifyRLS, SecurityService } from '@cg/database';

// Check RLS is enabled
const status = await verifyRLS();
console.log('RLS Status:', status);

// Validate policies
const validation = await SecurityService.validateRLSPolicies();
if (!validation.valid) {
  console.error('RLS Issues:', validation.issues);
}
```

### Monitor Security Events

```typescript
// Get recent security events
const events = await prisma.auditLog.findMany({
  where: {
    action: { startsWith: 'SECURITY_' }
  },
  orderBy: { createdAt: 'desc' },
  take: 100
});

// Analyze access patterns
const deniedAccess = events.filter(e => 
  e.metadata?.allowed === false
);
console.log('Access denied events:', deniedAccess);
```

---

## ⚠️ Important Notes

### Security Best Practices

1. **Always use RLS in production**: Never disable RLS on production databases
2. **Validate user context**: Always verify user identity before setting RLS context
3. **Audit sensitive operations**: Log all admin and system operations
4. **Test thoroughly**: Test all user roles and permissions
5. **Monitor access**: Regularly review security audit logs

### Performance Considerations

1. **Indexes**: Ensure proper indexes on user_id and role columns
2. **Query optimization**: RLS adds WHERE clauses, optimize queries accordingly
3. **Connection pooling**: Use connection pooling for better performance
4. **Caching**: Cache user permissions where appropriate

### Common Issues

#### Issue: RLS policies not applied
```bash
# Check if RLS is enabled
SELECT relrowsecurity FROM pg_class WHERE relname = 'users';

# Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

#### Issue: Permission denied errors
```typescript
// Ensure user context is set
const context = { userId, userRole };
await prismaRLS.$withRLS(context, async () => {
  // Queries here
});
```

#### Issue: Admin can't access data
```sql
-- Check admin role policy
SELECT * FROM pg_policies WHERE tablename = 'users' AND policyname LIKE '%admin%';
```

---

## 📚 Additional Resources

- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Prisma Security Best Practices](https://www.prisma.io/docs/guides/security)
- [Neon Database Security](https://neon.tech/docs/security)

---

## 🔄 Migration from Non-RLS

If migrating from a non-RLS database:

1. **Backup your data** before applying RLS
2. **Test in staging** environment first
3. **Apply policies gradually** table by table
4. **Update application code** to use RLS context
5. **Monitor for issues** in production

```typescript
// Migration helper
const migrateToRLS = async () => {
  // 1. Apply RLS policies
  await initializeRLS();
  
  // 2. Test with sample users
  const testResults = await testAllUserRoles();
  
  // 3. Verify no data leakage
  const validation = await SecurityService.validateRLSPolicies();
  
  if (validation.valid) {
    console.log('✅ RLS migration successful');
  } else {
    console.error('❌ Issues found:', validation.issues);
  }
};
```

---

*Last Updated: January 2025*  
*Version: 1.0.0*