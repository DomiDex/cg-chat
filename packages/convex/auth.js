import { v } from 'convex/values';
import { mutation, query, action, internalMutation, internalQuery } from './_generated/server';
import { internal } from './_generated/api';
// Create a new session
export const createSession = mutation({
    args: {
        userId: v.id('users'),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Generate tokens
        const token = generateToken();
        const refreshToken = generateToken();
        // Set expiration times
        const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
        const refreshExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
        const sessionId = await ctx.db.insert('sessions', {
            userId: args.userId,
            token,
            refreshToken,
            expiresAt,
            refreshExpiresAt,
            ipAddress: args.ipAddress,
            userAgent: args.userAgent,
            lastActivity: Date.now(),
            createdAt: Date.now(),
        });
        return {
            sessionId,
            token,
            refreshToken,
            expiresAt,
            refreshExpiresAt,
        };
    },
});
// Validate session
export const validateSession = query({
    args: {
        token: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query('sessions')
            .withIndex('by_token', (q) => q.eq('token', args.token))
            .first();
        if (!session) {
            return { valid: false, reason: 'Session not found' };
        }
        if (session.expiresAt < Date.now()) {
            return { valid: false, reason: 'Session expired' };
        }
        const user = await ctx.db.get(session.userId);
        if (!user) {
            return { valid: false, reason: 'User not found' };
        }
        return {
            valid: true,
            session,
            user,
        };
    },
});
// Refresh session
export const refreshSession = mutation({
    args: {
        refreshToken: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query('sessions')
            .withIndex('by_refresh_token', (q) => q.eq('refreshToken', args.refreshToken))
            .first();
        if (!session) {
            throw new Error('Invalid refresh token');
        }
        if (session.refreshExpiresAt < Date.now()) {
            throw new Error('Refresh token expired');
        }
        // Generate new tokens
        const newToken = generateToken();
        const newRefreshToken = generateToken();
        const newExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
        const newRefreshExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
        await ctx.db.patch(session._id, {
            token: newToken,
            refreshToken: newRefreshToken,
            expiresAt: newExpiresAt,
            refreshExpiresAt: newRefreshExpiresAt,
            lastActivity: Date.now(),
        });
        return {
            token: newToken,
            refreshToken: newRefreshToken,
            expiresAt: newExpiresAt,
            refreshExpiresAt: newRefreshExpiresAt,
        };
    },
});
// Update session activity
export const updateSessionActivity = mutation({
    args: {
        sessionId: v.id('sessions'),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.sessionId, {
            lastActivity: Date.now(),
        });
    },
});
// Logout (delete session)
export const logout = mutation({
    args: {
        token: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query('sessions')
            .withIndex('by_token', (q) => q.eq('token', args.token))
            .first();
        if (session) {
            await ctx.db.delete(session._id);
        }
        return { success: true };
    },
});
// Clean expired sessions
export const cleanExpiredSessions = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const expiredSessions = await ctx.db
            .query('sessions')
            .withIndex('by_expires', (q) => q.lt('expiresAt', now))
            .collect();
        let deleted = 0;
        for (const session of expiredSessions) {
            if (session.refreshExpiresAt < now) {
                await ctx.db.delete(session._id);
                deleted++;
            }
        }
        return { deleted };
    },
});
// Get active sessions for user
export const getUserSessions = query({
    args: {
        userId: v.id('users'),
    },
    handler: async (ctx, args) => {
        const sessions = await ctx.db
            .query('sessions')
            .withIndex('by_user', (q) => q.eq('userId', args.userId))
            .collect();
        const now = Date.now();
        // Filter to only active sessions
        return sessions.filter((s) => s.expiresAt > now || s.refreshExpiresAt > now);
    },
});
// Revoke all sessions for user
export const revokeAllUserSessions = mutation({
    args: {
        userId: v.id('users'),
    },
    handler: async (ctx, args) => {
        const sessions = await ctx.db
            .query('sessions')
            .withIndex('by_user', (q) => q.eq('userId', args.userId))
            .collect();
        let revoked = 0;
        for (const session of sessions) {
            await ctx.db.delete(session._id);
            revoked++;
        }
        return { revoked };
    },
});
// Login action (with email verification)
export const login = action({
    args: {
        email: v.string(),
        verificationCode: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // This would typically send an email with a verification code
        // For now, we'll just return a mock response
        // Direct database query instead of using internal reference
        const user = await ctx.runQuery(internal.auth.internalGetUserByEmail, {
            email: args.email,
        });
        if (!user) {
            // Create new user if doesn't exist
            await ctx.runMutation(internal.auth.internalCreateUser, {
                email: args.email,
            });
            // Send verification email (mock)
            return {
                success: true,
                requiresVerification: true,
                message: 'Verification code sent to email',
            };
        }
        if (!user.emailVerified) {
            // Send verification email (mock)
            return {
                success: true,
                requiresVerification: true,
                message: 'Verification code sent to email',
            };
        }
        // Create session
        const session = await ctx.runMutation(internal.auth.internalCreateSession, {
            userId: user._id,
        });
        return {
            success: true,
            requiresVerification: false,
            session,
        };
    },
});
// Helper function to generate secure random token
function generateToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${token}_${Date.now().toString(36)}`;
}
// Internal functions for auth flow
export const internalGetUserByEmail = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('users')
            .withIndex('by_email', (q) => q.eq('email', args.email))
            .first();
    },
});
export const internalCreateUser = internalMutation({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert('users', {
            email: args.email,
            emailVerified: false,
            role: 'user',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});
export const internalCreateSession = internalMutation({
    args: {
        userId: v.id('users'),
    },
    handler: async (ctx, args) => {
        const token = generateToken();
        const refreshToken = generateToken();
        const expiresAt = Date.now() + 60 * 60 * 1000;
        const refreshExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
        await ctx.db.insert('sessions', {
            userId: args.userId,
            token,
            refreshToken,
            expiresAt,
            refreshExpiresAt,
            lastActivity: Date.now(),
            createdAt: Date.now(),
        });
        return { token, refreshToken, expiresAt, refreshExpiresAt };
    },
});
//# sourceMappingURL=auth.js.map