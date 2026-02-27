import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertCurrentUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        username: args.username,
        avatarUrl: args.avatarUrl
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      ...args,
      createdAt: Date.now()
    });
  }
});

export const listUsers = query({
  args: {
    search: v.string(),
    excludeClerkId: v.string()
  },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query("users").collect();
    const term = args.search.toLowerCase().trim();

    return allUsers
      .filter((u) => u.clerkId !== args.excludeClerkId)
      .filter((u) => {
        if (!term) return true;
        return (
          u.name?.toLowerCase().includes(term) ||
          u.username?.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
  }
});

export const getMany = query({
  args: { clerkIds: v.array(v.string()) },
  handler: async (ctx, { clerkIds }) => {
    const uniqueIds = [...new Set(clerkIds)];
    const users = await Promise.all(
      uniqueIds.map(async (clerkId) => {
        return await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
          .unique();
      })
    );

    return users.filter((u) => u !== null);
  }
});
