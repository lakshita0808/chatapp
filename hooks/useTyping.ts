"use client";

import { useMemo } from "react";
import { useMutation } from "convex/react";

export function useTyping(conversationId: string, userId: string) {
  const setTyping = useMutation("reactions:setTyping" as never);
  const clearTyping = useMutation("reactions:clearTyping" as never);

  return useMemo(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const triggerTyping = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        void setTyping({ conversationId, userId } as never);
      }, 250);
    };

    const stopTyping = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      void clearTyping({ conversationId, userId } as never);
    };

    return { triggerTyping, stopTyping };
  }, [clearTyping, conversationId, setTyping, userId]);
}
