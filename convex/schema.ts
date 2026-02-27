import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number()
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_name", ["name"]),

  conversations: defineTable({
    isGroup: v.boolean(),
    members: v.array(v.string()),
    membersKey: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
    lastMessage: v.optional(
      v.object({
        text: v.string(),
        senderId: v.string(),
        createdAt: v.number()
      })
    ),
    lastReadAt: v.record(v.string(), v.number())
  })
    .index("by_membersKey", ["membersKey"])
    .index("by_members", ["members"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    text: v.string(),
    createdAt: v.number(),
    editedAt: v.optional(v.number()),
    deleted: v.optional(v.boolean()),
    reactions: v.optional(v.record(v.string(), v.array(v.string())))
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_conversationId_createdAt", ["conversationId", "createdAt"]),

  presence: defineTable({
    userId: v.string(),
    lastSeenAt: v.number(),
    online: v.boolean()
  }).index("by_userId", ["userId"]),

  typing: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    userName: v.string(),
    lastTypingAt: v.number()
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_conversationId_userId", ["conversationId", "userId"])
});
