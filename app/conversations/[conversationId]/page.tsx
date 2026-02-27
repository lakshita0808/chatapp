"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { ChatWindow } from "@/components/ChatWindow";
import { OnlineDot } from "@/components/OnlineDot";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId;
  const { user } = useUser();

  const conversation = useQuery("conversations:getConversationDetails" as never, {
    conversationId,
    userId: user?.id ?? ""
  } as never) as
    | {
        title: string;
        subtitle: string;
        isGroup: boolean;
      }
    | null
    | undefined;

  if (!user) return null;

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-[360px_1fr]">
      <div className="hidden md:block">
        <Sidebar activeConversationId={conversationId} currentUserId={user.id} />
      </div>

      <section className="p-2 md:p-4">
        <header className="mb-2 flex items-center justify-between rounded-xl border bg-card px-3 py-2">
          <div>
            <p className="text-xs text-muted-foreground">Conversation</p>
            <h1 className="text-lg font-semibold">{conversation?.title || "Direct chat"}</h1>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              {conversation?.isGroup ? null : <OnlineDot online={conversation?.subtitle === "Online"} />}
              {conversation?.subtitle || "Loading..."}
            </p>
          </div>
          <Link className="md:hidden" href="/">
            <Button variant="ghost">Back</Button>
          </Link>
        </header>

        <ChatWindow conversationId={conversationId} myUserId={user.id} />
      </section>
    </main>
  );
}
