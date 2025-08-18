import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Create a new conversation
export const createConversation = mutation({
  args: {
    userId: v.id('users'),
    title: v.optional(v.string()),
    channel: v.union(v.literal('web'), v.literal('whatsapp'), v.literal('email'), v.literal('api')),
    metadata: v.optional(
      v.object({
        source: v.optional(v.string()),
        referrer: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        ipAddress: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const conversationId = await ctx.db.insert('conversations', {
      userId: args.userId,
      title: args.title,
      status: 'active',
      priority: 'medium',
      channel: args.channel,
      metadata: args.metadata,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create initial system message
    await ctx.db.insert('messages', {
      conversationId,
      role: 'system',
      content: 'Welcome to Computer Guys! How can I help you today?',
      createdAt: Date.now(),
    });

    return conversationId;
  },
});

// Get conversations for a user
export const getUserConversations = query({
  args: {
    userId: v.id('users'),
    status: v.optional(
      v.union(
        v.literal('active'),
        v.literal('archived'),
        v.literal('resolved'),
        v.literal('escalated')
      )
    ),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query('conversations')
      .withIndex('by_user', (q) => q.eq('userId', args.userId));

    if (args.status) {
      const conversations = await query.collect();
      return conversations.filter((c) => c.status === args.status);
    }

    return await query.order('desc').take(50);
  },
});

// Get single conversation
export const getConversation = query({
  args: { conversationId: v.id('conversations') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

// Update conversation
export const updateConversation = mutation({
  args: {
    conversationId: v.id('conversations'),
    updates: v.object({
      title: v.optional(v.string()),
      status: v.optional(
        v.union(
          v.literal('active'),
          v.literal('archived'),
          v.literal('resolved'),
          v.literal('escalated')
        )
      ),
      priority: v.optional(
        v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('urgent'))
      ),
      agentId: v.optional(v.id('agents')),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const { conversationId, updates } = args;

    const updateData: Record<string, unknown> = {
      ...updates,
      updatedAt: Date.now(),
    };

    if (updates.status === 'resolved') {
      updateData.resolvedAt = Date.now();
    }

    await ctx.db.patch(conversationId, updateData);

    return await ctx.db.get(conversationId);
  },
});

// Archive conversation
export const archiveConversation = mutation({
  args: {
    conversationId: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      status: 'archived',
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Escalate conversation to human agent
export const escalateConversation = mutation({
  args: {
    conversationId: v.id('conversations'),
    reason: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('urgent'))
    ),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    await ctx.db.patch(args.conversationId, {
      status: 'escalated',
      priority: args.priority || 'high',
      updatedAt: Date.now(),
    });

    // Create escalation message
    await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      role: 'system',
      content: `Conversation escalated to human agent. ${args.reason ? `Reason: ${args.reason}` : ''}`,
      createdAt: Date.now(),
    });

    // TODO: Send notification to available agents

    return { success: true };
  },
});

// Search conversations
export const searchConversations = query({
  args: {
    searchTerm: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('active'),
        v.literal('archived'),
        v.literal('resolved'),
        v.literal('escalated')
      )
    ),
    channel: v.optional(
      v.union(v.literal('web'), v.literal('whatsapp'), v.literal('email'), v.literal('api'))
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    let conversations;
    if (args.status) {
      const status = args.status;
      conversations = await ctx.db
        .query('conversations')
        .withIndex('by_status', (q) => q.eq('status', status))
        .order('desc')
        .take(limit * 2);
    } else {
      conversations = await ctx.db
        .query('conversations')
        .order('desc')
        .take(limit * 2);
    }

    // Filter by channel if specified
    if (args.channel) {
      conversations = conversations.filter((c) => c.channel === args.channel);
    }

    // Filter by date range if specified
    if (args.startDate !== undefined) {
      const startDate = args.startDate;
      conversations = conversations.filter((c) => c.createdAt >= startDate);
    }
    if (args.endDate !== undefined) {
      const endDate = args.endDate;
      conversations = conversations.filter((c) => c.createdAt <= endDate);
    }

    // Filter by search term in title
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      conversations = conversations.filter((c) => c.title?.toLowerCase().includes(searchLower));
    }

    return conversations.slice(0, limit);
  },
});

// Get conversation statistics
export const getConversationStats = query({
  args: {
    userId: v.optional(v.id('users')),
    agentId: v.optional(v.id('agents')),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let conversations;

    if (args.userId) {
      const userId = args.userId;
      conversations = await ctx.db
        .query('conversations')
        .withIndex('by_user', (q) => q.eq('userId', userId))
        .collect();
    } else {
      conversations = await ctx.db.query('conversations').collect();
    }

    // Filter by agent if specified
    if (args.agentId) {
      conversations = conversations.filter((c) => c.agentId === args.agentId);
    }

    // Filter by date range
    if (args.startDate !== undefined) {
      const startDate = args.startDate;
      conversations = conversations.filter((c) => c.createdAt >= startDate);
    }
    if (args.endDate !== undefined) {
      const endDate = args.endDate;
      conversations = conversations.filter((c) => c.createdAt <= endDate);
    }

    // Calculate statistics
    const stats = {
      total: conversations.length,
      active: conversations.filter((c) => c.status === 'active').length,
      resolved: conversations.filter((c) => c.status === 'resolved').length,
      escalated: conversations.filter((c) => c.status === 'escalated').length,
      archived: conversations.filter((c) => c.status === 'archived').length,
      byChannel: {
        web: conversations.filter((c) => c.channel === 'web').length,
        whatsapp: conversations.filter((c) => c.channel === 'whatsapp').length,
        email: conversations.filter((c) => c.channel === 'email').length,
        api: conversations.filter((c) => c.channel === 'api').length,
      },
      byPriority: {
        low: conversations.filter((c) => c.priority === 'low').length,
        medium: conversations.filter((c) => c.priority === 'medium').length,
        high: conversations.filter((c) => c.priority === 'high').length,
        urgent: conversations.filter((c) => c.priority === 'urgent').length,
      },
      avgResolutionTime: 0,
    };

    // Calculate average resolution time
    const resolved = conversations.filter((c) => c.status === 'resolved' && c.resolvedAt);
    if (resolved.length > 0) {
      const totalTime = resolved.reduce((sum, c) => sum + ((c.resolvedAt || 0) - c.createdAt), 0);
      stats.avgResolutionTime = Math.round(totalTime / resolved.length);
    }

    return stats;
  },
});

// Delete conversation (soft delete)
export const deleteConversation = mutation({
  args: {
    conversationId: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Archive the conversation instead of deleting
    await ctx.db.patch(args.conversationId, {
      status: 'archived',
      updatedAt: Date.now(),
    });

    // Mark all messages as deleted
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
      .collect();

    for (const message of messages) {
      await ctx.db.patch(message._id, {
        deletedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Get active WhatsApp conversation for a user
export const getActiveWhatsAppConversation = query({
  args: {
    userId: v.id('users'),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query('conversations')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => 
        q.and(
          q.eq(q.field('channel'), 'whatsapp'),
          q.eq(q.field('status'), 'active')
        )
      )
      .order('desc')
      .first();

    return conversations;
  },
});
