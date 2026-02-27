"use client";

import { useEffect, useRef, useState } from "react";
import { AUTO_SCROLL_THRESHOLD_PX } from "@/lib/constants";

export function useAutoScroll(itemCount: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showJumpButton, setShowJumpButton] = useState(false);

  const scrollToBottom = () => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
    setShowJumpButton(false);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - AUTO_SCROLL_THRESHOLD_PX;
      setShowJumpButton(!nearBottom);
    };

    onScroll();
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - AUTO_SCROLL_THRESHOLD_PX;
    if (nearBottom) {
      el.scrollTop = el.scrollHeight;
      setShowJumpButton(false);
    }
  }, [itemCount]);

  return { containerRef, showJumpButton, scrollToBottom };
}
