import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  userPreferences: defineTable({
    userId: v.string(),
    sidebarCollapsed: v.boolean(),
  }).index("by_user", ["userId"]),
});

