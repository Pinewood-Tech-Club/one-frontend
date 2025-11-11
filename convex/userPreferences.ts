import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's sidebar preference
export const getSidebarCollapsed = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const preference = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    return preference?.sidebarCollapsed ?? false;
  },
});

// Set user's sidebar preference
export const setSidebarCollapsed = mutation({
  args: { 
    userId: v.string(),
    collapsed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        sidebarCollapsed: args.collapsed,
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId: args.userId,
        sidebarCollapsed: args.collapsed,
      });
    }
  },
});

