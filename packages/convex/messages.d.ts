export declare const sendMessage: import("convex/server").RegisteredMutation<"public", {
    metadata?: {
        model?: string | undefined;
        tokens?: {
            prompt: number;
            completion: number;
            total: number;
        } | undefined;
        latency?: number | undefined;
        cost?: number | undefined;
        toolCalls?: {
            function?: {
                name: string;
                arguments: string;
            } | undefined;
            id: string;
            type: string;
        }[] | undefined;
        citations?: string[] | undefined;
    } | undefined;
    attachments?: {
        name: string;
        type: string;
        url: string;
        size: number;
    }[] | undefined;
    role: "user" | "assistant" | "system" | "tool";
    conversationId: import("convex/values").GenericId<"conversations">;
    content: string;
}, Promise<import("convex/values").GenericId<"messages">>>;
export declare const getMessages: import("convex/server").RegisteredQuery<"public", {
    limit?: number | undefined;
    beforeTimestamp?: number | undefined;
    conversationId: import("convex/values").GenericId<"conversations">;
}, Promise<{
    _id: import("convex/values").GenericId<"messages">;
    _creationTime: number;
    metadata?: {
        model?: string | undefined;
        tokens?: {
            prompt: number;
            completion: number;
            total: number;
        } | undefined;
        latency?: number | undefined;
        cost?: number | undefined;
        toolCalls?: any[] | undefined;
        citations?: string[] | undefined;
    } | undefined;
    attachments?: {
        name: string;
        type: string;
        url: string;
        size: number;
    }[] | undefined;
    agentMetadata?: {
        intent?: string | undefined;
        sentiment?: string | undefined;
        agentId: import("convex/values").GenericId<"agents">;
        agentName: string;
        confidence: number;
    } | undefined;
    editedAt?: number | undefined;
    deletedAt?: number | undefined;
    role: "user" | "assistant" | "system" | "tool";
    createdAt: number;
    conversationId: import("convex/values").GenericId<"conversations">;
    content: string;
}[]>>;
export declare const subscribeToMessages: import("convex/server").RegisteredQuery<"public", {
    afterTimestamp?: number | undefined;
    conversationId: import("convex/values").GenericId<"conversations">;
}, Promise<{
    _id: import("convex/values").GenericId<"messages">;
    _creationTime: number;
    metadata?: {
        model?: string | undefined;
        tokens?: {
            prompt: number;
            completion: number;
            total: number;
        } | undefined;
        latency?: number | undefined;
        cost?: number | undefined;
        toolCalls?: any[] | undefined;
        citations?: string[] | undefined;
    } | undefined;
    attachments?: {
        name: string;
        type: string;
        url: string;
        size: number;
    }[] | undefined;
    agentMetadata?: {
        intent?: string | undefined;
        sentiment?: string | undefined;
        agentId: import("convex/values").GenericId<"agents">;
        agentName: string;
        confidence: number;
    } | undefined;
    editedAt?: number | undefined;
    deletedAt?: number | undefined;
    role: "user" | "assistant" | "system" | "tool";
    createdAt: number;
    conversationId: import("convex/values").GenericId<"conversations">;
    content: string;
}[]>>;
export declare const editMessage: import("convex/server").RegisteredMutation<"public", {
    content: string;
    messageId: import("convex/values").GenericId<"messages">;
}, Promise<{
    success: boolean;
}>>;
export declare const deleteMessage: import("convex/server").RegisteredMutation<"public", {
    messageId: import("convex/values").GenericId<"messages">;
}, Promise<{
    success: boolean;
}>>;
export declare const sendAgentMessage: import("convex/server").RegisteredMutation<"public", {
    metadata?: {
        model?: string | undefined;
        tokens?: {
            prompt: number;
            completion: number;
            total: number;
        } | undefined;
        latency?: number | undefined;
        cost?: number | undefined;
        toolCalls?: {
            function?: {
                name: string;
                arguments: string;
            } | undefined;
            id: string;
            type: string;
        }[] | undefined;
        citations?: string[] | undefined;
    } | undefined;
    intent?: string | undefined;
    sentiment?: string | undefined;
    agentId: import("convex/values").GenericId<"agents">;
    conversationId: import("convex/values").GenericId<"conversations">;
    content: string;
    agentName: string;
    confidence: number;
}, Promise<import("convex/values").GenericId<"messages">>>;
export declare const getMessageStats: import("convex/server").RegisteredQuery<"public", {
    conversationId: import("convex/values").GenericId<"conversations">;
}, Promise<{
    total: number;
    byRole: {
        user: number;
        assistant: number;
        system: number;
        tool: number;
    };
    withAttachments: number;
    edited: number;
    deleted: number;
    totalTokens: number;
    totalCost: number;
}>>;
export declare const searchMessages: import("convex/server").RegisteredQuery<"public", {
    role?: "user" | "assistant" | "system" | "tool" | undefined;
    conversationId?: import("convex/values").GenericId<"conversations"> | undefined;
    limit?: number | undefined;
    searchTerm: string;
}, Promise<{
    _id: import("convex/values").GenericId<"messages">;
    _creationTime: number;
    metadata?: {
        model?: string | undefined;
        tokens?: {
            prompt: number;
            completion: number;
            total: number;
        } | undefined;
        latency?: number | undefined;
        cost?: number | undefined;
        toolCalls?: any[] | undefined;
        citations?: string[] | undefined;
    } | undefined;
    attachments?: {
        name: string;
        type: string;
        url: string;
        size: number;
    }[] | undefined;
    agentMetadata?: {
        intent?: string | undefined;
        sentiment?: string | undefined;
        agentId: import("convex/values").GenericId<"agents">;
        agentName: string;
        confidence: number;
    } | undefined;
    editedAt?: number | undefined;
    deletedAt?: number | undefined;
    role: "user" | "assistant" | "system" | "tool";
    createdAt: number;
    conversationId: import("convex/values").GenericId<"conversations">;
    content: string;
}[]>>;
export declare const addToolCallMessage: import("convex/server").RegisteredMutation<"public", {
    duration?: number | undefined;
    conversationId: import("convex/values").GenericId<"conversations">;
    toolName: string;
    toolInput: any;
    toolOutput: any;
}, Promise<import("convex/values").GenericId<"messages">>>;
export declare const getLatestMessage: import("convex/server").RegisteredQuery<"public", {
    conversationId: import("convex/values").GenericId<"conversations">;
}, Promise<{
    _id: import("convex/values").GenericId<"messages">;
    _creationTime: number;
    metadata?: {
        model?: string | undefined;
        tokens?: {
            prompt: number;
            completion: number;
            total: number;
        } | undefined;
        latency?: number | undefined;
        cost?: number | undefined;
        toolCalls?: any[] | undefined;
        citations?: string[] | undefined;
    } | undefined;
    attachments?: {
        name: string;
        type: string;
        url: string;
        size: number;
    }[] | undefined;
    agentMetadata?: {
        intent?: string | undefined;
        sentiment?: string | undefined;
        agentId: import("convex/values").GenericId<"agents">;
        agentName: string;
        confidence: number;
    } | undefined;
    editedAt?: number | undefined;
    deletedAt?: number | undefined;
    role: "user" | "assistant" | "system" | "tool";
    createdAt: number;
    conversationId: import("convex/values").GenericId<"conversations">;
    content: string;
} | null>>;
export declare const getMessage: import("convex/server").RegisteredQuery<"public", {
    messageId: import("convex/values").GenericId<"messages">;
}, Promise<{
    _id: import("convex/values").GenericId<"messages">;
    _creationTime: number;
    metadata?: {
        model?: string | undefined;
        tokens?: {
            prompt: number;
            completion: number;
            total: number;
        } | undefined;
        latency?: number | undefined;
        cost?: number | undefined;
        toolCalls?: any[] | undefined;
        citations?: string[] | undefined;
    } | undefined;
    attachments?: {
        name: string;
        type: string;
        url: string;
        size: number;
    }[] | undefined;
    agentMetadata?: {
        intent?: string | undefined;
        sentiment?: string | undefined;
        agentId: import("convex/values").GenericId<"agents">;
        agentName: string;
        confidence: number;
    } | undefined;
    editedAt?: number | undefined;
    deletedAt?: number | undefined;
    role: "user" | "assistant" | "system" | "tool";
    createdAt: number;
    conversationId: import("convex/values").GenericId<"conversations">;
    content: string;
} | null>>;
//# sourceMappingURL=messages.d.ts.map