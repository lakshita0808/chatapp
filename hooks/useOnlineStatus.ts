"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";

export function useOnlineStatus(userId?: string) {
  const setOnline = useMutation("presence:setOnline" as never);

  useEffect(() => {
    if (!userId) return;

    void setOnline({ userId, online: true } as never);

    const handleHidden = () => {
      const online = document.visibilityState === "visible";
      void setOnline({ userId, online } as never);
    };

    const handleUnload = () => {
      void setOnline({ userId, online: false } as never);
    };

    document.addEventListener("visibilitychange", handleHidden);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleHidden);
      window.removeEventListener("beforeunload", handleUnload);
      void setOnline({ userId, online: false } as never);
    };
  }, [setOnline, userId]);
}
