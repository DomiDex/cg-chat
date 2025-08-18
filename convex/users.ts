import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // TODO: Implement actual user lookup
    return null;
  },
});

// Create user
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    customerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Implement user creation
    return ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      customerId: args.customerId,
      role: "user",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update user
export const updateUser = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    customerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // TODO: Implement user update
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});