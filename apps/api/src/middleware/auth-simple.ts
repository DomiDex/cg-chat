import type { MiddlewareHandler } from 'hono';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from './error.js';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'development-refresh-secret';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin' | 'agent';
  sessionId?: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m',
    issuer: 'cg-api',
    audience: 'cg-app',
  });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(
    {
      userId: payload.userId,
      sessionId: payload.sessionId,
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: '7d',
      issuer: 'cg-api',
      audience: 'cg-app',
    }
  );
};

export const verifyRefreshToken = (token: string): { userId: string; sessionId?: string } => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string; sessionId?: string };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    throw error;
  }
};

// Simple auth middleware for protected routes
export const authMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization required');
    }

    const token = authHeader.substring(7);

    try {
      const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
      
      c.set('userId', payload.userId);
      c.set('userRole', payload.role);
      c.set('auth', {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        sessionId: payload.sessionId,
        token,
      });

      return next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw error;
    }
  };
};