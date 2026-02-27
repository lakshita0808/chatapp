"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";

export function DemoSeedButton({
  currentClerkId,
  currentName
}: {
  currentClerkId: string;
  currentName?: string;
}) {
  const seedDemoData = useMutation("demo:seedDemoData" as never);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const onClick = async () => {
    setStatus("loading");
    try {
      await seedDemoData({
        currentClerkId,
        currentName
      } as never);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button disabled={status === "loading"} onClick={() => void onClick()} variant="secondary">
        {status === "loading" ? "Seeding..." : "Seed demo users"}
      </Button>
      {status === "done" ? <p className="text-xs text-muted-foreground">Demo data ready</p> : null}
      {status === "error" ? <p className="text-xs text-red-600">Failed to seed</p> : null}
    </div>
  );
}
