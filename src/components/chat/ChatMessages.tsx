import { ChevronDown } from "lucide-react";
import type { Conversation, Message } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";
import { WelcomeScreen } from "./WelcomeScreen";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useEffect, useMemo, useRef } from "react";

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

  const lastAssistantId = useMemo(() => {
    if (!conversation) return null;
    return (
      [...conversation.messages]
        .reverse()
        .find((message) => message.role === "assistant")?.id ?? null
    );
  }, [conversation]);

  useEffect(() => {
    const length = conversation?.messages.length ?? 0;
    if (length > prevLength.current) {
      requestAnimationFrame(() => scrollToBottom(true));
    }
    prevLength.current = length;
  }, [conversation?.messages.length, scrollToBottom]);

  if (!conversation || conversation.messages.length === 0) {
    return <WelcomeScreen onSuggestion={(text) => onSend(text, [])} />;
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={containerRef}
        onScroll={onScroll}
        className="h-full overflow-y-auto px-3 py-2"
      >
        {conversation.messages.map((message) => (
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
