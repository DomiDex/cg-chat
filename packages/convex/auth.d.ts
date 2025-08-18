export declare const createSession: import("convex/server").RegisteredMutation<"public", {
    userAgent?: string | undefined;
    ipAddress?: string | undefined;
    userId: import("convex/values").GenericId<"users">;
}, Promise<{
    sessionId: import("convex/values").GenericId<"sessions">;
    token: string;
    refreshToken: string;
    expiresAt: number;
    refreshExpiresAt: number;
}>>;
export declare const validateSession: import("convex/server").RegisteredQuery<"public", {
    token: string;
}, Promise<{
    valid: boolean;
    reason: string;
    session?: undefined;
    user?: undefined;
} | {
    valid: boolean;
    session: {
        _id: import("convex/values").GenericId<"sessions">;
        _creationTime: number;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
        createdAt: number;
        userId: import("convex/values").GenericId<"users">;
        token: string;
        refreshToken: string;
        expiresAt: number;
        refreshExpiresAt: number;
        lastActivity: number;
    };
    user: {
        _id: import("convex/values").GenericId<"users">;
        _creationTime: number;
        passwordHash?: string | undefined;
        verificationToken?: string | undefined;
        verificationExpiry?: number | undefined;
        name?: string | undefined;
        status?: "active" | "inactive" | "suspended" | "deleted" | undefined;
        customerId?: string | undefined;
        profile?: {
            firstName?: string | undefined;
            lastName?: string | undefined;
            phone?: string | undefined;
            avatar?: string | undefined;
            company?: string | undefined;
            address?: string | undefined;
        } | undefined;
        preferences?: {
            notifications: boolean;
            language: string;
            timezone: string;
        } | undefined;
        metadata?: any;
        loginAttempts?: {
            success: boolean;
            ip: string;
            timestamp: number;
        }[] | undefined;
        lastLoginAt?: number | undefined;
        lastActive?: number | undefined;
        subscription?: {
            tier: "free" | "pro" | "enterprise";
            validUntil: number;
            features: string[];
        } | undefined;
        email: string;
        emailVerified: boolean;
        role: "user" | "admin" | "agent";
        createdAt: number;
        updatedAt: number;
    };
    reason?: undefined;
}>>;
export declare const refreshSession: import("convex/server").RegisteredMutation<"public", {
    refreshToken: string;
}, Promise<{
    token: string;
    refreshToken: string;
    expiresAt: number;
    refreshExpiresAt: number;
}>>;
export declare const updateSessionActivity: import("convex/server").RegisteredMutation<"public", {
    sessionId: import("convex/values").GenericId<"sessions">;
}, Promise<void>>;
export declare const logout: import("convex/server").RegisteredMutation<"public", {
    token: string;
}, Promise<{
    success: boolean;
}>>;
export declare const cleanExpiredSessions: import("convex/server").RegisteredMutation<"public", {}, Promise<{
    deleted: number;
}>>;
export declare const getUserSessions: import("convex/server").RegisteredQuery<"public", {
    userId: import("convex/values").GenericId<"users">;
}, Promise<{
    _id: import("convex/values").GenericId<"sessions">;
    _creationTime: number;
    userAgent?: string | undefined;
    ipAddress?: string | undefined;
    createdAt: number;
    userId: import("convex/values").GenericId<"users">;
    token: string;
    refreshToken: string;
    expiresAt: number;
    refreshExpiresAt: number;
    lastActivity: number;
}[]>>;
export declare const revokeAllUserSessions: import("convex/server").RegisteredMutation<"public", {
    userId: import("convex/values").GenericId<"users">;
}, Promise<{
    revoked: number;
}>>;
export declare const login: import("convex/server").RegisteredAction<"public", {
    verificationCode?: string | undefined;
    email: string;
}, Promise<{
    success: boolean;
    requiresVerification: boolean;
    message?: string;
    session?: {
        token: string;
        refreshToken: string;
        expiresAt: number;
        refreshExpiresAt: number;
    };
}>>;
export declare const internalGetUserByEmail: import("convex/server").RegisteredQuery<"internal", {
    email: string;
}, Promise<{
    _id: import("convex/values").GenericId<"users">;
    _creationTime: number;
    passwordHash?: string | undefined;
    verificationToken?: string | undefined;
    verificationExpiry?: number | undefined;
    name?: string | undefined;
    status?: "active" | "inactive" | "suspended" | "deleted" | undefined;
    customerId?: string | undefined;
    profile?: {
        firstName?: string | undefined;
        lastName?: string | undefined;
        phone?: string | undefined;
        avatar?: string | undefined;
        company?: string | undefined;
        address?: string | undefined;
    } | undefined;
    preferences?: {
        notifications: boolean;
        language: string;
        timezone: string;
    } | undefined;
    metadata?: any;
    loginAttempts?: {
        success: boolean;
        ip: string;
        timestamp: number;
    }[] | undefined;
    lastLoginAt?: number | undefined;
    lastActive?: number | undefined;
    subscription?: {
        tier: "free" | "pro" | "enterprise";
        validUntil: number;
        features: string[];
    } | undefined;
    email: string;
    emailVerified: boolean;
    role: "user" | "admin" | "agent";
    createdAt: number;
    updatedAt: number;
} | null>>;
export declare const internalCreateUser: import("convex/server").RegisteredMutation<"internal", {
    email: string;
}, Promise<import("convex/values").GenericId<"users">>>;
export declare const internalCreateSession: import("convex/server").RegisteredMutation<"internal", {
    userId: import("convex/values").GenericId<"users">;
}, Promise<{
    token: string;
    refreshToken: string;
    expiresAt: number;
    refreshExpiresAt: number;
}>>;
//# sourceMappingURL=auth.d.ts.map