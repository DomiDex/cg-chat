import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Create a new agent
export const createAgent = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal('chat'),
      v.literal('support'),
      v.literal('technical'),
      v.literal('sales'),
      v.literal('escalation')
    ),
    capabilities: v.array(v.string()),
    tools: v.array(v.string()),
    modelConfig: v.object({
      provider: v.string(),
      model: v.string(),
      temperature: v.number(),
      maxTokens: v.number(),
      systemPrompt: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const agentId = await ctx.db.insert('agents', {
      name: args.name,
      type: args.type,
      status: 'active',
      capabilities: args.capabilities,
      tools: args.tools,
      modelConfig: args.modelConfig,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return agentId;
  },
});

// Get all agents
export const getAgents = query({
  args: {
    type: v.optional(
      v.union(
        v.literal('chat'),
        v.literal('support'),
        v.literal('technical'),
        v.literal('sales'),
        v.literal('escalation')
      )
    ),
    status: v.optional(v.union(v.literal('active'), v.literal('inactive'))),
  },
  handler: async (ctx, args) => {
    let agents;

    if (args.type) {
      const agentType = args.type;
      agents = await ctx.db
        .query('agents')
        .withIndex('by_type', (q) => q.eq('type', agentType))
        .collect();
    } else {
      agents = await ctx.db.query('agents').collect();
    }

    if (args.status) {
      agents = agents.filter((a) => a.status === args.status);
    }

    return agents;
  },
});

// Get agent by ID
export const getAgent = query({
  args: { agentId: v.id('agents') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.agentId);
  },
});

// Update agent
export const updateAgent = mutation({
  args: {
    agentId: v.id('agents'),
    updates: v.object({
      name: v.optional(v.string()),
      status: v.optional(v.union(v.literal('active'), v.literal('inactive'))),
      capabilities: v.optional(v.array(v.string())),
      tools: v.optional(v.array(v.string())),
      modelConfig: v.optional(
        v.object({
          provider: v.string(),
          model: v.string(),
          temperature: v.number(),
          maxTokens: v.number(),
          systemPrompt: v.string(),
        })
      ),
      specialization: v.optional(
        v.object({
          products: v.array(v.string()),
          categories: v.array(v.string()),
          languages: v.array(v.string()),
        })
      ),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agentId, {
      ...args.updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.agentId);
  },
});

// Update agent metrics
export const updateAgentMetrics = mutation({
  args: {
    agentId: v.id('agents'),
    conversationId: v.id('conversations'),
    responseTime: v.number(),
    satisfaction: v.optional(v.number()),
    escalated: v.boolean(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);

    if (!agent) {
      throw new Error('Agent not found');
    }

    const currentMetrics = agent.metrics || {
      totalConversations: 0,
      avgResponseTime: 0,
      avgSatisfaction: 0,
      escalationRate: 0,
    };

    // Update metrics
    const newTotal = currentMetrics.totalConversations + 1;
    const newAvgResponseTime =
      (currentMetrics.avgResponseTime * currentMetrics.totalConversations + args.responseTime) /
      newTotal;

    let newAvgSatisfaction = currentMetrics.avgSatisfaction;
    if (args.satisfaction !== undefined) {
      newAvgSatisfaction =
        (currentMetrics.avgSatisfaction * currentMetrics.totalConversations + args.satisfaction) /
        newTotal;
    }

    const escalationCount = Math.round(
      (currentMetrics.escalationRate * currentMetrics.totalConversations) / 100
    );
    const newEscalationCount = escalationCount + (args.escalated ? 1 : 0);
    const newEscalationRate = (newEscalationCount / newTotal) * 100;

    await ctx.db.patch(args.agentId, {
      metrics: {
        totalConversations: newTotal,
        avgResponseTime: newAvgResponseTime,
        avgSatisfaction: newAvgSatisfaction,
        escalationRate: newEscalationRate,
      },
      updatedAt: Date.now(),
    });
  },
});

// Get available agent for conversation
export const getAvailableAgent = query({
  args: {
    type: v.union(
      v.literal('chat'),
      v.literal('support'),
      v.literal('technical'),
      v.literal('sales'),
      v.literal('escalation')
    ),
    category: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const agents = await ctx.db
      .query('agents')
      .withIndex('by_type', (q) => q.eq('type', args.type))
      .filter((q) => q.eq(q.field('status'), 'active'))
      .collect();

    if (agents.length === 0) {
      return null;
    }

    // Filter by specialization if specified
    let filteredAgents = agents;

    if (args.category) {
      const category = args.category;
      filteredAgents = agents.filter(
        (a) =>
          (a.specialization?.categories && a.specialization.categories.includes(category)) ||
          !a.specialization?.categories?.length
      );
    }

    if (args.language) {
      const language = args.language;
      filteredAgents = filteredAgents.filter(
        (a) =>
          (a.specialization?.languages && a.specialization.languages.includes(language)) ||
          !a.specialization?.languages?.length
      );
    }

    // If no specialized agents found, fall back to any active agent of the type
    if (filteredAgents.length === 0) {
      filteredAgents = agents;
    }

    // Select agent with best metrics (lowest escalation rate)
    filteredAgents.sort((a, b) => {
      const aRate = a.metrics?.escalationRate || 100;
      const bRate = b.metrics?.escalationRate || 100;
      return aRate - bRate;
    });

    return filteredAgents[0];
  },
});

// Delete agent
export const deleteAgent = mutation({
  args: {
    agentId: v.id('agents'),
  },
  handler: async (ctx, args) => {
    // Set agent to inactive instead of deleting
    await ctx.db.patch(args.agentId, {
      status: 'inactive',
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
