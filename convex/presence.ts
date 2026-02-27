import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const setOnline = mutation({
  args: {
    userId: v.string(),
    online: v.boolean()
  },
  handler: async (ctx, { userId, online }) => {
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const payload = {
      userId,
      online,
      lastSeenAt: Date.now()
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("presence", payload);
  }
});

export const listPresence = query({
  args: { userIds: v.array(v.string()) },
  handler: async (ctx, { userIds }) => {
    const rows = await ctx.db.query("presence").collect();
    return rows.filter((r) => userIds.includes(r.userId));
  }
});
