import { ChevronDown } from "lucide-react";
import type { Conversation, Message } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";
import { WelcomeScreen } from "./WelcomeScreen";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

// Long histories render newest first: the latest messages paint straight away and older ones are
// filled in above them in small idle-time chunks (or at once when the reader scrolls up to them),
// keeping the reader's place.
const FIRST_RENDER = 30;
const OLDER_CHUNK = 30;

const hasIdleCallback = typeof window.requestIdleCallback === "function";
const whenIdle = (callback: () => void) =>
  hasIdleCallback ? window.requestIdleCallback(callback, { timeout: 300 }) : window.setTimeout(callback, 16);
const cancelIdle = (handle: number) =>
  hasIdleCallback ? window.cancelIdleCallback(handle) : window.clearTimeout(handle);

export function ChatMessages({
  conversation,
  onSend,
  onEditMessage,
  onRegenerate,
  onFeedback,
}: {
  conversation: Conversation | null;
  onSend: (text: string, attachments: Message["attachments"]) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onRegenerate: (messageId: string) => void;
  onFeedback: (messageId: string, kind: "up" | "down") => void;
}) {
  const { containerRef, nearBottom, onScroll, scrollToBottom } = useAutoScroll();
  const prevLength = useRef(0);

  const total = conversation?.messages.length ?? 0;
  const newest = Math.max(0, total - FIRST_RENDER);
  // Index of the oldest rendered message. Set when the history first arrives, then only moves up.
  const [start, setStart] = useState<number | null>(null);
  if (total > 0 && (start === null || start > newest)) setStart(newest);
  const from = start === null ? newest : Math.min(start, newest);

  // Distance from the bottom to restore after older messages are added above.
  const keepPlace = useRef<number | null>(null);
  const showOlder = useCallback(() => {
    const el = containerRef.current;
    if (!el || from === 0) return;
    keepPlace.current = el.scrollHeight - el.scrollTop;
    setStart(Math.max(0, from - OLDER_CHUNK));
  }, [containerRef, from]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (el && keepPlace.current !== null) el.scrollTop = el.scrollHeight - keepPlace.current;
    keepPlace.current = null;
  }, [containerRef, from]);

  useEffect(() => {
    if (from === 0) return;
    const handle = whenIdle(showOlder);
    return () => cancelIdle(handle);
  }, [from, showOlder]);

  const handleScroll = () => {
    onScroll();
    const el = containerRef.current;
    if (el && from > 0 && el.scrollTop < el.clientHeight) showOlder();
  };

  const lastAssistantId = useMemo(() => {
    if (!conversation) return null;
    return (
      [...conversation.messages]
        .reverse()
        .find((message) => message.role === "assistant")?.id ?? null
    );
  }, [conversation]);

  useLayoutEffect(() => {
    if (total > prevLength.current) {
      // Opening a conversation lands on its latest message; new messages after that glide in.
      if (prevLength.current === 0) scrollToBottom(false);
      else requestAnimationFrame(() => scrollToBottom(true));
    }
    prevLength.current = total;
  }, [total, scrollToBottom]);

  if (!conversation || conversation.messages.length === 0) {
    return <WelcomeScreen onSuggestion={(text) => onSend(text, [])} />;
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-3 py-2 [overflow-anchor:none]"
      >
        {conversation.messages.slice(from).map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isLast={message.id === lastAssistantId}
            onEdit={onEditMessage}
            onRegenerate={onRegenerate}
            onFeedback={onFeedback}
          />
        ))}
      </div>

      {!nearBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          aria-label="Scroll to bottom"
          className="absolute bottom-3 left-1/2 flex h-[34px] w-[34px] -translate-x-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md"
        >
          <ChevronDown size={17} />
        </button>
      )}
    </div>
  );
}
