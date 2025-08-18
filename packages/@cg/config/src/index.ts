import { z } from 'zod';

/**
 * Environment configuration with validation
 */

// Environment schema
const EnvSchema = z.object({
  // Node
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Convex
  CONVEX_DEPLOYMENT: z.string().optional(),
  CONVEX_URL: z.string().url().optional(),
  NEXT_PUBLIC_CONVEX_URL: z.string().url().optional(),
  
  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_DATABASE_URL: z.string().url().optional(),
  
  // Authentication
  JWT_SECRET: z.string().min(32).optional(),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  
  // Twilio
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  
  // OpenRouter
  OPENROUTER_API_KEY: z.string().optional(),
  
  // URLs
  API_URL: z.string().url().default('http://localhost:3001'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3001'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  
  // Feature flags
  ENABLE_ANALYTICS: z.boolean().default(false),
  ENABLE_DEBUG: z.boolean().default(false),
  ENABLE_VOICE_INPUT: z.boolean().default(false),
  ENABLE_AI_SUGGESTIONS: z.boolean().default(true),
});

export type Env = z.infer<typeof EnvSchema>;

// Parse boolean environment variables
function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  return value === 'true' || value === '1';
}

// Prepare environment for validation
function prepareEnv() {
  const env = { ...process.env };
  
  // Parse boolean values
  if (env.ENABLE_ANALYTICS !== undefined) {
    (env as any).ENABLE_ANALYTICS = parseBoolean(env.ENABLE_ANALYTICS);
  }
  if (env.ENABLE_DEBUG !== undefined) {
    (env as any).ENABLE_DEBUG = parseBoolean(env.ENABLE_DEBUG);
  }
  if (env.ENABLE_VOICE_INPUT !== undefined) {
    (env as any).ENABLE_VOICE_INPUT = parseBoolean(env.ENABLE_VOICE_INPUT);
  }
  if (env.ENABLE_AI_SUGGESTIONS !== undefined) {
    (env as any).ENABLE_AI_SUGGESTIONS = parseBoolean(env.ENABLE_AI_SUGGESTIONS);
  }
  
  return env;
}

// Validate and export environment
export function validateEnv(): Env {
  try {
    return EnvSchema.parse(prepareEnv());
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      console.error(error.format());
      
      // Only exit in production
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
    throw error;
  }
}

// Get config with defaults
export function getConfig(): Partial<Env> {
  try {
    return validateEnv();
  } catch {
    // Return partial config in development
    return prepareEnv() as Partial<Env>;
  }
}

// Check if running in production
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Check if running in development
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

// Check if running in test
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

// Feature flags
export const features = {
  analytics: () => parseBoolean(process.env.ENABLE_ANALYTICS) ?? false,
  debug: () => parseBoolean(process.env.ENABLE_DEBUG) ?? false,
  voiceInput: () => parseBoolean(process.env.ENABLE_VOICE_INPUT) ?? false,
  aiSuggestions: () => parseBoolean(process.env.ENABLE_AI_SUGGESTIONS) ?? true,
};

// API endpoints
export const endpoints = {
  api: process.env.API_URL || 'http://localhost:3001',
  frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
  convex: process.env.CONVEX_URL || '',
};

// Constants
export const constants = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  TOKEN_EXPIRY: 15 * 60 * 1000, // 15 minutes
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  MAX_LOGIN_ATTEMPTS: 5,
  VERIFICATION_CODE_LENGTH: 6,
  VERIFICATION_CODE_EXPIRY: 10 * 60 * 1000, // 10 minutes
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX: 100,
  MAX_MESSAGE_LENGTH: 4096,
  MAX_CONVERSATION_MESSAGES: 1000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
};

// Competitor filter list
export const competitors = [
  'Best Buy',
  'Geek Squad',
  'Micro Center',
  'Staples',
  'Office Depot',
  'Costco Tech',
  'Amazon Tech Support',
  'Apple Genius Bar',
  'Microsoft Store',
];

// System messages
export const messages = {
  welcome: 'Welcome to Computer Guys! How can I help you today?',
  offline: 'Our chat service is currently offline. Please try again later.',
  maintenance: 'We are currently performing maintenance. Please check back soon.',
  rateLimit: 'You have exceeded the rate limit. Please wait before trying again.',
  sessionExpired: 'Your session has expired. Please log in again.',
  verificationSent: 'A verification code has been sent to your email.',
  verificationSuccess: 'Your email has been verified successfully.',
  loginSuccess: 'You have been logged in successfully.',
  logoutSuccess: 'You have been logged out successfully.',
  errorGeneric: 'An error occurred. Please try again.',
  errorNetwork: 'Network error. Please check your connection.',
  errorAuth: 'Authentication failed. Please log in again.',
  errorPermission: 'You do not have permission to perform this action.',
  errorNotFound: 'The requested resource was not found.',
  errorValidation: 'Please check your input and try again.',
};

// Database configuration
export const database = {
  poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '20'),
  timeout: parseInt(process.env.DATABASE_TIMEOUT || '2000'),
  rlsBypassSecret: process.env.RLS_BYPASS_SECRET,
  enableLogging: parseBoolean(process.env.DATABASE_LOGGING) ?? isDevelopment(),
  enableDebug: parseBoolean(process.env.DATABASE_DEBUG) ?? false,
};

// Redis configuration
export const redis = {
  url: process.env.REDIS_URL,
  maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '1000'),
  enableOfflineQueue: parseBoolean(process.env.REDIS_OFFLINE_QUEUE) ?? true,
};

// Security configuration
export const security = {
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  corsOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  trustedProxies: process.env.TRUSTED_PROXIES?.split(',') || [],
  csrfEnabled: parseBoolean(process.env.CSRF_ENABLED) ?? isProduction(),
  helmetEnabled: parseBoolean(process.env.HELMET_ENABLED) ?? true,
};

// Monitoring configuration
export const monitoring = {
  sentryDsn: process.env.SENTRY_DSN,
  sentryEnvironment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  sentryTracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
  logLevel: process.env.LOG_LEVEL || (isDevelopment() ? 'debug' : 'info'),
};

// Email configuration
export const email = {
  from: process.env.EMAIL_FROM || 'noreply@computerguys.com',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@computerguys.com',
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT || '587'),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpSecure: parseBoolean(process.env.SMTP_SECURE) ?? false,
};

// AI configuration
export const ai = {
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  openRouterModel: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-opus',
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '4096'),
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  topP: parseFloat(process.env.AI_TOP_P || '0.9'),
};

// Twilio configuration
export const twilio = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  webhookUrl: process.env.TWILIO_WEBHOOK_URL,
  statusCallbackUrl: process.env.TWILIO_STATUS_CALLBACK_URL,
};

// Storage configuration
export const storage = {
  provider: process.env.STORAGE_PROVIDER || 'local',
  s3Bucket: process.env.S3_BUCKET,
  s3Region: process.env.S3_REGION || 'us-east-1',
  s3AccessKey: process.env.S3_ACCESS_KEY,
  s3SecretKey: process.env.S3_SECRET_KEY,
  localPath: process.env.STORAGE_LOCAL_PATH || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || String(10 * 1024 * 1024)),
  allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
  ],
};

// Default export
export default {
  env: getConfig(),
  isProduction,
  isDevelopment,
  isTest,
  features,
  endpoints,
  constants,
  competitors,
  messages,
  database,
  redis,
  security,
  monitoring,
  email,
  ai,
  twilio,
  storage,
};