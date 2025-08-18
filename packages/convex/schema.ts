import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Users table with email authentication
  users: defineTable({
    email: v.string(),
    emailVerified: v.boolean(),
    verificationToken: v.optional(v.string()),
    verificationExpiry: v.optional(v.number()),
    name: v.optional(v.string()),
    role: v.union(v.literal('user'), v.literal('admin'), v.literal('agent')),
    customerId: v.optional(v.string()), // CG customer ID
    preferences: v.optional(
      v.object({
        notifications: v.boolean(),
        language: v.string(),
        timezone: v.string(),
      })
    ),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastActive: v.optional(v.number()),
    subscription: v.optional(
      v.object({
        tier: v.union(v.literal('free'), v.literal('pro'), v.literal('enterprise')),
        validUntil: v.number(),
        features: v.array(v.string()),
      })
    ),
  })
    .index('by_email', ['email'])
    .index('by_verification_token', ['verificationToken'])
    .index('by_customer_id', ['customerId']),

  // Conversations table
  conversations: defineTable({
    userId: v.id('users'),
    title: v.optional(v.string()),
    status: v.union(
      v.literal('active'),
      v.literal('archived'),
      v.literal('resolved'),
      v.literal('escalated')
    ),
    priority: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('urgent')
    ),
    agentId: v.optional(v.id('agents')),
    channel: v.union(v.literal('web'), v.literal('whatsapp'), v.literal('email'), v.literal('api')),
    metadata: v.optional(
      v.object({
        source: v.optional(v.string()),
        referrer: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        ipAddress: v.optional(v.string()),
      })
    ),
    context: v.optional(
      v.object({
        category: v.optional(v.string()),
        product: v.optional(v.string()),
        issue: v.optional(v.string()),
      })
    ),
    workflowId: v.optional(v.id('workflows')),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    resolvedAt: v.optional(v.number()),
    lastMessageAt: v.optional(v.number()),
  })
    .index('by_user', ['userId'])
    .index('by_status', ['status'])
    .index('by_agent', ['agentId'])
    .index('by_created', ['createdAt'])
    .index('by_user_status', ['userId', 'status']),

  // Messages table
  messages: defineTable({
    conversationId: v.id('conversations'),
    role: v.union(
      v.literal('user'),
      v.literal('assistant'),
      v.literal('system'),
      v.literal('tool')
    ),
    content: v.string(),
    attachments: v.optional(
      v.array(
        v.object({
          type: v.string(),
          url: v.string(),
          name: v.string(),
          size: v.number(),
        })
      )
    ),
    metadata: v.optional(
      v.object({
        model: v.optional(v.string()),
        tokens: v.optional(
          v.object({
            prompt: v.number(),
            completion: v.number(),
            total: v.number(),
          })
        ),
        latency: v.optional(v.number()),
        cost: v.optional(v.number()),
        toolCalls: v.optional(v.array(v.any())),
        citations: v.optional(v.array(v.string())),
      })
    ),
    agentMetadata: v.optional(
      v.object({
        agentId: v.id('agents'),
        agentName: v.string(),
        confidence: v.number(),
        intent: v.optional(v.string()),
        sentiment: v.optional(v.string()),
      })
    ),
    editedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_conversation', ['conversationId'])
    .index('by_created', ['createdAt'])
    .index('by_conversation_created', ['conversationId', 'createdAt']),

  // AI Agents registry
  agents: defineTable({
    name: v.string(),
    type: v.union(
      v.literal('chat'),
      v.literal('support'),
      v.literal('technical'),
      v.literal('sales'),
      v.literal('escalation')
    ),
    status: v.union(v.literal('active'), v.literal('inactive')),
    capabilities: v.array(v.string()),
    tools: v.array(v.string()),
    modelConfig: v.object({
      provider: v.string(),
      model: v.string(),
      temperature: v.number(),
      maxTokens: v.number(),
      systemPrompt: v.string(),
    }),
    specialization: v.optional(
      v.object({
        products: v.array(v.string()),
        categories: v.array(v.string()),
        languages: v.array(v.string()),
      })
    ),
    metrics: v.optional(
      v.object({
        totalConversations: v.number(),
        avgResponseTime: v.number(),
        avgSatisfaction: v.number(),
        escalationRate: v.number(),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_type', ['type'])
    .index('by_status', ['status'])
    .index('by_name', ['name']),

  // Durable Workflows
  workflows: defineTable({
    name: v.string(),
    type: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('running'),
      v.literal('completed'),
      v.literal('failed'),
      v.literal('cancelled')
    ),
    input: v.any(),
    output: v.optional(v.any()),
    error: v.optional(v.string()),
    steps: v.array(
      v.object({
        name: v.string(),
        status: v.string(),
        startedAt: v.number(),
        completedAt: v.optional(v.number()),
        result: v.optional(v.any()),
        error: v.optional(v.string()),
      })
    ),
    metadata: v.optional(v.any()),
    retries: v.number(),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index('by_type', ['type'])
    .index('by_status', ['status'])
    .index('by_created', ['createdAt']),

  // Knowledge Base for RAG
  knowledge: defineTable({
    type: v.union(
      v.literal('product'),
      v.literal('service'),
      v.literal('faq'),
      v.literal('documentation'),
      v.literal('policy')
    ),
    title: v.string(),
    content: v.string(),
    embedding: v.array(v.number()), // Vector embedding
    metadata: v.object({
      source: v.string(),
      category: v.optional(v.string()),
      tags: v.array(v.string()),
      version: v.optional(v.string()),
      productId: v.optional(v.string()),
      url: v.optional(v.string()),
    }),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_type', ['type'])
    .index('by_active', ['active'])
    .vectorIndex('by_embedding', {
      vectorField: 'embedding',
      dimensions: 1536, // OpenAI embedding dimension
      filterFields: ['type', 'active'],
    }),

  // Analytics & Metrics
  analytics: defineTable({
    type: v.union(
      v.literal('conversation'),
      v.literal('message'),
      v.literal('user'),
      v.literal('agent'),
      v.literal('system')
    ),
    event: v.string(),
    userId: v.optional(v.id('users')),
    conversationId: v.optional(v.id('conversations')),
    agentId: v.optional(v.id('agents')),
    data: v.any(),
    timestamp: v.number(),
  })
    .index('by_type', ['type'])
    .index('by_event', ['event'])
    .index('by_timestamp', ['timestamp'])
    .index('by_user', ['userId']),

  // Sessions for authentication
  sessions: defineTable({
    userId: v.id('users'),
    token: v.string(),
    refreshToken: v.string(),
    expiresAt: v.number(),
    refreshExpiresAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    lastActivity: v.number(),
    createdAt: v.number(),
  })
    .index('by_token', ['token'])
    .index('by_refresh_token', ['refreshToken'])
    .index('by_user', ['userId'])
    .index('by_expires', ['expiresAt']),

  // Rate Limiting
  rateLimits: defineTable({
    identifier: v.string(), // IP or userId
    type: v.union(v.literal('ip'), v.literal('user')),
    endpoint: v.string(),
    count: v.number(),
    windowStart: v.number(),
    windowEnd: v.number(),
  })
    .index('by_identifier', ['identifier'])
    .index('by_window', ['windowEnd']),
});
