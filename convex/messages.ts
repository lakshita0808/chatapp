import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.string(),
    text: v.string()
  },
  handler: async (ctx, { conversationId, senderId, text }) => {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error("Message text is required");
    }

    const conversation = await ctx.db.get(conversationId);
    if (!conversation || !conversation.members.includes(senderId)) {
      throw new Error("Conversation not found or access denied");
    }

    const createdAt = Date.now();
    const messageId = await ctx.db.insert("messages", {
      conversationId,
      senderId,
      text: trimmed,
      createdAt
    });

    await ctx.db.patch(conversationId, {
      lastMessage: {
        text: trimmed,
        senderId,
        createdAt
      }
    });

    return messageId;
  }
});

export const listByConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversationId_createdAt", (q) => q.eq("conversationId", conversationId))
      .collect();
  }
});

export const markRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string()
  },
  handler: async (ctx, { conversationId, userId }) => {
    const conversation = await ctx.db.get(conversationId);
    if (!conversation || !conversation.members.includes(userId)) return;

    await ctx.db.patch(conversationId, {
      lastReadAt: {
        ...conversation.lastReadAt,
        [userId]: Date.now()
      }
    });
  }
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string()
  },
  handler: async (ctx, { messageId, userId }) => {
    const message = await ctx.db.get(messageId);
    if (!message || message.senderId !== userId) {
      throw new Error("Cannot delete this message");
    }

    await ctx.db.patch(messageId, {
      deleted: true,
      text: ""
    });
  }
});
