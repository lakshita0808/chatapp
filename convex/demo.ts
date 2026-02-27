import { mutation } from "./_generated/server";
import { v } from "convex/values";

type DemoUserSeed = {
  clerkId: string;
  name: string;
  username: string;
};

const DEMO_USERS: DemoUserSeed[] = [
  {
    clerkId: "demo_alex",
    name: "Alex Tars",
    username: "alex"
  },
  {
    clerkId: "demo_ria",
    name: "Ria Product",
    username: "ria"
  },
  {
    clerkId: "demo_noah",
    name: "Noah Design",
    username: "noah"
  }
];

function dmKey(a: string, b: string) {
  return [a, b].sort().join("|");
}

export const seedDemoData = mutation({
  args: {
    currentClerkId: v.string(),
    currentName: v.optional(v.string())
  },
  handler: async (ctx, { currentClerkId, currentName }) => {
    const now = Date.now();

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", currentClerkId))
      .unique();

    if (!me) {
      await ctx.db.insert("users", {
        clerkId: currentClerkId,
        name: currentName || "You",
        createdAt: now
      });
    }

    for (const demo of DEMO_USERS) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", demo.clerkId))
        .unique();

      if (!existing) {
        await ctx.db.insert("users", {
          clerkId: demo.clerkId,
          name: demo.name,
          username: demo.username,
          createdAt: now
        });
      } else if (existing.avatarUrl === "https://images.clerk.dev/static/default-avatar.jpg") {
        await ctx.db.patch(existing._id, {
          avatarUrl: undefined
        });
      }
    }

    const alexId = DEMO_USERS[0].clerkId;
    const key = dmKey(currentClerkId, alexId);

    let conversation = await ctx.db
      .query("conversations")
      .withIndex("by_membersKey", (q) => q.eq("membersKey", key))
      .unique();

    if (!conversation) {
      const conversationId = await ctx.db.insert("conversations", {
        isGroup: false,
        members: [currentClerkId, alexId].sort(),
        membersKey: key,
        createdAt: now,
        lastReadAt: {
          [currentClerkId]: 0,
          [alexId]: 0
        }
      });

      conversation = await ctx.db.get(conversationId);
    }

    if (!conversation) {
      throw new Error("Failed to initialize demo conversation");
    }

    const existingMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
      .collect();

    if (existingMessages.length === 0) {
      const demoMessages = [
        {
          senderId: alexId,
          text: "Hey, this is seeded demo data so you can showcase the app.",
          createdAt: now - 1000 * 60 * 20
        },
        {
          senderId: currentClerkId,
          text: "Perfect, I'll use this for the internship demo.",
          createdAt: now - 1000 * 60 * 17
        },
        {
          senderId: alexId,
          text: "Show unread badges, timestamps, and realtime updates.",
          createdAt: now - 1000 * 60 * 14
        }
      ];

      for (const msg of demoMessages) {
        await ctx.db.insert("messages", {
          conversationId: conversation._id,
          senderId: msg.senderId,
          text: msg.text,
          createdAt: msg.createdAt
        });
      }

      const last = demoMessages[demoMessages.length - 1];
      await ctx.db.patch(conversation._id, {
        lastMessage: {
          text: last.text,
          senderId: last.senderId,
          createdAt: last.createdAt
        }
      });
    }

    return {
      seededUsers: DEMO_USERS.length,
      conversationId: conversation._id
    };
  }
});
