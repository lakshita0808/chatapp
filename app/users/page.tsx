"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { DemoSeedButton } from "@/components/DemoSeedButton";
import { UserList } from "@/components/UserList";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
  const { user } = useUser();
  if (!user) return null;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between p-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Users</h1>
          <DemoSeedButton
            currentClerkId={user.id}
            currentName={user.fullName ?? user.firstName ?? undefined}
          />
        </div>
        <Link href="/">
          <Button variant="ghost">Back</Button>
        </Link>
      </div>
      <UserList myClerkId={user.id} />
    </main>
  );
}
