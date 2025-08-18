import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Send verification code
export const sendVerificationCode = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Implement sending verification code
    console.log("Sending verification code to:", args.email);
    return { success: true };
  },
});

// Verify code
export const verifyCode = mutation({
  args: {
    email: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Implement code verification
    console.log("Verifying code for:", args.email);
    return { success: true };
  },
});

// Logout
export const logout = mutation({
  args: {},
  handler: async (ctx) => {
    // TODO: Implement logout
    console.log("Logging out user");
    return { success: true };
  },
});