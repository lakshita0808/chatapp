"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { ConvexReactClient } from "convex/react";
import { useMutation } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth, useUser } from "@clerk/nextjs";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

function SessionBootstrap() {
  const { user } = useUser();
  const upsertCurrentUser = useMutation("users:upsertCurrentUser" as never);

  useOnlineStatus(user?.id);

  useEffect(() => {
    if (!user) return;
    void upsertCurrentUser({
      clerkId: user.id,
      name: user.fullName ?? user.firstName ?? undefined,
      username: user.username ?? undefined,
      avatarUrl: user.imageUrl
    } as never);
  }, [upsertCurrentUser, user]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  const client = useMemo(() => {
    if (!convexUrl) {
      return null;
    }
    return new ConvexReactClient(convexUrl);
  }, [convexUrl]);

  if (!client) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center text-sm text-muted-foreground">
        Set <code className="mx-1 rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_CONVEX_URL</code>
        in <code className="mx-1 rounded bg-muted px-1 py-0.5">.env.local</code> to start the app.
      </div>
    );
  }

  return (
    <ConvexProviderWithClerk client={client} useAuth={useAuth}>
      <SessionBootstrap />
      {children}
    </ConvexProviderWithClerk>
  );
}
