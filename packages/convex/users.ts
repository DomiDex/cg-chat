import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new user
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    customerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      emailVerified: false,
      role: "user",
      customerId: args.customerId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Update user
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    updates: v.object({
      name: v.optional(v.string()),
      emailVerified: v.optional(v.boolean()),
      preferences: v.optional(v.any()),
      metadata: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const { userId, updates } = args;

    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(userId);
  },
});

// Verify user email
export const verifyEmail = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_verification_token", (q) =>
        q.eq("verificationToken", args.token),
      )
      .first();

    if (!user) {
      throw new Error("Invalid verification token");
    }

    if (user.verificationExpiry && user.verificationExpiry < Date.now()) {
      throw new Error("Verification token has expired");
    }

    await ctx.db.patch(user._id, {
      emailVerified: true,
      verificationToken: undefined,
      verificationExpiry: undefined,
      updatedAt: Date.now(),
    });

    return { success: true, userId: user._id };
  },
});

// Generate verification token
export const generateVerificationToken = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const token =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await ctx.db.patch(args.userId, {
      verificationToken: token,
      verificationExpiry: expiry,
      updatedAt: Date.now(),
    });

    return { token, expiry };
  },
});

// List all users (admin only)
export const listUsers = query({
  args: {
    limit: v.optional(v.number()),
    role: v.optional(
      v.union(v.literal("user"), v.literal("admin"), v.literal("agent")),
    ),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    let query = ctx.db.query("users");

    const users = await query.order("desc").take(limit);

    if (args.role) {
      return users.filter((u) => u.role === args.role);
    }

    return users;
  },
});

// Update user activity
export const updateLastActive = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastActive: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Delete user (soft delete by marking as deleted)
export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Archive user conversations
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const conversation of conversations) {
      await ctx.db.patch(conversation._id, {
        status: "archived",
        updatedAt: Date.now(),
      });
    }

    // We don't actually delete the user, just mark their email as deleted
    await ctx.db.patch(args.userId, {
      email: `deleted_${Date.now()}_${user.email}`,
      emailVerified: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
