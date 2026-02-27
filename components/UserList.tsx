"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OnlineDot } from "@/components/OnlineDot";

type UserResult = {
  clerkId: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
};

export function UserList({ myClerkId }: { myClerkId: string }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupError, setGroupError] = useState("");
  const router = useRouter();

  const users = useQuery("users:listUsers" as never, {
    search,
    excludeClerkId: myClerkId
  } as never) as UserResult[] | undefined;

  const createOrGet = useMutation("conversations:createOrGetConversation" as never);
  const createGroup = useMutation("conversations:createConversation" as never);
  const presenceRows =
    (useQuery("presence:listPresence" as never, {
      userIds: (users ?? []).map((u) => u.clerkId)
    } as never) ?? []) as Array<{ userId: string; online: boolean }>;
  const onlineMap = new Map(presenceRows.map((row) => [row.userId, row.online]));

  const startChat = async (otherClerkId: string) => {
    const id = (await createOrGet({
      memberIds: [myClerkId, otherClerkId]
    } as never)) as string;

    router.push(`/conversations/${id}`);
  };

  const toggleSelect = (clerkId: string) => {
    setSelected((prev) => (prev.includes(clerkId) ? prev.filter((id) => id !== clerkId) : [...prev, clerkId]));
  };

  const createGroupChat = async () => {
    if (selected.length < 2) {
      setGroupError("Select at least two users for a group.");
      return;
    }
    setGroupError("");
    const id = (await createGroup({
      memberIds: [myClerkId, ...selected],
      name: groupName.trim() || undefined
    } as never)) as string;
    setSelected([]);
    setGroupName("");
    router.push(`/conversations/${id}`);
  };

  const isLoading = users === undefined;
  const noResults = !isLoading && (users?.length ?? 0) === 0;

  return (
    <section className="mx-auto w-full max-w-2xl space-y-4 p-4">
      <h1 className="text-2xl font-semibold">Find people</h1>
      <Input
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or username"
        value={search}
      />

      <section className="space-y-2 rounded-lg border bg-card p-3">
        <h2 className="text-sm font-semibold">Create group chat (optional)</h2>
        <Input
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group name"
          value={groupName}
        />
        <p className="text-xs text-muted-foreground">Select at least two users below and create a group.</p>
        <Button onClick={() => void createGroupChat()} variant="secondary">
          Create group
        </Button>
        {groupError ? <p className="text-xs text-red-600">{groupError}</p> : null}
      </section>

      <div className="space-y-2">
        {isLoading ? (
          <>
            <div className="h-16 animate-pulse rounded-lg bg-muted" />
            <div className="h-16 animate-pulse rounded-lg bg-muted" />
            <div className="h-16 animate-pulse rounded-lg bg-muted" />
          </>
        ) : null}
        {noResults ? (
          <p className="text-sm text-muted-foreground">
            No users found{search ? ` for "${search}"` : ""}. Try a different search.
          </p>
        ) : null}
        {(users ?? []).map((user) => (
          <article className="flex items-center justify-between rounded-lg border bg-card p-3" key={user.clerkId}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar
                  name={user.name || user.username || "User"}
                  src={user.avatarUrl}
                />
                <OnlineDot
                  className="absolute -bottom-0.5 -right-0.5 border border-white"
                  online={onlineMap.get(user.clerkId)}
                />
              </div>
              <div>
                <p className="font-medium">{user.name || "Unnamed user"}</p>
                <p className="text-xs text-muted-foreground">@{user.username || user.clerkId}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs">
                <input
                  checked={selected.includes(user.clerkId)}
                  onChange={() => toggleSelect(user.clerkId)}
                  type="checkbox"
                />
                Group
              </label>
              <Button onClick={() => void startChat(user.clerkId)}>
                Message
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
