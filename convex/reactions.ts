import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { emojiToReactionKey } from "../lib/reactions";

function keyToEmoji(key: string) {
  if (!key.startsWith("u_")) return key;
  const parts = key.slice(2).split("_").filter(Boolean);
  const chars = parts.map((part) => String.fromCodePoint(parseInt(part, 16)));
  return chars.join("");
}

function normalizeStoredReactions(reactions: Record<string, string[]>) {
  const normalized: Record<string, string[]> = {};
  for (const [key, users] of Object.entries(reactions)) {
    const safeKey = key.startsWith("u_") ? key : emojiToReactionKey(keyToEmoji(key));
    normalized[safeKey] = users;
  }
  return normalized;
}

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string()
  },
  handler: async (ctx, { conversationId, userId }) => {
    const profile = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();

    const existing = await ctx.db
      .query("typing")
      .withIndex("by_conversationId_userId", (q) =>
        q.eq("conversationId", conversationId).eq("userId", userId)
      )
      .unique();

    const payload = {
      conversationId,
      userId,
      userName: profile?.name || profile?.username || "User",
      lastTypingAt: Date.now()
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("typing", payload);
  }
});

export const listTyping = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    return await ctx.db
      .query("typing")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", conversationId))
      .collect();
  }
});

export const clearTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string()
  },
  handler: async (ctx, { conversationId, userId }) => {
    const existing = await ctx.db
      .query("typing")
      .withIndex("by_conversationId_userId", (q) =>
        q.eq("conversationId", conversationId).eq("userId", userId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  }
});

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(),
    emoji: v.string()
  },
  handler: async (ctx, { messageId, userId, emoji }) => {
    const message = await ctx.db.get(messageId);
    if (!message) throw new Error("Message not found");

    const current = normalizeStoredReactions(message.reactions || {});
    const reactionKey = emojiToReactionKey(emoji);
    const users = new Set(current[reactionKey] || []);

    if (users.has(userId)) {
      users.delete(userId);
    } else {
      users.add(userId);
    }

    await ctx.db.patch(messageId, {
      reactions: {
        ...current,
        [reactionKey]: [...users]
      }
    });
  }
});
