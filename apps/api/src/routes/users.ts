import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prismaRLS, UserService, SecurityService } from '@cg/database';
import { authMiddleware } from '../middleware/auth-simple.js';
import { adminOnlyMiddleware, withRLSContext } from '../middleware/rls.js';

const users = new Hono();

// Get current user profile (uses RLS to ensure user can only see their own data)
users.get('/me', authMiddleware(), async (c) => {
  const userId = c.get('userId');
  
  // This query automatically uses RLS context from middleware
  const user = await withRLSContext(c, async () => {
    return UserService.findById(userId);
  });
  
  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }
  
  // Remove sensitive fields
  const { deletedAt, ...safeUser } = user;
  
  return c.json({
    user: safeUser,
  });
});

// Update current user profile
const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  preferences: z.record(z.any()).optional(),
});

users.put(
  '/me',
  authMiddleware(),
  zValidator('json', updateProfileSchema),
  async (c) => {
    const userId = c.get('userId');
    const data = c.req.valid('json');
    
    // RLS ensures user can only update their own profile
    const updatedUser = await withRLSContext(c, async () => {
      return UserService.update(userId, data);
    });
    
    return c.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  }
);

// Get user's sessions (RLS ensures only own sessions are visible)
users.get('/me/sessions', authMiddleware(), async (c) => {
  const userId = c.get('userId');
  
  const sessions = await withRLSContext(c, async () => {
    return prismaRLS.session.findMany({
      where: { userId },
      orderBy: { lastActivity: 'desc' },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        deviceId: true,
        lastActivity: true,
        createdAt: true,
      },
    });
  });
  
  return c.json({ sessions });
});

// Revoke a session
users.delete('/me/sessions/:sessionId', authMiddleware(), async (c) => {
  const sessionId = c.req.param('sessionId');
  
  // RLS ensures user can only delete their own sessions
  await withRLSContext(c, async () => {
    await prismaRLS.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  });
  
  return c.json({ message: 'Session revoked successfully' });
});

// Get user's API keys (RLS ensures only own keys are visible)
users.get('/me/api-keys', authMiddleware(), async (c) => {
  const userId = c.get('userId');
  
  const apiKeys = await withRLSContext(c, async () => {
    return prismaRLS.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        key: true, // Only first few chars will be shown
        scopes: true,
        lastUsedAt: true,
        createdAt: true,
        expiresAt: true,
      },
    });
  });
  
  // Mask API keys for security
  const maskedKeys = apiKeys.map(key => ({
    ...key,
    key: key.key.substring(0, 8) + '...',
  }));
  
  return c.json({ apiKeys: maskedKeys });
});

// Admin-only: List all users
users.get(
  '/',
  authMiddleware(),
  adminOnlyMiddleware(),
  async (c) => {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Admin can see all users thanks to RLS policies
    const result = await withRLSContext(c, async () => {
      return UserService.list({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    });
    
    return c.json({
      users: result.users,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    });
  }
);

// Admin-only: Get specific user
users.get(
  '/:userId',
  authMiddleware(),
  adminOnlyMiddleware(),
  async (c) => {
    const userId = c.req.param('userId');
    
    const user = await withRLSContext(c, async () => {
      return UserService.findById(userId);
    });
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({ user });
  }
);

// Admin-only: Test user access permissions
users.get(
  '/:userId/permissions',
  authMiddleware(),
  adminOnlyMiddleware(),
  async (c) => {
    const userId = c.req.param('userId');
    
    // Test what this user can access
    const accessTest = await SecurityService.testUserAccess(userId, {
      tables: ['users', 'sessions', 'api_keys', 'audit_logs'],
      operations: ['SELECT', 'UPDATE', 'DELETE'],
    });
    
    return c.json({
      userId: accessTest.userId,
      role: accessTest.role,
      permissions: accessTest.results,
    });
  }
);

// Admin-only: Get security audit trail for a user
users.get(
  '/:userId/audit',
  authMiddleware(),
  adminOnlyMiddleware(),
  async (c) => {
    const userId = c.req.param('userId');
    const limit = parseInt(c.req.query('limit') || '50');
    
    const auditTrail = await SecurityService.getUserSecurityAudit(userId, {
      limit,
    });
    
    return c.json({
      userId,
      auditEvents: auditTrail,
    });
  }
);

export { users as usersRoutes };