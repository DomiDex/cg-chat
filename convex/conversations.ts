import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List conversations
export const list = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // TODO: Implement conversation listing
    return [];
  },
});

// Get conversation
export const get = query({
  args: {
    id: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    // TODO: Implement get conversation
    return await ctx.db.get(args.id);
  },
});

// Create conversation
export const create = mutation({
  args: {
    userId: v.id("users"),
    channel: v.union(v.literal("email"), v.literal("whatsapp"), v.literal("web"), v.literal("api")),
    title: v.optional(v.string()),
    metadata: v.optional(v.object({
      source: v.optional(v.string()),
      referrer: v.optional(v.string()),
      userAgent: v.optional(v.string()),
      ipAddress: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // TODO: Implement conversation creation
    return ctx.db.insert("conversations", {
      userId: args.userId,
      channel: args.channel,
      title: args.title,
      metadata: args.metadata,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Mark as read
export const markAsRead = mutation({
  args: {
    id: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    // TODO: Implement mark as read
    await ctx.db.patch(args.id, {
      lastReadAt: Date.now(),
    });
  },
});