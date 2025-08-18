export declare const getConfig: import("convex/server").RegisteredAction<"public", {}, Promise<{
    openRouterApiKey: string | undefined;
    twilioAccountSid: string | undefined;
    twilioAuthToken: string | undefined;
    isDevelopment: boolean;
}>>;
export declare const healthCheck: import("convex/server").RegisteredAction<"public", {}, Promise<{
    status: string;
    timestamp: number;
    environment: string;
}>>;
export declare const getApiKeys: import("convex/server").RegisteredAction<"public", {}, Promise<{
    hasOpenRouter: boolean;
    hasTwilio: boolean;
    hasJwtSecret: boolean;
    environment: string;
}>>;
export declare const validateEnvironment: import("convex/server").RegisteredAction<"public", {}, Promise<{
    valid: boolean;
    missing: string[];
    present: string[];
    environment: string;
}>>;
//# sourceMappingURL=env.d.ts.map