export declare const createUser: import("convex/server").RegisteredMutation<"public", {
    name?: string | undefined;
    customerId?: string | undefined;
    email: string;
}, Promise<import("convex/values").GenericId<"users">>>;
export declare const getUserByEmail: import("convex/server").RegisteredQuery<"public", {
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
export declare const getUserById: import("convex/server").RegisteredQuery<"public", {
    userId: import("convex/values").GenericId<"users">;
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
export declare const updateUser: import("convex/server").RegisteredMutation<"public", {
    userId: import("convex/values").GenericId<"users">;
    updates: {
        emailVerified?: boolean | undefined;
        name?: string | undefined;
        preferences?: any;
        metadata?: any;
    };
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
export declare const verifyEmail: import("convex/server").RegisteredMutation<"public", {
    token: string;
}, Promise<{
    success: boolean;
    userId: import("convex/values").GenericId<"users">;
}>>;
export declare const generateVerificationToken: import("convex/server").RegisteredMutation<"public", {
    userId: import("convex/values").GenericId<"users">;
}, Promise<{
    token: string;
    expiry: number;
}>>;
export declare const listUsers: import("convex/server").RegisteredQuery<"public", {
    role?: "user" | "admin" | "agent" | undefined;
    limit?: number | undefined;
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
}[]>>;
export declare const updateLastActive: import("convex/server").RegisteredMutation<"public", {
    userId: import("convex/values").GenericId<"users">;
}, Promise<void>>;
export declare const deleteUser: import("convex/server").RegisteredMutation<"public", {
    userId: import("convex/values").GenericId<"users">;
}, Promise<{
    success: boolean;
}>>;
export declare const getUser: import("convex/server").RegisteredQuery<"public", {
    userId: import("convex/values").GenericId<"users">;
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
export declare const getUserByPhone: import("convex/server").RegisteredQuery<"public", {
    phone: string;
}, Promise<null>>;
export declare const getUserCount: import("convex/server").RegisteredQuery<"public", {}, Promise<number>>;
export declare const trackLoginAttempt: import("convex/server").RegisteredMutation<"public", {
    success: boolean;
    ip: string;
    userId: import("convex/values").GenericId<"users">;
}, Promise<void>>;
export declare const createSession: import("convex/server").RegisteredMutation<"public", {
    ip: string;
    userId: import("convex/values").GenericId<"users">;
    userAgent: string;
    expiresAt: number;
    sessionId: string;
}, Promise<void>>;
export declare const getSession: import("convex/server").RegisteredQuery<"public", {
    sessionId: string;
}, Promise<null>>;
export declare const invalidateSession: import("convex/server").RegisteredMutation<"public", {
    sessionId: string;
}, Promise<void>>;
export declare const createVerificationToken: import("convex/server").RegisteredMutation<"public", {
    type: "email" | "password";
    userId: import("convex/values").GenericId<"users">;
    token: string;
    expiresAt: number;
}, Promise<void>>;
//# sourceMappingURL=users.d.ts.map