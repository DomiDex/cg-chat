import { Hono } from 'hono';
import { z } from 'zod';
import { convexClient } from '../index.js';
import { api } from '../../../../packages/convex/_generated/api.js';
import type { Id } from '../../../../packages/convex/_generated/dataModel.js';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} from '../middleware/auth-simple.js';
import { 
  validateBody,
  emailSchema,
  passwordSchema 
} from '../middleware/validation.js';
import { 
  UnauthorizedError, 
  ConflictError
} from '../middleware/error.js';

export const authRoutes = new Hono();

// Simple login schema (for demo purposes - no real password checking)
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

// Simple register schema
const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1).max(100),
  acceptTerms: z.boolean(),
});

// Simple demo login endpoint (no real auth)
authRoutes.post(
  '/login',
  validateBody(loginSchema),
  async (c) => {
    const { email } = c.get('validated') as z.infer<typeof loginSchema>;

    // Get user by email
    const user = await convexClient.query(api.users.getUserByEmail, { email });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // For demo purposes, we'll skip password verification
    // In production, you'd need to add password fields to Convex schema

    // Generate tokens
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role as 'user' | 'admin' | 'agent',
      sessionId: crypto.randomUUID(),
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return c.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900,
      },
    });
  }
);

// Simple demo register endpoint
authRoutes.post(
  '/register',
  validateBody(registerSchema),
  async (c) => {
    const data = c.get('validated') as z.infer<typeof registerSchema>;

    // Check if user exists
    const existingUser = await convexClient.query(api.users.getUserByEmail, {
      email: data.email,
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Create user (without password for now)
    const userId = await convexClient.mutation(api.users.createUser, {
      email: data.email,
      name: data.name,
    });

    return c.json({
      success: true,
      message: 'Registration successful',
      userId,
    });
  }
);

// Refresh token endpoint
authRoutes.post(
  '/refresh',
  validateBody(z.object({ refreshToken: z.string() })),
  async (c) => {
    const { refreshToken } = c.get('validated') as { refreshToken: string };

    const { userId } = verifyRefreshToken(refreshToken);

    // Get user
    const user = await convexClient.query(api.users.getUser, { 
      userId: userId as Id<'users'>
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Generate new access token
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role as 'user' | 'admin' | 'agent',
    };

    const accessToken = generateAccessToken(payload);

    return c.json({
      success: true,
      accessToken,
      expiresIn: 900,
    });
  }
);

// Simple logout endpoint
authRoutes.post('/logout', async (c) => {
  return c.json({
    success: true,
    message: 'Logged out successfully',
  });
});