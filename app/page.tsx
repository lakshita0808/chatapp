"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Sidebar } from "@/components/Sidebar";

export default function HomePage() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-[360px_1fr]">
      <Sidebar currentUserId={user.id} />
      <section className="hidden items-center justify-center p-8 md:flex">
        <div className="max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Welcome to Tars Chat</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick a conversation from the sidebar or discover users to start chatting.
          </p>
          <Link className="mt-4 inline-block text-primary" href="/users">
            Go to user discovery
          </Link>
        </div>
      </section>
    </main>
  );
}
