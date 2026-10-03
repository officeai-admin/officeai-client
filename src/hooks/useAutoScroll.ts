import { useCallback, useRef, useState } from "react";

/**
 * Tracks whether the user is scrolled near the bottom of a container, so
 * new streamed content can auto-scroll without yanking the view away from
 * someone reading back up through history.
 */
export function useAutoScroll() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [nearBottom, setNearBottom] = useState(true);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setNearBottom(distance < 120);
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  return { containerRef, nearBottom, onScroll, scrollToBottom };
}
