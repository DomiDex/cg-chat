import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Send a message
export const sendMessage = mutation({
  args: {
    conversationId: v.id('conversations'),
    role: v.union(
      v.literal('user'),
      v.literal('assistant'),
      v.literal('system'),
      v.literal('tool')
    ),
    content: v.string(),
    metadata: v.optional(v.object({
      model: v.optional(v.string()),
      tokens: v.optional(v.object({
        prompt: v.number(),
        completion: v.number(),
        total: v.number(),
      })),
      latency: v.optional(v.number()),
      cost: v.optional(v.number()),
      toolCalls: v.optional(v.array(v.object({
        id: v.string(),
        type: v.string(),
        function: v.optional(v.object({
          name: v.string(),
          arguments: v.string(),
        })),
      }))),
      citations: v.optional(v.array(v.string())),
    })),
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
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      metadata: args.metadata,
      attachments: args.attachments,
      createdAt: Date.now(),
    });

    // Update conversation's last message timestamp
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
      updatedAt: Date.now(),
    });

    return messageId;
  },
});

// Get messages for a conversation
export const getMessages = query({
  args: {
    conversationId: v.id('conversations'),
    limit: v.optional(v.number()),
    beforeTimestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    const query = ctx.db
      .query('messages')
      .withIndex('by_conversation_created', (q) => q.eq('conversationId', args.conversationId));

    let messages = await query.order('desc').take(limit + 10);

    // Filter by timestamp if specified
    if (args.beforeTimestamp !== undefined) {
      const beforeTimestamp = args.beforeTimestamp;
      messages = messages.filter((m) => m.createdAt < beforeTimestamp);
    }

    // Filter out deleted messages
    messages = messages.filter((m) => !m.deletedAt);

    // Return in chronological order (oldest first)
    return messages.slice(0, limit).reverse();
  },
});

// Real-time message subscription
export const subscribeToMessages = query({
  args: {
    conversationId: v.id('conversations'),
    afterTimestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query('messages')
      .withIndex('by_conversation_created', (q) => q.eq('conversationId', args.conversationId));

    let messages = await query.order('desc').take(10);

    // Filter by timestamp if specified
    if (args.afterTimestamp !== undefined) {
      const afterTimestamp = args.afterTimestamp;
      messages = messages.filter((m) => m.createdAt > afterTimestamp);
    }

    // Filter out deleted messages
    messages = messages.filter((m) => !m.deletedAt);

    return messages.reverse();
  },
});

// Edit a message
export const editMessage = mutation({
  args: {
    messageId: v.id('messages'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.deletedAt) {
      throw new Error('Cannot edit deleted message');
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
      editedAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete a message (soft delete)
export const deleteMessage = mutation({
  args: {
    messageId: v.id('messages'),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    await ctx.db.patch(args.messageId, {
      deletedAt: Date.now(),
    });

    return { success: true };
  },
});

// Add message with agent metadata
export const sendAgentMessage = mutation({
  args: {
    conversationId: v.id('conversations'),
    content: v.string(),
    agentId: v.id('agents'),
    agentName: v.string(),
    confidence: v.number(),
    intent: v.optional(v.string()),
    sentiment: v.optional(v.string()),
    metadata: v.optional(v.object({
      model: v.optional(v.string()),
      tokens: v.optional(v.object({
        prompt: v.number(),
        completion: v.number(),
        total: v.number(),
      })),
      latency: v.optional(v.number()),
      cost: v.optional(v.number()),
      toolCalls: v.optional(v.array(v.object({
        id: v.string(),
        type: v.string(),
        function: v.optional(v.object({
          name: v.string(),
          arguments: v.string(),
        })),
      }))),
      citations: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      role: 'assistant',
      content: args.content,
      metadata: args.metadata,
      agentMetadata: {
        agentId: args.agentId,
        agentName: args.agentName,
        confidence: args.confidence,
        intent: args.intent,
        sentiment: args.sentiment,
      },
      createdAt: Date.now(),
    });

    // Update conversation
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
      agentId: args.agentId,
      updatedAt: Date.now(),
    });

    return messageId;
  },
});

// Get message statistics
export const getMessageStats = query({
  args: {
    conversationId: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
      .collect();

    const stats = {
      total: messages.length,
      byRole: {
        user: messages.filter((m) => m.role === 'user').length,
        assistant: messages.filter((m) => m.role === 'assistant').length,
        system: messages.filter((m) => m.role === 'system').length,
        tool: messages.filter((m) => m.role === 'tool').length,
      },
      withAttachments: messages.filter((m) => m.attachments && m.attachments.length > 0).length,
      edited: messages.filter((m) => m.editedAt).length,
      deleted: messages.filter((m) => m.deletedAt).length,
      totalTokens: 0,
      totalCost: 0,
    };

    // Calculate token usage and cost
    messages.forEach((m) => {
      if (m.metadata?.tokens?.total) {
        stats.totalTokens += m.metadata.tokens.total;
      }
      if (m.metadata?.cost) {
        stats.totalCost += m.metadata.cost;
      }
    });

    return stats;
  },
});

// Search messages
export const searchMessages = query({
  args: {
    searchTerm: v.string(),
    conversationId: v.optional(v.id('conversations')),
    role: v.optional(
      v.union(v.literal('user'), v.literal('assistant'), v.literal('system'), v.literal('tool'))
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const searchLower = args.searchTerm.toLowerCase();

    let messages;
    if (args.conversationId) {
      messages = await ctx.db
        .query('messages')
        .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
        .take(1000);
    } else {
      messages = await ctx.db.query('messages').take(1000);
    }

    // Filter by search term
    messages = messages.filter(
      (m) => m.content.toLowerCase().includes(searchLower) && !m.deletedAt
    );

    // Filter by role if specified
    if (args.role) {
      messages = messages.filter((m) => m.role === args.role);
    }

    // Sort by relevance (simple: exact matches first, then partial)
    messages.sort((a, b) => {
      const aExact = a.content.toLowerCase() === searchLower;
      const bExact = b.content.toLowerCase() === searchLower;

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Then sort by recency
      return b.createdAt - a.createdAt;
    });

    return messages.slice(0, limit);
  },
});

// Add tool call message
export const addToolCallMessage = mutation({
  args: {
    conversationId: v.id('conversations'),
    toolName: v.string(),
    toolInput: v.unknown(),
    toolOutput: v.unknown(),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const content = `Tool: ${args.toolName}\nInput: ${JSON.stringify(args.toolInput, null, 2)}\nOutput: ${JSON.stringify(args.toolOutput, null, 2)}`;

    const messageId = await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      role: 'tool',
      content,
      metadata: {
        toolCalls: [
          {
            name: args.toolName,
            input: args.toolInput,
            output: args.toolOutput,
            duration: args.duration,
          },
        ],
      },
      createdAt: Date.now(),
    });

    return messageId;
  },
});

// Get latest message in conversation
export const getLatestMessage = query({
  args: {
    conversationId: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db
      .query('messages')
      .withIndex('by_conversation_created', (q) => q.eq('conversationId', args.conversationId))
      .order('desc')
      .first();

    return message && !message.deletedAt ? message : null;
  },
});
