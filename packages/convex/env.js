import { action } from './_generated/server';
// Environment configuration action
export const getConfig = action({
    args: {},
    handler: async () => {
        return {
            openRouterApiKey: process.env.OPENROUTER_API_KEY,
            twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
            twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
            isDevelopment: process.env.NODE_ENV === 'development',
        };
    },
});
// Health check
export const healthCheck = action({
    args: {},
    handler: async () => {
        return {
            status: 'healthy',
            timestamp: Date.now(),
            environment: process.env.NODE_ENV || 'development',
        };
    },
});
// Get API keys (protected - only for server-side use)
export const getApiKeys = action({
    args: {},
    handler: async () => {
        // TODO: Add authentication check
        return {
            hasOpenRouter: !!process.env.OPENROUTER_API_KEY,
            hasTwilio: !!process.env.TWILIO_ACCOUNT_SID && !!process.env.TWILIO_AUTH_TOKEN,
            hasJwtSecret: !!process.env.JWT_SECRET,
            environment: process.env.NODE_ENV || 'development',
        };
    },
});
// Validate environment
export const validateEnvironment = action({
    args: {},
    handler: async () => {
        const required = [
            'OPENROUTER_API_KEY',
            'TWILIO_ACCOUNT_SID',
            'TWILIO_AUTH_TOKEN',
            'JWT_SECRET',
        ];
        const missing = [];
        const present = [];
        for (const key of required) {
            if (process.env[key]) {
                present.push(key);
            }
            else {
                missing.push(key);
            }
        }
        return {
            valid: missing.length === 0,
            missing,
            present,
            environment: process.env.NODE_ENV || 'development',
        };
    },
});
//# sourceMappingURL=env.js.map