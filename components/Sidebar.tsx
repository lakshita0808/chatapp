"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Avatar } from "@/components/ui/avatar";
import { OnlineDot } from "@/components/OnlineDot";
import { cn } from "@/lib/utils";

type ConversationRow = {
  _id: string;
  name: string;
  avatarUrl?: string;
  otherMemberId?: string;
  isGroup: boolean;
  memberCount: number;
  unreadCount: number;
  lastMessageText?: string;
};

export function Sidebar({
  currentUserId,
  activeConversationId
}: {
  currentUserId: string;
  activeConversationId?: string;
}) {
  const conversations =
    useQuery("conversations:listForUser" as never, {
      userId: currentUserId
    } as never) as ConversationRow[] | undefined;

  const { user } = useUser();
  const otherMemberIds = (conversations ?? [])
    .map((c) => c.otherMemberId)
    .filter((id): id is string => Boolean(id));

  const presenceRows =
    (useQuery("presence:listPresence" as never, {
      userIds: otherMemberIds
    } as never) ?? []) as Array<{ userId: string; online: boolean }>;

  const onlineMap = new Map(presenceRows.map((row) => [row.userId, row.online]));
  const isLoading = conversations === undefined;

  return (
    <aside className="flex h-full w-full max-w-sm flex-col border-r bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold">Tars</h2>
          <p className="text-xs text-muted-foreground">{user?.fullName || user?.username || "Signed in"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link className="text-sm text-primary" href="/users">
            Find people
          </Link>
          <UserButton />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            <div className="h-16 animate-pulse rounded-lg bg-muted" />
            <div className="h-16 animate-pulse rounded-lg bg-muted" />
            <div className="h-16 animate-pulse rounded-lg bg-muted" />
          </div>
        ) : null}

        {!isLoading && (conversations?.length ?? 0) === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            You have not started any conversations yet.
          </p>
        ) : null}

        {(conversations ?? []).map((conversation) => (
          <Link
            className={cn(
              "flex items-start gap-3 border-b px-4 py-3 transition hover:bg-muted/40",
              activeConversationId === conversation._id && "bg-muted"
            )}
            href={`/conversations/${conversation._id}`}
            key={conversation._id}
          >
            <div className="relative">
              <Avatar name={conversation.name} size={38} src={conversation.avatarUrl} />
              {!conversation.isGroup ? (
                <OnlineDot
                  className="absolute -bottom-0.5 -right-0.5 border border-white"
                  online={onlineMap.get(conversation.otherMemberId || "")}
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{conversation.name}</p>
                {conversation.unreadCount > 0 ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {conversation.unreadCount}
                  </span>
                ) : null}
              </div>
              {conversation.isGroup ? (
                <p className="truncate text-[11px] text-muted-foreground">{conversation.memberCount} members</p>
              ) : null}
              <p className="truncate text-xs text-muted-foreground">{conversation.lastMessageText || "No messages yet"}</p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
