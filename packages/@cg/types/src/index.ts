export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  role: 'user' | 'admin' | 'agent';
  customerId?: string;
  preferences?: UserPreferences;
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  lastActive?: number;
  subscription?: Subscription;
}

export interface UserPreferences {
  notifications: boolean;
  language: string;
  timezone: string;
}

export interface Subscription {
  tier: 'free' | 'pro' | 'enterprise';
  validUntil: number;
  features: string[];
}

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  status: ConversationStatus;
  priority: Priority;
  agentId?: string;
  channel: Channel;
  metadata?: ConversationMetadata;
  context?: ConversationContext;
  workflowId?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
  lastMessageAt?: number;
}

export type ConversationStatus = 'active' | 'archived' | 'resolved' | 'escalated';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Channel = 'web' | 'whatsapp' | 'email' | 'api';

export interface ConversationMetadata {
  source?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface ConversationContext {
  category?: string;
  product?: string;
  issue?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  attachments?: Attachment[];
  metadata?: MessageMetadata;
  agentMetadata?: AgentMetadata;
  editedAt?: number;
  deletedAt?: number;
  createdAt: number;
}

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface Attachment {
  type: string;
  url: string;
  name: string;
  size: number;
}

export interface MessageMetadata {
  model?: string;
  tokens?: TokenUsage;
  latency?: number;
  cost?: number;
  toolCalls?: Array<{
    id: string;
    type: string;
    function?: {
      name: string;
      arguments: string;
    };
  }>;
  citations?: string[];
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface AgentMetadata {
  agentId: string;
  agentName: string;
  confidence: number;
  intent?: string;
  sentiment?: string;
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: 'active' | 'inactive';
  capabilities: string[];
  tools: string[];
  modelConfig: ModelConfig;
  specialization?: AgentSpecialization;
  metrics?: AgentMetrics;
  createdAt: number;
  updatedAt: number;
}

export type AgentType = 'chat' | 'support' | 'technical' | 'sales' | 'escalation';

export interface ModelConfig {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface AgentSpecialization {
  products: string[];
  categories: string[];
  languages: string[];
}

export interface AgentMetrics {
  totalConversations: number;
  avgResponseTime: number;
  avgSatisfaction: number;
  escalationRate: number;
}

export interface ApiRequest<T = unknown> {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: T;
  query?: Record<string, string>;
  params?: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  stack?: string;
}

export interface ResponseMetadata {
  requestId: string;
  timestamp: number;
  duration: number;
  version: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
  ipAddress?: string;
  userAgent?: string;
  lastActivity: number;
  createdAt: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  jti: string;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export const MAX_MESSAGE_LENGTH = 4096;
export const MAX_CONVERSATION_MESSAGES = 1000;
export const SESSION_TIMEOUT = 30 * 60 * 1000;
export const TOKEN_EXPIRY = 15 * 60 * 1000;
export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;

// Brand types for type safety
export type Brand<K, T> = K & { __brand: T };

export type UserId = Brand<string, 'UserId'>;
export type ConversationId = Brand<string, 'ConversationId'>;
export type MessageId = Brand<string, 'MessageId'>;
export type AgentId = Brand<string, 'AgentId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type ApiKeyId = Brand<string, 'ApiKeyId'>;

// Result types for error handling
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  hasMore: boolean;
  cursor?: string;
}

// Filter types
export interface FilterParams {
  search?: string;
  status?: string[];
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  [key: string]: any;
}

// Event types
export interface EventPayload<T = any> {
  type: string;
  data: T;
  timestamp: number;
  source: string;
  metadata?: Record<string, any>;
}

// WebSocket message types
export interface WSMessage<T = any> {
  id: string;
  type: WSMessageType;
  payload: T;
  timestamp: number;
}

export enum WSMessageType {
  PING = 'ping',
  PONG = 'pong',
  MESSAGE = 'message',
  TYPING = 'typing',
  PRESENCE = 'presence',
  ERROR = 'error',
  ACK = 'ack',
}

// Error types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

// Utility type helpers
export type Await<T> = T extends PromiseLike<infer U> ? U : T;
export type ArrayElement<ArrayType extends readonly unknown[]> = 
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
export type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// Extract keys of specific type
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Make specific properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific properties required
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Recursive readonly
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
