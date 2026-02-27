"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useTyping } from "@/hooks/useTyping";
import { TYPING_WINDOW_MS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { MessageBubble, type ChatMessage } from "@/components/MessageBubble";
import { NewMessageInput } from "@/components/NewMessageInput";
import { TypingIndicator } from "@/components/TypingIndicator";

type UserLite = {
  clerkId: string;
  name?: string;
  username?: string;
};

export function ChatWindow({
  conversationId,
  myUserId
}: {
  conversationId: string;
  myUserId: string;
}) {
  const messages = useQuery("messages:listByConversation" as never, {
    conversationId
  } as never) as ChatMessage[] | undefined;

  const typingRows =
    (useQuery("reactions:listTyping" as never, {
      conversationId
    } as never) ?? []) as Array<{ userId: string; userName: string; lastTypingAt: number }>;

  const senderIds = [...new Set((messages ?? []).map((m) => m.senderId))];
  const users =
    (useQuery("users:getMany" as never, {
      clerkIds: senderIds
    } as never) ?? []) as UserLite[];

  const sendMessage = useMutation("messages:sendMessage" as never);
  const markRead = useMutation("messages:markRead" as never);
  const deleteMessage = useMutation("messages:deleteMessage" as never);
  const toggleReaction = useMutation("reactions:toggleReaction" as never);

  const [pending, setPending] = useState<ChatMessage[]>([]);
  const [sendError, setSendError] = useState("");
  const committedMessages = messages ?? [];
  const { containerRef, showJumpButton, scrollToBottom } = useAutoScroll(committedMessages.length + pending.length);
  const { triggerTyping, stopTyping } = useTyping(conversationId, myUserId);

  useEffect(() => {
    void markRead({ conversationId, userId: myUserId } as never);
  }, [conversationId, markRead, myUserId, committedMessages.length]);

  const mergedMessages = useMemo(() => {
    const ids = new Set(committedMessages.map((m) => m._id));
    return [...committedMessages, ...pending.filter((p) => !ids.has(p._id))].sort((a, b) => a.createdAt - b.createdAt);
  }, [committedMessages, pending]);

  const typingNames = useMemo(() => {
    const now = Date.now();
    return typingRows
      .filter((row) => row.userId !== myUserId && now - row.lastTypingAt < TYPING_WINDOW_MS)
      .map((row) => row.userName);
  }, [myUserId, typingRows]);

  const onSend = async (text: string) => {
    const optimistic: ChatMessage = {
      _id: `local-${Date.now()}`,
      text,
      senderId: myUserId,
      createdAt: Date.now(),
      pending: true,
      failed: false
    };

    setPending((curr) => [...curr, optimistic]);
    setSendError("");

    try {
      await sendMessage({ conversationId, senderId: myUserId, text } as never);
      setPending((curr) => curr.filter((m) => m._id !== optimistic._id));
      stopTyping();
    } catch {
      setPending((curr) => curr.map((m) => (m._id === optimistic._id ? { ...m, pending: false, failed: true } : m)));
      setSendError("Message failed to send. Please retry.");
    }
  };

  const retrySend = async (localId: string) => {
    const failedMessage = pending.find((p) => p._id === localId);
    if (!failedMessage) return;

    setPending((curr) => curr.map((m) => (m._id === localId ? { ...m, pending: true, failed: false } : m)));

    try {
      await sendMessage({
        conversationId,
        senderId: myUserId,
        text: failedMessage.text
      } as never);
      setPending((curr) => curr.filter((m) => m._id !== localId));
      setSendError("");
    } catch {
      setPending((curr) => curr.map((m) => (m._id === localId ? { ...m, pending: false, failed: true } : m)));
      setSendError("Retry failed. Check connection and try again.");
    }
  };

  const onDelete = async (messageId: string) => {
    try {
      await deleteMessage({ messageId, userId: myUserId } as never);
    } catch {
      setSendError("Unable to delete message.");
    }
  };

  const onToggleReaction = async (messageId: string, emoji: string) => {
    try {
      await toggleReaction({ messageId, userId: myUserId, emoji } as never);
    } catch {
      setSendError("Unable to update reaction.");
    }
  };

  const senderMap = new Map(users.map((u) => [u.clerkId, u.name || u.username || "User"]));
  const isLoading = messages === undefined;

  return (
    <div className="relative flex h-[calc(100vh-96px)] flex-col rounded-xl border bg-card">
      <div className="flex-1 space-y-3 overflow-y-auto p-4" ref={containerRef}>
        {isLoading ? (
          <>
            <div className="h-16 animate-pulse rounded-xl bg-muted" />
            <div className="ml-auto h-16 w-[75%] animate-pulse rounded-xl bg-muted" />
            <div className="h-16 w-[70%] animate-pulse rounded-xl bg-muted" />
          </>
        ) : null}
        {sendError ? <p className="rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">{sendError}</p> : null}
        {!isLoading && mergedMessages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No messages yet. Say hi.</p>
        ) : null}

        {mergedMessages.map((message) => (
          <MessageBubble
            isMine={message.senderId === myUserId}
            key={message._id}
            message={message}
            currentUserId={myUserId}
            onDelete={onDelete}
            onRetry={retrySend}
            onToggleReaction={onToggleReaction}
            senderLabel={senderMap.get(message.senderId) ?? "User"}
          />
        ))}
      </div>

      <TypingIndicator names={typingNames} />
      <NewMessageInput onSend={onSend} onTyping={triggerTyping} />

      {showJumpButton ? (
        <Button className="absolute bottom-20 right-4 shadow" onClick={scrollToBottom} variant="secondary">
          New Message 
        </Button>
      ) : null}
    </div>
  );
}
