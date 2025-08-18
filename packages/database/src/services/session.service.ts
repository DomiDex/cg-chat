import { Session } from '@prisma/client';
import { prisma } from '../client';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export class SessionService {
  // Create session
  static async create(params: {
    userId: string;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
  }): Promise<{ session: Session; tokens: { access: string; refresh: string } }> {
    const { userId, ipAddress, userAgent, deviceId } = params;
    
    // Generate tokens
    const token = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');
    
    // Create session
    const session = await prisma.session.create({
      data: {
        userId,
        token,
        refreshToken,
        ipAddress,
        userAgent,
        deviceId,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        refreshExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
    
    // Generate JWT tokens
    const accessToken = jwt.sign(
      { sub: userId, sessionId: session.id },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
    
    const refreshJWT = jwt.sign(
      { sub: userId, sessionId: session.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
    
    return {
      session,
      tokens: {
        access: accessToken,
        refresh: refreshJWT,
      },
    };
  }
  
  // Validate session
  static async validate(token: string): Promise<Session | null> {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
    
    if (!session || session.expiresAt < new Date()) {
      return null;
    }
    
    // Update last activity
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActivity: new Date() },
    });
    
    return session;
  }
  
  // Refresh session
  static async refresh(refreshToken: string): Promise<{
    session: Session;
    accessToken: string;
  } | null> {
    const session = await prisma.session.findUnique({
      where: { refreshToken },
    });
    
    if (!session || session.refreshExpiresAt < new Date()) {
      return null;
    }
    
    // Update session
    const updatedSession = await prisma.session.update({
      where: { id: session.id },
      data: {
        token: crypto.randomBytes(32).toString('hex'),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        lastActivity: new Date(),
      },
    });
    
    // Generate new access token
    const accessToken = jwt.sign(
      { sub: session.userId, sessionId: session.id },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
    
    return {
      session: updatedSession,
      accessToken,
    };
  }
  
  // Revoke session
  static async revoke(id: string): Promise<void> {
    await prisma.session.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
  
  // Clean expired sessions
  static async cleanExpired(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { refreshExpiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    });
    
    return result.count;
  }
}