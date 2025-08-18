export declare const createConversation: import("convex/server").RegisteredMutation<"public", {
    metadata?: {
        source?: string | undefined;
        referrer?: string | undefined;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    } | undefined;
    title?: string | undefined;
    userId: import("convex/values").GenericId<"users">;
    channel: "email" | "web" | "whatsapp" | "api";
}, Promise<import("convex/values").GenericId<"conversations">>>;
export declare const getUserConversations: import("convex/server").RegisteredQuery<"public", {
    status?: "active" | "archived" | "resolved" | "escalated" | undefined;
    userId: import("convex/values").GenericId<"users">;
}, Promise<{
    _id: import("convex/values").GenericId<"conversations">;
    _creationTime: number;
    metadata?: {
        source?: string | undefined;
        referrer?: string | undefined;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    } | undefined;
    title?: string | undefined;
    agentId?: import("convex/values").GenericId<"agents"> | undefined;
    context?: {
        category?: string | undefined;
        product?: string | undefined;
        issue?: string | undefined;
    } | undefined;
    workflowId?: import("convex/values").GenericId<"workflows"> | undefined;
    resolvedAt?: number | undefined;
    lastMessageAt?: number | undefined;
    status: "active" | "archived" | "resolved" | "escalated";
    createdAt: number;
    updatedAt: number;
    userId: import("convex/values").GenericId<"users">;
    priority: "low" | "medium" | "high" | "urgent";
    channel: "email" | "web" | "whatsapp" | "api";
    tags: string[];
}[]>>;
export declare const getConversation: import("convex/server").RegisteredQuery<"public", {
    conversationId: import("convex/values").GenericId<"conversations">;
}, Promise<{
    _id: import("convex/values").GenericId<"conversations">;
    _creationTime: number;
    metadata?: {
        source?: string | undefined;
        referrer?: string | undefined;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    } | undefined;
    title?: string | undefined;
    agentId?: import("convex/values").GenericId<"agents"> | undefined;
    context?: {
        category?: string | undefined;
        product?: string | undefined;
        issue?: string | undefined;
    } | undefined;
    workflowId?: import("convex/values").GenericId<"workflows"> | undefined;
    resolvedAt?: number | undefined;
    lastMessageAt?: number | undefined;
    status: "active" | "archived" | "resolved" | "escalated";
    createdAt: number;
    updatedAt: number;
    userId: import("convex/values").GenericId<"users">;
    priority: "low" | "medium" | "high" | "urgent";
    channel: "email" | "web" | "whatsapp" | "api";
    tags: string[];
} | null>>;
export declare const updateConversation: import("convex/server").RegisteredMutation<"public", {
    conversationId: import("convex/values").GenericId<"conversations">;
    updates: {
        status?: "active" | "archived" | "resolved" | "escalated" | undefined;
        title?: string | undefined;
        priority?: "low" | "medium" | "high" | "urgent" | undefined;
        agentId?: import("convex/values").GenericId<"agents"> | undefined;
        tags?: string[] | undefined;
    };
}, Promise<{
    _id: import("convex/values").GenericId<"conversations">;
    _creationTime: number;
    metadata?: {
        source?: string | undefined;
        referrer?: string | undefined;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    } | undefined;
    title?: string | undefined;
    agentId?: import("convex/values").GenericId<"agents"> | undefined;
    context?: {
        category?: string | undefined;
        product?: string | undefined;
        issue?: string | undefined;
    } | undefined;
    workflowId?: import("convex/values").GenericId<"workflows"> | undefined;
    resolvedAt?: number | undefined;
    lastMessageAt?: number | undefined;
    status: "active" | "archived" | "resolved" | "escalated";
    createdAt: number;
    updatedAt: number;
    userId: import("convex/values").GenericId<"users">;
    priority: "low" | "medium" | "high" | "urgent";
    channel: "email" | "web" | "whatsapp" | "api";
    tags: string[];
} | null>>;
export declare const archiveConversation: import("convex/server").RegisteredMutation<"public", {
    conversationId: import("convex/values").GenericId<"conversations">;
}, Promise<{
    success: boolean;
}>>;
export declare const escalateConversation: import("convex/server").RegisteredMutation<"public", {
    priority?: "low" | "medium" | "high" | "urgent" | undefined;
    reason?: string | undefined;
    conversationId: import("convex/values").GenericId<"conversations">;
}, Promise<{
    success: boolean;
}>>;
export declare const searchConversations: import("convex/server").RegisteredQuery<"public", {
    status?: "active" | "archived" | "resolved" | "escalated" | undefined;
    channel?: "email" | "web" | "whatsapp" | "api" | undefined;
    limit?: number | undefined;
    searchTerm?: string | undefined;
    startDate?: number | undefined;
    endDate?: number | undefined;
}, Promise<{
    _id: import("convex/values").GenericId<"conversations">;
    _creationTime: number;
    metadata?: {
        source?: string | undefined;
        referrer?: string | undefined;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    } | undefined;
    title?: string | undefined;
    agentId?: import("convex/values").GenericId<"agents"> | undefined;
    context?: {
        category?: string | undefined;
        product?: string | undefined;
        issue?: string | undefined;
    } | undefined;
    workflowId?: import("convex/values").GenericId<"workflows"> | undefined;
    resolvedAt?: number | undefined;
    lastMessageAt?: number | undefined;
    status: "active" | "archived" | "resolved" | "escalated";
    createdAt: number;
    updatedAt: number;
    userId: import("convex/values").GenericId<"users">;
    priority: "low" | "medium" | "high" | "urgent";
    channel: "email" | "web" | "whatsapp" | "api";
    tags: string[];
}[]>>;
export declare const getConversationStats: import("convex/server").RegisteredQuery<"public", {
    userId?: import("convex/values").GenericId<"users"> | undefined;
    agentId?: import("convex/values").GenericId<"agents"> | undefined;
    startDate?: number | undefined;
    endDate?: number | undefined;
}, Promise<{
    total: number;
    active: number;
    resolved: number;
    escalated: number;
    archived: number;
    byChannel: {
        web: number;
        whatsapp: number;
        email: number;
        api: number;
    };
    byPriority: {
        low: number;
        medium: number;
        high: number;
        urgent: number;
    };
    avgResolutionTime: number;
}>>;
export declare const deleteConversation: import("convex/server").RegisteredMutation<"public", {
    conversationId: import("convex/values").GenericId<"conversations">;
}, Promise<{
    success: boolean;
}>>;
export declare const getActiveWhatsAppConversation: import("convex/server").RegisteredQuery<"public", {
    userId: import("convex/values").GenericId<"users">;
    phoneNumber: string;
}, Promise<{
    _id: import("convex/values").GenericId<"conversations">;
    _creationTime: number;
    metadata?: {
        source?: string | undefined;
        referrer?: string | undefined;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    } | undefined;
    title?: string | undefined;
    agentId?: import("convex/values").GenericId<"agents"> | undefined;
    context?: {
        category?: string | undefined;
        product?: string | undefined;
        issue?: string | undefined;
    } | undefined;
    workflowId?: import("convex/values").GenericId<"workflows"> | undefined;
    resolvedAt?: number | undefined;
    lastMessageAt?: number | undefined;
    status: "active" | "archived" | "resolved" | "escalated";
    createdAt: number;
    updatedAt: number;
    userId: import("convex/values").GenericId<"users">;
    priority: "low" | "medium" | "high" | "urgent";
    channel: "email" | "web" | "whatsapp" | "api";
    tags: string[];
} | null>>;
//# sourceMappingURL=conversations.d.ts.map