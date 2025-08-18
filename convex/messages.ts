import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List messages
export const list = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    // TODO: Implement message listing
    return [];
  },
});

// Send message
export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
  },
  handler: async (ctx, args) => {
    // TODO: Implement send message
    return ctx.db.insert("messages", {
      conversationId: args.conversationId,
      content: args.content,
      role: args.role,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Delete message
export const deleteMessage = mutation({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    // TODO: Implement delete message
    await ctx.db.delete(args.id);
  },
});

// Edit message
export const edit = mutation({
  args: {
    id: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Implement edit message
    await ctx.db.patch(args.id, {
      content: args.content,
      updatedAt: Date.now(),
    });
  },
});