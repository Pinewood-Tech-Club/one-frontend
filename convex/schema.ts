import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  userPreferences: defineTable({
    userId: v.string(),
    sidebarCollapsed: v.boolean(),
  }).index("by_user", ["userId"]),

  // Schoology cache tables - store full JSON objects for flexibility
  schoologyCourses: defineTable({
    userId: v.string(),
    courseId: v.string(), // Schoology section ID
    data: v.any(), // Full section object from Schoology API
    lastUpdated: v.number(), // timestamp
  })
    .index("by_user", ["userId"])
    .index("by_user_and_course", ["userId", "courseId"]),

  schoologyAssignments: defineTable({
    userId: v.string(),
    courseId: v.string(), // Which course this assignment belongs to
    assignmentId: v.string(), // Schoology assignment ID
    data: v.any(), // Full assignment object from Schoology API
    lastUpdated: v.number(), // timestamp
  })
    .index("by_user", ["userId"])
    .index("by_user_and_course", ["userId", "courseId"])
    .index("by_user_and_assignment", ["userId", "assignmentId"]),
});

