declare const _default: import("convex/server").SchemaDefinition<{
    users: import("convex/server").TableDefinition<import("convex/values").VObject<{
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
    }, {
        email: import("convex/values").VString<string, "required">;
        emailVerified: import("convex/values").VBoolean<boolean, "required">;
        passwordHash: import("convex/values").VString<string | undefined, "optional">;
        verificationToken: import("convex/values").VString<string | undefined, "optional">;
        verificationExpiry: import("convex/values").VFloat64<number | undefined, "optional">;
        name: import("convex/values").VString<string | undefined, "optional">;
        role: import("convex/values").VUnion<"user" | "admin" | "agent", [import("convex/values").VLiteral<"user", "required">, import("convex/values").VLiteral<"admin", "required">, import("convex/values").VLiteral<"agent", "required">], "required", never>;
        status: import("convex/values").VUnion<"active" | "inactive" | "suspended" | "deleted" | undefined, [import("convex/values").VLiteral<"active", "required">, import("convex/values").VLiteral<"inactive", "required">, import("convex/values").VLiteral<"suspended", "required">, import("convex/values").VLiteral<"deleted", "required">], "optional", never>;
        customerId: import("convex/values").VString<string | undefined, "optional">;
        profile: import("convex/values").VObject<{
            firstName?: string | undefined;
            lastName?: string | undefined;
            phone?: string | undefined;
            avatar?: string | undefined;
            company?: string | undefined;
            address?: string | undefined;
        } | undefined, {
            firstName: import("convex/values").VString<string | undefined, "optional">;
            lastName: import("convex/values").VString<string | undefined, "optional">;
            phone: import("convex/values").VString<string | undefined, "optional">;
            avatar: import("convex/values").VString<string | undefined, "optional">;
            company: import("convex/values").VString<string | undefined, "optional">;
            address: import("convex/values").VString<string | undefined, "optional">;
        }, "optional", "firstName" | "lastName" | "phone" | "avatar" | "company" | "address">;
        preferences: import("convex/values").VObject<{
            notifications: boolean;
            language: string;
            timezone: string;
        } | undefined, {
            notifications: import("convex/values").VBoolean<boolean, "required">;
            language: import("convex/values").VString<string, "required">;
            timezone: import("convex/values").VString<string, "required">;
        }, "optional", "notifications" | "language" | "timezone">;
        metadata: import("convex/values").VAny<any, "optional", string>;
        loginAttempts: import("convex/values").VArray<{
            success: boolean;
            ip: string;
            timestamp: number;
        }[] | undefined, import("convex/values").VObject<{
            success: boolean;
            ip: string;
            timestamp: number;
        }, {
            success: import("convex/values").VBoolean<boolean, "required">;
            ip: import("convex/values").VString<string, "required">;
            timestamp: import("convex/values").VFloat64<number, "required">;
        }, "required", "success" | "ip" | "timestamp">, "optional">;
        lastLoginAt: import("convex/values").VFloat64<number | undefined, "optional">;
        createdAt: import("convex/values").VFloat64<number, "required">;
        updatedAt: import("convex/values").VFloat64<number, "required">;
        lastActive: import("convex/values").VFloat64<number | undefined, "optional">;
        subscription: import("convex/values").VObject<{
            tier: "free" | "pro" | "enterprise";
            validUntil: number;
            features: string[];
        } | undefined, {
            tier: import("convex/values").VUnion<"free" | "pro" | "enterprise", [import("convex/values").VLiteral<"free", "required">, import("convex/values").VLiteral<"pro", "required">, import("convex/values").VLiteral<"enterprise", "required">], "required", never>;
            validUntil: import("convex/values").VFloat64<number, "required">;
            features: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
        }, "optional", "tier" | "validUntil" | "features">;
    }, "required", "email" | "emailVerified" | "passwordHash" | "verificationToken" | "verificationExpiry" | "name" | "role" | "status" | "customerId" | "profile" | "preferences" | "metadata" | "loginAttempts" | "lastLoginAt" | "createdAt" | "updatedAt" | "lastActive" | "subscription" | "profile.firstName" | "profile.lastName" | "profile.phone" | "profile.avatar" | "profile.company" | "profile.address" | "preferences.notifications" | "preferences.language" | "preferences.timezone" | `metadata.${string}` | "subscription.tier" | "subscription.validUntil" | "subscription.features">, {
        by_email: ["email", "_creationTime"];
        by_verification_token: ["verificationToken", "_creationTime"];
        by_customer_id: ["customerId", "_creationTime"];
    }, {}, {}>;
    conversations: import("convex/server").TableDefinition<import("convex/values").VObject<{
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
    }, {
        userId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        title: import("convex/values").VString<string | undefined, "optional">;
        status: import("convex/values").VUnion<"active" | "archived" | "resolved" | "escalated", [import("convex/values").VLiteral<"active", "required">, import("convex/values").VLiteral<"archived", "required">, import("convex/values").VLiteral<"resolved", "required">, import("convex/values").VLiteral<"escalated", "required">], "required", never>;
        priority: import("convex/values").VUnion<"low" | "medium" | "high" | "urgent", [import("convex/values").VLiteral<"low", "required">, import("convex/values").VLiteral<"medium", "required">, import("convex/values").VLiteral<"high", "required">, import("convex/values").VLiteral<"urgent", "required">], "required", never>;
        agentId: import("convex/values").VId<import("convex/values").GenericId<"agents"> | undefined, "optional">;
        channel: import("convex/values").VUnion<"email" | "web" | "whatsapp" | "api", [import("convex/values").VLiteral<"web", "required">, import("convex/values").VLiteral<"whatsapp", "required">, import("convex/values").VLiteral<"email", "required">, import("convex/values").VLiteral<"api", "required">], "required", never>;
        metadata: import("convex/values").VObject<{
            source?: string | undefined;
            referrer?: string | undefined;
            userAgent?: string | undefined;
            ipAddress?: string | undefined;
        } | undefined, {
            source: import("convex/values").VString<string | undefined, "optional">;
            referrer: import("convex/values").VString<string | undefined, "optional">;
            userAgent: import("convex/values").VString<string | undefined, "optional">;
            ipAddress: import("convex/values").VString<string | undefined, "optional">;
        }, "optional", "source" | "referrer" | "userAgent" | "ipAddress">;
        context: import("convex/values").VObject<{
            category?: string | undefined;
            product?: string | undefined;
            issue?: string | undefined;
        } | undefined, {
            category: import("convex/values").VString<string | undefined, "optional">;
            product: import("convex/values").VString<string | undefined, "optional">;
            issue: import("convex/values").VString<string | undefined, "optional">;
        }, "optional", "category" | "product" | "issue">;
        workflowId: import("convex/values").VId<import("convex/values").GenericId<"workflows"> | undefined, "optional">;
        tags: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
        createdAt: import("convex/values").VFloat64<number, "required">;
        updatedAt: import("convex/values").VFloat64<number, "required">;
        resolvedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        lastMessageAt: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "status" | "metadata" | "createdAt" | "updatedAt" | "userId" | "title" | "priority" | "agentId" | "channel" | "context" | "workflowId" | "tags" | "resolvedAt" | "lastMessageAt" | "metadata.source" | "metadata.referrer" | "metadata.userAgent" | "metadata.ipAddress" | "context.category" | "context.product" | "context.issue">, {
        by_user: ["userId", "_creationTime"];
        by_status: ["status", "_creationTime"];
        by_agent: ["agentId", "_creationTime"];
        by_created: ["createdAt", "_creationTime"];
        by_user_status: ["userId", "status", "_creationTime"];
    }, {}, {}>;
    messages: import("convex/server").TableDefinition<import("convex/values").VObject<{
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
    }, {
        conversationId: import("convex/values").VId<import("convex/values").GenericId<"conversations">, "required">;
        role: import("convex/values").VUnion<"user" | "assistant" | "system" | "tool", [import("convex/values").VLiteral<"user", "required">, import("convex/values").VLiteral<"assistant", "required">, import("convex/values").VLiteral<"system", "required">, import("convex/values").VLiteral<"tool", "required">], "required", never>;
        content: import("convex/values").VString<string, "required">;
        attachments: import("convex/values").VArray<{
            name: string;
            type: string;
            url: string;
            size: number;
        }[] | undefined, import("convex/values").VObject<{
            name: string;
            type: string;
            url: string;
            size: number;
        }, {
            type: import("convex/values").VString<string, "required">;
            url: import("convex/values").VString<string, "required">;
            name: import("convex/values").VString<string, "required">;
            size: import("convex/values").VFloat64<number, "required">;
        }, "required", "name" | "type" | "url" | "size">, "optional">;
        metadata: import("convex/values").VObject<{
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
        } | undefined, {
            model: import("convex/values").VString<string | undefined, "optional">;
            tokens: import("convex/values").VObject<{
                prompt: number;
                completion: number;
                total: number;
            } | undefined, {
                prompt: import("convex/values").VFloat64<number, "required">;
                completion: import("convex/values").VFloat64<number, "required">;
                total: import("convex/values").VFloat64<number, "required">;
            }, "optional", "prompt" | "completion" | "total">;
            latency: import("convex/values").VFloat64<number | undefined, "optional">;
            cost: import("convex/values").VFloat64<number | undefined, "optional">;
            toolCalls: import("convex/values").VArray<any[] | undefined, import("convex/values").VAny<any, "required", string>, "optional">;
            citations: import("convex/values").VArray<string[] | undefined, import("convex/values").VString<string, "required">, "optional">;
        }, "optional", "model" | "tokens" | "latency" | "cost" | "toolCalls" | "citations" | "tokens.prompt" | "tokens.completion" | "tokens.total">;
        agentMetadata: import("convex/values").VObject<{
            intent?: string | undefined;
            sentiment?: string | undefined;
            agentId: import("convex/values").GenericId<"agents">;
            agentName: string;
            confidence: number;
        } | undefined, {
            agentId: import("convex/values").VId<import("convex/values").GenericId<"agents">, "required">;
            agentName: import("convex/values").VString<string, "required">;
            confidence: import("convex/values").VFloat64<number, "required">;
            intent: import("convex/values").VString<string | undefined, "optional">;
            sentiment: import("convex/values").VString<string | undefined, "optional">;
        }, "optional", "agentId" | "agentName" | "confidence" | "intent" | "sentiment">;
        editedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        deletedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        createdAt: import("convex/values").VFloat64<number, "required">;
    }, "required", "role" | "metadata" | "createdAt" | "conversationId" | "content" | "attachments" | "agentMetadata" | "editedAt" | "deletedAt" | "metadata.model" | "metadata.tokens" | "metadata.latency" | "metadata.cost" | "metadata.toolCalls" | "metadata.citations" | "metadata.tokens.prompt" | "metadata.tokens.completion" | "metadata.tokens.total" | "agentMetadata.agentId" | "agentMetadata.agentName" | "agentMetadata.confidence" | "agentMetadata.intent" | "agentMetadata.sentiment">, {
        by_conversation: ["conversationId", "_creationTime"];
        by_created: ["createdAt", "_creationTime"];
        by_conversation_created: ["conversationId", "createdAt", "_creationTime"];
    }, {}, {}>;
    agents: import("convex/server").TableDefinition<import("convex/values").VObject<{
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
    }, {
        name: import("convex/values").VString<string, "required">;
        type: import("convex/values").VUnion<"chat" | "support" | "technical" | "sales" | "escalation", [import("convex/values").VLiteral<"chat", "required">, import("convex/values").VLiteral<"support", "required">, import("convex/values").VLiteral<"technical", "required">, import("convex/values").VLiteral<"sales", "required">, import("convex/values").VLiteral<"escalation", "required">], "required", never>;
        status: import("convex/values").VUnion<"active" | "inactive", [import("convex/values").VLiteral<"active", "required">, import("convex/values").VLiteral<"inactive", "required">], "required", never>;
        capabilities: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
        tools: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
        modelConfig: import("convex/values").VObject<{
            model: string;
            provider: string;
            temperature: number;
            maxTokens: number;
            systemPrompt: string;
        }, {
            provider: import("convex/values").VString<string, "required">;
            model: import("convex/values").VString<string, "required">;
            temperature: import("convex/values").VFloat64<number, "required">;
            maxTokens: import("convex/values").VFloat64<number, "required">;
            systemPrompt: import("convex/values").VString<string, "required">;
        }, "required", "model" | "provider" | "temperature" | "maxTokens" | "systemPrompt">;
        specialization: import("convex/values").VObject<{
            products: string[];
            categories: string[];
            languages: string[];
        } | undefined, {
            products: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
            categories: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
            languages: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
        }, "optional", "products" | "categories" | "languages">;
        metrics: import("convex/values").VObject<{
            totalConversations: number;
            avgResponseTime: number;
            avgSatisfaction: number;
            escalationRate: number;
        } | undefined, {
            totalConversations: import("convex/values").VFloat64<number, "required">;
            avgResponseTime: import("convex/values").VFloat64<number, "required">;
            avgSatisfaction: import("convex/values").VFloat64<number, "required">;
            escalationRate: import("convex/values").VFloat64<number, "required">;
        }, "optional", "totalConversations" | "avgResponseTime" | "avgSatisfaction" | "escalationRate">;
        createdAt: import("convex/values").VFloat64<number, "required">;
        updatedAt: import("convex/values").VFloat64<number, "required">;
    }, "required", "name" | "type" | "status" | "createdAt" | "updatedAt" | "capabilities" | "tools" | "modelConfig" | "specialization" | "metrics" | "modelConfig.model" | "modelConfig.provider" | "modelConfig.temperature" | "modelConfig.maxTokens" | "modelConfig.systemPrompt" | "specialization.products" | "specialization.categories" | "specialization.languages" | "metrics.totalConversations" | "metrics.avgResponseTime" | "metrics.avgSatisfaction" | "metrics.escalationRate">, {
        by_type: ["type", "_creationTime"];
        by_status: ["status", "_creationTime"];
        by_name: ["name", "_creationTime"];
    }, {}, {}>;
    workflows: import("convex/server").TableDefinition<import("convex/values").VObject<{
        metadata?: any;
        output?: any;
        error?: string | undefined;
        startedAt?: number | undefined;
        completedAt?: number | undefined;
        name: string;
        type: string;
        status: "pending" | "running" | "completed" | "failed" | "cancelled";
        createdAt: number;
        input: any;
        steps: {
            error?: string | undefined;
            completedAt?: number | undefined;
            result?: any;
            name: string;
            status: string;
            startedAt: number;
        }[];
        retries: number;
    }, {
        name: import("convex/values").VString<string, "required">;
        type: import("convex/values").VString<string, "required">;
        status: import("convex/values").VUnion<"pending" | "running" | "completed" | "failed" | "cancelled", [import("convex/values").VLiteral<"pending", "required">, import("convex/values").VLiteral<"running", "required">, import("convex/values").VLiteral<"completed", "required">, import("convex/values").VLiteral<"failed", "required">, import("convex/values").VLiteral<"cancelled", "required">], "required", never>;
        input: import("convex/values").VAny<any, "required", string>;
        output: import("convex/values").VAny<any, "optional", string>;
        error: import("convex/values").VString<string | undefined, "optional">;
        steps: import("convex/values").VArray<{
            error?: string | undefined;
            completedAt?: number | undefined;
            result?: any;
            name: string;
            status: string;
            startedAt: number;
        }[], import("convex/values").VObject<{
            error?: string | undefined;
            completedAt?: number | undefined;
            result?: any;
            name: string;
            status: string;
            startedAt: number;
        }, {
            name: import("convex/values").VString<string, "required">;
            status: import("convex/values").VString<string, "required">;
            startedAt: import("convex/values").VFloat64<number, "required">;
            completedAt: import("convex/values").VFloat64<number | undefined, "optional">;
            result: import("convex/values").VAny<any, "optional", string>;
            error: import("convex/values").VString<string | undefined, "optional">;
        }, "required", "name" | "status" | "error" | "startedAt" | "completedAt" | "result" | `result.${string}`>, "required">;
        metadata: import("convex/values").VAny<any, "optional", string>;
        retries: import("convex/values").VFloat64<number, "required">;
        createdAt: import("convex/values").VFloat64<number, "required">;
        startedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        completedAt: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "name" | "type" | "status" | "metadata" | "createdAt" | `metadata.${string}` | "input" | "output" | "error" | "steps" | "startedAt" | "completedAt" | "retries" | `input.${string}` | `output.${string}`>, {
        by_type: ["type", "_creationTime"];
        by_status: ["status", "_creationTime"];
        by_created: ["createdAt", "_creationTime"];
    }, {}, {}>;
    knowledge: import("convex/server").TableDefinition<import("convex/values").VObject<{
        type: "product" | "service" | "faq" | "documentation" | "policy";
        active: boolean;
        metadata: {
            category?: string | undefined;
            url?: string | undefined;
            version?: string | undefined;
            productId?: string | undefined;
            source: string;
            tags: string[];
        };
        createdAt: number;
        updatedAt: number;
        title: string;
        content: string;
        embedding: number[];
    }, {
        type: import("convex/values").VUnion<"product" | "service" | "faq" | "documentation" | "policy", [import("convex/values").VLiteral<"product", "required">, import("convex/values").VLiteral<"service", "required">, import("convex/values").VLiteral<"faq", "required">, import("convex/values").VLiteral<"documentation", "required">, import("convex/values").VLiteral<"policy", "required">], "required", never>;
        title: import("convex/values").VString<string, "required">;
        content: import("convex/values").VString<string, "required">;
        embedding: import("convex/values").VArray<number[], import("convex/values").VFloat64<number, "required">, "required">;
        metadata: import("convex/values").VObject<{
            category?: string | undefined;
            url?: string | undefined;
            version?: string | undefined;
            productId?: string | undefined;
            source: string;
            tags: string[];
        }, {
            source: import("convex/values").VString<string, "required">;
            category: import("convex/values").VString<string | undefined, "optional">;
            tags: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
            version: import("convex/values").VString<string | undefined, "optional">;
            productId: import("convex/values").VString<string | undefined, "optional">;
            url: import("convex/values").VString<string | undefined, "optional">;
        }, "required", "source" | "category" | "tags" | "url" | "version" | "productId">;
        active: import("convex/values").VBoolean<boolean, "required">;
        createdAt: import("convex/values").VFloat64<number, "required">;
        updatedAt: import("convex/values").VFloat64<number, "required">;
    }, "required", "type" | "active" | "metadata" | "createdAt" | "updatedAt" | "title" | "metadata.source" | "content" | "embedding" | "metadata.category" | "metadata.tags" | "metadata.url" | "metadata.version" | "metadata.productId">, {
        by_type: ["type", "_creationTime"];
        by_active: ["active", "_creationTime"];
    }, {}, {
        by_embedding: {
            vectorField: "embedding";
            dimensions: number;
            filterFields: "type" | "active";
        };
    }>;
    analytics: import("convex/server").TableDefinition<import("convex/values").VObject<{
        userId?: import("convex/values").GenericId<"users"> | undefined;
        agentId?: import("convex/values").GenericId<"agents"> | undefined;
        conversationId?: import("convex/values").GenericId<"conversations"> | undefined;
        type: "user" | "agent" | "system" | "conversation" | "message";
        timestamp: number;
        event: string;
        data: any;
    }, {
        type: import("convex/values").VUnion<"user" | "agent" | "system" | "conversation" | "message", [import("convex/values").VLiteral<"conversation", "required">, import("convex/values").VLiteral<"message", "required">, import("convex/values").VLiteral<"user", "required">, import("convex/values").VLiteral<"agent", "required">, import("convex/values").VLiteral<"system", "required">], "required", never>;
        event: import("convex/values").VString<string, "required">;
        userId: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        conversationId: import("convex/values").VId<import("convex/values").GenericId<"conversations"> | undefined, "optional">;
        agentId: import("convex/values").VId<import("convex/values").GenericId<"agents"> | undefined, "optional">;
        data: import("convex/values").VAny<any, "required", string>;
        timestamp: import("convex/values").VFloat64<number, "required">;
    }, "required", "type" | "timestamp" | "userId" | "agentId" | "conversationId" | "event" | "data" | `data.${string}`>, {
        by_type: ["type", "_creationTime"];
        by_event: ["event", "_creationTime"];
        by_timestamp: ["timestamp", "_creationTime"];
        by_user: ["userId", "_creationTime"];
    }, {}, {}>;
    sessions: import("convex/server").TableDefinition<import("convex/values").VObject<{
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
        createdAt: number;
        userId: import("convex/values").GenericId<"users">;
        token: string;
        refreshToken: string;
        expiresAt: number;
        refreshExpiresAt: number;
        lastActivity: number;
    }, {
        userId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        token: import("convex/values").VString<string, "required">;
        refreshToken: import("convex/values").VString<string, "required">;
        expiresAt: import("convex/values").VFloat64<number, "required">;
        refreshExpiresAt: import("convex/values").VFloat64<number, "required">;
        ipAddress: import("convex/values").VString<string | undefined, "optional">;
        userAgent: import("convex/values").VString<string | undefined, "optional">;
        lastActivity: import("convex/values").VFloat64<number, "required">;
        createdAt: import("convex/values").VFloat64<number, "required">;
    }, "required", "createdAt" | "userId" | "userAgent" | "ipAddress" | "token" | "refreshToken" | "expiresAt" | "refreshExpiresAt" | "lastActivity">, {
        by_token: ["token", "_creationTime"];
        by_refresh_token: ["refreshToken", "_creationTime"];
        by_user: ["userId", "_creationTime"];
        by_expires: ["expiresAt", "_creationTime"];
    }, {}, {}>;
    rateLimits: import("convex/server").TableDefinition<import("convex/values").VObject<{
        type: "user" | "ip";
        identifier: string;
        endpoint: string;
        count: number;
        windowStart: number;
        windowEnd: number;
    }, {
        identifier: import("convex/values").VString<string, "required">;
        type: import("convex/values").VUnion<"user" | "ip", [import("convex/values").VLiteral<"ip", "required">, import("convex/values").VLiteral<"user", "required">], "required", never>;
        endpoint: import("convex/values").VString<string, "required">;
        count: import("convex/values").VFloat64<number, "required">;
        windowStart: import("convex/values").VFloat64<number, "required">;
        windowEnd: import("convex/values").VFloat64<number, "required">;
    }, "required", "type" | "identifier" | "endpoint" | "count" | "windowStart" | "windowEnd">, {
        by_identifier: ["identifier", "_creationTime"];
        by_window: ["windowEnd", "_creationTime"];
    }, {}, {}>;
}, true>;
export default _default;
//# sourceMappingURL=schema.d.ts.map