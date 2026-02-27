import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function membersKey(memberIds: string[]) {
  return [...memberIds].sort().join("|");
}

export const createOrGetConversation = mutation({
  args: { memberIds: v.array(v.string()) },
  handler: async (ctx, { memberIds }) => {
    const uniqueMembers = [...new Set(memberIds)].sort();
    if (uniqueMembers.length !== 2) {
      throw new Error("Direct message conversations require exactly two members");
    }

    const key = membersKey(uniqueMembers);
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_membersKey", (q) => q.eq("membersKey", key))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      isGroup: false,
      members: uniqueMembers,
      membersKey: key,
      createdAt: Date.now(),
      lastReadAt: Object.fromEntries(uniqueMembers.map((id) => [id, 0]))
    });
  }
});

export const createConversation = mutation({
  args: {
    memberIds: v.array(v.string()),
    name: v.optional(v.string())
  },
  handler: async (ctx, { memberIds, name }) => {
    const uniqueMembers = [...new Set(memberIds)].sort();
    if (uniqueMembers.length < 2) {
      throw new Error("Conversation must include at least two members");
    }

    return await ctx.db.insert("conversations", {
      isGroup: uniqueMembers.length > 2,
      members: uniqueMembers,
      membersKey: membersKey(uniqueMembers),
      name,
      createdAt: Date.now(),
      lastReadAt: Object.fromEntries(uniqueMembers.map((id) => [id, 0]))
    });
  }
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    return await ctx.db.get(conversationId);
  }
});

export const getConversationDetails = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string()
  },
  handler: async (ctx, { conversationId, userId }) => {
    const conversation = await ctx.db.get(conversationId);
    if (!conversation || !conversation.members.includes(userId)) {
      return null;
    }

    const users = await Promise.all(
      conversation.members.map(async (memberId) => {
        return await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", memberId))
          .unique();
      })
    );

    const byId = new Map(users.filter((u) => u !== null).map((u) => [u.clerkId, u]));
    const otherMemberId = conversation.members.find((m) => m !== userId);
    const otherMember = otherMemberId ? byId.get(otherMemberId) : null;

    const presence = otherMemberId
      ? await ctx.db
          .query("presence")
          .withIndex("by_userId", (q) => q.eq("userId", otherMemberId))
          .unique()
      : null;

    const title = conversation.isGroup
      ? conversation.name || `Group (${conversation.members.length})`
      : otherMember?.name || otherMember?.username || "Direct chat";

    const subtitle = conversation.isGroup
      ? `${conversation.members.length} members`
      : presence?.online
        ? "Online"
        : presence
          ? "Offline"
          : "Unknown";

    return {
      ...conversation,
      title,
      subtitle
    };
  }
});

export const listForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const all = await ctx.db.query("conversations").collect();
    const mine = all.filter((c) => c.members.includes(userId));

    const userDocs = await ctx.db.query("users").collect();
    const userMap = new Map(userDocs.map((u) => [u.clerkId, u]));

    const rows = await Promise.all(
      mine.map(async (conversation) => {
        const lastReadAt = conversation.lastReadAt[userId] || 0;
        const unread = await ctx.db
          .query("messages")
          .withIndex("by_conversationId_createdAt", (q) =>
            q.eq("conversationId", conversation._id).gt("createdAt", lastReadAt)
          )
          .collect();

        const otherMembers = conversation.members.filter((id) => id !== userId);
        const otherUser = otherMembers[0] ? userMap.get(otherMembers[0]) : null;

        return {
          _id: conversation._id,
          name: conversation.isGroup
            ? conversation.name || `Group (${conversation.members.length})`
            : otherUser?.name || otherUser?.username || "Conversation",
          avatarUrl: otherUser?.avatarUrl,
          otherMemberId: otherUser?.clerkId,
          isGroup: conversation.isGroup,
          memberCount: conversation.members.length,
          unreadCount: unread.filter((m) => m.senderId !== userId).length,
          lastMessageText: conversation.lastMessage?.text,
          lastMessageAt: conversation.lastMessage?.createdAt || conversation.createdAt
        };
      })
    );

    return rows.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  }
});
