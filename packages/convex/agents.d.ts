export declare const createAgent: import("convex/server").RegisteredMutation<"public", {
    name: string;
    type: "chat" | "support" | "technical" | "sales" | "escalation";
    capabilities: string[];
    tools: string[];
    modelConfig: {
        model: string;
        provider: string;
        temperature: number;
        maxTokens: number;
        systemPrompt: string;
    };
}, Promise<import("convex/values").GenericId<"agents">>>;
export declare const getAgents: import("convex/server").RegisteredQuery<"public", {
    type?: "chat" | "support" | "technical" | "sales" | "escalation" | undefined;
    status?: "active" | "inactive" | undefined;
}, Promise<{
    _id: import("convex/values").GenericId<"agents">;
    _creationTime: number;
    specialization?: {
        products: string[];
        categories: string[];
        languages: string[];
    } | undefined;
    metrics?: {
        totalConversations: number;
        avgResponseTime: number;
        avgSatisfaction: number;
        escalationRate: number;
    } | undefined;
    name: string;
    type: "chat" | "support" | "technical" | "sales" | "escalation";
    status: "active" | "inactive";
    createdAt: number;
    updatedAt: number;
    capabilities: string[];
    tools: string[];
    modelConfig: {
        model: string;
        provider: string;
        temperature: number;
        maxTokens: number;
        systemPrompt: string;
    };
}[]>>;
export declare const getAgent: import("convex/server").RegisteredQuery<"public", {
    agentId: import("convex/values").GenericId<"agents">;
}, Promise<{
    _id: import("convex/values").GenericId<"agents">;
    _creationTime: number;
    specialization?: {
        products: string[];
        categories: string[];
        languages: string[];
    } | undefined;
    metrics?: {
        totalConversations: number;
        avgResponseTime: number;
        avgSatisfaction: number;
        escalationRate: number;
    } | undefined;
    name: string;
    type: "chat" | "support" | "technical" | "sales" | "escalation";
    status: "active" | "inactive";
    createdAt: number;
    updatedAt: number;
    capabilities: string[];
    tools: string[];
    modelConfig: {
        model: string;
        provider: string;
        temperature: number;
        maxTokens: number;
        systemPrompt: string;
    };
} | null>>;
export declare const updateAgent: import("convex/server").RegisteredMutation<"public", {
    agentId: import("convex/values").GenericId<"agents">;
    updates: {
        name?: string | undefined;
        status?: "active" | "inactive" | undefined;
        capabilities?: string[] | undefined;
        tools?: string[] | undefined;
        modelConfig?: {
            model: string;
            provider: string;
            temperature: number;
            maxTokens: number;
            systemPrompt: string;
        } | undefined;
        specialization?: {
            products: string[];
            categories: string[];
            languages: string[];
        } | undefined;
    };
}, Promise<{
    _id: import("convex/values").GenericId<"agents">;
    _creationTime: number;
    specialization?: {
        products: string[];
        categories: string[];
        languages: string[];
    } | undefined;
    metrics?: {
        totalConversations: number;
        avgResponseTime: number;
        avgSatisfaction: number;
        escalationRate: number;
    } | undefined;
    name: string;
    type: "chat" | "support" | "technical" | "sales" | "escalation";
    status: "active" | "inactive";
    createdAt: number;
    updatedAt: number;
    capabilities: string[];
    tools: string[];
    modelConfig: {
        model: string;
        provider: string;
        temperature: number;
        maxTokens: number;
        systemPrompt: string;
    };
} | null>>;
export declare const updateAgentMetrics: import("convex/server").RegisteredMutation<"public", {
    satisfaction?: number | undefined;
    escalated: boolean;
    agentId: import("convex/values").GenericId<"agents">;
    conversationId: import("convex/values").GenericId<"conversations">;
    responseTime: number;
}, Promise<void>>;
export declare const getAvailableAgent: import("convex/server").RegisteredQuery<"public", {
    language?: string | undefined;
    category?: string | undefined;
    type: "chat" | "support" | "technical" | "sales" | "escalation";
}, Promise<{
    _id: import("convex/values").GenericId<"agents">;
    _creationTime: number;
    specialization?: {
        products: string[];
        categories: string[];
        languages: string[];
    } | undefined;
    metrics?: {
        totalConversations: number;
        avgResponseTime: number;
        avgSatisfaction: number;
        escalationRate: number;
    } | undefined;
    name: string;
    type: "chat" | "support" | "technical" | "sales" | "escalation";
    status: "active" | "inactive";
    createdAt: number;
    updatedAt: number;
    capabilities: string[];
    tools: string[];
    modelConfig: {
        model: string;
        provider: string;
        temperature: number;
        maxTokens: number;
        systemPrompt: string;
    };
} | null | undefined>>;
export declare const deleteAgent: import("convex/server").RegisteredMutation<"public", {
    agentId: import("convex/values").GenericId<"agents">;
}, Promise<{
    success: boolean;
}>>;
//# sourceMappingURL=agents.d.ts.map